#!/usr/bin/env python3
"""Map the audio: constant-tempo beat grid, bars, 808 accents, dropouts.

Writes src/data/beats.json — the single source of truth for musical time.
Everything downstream (scenes, sync proof, QA) reads from it.

Method
  * Percussive onset strength in the TIME domain: HPSS percussive part,
    high-passed at 2 kHz (hats / snare / clap transients), 1 ms RMS,
    half-wave-rectified derivative of log energy. We deliberately avoid a
    centred STFT onset envelope here: its 2048-sample window reports
    transients ~20–30 ms early/late depending on attack shape (logged in
    docs/BUILD_LOG.md).
  * Grid search tempo 110–160 BPM in 0.01 steps × phase in 1 ms steps,
    maximising mean onset strength on the 8th-note grid.
  * Quarter-note phase = whichever 8th phase carries more kick/808 (30–200 Hz) onset energy
    (full-band picks the off-beats: the hats are louder than the kick).
  * Sub-bass (30–100 Hz) RMS envelope → dropouts (< 15 % of p98 for ≥ 300 ms),
    slams (first beat after a major dropout where the 808 returns),
    bars (phase-locked to slam A), 808 accent verification.
"""
import json
import sys
from pathlib import Path

import librosa
import numpy as np
from scipy.signal import butter, sosfiltfilt

ROOT = Path(__file__).resolve().parents[1]
WAV = ROOT / "public/audio/straight-up.wav"
OUT = ROOT / "src/data/beats.json"
SR = 48000
MS = SR // 1000  # samples per ms

MAJOR_DROPOUT_S = 0.6  # gaps ≥ this (after the groove starts) are "dropouts"; shorter = 808 rests


def log(*a):
    print(*a, file=sys.stderr)


def band(y, lo, hi):
    if hi is None:
        sos = butter(4, lo, btype="high", fs=SR, output="sos")
    else:
        sos = butter(4, [lo, hi], btype="band", fs=SR, output="sos")
    return sosfiltfilt(sos, y)


def rms_ms(x, win_ms):
    w = win_ms * MS
    return np.sqrt(np.convolve(x**2, np.ones(w) / w, mode="same")[::MS])


def onset_curve(e):
    le = np.log(e**2 + 1e-12)
    d = np.maximum(np.diff(le, prepend=le[0]), 0)
    return d / (d.max() + 1e-12)


def grid_score(d, period_ms, phases):
    n = len(d)
    k = np.arange(0, int((n - 1 - phases.max()) / period_ms))
    idx = np.round(phases[:, None] + k[None, :] * period_ms).astype(int)
    return d[idx].mean(1)


def main():
    y, _ = librosa.load(WAV, sr=SR, mono=True)
    dur = len(y) / SR
    log(f"duration {dur:.4f}s")

    _, y_perc = librosa.effects.hpss(y)
    perc_hi = onset_curve(rms_ms(band(y_perc, 2000, None), 1))
    low_band = onset_curve(rms_ms(band(y, 30, 200), 5))  # kick / 808: decides the quarter phase

    # ---- tempo × phase grid search (8th-note grid) --------------------------
    best = (-1.0, 0.0, 0.0)
    for bpm in np.round(np.arange(110.0, 160.0 + 1e-9, 0.01), 2):
        p8 = 60000.0 / bpm / 2
        phases = np.arange(0, int(p8), 1.0)
        s = grid_score(perc_hi, p8, phases)
        i = int(s.argmax())
        if s[i] > best[0]:
            best = (float(s[i]), float(bpm), float(phases[i]))
    score8, bpm, ph8 = best
    p8 = 60000.0 / bpm / 2
    beat_ms = 2 * p8
    cands = [ph8, ph8 + p8]
    qs = [float(grid_score(low_band, beat_ms, np.array([c]))[0]) for c in cands]
    q0 = cands[int(np.argmax(qs))] % beat_ms
    beat = beat_ms / 1000.0
    beat0 = q0 / 1000.0
    log(f"grid: {bpm:.2f} BPM, beat0 {beat0:.4f}s (8th score {score8:.3f}, quarter cands {qs})")

    nbeats = int((dur + 0.005 - beat0) / beat) + 1
    beats = [beat0 + beat * k for k in range(nbeats)]

    # ---- sub-bass envelope ---------------------------------------------------
    sub = rms_ms(band(y, 30, 100), 10)
    p98 = np.percentile(sub, 98)
    low = sub < 0.15 * p98
    gaps = []
    i = 0
    while i < len(low):
        if low[i]:
            j = i
            while j < len(low) and low[j]:
                j += 1
            if j - i >= 300:
                gaps.append((i / 1000.0, j / 1000.0))
            i = j
        else:
            i += 1

    def beat_index(t):
        return int(round((t - beat0) / beat))

    def sub_ratio(t):
        """sub-bass level shortly after t over level shortly before t."""
        a = int(t * 1000)
        pre = sub[max(a - 60, 0):max(a - 35, 1)].mean()
        post = sub[a + 20:a + 80].mean()
        return float(post / p98), float(pre / p98)

    intro = [g for g in gaps if g[0] < 0.05]
    groove_from = intro[0][1] if intro else 0.0
    majors = [g for g in gaps if g[0] >= 0.05 and g[1] - g[0] >= MAJOR_DROPOUT_S]
    rests = [g for g in gaps if g[0] >= 0.05 and g[1] - g[0] < MAJOR_DROPOUT_S]

    # slam = first beat at/after the dropout end where the 808 is back (post ≥ 0.6·p98)
    slams = []
    for a, b in majors:
        k = beat_index(b - beat / 2)
        while k < nbeats:
            post, _ = sub_ratio(beats[k])
            if beats[k] >= b - 0.06 and post >= 0.6:
                slams.append(beats[k])
                break
            k += 1

    # near-silence inside dropout A: broadband below 12 % of max for ≥ 60 ms
    bb = rms_ms(y, 10)
    bbn = bb / bb.max()
    silences = []
    for a, b in majors:
        seg = bbn[int(a * 1000):int(b * 1000)]
        q = seg < 0.12
        i = 0
        while i < len(q):
            if q[i]:
                j = i
                while j < len(q) and q[j]:
                    j += 1
                if j - i >= 60:
                    silences.append([a + i / 1000.0, a + j / 1000.0])
                i = j
            else:
                i += 1

    # bars phase-locked to slam A
    slam_a = slams[0]
    kA = beat_index(slam_a)
    bar_beats = [k for k in range(kA % 4, nbeats, 4)]
    bars = [beats[k] for k in bar_beats]
    groove_k = min(k for k in bar_beats if beats[k] >= groove_from - beat / 2)

    # 808 accents: beat 1 of bar 1 and beat 2 of bar 2 of every 2-bar loop from slam A
    acc_k = []
    k = kA
    while k < nbeats:
        acc_k.append(k)
        if k + 5 < nbeats:
            acc_k.append(k + 5)
        k += 8
    acc_check = []
    for k in acc_k:
        post, pre = sub_ratio(beats[k])
        acc_check.append({"beat": k, "t": round(beats[k], 6), "subPost": round(post, 2), "subPre": round(pre, 2),
                          "confirmed": bool(post >= 0.8)})

    def fr(t, fps):
        return int(round(t * fps))

    data = {
        "source": "public/audio/straight-up.wav",
        "method": "time-domain percussive onset (>2 kHz), grid search 110-160 BPM/0.01, 1 ms phase",
        "duration": round(dur, 6),
        "bpm": round(bpm, 2),
        "beatPeriod": round(beat, 6),
        "eighth": round(beat / 2, 6),
        "sixteenth": round(beat / 4, 6),
        "barPeriod": round(beat * 4, 6),
        "beat0": round(beat0, 6),
        "grooveStart": round(beats[groove_k], 6),
        "grooveBeat": groove_k,
        "slams": [round(s, 6) for s in slams],
        "slamBeats": [beat_index(s) for s in slams],
        "beats": [round(b, 6) for b in beats],
        "bars": [round(b, 6) for b in bars],
        "barBeats": bar_beats,
        "accents808": [round(beats[k], 6) for k in acc_k],
        "accentBeats": acc_k,
        "accents808Check": acc_check,
        "dropouts": [{"start": round(a, 3), "end": round(b, 3)} for a, b in majors],
        "nearSilence": [[round(a, 3), round(b, 3)] for a, b in silences],
        "subRests": [[round(a, 3), round(b, 3)] for a, b in rests],
        "intro808Free": [round(intro[0][0], 3), round(intro[0][1], 3)] if intro else None,
    }
    data["frames"] = {
        str(fps): {
            "beats": [fr(b, fps) for b in beats],
            "bars": [fr(b, fps) for b in bars],
            "accents808": [fr(beats[k], fps) for k in acc_k],
            "slams": [fr(s, fps) for s in slams],
            "dropouts": [[fr(a, fps), fr(b, fps)] for a, b in majors],
        }
        for fps in (30, 60)
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, indent=2) + "\n")

    log(json.dumps({k: data[k] for k in ("bpm", "beat0", "grooveStart", "slams", "bars", "accents808",
                                          "dropouts", "nearSilence", "subRests", "intro808Free")}, indent=1))
    log("accent check:", [(a["t"], a["subPost"], a["confirmed"]) for a in acc_check])

    # ---- compare with the brief's measurements (1 frame @ 60 fps tolerance) --
    exp = {
        "bars": [2.865, 4.604, 6.343, 8.082, 9.821, 11.560, 13.299, 15.039, 16.778],
        "accents": [2.865, 5.039, 6.343, 8.517, 9.821, 11.995, 13.299, 15.473, 16.778],
        "beats": [0.256 + 0.434783 * k for k in range(40)],
    }
    ours = {"bars": data["bars"], "accents": data["accents808"], "beats": data["beats"]}
    for name in exp:
        diffs = [fr(min(ours[name], key=lambda x: abs(x - e)), 60) - fr(e, 60) for e in exp[name]]
        log(f"{name}: ours − brief @60fps: min {min(diffs)} max {max(diffs)} frames")


if __name__ == "__main__":
    main()

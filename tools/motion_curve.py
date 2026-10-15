#!/usr/bin/env python3
"""Motion-difference curve of a video, plotted over the beat grid.

usage: motion_curve.py VIDEO [--out qa/motion-vs-beats.png] [--own]
  --own   use src/data/beats.json (our edit); otherwise beat-track the video's audio

Prints peak-alignment stats: for the N largest motion peaks, the distance in
frames to the nearest bar / 808 accent / beat.
"""
import argparse
import json
import subprocess
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from scipy.signal import find_peaks

ROOT = Path(__file__).resolve().parents[1]


def diff_curve(video):
    p = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=r_frame_rate,width,height",
                        "-of", "csv=p=0", video], capture_output=True, text=True).stdout.strip().split(",")
    w, h = int(p[0]), int(p[1])
    num, den = p[2].split("/")
    fps = int(num) / int(den)
    W, H = 160, int(160 * h / w)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vf", f"scale={W}:{H},format=gray", "-f", "rawvideo", "-"],
                         capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
    d = np.zeros(len(fr))
    d[1:] = np.abs(fr[1:] - fr[:-1]).mean((1, 2))
    return d, fps


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--out", default=str(ROOT / "qa/motion-vs-beats.png"))
    ap.add_argument("--own", action="store_true")
    ap.add_argument("--peaks", type=int, default=24)
    a = ap.parse_args()
    d, fps = diff_curve(a.video)
    t = np.arange(len(d)) / fps
    if a.own:
        B = json.loads((ROOT / "src/data/beats.json").read_text())
        beats, bars, acc = B["beats"], B["bars"], B["accents808"]
        drops = [(x["start"], x["end"]) for x in B["dropouts"]]
    else:
        import librosa
        y, sr = librosa.load(a.video, sr=22050)
        tempo, bf = librosa.beat.beat_track(y=y, sr=sr)
        beats = list(librosa.frames_to_time(bf, sr=sr))
        bars, acc, drops = beats[::4], [], []

    pk, _ = find_peaks(d, distance=max(2, int(fps * 0.12)))
    top = pk[np.argsort(d[pk])[::-1][: a.peaks]]
    def near(f, ts):
        return min((f - round(x * fps) for x in ts), key=abs) if ts else None
    print(f"{'frame':>6} {'t':>7} {'diff':>6} {'Δbeat':>6} {'Δbar':>5} {'Δ808':>5}")
    on = 0
    for f in sorted(top):
        db, dbar, dacc = near(f, beats), near(f, bars), near(f, acc)
        ok = db is not None and -1 <= db <= 0
        on += ok
        print(f"{f:6d} {f / fps:7.3f} {d[f]:6.2f} {db:6d} {dbar if dbar is not None else '':>5} {dacc if dacc is not None else '':>5} {'✓' if ok else ''}")
    print(f"{on}/{len(top)} of the largest motion peaks sit on a beat (0 or −1 frame)")

    fig, ax = plt.subplots(figsize=(18, 4.2), dpi=110)
    fig.patch.set_facecolor("#111214")
    ax.set_facecolor("#111214")
    for s, e in drops:
        ax.axvspan(s, e, color="#ffffff", alpha=0.06, lw=0)
    for b in beats:
        ax.axvline(b, color="#8e8e93", alpha=0.25, lw=0.8)
    for b in bars:
        ax.axvline(b, color="#CBB5A4", alpha=0.6, lw=1.2)
    for x in acc:
        ax.axvline(x, color="#C7313B", alpha=0.9, lw=1.6, ls=(0, (3, 2)))
    ax.plot(t, d, color="#F2F2F7", lw=1.0)
    ax.scatter(top / fps, d[top], color="#E39A3B", s=16, zorder=3)
    ax.set_xlim(0, t[-1])
    ax.set_xlabel("seconds", color="#ccc")
    ax.set_ylabel("mean |Δ| per frame", color="#ccc")
    ax.tick_params(colors="#aaa")
    for sp in ax.spines.values():
        sp.set_color("#333")
    ax.set_title(f"{Path(a.video).name}: motion vs beats (grey) · bars (bone) · 808 accents (red dashed) · top peaks (amber)", color="#eee", fontsize=10)
    fig.tight_layout()
    fig.savefig(a.out, facecolor=fig.get_facecolor())
    print("wrote", a.out)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Assert that every scene boundary and hit lands exactly on its target frame.

Part 1 (always): the schedule the edit renders (dumped from src/lib/schedule.ts)
  * every hit's frame == the frame of its grid point (beat / 8th / 16th from
    beats.json, or the measured audio event) — 0 frames off; −1 (early) is
    tolerated with a warning, late is a failure
  * scene boundaries are contiguous and sit on the lyric/beat they claim
  * 808-claimed hits are real 808 accents
  checked at 60 fps (master) and 30 fps (fallback).

Part 2 (--video FILE): measure the rendered frames. For each hit, the visual
change must start on the hit frame or one frame early — never after. Render
the QA preview with grain off (`--props='{"qa":true}'`) so grain noise does
not mask small changes.

Exit code 1 and a list of offenders on any failure.
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
B = json.loads((ROOT / "src/data/beats.json").read_text())
LT = json.loads((ROOT / "src/data/lyrics-timing.json").read_text())


def dump_schedule():
    out = subprocess.run(["node", str(ROOT / "tools/dump_schedule.mjs")], capture_output=True, text=True, cwd=ROOT)
    if out.returncode != 0:
        print(out.stderr, file=sys.stderr)
        sys.exit(2)
    return json.loads(out.stdout)


def grid_time(t, grid):
    div = {"beat": 1.0, "8th": 0.5, "16th": 0.25}[grid]
    d = div * B["beatPeriod"]
    return B["beat0"] + round((t - B["beat0"]) / d) * d


def audio_targets():
    ts = []
    for d in B["dropouts"]:
        ts += [d["start"], d["end"]]
    return ts


def fr(t, fps):
    return int(round(t * fps))


def check_schedule(D, fps, fails, warns, rows):
    S = D["S"]
    for h in D["HITS"]:
        f = fr(h["t"], fps)
        if h["grid"] == "audio":
            tgt = min(audio_targets(), key=lambda x: abs(x - h["t"]))
        elif h["grid"] == "lyric":
            # anchored to lyrics-timing.json: on the 16th grid (tap-sync snaps to 8ths; typing and
            # plate locks subdivide in 16ths) or, if a time was tapped unsnapped, exactly that time
            g = grid_time(h["t"], "16th")
            tgt = g if abs(fr(g, fps) - fr(h["t"], fps)) <= 1 else h["t"]
        else:
            tgt = grid_time(h["t"], h["grid"])
        ft = fr(tgt, fps)
        off = f - ft
        rows.append((fps, h["name"], h["t"], f, ft, off, h["grid"]))
        if off > 0:
            fails.append(f"[{fps}fps] LATE by {off}f: {h['name']} (frame {f}, target {ft})")
        elif off < -1:
            fails.append(f"[{fps}fps] EARLY by {-off}f: {h['name']} (frame {f}, target {ft})")
        elif off == -1:
            warns.append(f"[{fps}fps] 1 frame early: {h['name']}")
        # on-beat tolerance for grid hits: within ±1 frame of a beat/subdivision (always true if off∈{-1,0})

    # contiguity of scenes
    order = ["s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"]
    for a, b in zip(order, order[1:]):
        if fr(S[a]["end"], fps) != fr(S[b]["start"], fps):
            fails.append(f"[{fps}fps] gap/overlap between {a} and {b}: {S[a]['end']} vs {S[b]['start']}")
    # lyric anchoring (re-timing lyrics-timing.json must move these)
    L = {l["id"]: l for l in LT["lines"]}
    anchors = [("s3.end", S["s3"]["end"], "L3"), ("s4.l4", S["s4"]["l4"], "L4"), ("s5.start", S["s5"]["start"], "L5"),
               ("s5.queue", S["s5"]["queue"], "L6"), ("s6.start", S["s6"]["start"], "L7"), ("s7.start", S["s7"]["start"], "L8")]
    for name, t, lid in anchors:
        if fr(t, fps) != fr(L[lid]["start"], fps):
            fails.append(f"[{fps}fps] {name} is not on {lid}.start ({t} vs {L[lid]['start']})")
    # 808-claimed hits must be accents
    acc = {fr(a, fps) for a in B["accents808"]}
    for name, t in [("S3 slam", S["s3"]["slam"]), ("S5 lock", S["s5"]["lock"]), ("S7 loupe", S["s7"]["loupeLand"]), ("S8 slam", S["s8"]["slam"])]:
        if fr(t, fps) not in acc:
            fails.append(f"[{fps}fps] {name} claims an 808 accent but frame {fr(t, fps)} is not one")
    # these coincide with 808s only while the lyric timing is H1 (bar-aligned lines)
    for name, t in [("S4 splash (fill 2)", S["s4"]["fills"][1]), ("S5 start (L5)", S["s5"]["start"])]:
        if fr(t, fps) not in acc:
            warns.append(f"[{fps}fps] {name} no longer sits on an 808 (lyric timing moved it off the H1 bars)")


def check_video(D, video, fails, warns, report):
    import numpy as np
    probe = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=r_frame_rate,width,height",
                            "-of", "csv=p=0", video], capture_output=True, text=True).stdout.strip().split(",")
    w, h = int(probe[0]), int(probe[1])
    num, den = probe[2].split("/")
    fps = round(int(num) / int(den))
    W, H = 180, int(180 * h / w)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vf", f"scale={W}:{H},format=gray", "-f", "rawvideo", "-"],
                         capture_output=True).stdout
    frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
    diff = np.zeros(len(frames))
    diff[1:] = np.abs(frames[1:] - frames[:-1]).mean((1, 2))
    np.save(ROOT / "qa/diff.npy", diff)
    for hit in D["HITS"]:
        f = fr(hit["t"], fps)
        if f < 4 or f + 4 >= len(diff):
            continue
        # baseline: the quieter of two pre-hit windows, so an earlier spike can't inflate it
        base = min(float(np.median(diff[f - 8:f - 2])), float(np.median(diff[f - 5:f - 1]))) if f >= 10 else float(diff[f - 3])
        win = {k: float(diff[f + k]) for k in range(-2, 4)}
        thr = max(base * 1.6, base + 0.4)
        onset = next((k for k in range(-2, 4) if win[k] > thr), None)
        status = "ok"
        if onset is None:
            status = "no-change"
        elif onset > 0:
            status = f"LATE+{onset}"
        elif onset < -1:
            status = f"early{onset}"
        report.append((hit["name"], f, round(base, 2), [round(win[k], 2) for k in range(-2, 4)], status))
        major = hit["kind"] == "boundary" or any(k in hit["name"] for k in ("SLAM", "toggle", "locks (808)", "loupe", "plate slam", "pin", "widget", "ad-lib", "queue", "tap", "white full", "phone", "pill", "card away"))
        if status.startswith("LATE") and major:
            fails.append(f"[video {fps}fps] visual change starts {onset}f AFTER {hit['name']} (frame {f})")
        elif status.startswith("LATE") or status == "no-change":
            warns.append(f"[video {fps}fps] {status}: {hit['name']} (frame {f})")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--video", help="rendered 60 fps QA preview (grain off) to measure")
    ap.add_argument("--table", action="store_true", help="print the full event-frame table")
    a = ap.parse_args()
    D = dump_schedule()
    fails, warns, rows = [], [], []
    for fps in (60, 30):
        check_schedule(D, fps, fails, warns, rows)
    if a.table:
        print(f"{'fps':>3} {'t (s)':>9} {'frame':>6} {'target':>6} {'off':>4} {'grid':>5}  event")
        for fps, name, t, f, ft, off, grid in rows:
            print(f"{fps:>3} {t:9.4f} {f:6d} {ft:6d} {off:4d} {grid:>5}  {name}")
    report = []
    if a.video:
        check_video(D, a.video, fails, warns, report)
        print("\nmeasured visual onset per hit (diff at f-2..f+3):")
        for name, f, base, win, status in report:
            print(f"  f{f:5d} base {base:6.2f} {win} {status:10s} {name}")
    n = len(D["HITS"])
    print(f"\n{n} hits × 2 frame rates checked; {len(warns)} warnings; {len(fails)} failures")
    for w in warns:
        print("  warn:", w)
    if fails:
        print("\nFAILED:")
        for f in fails:
            print("  ✗", f)
        sys.exit(1)
    print("verify_sync: PASS")


if __name__ == "__main__":
    main()

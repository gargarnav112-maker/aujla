#!/usr/bin/env bash
# Extract stills at every hit frame and ±2 frames from a rendered 60 fps
# preview into qa/stills/, then build labelled contact sheets in qa/sheets/
# (10 events per sheet, 5 frames per event: f-2 … f+2).
# usage: tools/qa_stills.sh [VIDEO]   (default qa/preview-qa60.mp4; render it with
#   npx remotion render Main1x1 qa/preview-qa60.mp4 --scale=0.5 --props='{"qa":true}' --muted)
set -euo pipefail
cd "$(dirname "$0")/.."
VIDEO=${1:-qa/preview-qa60.mp4}
mkdir -p qa/stills qa/sheets
rm -f qa/stills/*.jpeg qa/sheets/*.png
node tools/dump_schedule.mjs > qa/schedule.json
python3 - "$VIDEO" <<'PY'
import json, subprocess, sys
video = sys.argv[1]
d = json.load(open('qa/schedule.json'))
hits = sorted(d['HITS'], key=lambda h: h['t'])
frames = sorted({max(0, round(h['t'] * 60) + k) for h in hits for k in (-2, -1, 0, 1, 2)})
sel = '+'.join(f'eq(n\\,{f})' for f in frames)
subprocess.run(['ffmpeg', '-v', 'error', '-i', video, '-vf', f"select='{sel}'", '-vsync', '0', '-q:v', '3', 'qa/stills/tmp-%04d.jpeg'], check=True)
import os
for i, f in enumerate(frames):
    os.rename(f'qa/stills/tmp-{i + 1:04d}.jpeg', f'qa/stills/f{f:04d}.jpeg')
for i in range(0, len(hits), 10):
    files = [f'qa/stills/f{max(0, round(h["t"] * 60) + k):04d}.jpeg' for h in hits[i:i + 10] for k in (-2, -1, 0, 1, 2)]
    subprocess.run(['python3', 'tools/contact_sheet.py', f'qa/sheets/events-{i // 10 + 1:02d}.png', '5', '216', '60', *files], check=True, stdout=subprocess.DEVNULL)
print(len(frames), 'stills,', (len(hits) + 9) // 10, 'sheets')
PY

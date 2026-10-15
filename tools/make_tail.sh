#!/usr/bin/env bash
# Build public/audio/straight-up-full.wav: the 17.21 s clip, faded over its last
# 0.18 s, plus a ~1.6 s reverb/echo tail grown from the clip's last half-second,
# so the abrupt cut at beat 39 decays instead of chopping.
set -euo pipefail
cd "$(dirname "$0")/.."
SRC=public/audio/straight-up.wav
OUT=public/audio/straight-up-full.wav
TAIL=$(python3 -c "import json;print(json.load(open('src/data/config.json'))['tailSeconds'])")
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SRC")
FADE=0.18
SEG=0.5
python3 - "$DUR" "$FADE" "$SEG" "$TAIL" <<'PY' > /tmp/tail_args
import sys
d,f,s,t=map(float,sys.argv[1:])
print(f"{d-f:.4f} {d-s:.4f} {d:.4f} {d+t:.4f}")
PY
read FADE_ST SEG_ST END TOTAL < /tmp/tail_args
DELAY_MS=$(python3 -c "print(int(round($SEG_ST*1000)))")
ffmpeg -y -v error -i "$SRC" -filter_complex "
[0:a]asplit=2[dry][wet];
[dry]afade=t=out:st=${FADE_ST}:d=${FADE},apad=whole_dur=${TOTAL}[d];
[wet]atrim=start=${SEG_ST}:end=${END},asetpts=PTS-STARTPTS,
  afade=t=in:d=0.02,
  aecho=0.9:0.9:109|217|435|652|870|1087|1304|1522:0.55|0.45|0.38|0.31|0.25|0.2|0.16|0.12,
  aecho=0.9:0.8:37|71|143:0.5|0.4|0.3,
  lowpass=f=5200,highpass=f=40,
  volume=0.4,
  apad=whole_dur=${TOTAL},
  afade=t=out:st=$(python3 -c "print(round($END+0.6-$SEG_ST,3))"):d=$(python3 -c "print(round($TOTAL-$END-0.65,3))"):curve=qsin,
  adelay=${DELAY_MS}|${DELAY_MS}[w];
[w]volume='if(lt(t,${END}),0.35+0.65*(t-${SEG_ST})/(${END}-${SEG_ST}),1)':eval=frame[w2];
[d][w2]amix=inputs=2:duration=first:normalize=0,atrim=end=${TOTAL}[o]" \
  -map "[o]" -ar 48000 -ac 2 -c:a pcm_s16le "$OUT"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT"
python3 - "$SRC" "$OUT" <<'PY'
import sys, soundfile as sf, numpy as np
x, sr = sf.read(sys.argv[1]); y, _ = sf.read(sys.argv[2])
n = int((len(x) / sr - 0.55) * sr)
assert np.abs(x[:n] - y[:n]).max() < 1e-4, "dry clip changed before the tail region"
assert np.abs(y).max() < 0.999, f"clipping: peak {np.abs(y).max():.3f}"
print(f"ok: dry clip sample-identical to {n/sr:.2f}s, peak {np.abs(y).max():.3f}")
PY

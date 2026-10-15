#!/usr/bin/env python3
"""Write src/data/lyrics-timing.json from hypothesis H1.

H1: each lyric line is one bar of 8th-note flow, starting on Slam A; each line
ends where the next begins; the last line ends on Slam B. Ad-libs sit on the
last beat of their bar (ad-lib 1 after L2, ad-lib 2 after L6).
Times come from src/data/beats.json (measured), never typed by hand.
heroWordTime is left null: scenes fall back to their beat-relative defaults
until tap-sync supplies real values.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
B = json.loads((ROOT / "src/data/beats.json").read_text())
lines = [l for l in (ROOT / "assets/lyrics.txt").read_text().splitlines() if l.strip()]
assert len(lines) == 8, f"expected 8 lyric lines, got {len(lines)}"

bars = B["bars"]
ia = bars.index(B["slams"][0])
starts = bars[ia:ia + 8]
end = B["slams"][1] if len(B["slams"]) > 1 else bars[ia + 8]
beat = B["beatPeriod"]

# hero word = index into the line's words (text itself is read from lyrics.txt at render time)
hero_index = {2: 3, 4: 3, 5: 0, 6: 3, 7: 2, 8: 3}
out = {
    "hypothesis": "H1",
    "fps": None,
    "lines": [],
    "adlibs": [],
}
for i, s in enumerate(starts):
    n = i + 1
    out["lines"].append({
        "id": f"L{n}",
        "start": round(s, 6),
        "end": round(starts[i + 1] if i + 1 < len(starts) else end, 6),
        "heroWordIndex": hero_index.get(n),
        "heroWordTime": None,
    })
for after in (2, 6):
    s = starts[after - 1] + 3 * beat
    out["adlibs"].append({"id": f"A{1 if after == 2 else 2}", "afterLine": f"L{after}",
                          "start": round(s, 6), "end": round(starts[after], 6)})
del out["fps"]
(ROOT / "src/data/lyrics-timing.json").write_text(json.dumps(out, indent=2) + "\n")
print(json.dumps(out, indent=1))

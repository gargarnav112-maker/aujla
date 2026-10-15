#!/usr/bin/env bash
# Copy inputs from assets/ into public/ and record which optional files exist
# in src/data/assets.json (render code never probes the filesystem).
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/img/people public/video
cp assets/cover.jpg public/img/cover.jpg
cp assets/art-wide.png public/img/art-wide.png
manak=null; nipsey=null; flyover=null
if [ -f assets/people/manak.jpg ]; then cp assets/people/manak.jpg public/img/people/manak.jpg; manak='"img/people/manak.jpg"'; fi
if [ -f assets/people/nipsey.jpg ]; then cp assets/people/nipsey.jpg public/img/people/nipsey.jpg; nipsey='"img/people/nipsey.jpg"'; fi
if [ -f assets/maps/flyover.mov ]; then flyover='"video/flyover.mov"'; echo "note: flyover.mov found; the vector map is still used (see BUILD_LOG)"; fi
cat > src/data/assets.json <<JSON
{
  "manakPhoto": $manak,
  "nipseyPhoto": $nipsey,
  "flyover": $flyover
}
JSON
python3 tools/make_parallax.py
cat src/data/assets.json

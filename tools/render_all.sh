#!/usr/bin/env bash
# Final renders in sequence; each log ends with "R<n> <exit code>".
cd "$(dirname "$0")/.."
rm -f out/straight-up_*.mp4 out/render-*.log
npm run -s render:1x1 > out/render-1x1.log 2>&1; echo "R1 $?" >> out/render-1x1.log
npm run -s render:9x16 > out/render-9x16.log 2>&1; echo "R2 $?" >> out/render-9x16.log
npm run -s render:1x1-30 > out/render-30.log 2>&1; echo "R3 $?" >> out/render-30.log
npm run -s proof > out/render-proof.log 2>&1; echo "R4 $?" >> out/render-proof.log

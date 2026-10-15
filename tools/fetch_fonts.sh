#!/usr/bin/env bash
# Download the Google Fonts variable files used by the edit into public/fonts/.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/fonts
curl -sS -o public/fonts/Inter.woff2 https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2
curl -sS -o public/fonts/JetBrainsMono.woff2 https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbV2o-flEEny0FZhsfKu5WU4xD7OwE.woff2
curl -sS -o public/fonts/NotoSansGurmukhi.woff2 https://fonts.gstatic.com/s/notosansgurmukhi/v29/w8gyH3EvQP81sInb43inmyN9zZ7hb7ATbSWo4q8dJ74a3cVrSnsXn2CP.woff2
ls -la public/fonts

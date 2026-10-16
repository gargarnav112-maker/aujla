# STRAIGHT UP: renders

| File | Size | fps | Duration | Frames | Codec |
|---|---|---|---|---|---|
| `straight-up_1x1_60fps.mp4` | 1080×1080 | 60 | 20.000 s | 1200 | H.264 CRF 15, yuv420p, AAC 320 kbps / 48 kHz, faststart |
| `straight-up_9x16_60fps.mp4` | 1080×1920 | 60 | 20.000 s | 1200 | same |
| `straight-up_1x1_30fps.mp4` | 1080×1080 | 30 | 20.000 s | 600 | same (fallback) |
| `sync-proof.mp4` | 540×540 | 30 | 18.800 s | 564 | lyric-timing check |

**Timeline:**
- song clip 0–17.210 s;
- fade 17.03–17.21 s;
- echo tail to 18.810 s;
- *Karan Aujla* name bloom and end card to 20.000 s (no handle, no watermark).

Duration = clip + `tailSeconds` + `endCardSeconds` (from `calculateMetadata`).

## Re-timing the edit with tap-sync

1. Watch `sync-proof.mp4`. The big L1…L8 labels should flip exactly as each line starts; the blue ◆ marks hero words (grey = fallback).
2. If anything is early or late, open `tools/tap-sync.html` in a browser. Load the audio (`public/audio/straight-up.wav`), `src/data/beats.json`, `src/data/lyrics-timing.json` and `assets/lyrics.txt`.
3. Play (0.75× helps). Keys:
   - **Space** marks the next line start;
   - **H** marks the current line's hero word (risky, whiskey, Manak, Nipsey, number, Gypsy);
   - **A** marks an ad-lib;
   - **←/→** nudge the last mark ±1 frame;
   - **Backspace** undoes.
   
   Snap to ⅛-beat is on by default.
4. **Export JSON** and save it over `src/data/lyrics-timing.json`.
5. Run `npm run qa` to check, then `npm run render:1x1` / `render:9x16`. Every scene, toggle, pour, typing run, lock and landing re-flows from that file, with no code edits.

## Event-frame table (H1 timing, measured beat grid)

Every hit sits **0 frames** off its grid point at both 60 and 30 fps (`tools/verify_sync.py`).

| # | Event | Time (s) | Frame @60 | Frame @30 | Grid |
|---|---|---|---|---|---|
| 1 | S0 phone lands / island expands (beat 0) | 0.225 | 14 | 7 | beat |
| 2 | S0 headphones pill | 0.660 | 40 | 20 | beat |
| 3 | S0→S1 boundary (808 enters) | 1.095 | 66 | 33 | beat |
| 4 | S1 pin lands | 1.965 | 118 | 59 | beat |
| 5 | S1→S2 boundary (808 drops out) | 2.026 | 122 | 61 | audio |
| 6 | S2 grey flip | 2.026 | 122 | 61 | audio |
| 7 | S2→S3 boundary (SLAM A) | 2.834 | 170 | 85 | beat |
| 8 | S3 SLAM A flash + punch | 2.834 | 170 | 85 | beat |
| 9 | S3 settings row 1 | 3.269 | 196 | 98 | 8th |
| 10 | S3 settings row 2 | 3.487 | 209 | 105 | 8th |
| 11 | S3 settings row 3 | 3.704 | 222 | 111 | 8th |
| 12 | S3 settings row 4 | 3.921 | 235 | 118 | 8th |
| 13 | S3 settings row 5 | 4.139 | 248 | 124 | 8th |
| 14 | S3 settings row 6 | 4.356 | 261 | 131 | 8th |
| 15 | S3 settings row 7 | 4.574 | 274 | 137 | 8th |
| 16 | S3 toggle flips ON (L2 hero) | 5.008 | 301 | 150 | lyric |
| 17 | S3 ad-lib 1 | 5.878 | 353 | 176 | lyric |
| 18 | S3→S4 boundary (L3) | 6.313 | 379 | 189 | lyric |
| 19 | S4 widget drop (L4) | 8.052 | 483 | 242 | lyric |
| 20 | S4 fill step 1 | 8.052 | 483 | 242 | lyric |
| 21 | S4 fill step 2 | 8.487 | 509 | 255 | lyric |
| 22 | S4 fill step 3 | 8.922 | 535 | 268 | lyric |
| 23 | S4 fill step 4 | 9.357 | 561 | 281 | lyric |
| 24 | S4 brim (L4 hero) | 9.357 | 561 | 281 | lyric |
| 25 | S4→S5 boundary (L5) | 9.791 | 587 | 294 | lyric |
| 26 | S5 char 1 | 9.791 | 587 | 294 | lyric |
| 27 | S5 char 2 | 9.900 | 594 | 297 | lyric |
| 28 | S5 char 3 | 10.009 | 601 | 300 | lyric |
| 29 | S5 char 4 | 10.117 | 607 | 304 | lyric |
| 30 | S5 char 5 | 10.226 | 614 | 307 | lyric |
| 31 | S5 char 6 | 10.335 | 620 | 310 | lyric |
| 32 | S5 char 7 | 10.444 | 627 | 313 | lyric |
| 33 | S5 char 8 | 10.552 | 633 | 317 | lyric |
| 34 | S5 char 9 | 10.661 | 640 | 320 | lyric |
| 35 | S5 char 10 | 10.770 | 646 | 323 | lyric |
| 36 | S5 char 11 | 10.878 | 653 | 326 | lyric |
| 37 | S5 char 12 | 10.987 | 659 | 330 | lyric |
| 38 | S5 char 13 | 11.096 | 666 | 333 | lyric |
| 39 | S5 tap | 11.096 | 666 | 333 | lyric |
| 40 | S5 queue sheet (L6) | 11.531 | 692 | 346 | lyric |
| 41 | S5 Nipsey row locks (808) | 11.965 | 718 | 359 | beat |
| 42 | S5 ad-lib 2 | 12.835 | 770 | 385 | lyric |
| 43 | S5→S6 boundary (L7) | 13.270 | 796 | 398 | lyric |
| 44 | S6 plate slam (L7) | 13.270 | 796 | 398 | lyric |
| 45 | S6 column 1 locks | 13.596 | 816 | 408 | lyric |
| 46 | S6 column 2 locks | 13.705 | 822 | 411 | lyric |
| 47 | S6 column 3 locks | 13.813 | 829 | 414 | lyric |
| 48 | S6 column 4 locks | 13.922 | 835 | 418 | lyric |
| 49 | S6 column 5 locks | 14.031 | 842 | 421 | lyric |
| 50 | S6 column 6 locks | 14.139 | 848 | 424 | lyric |
| 51 | S6 column 7 locks | 14.248 | 855 | 427 | lyric |
| 52 | S6 column 8 locks | 14.357 | 861 | 431 | lyric |
| 53 | S6 column 9 locks | 14.466 | 868 | 434 | lyric |
| 54 | S6 column 10 locks | 14.574 | 874 | 437 | lyric |
| 55 | S6→S7 boundary (L8) | 15.009 | 901 | 450 | lyric |
| 56 | S7 loupe lands (808) | 15.444 | 927 | 463 | beat |
| 57 | S7 hex char 1 | 15.553 | 933 | 467 | 16th |
| 58 | S7 hex char 2 | 15.661 | 940 | 470 | 16th |
| 59 | S7 hex char 3 | 15.770 | 946 | 473 | 16th |
| 60 | S7 hex char 4 | 15.879 | 953 | 476 | 16th |
| 61 | S7 flood starts (808 vanishes) | 15.942 | 957 | 478 | audio |
| 62 | S7 hex char 5 | 15.987 | 959 | 480 | 16th |
| 63 | S7 hex char 6 | 16.096 | 966 | 483 | 16th |
| 64 | S7 white full | 16.314 | 979 | 489 | beat |
| 65 | S7→S8 boundary (SLAM B) | 16.748 | 1005 | 502 | beat |
| 66 | S8 SLAM B → pin + ring | 16.748 | 1005 | 502 | beat |
| 67 | S8 pull back | 17.618 | 1057 | 529 | beat |
| 68 | S8 card away / name bloom | 18.488 | 1109 | 555 | beat |

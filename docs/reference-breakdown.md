# Reference breakdown

## Status: measured (reference received in chat)

The clip and an iOS lock-screen screenshot arrived later in the session. They're saved as `reference/style-ref.mp4` and `reference/lockscreen-ref.jpg`.

- **Contact sheets:** 10 fps, `qa/ref-sheet-1..3.png`.
- **Motion curve vs its own beat grid:** `qa/ref-motion.png`, made with `python3 tools/motion_curve.py reference/style-ref.mp4`.
- **Peak timing:** of its 14 largest cuts, **5 land on a beat** (0 / −1 frame at 30 fps). The others mostly land **+1 to +3 frames after** the beat, e.g. 1.67, 2.87, 5.13 and 7.40 s at +1/+2.
  - The brief's "10 of 12 within ±1 frame" holds only if you count +1 as on.
  - Our edit is at 0 frames on every hit (`verify_sync.py`).
- **Verified moves** (the brief's table holds; corrections in bold):
  - 0.0–0.3: phone back → flip;
  - 0.3–0.9: phone tilts, red "Connect" pill drops;
  - 1.0–1.6: **red wash under the pill**;
  - 1.7–2.7: **deep-blue satellite ocean**, blue dot;
  - 2.8: **white zoom-flash**, then grey map with labels;
  - 4.1–4.4: dotted route from the dot;
  - 4.5–5.0: Texas outline in a white card **on light grey #E5E5EA**;
  - 5.1–5.9: Apple-Maps-style map, "TX" pill pin;
  - 6.2–7.2: bloom, sports-icon pill pops;
  - 7.4–8.3: typing bubble on black;
  - 8.4–9.7: blue lyric bubble on light grey;
  - 9.8–10.8: the ad-lib "yuh!" inside a **dark chat bubble** over two photo tiles, with RGB split;
  - 10.8–12.5: neon yellow/pink tiles, the search field types an album;
  - 12.5–14.6: album page, motion-blurred tracklist scroll, pink row;
  - 14.7–17.0: the creator's name with a purple bloom;
  - 17.0–21.0: glyph + handle end card.
- **What changed in our edit from this study:**
  - lock-screen now-playing opening (from the screenshot);
  - red-filled Connect pill;
  - deep-blue ocean with the iOS-blue location dot;
  - Punjab card forming on light grey;
  - ad-libs as dark chat bubbles with tails;
  - the closing name bloom is **Karan Aujla**;
  - no handle or watermark, at your request.

## Reference moves and where each lives in our edit

| Ref time (s) | Reference move | Lands on | Our equivalent | Our time (s) |
|---|---|---|---|---|
| 0.0–0.4 | Phone flips back → front (3D Y) | — | S0 phone spins in 70°→0°, `springSlam` | lands 0.225 (beat 0) |
| 0.4–1.5 | Island now-playing card; red earbuds pill + red wash | — | S0 island live activity (cover, title, real-audio EQ); headphones pill + `accentGlow` wash | 0.225 / 0.660 (beats 0, 1) |
| 1.6–2.8 | Satellite dive onto island, blue location dot | 1.65 | S1 push through the thumbnail → vector satellite dive onto 30.694° N 76.103° E; coordinate chip types in | 1.095 (808 entry) → pin 1.965 |
| 2.8–4.2 | Map desaturates; dotted route draws from the dot | 2.79 | S2 grey flip on the 808 dropout; dotted route; dead-still breath in the near-silence | 2.026; hold 2.298–2.412 |
| 4.4–5.0 | Route resolves into a state outline in a white card; flash ~5.0 | 4.48 | S2 route morphs into **Punjab** inside a rounded white card, finishing 2 frames before the slam | done 2.801 |
| 5.2–6.2 | Regional map, abbreviation pin, lyric word by the pin | — | S3 white flash + card snap → Settings list | 2.834 (Slam A) |
| 6.2–7.3 | Bloom wash; icon widget pops | 6.20 | S3 "risky" toggle flips with bloom + punch808 | 5.008 (808) |
| 7.4–8.3 | Typing-indicator bubble | 7.34 | (our pacing moves this energy into the Settings rows on 8ths) | 3.269 → |
| 8.4–9.7 | Lyric as a blue message bubble | 8.48 | S4 parallax across the crew; glass widget drops on the bonnet | 6.313 / 8.052 |
| 9.8–10.7 | Ad-lib card: RGB split + horizontal smear | 10.19 | ad-lib 1 "Woo!" card with `adlibFX` (RGB split, smear, flicker) | 5.878 |
| 10.8–12.5 | Neon search field types an album name | — | S5 neon (`accentGlow`) search field types "Kuldeep Manak", one character per 16th | 9.791 → 11.096 |
| 12.5–14.6 | Album page; motion-blurred scroll to a pink-highlighted row | — | S5 queue sheet; Nipsey row lifts and locks red on the 808 | 11.531 / 11.965 |
| 14.7–17.0 | Whip into the creator's name with a purple bloom | 14.70 | S8 handle with oxblood bloom | 18.487 |
| 17.0–21.0 | End card (glyph + handle) | — | S8 end card: pin glyph, handle, cover coordinates | 18.922 → 20.0 |

Moves the reference doesn't have, all built in the same UI-only language:

- the plate odometer (S6);
- the colour-picker white flood that *is* the lyric (S7);
- the Find-My pin closing on the opening coordinate (S8).

## Pacing DNA

- **Our measured result:** every transition and hit sits **0 frames** off its grid point at 60 fps and at 30 fps (`tools/verify_sync.py`, 68 events). The brief puts the reference at 10 of 12 transitions within ±1 frame (unverified).
- **Density:** 9 scenes and roughly 30 distinct visual ideas over 17.2 s of music. Every 8th or 16th note in the busy passages carries a UI micro-event (row, character, column lock, hex digit); every beat carries a 0.4 % stage pulse; every 808 carries `punch808`.
- **Breath holds:** the two holds are the only frames without drift or the beat pulse (Scene 2 near-silence, Scene 7 white). Grain keeps running through both.
- **Watermark:** sits top-right and drops to bottom-left on the white flood, as the reference does.

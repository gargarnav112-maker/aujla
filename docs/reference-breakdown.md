# Reference breakdown

## Status: the reference clip was not supplied

`reference/style-ref.mp4` never reached this session: the repo was empty, and only the cover, the screen recording and the lyrics were sent. Phase 1 could not be **measured**:

- no 10 fps contact sheets;
- no motion-difference curve;
- no beat-tracking of the reference audio.

The table below is the brief's own breakdown, kept as the working spec and marked **unverified**. The tooling is ready, so the study takes about two minutes once the file lands:

```bash
# 10 fps contact sheets (timestamped)
mkdir -p qa/ref && ffmpeg -i reference/style-ref.mp4 -vf fps=10,scale=240:-1 qa/ref/f%04d.png
tools/contact_sheet.sh qa/ref-sheet.png 10 240 10 qa/ref/f*.png
# motion-difference curve vs. its beat grid (same method as qa/motion-vs-beats.png)
python3 tools/motion_curve.py reference/style-ref.mp4 --out qa/ref-motion.png
```

## The brief's breakdown (unverified) and where each move lives in our edit

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

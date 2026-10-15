# Build log: STRAIGHT UP

Running log of decisions, measurements, checks and fixes, in phase order.

---

## 0. Inputs

| Input | Status | What I did |
|---|---|---|
| `assets/audio/source.mov` | Received in chat (HEVC 1206×2622 @ 60 fps, AAC 44.1 kHz, **758,961 samples = 17.210 s**) | Copied in. |
| `assets/cover.jpg` | Received in chat (794×804) | Copied in. |
| `assets/lyrics.txt` | Received in chat (8 lines, 2 bracketed ad-libs) | Written verbatim. |
| `assets/art-wide.png` | **Not supplied** | **Recovered from the screen recording.** The recording plays the widescreen art rotated 90°: the art occupies exactly 1206×2144 at y = 239, i.e. 2144×1206 rotated. I cropped that region and rotated it 90° CCW. I took the per-pixel **median of 12 frames** (one per second) to cancel HEVC noise; each frame sat within 0.8–1.7 levels of the median, so the source is static. The result matches the brief's description exactly: title across the top, coordinates reading **76.104° E**. |
| `reference/style-ref.mp4` | **Not supplied** | Phase 1 could not be measured. See `docs/reference-breakdown.md`; the brief's breakdown is used as the unverified spec. |
| `assets/maps/flyover.mov` | Not supplied | Used the vector map path (d3-geo + Natural Earth). |
| `assets/people/*.jpg` | Not supplied | Bone monogram tiles (KM / NH). `tools/prepare_assets.sh` switches to photos automatically if they appear. |
| `src/data/config.json` | Created | Placeholders: `handle: "yourhandle"`, `plateText: "PB 10 AJ 0001"`, blank track names. |

**Coordinates.** The square cover prints 30.694° N 76.103° E; the wide art prints 76.104° E (about 100 m east). I confirmed this on the recovered art. **30.694° N, 76.103° E is used everywhere** (`config.coord`). The point tests *inside* the Natural Earth Punjab polygon.

## 1. Audio extraction

- `ffmpeg … -af aresample=48000,afade=t=in:d=0.015,atrim=end=17.21` → `public/audio/straight-up.wav`.
- **Fix:** the first extraction came out 17.232 s. The 48 kHz resampler flush added 22 ms of tail; the source starts at pts 0, so there is no AAC priming offset. I trimmed to exactly 17.210 s so every timestamp stays on the source timeline.
- **Tail** (`tools/make_tail.sh`):
  - fade 17.03 → 17.21;
  - echo/reverb bloom grown from the last 0.5 s, with two `aecho` networks, low-passed and faded over 1.6 s;
  - written to `public/audio/straight-up-full.wav` (18.81 s).
  - **Fix:** the first version used `alimiter`, whose look-ahead shifted the whole clip. I removed it. The script now *asserts* the dry clip is sample-identical up to the tail region and that the peak is below 0.999 (measured 0.386).

## 2. Audio map (`tools/analyze_audio.py` → `src/data/beats.json`)

**Method.**
- HPSS percussive layer, high-passed at 2 kHz, 1 ms RMS, rectified log-energy derivative (time-domain onset strength).
- Grid search over 110–160 BPM in 0.01 steps × phase in 1 ms steps, scored on the 8th-note grid.
- The quarter phase is chosen on kick/808 (30–200 Hz) energy.

**Measurement problems found and fixed.**
1. A centred-STFT onset envelope (2048-sample window) put beat 0 at 0.232 s: a window-centring bias. I replaced it with the time-domain envelope.
2. Full-band energy picked the *off-beats* (the hats are louder than the kick). The quarter phase is now decided by the 30–200 Hz band.
3. The intro (no sub-bass, 0–0.898 s) was mistaken for Dropout A. Dropouts now only count after the groove starts.

**Result vs the brief.**

| Quantity | Brief | Measured | Δ @ 60 fps |
|---|---|---|---|
| Tempo | 138.00 | 137.99 (0.007 %, 1.2 ms over the clip) | 0 |
| Beat 0 | 0.256 | **0.2254** | **−2** |
| Bars from Slam A | 2.865 … 16.778 | 2.834 … 16.748 | −1 to −2 |
| 808 accents | 2.865, 5.039, … | 2.834, 5.008, … (all 9 confirmed: sub-bass after/before ≥ 0.8 of p98) | −1 to −2 |
| Slam A / Slam B | 2.865 / 16.778 | 2.834 / 16.748 | −2 / −2 |
| Dropout A | ~2.00; silence 2.25–2.35 | 2.026–2.808; near-silence 2.298–2.412 | — |
| Dropout B | ~15.95 | 15.942–16.618 | — |

**Why we differ by about 2 frames, and the decision.** Per band, onsets sit relative to the brief's grid as follows:

- >8 kHz: −31.6 ms, IQR 0.7 ms;
- 2–8 kHz: −31.7 ms;
- the 808 body crosses 50 % about 25 ms after the drum click.

The brief's grid tracks the 808 body. The hats, snare and clap transients land 31 ms (≈ 2 frames at 60 fps) earlier, and the brief itself puts Slam A's transient at "≈ 2.80–2.85". Locking visuals to the brief's grid would make every hit about 2 frames **late**, which non-negotiable #3 forbids. **I locked the edit to the measured transients.** All downstream times come from `beats.json`, so this is a single source of truth.

**Other findings.**
- The ≥ 300 ms rule also catches three short 808 rests (4.635–5.016, 9.381–9.799, 11.591–11.973 s). They are the rests before the re-entering accents, so they're stored as `subRests`, not dropouts. Only gaps ≥ 600 ms after the groove starts count as dropouts (A and B).
- An 808 pickup sounds one 16th before the groove downbeat at 1.095 s.

## 3. Lyric timing (`src/data/lyrics-timing.json`)

- Written from **H1** by `tools/make_h1_timing.py`, reading the measured bars: L1 = Slam A, one bar per line, last line ending at Slam B. Ad-libs fall on the last beat of the L2 and L6 bars.
- **Hero words** are stored as `heroWordIndex` into each `lyrics.txt` line. No lyric text is typed in code. `heroWordTime` is null, so the edit uses the beat-relative fallbacks from the brief.
- **Attempts to measure vocal onsets:**
  - Whisper word timestamps failed: Hugging Face is blocked by the sandbox proxy (403).
  - Vocal-band (300–3400 Hz harmonic) energy per 8th was inconclusive, because the melodic sample shares the band.
- H1 stays a hypothesis. `out/sync-proof.mp4` and `tools/tap-sync.html` are the way to confirm it.
- **tap-sync** was tested in headless Chromium with the real files:
  - load audio + beats + lyrics + timing;
  - H marks a hero word, snapped to the 8th grid;
  - → nudges +1 frame;
  - the export keeps the schema.
- **Sync proof:** 540×540 @ 30 fps with audio. **Fix:** labels were tested in seconds, so the L1 label missed the slam frame (85/30 = 2.8333 s < 2.8343 s). Every event test in the codebase now compares *frames* (`secToFrame(t) <= frame`).

## 4. Design system

- `src/theme.ts` holds the palette tokens exactly as briefed, plus the iOS surfaces.
- `src/motion.ts` holds all motion tokens. Frame counts are specified at 60 fps and converted with `f60()`, so the 30 fps fallback keeps timing in seconds.
- **Fonts:** Inter, JetBrains Mono and Noto Sans Gurmukhi.
  - `@remotion/google-fonts` fetches from fonts.gstatic.com *inside headless Chrome*, which can't reach the network here ("Failed to fetch").
  - `tools/fetch_fonts.sh` downloads the identical Google variable-font files (TLS-verified through the proxy) into `public/fonts/`. `@remotion/fonts` `loadFont()` blocks rendering until each face is ready.
  - Gurmukhi ਚਿੱਟਾ renders correctly (checked in the S7 stills).
- **Remotion 4.0.535** APIs were checked against the installed agent skills before use: `@remotion/media` `<Audio>`, `useWindowedAudioData`, `CameraMotionBlur` (still exported; renders Freeze-sampled sub-frames). Scene code therefore uses `useCurrentFrame()` plus a scene-offset context, never a custom frame prop, so motion blur samples correctly.

## 5. Storyboard decisions

- **No international borders on the map.** Natural Earth's de-facto Kashmir line differs from India's official map, a real sensitivity for this artist. The map shows land, sea, terrain noise, Punjab, and only *non-disputed* neighbouring Indian state outlines (Haryana, HP, Rajasthan, …). J&K and Ladakh are excluded.
- **Satellite look without imagery.** No flyover was supplied:
  - two-octave ground-anchored terrain noise;
  - coarse farmland (32 km radius) for mid zoom;
  - fine killa-strip farmland (4.2 km), village roofs, trees, road grid, highway and canal near the coordinate;
  - both procedural layers sit under soft radial masks;
  - everything graded towards slate.
- **Map fixes during build:**
  - (a) the farmland showed as a hard-edged square floating in fog at mid zoom: added the coarse layer and soft masks;
  - (b) brightness pumped at each noise-octave crossfade (f72–76 went dark): the octaves are now opaque grey in sRGB, the top layer fades in, and the brightness curve over the dive is monotonic (56 → 92).
- **Parallax.** The car-and-man mask is hand-drawn in `assets/masks/foreground.svg` (art pixel space). `tools/make_parallax.py` cuts a 2 px-feathered foreground and **inpaints** the background plate, so the 1.6× foreground never reveals a ghost car. Alignment is set at the pan midpoint, splitting the differential (±110 art px).
- **Plate.** `"PB 10 AJ 0001"` has 10 columns. One per 8th, ending on L7's hero word, would need to start before L7 itself. The schedule falls back to **16ths** automatically: `lockDivision: "16th"`, first lock 13.596 s, last on 14.574 s.
- **The S8 slam has no flash.** The white collapsing into the pin *is* the hit; a flash on top would muddy it.
- **Watermark glyph** is a generic location pin (no brand). The watermark drops bottom-left during the white flood and hands over to the end card.

## 6. QA

### Tools
- `tools/verify_sync.py`: schedule check at 60 and 30 fps (68 events), scene contiguity, lyric anchoring, 808 claims. `--video` measures the rendered frame differences at each hit.
- `tools/qa_stills.sh`: event frames ±2 → `qa/stills/`, plus contact sheets in `qa/sheets/`.
- `tools/motion_curve.py`: render motion curve over the beat grid.

### Scene-by-scene still reviews during build
| Scene | Fixes |
|---|---|
| S0 | Headphones pill collided with the clock: moved the clock down. Sheen stripe re-appeared from spring overshoot: limited to rotation. Stepped motion-blur copies in the 16× push: added a speed-proportional blur. |
| S3 | Empty group cards before their rows: each row now carries its own background. Toggle *started* on the hit frame (read late): it now *lands* on the frame (`landSpring`); rows land on their 8ths. |
| S4 | Widget looked like it floated (thumbnail misread). Measured at full res it sat on the hood edge; nudged it 16 art px down. |
| S5 | Tyre marks were dark on dark: now run through a parchment/oxblood smear band. |
| S7 | Vignette greyed the corners of the pure-white hold: vignette off during the flood. |
| S8 | Handle overlapped the departing card: the card now whips out *before* the beat and the handle lands on it. |

### Pass 1: full 540 px / 60 fps render, grain off
- `verify_sync` schedule: **PASS**, 68 × 2 events, 0 frames off.
- `verify_sync --video`, **2 failures**:
  - grey flip starts +1 frame late (an interpolation from the hit frame is 0 *on* the hit frame);
  - queue sheet visibly starts +3 frames late (`springSheet` starts from rest).
  - **Fix:** every start-type spring (`springAt`) and the grey flip now begin one frame early, so motion is visible on the hit frame. The queue sheet is pre-rolled 3 frames so its velocity peak sits on L6.
- Motion curve (`qa/motion-vs-beats-pass1.png`): the big peaks sit on bars/808s (1.10, 2.83, 5.88, 6.31, 8.50, 9.79, 12.83, 13.27, 16.75). Off-grid peaks:
  - the S3 card → Settings whip at slam + 9 frames. **Fix:** retimed to arrive exactly on slam + one 8th;
  - the flood midpoint at 16.13 s (ease-in-out). **Fix:** accelerating swell, so the biggest change lands on "white full" (beat 37);
  - the picker sheet at L8 + 9 frames (spring). **Fix:** `whipOut` decel, velocity peak on the beat;
  - the queue sheet at L6 − 12 frames. Fixed above.
- Stills (`qa/sheets/events-0*.png`, all 7 reviewed):
  - no half-loaded frames, fonts present, Gurmukhi correct;
  - **pin too small** at phone size: scaled 1.45×;
  - **search screen top-heavy**: two more skeleton rows;
  - noted and kept: the Settings build leaves the lower third black for about 1.3 s (it *is* the build).
- **Detector limitation, noted:** whole-frame difference only detects motion *starts*. "Landing" hits (column locks, loupe land, toggle land) read as "no-change" during continuous motion; they land on frame by construction (`landSpring` first-crossing is solved numerically to the hit frame).

### Pass 2: re-render after the pass-1 fixes
- `verify_sync` schedule: **PASS** (68 events × 60/30 fps, 0 frames off).
- `verify_sync --video qa/preview-qa60.mp4`: **PASS, 0 failures.**
  - The grey flip now changes on f122: diff 1.14 → 2.31.
  - **Detector fix:** the baseline is now the quieter of two pre-hit windows. Before, the pin-land spike at f118 inflated it.
  - The queue sheet starts 2 frames early, from the intended pre-roll.
  - The remaining warnings are "no-change" on landing events inside continuous motion (see the detector limitation above).
- Motion curve (`qa/motion-vs-beats-pass2.png`):
  - the major peaks sit on bars, 808s or 8ths: 1.10, 2.83, **3.05 (slam + ⅛, was +9 frames)**, 5.88, 6.31, 9.79, 12.83, 13.27, **15.01 (L8, was +9 frames)**, 16.75;
  - the white flood's peak moved into the end of the swell;
  - remaining off-grid bumps are continuous moves *between* beats: the dive (1.3–1.65 s), the card emerging inside Dropout A (2.55 s), and the tail pull-back after the music (17.7 s).
- Stills (`qa/sheets/events-0*.png`, all 7 re-reviewed): the bigger pin is legible at phone size ("Gypsy"), the search screen is filled, and no regressions.

### Re-timing test (definition of done)
- I edited **only** `src/data/lyrics-timing.json`: set the L2 hero time to 5.443 s and shifted L5–L8 by one 8th.
- The schedule re-flowed with zero code edits:
  - toggle → 5.443;
  - S4 end / S5 start / first character → 10.009;
  - S6 → 13.487.
- `verify_sync` still **PASS**, with the expected warning that L5 no longer coincides with an 808.
- **Fix** found by this test: lyric-anchored events were held to the quarter grid. They now verify against the lyric grid (16ths, or the exact tapped time when snap is off).
- The H1 file was restored byte-identical (`git diff` empty).

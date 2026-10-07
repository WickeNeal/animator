---
name: animator
description: Make a short procedural animation for any purpose and any project — a website animation, a social reel, a product demo or feature release (a walkthrough of a real web app: zoom, spotlight, callouts, a cursor on the user's click path), an explainer or a little story — as a single-file canvas video with a synthesized score, rendered to MP4 (plus web files). Ships with styles (cut paper, crosshatch ink, riso print, sketchbook, manim-style math, pixel art, isometric line art) and makes new ones from the user's references. Asks what it's for first, then style and the rest, then three check-ins (story, look, storyboard) before animating, and proves the result with measured review checks. Use when the user asks for an animation, animated video, reel, website animation, demo or feature video, or explainer made in code, or wants a look matched from references.
argument-hint: "[what the video is about] [style or reference]"
---

# Animator

Our own animation skill, forked from `animate` on 2026-10-07 and tracked in git in this folder (commit each improvement with a one-line message). It grows from every video we make, in any project: fold lessons back into this file, craft.md, the kits and the templates.

You make short animated videos in code: one `<canvas>`, drawn and scored procedurally, deterministic frame by frame, rendered with a headless browser and ffmpeg. The story follows a grammar studied from strong short-form animation; the look is a **style** — a plug-in kit chosen from [styles/](styles/README.md) or made from the user's references with [new-style.md](new-style.md).

**Requirements:** Node 18+, Playwright with Chromium (`npm i -g playwright && npx playwright install chromium`), ffmpeg on PATH. Check them first; if one is missing, tell the user the install command and stop. For a voice-over, Python with `faster-whisper` (`pip install faster-whisper`) times every word; without it the word times are estimated.

All paths below are relative to this skill's base directory. Pieces live in the user's project at `pieces/<name>/` (create `pieces/` if needed); styles the user makes live in `<project>/styles/<name>/`.

## Non-negotiables

1. **No animating before the storyboard is approved.** The check-ins exist because a wrong story or look costs a full build.
2. **Look at references before drawing anything** — the user's, or the style's `sample.png` and demo. Then check every key frame against [grammar/FRAME.md](grammar/FRAME.md) and the style's own checklist in its `STYLE.md`.
3. **Every factual claim on screen is checked with a web search** and listed with its source in the brief. Never claim "first" without a source.
4. **Single file, all code:** one `index.html`; everything is drawn and synthesized in code — no image/audio/video files, no `data:` URIs, no URLs, no web fonts in the code. `tools/build.mjs` enforces it. Two opt-in exceptions, both the user's own: **assets** (screenshots and logos in `<piece>/assets/`, embedded by the build) and **a music track** (joined at export). See Assets and Music below.
5. **Deterministic:** seeded randomness only (`RNG(...)`), the boil index `B` for per-step variation. Never `Math.random()` or wall-clock time.
6. **Reference media stays local.** Never commit it, copy its code, or name its artist in published output unless the user asks to credit them.
7. **"Done" is measured:** `tools/review.mjs` passes and you have looked at the contact sheets. Report the numbers, not "looks good".
8. **Ask with options.** Use AskUserQuestion with a recommended default first, so the user can answer in one click.
9. **A product tour follows the user's click path literally** — ask for it as arrows before the story check, and spotlight or click nothing they didn't name. See Product tour below.

## The flow

### 0. Intake
Ask the questions in [intake.md](intake.md) — **question 0 (what's it for: website animation, reel, product demo, explainer) first, on its own**; its row sets every later default. Then only the ones you can't infer, plus the extra questions (pace, ending, audience, files). For the look, build the gallery (`node tools/gallery.mjs <out.png> [<project>/styles]`, ~3s), show it and ask: **which of these, or show me a reference?** Then study the references yourself against FRAME.md and the style's checklist.

### 1. Story check (text, fast)
Pick the **format** from [grammar/FORMATS.md](grammar/FORMATS.md) — the plot engine decides it (a history is a chronology joined by morphs; a mission cuts on the beat; a list is a catalogue). Read [grammar/STORY.md](grammar/STORY.md). Web-check the facts. Then show the user:
- the one-line idea and the sayable device ("the spark gains a ray each era and ends as the answer")
- the format and why, the style, length, BPM
- a numbered beat table: time, what happens, the bridge into the next beat, the sound's role (where the silence is, where the loudest hit is)

Ask: **approve / change beats / different angle.** Revise until approved. This is where "I meant X, not Y" gets caught cheaply.

### 2. Look check (2–4 style frames)
Start the piece at `pieces/<name>/`: copy `piece.json` and `src/` from the style's demo (`styles/<name>/demo/`) — it already speaks the style's kit and joins eras with a morph — or from [templates/beat-cut/](templates/beat-cut/) for a piece that cuts hard on the beat (8ths, a 16th-note rush on odd frames, one era per shot, framings from cameras), or [templates/piece/](templates/piece/) for the plainest cut-paper morph, or [templates/reel/](templates/reel/) when the piece changes style along the way (see Reel below). Set `"style"` in `piece.json`, then write `brief.md` and `LOG.md` fresh (the template's are placeholders).
- **A shipped style:** read its `STYLE.md` and demo and draw with its kit.
- **The user's references:** follow [new-style.md](new-style.md). Measure the references first (`tools/measure/refs.mjs`); the piece's own style frames *are* the matched frames, so this is **one** check-in: the compare sheets and the frames together. Save the style folder after the piece is approved (the piece becomes its "proven on").

Draw 2–4 of the most different beats as full-size frames. Each must pass FRAME.md and the style's checklist. Render them side by side with `node tools/still.mjs pieces/<name> 2.25,9.75,16.5 look.png --scale 0.5` (or `tools/storyboard.mjs` with `TIMELINE.board` set to those beats), and show the image. Ask: **thumbs up per frame / change the look / try another style.**

### 3. Storyboard check (every beat)
Draw every beat in the approved look. Fill `TIMELINE.board` with one key time per beat (`{ t, title, sound, next }`) and render the board. Ask for **thumbs up/down by panel number** and notes; redraw what's down; repeat. The panels are the video's own scene functions, so nothing is redrawn later.

### 4. Build
1. Write `pieces/<name>/brief.md` (spec, style, beats, bridges, sound plan, claims + sources). Keep a `LOG.md`.
2. Animate the scenes: timed actions with `TT`, `ev(t, d)`, `popS(t)`, write-ons (see [craft.md](craft.md) → Motion). Wire eras, cameras and bridges in `src/bridges.js` (morph-joined formats) or leave `BRIDGES = []` for hard cuts.
3. `node tools/build.mjs pieces/<name>` → `index.html` (the style's kit is pulled in from `piece.json` `"style"`).
4. Test tiles while building: `node tools/tile.mjs pieces/<name> tile.png <frames...>` — look at them; tile across every morph and cut.
5. Score in `src/score.js` (see craft.md → Sound).
6. `node tools/export.mjs pieces/<name> --share` → frames, `audio.wav`, stems, `renders/final.mp4`, `renders/share.mp4` (`--formats 9:16,1:1,16:9` for every format; `--blur 4` for motion blur on 1s styles). Iterate the mix with `--only-audio` (re-renders the score and remuxes it, ~4× faster).
7. `node tools/review.mjs pieces/<name>` → contact sheets per shot, cut grid, morph grid, story arc, anchor, **text** (cut off / overlapping / under the phone UI) and **sound** (the loudest moment, the silence before it, LUFS). Fix until it passes, view the sheets, write a per-shot PASS table in `LOG.md`. Trust the text check over your eye: a cropped label looks fine on a contact sheet.

### 5. Deliver
Send `renders/share.mp4`. **Website animation:** also make the web files — `ffmpeg -i renders/final.mp4 -an -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart renders/web.mp4`, `ffmpeg -i renders/final.mp4 -an -c:v libvpx-vp9 -crf 34 -b:v 0 renders/web.webm`, `ffmpeg -i renders/final.mp4 -frames:v 1 -q:v 3 renders/poster.jpg` — and give the embed snippet `<video autoplay muted loop playsinline poster="poster.jpg"><source src="web.webm" type="video/webm"><source src="web.mp4" type="video/mp4"></video>`; check the loop seam by tiling the last and first frames. Say in a few lines: what it is, the checks' numbers, what the review caught and fixed, the weakest shot, and what you haven't verified (e.g. you can't listen to the score). Ask what should change: story, look, transitions, pacing, sound.

### 6. Learn
After each run append to the piece's `LOG.md`. If something new went wrong or worked, propose a one-line rule for [craft.md](craft.md), the style's `STYLE.md` or a kit change, and add it when the user agrees.

## Voice-over (optional)

Ask at intake (question 3). With a voice, **the voice is the clock**: each beat starts ~0.3s after the previous sentence ends, and the big moments land on spoken words. The script is the storyboard: one line per beat.
1. Write the script to `pieces/<name>/voice/script.json`: `{ "lead": 1.2, "tail": 1.8, "lines": [{ "id": "open", "text": "As it is spoken.", "after": 0.45 }, ...] }`. Write numbers and names the way they should be said. Keep it ≤ 3.5 words/s; give a line a longer `after` where the picture needs time to land (a count, a caption, the silence before the payoff).
2. **Build before the voice exists:** `node tools/voice.mjs pieces/<name> --scratch` makes a timing voice with the OS's own speech (never ship it), so the whole piece can be animated and reviewed.
3. **The takes:** one file per line, saved as `voice/<id>.mp3` with `"file"` set on the line.
   - **The ElevenLabs connector** (if the user has it: Claude's Settings → Connectors → ElevenLabs, signed in with OAuth, no API key): find 2–3 narrators that fit with its voice search, generate *one* line in each (one variation each, not four), let the user pick, then generate every line once with that voice and model. The generation result gives a short-lived download link per take: save each into `voice/`. It costs about one credit per character; say the total before the full run. If the connector was added during the session, its tools may only appear after the app restarts.
   - **The user's own recording,** one file per line (or cut from one take).
   - Never fetch a voice from a site the user didn't point to, and never clone a voice without its owner's consent.
4. `node tools/voice.mjs pieces/<name>` → `voice/voice.wav` (the lines with their pauses) and `voice.json` (every line's and word's start and end, heard in the audio by faster-whisper, locally). The build injects it as `VOICE`.
5. In the head: `VL(id)` is a line, `VW(id, word, n)` when its n-th `word` starts; beats start at the previous line's `t1 + 0.3`; `TIMELINE.narration` comes from `VOICE.lines` and `DURATION` from `VOICE.duration`. Cue Writes and flashes on the words that name them. **Put the payoff hit in a pause before the line that names it**: a hit under speech is ducked away.
6. `piece.json`: `"voice": { "file": "voice/voice.wav", "music": -12 }`. Export mixes the voice over the score (the score at `music` dB, ducked further while the voice speaks) to −14 LUFS. Review judges the story arc and the payoff window on the score alone (`renders/audio-score.wav`; a voice is louder than any hit) and the voice with its NARRATION check.
7. **Re-takes and script edits:** replace a line's file (or edit its text), rerun `voice.mjs`, rebuild: scenes cued from `VOICE` move with it. A changed word can orphan a cue that points at it; check those beats.

## Music: the user's own track (optional)

Ask at intake (question 6). Without a track the score is composed in code on a 120 BPM grid. With one:
1. Put it in the piece: `pieces/<name>/audio/track.wav` (WAV, MP3 or M4A), and in `piece.json`: `"music": { "file": "audio/track.wav", "start": 12.0, "gain": 0, "fade": 0.5 }` (`start` = where in the song the piece begins).
2. `node tools/beats.mjs pieces/<name>/audio/track.wav pieces/<name> --start 12 --dur <piece length>` → `beats.json`: the tempo, the first beat, every beat and bar, the strongest hits, the loudest moment and the drops. Pass `--bpm 128` if the user knows the tempo; check its "other tempos" line otherwise (double / half / two-thirds time is the usual miss).
3. The build injects it as `BEATS`; the starter head reads `BPM` and `GRID0` from it, and `onBeat(t)` snaps a time to the song's 8th grid. Put cuts, morphs and cues on `onBeat(...)`. **The song decides the arc:** put the turn on a drop (`BEATS.quiet`) and the payoff on its loudest hit (`BEATS.loudest`, `BEATS.hits`), not where a composed score would have put them.
4. The score (`src/score.js`) keeps only sound effects (`to = 's'`): export replaces the music bus with the track, mixes the sfx stem on top and normalises to −14 LUFS. Review's grid uses `TIMELINE.gridOffset`; its SOUND section says whether the loudest moment lands in the payoff act.
5. The browser preview still plays the composed score (no audio files in the page); the export has the track.

## Assets: real screenshots and logos (optional)

Ask at intake (question 7) when the subject is a product. Then:
- `node tools/capture.mjs <url> pieces/<name>/assets/home.png [--selector "css"] [--full] [--dark] [--hide "css"]` screenshots the user's own site (a page, a section, the logo). Ask before capturing anything they don't own. Logo files they give you go in `assets/` too (PNG, SVG, JPG, WEBP).
- `tools/build.mjs` embeds everything in `assets/` into `index.html` (the piece stays one file, and the canvas stays readable by the checks); `window.renderFrame` appears once the images are decoded, and every tool waits for it.
- Draw them with `drawAsset('home.png', x, y, w, h, { fit: 'cover' | 'contain', r })` inside the style's own framing (a torn-paper photo, an inked frame, a printed card) so they belong to the look. `asset(name)` returns the image.
- **Real product UI only:** animate the real screens (crop, push in, reveal, point at them with the hero); never draw a fake screen as if it were the product. Sample brand colours from the screenshots.

## Product tour: a walkthrough of a real app (optional)

For a feature release or demo video of any web app: the logo, then the real app in a window, toured step by step; a fixed hero bottom-left, a caption column, an outro. Proven by a 97s feature release (16:9, isometric), approved on its 4th run; the rules below are what runs 1–3 got wrong.

**Rules (each cost a rejected run):**
- **The click path is the spine.** Ask for it as arrows ("Login → on dashboard cursor goes to settings, click → …") and what each step should explain; read it back as a numbered list. Every click, scroll and toggle named, in order; nothing else spotlit. Show what they name and no more.
- **No skipped steps, no hard cuts between pages.** Login lands on the dashboard; the cursor travels; pages crossfade (0.75s) and the cursor carries over.
- **Slow.** Start from the pacing below; "too fast / too snappy / tooltips go down too fast" was runs 1–3.
- **Every step explains itself:** a callout worded from the screen's own copy (the UI's i18n file) and a caption per step. An idle cursor is a bug.
- **Third-party apps** (Claude, ChatGPT, …) are labelled hairline panels with only the labels their official docs confirm (web search, source in the brief).

**Pacing (approved):** camera `{ k: 22, d: 9.4 }` (~2s), cursor `{ k: 35, d: 11.8 }`; third-party panels `{ k: 36, d: 12 }` / `{ k: 60, d: 15.5 }`; steps 1.75–3s apart; clicks ≥1s after arrival; callouts in at +0.7s, out over 0.6s; typing 12 cps (forms), 9 (names), 30 (chat); zoom ladder per screen `FULL` → component `frameBox(b, 1.04–1.1)` → feature `1.25–1.6` → button `2.4–3.4` → click; 5–10s per screen.

**Build it:**
1. Copy [templates/product-tour/](templates/product-tour/) to `pieces/<name>/`. `src/engine.js` is the tour engine (stage, caption column, window, `screenView`, `frameBox`, `tour(img, steps, clicks)`, spotlight, callout, cursor, `typeInto`, crossfading `page()` shots, `OVERLAYS`); `src/scenes.js` holds two example pages over a placeholder screen (`assets/screen.png`) plus the logo and end scenes (`WORDMARK`, or `assets/logo.svg` if present) — replace them, one `page(name, address, caps(S), draw)` per screen with steps `{ t, view, spot, note, cur, cap }`. Name click cues `*Click` (the hero hops on them).
2. Capture with [tools/capture-kit.mjs](tools/capture-kit.mjs): the app's URL and a login from the project (ask which demo account and environment; never production data without asking), optional text swaps (e.g. the demo user's name → the presenter's), screenshots at 2160 px wide, element boxes by visible text into `src/boxes.js`. See its header. Patterns: a scrolling sidebar = a screenshot of the top plus the whole scroller unclipped as a tall strip, scrolled in the scene; an "off" or empty state = `c.ctx.route('**/endpoint', …)` patching the GET and aborting writes; a state that needs real data (a toggle) = set it, shoot, revert in `finally`; custom checkboxes = click the label text. Ask before starting a local dev server and stop it after. Demo-data changes are reverted in `finally` and checked with a screenshot. Project-specific setup (servers, accounts, helper scripts) goes in the piece's `brief.md`.
3. Look and storyboard can share one check-in (stills in pairs at `--scale 0.5`; 0.4 is too small to judge).
4. Deliver with `open -a "QuickTime Player" renders/share.mp4`; on approval `cp -n renders/share.mp4 ~/Desktop/<name>.mp4`. Feedback comes as free text: apply it literally, then re-shift cues, SHOT_LIST, acts, board, score and `piece.json` (`duration`, `frames`, `review.textIgnore`) together.

## Formats: one piece, several shapes (optional)

Ask at intake (question 2, multi-select). List them in `piece.json` `"formats": ["9:16", "1:1", "16:9"]` (the first is the main one). The starter's head reads `?format=` and sets `W`, `H`, `SAFE` and `CX`; scenes place things with `LX(fraction)`, `LY(fraction)` and size them with `UNIT`, and choose a different arrangement with `PORTRAIT` / `WIDE` where a shape needs it (a column of three on 9:16, a row of three on 16:9). Never crop a 9:16 render to 16:9.
- `node tools/export.mjs pieces/<name> --formats 9:16,1:1,16:9 --share` → `renders/final.mp4` (main) and `final-<w>x<h>.mp4` for the others.
- Review each: `node tools/review.mjs pieces/<name> --format 16:9` (and `tile` / `still` / `textcheck` / `storyboard` take `--format` too). The text check matters most here: a wide caption that fits 16:9 can run off 9:16.

## Reel: several styles in one video (optional)

A kit can't share a page with another kit (they reuse names), so a piece that changes medium — a style tour, a "how it's made" where each step has its own look — is a **reel**: several part pieces, one style each, composed per frame.
- Layout: `pieces/<name>/` holds the reel (`piece.json`, `src/head.html`, `src/score.js`) and `parts/<part>/` one ordinary piece per style (copy the style's demo). Start from [templates/reel/](templates/reel/).
- `piece.json` `"reel": { "parts": { "ink": "parts/ink", ... } }`. `tools/build.mjs` builds every part, then the reel page holds them as hidden same-origin iframes (`kit/reel.js`); every tool (tile, still, storyboard, export, review, textcheck) works on the reel unchanged.
- **One clock:** every part has the reel's `DURATION` and draws its eras at reel seconds; the reel asks the part for the frame at the same `t`. Times outside a part's eras are never shown.
- The reel head lists `REEL = [[t0, 'part', link?], ...]`: no link = a hard cut on the grid; `{ iris: [x, y], d: 0.5, r0 }` = the new part opens as a circle out of (x, y) while the old one plays on under it. A rush cycles parts on 8ths/16ths like any beat-cut piece.
- **The hero holds a shared ANCHOR** at every link (each part draws its own style's hero there on its first and last frame); `TIMELINE.anchor` checks it through the rush. Recolour each style's hero to one colour so the relay reads as one character.
- **One score**, the reel's own `src/score.js`; the parts' scores are never played (leave their body a comment).
- Parallel agents fit naturally: one agent per part (its own folder, its own style), you own the reel head and the score.

## Motion: springs and blur

- **Springs** (`kit/core.js`): `springMove(t0, a, b, SPRING.snappy)` moves a value with a little overshoot and a settle; `springTrack([[t, v], ...])` follows a value through many targets without a jump. Presets: `snappy` (UI), `smooth` (cards, camera), `heavy` (big type, logos), `playful` (mascots). Closed-form, so frames stay deterministic. On-2s styles step them every 2 frames, as they should.
- **Motion blur:** `export.mjs --blur 4` averages 4 sub-frames per frame — only for styles on 1s (`STYLE.ones`: math, isometric); hand-drawn looks on 2s are crisp on purpose (export warns).

## Parallel agents (long pieces)

A 45–60s piece has 10–15 scenes; split the drawing across agents once the storyboard is approved:
- **One `src/` file per section or era, owned by one agent** (`src/era-01.js`, `src/era-02.js`, …). List them in `piece.json` `"scenes": [...]`; they take the place of `src/scenes.js` in the build order.
- **The shared parts stay with you:** `src/head.html` (TIMELINE, eras, shots, cues), `src/bridges.js`, the score, and the kit. Agents read them but never edit them; if a scene needs a kit helper, they write it in their own file under a prefixed name.
- **Brief each agent** with the approved board panel(s), the style's `STYLE.md`, the era's time range and cue names, its bridge objects (what must be in frame at the boundary), and the rules: deterministic, no new globals without the era prefix, tile its frames and look at them.
- **`build.mjs` joins them**; you build, tile across every boundary, and run the review.

## Files

| path | what | read when |
|---|---|---|
| [intake.md](intake.md) | the questions and defaults | step 0 |
| [craft.md](craft.md) | the distilled rules: story, frame, motion, timing, sound, code, review | before step 1, and when building |
| [grammar/FORMATS.md](grammar/FORMATS.md) | 8 story formats (engine × stage × clock), invariants, which are proven | step 1 |
| [grammar/STORY.md](grammar/STORY.md) | beat-level story rules with evidence | step 1 |
| [grammar/FRAME.md](grammar/FRAME.md) | what a single key frame must hold, in any style | steps 2–3 |
| [styles/](styles/README.md) | the styles: `STYLE.md` (rules + frame checklist), `kit.js`, `sample.png`, `demo/`; the STYLE hooks contract | steps 0, 2, building |
| [new-style.md](new-style.md) | making a new style from the user's references | step 2 |
| `kit/core.js` | RNG, easing, geometry, the hand-drawn line (wobble, ink, paint, hatch, pencil, stipple, grain), cameras, time helpers | building |
| `kit/morph.js` | the renderer: eras, push-ins, zoom bumps, shape-morph bridges, overlays — draws through the style's STYLE hooks | building |
| `kit/board.js` | the storyboard renderer | steps 2–3 |
| `kit/reel.js` | the reel renderer: parts in iframes, cuts and iris links between styles | a piece in several styles |
| `kit/score-*.js` | synth (pluck, pad, drone, bass, sub, noiseHit, sweep, riser, chime, blip), loudness stage | scoring |
| [templates/](templates/) | `piece/` (an 8s cut-paper morph), `beat-cut/` (a 6s hard-cut piece with a 16th rush), `reel/` (two styles in one 8s piece, joined by an iris), `style/` (a blank style kit for new looks) | step 2 |
| `tools/` | build, tile, still, storyboard, export, review, textcheck, compare (reference vs frame), gallery, framehash (pixel-identity check), beats (a supplied track's beat map), capture (screenshots of the user's site), voice (a voice-over's lines and word times); `measure/` for references (`refs.mjs` for stills, `shotlog.py` for video) | throughout |
| [examples/history-of-ai/](examples/history-of-ai/) | a full 60s worked example (cut paper) | when unsure how something fits |
| [templates/product-tour/](templates/product-tour/) | a 22s product tour that builds as-is: the tour engine, two example pages over a placeholder screen, logo/end scenes, head, score | a product tour |
| `tools/capture-kit.mjs` | web app capture: login, text swaps, 2160-wide shots, element boxes | a product tour |

## Honesty about what's proven
Formats F2 (chronology / morph chain) and F4 (mission) have each produced a piece that passed every check from the card alone; F5 (fixed-hero journey) has several. The others are documented from study but unproven — say so when you pick one. Cut paper and crosshatch have carried full pieces; riso, sketchbook, math and pixel each come from one or two finished pieces plus a demo; isometric was made from references with new-style.md and so far has only its demo; a style made from new references is new ground until it has carried a piece. WebGL motion design (ray-marched 3D, motion blur, bloom) is not a shipped style yet.

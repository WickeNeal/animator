# Intake

Ask only what you can't infer from the request. **Question 0 always comes first, on its own:** its answer sets the defaults for everything after it (the table below), so later questions get the right recommended option. Then AskUserQuestion takes up to 4 questions per call: 1–4, then 5–8, then the extra questions 9–12 (skip the ones the request or the purpose already answers). Recommended option first. If the user said "just make it", use every default and say which you picked.

## The questions

0. **What's it for?** (AskUserQuestion, single select; "Other" covers the rest)
   - **Website animation**: a hero loop, a section illustration, a background that plays muted on a page
   - **Social reel / short**: Reels, Shorts, TikTok, a LinkedIn or feed post
   - **Product demo / feature release**: a walkthrough of a real app (SKILL.md → Product tour)
   - **Explainer / story**: a history, how something works, a little story (YouTube, a talk, docs)

   Recommend the one the request points at. Then read the row below and use it as the defaults for the rest of intake:

| purpose | shape | length | sound | loop | format | ships as |
|---|---|---|---|---|---|---|
| Website animation | 16:9 or the slot's own ratio (ask the px size) | 6–15s | none (muted autoplay) | seamless loop | F5 fixed hero or a single machine; no captions | `web.mp4` + `web.webm` (muted, small) + `poster.jpg`; or the `index.html` canvas itself |
| Social reel / short | 9:16 (+1:1, 4:5) | 15–45s | music, loud payoff | ends on a loopable frame | F4 mission / beat-cut, hook in the first 1.5s, captions burned in | `share.mp4` per format |
| Product demo / feature release | 16:9 | 60–100s | music + captions | no | Product tour (F5) | `share.mp4`, a copy on the Desktop |
| Explainer / story | 9:16 or 16:9 | 30–60s | music or voice-over | no | from FORMATS.md by the plot engine | `share.mp4` |

1. **What's it about, and what's the one true thing it should get across?**
   Free text. Also: anything that must be in it, anything to avoid. Read back your understanding in one sentence before going further — a wrong subject is the most expensive mistake ("history of AI" vs "history of AI video").

2. **Where will it go, and how long?** (multi-select for the formats — the first one picked is the main one)
   - 9:16 — Shorts / Reels / TikTok *(recommended for a history or explainer)*
   - 16:9 — YouTube / b-roll / a talk
   - 1:1 — a feed post
   - 4:5 — an Instagram / LinkedIn feed post

   Length: 20–30s for a quick social piece, 45–60s for a history or explainer. **Several formats** come from one piece: list them in `piece.json` `"formats"` and lay the scenes out with `LX` / `LY` / `UNIT` (SKILL.md → Formats). Each extra format costs a little layout work, not a new piece.

3. **Voice?**
   - Music only; the year/caption tags carry it *(recommended for a short social piece)*
   - A narrated voice-over: you write the script, the voice comes from the ElevenLabs connector (if they have it connected) or their own recording, and the picture is timed to the words (SKILL.md → Voice-over) *(recommended for an explainer over ~30s)*
   - On-screen handwritten narration

4. **The look?** *(skip the gallery when the request already names a style or brings references — go to new-style.md or the named style)* Build the gallery (`node tools/gallery.mjs <out.png> [<project>/styles]`), show it, then ask:
   - One of these: cut paper / crosshatch ink / riso print / sketchbook / math / pixel / isometric *(recommend the one that fits the subject: cut paper for histories and stories, crosshatch for Claude Code explainers, math for anything with equations or graphs, pixel for computing history, isometric for products, devices and infrastructure, riso or sketchbook for a softer editorial feel)*
   - A style they've made before (any `styles/<name>/` in their project)
   - Several styles in one video (a style tour, a "how it's made" with a medium per step): a reel (SKILL.md → Reel)
   - My own references (the gallery's last tile, "custom") — links or files (videos, stills, a web page): follow [new-style.md](new-style.md); keep the media local and uncommitted
   - Surprise me

5. **A hero?** *(ask only if the format wants one)*
   - The style's hero (cut paper: the spark, a small orange character that grows with the story; crosshatch: an ink dot with eyes; …) *(recommended)*. **For a new style from references,** propose a hero native to the medium (a red seal for woodblock prints, a cursor for terminals, a pawn for a board game) as the recommended option.
   - An existing character (describe it)
   - No hero — the subject itself is the constant

6. **Music: do you have your own track?**
   - No — compose the score in code, cut to a 120 BPM grid *(recommended unless they have one)*
   - Yes — a file (WAV / MP3 / M4A) they own or licensed. Ask for its path, the part to use (start time) and the BPM if they know it. Then SKILL.md → Music: `tools/beats.mjs` maps its beats, the cuts follow the song, and export uses the track (the score adds sound effects only). Never fetch music from a site the user didn't point to.

7. **Is it about a product, app or site — should the video show the real thing?** *(ask only when the subject is a product)*
   - Yes — real screenshots and the logo: ask for the URL (`tools/capture.mjs` screenshots it) and any logo / brand files. SKILL.md → Assets. *(recommended for a product reel)*
   - No — draw everything in the style (product screens drawn from imagination must not pretend to be the real UI)

   - **A tour of the app itself (a feature release or demo)** — SKILL.md → Product tour. Then ask, in plain text, for the **click path** as arrows and what each step should explain. Defaults: 16:9, isometric, real screenshots, music + captions.

   - **Product demo:** skip the URL question. Ask for the app's local URL, the demo login and the **click path** as arrows (plain text), plus what each step should explain.

8. **Brand rules?** *(ask only with 7 = yes)* Colours, fonts, the one accent colour, words to avoid. Defaults: sample them from the screenshots.

## Extra questions (ask the ones that matter for the purpose)

9. **Pace and energy?**
   - Calm and followable *(recommended for demos and website loops; the approved product tour needed ~2s camera settles and tooltips held 2–3s)*
   - Medium
   - Energetic, cut on the beat *(recommended for reels)*

10. **How should it end?**
    - On the logo or wordmark *(recommended for releases and reels)*
    - A call to action: the words and the URL or button text (ask)
    - A seamless loop back to the first frame *(recommended for website animations)*

11. **Who watches it, and where?** One line: e.g. "customers on our pricing page", "the team at the all-hands", "LinkedIn followers". It sets the vocabulary of the captions and how much to explain.

12. **Files to hand over?** (multi-select)
    - The MP4 to share *(always)*
    - Web-ready: muted MP4 + WebM + a poster frame *(recommended for website animations)*
    - The live canvas `index.html` to embed *(website only; it's deterministic and has no external files)*
    - Every shape listed in question 2

## Defaults when unanswered
9:16, 1080×1920, 24fps, 120 BPM (an 8th = 6 frames exactly), 30–60s, music only (composed in code), no assets, the style that fits the subject (cut paper if unsure), the style's own hero, format chosen from FORMATS.md by the plot engine.

## Pick the format yourself
Don't ask the user to choose a story format — it's grammar, not taste. A history or a process over time → chronology joined by shape morphs (F2). Someone wants something and a helper solves it → mission, cut on the beat (F4). One carried thing through many places → fixed-hero journey (F5). A question answered by a list → catalogue (F3). State the choice at the story check so they can veto it. When two formats fit (a process can be a chronology or a machine), prefer the **proven** one (see FORMATS.md status lines) and say so.

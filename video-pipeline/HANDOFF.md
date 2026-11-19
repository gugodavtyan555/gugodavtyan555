# HANDOFF — GTA ГИД video pipeline (read this first in a new chat)

**User** writes Armenian → reply in Armenian, 1–3 short sentences; when done: file + «Պատրաստ է». No long explanations unless asked.
**Channel:** «GTA ГИД» (@gta_gid, YouTube + TikTok), Russian-language videos about GTA 6 (release 19 Nov 2026). I produce finished videos: script (RU), ElevenLabs voice, edit, music/SFX, cover, upload metadata.

## Workflow (agreed)
1. User names a topic → I describe the plan (what I will make, structure, assets, music) in Armenian → user approves («հաստատում եմ») → only then build. Always do this first.
2. Deliver with `SendUserFile` `display:"attach"` from `/workspace/gugodavtyan555/dl/out/`, compressed ≤ ~55 MB (bigger files get no download button). Also send the cover as a separate image.
3. Every delivery includes: title, long description (with chapters if long), tags, hashtags, pinned comment. For AI-generated clips: on-screen note + description note + tell user to enable YouTube «Altered content».
4. Save scripts to `video-pipeline/<name>/`, commit + push to branch `claude/youthful-goodall-pk1qmc` (`git push origin HEAD:claude/youthful-goodall-pk1qmc`). No PRs unless asked. Never commit `dl/` (gitignored) or large media.

## Standing rules (from the user)
- **ALWAYS add music to every video** (user complained when missing). Ask for the Pixabay mp3 BEFORE final render; `five/build.py OUT.mp4 music.mp3` does ducked mix. Never deliver a video without music unless the user says so.
- **Cover = channel style**: `doc/cover.py make3(out, frame_1080x1920, 'LINE1', 'LINE2', 'GTA 6 • CHIP')` (GTA VI logo on top from `assets/logo.png`, 3D 2-line text, pink chip). Use it as the first 0.4 s frame AND send as separate image. Never invent another style.
- Save limits: don't view images unless needed (verify programmatically, ONE contact sheet), read each file once, reuse code, no code in chat, re-render only changed parts, no web search unless needed. Quality matters more than saving — use tools when needed.
- Videos > 1 min (user later allowed 2–3 min for narrated ones). No repeated footage between videos where possible (fresh official footage is nearly exhausted → say so honestly in one sentence).
- Shorts start with a bright 3D-text cover frame (first 0.4 s), content in safe area y≈250–1670 (of 1920). Text must not cover the main picture; no frozen clips; no wrong/mismatched scenes («այլևս սխալներ չանես»).
- Only official Rockstar media, open-licence stock (Pixabay, Wikimedia CC) and user-provided clips; never leaked footage / copyrighted music. Don't claim "Rockstar confirmed" without an official source; verify facts by search and say "по данным…" when unsure.
- Never print keys. ElevenLabs/Netlify keys are proxy-injected (header `xi-api-key: dummy`, `Authorization: Bearer dummy`). `PIXABAY_KEY` env var. User's Telegram bot token leaked in a screenshot — never repeat it.
- User wants "most professional, unrepeatable" results: beat-synced cuts, speed ramps, 3D number slams, captions, sound design. Transition SFX must be soft (synth noise whooshes were rejected → use ElevenLabs `/v1/sound-generation` samples, low gain).
- New workflow idea (user): I give real images + prompts → user generates clips in Veo 3/Flow → sends clips → I edit. Use ONLY open-licence photos (Wikimedia CC/PD) as Veo inputs, not Rockstar screenshots (derivative-art risk). Veo clips arrive 720×1280, 24 fps, ~7.9 s, with audio (strip it with `-an`).

## Voice / music
- Voice: ElevenLabs **Callum** `N2lVS1w4EtoT3dr4eOWO`, model `eleven_v3`, `language_code ru`, `voice_settings {stability:0.0, speed 1.05–1.08}`, tags `[excited]`/`[dramatic]`; endpoint `/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128`. Write names phonetically («ГТА шесть», «Рокстар»). ~9k characters left this month at last check (`/v1/user/subscription`).
- Music: user downloads from Pixabay Music and uploads the mp3 (Pixabay is behind Cloudflare, no API; don't circumvent). Used so far: «Brazilian Phonk» (MondaMusic, 98 bpm), «The Mountain» (synthwave, 90 bpm), «Kulakovka» (dark synthwave, 100 bpm). Beat grid via numpy onset search (bpm + phase), see `top5/` and `doc/`.

## Tools in repo (video-pipeline/)
- `doc/` — narrated documentary engine (vertical 9:16): `script.json` (segments), TTS → `tts/<id>.mp3/json`, `doc.py` (scenes by cue words, photo Ken Burns / `fit` mode / official footage / AI clips, counters, plates, 3D numbers, captions), `audio_doc.py` (music crossfade, ducking, SFX), cover via `cover.py` (`cover.make3(out, frame_png, line1, line2, chip)`). Run `python3 doc.py plan`, `K=1.0 python3 doc.py seg <id>` per segment (parallel ≤3), concat with ffmpeg, 2-pass encode to ≈2.25 Mbps for 55 MB.
- `top5/` — beat-synced hype Short (render.py/audio.py/tl.py). `edit1/` — beat edit renderer. `story1/`, `map/`, `short*/`, `long/` — earlier engines (see README.md).
- `footage/footage.py` + `catalog.json` — scene catalog of official sources, `used` / `pick` to avoid repeats. `assets/` — Wikimedia/Pixabay fetchers + `CREDITS.md`.
- `ideas-log.md` — daily idea log (daily scheduled task «GTA ГИД - идеи» 07:30 Asia/Yerevan; needs the repo added as a source in the routine).

## Environment facts / gotchas
- New chat = fresh container: `dl/` (trailers, images, outputs) and scratchpad are GONE. Re-create: official videos from rockstargames.com/VI/media/videos (allowed hosts: www.rockstargames.com, media-rockstargames-com.akamaized.net); sources used: Trailer 1 (A), Trailer 2 (T, crop 3072:1728:384:216), Launch Trailer (L, crop 3412:1920:214:120), «An Extended Look» (X, 14 GB gameplay, 1608 s; download with `curl -C -` retry loop, HTTP/2 errors). Official screenshots in `dl/img/` (Hero_FG cut-outs, Lucia_Caminos_*, Jason_Duval_*, Jason_and_Lucia_*, Leonida_Keys_*, Vice_City_*). Wikimedia photos via `assets/fetch_commons.py`. Allowed hosts also: commons/upload.wikimedia.org, pixabay.com, cdn.pixabay.com, elevenlabs.io, www.youtube.com, i.ytimg.com; en.wikipedia.org is NOT reachable (use WebSearch).
- 16 GB RAM shared: decode 4K one process at a time per ffmpeg (≤3 render processes), avoid `np.convolve` with big kernels (use cumsum moving average).
- Render speed: 1440×2560 ≈ 0.6–0.8 s/frame; 1080×1920 with `-preset veryfast -crf 12` intermediates ≈ 3× faster. Long videos: render per segment, concat.
- X footage map (s): 13–350 raid; 380–470 apartment; 472–548 convertible drive; 560–700 rooftop dinner; 700–735 store robbery; 750–940 chase; 950–1010 garage; 1020–1156 free roam (airboat 1030, diving 1036, gym 1039, binoculars 1047, kayak 1049, nightclub 1051–1061, race 1062–1067, livestream 1104, range 1111, motocross 1115, parachute 1127–1138); 1156–1320 party; 1320–1550 heist; 1552–1600 ending. Used ranges are computed by `footage.py used`.

## Published / delivered so far
Pilot, 12-min «GTA 6: всё, что нужно знать ПЕРЕД РЕЛИЗОМ», map guide long video, many Shorts (countdown, details, split-screen Miami, story «13 лет ожидания» part 1), hype edit «ОСТАЛОСЬ 2 ДНЯ», Top-5 «5 вещей в первые 10 минут», documentary «Вайс-Сити: город, которого нет на карте» (2:55, Veo clips + synthwave).

## Verified facts (reuse, with sources)
Vice City (2002) set in 1986, inspired by Miami Vice/Scarface; 17.5 M copies (Take-Two 2008 figure); Mariel boatlift Apr–Oct 1980 ≈125,000 arrivals; GTA 6 leak Sept 2022 (~90 videos, Rockstar confirmed 19 Sept); Trailer 1 Dec 2023 — 90,421,491 views in 24 h (Guinness); delays: fall 2025 → 26 May 2026 (announced 2 May 2025) → 19 Nov 2026 (announced 6 Nov 2025); protagonists Lucia & Jason, state Leonida. Unverified (flag if used): "$5 million" damage figure, 212 GB size, exact release hour.

## Open items
Story series «13 лет ожидания» parts 2–3 not made; daily routine needs repo source; PR #2 still open (base `claude/earn-one-dram-per-second-1narbb`); optional Netlify link for full-quality map guide; user may want a 2K version of the Vice City story (was 1080p for the 55 MB limit).

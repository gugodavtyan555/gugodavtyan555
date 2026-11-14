# Video pipeline (GTA commentary videos)

Builds a narrated 1080p video from official trailer footage, screenshots, ElevenLabs voice,
animated overlays, and a synthesized music/SFX bed.

Expected layout (all relative to this folder's parent work dir):

- `full/` — `full3.py`, `audio.py`, `script.json`, `tts/<id>.mp3` + `tts/<id>.json` (ElevenLabs
  `/with-timestamps` output per script segment)
- `dl/trailers/` — source videos from rockstargames.com/VI/media/videos
  (`GTAVI_Trailer_1_1080.mp4` proxy, `GTAVI_Trailer_2.mp4`, `GTAVI_Launch_Trailer.mp4`)
- `dl/img/` — official screenshots named `<Name>_<NN>.jpg`

Steps:

1. Write `script.json` (segments with `id`, `ch`, `text`) and generate TTS for each segment.
2. Edit `PLAN` in `full3.py`: per segment, footage groups with narration cue words, chips, cards.
3. `python3 full3.py plan` → timeline; `python3 full3.py clips` → `bg.mp4`.
4. `python3 audio.py` → `music.wav`, `sfx.wav`; mix with the voice track into `mix.wav` (ffmpeg,
   sidechain-ducked music).
5. `python3 full3.py still <t...>` to preview frames, `python3 full3.py render out.mp4` for the final file.

`sheet.py <name> <duration>` builds a timestamped scene contact sheet for choosing footage.
Source footage and rendered videos are not stored in the repo.

## Fresh footage (no repeated shots)

`footage/footage.py` keeps a catalog of every scene in the four official videos (`footage/catalog.json`) and scans
all plan files for source ranges that earlier videos already used. Before choosing shots for a new video:

```bash
export FOOTAGE_DIR=<folder with GTAVI_*_1080.mp4 proxies>
python3 footage/footage.py pick X 15 --len 3 --seed 7      # fresh shots from the 27-min gameplay video
python3 footage/footage.py pick A 6 --len 2                # A=Trailer 1, T=Trailer 2, L=Launch Trailer
python3 footage/footage.py used                            # how much of each source is already used
```

It prints ready-to-paste `V(X, a, b, cx)` entries (overlap with earlier videos < 15 %, bright scenes only, crop
centre estimated from image detail). Look at one contact sheet before rendering: the centre is a heuristic.
Rule: at least 80 % of the shots in a new video must come from `pick`.

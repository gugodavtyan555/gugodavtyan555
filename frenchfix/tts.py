#!/usr/bin/env python3
"""Usage: tts.py <episode_dir>  — reads script.json, writes audio/*.mp3 (cached), timeline.json, voice.wav"""
import sys, json, os, base64, subprocess, urllib.request, hashlib
ep = sys.argv[1]
S = json.load(open(f"{ep}/script.json"))
VO = {"en": ("JBFqnCBsd6RMkjVDRZzb", "eleven_multilingual_v2", None),
      "fr": ("nPczCjzI2devNBz1zQrb", "eleven_multilingual_v2", None),
      "frf": ("XB0fDUnXU5powFXDhCwa", "eleven_turbo_v2_5", "fr")}
def tts(text, lang):
    vid, model, lc = VO[lang]
    h = hashlib.md5(f"{vid}{model}{text}".encode()).hexdigest()[:10]
    mp3, js = f"{ep}/audio/{h}.mp3", f"{ep}/audio/{h}.json"
    if not os.path.exists(js):
        body = {"text": text, "model_id": model,
                "voice_settings": {"stability": 0.35, "similarity_boost": 0.85, "style": 0.55, "use_speaker_boost": True}}
        if lc: body["language_code"] = lc
        r = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_128",
            data=json.dumps(body).encode(), headers={"xi-api-key": "dummy", "Content-Type": "application/json"})
        d = json.load(urllib.request.urlopen(r))
        open(mp3, "wb").write(base64.b64decode(d["audio_base64"]))
        json.dump(d["alignment"], open(js, "w"))
    return mp3, json.load(open(js))
def words(al):
    out, cur, st = [], "", None
    for c, s, e in zip(al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]):
        if c.isspace():
            if cur: out.append([cur, st, pe]); cur = ""
        else:
            if not cur: st = s
            cur += c; pe = e
    if cur: out.append([cur, st, pe])
    return out
t, tl, inputs, filt = S.get("lead", 0.3), [], [], []
for i, seg in enumerate(S["segments"]):
    mp3, al = tts(seg["text"], seg["lang"])
    dur = float(subprocess.check_output(["ffprobe", "-v", "0", "-show_entries", "format=duration", "-of", "csv=p=0", mp3]))
    tl.append({**seg, "start": round(t, 3), "end": round(t + dur, 3),
               "words": [[w, round(t + a, 3), round(t + b, 3)] for w, a, b in words(al)]})
    inputs += ["-i", mp3]; filt.append(f"[{i}]adelay={int(t*1000)}:all=1[a{i}]")
    t += dur + seg.get("pause", 0.25)
total = round(t + S.get("tail", 1.0), 3)
n = len(tl)
fc = ";".join(filt) + ";" + "".join(f"[a{i}]" for i in range(n)) + f"amix=inputs={n}:normalize=0,apad=whole_dur={total}[o]"
subprocess.check_call(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", fc, "-map", "[o]", "-ar", "44100", "-ac", "2", f"{ep}/voice.wav"])
json.dump({"total": total, "segments": tl}, open(f"{ep}/timeline.json", "w"), ensure_ascii=False, indent=1)
print("total", total)

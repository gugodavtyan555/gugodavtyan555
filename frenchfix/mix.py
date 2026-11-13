#!/usr/bin/env python3
"""Usage: mix.py <episode_dir> <music.mp3> — voice + looped music + synthesized sfx → mix.wav"""
import sys, json, subprocess, wave, numpy as np
ep, music = sys.argv[1], sys.argv[2]
T = json.load(open(f"{ep}/timeline.json")); sr = 44100; n = int(T["total"] * sr); x = np.zeros(n)
def add(t0, s):
    i = int(t0 * sr); s = s[:max(0, n - i)]; x[i:i + len(s)] += s
def thud():
    t = np.arange(int(.45 * sr)) / sr
    return .9 * np.sin(2 * np.pi * (110 * np.exp(-t * 9) + 45) * t) * np.exp(-t * 9) + .25 * np.sign(np.sin(2 * np.pi * 150 * t)) * np.exp(-t * 14)
def ding():
    t = np.arange(int(.9 * sr)) / sr
    return .35 * (np.sin(2 * np.pi * 1318.5 * t) + .6 * np.sin(2 * np.pi * 1975.5 * t) + .3 * np.sin(2 * np.pi * 2637 * t)) * np.exp(-t * 6)
def whoosh():
    t = np.arange(int(.4 * sr)) / sr; z = np.random.default_rng(1).standard_normal(len(t))
    k = 60; z = np.convolve(z, np.ones(k) / k, "same") * 6
    return .35 * z * np.sin(np.pi * t / .4) ** 2
S = {s["id"]: s for s in T["segments"]}
for sid, s in S.items():
    if sid.endswith("a") or sid == "out": add(s["start"] - .25, whoosh())
    if sid.endswith("c"): add(s["start"] - .02, thud())
    if sid.endswith("e"): add(s["start"] - .12, ding())
w = wave.open(f"{ep}/sfx.wav", "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
w.writeframes((np.clip(x, -1, 1) * 32767 * .6).astype("<i2").tobytes()); w.close()
tot = T["total"]
subprocess.check_call(["ffmpeg", "-y", "-v", "error", "-i", f"{ep}/voice.wav", "-stream_loop", "-1", "-i", music, "-i", f"{ep}/sfx.wav",
  "-filter_complex", f"[0]volume=1.7[v];[1]volume=0.055,afade=t=in:d=0.4,afade=t=out:st={tot-1.5}:d=1.5[m];[2]volume=0.8[s];[v][m][s]amix=inputs=3:normalize=0:duration=first,alimiter=limit=0.95[o]",
  "-map", "[o]", "-t", str(tot), f"{ep}/mix.wav"])
print("mix ok")

#!/usr/bin/env python3
"""Mix: bought-in track (looped on the beat) + Callum voice (ducking) + synthesized whoosh/impact/riser. -> mix.wav"""
import numpy as np, wave, subprocess, sys, os, json
from tl import *
SR = 44100; rng = np.random.default_rng(7)
def load(p, ch=2):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', p, '-ar', str(SR), '-ac', str(ch), '-f', 'f32le', '/tmp/_a.raw'], check=True)
    a = np.fromfile('/tmp/_a.raw', dtype=np.float32); return a.reshape(-1, ch) if ch > 1 else a
trk = load(HERE + '/track.mp3')
def tb(j): return int(round((0.604 + j * P) * SR)) if False else int(round((DROP + (j - 7) * P) * SR))
# music: pre-drop 0..drop, body part1 track beats 7..63, part2 beats 7..47
pre = trk[:tb(7)]; p1 = trk[tb(7):tb(63)]; p2 = trk[tb(7):tb(47)]
music = np.concatenate([pre, p1, p2], 0)
# soften the seam with a 12 ms dip
s0 = len(pre) + len(p1); d = int(0.012 * SR); music[s0 - d:s0 + d] *= np.linspace(0.55, 1, 2 * d)[:, None] ** 0.5
N = int(TOTAL * SR); mus = np.zeros((N, 2), np.float32); mus[:min(N, len(music))] = music[:N]
fo = int(0.4 * SR); mus[N - fo:] *= np.linspace(1, 0, fo)[:, None]
mus *= 0.9 / max(1e-6, np.abs(mus).max())
# voice
voice = np.zeros(N, np.float32)
for seg, t0 in VOICE_START.items():
    v = load(f'{HERE}/tts/{seg}.mp3', 1); i = int(t0 * SR); v = v[:max(0, N - i)]; voice[i:i + len(v)] += v
voice *= 0.95 / max(1e-6, np.abs(voice).max())
act = np.convolve(np.abs(voice), np.ones(int(0.12 * SR)) / int(0.12 * SR), 'same'); act = np.clip(act / 0.03, 0, 1)
act = np.convolve(act, np.ones(int(0.18 * SR)) / int(0.18 * SR), 'same')
gain = 0.62 - 0.30 * act
# the silence before #1: music out for 0.4 s, then a hit
t1 = beat(76); a0 = int((t1 - 0.4) * SR); a1 = int(t1 * SR); gain[a0:a1] *= np.linspace(1, 0, a1 - a0) ** 2
gain[a1:a1 + int(0.15 * SR)] *= np.linspace(0.3, 1, int(0.15 * SR))
# SFX
def noise(n): return rng.standard_normal(n).astype(np.float32)
def shape(x, f): # FFT shaping with f(freqs)->gain
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / SR); return np.fft.irfft(X * f(fr), len(x)).astype(np.float32)
def whoosh(d=0.5, up=False):
    n = int(d * SR); x = noise(n); t = np.linspace(0, 1, n)
    y = np.zeros(n, np.float32); k = 6; seg = n // k
    for i in range(k):
        c = 500 + 5500 * (((i + .5) / k) if up else (1 - (i + .5) / k)); sl = slice(i * seg, (i + 2) * seg if i < k - 1 else n)
        s = x[sl]; y[sl] += shape(s, lambda f: np.exp(-((np.log2(f + 1) - np.log2(c)) ** 2) / 0.8)) * np.hanning(len(s)).astype(np.float32)
    env = np.sin(np.pi * t) ** 2; y *= env; return y / max(1e-6, np.abs(y).max()) * 0.8
def impact(d=0.9):
    n = int(d * SR); t = np.arange(n) / SR; f = 45 + 110 * np.exp(-t * 14); ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.exp(-t * 4.5) + 0.5 * shape(noise(n), lambda f: np.exp(-f / 2500)) * np.exp(-t * 18)
    return (y / np.abs(y).max() * 0.95).astype(np.float32)
def riser(d=1.5):
    n = int(d * SR); t = np.linspace(0, 1, n); x = noise(n); y = np.zeros(n, np.float32); k = 12; seg = n // k
    for i in range(k):
        c = 300 + 7000 * ((i + .5) / k) ** 2; sl = slice(i * seg, (i + 2) * seg if i < k - 1 else n); s = x[sl]
        y[sl] += shape(s, lambda f: np.exp(-((np.log2(f + 1) - np.log2(c)) ** 2) / 0.6)) * np.hanning(len(s)).astype(np.float32)
    return y / max(1e-6, np.abs(y).max()) * (t ** 2) * 0.9
sfx = np.zeros(N, np.float32)
def put(x, t, g=1.0):
    i = int(t * SR)
    if i < 0 or i >= N: return
    x = x[:N - i]; sfx[i:i + len(x)] += x * g
whs = [whoosh(0.45), whoosh(0.35, True), whoosh(0.55)]
tlj = json.load(open(HERE + '/events.json')) if os.path.exists(HERE + '/events.json') else {}
for e in tlj.get('whoosh', []): put(whs[int(e * 7) % 3], e - 0.18, 0.55)
for e in tlj.get('impact', []): put(impact(), e, 0.9)
for e in tlj.get('freeze', []): put(impact(0.5), e, 0.55); put(whoosh(0.4, True), e - 0.3, 0.5)
put(riser(1.6), beat(8) - 1.6, 0.8); put(impact(1.2), beat(8), 1.0)   # the drop
put(riser(0.4), t1 - 0.4, 0.8); put(impact(1.3), t1, 1.0)                # #1
out = mus * gain[:, None] + voice[:, None] * 1.0 + sfx[:, None] * 0.7
out = np.tanh(out * 1.1) * 0.95
out16 = (np.clip(out, -1, 1) * 32767).astype(np.int16)
wf = wave.open(HERE + '/mix.wav', 'wb'); wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes(out16.tobytes()); wf.close()
print('mix', round(N / SR, 2), 's')

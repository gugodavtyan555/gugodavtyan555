#!/usr/bin/env python3
"""Doc audio: synthwave m1 -> dark synthwave m2 (crossfade at the AI day chapter), Callum voice with ducking, whoosh/impact."""
import numpy as np, wave, subprocess, json, os, sys
import doc
SR = 44100; rng = np.random.default_rng(11); HERE = doc.HERE
def load(p, ch=2):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', p, '-ar', str(SR), '-ac', str(ch), '-f', 'f32le', '/tmp/_b.raw'], check=True)
    a = np.fromfile('/tmp/_b.raw', dtype=np.float32); return a.reshape(-1, ch) if ch > 1 else a
N = int(doc.TOTAL * SR)
m1 = load(HERE + '/m1.mp3'); m2 = load(HERE + '/m2.mp3')
t7 = doc.START['d7'] - 1.5; xf = int(2.5 * SR); i7 = int(t7 * SR)
mus = np.zeros((N, 2), np.float32); a = m1[:i7 + xf]; mus[:len(a)] = a[:N]
b = m2[:N - i7]; seg = mus[i7:i7 + len(b)]
fade = np.linspace(0, 1, xf)[:, None]; seg[:xf] *= (1 - fade); b2 = b.copy(); b2[:xf] *= fade; seg += b2[:len(seg)]
mus[:min(N, int(0.5*SR))] *= np.linspace(0.3, 1, min(N, int(0.5*SR)))[:, None]
fo = int(1.2 * SR); mus[N - fo:] *= np.linspace(1, 0, fo)[:, None]
mus *= 0.9 / np.abs(mus).max()
voice = np.zeros(N, np.float32)
for sid in doc.IDS:
    v = load(f'{HERE}/tts/{sid}.mp3', 1); i = int(doc.START[sid] * SR); v = v[:max(0, N - i)]; voice[i:i + len(v)] += v
voice *= 0.95 / np.abs(voice).max()
def ma(x, n):
    c = np.cumsum(np.concatenate([np.zeros(1, np.float64), x.astype(np.float64)])); y = np.zeros(len(x)); h = n // 2
    lo = np.clip(np.arange(len(x)) - h, 0, len(x)); hi = np.clip(np.arange(len(x)) + n - h, 0, len(x)); return ((c[hi] - c[lo]) / np.maximum(1, hi - lo)).astype(np.float32)
act = np.clip(ma(np.abs(voice), int(0.12 * SR)) / 0.03, 0, 1); act = ma(act, int(0.25 * SR)); gain = 0.55 - 0.30 * act
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
def smp(n):
    x = load(f'{HERE}/sfx/{n}.mp3', 1); return (x / max(1e-6, np.abs(x).max()) * 0.9).astype(np.float32)
whs = [smp('w1'), smp('w2'), smp('w3')]; boom = smp('b1')
ev = json.load(open(HERE + '/events.json'))
for k, e in enumerate(ev['whoosh']): put(whs[k % 3], e - 0.25, 0.30)
for e in ev['impact']: put(boom, e, 0.45)
out = mus * gain[:, None] + voice[:, None] + sfx[:, None] * 0.6
out = np.tanh(out * 1.1) * 0.95; o16 = (np.clip(out, -1, 1) * 32767).astype(np.int16)
wf = wave.open(HERE + '/mix.wav', 'wb'); wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes(o16.tobytes()); wf.close(); print('mix', round(N / SR, 1))

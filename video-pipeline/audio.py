#!/usr/bin/env python3
"""Procedural synthwave bed + transition SFX, synced to timeline.json. Writes music.wav and sfx.wav (stereo, 44.1k)."""
import json, os, wave
import numpy as np
ROOT = os.path.dirname(os.path.abspath(__file__))
tl = json.load(open(os.path.join(ROOT, 'timeline.json')))
SR = 44100; TOTAL = tl['total']; N = int(TOTAL * SR) + SR
rng = np.random.default_rng(7)
BPM = 96.0; BEAT = 60 / BPM; BAR = 4 * BEAT
T0 = tl['sting'] + 0.9 - 8 * BAR          # align a bar line with the title hit
while T0 > 0: T0 -= BAR

def fft_filter(x, lo=None, hi=None, soft=0.25):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); g = np.ones_like(f)
    if hi: g *= 1 / (1 + (f / hi) ** 4)
    if lo: g *= 1 - 1 / (1 + (f / lo) ** 4)
    return np.fft.irfft(X * g, len(x))
def saw(freq, n, det=0.0):
    ph = (np.arange(n) * freq * (1 + det) / SR) % 1.0; return 2 * ph - 1
def place(buf, sig, t, gain=1.0):
    i = int(t * SR)
    if i >= len(buf) or i + len(sig) <= 0: return
    a = max(0, -i); i = max(0, i); n = min(len(sig) - a, len(buf) - i)
    if n > 0: buf[i:i + n] += sig[a:a + n] * gain
def note(m): return 440.0 * 2 ** ((m - 69) / 12)

# A minor: Am - F - C - G (one bar each)
CH = [(45, [57, 60, 64]), (41, [53, 57, 60]), (48, [55, 60, 64]), (43, [55, 59, 62])]
nbars = int((TOTAL - T0) / BAR) + 2
pad = np.zeros(N); bass = np.zeros(N); arp = np.zeros(N); kick = np.zeros(N); snare = np.zeros(N); hat = np.zeros(N)

# one-shot samples
n = int(0.32 * SR); tt = np.arange(n) / SR
KICK = np.sin(2 * np.pi * (45 * tt + (120 - 45) * 0.045 * (1 - np.exp(-tt / 0.045)))) * np.exp(-tt / 0.11)
n = int(0.22 * SR); tt = np.arange(n) / SR
SN = fft_filter(rng.standard_normal(n), lo=900, hi=6500) * np.exp(-tt / 0.06) + 0.5 * np.sin(2 * np.pi * 185 * tt) * np.exp(-tt / 0.04)
n = int(0.06 * SR); tt = np.arange(n) / SR
HAT = fft_filter(rng.standard_normal(n), lo=7000) * np.exp(-tt / 0.014)

for b in range(nbars):
    t0 = T0 + b * BAR; root, tri = CH[b % 4]
    # pad: detuned saws, slow attack/release
    n = int((BAR + 0.6) * SR); tt = np.arange(n) / SR
    env = np.minimum(1, tt / 0.5) * np.minimum(1, (BAR + 0.6 - tt) / 0.6)
    sig = sum(saw(note(m), n, d) for m in tri for d in (-0.004, 0.004)) / 6
    place(pad, sig * env, t0)
    # bass: 8th notes
    for k in range(8):
        n = int(BEAT / 2 * SR); tt = np.arange(n) / SR
        s = (0.6 * saw(note(root - 12), n) + 0.5 * np.sin(2 * np.pi * note(root - 12) * tt)) * np.exp(-tt / 0.16) * np.minimum(1, tt / 0.004)
        place(bass, s, t0 + k * BEAT / 2, 1.0 if k % 2 == 0 else 0.7)
    # arp: 16ths over chord tones
    seq = [tri[0], tri[1], tri[2], tri[1] + 12, tri[2], tri[1], tri[0] + 12, tri[1]] * 2
    for k, m in enumerate(seq):
        n = int(0.3 * SR); tt = np.arange(n) / SR; f = note(m + 12)
        s = (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(4 * np.pi * f * tt) + 0.15 * saw(f, n)) * np.exp(-tt / 0.07) * np.minimum(1, tt / 0.003)
        place(arp, s, t0 + k * BEAT / 4, 0.9 if k % 4 == 0 else 0.6)
    for k in range(4):
        place(kick, KICK, t0 + k * BEAT)
        if k % 2 == 1: place(snare, SN, t0 + k * BEAT)
    for k in range(8): place(hat, HAT, t0 + k * BEAT / 2 + BEAT / 4, 1.0 if k % 2 else 0.6)

pad = fft_filter(pad, hi=1500); bass = fft_filter(bass, hi=420)
d = int(0.75 * BEAT * SR)                                   # dotted-eighth echo on the arp
for _ in range(3): arp[d:] += 0.38 * arp[:-d]
arp = fft_filter(arp, lo=300, hi=5000)

# sidechain pump from the kick grid
tg = (np.arange(N) / SR - T0) % BEAT
pump = 1 - 0.55 * np.exp(-tg / 0.12)

def env_from(points):
    """piecewise-linear automation: [(time, value), ...]"""
    ts = [p[0] for p in points]; vs = [p[1] for p in points]
    return np.interp(np.arange(N) / SR, ts, vs)
st = tl['sting']; hit = st + 0.9; ch = {int(k): v for k, v in tl['chapters'].items()}; c5a, c5b = ch[5]; out = tl['outro']
drums_e = env_from([(0, 0), (hit - 0.01, 0), (hit, 1), (c5a - 0.3, 1), (c5a + 0.6, 0.55), (c5b - 0.5, 0.55), (c5b, 1), (TOTAL - 2.0, 1), (TOTAL - 0.3, 0)])
bass_e = env_from([(0, 0), (st - 6, 0), (st - 0.2, 0.7), (st, 0), (hit - 0.01, 0), (hit, 1), (TOTAL - 2.0, 1), (TOTAL - 0.3, 0)])
arp_e = env_from([(0, 0.0), (1.5, 0.8), (st - 0.1, 1.0), (st, 0), (hit - 0.01, 0), (hit, 0.75), (c5a, 0.75), (c5a + 0.6, 0.35), (c5b - 0.5, 0.35), (c5b, 0.8), (out, 1.0), (TOTAL - 2.0, 1), (TOTAL - 0.3, 0)])
pad_e = env_from([(0, 0), (1.0, 1), (st, 1), (st + 0.05, 0.25), (hit, 1), (TOTAL - 2.0, 1), (TOTAL - 0.2, 0)])

mono = 0.55 * pad * pad_e * pump + 0.9 * bass * bass_e * pump + 0.9 * kick * drums_e + 0.42 * snare * drums_e + 0.16 * hat * drums_e
arpm = 0.34 * arp * arp_e
dl = int(0.011 * SR)
Lc = mono + arpm + 0.25 * pad * pad_e; Rc = mono + np.concatenate([np.zeros(dl), arpm[:-dl]]) - 0.0 * pad
Rc += 0.25 * np.concatenate([np.zeros(dl * 2), (pad * pad_e)[:-dl * 2]])
music = np.stack([Lc, Rc], 1)[:int(TOTAL * SR)]; music /= np.abs(music).max() / 0.8

# ---------------- SFX
sfx = np.zeros(N)
def whoosh(dur=0.55):
    n = int(dur * SR); x = rng.standard_normal(n); tt = np.arange(n) / n
    cut = 400 * (9000 / 400) ** np.sin(np.pi * tt) ** 1.5      # sweep up then down
    y = np.zeros(n); s = 0.0
    a = 1 - np.exp(-2 * np.pi * cut / SR)
    for i in range(n): s += a[i] * (x[i] - s); y[i] = s
    return (y - fft_filter(y, hi=250)) * np.sin(np.pi * tt) ** 2
def impact(dur=1.4):
    n = int(dur * SR); tt = np.arange(n) / SR
    sub = np.sin(2 * np.pi * (34 * tt + (95 - 34) * 0.09 * (1 - np.exp(-tt / 0.09)))) * np.exp(-tt / 0.45)
    nz = fft_filter(rng.standard_normal(n), hi=1800) * np.exp(-tt / 0.12)
    tail = fft_filter(rng.standard_normal(n), lo=1500, hi=7000) * np.exp(-tt / 0.5) * 0.12
    return sub + 0.6 * nz + tail
def riser(dur=2.2):
    n = int(dur * SR); tt = np.arange(n) / n; x = rng.standard_normal(n)
    y = np.zeros(n); s = 0.0; a = 1 - np.exp(-2 * np.pi * (300 * (10000 / 300) ** tt) / SR)
    for i in range(n): s += a[i] * (x[i] - s); y[i] = s
    tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (2 * tt)) / SR) * 0.15
    return (y + tone) * tt ** 2
def pop():
    n = int(0.09 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * (700 * tt + 500 * tt ** 2 / 0.09)) * np.exp(-tt / 0.02)
WH, IM, RI, PO = whoosh(), impact(), riser(), pop()
WH /= np.abs(WH).max(); IM /= np.abs(IM).max(); RI /= np.abs(RI).max()
for t in tl['bumps']: place(sfx, WH, t - 0.22, 0.55); place(sfx, IM, t + 0.02, 0.5)
for t in tl['cards']: place(sfx, WH, t - 0.2, 0.32)
for t in tl['chips']: place(sfx, PO, t, 0.16)
place(sfx, RI, hit - 2.2, 0.5); place(sfx, IM, hit, 0.95)
sfx = sfx[:int(TOTAL * SR)]; sfx = np.stack([sfx, sfx], 1)

def save(name, x):
    w = wave.open(os.path.join(ROOT, name), 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes()); w.close()
save('music.wav', music); save('sfx.wav', sfx); print('audio ok', round(TOTAL, 2), 'bar0', round(T0, 3), 'hit', round(hit, 2))

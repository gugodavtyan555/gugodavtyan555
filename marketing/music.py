# Original lo-fi beat, synthesized from scratch (no samples, no copyright).
import numpy as np, wave
SR, DUR, BPM = 44100, 44.0, 96
n = int(SR * DUR); t = np.arange(n) / SR
beat = 60 / BPM; out = np.zeros((n, 2))
def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR); j = min(n, i + len(sig))
    if i >= n: return
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    out[i:j, 0] += sig[:j - i] * gain * l; out[i:j, 1] += sig[:j - i] * gain * r
def env(L, a=0.005, d=0.2):
    x = np.arange(int(L * SR)) / SR; return np.minimum(1, x / a) * np.exp(-x / d)
def kick():
    L = 0.45; x = np.arange(int(L * SR)) / SR
    f = 50 + 90 * np.exp(-x * 25); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 7)
def snare():
    L = 0.25; x = np.arange(int(L * SR)) / SR; rng = np.random.default_rng(1)
    nz = rng.standard_normal(len(x)); nz = np.convolve(nz, [1, -0.9], "same")
    return (0.6 * nz + 0.4 * np.sin(2 * np.pi * 190 * x)) * np.exp(-x * 18)
def hat():
    L = 0.06; x = np.arange(int(L * SR)) / SR; rng = np.random.default_rng(2)
    nz = np.diff(rng.standard_normal(len(x) + 1)); return nz * np.exp(-x * 60)
def note(freq, L, d=1.2, bright=3):
    x = np.arange(int(L * SR)) / SR
    s = sum(np.sin(2 * np.pi * freq * k * x) / k ** 1.6 for k in range(1, bright + 1))
    return s * np.minimum(1, x / 0.02) * np.exp(-x / d)
# A minor feel: Am7 - Fmaj7 - Cmaj7 - G6, one chord per bar (4 beats)
chords = [[220.0, 261.63, 329.63, 392.0], [174.61, 220.0, 261.63, 329.63],
          [130.81, 164.81, 196.0, 246.94], [196.0, 246.94, 293.66, 329.63]]
bass = [110.0, 87.31, 65.41, 98.0]
bar = 4 * beat; nbars = int(DUR / bar) + 1
for b in range(nbars):
    t0 = b * bar; ci = b % 4
    for k, f in enumerate(chords[ci]): add(note(f, bar, d=1.6, bright=2), t0 + k * 0.012, 0.07, pan=(k - 1.5) * 0.3)
    add(note(bass[ci], bar * 0.9, d=0.8, bright=2), t0, 0.32)
    add(note(bass[ci], beat * 0.9, d=0.3, bright=2), t0 + 2.5 * beat, 0.2)
    if b == 0: continue  # intro bar: chords only
    for q in range(4):
        tb = t0 + q * beat
        if q in (0, 2): add(kick(), tb, 0.8)
        if q == 2 and b % 2: add(kick(), tb + beat * 0.5, 0.5)
        if q in (1, 3): add(snare(), tb, 0.35)
        for e in range(2): add(hat(), tb + e * beat / 2 + (0.02 if e else 0), 0.12 if e else 0.18, pan=0.3)
    # simple melody bell every other bar
    if b % 2 == 1:
        mel = [chords[ci][3] * 2, chords[ci][2] * 2, chords[ci][1] * 2]
        for k, f in enumerate(mel): add(note(f, beat, d=0.35, bright=1), t0 + (k + 1) * beat * 0.75, 0.06, pan=-0.3)
# soft low-pass via moving average, fade in/out
for c in range(2): out[:, c] = np.convolve(out[:, c], np.ones(3) / 3, "same")
fade = np.ones(n); fi, fo = int(0.5 * SR), int(2.5 * SR)
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
out *= fade[:, None]; out /= np.max(np.abs(out)) * 1.12
with wave.open("music.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print("music ok")

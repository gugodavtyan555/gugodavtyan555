#!/usr/bin/env python3
"""SFX track from ElevenLabs one-shots (el_whoosh/el_impact/el_riser.mp3) placed on timeline.json events -> sfx.wav"""
import json, os, subprocess, wave
import numpy as np
ROOT = os.path.dirname(os.path.abspath(__file__)); SR = 44100
tl = json.load(open(os.path.join(ROOT, 'timeline.json'))); N = int(tl['total'] * SR)
def load(n):
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', os.path.join(ROOT, n), '-f', 's16le', '-ac', '2', '-ar', str(SR), '-'])
    x = np.frombuffer(raw, '<i2').reshape(-1, 2).astype(float) / 32768; return x / max(1e-6, np.abs(x).max())
def place(buf, sig, t, g):
    i = max(0, int(t * SR)); n = min(len(sig), len(buf) - i)
    if n > 0: buf[i:i + n] += sig[:n] * g
WH, IM, RI = load('el_whoosh.mp3'), load('el_impact.mp3'), load('el_riser.mp3')
n = int(0.09 * SR); tt = np.arange(n) / SR
PO = (np.sin(2 * np.pi * (700 * tt + 500 * tt ** 2 / 0.09)) * np.exp(-tt / 0.02))[:, None].repeat(2, 1)
pk = int(np.argmax(np.abs(WH).sum(1))) / SR
sfx = np.zeros((N, 2)); hit = tl['sting'] + 0.9
for t in tl['bumps']: place(sfx, WH, t - pk, 0.6); place(sfx, IM, t + 0.02, 0.45)
for t in tl['cards']: place(sfx, WH, t - pk, 0.35)
for t in tl['chips']: place(sfx, PO, t, 0.14)
place(sfx, RI, hit - len(RI) / SR, 0.5); place(sfx, IM, hit, 0.9)
w = wave.open(os.path.join(ROOT, 'sfx.wav'), 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((np.clip(sfx, -1, 1) * 32767).astype('<i2').tobytes()); w.close(); print('sfx ok')

"""Shared timeline: music beat grid (98 bpm, drop = video beat 8), blocks, voice start times."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
P = 60 / 98; DROP = 4.8897; BPT = 7            # drop = track beat 7 = video beat 8
def beat(k): return DROP + (k - 8) * P
BLOCKS = [('h', 0, 8), ('n5', 8, 26), ('n4', 26, 42), ('n3', 42, 58), ('n2', 58, 76), ('n1', 76, 96), ('o', 96, 104)]
TOTAL = beat(104)
VOICE_START = {'h': 0.0, 'n5': beat(8) + 0.05, 'n4': beat(26) + 0.05, 'n3': beat(42) + 0.05, 'n2': beat(58) + 0.05, 'n1': beat(76) + 0.5, 'o': beat(96)}
def words(seg):
    """[(word, start_s, end_s)] in video time, skipping [tags]."""
    al = json.load(open(f'{HERE}/tts/{seg}.json')); ch = al['characters']; st = al['character_start_times_seconds']; en = al['character_end_times_seconds']
    out = []; cur = ''; a = None; inb = False
    for c, s, e in zip(ch, st, en):
        if c == '[': inb = True; continue
        if c == ']': inb = False; continue
        if inb: continue
        if c in ' \n':
            if cur: out.append((cur, a + VOICE_START[seg], pe + VOICE_START[seg])); cur = ''
            continue
        if not cur: a = s
        cur += c; pe = e
    if cur: out.append((cur, a + VOICE_START[seg], pe + VOICE_START[seg]))
    return out

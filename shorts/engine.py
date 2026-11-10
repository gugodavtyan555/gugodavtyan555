"""Мини-движок stickman-анимации для коротких видео (1080x1920).
Использование: python3 engine.py episodes/ep01.py  -> out/ep01.mp4
"""
import math, os, random, subprocess, sys, json, importlib.util
from PIL import Image, ImageDraw, ImageFont

S = 2                      # суперсэмплинг
OW, OH = 720, 1280         # выходное разрешение рендера
W, H = OW * S, OH * S
FPS = 24
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
VOICE = "JBFqnCBsd6RMkjVDRZzb"  # ElevenLabs voice (можно заменить)
HERE = os.path.dirname(os.path.abspath(__file__))

# ---------- утилиты ----------
def lerp(a, b, t): return a + (b - a) * t
def clamp(x, a=0, b=1): return max(a, min(b, x))
def ease(t): t = clamp(t); return t * t * (3 - 2 * t)
def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

_fonts = {}
def font(sz):
    sz = int(sz)
    if sz not in _fonts: _fonts[sz] = ImageFont.truetype(FONT, sz)
    return _fonts[sz]

# ---------- фон ----------
def gradient(top, bot):
    img = Image.new("RGB", (W, H))
    px = ImageDraw.Draw(img)
    t, b = hexc(top), hexc(bot)
    for y in range(0, H, 4):
        k = y / H
        px.rectangle([0, y, W, y + 4], fill=tuple(int(lerp(t[i], b[i], k)) for i in range(3)))
    return img

def city(d, ground, color, seed=1, lit=True):
    r = random.Random(seed)
    x = -40
    while x < W:
        w = r.randint(140, 260); h = r.randint(300, 820)
        d.rectangle([x, ground - h, x + w, ground], fill=hexc(color))
        if lit:
            for yy in range(ground - h + 40, ground - 40, 70):
                for xx in range(x + 24, x + w - 30, 52):
                    if r.random() < 0.28:
                        d.rectangle([xx, yy, xx + 20, yy + 30], fill=(250, 210, 120))
        x += w + r.randint(-10, 30)

def lamp(d, x, ground, s=1.0):
    d.line([x, ground, x, ground - 560 * s], fill=(30, 28, 45), width=int(14 * s))
    d.line([x, ground - 560 * s, x + 90 * s, ground - 580 * s], fill=(30, 28, 45), width=int(14 * s))
    d.ellipse([x + 70 * s, ground - 600 * s, x + 130 * s, ground - 545 * s], fill=(255, 225, 140))

# ---------- человечки ----------
def man(d, x, gy, color="#5b8def", s=1.0, face=1, walk=None, sit=False,
        arm=(0.3, -0.3), hat=False, hair=False, bob=0.0, scale_y=1.0):
    """x,gy — стопы на земле. face=1 вправо, -1 влево. walk — фаза (рад)."""
    s = s * 1.35
    c = hexc(color); L = 190 * s; T = 200 * s; r = 66 * s; lw = int(30 * s)
    gy = gy + bob
    hip = (x, gy - L) if not sit else (x, gy - 100 * s)
    neck = (hip[0], hip[1] - T)
    head = (neck[0] + face * 8 * s, neck[1] - r + 8 * s)
    # ноги
    def limb(p, ang, ln, col=c):
        q = (p[0] + math.sin(ang) * ln * face, p[1] + math.cos(ang) * ln)
        d.line([p, q], fill=col, width=lw)
        d.ellipse([q[0] - lw / 2, q[1] - lw / 2, q[0] + lw / 2, q[1] + lw / 2], fill=col)
        return q
    if sit:
        k1 = (hip[0] + face * 150 * s, hip[1])
        d.line([hip, k1], fill=c, width=lw)
        d.line([k1, (k1[0], gy)], fill=c, width=lw)
    elif walk is not None:
        a = math.sin(walk) * 0.55
        limb(hip, a, L); limb(hip, -a, L)
    else:
        limb(hip, 0.08, L); limb(hip, -0.08, L)
    d.line([hip, neck], fill=c, width=lw + 4)
    sh = (neck[0], neck[1] + 30 * s)
    a1, a2 = arm
    if walk is not None:
        sw = math.sin(walk) * 0.6
        a1, a2 = sw, -sw
    limb(sh, a1, 150 * s); limb(sh, a2, 150 * s)
    if hair:
        d.line([(head[0] - face * r * 0.8, head[1] - 10 * s),
                (head[0] - face * r * 1.9, head[1] + 90 * s)], fill=(20, 20, 30), width=int(26 * s))
    d.ellipse([head[0] - r, head[1] - r, head[0] + r, head[1] + r], fill=(12, 12, 18))
    for dx in (14, 38):
        ex = head[0] + face * dx * s
        d.ellipse([ex - 9 * s, head[1] - 12 * s - 9 * s, ex + 9 * s, head[1] - 12 * s + 9 * s], fill=(245, 245, 245))
    if hat:
        d.rectangle([head[0] - r, head[1] - r - 8 * s, head[0] + r, head[1] - r * 0.45], fill=(70, 60, 50))
        d.rectangle([head[0] - r * 0.2 * face if face > 0 else head[0] - r * 1.5, head[1] - r * 0.55,
                     head[0] + r * 1.5 if face > 0 else head[0] + r * 0.2, head[1] - r * 0.4], fill=(50, 42, 36))
    return (head, neck, hip, sh)

def ticket(d, x, y, s=1.0, rot=0, col=(250, 240, 210)):
    w, h = 90 * s, 50 * s
    d.rectangle([x - w, y - h, x + w, y + h], fill=col, outline=(120, 100, 70), width=3)
    d.line([x - w * 0.6, y - h * 0.2, x + w * 0.6, y - h * 0.2], fill=(120, 100, 70), width=4)
    d.line([x - w * 0.6, y + h * 0.3, x + w * 0.2, y + h * 0.3], fill=(120, 100, 70), width=4)

def bench(d, x, gy, w=520):
    d.rectangle([x - w / 2, gy - 130, x + w / 2, gy - 105], fill=(105, 75, 50))
    d.rectangle([x - w / 2, gy - 250, x + w / 2, gy - 225], fill=(105, 75, 50))
    for xx in (x - w / 2 + 30, x + w / 2 - 50):
        d.rectangle([xx, gy - 250, xx + 20, gy], fill=(70, 50, 35))

def suitcase(d, x, gy, s=1.0, col=(150, 70, 50)):
    w, h = 110 * s, 150 * s
    d.rounded_rectangle([x - w, gy - h, x + w, gy], radius=18, fill=col)
    d.arc([x - 40 * s, gy - h - 50 * s, x + 40 * s, gy - h + 40 * s], 180, 360, fill=(40, 30, 25), width=10)

def train(d, x, gy, n=4, col=(70, 90, 120)):
    cw = 520
    for i in range(n):
        xx = x + i * (cw + 14)
        d.rounded_rectangle([xx, gy - 380, xx + cw, gy - 60], radius=30, fill=col)
        for j in range(4):
            d.rectangle([xx + 40 + j * 118, gy - 320, xx + 120 + j * 118, gy - 220], fill=(255, 220, 130))
        for wx in (xx + 90, xx + cw - 160):
            d.ellipse([wx, gy - 90, wx + 80, gy - 10], fill=(25, 25, 35))

def clock(d, x, y, rad, t):
    d.ellipse([x - rad, y - rad, x + rad, y + rad], fill=(245, 245, 240), outline=(40, 40, 40), width=8)
    for hand, ln, w in ((t * 6.0 * 12, rad * 0.5, 10), (t * 6.0, rad * 0.8, 6)):
        a = math.radians(hand - 90)
        d.line([x, y, x + math.cos(a) * ln, y + math.sin(a) * ln], fill=(30, 30, 30), width=w)

# ---------- субтитры ----------
def caption(img, text, t, dur, hl=False, y=None):
    d = ImageDraw.Draw(img)
    pop = ease(t / 0.12)
    sz = (190 if len(text) < 10 else 160 if len(text) < 16 else 130) * (0.82 + 0.18 * pop)
    f = font(sz)
    bb = d.textbbox((0, 0), text, font=f, stroke_width=14)
    while bb[2] - bb[0] > W * 0.92 and sz > 40:
        sz -= 6; f = font(sz); bb = d.textbbox((0, 0), text, font=f, stroke_width=14)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    x = (W - tw) / 2 - bb[0]
    yy = (y if y else H * 0.79) - th / 2 - bb[1]
    col = (255, 214, 10) if hl else (255, 255, 255)
    d.text((x, yy), text, font=f, fill=col, stroke_width=14, stroke_fill=(0, 0, 0))

def hook_title(img, lines, t):
    d = ImageDraw.Draw(img)
    f = font(190)
    for i, (ln, hl) in enumerate(lines):
        a = ease((t - i * 0.18) / 0.2)
        if a <= 0: continue
        bb = d.textbbox((0, 0), ln, font=f)
        x = (W - (bb[2] - bb[0])) / 2 - bb[0]
        y = H * 0.06 + i * 250 - (1 - a) * 40
        d.text((x, y), ln, font=f, fill=(255, 214, 10) if hl else (255, 255, 255),
               stroke_width=14, stroke_fill=(0, 0, 0))

# ---------- TTS ----------
def tts(text, path):
    if os.path.exists(path): return
    body = json.dumps({"text": text, "model_id": "eleven_multilingual_v2",
                       "voice_settings": {"stability": 0.45, "similarity_boost": 0.8, "style": 0.35}})
    subprocess.run(["curl", "-sS", "-f", "-X", "POST",
                    f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128",
                    "-H", "Content-Type: application/json", "-d", body, "-o", path], check=True)

def dur(path):
    o = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                 "-of", "csv=p=0", path])
    return float(o)

# ---------- сборка ----------
def render(ep_path):
    spec = importlib.util.spec_from_file_location("ep", ep_path)
    ep = importlib.util.module_from_spec(spec); spec.loader.exec_module(ep)
    name = os.path.splitext(os.path.basename(ep_path))[0]
    work = os.path.join(HERE, "out", name); os.makedirs(work, exist_ok=True)
    GAP = 0.28
    starts, durs, parts = [], [], []
    t0 = 0.0
    for i, sc in enumerate(ep.SCENES):
        p = os.path.join(work, f"v{i:02d}.mp3")
        tts(sc["say"].replace("*", ""), p)
        dd = dur(p) + GAP
        starts.append(t0); durs.append(dd); t0 += dd; parts.append(p)
    total = t0 + 0.4
    # аудио
    lst = os.path.join(work, "list.txt")
    with open(lst, "w") as f:
        for p, dd in zip(parts, durs):
            sil = os.path.join(work, "gap.mp3")
            f.write(f"file '{p}'\n")
    # склеиваем с паузами через ffmpeg filter
    inputs, filt = [], []
    for i, p in enumerate(parts):
        inputs += ["-i", p]
        filt.append(f"[{i}:a]apad=pad_dur={GAP}[a{i}]")
    cat = "".join(f"[a{i}]" for i in range(len(parts))) + f"concat=n={len(parts)}:v=0:a=1[voice]"
    fc = ";".join(filt + [cat])
    voice = os.path.join(work, "voice.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", fc,
                    "-map", "[voice]", voice], check=True)
    # музыкальная подложка (тихий дрон), опционально
    mix = os.path.join(work, "mix.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", voice,
                    "-f", "lavfi", "-i", f"sine=f=110:d={total}", "-f", "lavfi", "-i", f"sine=f=165:d={total}",
                    "-filter_complex", "[1:a][2:a]amix=inputs=2,volume=0.025[m];[0:a][m]amix=inputs=2:duration=first:normalize=0[o]",
                    "-map", "[o]", mix], check=True)
    out = os.path.join(HERE, "out", name + ".mp4")
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
                           "-s", f"{OW}x{OH}", "-r", str(FPS), "-i", "-", "-i", mix,
                           "-vf", "scale=1080:1920:flags=lanczos", "-c:v", "libx264", "-preset", "medium",
                           "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k",
                           "-af", "apad", "-t", f"{total:.2f}", out], stdin=subprocess.PIPE)
    nframes = int(total * FPS)
    bgcache = {}
    for fi in range(nframes):
        T = fi / FPS
        idx = max(i for i in range(len(starts)) if starts[i] <= T)
        sc = ep.SCENES[idx]; lt = T - starts[idx]; D = durs[idx]
        key = idx
        if key not in bgcache:
            bgcache.clear(); bgcache[key] = sc["bg"]()
        img = bgcache[key].copy()
        d = ImageDraw.Draw(img)
        sc["draw"](d, lt, D, img)
        # субтитры
        words = sc["say"].split()
        chunks, cur = [], []
        for w in words:
            cur.append(w)
            clean = " ".join(cur).replace("*", "")
            if len(cur) >= 3 or len(clean) > 14:
                chunks.append(cur); cur = []
        if cur: chunks.append(cur)
        weights = [len(" ".join(c)) + 4 for c in chunks]; tw = sum(weights)
        speak = D - GAP; acc = 0
        for c, wgt in zip(chunks, weights):
            a, b = acc / tw * speak, (acc + wgt) / tw * speak
            if a <= lt < b + (0.15 if c is chunks[-1] else 0):
                txt = " ".join(c)
                hl = "*" in txt
                caption(img, txt.replace("*", ""), lt - a, b - a, hl)
                break
            acc += wgt
        if idx == 0 and hasattr(ep, "HOOK"):
            hook_title(img, ep.HOOK, lt)
        # лёгкий зум
        z = 1 + 0.05 * (lt / D)
        cw, ch = W / z, H / z
        box = ((W - cw) / 2, (H - ch) / 2, (W + cw) / 2, (H + ch) / 2)
        small = img.resize((OW, OH), Image.LANCZOS, box=box)
        ff.stdin.write(small.tobytes())
    ff.stdin.close(); ff.wait()
    print("OK", out, round(total, 1), "s")

if __name__ == "__main__":
    render(sys.argv[1])

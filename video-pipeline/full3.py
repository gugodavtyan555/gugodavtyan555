#!/usr/bin/env python3
"""Full video builder: narration-synced trailer footage, chapter bumpers, character cards, animated overlays.
usage: full3.py plan | still T... | clips | render OUT"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(ROOT, '..', 'dl', 'img'); TR = os.path.join(ROOT, '..', 'dl', 'trailers')
CL = os.path.join(ROOT, 'clips'); os.makedirs(CL, exist_ok=True)
W, H, FPS = 1920, 1080, 30
GAP, BUMP, TAIL, LEAD = 0.3, 1.15, 2.2, 0.35
SRC = {'A': (os.path.join(TR, 'GTAVI_Trailer_1_1080.mp4'), 'null'),
       'T': (os.path.join(TR, 'GTAVI_Trailer_2.mp4'), 'crop=3072:1728:384:216'),
       'L': (os.path.join(TR, 'GTAVI_Launch_Trailer.mp4'), 'crop=3412:1920:214:120')}
FD = '/usr/share/fonts/opentype/inter/'
_fc = {}
def font(name, size):
    if (name, size) not in _fc: _fc[(name, size)] = ImageFont.truetype(FD + name, size)
    return _fc[(name, size)]
F_BLACK = lambda s: font('InterDisplay-Black.otf', s)
F_XB = lambda s: font('InterDisplay-ExtraBold.otf', s)
F_B = lambda s: font('InterDisplay-Bold.otf', s)
PINK, YELLOW, NAVY, WHITE, RED = (255, 62, 150), (255, 210, 63), (20, 14, 40), (255, 255, 255), (230, 33, 23)

A, T, L = 'A', 'T', 'L'
def G(cue, src=None, img=None, card=None, place=''): return dict(cue=cue, src=src or [], img=img, card=card, place=place)
def C(name, role, imgs, facts): return dict(name=name, role=role, imgs=imgs, facts=facts)
CHAP = {1: 'ДАТА ВЫХОДА', 2: 'ДЖЕЙСОН', 3: 'ЛУСИЯ', 4: 'СЮЖЕТ', 5: 'КТО ЕЩЁ В ИГРЕ', 6: 'ШТАТ ЛЕОНИДА', 7: 'ИЗДАНИЯ'}
NCH = len(CHAP)

PLAN = {
 'i1': dict(groups=[G(None, [(A, 39.8, 41.3), (L, 72.8, 73.8), (T, 117.9, 118.8), (L, 26.4, 27.8), (A, 65.6, 66.7), (L, 59.9, 63.2),
                             (A, 68.7, 70.3), (L, 67.1, 68.5), (A, 31.0, 32.6), (L, 55.2, 57.1), (T, 140.0, 143.7)])],
            title=('ЕЁ ЖДАЛИ 13 ЛЕТ', 'GTA 6 выходит 19 ноября', 'тринадцать', 'За три'),
            chips=[('Новый штат', 'Новый штат'), ('Два главных героя', 'два главных'), ('Только официальные факты', 'официально')]),
 'sting': dict(groups=[G(None, [(A, 82.0, 84.9)])]),
 'r1': dict(groups=[G(None, [(A, 2.7, 5.0), (L, 14.2, 15.2), (A, 18.4, 19.2), (A, 21.7, 23.3)]), G('на PlayStation', [(A, 23.3, 24.8), (A, 35.7, 37.4)]),
                    G('Предзагрузка', [(A, 32.6, 34.1), (A, 27.4, 29.0), (T, 34.6, 38.4)])],
            plate=('19 НОЯБРЯ 2026', 'Дата выхода GTA VI', 'девятнадцатого'),
            chips=[('PS5 и Xbox Series', 'PlayStation'), ('Предзагрузка — с 10 ноября', 'Предзагрузка'), ('Можно скачать заранее', 'скачать')]),
 's2': dict(groups=[G(None, [(T, 8.1, 9.8), (T, 11.5, 13.7), (T, 23.3, 26.0)]), G('Пытаясь', [(L, 7.0, 10.0), (L, 11.9, 14.2)]),
                    G('но в итоге', [(A, 35.7, 37.4), (L, 2.7, 5.5)]), G('где работает', [(T, 28.5, 33.2)]),
                    G('Он хочет', [(T, 38.4, 41.6), (L, 47.0, 50.0), (A, 60.5, 62.5)])],
            plate=('ДЖЕЙСОН ДЮВАЛЬ', 'Главный герой GTA VI', None),
            chips=[('Вырос среди бандитов', 'мошенников'), ('Служил в армии', 'отслужил'), ('Живёт в Леонида-Кис', 'островах'), ('Работает на наркокурьеров', 'наркокурьеров')]),
 's3': dict(groups=[G(None, [(T, 114.0, 117.0), (L, 36.5, 38.0)]), G('Борьба', [(A, 5.0, 6.5), (A, 9.6, 10.9), (T, 51.9, 56.0)]),
                    G('а выйти', [(T, 63.1, 66.2)]), G('Теперь', [(L, 35.1, 36.5), (T, 111.3, 113.0), (L, 72.8, 73.8), (A, 62.5, 63.6)])],
            plate=('ЛУСИЯ КАМИНОС', 'Главная героиня GTA VI', None),
            chips=[('Отец научил её драться', 'драться'), ('Сидела в тюрьме Леониды', 'тюрьму'), ('Вышла благодаря удаче', 'удача'), ('Только умные ходы', 'умные')]),
 's4': dict(groups=[G(None, [(L, 40.4, 42.3), (L, 59.9, 63.2), (A, 68.7, 70.3)]), G('Но всё', [(T, 117.9, 118.8), (L, 32.8, 33.6), (T, 45.3, 49.8)]),
                    G('в центре', [(L, 68.5, 72.8), (T, 119.6, 121.6)]), G('Чтобы выжить', [(L, 29.4, 32.8), (A, 72.8, 76.5)])],
            chips=[('Лёгкое дело', 'лёгкое'), ('Всё идёт не по плану', 'не по плану'), ('Заговор на весь штат', 'заговора'), ('Доверять друг другу', 'доверять')]),
 'c1': dict(groups=[G(None, [(T, 79.5, 81.4), (T, 92.0, 96.1), (A, 29.0, 30.0)]),
                    G('Кэл Хэмптон', [(T, 18.8, 23.3)], card=C('КЭЛ ХЭМПТОН', 'Друг Джейсона', ['Cal_Hampton_01', 'Cal_Hampton_02', 'Cal_Hampton_03'], ['Убеждённый конспиролог', 'Слушает береговую охрану']))]),
 'c2': dict(groups=[G(None, [(T, 126.7, 129.4), (A, 34.1, 35.7)], card=C('БУБИ АЙК', 'Легенда Вайс-Сити', ['Boobie_Ike_01', 'Boobie_Ike_02', 'Boobie_Ike_03', 'Boobie_Ike_04'], ['Легальная империя', 'Недвижимость, клуб, студия'])),
                    G('Его партнёр', [(L, 45.1, 47.0)], card=C("ДРЕ'КУАН ПРИСТ", 'Партнёр Буби', ['DreQuan_Priest_03', 'DreQuan_Priest_04', 'DreQuan_Priest_02'], ['Хочет стать музыкальным магнатом'])),
                    G('дуэт', [(A, 34.1, 35.7)], card=C('REAL DIMEZ', 'Рэп-дуэт', ['Real_Dimez_04', 'Real_Dimez_01'], ['Подписаны на лейбл Дре\'Куана']))]),
 'c3': dict(groups=[G(None, [(L, 68.5, 72.8), (A, 31.0, 32.6)], card=C('РАУЛЬ БАУТИСТА', 'Грабитель банков', ['Raul_Bautista_01', 'Raul_Bautista_02', 'Raul_Bautista_04'], ['Ищет новых людей', 'Повышает ставки с каждым делом'])),
                    G('А Брайан', [(T, 13.7, 18.8)], card=C('БРАЙАН ХЕДЕР', 'Контрабандист старой школы', ['Brian_Heder_01', 'Brian_Heder_02', 'Brian_Heder_03'], ['Даёт Джейсону жильё', 'В обмен на помощь с делами']))]),
 'w1': dict(groups=[G(None, [(A, 2.7, 5.0), (T, 34.6, 36.6)]), G('Вайс-Сити', [(A, 31.0, 32.6), (A, 32.6, 34.1), (T, 125.8, 126.7)], place='ВАЙС-СИТИ'),
                    G('Леонида-Кис', [(A, 35.7, 37.4), (L, 2.7, 5.5)], place='ЛЕОНИДА-КИС'), G('Грассриверс', [(A, 19.2, 21.7), (T, 138.1, 140.0)], place='ГРАССРИВЕРС'),
                    G('А ещё', img='Port_Gellhorn_01', place='ПОРТ-ГЕЛЛХОРН'), G('Амброзия', img='Ambrosia_01', place='АМБРОЗИЯ'),
                    G('и национальный', img='Mount_Kalaga_National_Park_04', place='МАУНТ-КАЛАГА'),
                    G('Rockstar называет', [(A, 21.7, 23.3), (L, 26.4, 27.8), (T, 8.1, 9.8), (L, 14.2, 15.1), (A, 39.8, 41.3)])],
            quote=('«Тёмная сторона самого солнечного', 'места в Америке»', 'Rockstar называет')),
 'e1': dict(groups=[G(None, [(A, 32.6, 34.1)], card=C('STANDARD EDITION', 'Издание 1', ['GTAVI_FOB_StandardEdition_Desktop'], ['Стандартное издание'])),
                    G('и Ультимейт', [(A, 24.8, 27.4)], card=C('ULTIMATE EDITION', 'Издание 2', ['GTAVI_FOB_UltimateEdition_Desktop_en_us'], ['Эксклюзивная коллекция предметов'])),
                    G('А за предзаказ', [(T, 125.8, 129.4), (A, 29.0, 30.0)], card=C('VINTAGE VICE CITY', 'Бонус предзаказа', ['VINTAGE_VICE_CITY_PACK_01', 'VINTAGE_VICE_CITY_PACK_EXCLUSIVE_LOOKS_01', 'VINTAGE_VICE_CITY_PACK_VAPID_STANIER_01', 'VINTAGE_VICE_CITY_WEAPON_PATTERN_01'], ['Эксклюзивные образы', 'Машина Vapid Stanier', 'Раскраска для оружия']))]),
 's6': dict(groups=[G(None, [(T, 140.0, 143.7), (A, 65.6, 66.7), (L, 40.4, 42.3)]), G('и подписывайтесь', [(L, 76.0, 89.0)])],
            title=('ДЖЕЙСОН ИЛИ ЛУСИЯ?', 'Пиши в комментариях', 'кто станет', 'и подписывайтесь'), subscribe='подписывайтесь'),
}

# ---------------- timeline
segs = json.load(open(os.path.join(ROOT, 'script.json')))
segs.insert(1, {'id': 'sting', 'ch': 0, 'text': '', 'silent': 2.6})
t = 0.0; prev_ch = 0
for s in segs:
    s['plan'] = PLAN[s['id']]; s['rs'] = t
    s['bump'] = s['ch'] in CHAP and s['ch'] != prev_ch; prev_ch = s['ch']
    lead = BUMP if s['bump'] else (LEAD if t == 0 else 0)
    s['t0'] = t + lead
    if 'silent' in s: s['dur'] = s['silent']
    else:
        s['al'] = json.load(open(os.path.join(ROOT, 'tts', s['id'] + '.json')))
        s['dur'] = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(ROOT, 'tts', s['id'] + '.mp3')]).strip())
    t = s['t0'] + s['dur'] + (0 if 'silent' in s else GAP); s['re'] = t
segs[-1]['re'] += TAIL; TOTAL = segs[-1]['re']; NF = int(TOTAL * FPS)
for a, b in zip(segs, segs[1:]): a['last_in_ch'] = a['ch'] != b['ch']
segs[-1]['last_in_ch'] = True

def cue(s, kw):
    i = s['text'].find(kw)
    if i < 0: raise SystemExit(f"cue not found: {kw!r} in {s['id']}")
    return s['t0'] + s['al']['character_start_times_seconds'][i]

groups = []
for s in segs:
    g = s['plan']['groups']
    st = [s['rs'] if x['cue'] is None else cue(s, x['cue']) - 0.12 for x in g]
    for k, x in enumerate(g):
        x.update(t=st[k], end=(st[k + 1] if k + 1 < len(g) else s['re']), seg=s['id'], k=k); groups.append(x)
chap_span = {}
for s in segs:
    if s['ch'] in CHAP:
        a, b = chap_span.get(s['ch'], (s['t0'], s['re'])); chap_span[s['ch']] = (min(a, s['t0']), max(b, s['re']))

def ease(x): x = min(1, max(0, x)); return 1 - (1 - x) ** 3
def ease_back(x):
    x = min(1, max(0, x)); c = 1.70158; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2

# ---------------- background clips
def build_clips():
    files = []
    for gi, g in enumerate(groups):
        f0, f1 = round(g['t'] * FPS), min(NF, round(g['end'] * FPS)); need = f1 - f0
        if need <= 0: raise SystemExit(f'empty group {g["seg"]} {g["k"]}')
        if os.environ.get('ONLY') and str(gi) not in os.environ['ONLY'].split(','):
            files += [os.path.join(CL, f'g{gi:03d}_{j}.mp4') for j in range(1 if g['img'] else len(g['src']))]; continue
        enc = ['-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '15', '-pix_fmt', 'yuv420p', '-r', str(FPS)]
        if g['img']:
            out = os.path.join(CL, f'g{gi:03d}_0.mp4'); files.append(out)
            im = Image.open(os.path.join(IMG, g['img'] + '.jpg')).convert('RGB').resize((2688, 1512), Image.LANCZOS)
            p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-'] + enc + ['-frames:v', str(need), out], stdin=subprocess.PIPE)
            for i in range(need):
                z = 1.04 + 0.14 * i / max(1, need - 1); cw, ch = 2688 / z, 1512 / z; x0, y0 = (2688 - cw) * 0.5, (1512 - ch) * 0.45
                p.stdin.write(im.transform((W, H), Image.EXTENT, (x0, y0, x0 + cw, y0 + ch), Image.BICUBIC).tobytes())
            p.stdin.close(); p.wait(); continue
        av = [b - a for _, a, b in g['src']]; tot = sum(av)
        fr = [max(8, round(need * a / tot)) for a in av]; fr[-1] += need - sum(fr)
        if fr[-1] < 4: raise SystemExit(f'bad split {g["seg"]} {fr}')
        for j, ((sid, a, b), n) in enumerate(zip(g['src'], fr)):
            out = os.path.join(CL, f'g{gi:03d}_{j}.mp4'); files.append(out); dur = n / FPS
            path, crop = SRC[sid]; use = min(b - a, dur); kf = dur / use
            if kf > 1.45 and not g['card']: print('WARN slow x%.2f' % kf, g['seg'], sid, a, b, flush=True)
            fx = 'boxblur=22:2,eq=brightness=-0.16:saturation=1.2' if g['card'] else 'eq=contrast=1.06:saturation=1.14'
            zoom = f"scale=w='2*trunc({W / 2}*(1+0.055*t/{dur:.3f}))':h='2*trunc({H / 2}*(1+0.055*t/{dur:.3f}))':eval=frame:flags=bicubic,crop={W}:{H}"
            subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-ss', f'{a:.3f}', '-t', f'{use:.3f}', '-i', path,
                                   '-vf', f'{crop},scale={W}:{H}:flags=lanczos,setpts={kf:.4f}*PTS,fps={FPS},tpad=stop_mode=clone:stop_duration=1,{zoom},{fx}'] + enc + ['-frames:v', str(n), out])
        print(g['seg'], g['k'], need, flush=True)
    lst = os.path.join(CL, 'list.txt'); open(lst, 'w').write(''.join(f"file '{f}'\n" for f in files))
    subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', os.path.join(ROOT, 'bg.mp4')])

# ---------------- overlay drawing
grad = Image.new('L', (1, H))
for y in range(H):
    b = max(0, (y - H * 0.52) / (H * 0.48)); tp = max(0, 1 - y / (H * 0.24))
    grad.putpixel((0, y), int(255 * min(1, 0.72 * b ** 1.5 + 0.42 * tp ** 1.5)))
SHADE = Image.new('RGBA', (W, H), (8, 5, 18, 0)); SHADE.putalpha(grad.resize((W, H)))

_lg = Image.open(os.path.join(ROOT, 'logo.png')).convert('RGBA'); LOGO = _lg.resize((int(_lg.width * 118 / _lg.height), 118), Image.LANCZOS)
LOGO_SH = Image.new('RGBA', (LOGO.width + 28, LOGO.height + 28), (0, 0, 0, 0)); LOGO_SH.paste((0, 0, 0, 150), (14, 14), LOGO.split()[3]); LOGO_SH = LOGO_SH.filter(ImageFilter.GaussianBlur(7))

def rr(d, box, r, fill): d.rounded_rectangle(box, radius=r, fill=fill)
def al(c, a): return c + (int(255 * min(1, max(0, a))),)
def chip(d, x, y, text, a):
    f = F_XB(40); tw = d.textlength(text, font=f); h = 70
    rr(d, (x, y, x + tw + 92, y + h), 16, al(NAVY, 0.88 * a))
    d.ellipse((x + 24, y + h / 2 - 11, x + 46, y + h / 2 + 11), fill=al(PINK, a))
    d.text((x + 66, y + h / 2), text, font=f, fill=al(WHITE, a), anchor='lm')
def stext(d, xy, text, f, fill, a, anchor='ls', sw=5):
    d.text(xy, text, font=f, fill=al(fill, a), anchor=anchor, stroke_width=sw, stroke_fill=al(NAVY, 0.9 * a))
def fit(d, text, fn, size, maxw):
    while d.textlength(text, font=fn(size)) > maxw and size > 40: size -= 4
    return fn(size)

_img = {}
def card_img(name, fw, fh):
    key = (name, fw, fh)
    if key not in _img:
        if len(_img) > 6: _img.pop(next(iter(_img)))
        im = Image.open(os.path.join(IMG, name + '.jpg')).convert('RGB'); s = max(fw * 1.2 / im.width, fh * 1.2 / im.height)
        _img[key] = im.resize((int(im.width * s) + 1, int(im.height * s) + 1), Image.LANCZOS)
    return _img[key]
_mask = {}
def rmask(fw, fh, r=28):
    if (fw, fh) not in _mask:
        m = Image.new('L', (fw, fh), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, fw - 1, fh - 1), radius=r, fill=255); _mask[(fw, fh)] = m
    return _mask[(fw, fh)]

def draw_card(ov, d, g, tt):
    c = g['card']; a = ease((tt - g['t'] - 0.05) / 0.4) * (1 - ease((tt - (g['end'] - 0.22)) / 0.22))
    if a <= 0: return
    probe = Image.open(os.path.join(IMG, c['imgs'][0] + '.jpg')); portrait = probe.height > probe.width
    fw, fh = (640, 800) if portrait else (1040, 585)
    fx = W - 80 - fw + int(120 * (1 - a)) - (160 if portrait else 0); fy = (H - fh) // 2 + 10
    n = len(c['imgs']); per = (g['end'] - g['t']) / n; i = min(n - 1, int((tt - g['t']) / per)); u = (tt - g['t']) / (g['end'] - g['t'])
    def crop(name):
        im = card_img(name, fw, fh); z = 1.18 - 0.14 * u; cw, ch = fw * 1.2 / z * (im.width / (fw * 1.2)), 0
        cw = im.width / z * (fw * 1.2 / im.width) if False else fw * 1.2 / z; ch = fh * 1.2 / z
        x0, y0 = (im.width - cw) / 2, (im.height - ch) * 0.4
        return im.transform((fw, fh), Image.EXTENT, (x0, y0, x0 + cw, y0 + ch), Image.BICUBIC)
    pic = crop(c['imgs'][i]); loc = (tt - g['t']) - i * per
    if i > 0 and loc < 0.3: pic = Image.blend(crop(c['imgs'][i - 1]), pic, loc / 0.3)
    sh = Image.new('RGBA', (fw + 80, fh + 80), (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle((40, 48, fw + 40, fh + 48), radius=30, fill=(0, 0, 0, int(150 * a)))
    ov.alpha_composite(sh.filter(ImageFilter.GaussianBlur(18)), (fx - 40, fy - 40))
    d.rounded_rectangle((fx - 7, fy - 7, fx + fw + 7, fy + fh + 7), radius=34, fill=al(PINK, a))
    m = rmask(fw, fh).point(lambda v: int(v * a)); ov.paste(pic, (fx, fy), m)
    lx = 90 - int(70 * (1 - a)); maxw = fx - lx - 60
    f = F_BLACK(30); tw = d.textlength(c['role'].upper(), font=f)
    rr(d, (lx, 330, lx + tw + 40, 382), 10, al(YELLOW, a)); d.text((lx + 20, 356), c['role'].upper(), font=f, fill=al(NAVY, a), anchor='lm')
    stext(d, (lx - 4, 500), c['name'], fit(d, c['name'], F_BLACK, 100, maxw), WHITE, a, sw=4)
    d.rectangle((lx, 524, lx + int(220 * a), 534), fill=al(PINK, a))
    for j, ft in enumerate(c['facts']):
        fa = ease((tt - g['t'] - 0.7 - 0.55 * j) / 0.3) * a
        if fa > 0: chip(d, lx - int(40 * (1 - fa)), 572 + j * 88, ft, fa)

def overlay(tt):
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    for g in groups:
        if g['card'] and g['t'] <= tt < g['end']: draw_card(ov, d, g, tt)
    ov.alpha_composite(LOGO_SH, (W - 60 - LOGO.width - 14, 34 - 10)); ov.alpha_composite(LOGO, (W - 60 - LOGO.width, 34))
    for s in segs:
        p = s['plan']; a0, a1 = s['t0'] - 0.1, s['re'] - (GAP if s['last_in_ch'] else 0)
        if not (s['rs'] <= tt <= s['re'] + 0.3): continue
        if s['id'] == 'sting':
            a = ease((tt - s['rs'] - 0.5) / 0.5) * (1 - ease((tt - (s['re'] - 0.3)) / 0.3))
            stext(d, (W / 2, H - 150), 'ВСЁ, ЧТО НУЖНО ЗНАТЬ', F_BLACK(92), WHITE, a, anchor='ms', sw=6)
            f2 = F_XB(46); tx = 'ПЕРЕД РЕЛИЗОМ GTA 6'; tw = d.textlength(tx, font=f2)
            rr(d, (W / 2 - tw / 2 - 34, H - 128, W / 2 + tw / 2 + 34, H - 54), 14, al(PINK, a)); d.text((W / 2, H - 91), tx, font=f2, fill=al(WHITE, a), anchor='mm')
            continue
        out = 1 - ease((tt - a1) / 0.25) if s['last_in_ch'] else 1.0
        if tt < a0: continue
        has_card = any(g['card'] and g['t'] <= tt < g['end'] for g in groups)
        if 'plate' in p:
            big, sub, kw = p['plate']; tin = cue(s, kw) if kw else a0 + 0.1
            a = ease((tt - tin) / 0.45) * out; dx = int(-80 * (1 - a))
            if a > 0:
                d.rectangle((70 + dx, H - 232, 82 + dx, H - 84), fill=al(PINK, a))
                stext(d, (112 + dx, H - 128), big, F_BLACK(104), WHITE, a); stext(d, (114 + dx, H - 82), sub, F_B(40), YELLOW, a, sw=3)
        if 'title' in p:
            big, sub, kin, kout = p['title']; tin, tout = cue(s, kin), cue(s, kout) - 0.3
            if tin <= tt <= tout + 0.3:
                a = ease((tt - tin) / 0.4) * (1 - ease((tt - tout) / 0.3)); sc = 0.85 + 0.15 * ease_back((tt - tin) / 0.45)
                stext(d, (W / 2, H - 210), big, F_BLACK(int(136 * sc)), WHITE, a, anchor='ms', sw=7)
                f2 = F_XB(50); tw = d.textlength(sub, font=f2)
                rr(d, (W / 2 - tw / 2 - 34, H - 178, W / 2 + tw / 2 + 34, H - 96), 14, al(PINK, 0.96 * a)); d.text((W / 2, H - 137), sub, font=f2, fill=al(WHITE, a), anchor='mm')
        if 'quote' in p:
            l1, l2, kin = p['quote']; tin = cue(s, kin) + 0.5; a = ease((tt - tin) / 0.5) * out
            if a > 0:
                stext(d, (W / 2, H - 200), l1, F_BLACK(76), WHITE, a, anchor='ms', sw=6); stext(d, (W / 2, H - 112), l2, F_BLACK(76), YELLOW, a, anchor='ms', sw=6)
        row = 0
        for text, kin in p.get('chips', []):
            tin = cue(s, kin)
            if tt >= tin:
                a = ease((tt - tin) / 0.3) * out; pop = int(46 * (1 - ease_back((tt - tin) / 0.35)))
                chip(d, 70 - pop, 136 + row * 86, text, a); row += 1
        for g in groups:
            if g['seg'] == s['id'] and g['place'] and g['t'] <= tt < g['end']:
                a = ease((tt - g['t']) / 0.3) * min(1, ease((g['end'] - tt) / 0.18)) * out; dx = int(-70 * (1 - a))
                d.rectangle((70 + dx, H - 214, 82 + dx, H - 96), fill=al(PINK, a)); stext(d, (112 + dx, H - 104), g['place'], F_BLACK(116), WHITE, a)
        if 'subscribe' in p:
            tin = cue(s, p['subscribe'])
            if tt >= tin:
                a = ease((tt - tin) / 0.25); sc = 0.7 + 0.3 * ease_back((tt - tin) / 0.4); bw, bh = int(560 * sc), int(120 * sc); cx, cy = W // 2, H - 150
                rr(d, (cx - bw // 2, cy - bh // 2, cx + bw // 2, cy + bh // 2), int(60 * sc), al(RED, a))
                d.text((cx, cy), 'ПОДПИСАТЬСЯ', font=F_BLACK(int(58 * sc)), fill=al(WHITE, a), anchor='mm')
    # chapter label + progress
    for ch, (c0, c1) in chap_span.items():
        if c0 - 0.05 <= tt <= c1:
            a = ease((tt - c0) / 0.35) * (1 - ease((tt - (c1 - GAP - 0.05)) / 0.25)); tx = f'{ch:02d}/{NCH:02d}   {CHAP[ch]}'
            f = F_BLACK(30); tw = d.textlength(tx, font=f); x = 70 - int(40 * (1 - a))
            rr(d, (x, 60, x + tw + 40, 112), 10, al(YELLOW, a)); d.text((x + 20, 86), tx, font=f, fill=al(NAVY, a), anchor='lm')
    # chapter bumpers
    for s in segs:
        if s['bump'] and s['rs'] <= tt < s['t0'] + 0.25:
            u = tt - s['rs']; a = ease(u / 0.22) * (1 - ease((tt - (s['t0'] - 0.1)) / 0.3))
            veil = Image.new('RGBA', (W, H), al((12, 8, 28), 0.74 * a)); ov.alpha_composite(veil); d = ImageDraw.Draw(ov)
            sl = int(90 * (1 - ease_back(u / 0.4)))
            f = F_BLACK(44); tx = f'ГЛАВА {s["ch"]:02d}'; tw = d.textlength(tx, font=f)
            rr(d, (W / 2 - tw / 2 - 28, 372 - sl, W / 2 + tw / 2 + 28, 444 - sl), 12, al(YELLOW, a)); d.text((W / 2, 408 - sl), tx, font=f, fill=al(NAVY, a), anchor='mm')
            d.text((W / 2, 560 + sl), CHAP[s['ch']], font=fit(d, CHAP[s['ch']], F_BLACK, 170, W - 300), fill=al(WHITE, a), anchor='mm')
            bw = int(260 * ease(u / 0.5)); d.rectangle((W / 2 - bw, 668, W / 2 + bw, 680), fill=al(PINK, a))
            if u < 0.2: ov.alpha_composite(Image.new('RGBA', (W, H), al(WHITE, 0.6 * (1 - u / 0.2)))); d = ImageDraw.Draw(ov)
    return ov

def frame_overlay(tt): return Image.alpha_composite(SHADE, overlay(tt))

if __name__ == '__main__':
    mode = sys.argv[1]
    if mode == 'plan':
        ev = dict(total=TOTAL, bumps=[s['rs'] for s in segs if s['bump']], sting=[s['rs'] for s in segs if s['id'] == 'sting'][0],
                  voice=[(s['id'], s['t0']) for s in segs if 'silent' not in s], chapters={k: v for k, v in chap_span.items()},
                  chips=[cue(s, k) for s in segs for _, k in s['plan'].get('chips', [])] + [g['t'] + 0.7 + 0.55 * j for g in groups if g['card'] for j in range(len(g['card']['facts']))],
                  cards=[g['t'] for g in groups if g['card']], cuts=[g['t'] for g in groups], outro=segs[-1]['t0'])
        json.dump(ev, open(os.path.join(ROOT, 'timeline.json'), 'w')); print('total', round(TOTAL, 2), 'groups', len(groups))
        for s in segs: print(s['id'], round(s['rs'], 2), round(s['t0'], 2), round(s['re'], 2), 'bump' if s['bump'] else '')
    elif mode == 'clips': build_clips()
    elif mode == 'still':
        bg = os.path.join(ROOT, 'bg.mp4')
        for x in sys.argv[2:]:
            tt = float(x); subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-ss', f'{tt:.3f}', '-i', bg, '-frames:v', '1', os.path.join(ROOT, 'f.png')])
            fr = Image.alpha_composite(Image.open(os.path.join(ROOT, 'f.png')).convert('RGBA'), frame_overlay(tt)).convert('RGB')
            fr.resize((960, 540)).save(os.path.join(ROOT, f'still_{tt:07.2f}.jpg'), quality=85)
    elif mode == 'render':
        out = sys.argv[2]; bg = os.path.join(ROOT, 'bg.mp4'); mix = os.path.join(ROOT, 'mix.wav')
        ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-i', bg, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-i', mix,
                               '-filter_complex', f'[0:v][1:v]overlay=shortest=1,fade=t=in:st=0:d=0.3,fade=t=out:st={TOTAL - 0.7:.2f}:d=0.7[v]',
                               '-map', '[v]', '-map', '2:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
                               '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', '-t', f'{TOTAL:.3f}', out], stdin=subprocess.PIPE)
        for i in range(NF):
            ff.stdin.write(frame_overlay(i / FPS).tobytes())
            if i % 600 == 0: print(i, '/', NF, flush=True)
        ff.stdin.close(); ff.wait(); print('done', out)

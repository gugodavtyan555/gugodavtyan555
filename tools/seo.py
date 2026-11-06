"""SEO post-processing, run after covers.py and before schema.py (see build.sh).
- shorter <title>/og:title (Google cuts ~60 chars), a few better meta descriptions
- contextual internal links inside article text
- visible "updated" date on articles
- WebP covers via <picture>, fetchpriority on the cover, lazy logos on comparison pages
- editorial-policy section on the About pages and help links in the responsible-gambling articles
Idempotent for generator output (generators rewrite the pages on every build)."""
import os, re, glob, html
from PIL import Image
ROOT = "/home/user/gugodavtyan555/ru-site"
BRAND = " | Lucky Spin Club"
ARTICLES_UPDATED = {"ru": "6 ноября 2026", "en": "6 November 2026", "es": "6 de noviembre de 2026", "pt": "6 de novembro de 2026"}
UPD_LABEL = {"ru": "Обновлено", "en": "Updated", "es": "Actualizado", "pt": "Atualizado"}

TITLES = {
 'index.html': 'Онлайн-казино: бонусы, фриспины и вейджер — гид для новичков',
 'es/index.html': 'Casinos online: bonos, giros gratis y requisito de apuesta',
 'pt/index.html': 'Cassinos online: bônus, giros grátis e rollover explicados',
 'en/index.html': 'Online casino guide: bonuses, wagering and free spins',
 'kazino.html': 'Сравнение онлайн-казино: подбор по стране и валюте',
 'es/kazino.html': 'Comparar casinos online: elige por país y moneda',
 'pt/kazino.html': 'Comparar cassinos online: escolha por país e moeda',
 "articles/kak-poluchit-bonus.html": "Как получить бонус в онлайн-казино: пошаговая инструкция",
 "kalkulyator.html": "Калькулятор вейджера: сколько отыграть и выгоден ли бонус",
 "en/articles/kak-poluchit-bonus.html": "How to get a casino welcome bonus: step-by-step guide",
 "en/articles/kak-vyvesti-dengi.html": "Casino withdrawals: verification, timing and tips",
 "es/articles/kak-poluchit-bonus.html": "Cómo obtener el bono de bienvenida del casino: paso a paso",
 "es/articles/kak-vyvesti-dengi.html": "Retirar dinero de un casino online: verificación y plazos",
 "es/articles/chto-takoe-vejdzher.html": "Requisito de apuesta en el casino: qué es y cómo cumplirlo",
 "es/articles/kriptokazino.html": "Casino cripto: cómo jugar con criptomonedas (guía)",
 "es/kalkulyator-bankrolla.html": "Calculadora de bankroll: ¿cuántos giros te alcanzan?",
 "es/kalkulyator.html": "Calculadora de requisito de apuesta: ¿conviene el bono?",
 "pt/articles/kak-poluchit-bonus.html": "Como pegar o bônus de boas-vindas do cassino: passo a passo",
 "pt/articles/kak-vyvesti-dengi.html": "Sacar dinheiro do cassino online: verificação e prazos",
 "pt/articles/kriptokazino.html": "Cassino cripto: como jogar com criptomoedas (guia)",
 "pt/kalkulyator.html": "Calculadora de rollover: quanto apostar e se compensa",
}
DESCS = {
 'index.html': 'Гид по онлайн-казино для новичков: как получить бонус и фриспины, отыграть вейджер и вывести деньги. Сравнение казино, калькуляторы и тесты. 18+',
 'es/index.html': 'Guía de casinos online para principiantes: bonos, giros gratis, requisito de apuesta y retiros. Comparación de casinos, calculadoras y tests. 18+',
 'pt/index.html': 'Guia de cassinos online para iniciantes: bônus, giros grátis, rollover e saques. Comparação de cassinos, calculadoras e testes gratuitos. 18+',
 'en/index.html': "A beginner's guide to online casinos: welcome bonuses, free spins, wagering requirements and withdrawals, plus a comparison of casinos. 18+",
 'kazino.html': 'Сравнение онлайн-казино с подбором за 10 секунд: выберите страну и валюту счёта (RUB, KZT, USD, EUR, крипто) и смотрите, какие казино подходят. 18+',
 'es/kazino.html': 'Compara casinos online y encuentra el tuyo en 10 segundos: elige tu país y la moneda de la cuenta y mira qué casinos aceptan jugadores como tú. 18+',
 'pt/kazino.html': 'Compare cassinos online e encontre o seu em 10 segundos: escolha seu país e a moeda da conta e veja quais cassinos aceitam jogadores como você. 18+',
 "articles/otvetstvennaya-igra.html": "Как играть ответственно: лимиты времени и денег, признаки игровой зависимости и где получить бесплатную анонимную помощь. 18+",
 "en/articles/otvetstvennaya-igra.html": "How to gamble responsibly: time and money limits, warning signs of problem gambling and where to get free, confidential help. 18+",
 "es/articles/otvetstvennaya-igra.html": "Cómo jugar de forma responsable: límites de tiempo y dinero, señales de alerta de la adicción al juego y dónde pedir ayuda gratuita. 18+",
 "pt/articles/otvetstvennaya-igra.html": "Como jogar com responsabilidade: limites de tempo e dinheiro, sinais de alerta do vício em jogo e onde buscar ajuda gratuita. 18+",
}

# term regex -> target article slug (first match per target, max 4 links per article, never to itself)
LINKS = {
 "ru": [(r"вейджер\w*", "chto-takoe-vejdzher"), (r"фриспин\w*", "frispiny"), (r"\bRTP\b|игровы\w* автомат\w*|слот\w*", "kak-rabotayut-sloty"),
        (r"верификаци\w*", "verifikaciya"), (r"криптовалют\w*", "kriptokazino"), (r"демо-режим\w*", "demo-rezhim"),
        (r"живы\w* дилер\w*", "live-kazino"), (r"рулетк\w*", "kak-igrat-v-ruletku"), (r"блэкджек\w*", "blekdzhek-pravila"),
        (r"вывод\w*", "kak-vyvesti-dengi"), (r"приветственн\w* бонус\w*|бонус\w*", "kak-poluchit-bonus"), (r"банкролл\w*", "../kalkulyator-bankrolla"),
        (r"ответственн\w* игр\w*", "otvetstvennaya-igra"), (r"с телефона", "mobilnoe-kazino")],
 "en": [(r"wagering(?: requirements?)?", "chto-takoe-vejdzher"), (r"\bRTP\b|\bslots?\b", "kak-rabotayut-sloty"), (r"welcome bonus(?:es)?|\bbonus(?:es)?\b", "kak-poluchit-bonus"),
        (r"withdrawals?", "kak-vyvesti-dengi"), (r"responsible gambling", "otvetstvennaya-igra")],
 "es": [(r"requisitos? de apuesta", "chto-takoe-vejdzher"), (r"giros gratis", "frispiny"), (r"\bRTP\b|tragamonedas", "kak-rabotayut-sloty"),
        (r"criptomonedas?", "kriptokazino"), (r"bonos? de bienvenida|\bbonos?\b", "kak-poluchit-bonus"), (r"retiros?\b|retirar (?:el )?dinero", "kak-vyvesti-dengi"),
        (r"juego responsable", "otvetstvennaya-igra"), (r"verificación", "verifikaciya"), (r"\bruleta\b", "kak-igrat-v-ruletku"),
        (r"\bblackjack\b", "blekdzhek-pravila"), (r"modo demo", "demo-rezhim"), (r"en vivo", "live-kazino"), (r"\bcelular\b|\bmóvil\b", "mobilnoe-kazino"), (r"\bbankroll\b", "../kalkulyator-bankrolla")],
 "pt": [(r"\brollover\b", "chto-takoe-vejdzher"), (r"giros grátis", "frispiny"), (r"\bRTP\b|caça-níqueis", "kak-rabotayut-sloty"),
        (r"criptomoedas?", "kriptokazino"), (r"bônus de boas-vindas|\bbônus\b", "kak-poluchit-bonus"), (r"\bsaques?\b|sacar (?:o )?dinheiro", "kak-vyvesti-dengi"),
        (r"jogo responsável", "otvetstvennaya-igra"), (r"verificação", "verifikaciya"), (r"\broleta\b", "kak-igrat-v-ruletku"),
        (r"\bblackjack\b", "blekdzhek-pravila"), (r"modo demo", "demo-rezhim"), (r"ao vivo", "live-kazino"), (r"\bcelular\b", "mobilnoe-kazino"), (r"\bbanca\b", "../kalkulyator-bankrolla")],
}
MAX_LINKS = 4

EDITORIAL = {
 "ru": ("Важно", '''<h2>Как мы готовим материалы</h2>
<ul><li>Статьи объясняют общие правила: как устроены бонусы, вейджер, RTP, платежи и верификация. Мы опираемся на условия, которые публикуют сами казино, на правила игр и на описания слотов от их разработчиков.</li><li>Цифры в примерах — это расчёты для наглядности, а не обещания. Формулы наших калькуляторов открыты и описаны на их страницах.</li><li>Данные о конкретных казино (страны, валюты, языки) мы берём из условий партнёрских программ и обновляем, когда они меняются.</li><li>У каждой статьи указана дата обновления. Нашли ошибку — напишите нам в Telegram, мы исправим её и обновим дату.</li></ul>
'''),
 "en": ("Important", '''<h2>How we prepare our content</h2>
<ul><li>Our articles explain general rules: how bonuses, wagering, RTP, payments and verification work. We rely on the terms published by the casinos themselves, on game rules and on slot descriptions from their developers.</li><li>Numbers in examples are illustrative calculations, not promises.</li><li>Facts about specific casinos (countries, currencies, languages) come from the affiliate programmes' terms and are updated when they change.</li><li>Every article shows when it was last updated. If you spot a mistake, message us on Telegram and we will fix it and update the date.</li></ul>
'''),
 "es": ("Importante", '''<h2>Cómo preparamos el contenido</h2>
<ul><li>Los artículos explican reglas generales: cómo funcionan los bonos, el requisito de apuesta, el RTP, los pagos y la verificación. Nos basamos en las condiciones que publican los propios casinos, en las reglas de los juegos y en las descripciones de las tragamonedas de sus desarrolladores.</li><li>Las cifras de los ejemplos son cálculos ilustrativos, no promesas. Las fórmulas de nuestras calculadoras están explicadas en sus páginas.</li><li>Los datos de cada casino (países, monedas, idiomas) provienen de las condiciones de los programas de afiliados y se actualizan cuando cambian.</li><li>Cada artículo muestra su fecha de actualización. Si encuentras un error, escríbenos por Telegram: lo corregiremos y actualizaremos la fecha.</li></ul>
'''),
 "pt": ("Importante", '''<h2>Como preparamos o conteúdo</h2>
<ul><li>Os artigos explicam regras gerais: como funcionam bônus, rollover, RTP, pagamentos e verificação. Nos baseamos nas condições publicadas pelos próprios cassinos, nas regras dos jogos e nas descrições dos caça-níqueis feitas pelos desenvolvedores.</li><li>Os números dos exemplos são cálculos ilustrativos, não promessas. As fórmulas das nossas calculadoras estão explicadas nas páginas delas.</li><li>Os dados de cada cassino (países, moedas, idiomas) vêm das condições dos programas de afiliados e são atualizados quando mudam.</li><li>Cada artigo mostra a data de atualização. Se encontrar um erro, fale com a gente pelo Telegram: vamos corrigir e atualizar a data.</li></ul>
'''),
}
HELP = {
 "ru": '''<h2>Где получить бесплатную помощь</h2>
<ul><li><a href="https://www.gamblersanonymous.org/" target="_blank" rel="noopener">Gamblers Anonymous</a> — международное сообщество взаимопомощи «Анонимные игроки».</li><li><a href="https://www.gamblingtherapy.org/" target="_blank" rel="noopener">Gambling Therapy</a> — бесплатная анонимная онлайн-поддержка для игроков и их близких.</li></ul>
''',
 "en": '''<h2>Where to get free help</h2>
<ul><li><a href="https://www.gamblersanonymous.org/" target="_blank" rel="noopener">Gamblers Anonymous</a> — an international fellowship of mutual support.</li><li><a href="https://www.gamblingtherapy.org/" target="_blank" rel="noopener">Gambling Therapy</a> — free, confidential online support for gamblers and their families.</li></ul>
''',
 "es": '''<h2>Dónde pedir ayuda gratuita</h2>
<ul><li><a href="https://www.gamblersanonymous.org/" target="_blank" rel="noopener">Gamblers Anonymous (Jugadores Anónimos)</a>: comunidad internacional de ayuda mutua.</li><li><a href="https://www.gamblingtherapy.org/" target="_blank" rel="noopener">Gambling Therapy</a>: apoyo en línea gratuito y confidencial para jugadores y sus familias.</li></ul>
''',
 "pt": '''<h2>Onde buscar ajuda gratuita</h2>
<ul><li><a href="https://www.gamblersanonymous.org/" target="_blank" rel="noopener">Gamblers Anonymous (Jogadores Anônimos)</a>: comunidade internacional de ajuda mútua.</li><li><a href="https://www.gamblingtherapy.org/" target="_blank" rel="noopener">Gambling Therapy</a>: apoio online gratuito e confidencial para jogadores e familiares.</li></ul>
''',
}

def lang_of(rel):
    first = rel.split("/")[0]
    return first if first in ("en", "es", "pt") else "ru"

def link_terms(region, lg, own, existing):
    """Add up to MAX_LINKS links inside <p>/<li> text of an article body region."""
    used = set(existing) | {own}
    count = [0]
    def do_block(m):
        block = m.group(0)
        parts = re.split(r"(<[^>]+>)", block)
        depth_a = 0
        for i, part in enumerate(parts):
            if part.startswith("<"):
                if re.match(r"<a[\s>]", part): depth_a += 1
                elif part.startswith("</a"): depth_a -= 1
                continue
            if depth_a or not part.strip() or count[0] >= MAX_LINKS: continue
            for rx, target in LINKS[lg]:
                if target in used or count[0] >= MAX_LINKS: continue
                mm = re.search(rx, part, re.I)
                if not mm: continue
                part = part[:mm.start()] + f'<a href="{target}.html">{mm.group(0)}</a>' + part[mm.end():]
                used.add(target); count[0] += 1
                # re-split is unnecessary: later terms may only match outside the new link
                break
            parts[i] = part
        return "".join(parts)
    return re.sub(r"<(p|li|dd)>.*?</\1>", do_block, region, flags=re.S)

# 1) WebP versions of the covers
for jpg in glob.glob(os.path.join(ROOT, "images", "*", "*.jpg")):
    if "/logos/" in jpg: continue
    webp = jpg[:-4] + ".webp"
    if not os.path.exists(webp) or os.path.getmtime(webp) < os.path.getmtime(jpg):
        Image.open(jpg).save(webp, "WEBP", quality=78, method=6)
    small = jpg[:-4] + "-600.webp"
    if not os.path.exists(small) or os.path.getmtime(small) < os.path.getmtime(jpg):
        im = Image.open(jpg); im.resize((600, round(im.height * 600 / im.width)), Image.LANCZOS).save(small, "WEBP", quality=78, method=6)
for jpg in glob.glob(os.path.join(ROOT, "images", "logos", "*.jpg")):
    webp = jpg[:-4] + ".webp"
    if not os.path.exists(webp) or os.path.getmtime(webp) < os.path.getmtime(jpg):
        Image.open(jpg).save(webp, "WEBP", quality=82, method=6)
EMBED_LABEL = {"ru": "Код для вставки", "en": "Embed code", "es": "Código para insertar", "pt": "Código para incorporar"}

for full in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True):
    rel = os.path.relpath(full, ROOT)
    if rel == "404.html" or rel.startswith("widget/"): continue
    lg = lang_of(rel)
    src = open(full).read()
    # titles
    tm = re.search(r"<title>(.*?)</title>", src)
    if tm:
        t = html.unescape(tm.group(1))
        new = TITLES.get(rel) or (t[:-len(BRAND)] if t.endswith(BRAND) and len(t) > 60 else t)
        if new != t:
            e = html.escape(new, quote=True)
            src = src.replace(tm.group(0), f"<title>{e}</title>", 1)
            src = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{e}">', src, count=1)
    if rel in DESCS:
        e = html.escape(DESCS[rel], quote=True)
        src = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{e}">', src, count=1)
        src = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{e}">', src, count=1)
    is_article = "/articles/" in "/" + rel and not rel.endswith("articles/index.html")
    if is_article:
        slug = os.path.basename(rel)[:-5]
        # cover -> <picture> with WebP, high priority (it is the LCP image)
        def pic(m):
            img = m.group(0)
            if "fetchpriority" not in img:
                img = img.replace(">", ' fetchpriority="high" decoding="async">', 1)
            base = re.search(r'src="([^"]+)\.jpg"', img).group(1)
            return (f'<picture><source type="image/webp" srcset="{base}-600.webp 600w, {base}.webp 1200w" '
                    f'sizes="(max-width: 860px) 100vw, 820px">{img}</picture>')
        if "<picture>" not in src:
            src = re.sub(r'<img class="cover"[^>]*>', pic, src, count=1)
        # visible updated date right after the cover
        if 'class="updated"' not in src:
            src = re.sub(r"(</picture>)", r'\1\n      <p class="updated">' + UPD_LABEL[lg] + ": " + ARTICLES_UPDATED[lg] + "</p>", src, count=1)
        # contextual links in the article body (between the cover and the CTA box / FAQ / end of article)
        start = src.find('class="updated"')
        ends = [i for i in (src.find('<div class="box', start), src.find('<section class="faq"', start), src.find("</article>", start)) if i > 0]
        end = min(ends)
        region = src[start:end]
        existing = re.findall(r'<a href="([a-z0-9-]+)\.html"', region)
        if 'data-ilink' not in region:
            region = link_terms(region, lg, slug, existing)
            src = src[:start] + region + src[end:]
        if slug == "otvetstvennaya-igra" and "gamblingtherapy.org" not in src:
            pos = src.find('<section class="faq"')
            if pos < 0: pos = src.find("</article>")
            src = src[:pos] + HELP[lg] + src[pos:]
    # casino logos: WebP with JPEG fallback
    src = re.sub(r'(?<!<picture>)(<img (?:loading="lazy" )?class="logo" src="([^"]+)\.jpg"[^>]*>)',
                 lambda m: f'<picture><source type="image/webp" srcset="{m.group(2)}.webp">{m.group(1)}</picture>', src)
    if 'id="embed-code"' in src and 'aria-label' not in src.split('id="embed-code"')[1][:80]:
        src = src.replace('id="embed-code"', f'id="embed-code" aria-label="{EMBED_LABEL[lg]}"', 1)
    # "which casino suits me" finder above the cards
    if os.path.basename(rel) == "kazino.html" and 'id="finder"' not in src:
        root = "../" * rel.count("/")
        src = src.replace('<section class="casinos">', f'<section id="finder" class="calc finder" data-lang="{lg}"></section>\n    <section class="casinos">', 1)
        src = src.replace("</body>", f'<script src="{root}finder.js" defer></script>\n</body>', 1)
    # casino finder on the language home pages, built from that language's comparison page (same casinos, same facts)
    if rel in ("index.html", "en/index.html", "es/index.html", "pt/index.html") and 'id="finder"' not in src:
        root = "../" * rel.count("/")
        kz = open(os.path.join(ROOT, os.path.dirname(rel), "kazino.html")).read()
        ids = re.findall(r'class="btn casino-ref" data-casino="([a-z]+)"', kz)
        NAMES = {"jozz": "Jozz", "playfortuna": "Play Fortuna", "booi": "Booi", "winity": "Winity", "spincrypto": "SpinCrypto"}
        GO = {"ru": "Перейти в", "en": "Go to", "es": "Ir a", "pt": "Ir para"}[lg]
        MORE = {"ru": "Подробнее", "en": "Details", "es": "Detalles", "pt": "Detalhes"}[lg]
        ALL = {"ru": "Сравнить все казино →", "en": "Compare all casinos →", "es": "Comparar todos los casinos →", "pt": "Comparar todos os cassinos →"}[lg]
        cards = "".join(f'<div class="casino fh-item"><picture><source type="image/webp" srcset="{root}images/logos/{i}.webp"><img class="logo" loading="lazy" src="{root}images/logos/{i}.jpg" width="260" height="146" alt="{NAMES[i]}"></picture>'
                        f'<div class="fh-actions"><a class="btn small casino-ref" data-casino="{i}" href="#">{GO} {NAMES[i]}</a><a class="more-link" href="kazino/{i}.html">{MORE}</a></div></div>' for i in ids)
        block = (f'<section class="home-finder"><div id="finder" class="calc finder" data-lang="{lg}"></div>'
                 f'<div class="fh-list">{cards}</div><p class="hub-link"><a href="kazino.html">{ALL}</a></p></section>\n')
        src = re.sub(r'(<section class="hero">.*?</section>\n)', lambda m: m.group(1) + "    " + block, src, count=1, flags=re.S)
        src = src.replace("</body>", f'<script src="{root}finder.js" defer></script>\n</body>', 1)
    # lazy-load logos below the first card on comparison pages
    if os.path.basename(rel) == "kazino.html":
        n = [0]
        def lazy(m):
            n[0] += 1
            img = m.group(0)
            return img if n[0] == 1 or "loading=" in img else img.replace("<img ", '<img loading="lazy" ', 1)
        src = re.sub(r'<img class="logo"[^>]*>', lazy, src)
    # editorial policy on About pages
    if os.path.basename(rel) == "o-sajte.html" and "<h2>" + EDITORIAL[lg][0] + "</h2>" in src and EDITORIAL[lg][1].split("\n")[0] not in src:
        src = src.replace("<h2>" + EDITORIAL[lg][0] + "</h2>", EDITORIAL[lg][1] + "<h2>" + EDITORIAL[lg][0] + "</h2>", 1)
        src = re.sub(r'(<p class="note">[^:<]+: )[^<]+(</p>)', lambda m: m.group(1) + ARTICLES_UPDATED[lg] + ("" if lg != "ru" else " г.") + m.group(2), src, count=1)
    open(full, "w").write(src)

# Netlify caching for images (CSS/JS keep the default revalidation, so edits show up at once)
open(os.path.join(ROOT, "_headers"), "w").write("""/images/*
  Cache-Control: public, max-age=604800
/og-*.png
  Cache-Control: public, max-age=604800
""")
print("seo: done")

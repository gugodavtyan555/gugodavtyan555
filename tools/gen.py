import os
ROOT = "/home/user/gugodavtyan555/ru-site"
BASE = "https://lucky-spin-ru.netlify.app"
import datetime
TODAY = datetime.date.today().isoformat()

I18N_LANGS = ["en", "es", "pt"]
I18N_PAGES = {"index.html", "kazino.html", "articles/kak-poluchit-bonus.html", "articles/chto-takoe-vejdzher.html",
              "articles/kak-rabotayut-sloty.html", "articles/kak-vyvesti-dengi.html", "articles/otvetstvennaya-igra.html",
              "o-sajte.html", "privacy.html", "stati.html"}
def lang_url(lang, path):
    pre = "" if lang == "ru" else lang + "/"
    return BASE + "/" + pre + ("" if path == "index.html" else path)
_MORE7 = {f"articles/{_s}.html" for _s in ["blekdzhek-pravila", "kak-igrat-v-ruletku", "demo-rezhim", "live-kazino", "mobilnoe-kazino", "verifikaciya", "kak-vybrat-kazino"]}
I18N_EXTRA = {"es": {"articles/frispiny.html", "articles/kriptokazino.html", "articles/slovar-kazino.html"} | _MORE7,
              "pt": {"articles/frispiny.html", "articles/kriptokazino.html", "articles/slovar-kazino.html"} | _MORE7}
for _cl in ("es", "pt"):
    I18N_EXTRA[_cl].update({"kalkulyator.html", "kalkulyator-bankrolla.html", "viktorina.html", "samoproverka.html"})
exec(open("/tmp/claude-0/-workspace/8aeb4342-0200-5c82-93a5-effabca2f09f/scratchpad/calc_pages.py").read(), globals())
exec(open("/tmp/claude-0/-workspace/8aeb4342-0200-5c82-93a5-effabca2f09f/scratchpad/bank_pages.py").read(), globals())
BANK_ARTS = {"kak-rabotayut-sloty", "otvetstvennaya-igra"}
exec(open("/tmp/claude-0/-workspace/8aeb4342-0200-5c82-93a5-effabca2f09f/scratchpad/hub.py").read(), globals())
exec(open("/tmp/claude-0/-workspace/8aeb4342-0200-5c82-93a5-effabca2f09f/scratchpad/quiz_pages.py").read(), globals())
CALC_ARTS = {"chto-takoe-vejdzher", "kak-poluchit-bonus", "frispiny"}
def calc_promo(lg, pre):
    t = CT2[lg]
    return f'<div class="box calc-promo"><p>{t["promo"]}</p><a class="btn small" href="{pre}kalkulyator.html">{t["promo_btn"]}</a></div>'
def has_lang(lg, path):
    return lg == "ru" or path in I18N_PAGES or path in I18N_EXTRA.get(lg, set())
def lang_switch(cur, path, p):
    out = []
    for lg in ["ru"] + I18N_LANGS:
        target = path if has_lang(lg, path) else "index.html"
        href = p + ("" if lg == "ru" else lg + "/") + target
        cls = ' aria-current="true"' if lg == cur else ""
        out.append(f'<a href="{href}" hreflang="{lg}"{cls}>{lg.upper()}</a>')
    return '<span class="langs">' + "".join(out) + '</span>'
def hreflangs(path):
    langs = ["ru"] + [lg for lg in I18N_LANGS if has_lang(lg, path)]
    s = "".join(f'<link rel="alternate" hreflang="{lg}" href="{lang_url(lg, path)}">\n' for lg in langs)
    return s + f'<link rel="alternate" hreflang="x-default" href="{lang_url("ru", path)}">\n'

def page(path, title, desc, body, depth, extra_head=""):
    p = "../" * depth
    url = BASE + "/" + ("" if path == "index.html" else path)
    verify = '<meta name="google-site-verification" content="8wwTJN9i9_BR2zwajA3o1eTd9Nbl8dZbW6aNescF60Q">\n<meta name="yandex-verification" content="64ac3949b2397424">\n' if path == "index.html" else ""
    html = f'''<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
{verify}<meta name="robots" content="index, follow">
<link rel="canonical" href="{url}">
<meta property="og:url" content="{url}">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:locale" content="ru_RU">
{hreflangs(path)}<meta property="og:image" content="{BASE}/og-ru.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎰</text></svg>">
<!-- Yandex.Metrika counter -->
<script>
window.lscLoadMetrika = function () {{
if (window.lscMetrikaLoaded) return; window.lscMetrikaLoaded = true;
(function(m,e,t,r,i,k,a){{m[i]=m[i]||function(){{(m[i].a=m[i].a||[]).push(arguments)}};
m[i].l=1*new Date();
for (var j = 0; j < document.scripts.length; j++) {{if (document.scripts[j].src === r) {{ return; }}}}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)}})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js?id=114096229", "ym");
ym(114096229, "init", {{ssr:true, clickmap:true, accurateTrackBounce:true, trackLinks:true}});
}};
try {{ if (localStorage.getItem("lsc_consent") === "yes") window.lscLoadMetrika(); }} catch (e) {{}}
</script>
<!-- /Yandex.Metrika counter -->
<link rel="alternate" type="application/rss+xml" title="Lucky Spin Club — статьи" href="{BASE}/rss.xml">
<link rel="stylesheet" href="{p}style.css">
{extra_head}
</head>
<body>
<div class="wrap">
  <header>
    <a class="logo" href="{p}index.html">🎰 Lucky <span>Spin</span> Club</a>
    <nav>
      <a class="link" href="{p}kazino.html">Казино</a>
      <a class="link" href="{p}stati.html">Статьи</a>
      <a class="link" href="https://t.me/luckyspinclub_ru" target="_blank" rel="noopener">Telegram</a>
      {lang_switch("ru", path, p)}
      <span class="badge18">18+</span>
      <a class="btn small ref" href="#">Регистрация</a>
    </nav>
  </header>
  <main>
{body}
    <section class="tg">
      <div class="tg-ico" aria-hidden="true">📣</div>
      <div class="tg-text">
        <h2>Наш Telegram-канал</h2>
        <p>Новая полезная статья о казино каждый день: бонусы, правила игр и советы для новичков.</p>
      </div>
      <a class="btn tg-btn" href="https://t.me/luckyspinclub_ru" target="_blank" rel="noopener">Подписаться</a>
    </section>
  </main>
  <footer>
    <p>Сайт носит информационно-рекламный характер и содержит партнёрские (реферальные) ссылки. При регистрации по ним владелец сайта может получить вознаграждение.</p>
    <p>Азартные игры доступны только лицам старше 18 лет. Убедитесь, что онлайн-казино разрешены в вашей стране. Условия бонусов смотрите на сайте казино.</p>
    <p>18+ · Играйте ответственно · <a href="{p}articles/otvetstvennaya-igra.html">Ответственная игра</a> · <a href="{p}o-sajte.html">О сайте</a> · <a href="{p}privacy.html">Конфиденциальность</a> · © <span class="year"></span> Lucky Spin Club</p>
  </footer>
</div>
<script src="{p}config.js"></script>
</body>
</html>
'''
    html = html.replace('class="btn small ref" href="#"', f'class="btn small ref" href="{p}kazino.html"').replace('class="btn ref" href="#"', f'class="btn ref" href="{p}kazino.html"')
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, "w").write(html)

def cta(text="Зарегистрироваться и получить бонус"):
    return f'''<div class="box"><p>Готовы попробовать? Регистрация занимает около минуты.</p><a class="btn ref" href="#">🎁 {text}</a><div class="note">18+ · Условия бонуса — на сайте казино</div></div>'''

ARTICLES = [
 ("kak-poluchit-bonus", "🎁", "Как получить приветственный бонус", "Пошагово: регистрация, первый депозит и активация бонуса.",
  "Как получить приветственный бонус в онлайн-казино — пошаговая инструкция",
  "Как зарегистрироваться в онлайн-казино и получить приветственный бонус: пошаговая инструкция, вейджер и частые ошибки новичков.",
  f'''<p>Приветственный бонус — это специальное предложение для новых игроков. Обычно его дают за первый депозит. Ниже — как получить его без ошибок.</p>
<h2>Шаг 1. Регистрация</h2>
<p>Нажмите кнопку «Регистрация» на нашем сайте. Вы попадёте на официальную страницу регистрации казино. Укажите email или телефон, придумайте пароль и выберите валюту счёта. Валюту потом часто нельзя поменять, поэтому выбирайте ту, в которой будете пополнять счёт.</p>
<h2>Шаг 2. Подтверждение аккаунта</h2>
<p>Подтвердите почту или телефон. Позже казино может попросить документы для верификации — обычно перед первым выводом денег. Указывайте настоящие данные, иначе вывод могут заблокировать.</p>
<h2>Шаг 3. Первый депозит</h2>
<p>Перед пополнением откройте раздел «Бонусы» и посмотрите минимальную сумму депозита для бонуса. Если пополнить меньше — бонус не начислится.</p>
<h2>Шаг 4. Что такое вейджер</h2>
<p>Вейджер — это сколько раз нужно прокрутить бонус, прежде чем его можно вывести. Например, бонус 1000 ₽ с вейджером x35 означает, что нужно сделать ставок на 35 000 ₽. Чем меньше вейджер, тем выгоднее бонус.</p>
<h2>Частые ошибки</h2>
<ul>
<li>Не прочитать условия бонуса до депозита.</li>
<li>Делать ставки больше максимально разрешённой при отыгрыше — бонус могут аннулировать.</li>
<li>Играть в игры, которые не участвуют в отыгрыше.</li>
<li>Создавать второй аккаунт — это запрещено правилами.</li>
</ul>
{cta()}'''),
 ("kak-rabotayut-sloty", "🎰", "Как работают слоты", "RTP, волатильность и генератор случайных чисел простыми словами.",
  "Как работают игровые автоматы: RTP, волатильность и ГСЧ",
  "Как устроены онлайн-слоты: что такое RTP, волатильность и генератор случайных чисел. Простое объяснение для новичков.",
  f'''<p>Слоты — самые популярные игры в онлайн-казино. Разберёмся, как они устроены, чтобы играть осознанно.</p>
<h2>Генератор случайных чисел (ГСЧ)</h2>
<p>Результат каждого вращения определяет генератор случайных чисел. Каждый спин независим от предыдущего: автомат не «помнит» прошлые проигрыши и не «должен» выдать выигрыш. Никаких выигрышных схем для слотов не существует.</p>
<h2>RTP — процент возврата</h2>
<p>RTP (Return to Player) показывает, какую долю ставок слот возвращает игрокам на очень длинной дистанции. Например, RTP 96% означает, что в среднем из каждых 100 ₽ ставок 96 ₽ возвращаются в виде выигрышей, а 4 ₽ — преимущество казино. На коротком отрезке результат может сильно отличаться в любую сторону.</p>
<h2>Волатильность</h2>
<ul>
<li><strong>Низкая</strong> — выигрыши частые, но небольшие.</li>
<li><strong>Средняя</strong> — баланс между частотой и размером.</li>
<li><strong>Высокая</strong> — выигрыши редкие, но могут быть крупными. Баланс может долго уменьшаться.</li>
</ul>
<h2>Бонусные функции</h2>
<p>Во многих слотах есть фриспины, множители и бонусные раунды. Описание всегда есть в разделе «Правила» или «Таблица выплат» внутри игры — загляните туда перед началом.</p>
<h2>Совет</h2>
<p>Попробуйте демо-режим, если он доступен: так можно понять игру без риска для денег.</p>
{cta()}'''),
 ("kak-vybrat-kazino", "🔎", "Как выбрать онлайн-казино", "Лицензия, платежи, поддержка и условия бонусов.",
  "Как выбрать надёжное онлайн-казино: 6 критериев",
  "На что смотреть при выборе онлайн-казино: лицензия, способы оплаты, вывод средств, поддержка и честные условия бонусов.",
  f'''<p>Перед регистрацией стоит проверить несколько вещей. Это займёт пять минут и убережёт от неприятных сюрпризов.</p>
<h2>1. Лицензия</h2>
<p>Информация о лицензии обычно указана внизу сайта казино. Проверьте номер лицензии на сайте регулятора, который её выдал.</p>
<h2>2. Способы пополнения и вывода</h2>
<p>Убедитесь, что есть удобные для вас способы оплаты. Посмотрите минимальные суммы и сроки вывода в разделе «Платежи» или «FAQ».</p>
<h2>3. Условия бонусов</h2>
<p>Сравните вейджер, срок отыгрыша и максимальную ставку. Большой бонус с вейджером x60 часто менее выгоден, чем небольшой с x20.</p>
<h2>4. Служба поддержки</h2>
<p>Напишите в чат поддержки до регистрации и задайте вопрос. Быстрый и понятный ответ — хороший знак.</p>
<h2>5. Инструменты ответственной игры</h2>
<p>У надёжного казино есть лимиты депозитов, напоминания о времени и самоисключение.</p>
<h2>6. Язык и валюта</h2>
<p>Проверьте, есть ли сайт на русском языке и можно ли открыть счёт в вашей валюте.</p>
{cta("Перейти к регистрации")}'''),
 ("kak-vyvesti-dengi", "💸", "Как вывести выигрыш", "Верификация, сроки и почему вывод могут задержать.",
  "Как вывести деньги из онлайн-казино: верификация и сроки",
  "Как вывести выигрыш из онлайн-казино: верификация аккаунта, сроки выплат, лимиты и частые причины задержек.",
  f'''<p>Выигрыш приятно не только получить, но и вывести. Вот что нужно знать заранее.</p>
<h2>Верификация</h2>
<p>Перед первым выводом казино обычно просит подтвердить личность: фото документа и иногда подтверждение способа оплаты. Это стандартная проверка. Пройти её лучше заранее, чтобы потом не ждать.</p>
<h2>Тот же способ, что и для пополнения</h2>
<p>Часто вывод возможен только на тот же кошелёк или карту, с которых было пополнение.</p>
<h2>Сроки</h2>
<p>Заявка сначала проходит проверку в казино, затем деньги отправляются платёжной системой. Точные сроки указаны в разделе «Платежи».</p>
<h2>Почему вывод могут задержать</h2>
<ul>
<li>Не пройдена верификация.</li>
<li>Не отыгран активный бонус.</li>
<li>Данные в профиле не совпадают с документами.</li>
<li>Сумма меньше минимальной или больше лимита.</li>
</ul>
{cta()}'''),
 ("otvetstvennaya-igra", "🛡️", "Ответственная игра", "Как играть с удовольствием и не терять контроль.",
  "Ответственная игра: как сохранять контроль",
  "Правила ответственной игры: лимиты, признаки игровой зависимости и куда обратиться за помощью.",
  '''<p>Азартные игры — это развлечение, а не способ заработка. На длинной дистанции у казино всегда есть математическое преимущество.</p>
<h2>Простые правила</h2>
<ul>
<li>Играйте только на деньги, которые готовы потерять.</li>
<li>Заранее решите, сколько потратите, и не превышайте эту сумму.</li>
<li>Не пытайтесь «отыграться» после проигрыша.</li>
<li>Не играйте в долг, на кредитные деньги или деньги на важные расходы.</li>
<li>Делайте перерывы и следите за временем.</li>
</ul>
<h2>Инструменты казино</h2>
<p>В настройках аккаунта обычно можно поставить лимиты на депозиты, ставки и время, а также включить самоисключение на любой срок.</p>
<h2>Тревожные признаки</h2>
<ul>
<li>Вы играете дольше и тратите больше, чем планировали.</li>
<li>Скрываете игру от близких.</li>
<li>Игра влияет на работу, учёбу, сон или отношения.</li>
<li>Чувствуете раздражение, когда не можете играть.</li>
</ul>
<p>Если вы узнали себя — остановитесь и обратитесь за помощью к специалисту. Существуют бесплатные и анонимные службы поддержки, например сообщества Анонимных игроков (Gamblers Anonymous).</p>
<p><strong>Сайт предназначен только для лиц старше 18 лет.</strong></p>'''),
]
exec(open(__file__.replace('gen.py','more.py')).read())

for slug, ico, short, teaser, title, desc, content in ARTICLES:
    import json, html as _h
    exec(open("/tmp/claude-0/-workspace/8aeb4342-0200-5c82-93a5-effabca2f09f/scratchpad/faq.py").read(), globals())
    faq = FAQ.get(slug, [])
    faq_html = ""
    head = ""
    if faq:
        faq_html = '\n<section class="faq">\n<h2>Часто задаваемые вопросы</h2>\n' + "".join(
            f'<details><summary>{_h.escape(q)}</summary><p>{_h.escape(a)}</p></details>\n' for q, a in faq) + '</section>'
        ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]}
        head = '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>'
    _by = {a[0]: a for a in ARTICLES}
    rel = [r for r in RELATED.get(slug, []) if r in _by]
    rel_html = ""
    if rel:
        rel_html = '\n    <section class="related">\n      <h2>Похожие статьи</h2>\n      <div class="grid">\n' + "".join(
            f'        <a class="card" href="{r}.html"><div class="ico">{_by[r][1]}</div><h3>{_by[r][2]}</h3><p>{_by[r][3]}</p></a>\n' for r in rel) + '      </div>\n    </section>'
    body = f'''    <article>
      <div class="crumbs"><a href="../index.html">Главная</a> / <a href="../stati.html">Статьи</a> / {short}</div>
      <h1>{title}</h1>
{content}{calc_promo("ru", "../") if slug in CALC_ARTS else ""}{bank_promo("ru", "../") if slug in BANK_ARTS else ""}{selftest_promo("ru", "../") if slug == "otvetstvennaya-igra" else ""}{faq_html}
    </article>{rel_html}'''
    page(f"articles/{slug}.html", f"{title} | Lucky Spin Club", desc, body, 1, head)

cards = "\n".join(f'<a class="card" href="articles/{s}.html"><div class="ico">{i}</div><h3>{sh}</h3><p>{t}</p></a>' for s,i,sh,t,*_ in ARTICLES)
home = f'''    <section class="hero">
      <div class="slots">🍒 7️⃣ 💎</div>
      <h1>Онлайн-казино с<br><em>приветственным бонусом</em></h1>
      <p>Сотни слотов, рулетка, блэкджек и игры с живыми дилерами. Регистрация занимает около минуты.</p>
      <a class="btn ref" href="#">🎁 Получить бонус</a>
      <div class="note"><a href="kazino.html">или сравните казино →</a></div>
      <div class="note">Только для лиц старше 18 лет. Условия бонуса смотрите на сайте казино.</div>
    </section>
    <section>
      <h2>Почему стоит попробовать</h2>
      <div class="grid">
        <div class="card"><div class="ico">🎁</div><h3>Приветственный бонус</h3><p>Специальное предложение для новых игроков на первый депозит.</p></div>
        <div class="card"><div class="ico">🎰</div><h3>Большой выбор игр</h3><p>Слоты, настольные игры и игры с живыми дилерами.</p></div>
        <div class="card"><div class="ico">⚡</div><h3>Удобные платежи</h3><p>Разные способы пополнения и вывода средств.</p></div>
        <div class="card"><div class="ico">📱</div><h3>С телефона</h3><p>Играйте где удобно — с телефона или компьютера.</p></div>
      </div>
    </section>
    <section>
      <h2>Как начать</h2>
      <div class="grid steps">
        <div class="card"><h3>Нажмите кнопку</h3><p>Нажмите «Регистрация» на этой странице.</p></div>
        <div class="card"><h3>Создайте аккаунт</h3><p>Заполните форму на официальном сайте казино.</p></div>
        <div class="card"><h3>Получите бонус</h3><p>Активируйте приветственное предложение и начните игру.</p></div>
      </div>
    </section>
    <section>
      <div class="cta">
        <h2 style="margin-bottom:10px">Готовы?</h2>
        <p>Зарегистрируйтесь сейчас и заберите свой бонус.</p>
        <a class="btn ref" href="#">🚀 Зарегистрироваться</a>
      </div>
    </section>
    <section>{calc_promo("ru", "")}{bank_promo("ru", "")}</section>
    <section id="articles">
      <h2>Полезные статьи</h2>
      <div class="grid">
{cards}
      </div>
      <p class="hub-link"><a href="stati.html">Все статьи по темам →</a></p>
    </section>
    <section>
      <div class="rg">
        <p><strong>🛡️ Играйте ответственно.</strong> Азартные игры — это развлечение, а не способ заработка. Играйте только на ту сумму, которую готовы потерять. Ставьте лимиты по времени и деньгам. Если игра становится проблемой — сделайте перерыв и обратитесь за помощью.</p>
        <p style="margin-bottom:0">Запрещено лицам младше 18 лет. Убедитесь, что онлайн-казино разрешены в вашей стране.</p>
      </div>
    </section>'''
page("index.html", "Онлайн-казино с бонусом | Lucky Spin Club",
     "Онлайн-казино с приветственным бонусом: слоты, рулетка, блэкджек и живые дилеры. Регистрация за минуту. Полезные статьи для новичков. 18+",
     home, 0)

_ti, _de, _bo, _he = calc_page_parts("ru", "", "")
page("kalkulyator.html", _ti, _de, _bo.replace('<div class="box"><p>', bank_promo("ru", "") + '<div class="box"><p>', 1), 0, _he)
write_widget(ROOT)
_ti, _de, _bo, _he = bank_page_parts("ru", "", "")
page(BANK_SLUG, _ti, _de, _bo, 0, _he)
for _slug, _fn in ((QUIZ_SLUG, quiz_page_parts), (SELF_SLUG, selftest_page_parts)):
    _ti, _de, _bo, _he = _fn("ru", "")
    page(_slug, _ti, _de, _bo, 0, _he)
write_bank_widget(ROOT)
_ti, _de, _bo = hub_parts("ru", [(a[0], a[1], a[2], a[3]) for a in ARTICLES])
page(HUB_SLUG, _ti, _de, _bo, 0)
exec(open("/tmp/claude-0/-workspace/8aeb4342-0200-5c82-93a5-effabca2f09f/scratchpad/casino_pages.py").read(), globals())
for _lg, _ids in CASINO_LANGS.items():
    I18N_EXTRA.setdefault(_lg, set()).update(f"kazino/{_i}.html" for _i in _ids)
exec(open("/tmp/claude-0/-workspace/8aeb4342-0200-5c82-93a5-effabca2f09f/scratchpad/casinos.py").read(), globals())
_names = {c["id"]: c["name"] for c in CASINOS}
_ids = [c["id"] for c in CASINOS]
for c in CASINOS:
    _ti, _de, _bo, _he = casino_page_parts("ru", c, c["geo"], c["lang"], c["cur"], _logo(c, "../"), _ids, _names)
    page(f"kazino/{c['id']}.html", _ti, _de, _bo, 1, _he)
exec(open("/tmp/claude-0/-workspace/8aeb4342-0200-5c82-93a5-effabca2f09f/scratchpad/legal.py").read(), globals())
_L = LEGAL["ru"]
for _path, _ti, _de, _h1, _ht, _crumb in [("o-sajte.html", _L["about_title"], _L["about_desc"], _L["about_h1"], _L["about_html"], _L["foot_about"]),
                                          ("privacy.html", _L["priv_title"], _L["priv_desc"], _L["priv_h1"], _L["priv_html"], _L["foot_priv"])]:
    page(_path, _ti, _de, f'''    <article>
      <div class="crumbs"><a href="index.html">Главная</a> / {_crumb}</div>
      <h1>{_h1}</h1>
{_ht}
      <p class="note">Обновлено: {UPDATED["ru"]}</p>
    </article>''', 0)
urls = [BASE + "/", BASE + "/kazino.html", BASE + "/stati.html", BASE + "/kalkulyator.html", BASE + "/kalkulyator-bankrolla.html", BASE + "/viktorina.html", BASE + "/samoproverka.html", BASE + "/o-sajte.html", BASE + "/privacy.html"] + [f"{BASE}/kazino/{c['id']}.html" for c in CASINOS] + [f"{BASE}/articles/{a[0]}.html" for a in ARTICLES]
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
sm += "".join(f"  <url><loc>{u}</loc><lastmod>{TODAY}</lastmod></url>\n" for u in urls) + "</urlset>\n"
open(os.path.join(ROOT, "sitemap.xml"), "w").write(sm)
open(os.path.join(ROOT, "robots.txt"), "w").write(f"User-agent: *\nAllow: /\n\nSitemap: {BASE}/sitemap.xml\n")

from email.utils import format_datetime
from xml.sax.saxutils import escape
now = format_datetime(datetime.datetime.now(datetime.timezone.utc))
items = "".join(
  f"""  <item>
    <title>{escape(a[4])}</title>
    <link>{BASE}/articles/{a[0]}.html</link>
    <guid isPermaLink="true">{BASE}/articles/{a[0]}.html</guid>
    <description>{escape(a[5])}</description>
    <pubDate>{now}</pubDate>
  </item>
""" for a in reversed(ARTICLES))
rss = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Lucky Spin Club — гид по онлайн-казино</title>
  <link>{BASE}/</link>
  <atom:link href="{BASE}/rss.xml" rel="self" type="application/rss+xml"/>
  <description>Статьи для новичков: бонусы и вейджер, слоты, рулетка, блэкджек, платежи. 18+</description>
  <language>ru</language>
  <lastBuildDate>{now}</lastBuildDate>
{items}</channel>
</rss>
"""
open(os.path.join(ROOT, "rss.xml"), "w").write(rss)

# ---- 404 page (served by Netlify for any missing path, so all links are root-absolute)
import re as _re
_cards404 = "\n".join(f'<a class="card" href="articles/{a[0]}.html"><div class="ico">{a[1]}</div><h3>{a[2]}</h3><p>{a[3]}</p></a>' for a in ARTICLES[:6])
_body404 = f'''    <section class="hero">
      <div class="slots">🎰 4️⃣0️⃣4️⃣</div>
      <h1>Страница не найдена</h1>
      <p>Возможно, ссылка устарела или в адресе опечатка. Вот что есть на сайте:</p>
      <a class="btn" href="kazino.html">Сравнить казино</a>
      <div class="note"><a href="index.html">На главную</a> · <a href="en/index.html">English</a> · <a href="es/index.html">Español</a> · <a href="pt/index.html">Português</a></div>
    </section>
    <section><h2>Популярные статьи</h2><div class="grid">
{_cards404}
    </div></section>'''
page("404.html", "Страница не найдена | Lucky Spin Club", "Страница не найдена. Перейдите на главную или к сравнению казино.", _body404, 0)
_p = os.path.join(ROOT, "404.html")
_h = open(_p).read()
_h = _re.sub(r'(href|src)="(?!https?:|#|/|data:|mailto:)([^"]+)"', r'\1="/\2"', _h)
_h = _re.sub(r'<link rel="canonical"[^>]*>\n|<meta property="og:url"[^>]*>\n|<link rel="alternate" hreflang[^>]*>\n', '', _h)
_h = _h.replace('<meta name="robots" content="index, follow">', '<meta name="robots" content="noindex">')
open(_p, "w").write(_h)

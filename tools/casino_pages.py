# Per-casino landing pages. Facts come only from CASINOS (affiliate cabinet data) and CASINO_TXT.
# exec'd from gen.py (Russian) and i18n.py (other languages).

CASINO_LANGS = {"en": ["jozz", "playfortuna", "booi", "spincrypto"],
                "es": ["playfortuna", "booi", "spincrypto"],
                "pt": ["playfortuna", "booi", "winity", "spincrypto"]}

NOTE = {
 "jozz": {
  "ru": "Сайт Jozz работает на русском и английском языках. Среди валют счёта есть тенге (KZT) и криптовалюты BTC, LTC и ETH, поэтому Jozz может подойти игрокам из Казахстана и тем, кто предпочитает криптовалюту.",
  "en": "Jozz's website is available in Russian and English. Account currencies include the Kazakh tenge (KZT) and the cryptocurrencies BTC, LTC and ETH, alongside USD and EUR."},
 "playfortuna": {
  "ru": "У Play Fortuna самая широкая языковая поддержка среди казино на нашем сайте: восемь языков, включая казахский. Есть счета в валютах Латинской Америки (BRL, MXN, ARS, CLP), в польских злотых и канадских долларах. Игроков из Украины и Грузии казино не принимает.",
  "en": "Play Fortuna supports the most languages of the casinos on our site: eight, including Kazakh. Accounts are available in Latin American currencies (BRL, MXN, ARS, CLP), Polish zloty and Canadian dollars. The casino does not accept players from Ukraine and Georgia.",
  "es": "Play Fortuna es el casino de nuestro sitio con más idiomas: ocho, incluido el español. Se puede abrir la cuenta en monedas de América Latina (BRL, MXN, ARS, CLP), además de USD, EUR y otras. No acepta jugadores de Ucrania ni de Georgia.",
  "pt": "O Play Fortuna é o cassino do nosso site com mais idiomas: oito, incluindo o português. A conta pode ser aberta em reais (BRL) e em outras moedas da América Latina, além de USD e EUR. Não aceita jogadores da Ucrânia e da Geórgia."},
 "booi": {
  "ru": "Booi сочетает обычные валюты (RUB, KZT, EUR, USD, валюты Латинской Америки и другие) с криптовалютами: BTC, DOGE, ETH, LTC, USDT и XRP. Это удобно, если вы хотите выбирать между картой и криптовалютой. Игроков из Украины и Грузии казино не принимает.",
  "en": "Booi combines regular currencies (USD, EUR, CAD, NZD, PLN and others) with cryptocurrencies: BTC, DOGE, ETH, LTC, USDT and XRP. That suits players who want to choose between a card and crypto. The casino does not accept players from Ukraine and Georgia.",
  "es": "Booi combina monedas normales (MXN, ARS, CLP, USD, EUR y otras) con criptomonedas: BTC, DOGE, ETH, LTC, USDT y XRP. Es práctico si quieres elegir entre tarjeta y cripto. No acepta jugadores de Ucrania ni de Georgia.",
  "pt": "O Booi combina moedas comuns (BRL, USD, EUR e outras) com criptomoedas: BTC, DOGE, ETH, LTC, USDT e XRP. É prático para quem quer escolher entre cartão e cripto. Não aceita jogadores da Ucrânia e da Geórgia."},
 "winity": {
  "ru": "Winity ориентирован на три рынка: Россию, Бразилию и Турцию. Игрокам из других стран, включая Казахстан и Армению, лучше выбрать другое казино из нашего сравнения. Счёт можно открыть в RUB, BRL, TRY, а также в KZT, EUR и USD.",
  "pt": "O Winity é voltado para três mercados: Rússia, Brasil e Turquia. A conta pode ser aberta em reais (BRL), além de RUB, TRY, KZT, EUR e USD, e o site tem versão em português."},
 "spincrypto": {
  "ru": "SpinCrypto работает только с криптовалютой: USDT и USDC в нескольких сетях, BTC, ETH, SOL, TRX, LTC и другие монеты. Казино принимает игроков из большинства стран, кроме запрещённых, — актуальный список есть на сайте казино. Перед первым депозитом прочитайте нашу статью «Криптоказино».",
  "en": "SpinCrypto works only with cryptocurrency: USDT and USDC on several networks, BTC, ETH, SOL, TRX, LTC and other coins. It accepts players from most countries except restricted ones; the current list is on the casino's website.",
  "es": "SpinCrypto funciona solo con criptomonedas: USDT y USDC en varias redes, BTC, ETH, SOL, TRX, LTC y otras. Acepta jugadores de la mayoría de los países, excepto los restringidos; la lista actual está en la web del casino. Antes del primer depósito, lee nuestro artículo «Casino cripto».",
  "pt": "O SpinCrypto funciona só com criptomoedas: USDT e USDC em várias redes, BTC, ETH, SOL, TRX, LTC e outras. Aceita jogadores da maioria dos países, exceto os restritos; a lista atual está no site do cassino. Antes do primeiro depósito, leia nosso artigo “Cassino cripto”."},
}

CT = {
 "ru": dict(h1="{n} казино: регистрация, валюты и для кого подходит", title="{n} казино: регистрация, валюты, для кого подходит | Lucky Spin Club",
   desc="{n} казино: из каких стран принимает игроков, валюты счёта, языки сайта и пошаговая регистрация. Только проверенные данные. 18+",
   crumb_home="Главная", crumb_cmp="Казино",
   intro="{n} — одно из казино на нашей <a href=\"{cmp}\">странице сравнения</a>. Ниже — проверенные данные из условий партнёрской программы и пошаговая регистрация. Мы не выставляем оценок и не придумываем отзывов.",
   h_facts="Коротко о {n}", dt_geo="Для игроков из", dt_cur="Валюты счёта", dt_lang="Языки сайта", h_note="Особенности",
   h_reg="Как зарегистрироваться в {n}",
   reg=["Нажмите кнопку «Перейти в {n}» на этой странице. Откроется официальная страница регистрации казино.",
        "Укажите email или номер телефона и придумайте надёжный пароль.",
        "Выберите валюту счёта — ту, в которой будете пополнять. Её часто нельзя поменять после регистрации.",
        "Подтвердите email или телефон.",
        "Перед первым депозитом откройте раздел «Бонусы» и прочитайте условия: минимальный депозит, вейджер, срок и максимальную ставку."],
   h_check="Что проверить перед игрой",
   check=["Условия бонуса и вейджер — подробнее в статье <a href=\"{a}chto-takoe-vejdzher.html\">«Что такое вейджер»</a>.",
          "Верификацию: какие документы попросят перед выводом — <a href=\"{a}verifikaciya.html\">«Верификация в онлайн-казино»</a>.",
          "Способы и сроки вывода — <a href=\"{a}kak-vyvesti-dengi.html\">«Как вывести выигрыш»</a>.",
          "Лицензию и правила — они указаны внизу сайта казино.",
          "Законы своей страны: онлайн-казино разрешены не везде."],
   box_p="Готовы попробовать {n}? Регистрация занимает около минуты.", go="Перейти в {n}", box_note="18+ · Условия бонусов — на сайте казино",
   faq_h2="Часто задаваемые вопросы",
   q1="Из каких стран {n} принимает игроков?", a1="По условиям партнёрской программы {n} принимает игроков из: {geo}. Перед регистрацией проверьте правила на сайте казино и законы своей страны.",
   q2="В какой валюте открыть счёт в {n}?", a2="Доступны валюты: {cur}. Выбирайте ту, в которой будете пополнять счёт, — так вы избежите лишней конвертации.",
   q3="На каких языках работает сайт {n}?", a3="Сайт {n} доступен на языках: {lang}.",
   h_other="Другие казино", other_all="Все казино в сравнении →", more="Подробнее о {n} →"),
 "en": dict(h1="{n} casino: sign-up, currencies and who it suits", title="{n} casino: sign-up, currencies, who it suits | Lucky Spin Club",
   desc="{n} casino: which countries it accepts, account currencies, site languages and step-by-step sign-up. Verified data only. 18+",
   crumb_home="Home", crumb_cmp="Casinos",
   intro="{n} is one of the casinos on our <a href=\"{cmp}\">comparison page</a>. Below is verified data from the affiliate programme terms and a step-by-step sign-up guide. We do not give scores or invent reviews.",
   h_facts="{n} at a glance", dt_geo="Players from", dt_cur="Account currencies", dt_lang="Site languages", h_note="What stands out",
   h_reg="How to sign up at {n}",
   reg=["Tap “Go to {n}” on this page. The casino's official sign-up page will open.",
        "Enter your email or phone number and create a strong password.",
        "Choose the account currency you will deposit in. It often cannot be changed after sign-up.",
        "Confirm your email or phone.",
        "Before your first deposit, open the “Bonuses” section and read the terms: minimum deposit, wagering, time limit and maximum bet."],
   h_check="What to check before playing",
   check=["Bonus terms and wagering: see <a href=\"{a}chto-takoe-vejdzher.html\">“What wagering means”</a>.",
          "Withdrawal methods and timing: see <a href=\"{a}kak-vyvesti-dengi.html\">“How to withdraw winnings”</a>.",
          "The licence and rules, listed at the bottom of the casino's website.",
          "The laws of your country: online casinos are not legal everywhere."],
   box_p="Ready to try {n}? Signing up takes about a minute.", go="Go to {n}", box_note="18+ · See the casino's website for bonus terms",
   faq_h2="Frequently asked questions",
   q1="Which countries does {n} accept players from?", a1="According to the affiliate programme terms, {n} accepts players from: {geo}. Before signing up, check the rules on the casino's website and the laws of your country.",
   q2="Which currency should I open a {n} account in?", a2="Available currencies: {cur}. Choose the one you will deposit in to avoid extra conversion.",
   q3="Which languages is the {n} website available in?", a3="The {n} website is available in: {lang}.",
   h_other="Other casinos", other_all="All casinos in the comparison →", more="More about {n} →"),
 "es": dict(h1="Casino {n}: registro, monedas y para quién es", title="Casino {n}: registro, monedas y para quién es | Lucky Spin Club",
   desc="Casino {n}: de qué países acepta jugadores, monedas de la cuenta, idiomas del sitio y registro paso a paso. Solo datos verificados. 18+",
   crumb_home="Inicio", crumb_cmp="Casinos",
   intro="{n} es uno de los casinos de nuestra <a href=\"{cmp}\">página de comparación</a>. Abajo tienes datos verificados de las condiciones del programa de afiliados y el registro paso a paso. No damos puntuaciones ni inventamos opiniones.",
   h_facts="{n} en resumen", dt_geo="Jugadores de", dt_cur="Monedas de la cuenta", dt_lang="Idiomas del sitio", h_note="Lo que destaca",
   h_reg="Cómo registrarse en {n}",
   reg=["Pulsa «Ir a {n}» en esta página. Se abrirá la página oficial de registro del casino.",
        "Indica tu correo o teléfono y crea una contraseña segura.",
        "Elige la moneda de la cuenta con la que vas a depositar. A menudo no se puede cambiar después.",
        "Confirma tu correo o teléfono.",
        "Antes del primer depósito, abre la sección «Bonos» y lee las condiciones: depósito mínimo, requisito de apuesta, plazo y apuesta máxima."],
   h_check="Qué revisar antes de jugar",
   check=["Condiciones del bono y requisito de apuesta: <a href=\"{a}chto-takoe-vejdzher.html\">«Qué es el requisito de apuesta»</a>.",
          "Métodos y plazos de retiro: <a href=\"{a}kak-vyvesti-dengi.html\">«Cómo retirar las ganancias»</a>.",
          "La licencia y las reglas, que aparecen al pie del sitio del casino.",
          "Las leyes de tu país: los casinos online no son legales en todas partes."],
   box_p="¿Quieres probar {n}? El registro toma alrededor de un minuto.", go="Ir a {n}", box_note="18+ · Condiciones del bono en la web del casino",
   faq_h2="Preguntas frecuentes",
   q1="¿De qué países acepta jugadores {n}?", a1="Según las condiciones del programa de afiliados, {n} acepta jugadores de: {geo}. Antes de registrarte, revisa las reglas en la web del casino y las leyes de tu país.",
   q2="¿En qué moneda abro la cuenta en {n}?", a2="Monedas disponibles: {cur}. Elige la que usarás para depositar y así evitarás conversiones.",
   q3="¿En qué idiomas está el sitio de {n}?", a3="El sitio de {n} está disponible en: {lang}.",
   h_other="Otros casinos", other_all="Todos los casinos en la comparación →", more="Más sobre {n} →"),
 "pt": dict(h1="Cassino {n}: cadastro, moedas e para quem é", title="Cassino {n}: cadastro, moedas e para quem é | Lucky Spin Club",
   desc="Cassino {n}: de quais países aceita jogadores, moedas da conta, idiomas do site e cadastro passo a passo. Somente dados verificados. 18+",
   crumb_home="Início", crumb_cmp="Cassinos",
   intro="O {n} é um dos cassinos da nossa <a href=\"{cmp}\">página de comparação</a>. Abaixo estão dados verificados das condições do programa de afiliados e o cadastro passo a passo. Não damos notas nem inventamos avaliações.",
   h_facts="{n} em resumo", dt_geo="Jogadores de", dt_cur="Moedas da conta", dt_lang="Idiomas do site", h_note="Destaques",
   h_reg="Como se cadastrar no {n}",
   reg=["Toque em “Ir para {n}” nesta página. A página oficial de cadastro do cassino vai abrir.",
        "Informe seu e-mail ou telefone e crie uma senha forte.",
        "Escolha a moeda da conta em que vai depositar. Muitas vezes ela não pode ser trocada depois.",
        "Confirme o e-mail ou o telefone.",
        "Antes do primeiro depósito, abra a seção “Bônus” e leia as condições: depósito mínimo, rollover, prazo e aposta máxima."],
   h_check="O que verificar antes de jogar",
   check=["Condições do bônus e rollover: <a href=\"{a}chto-takoe-vejdzher.html\">“O que é rollover”</a>.",
          "Formas e prazos de saque: <a href=\"{a}kak-vyvesti-dengi.html\">“Como sacar os ganhos”</a>.",
          "A licença e as regras, que ficam no rodapé do site do cassino.",
          "As leis do seu país: cassinos online não são permitidos em todo lugar."],
   box_p="Quer experimentar o {n}? O cadastro leva cerca de um minuto.", go="Ir para {n}", box_note="18+ · Condições do bônus no site do cassino",
   faq_h2="Perguntas frequentes",
   q1="De quais países o {n} aceita jogadores?", a1="Segundo as condições do programa de afiliados, o {n} aceita jogadores de: {geo}. Antes de se cadastrar, confira as regras no site do cassino e as leis do seu país.",
   q2="Em qual moeda abro a conta no {n}?", a2="Moedas disponíveis: {cur}. Escolha a que você vai usar para depositar e evite conversões.",
   q3="Em quais idiomas está o site do {n}?", a3="O site do {n} está disponível em: {lang}.",
   h_other="Outros cassinos", other_all="Todos os cassinos na comparação →", more="Mais sobre {n} →"),
}

def casino_page_parts(lg, c, geo, lang_s, cur_list, logo_html, ids, names):
    """Return (title, desc, body_html, faq_jsonld_head). Paths are relative to <lang root>/kazino/."""
    import html as _H, json as _J
    t = CT[lg]; n = c["name"]; e = _H.escape
    cur = ", ".join(cur_list)
    cmp = "../kazino.html"; a = "../articles/"
    facts = f'''<dl class="facts">
<dt>{t["dt_geo"]}</dt><dd>{e(geo)}</dd>
<dt>{t["dt_cur"]}</dt><dd class="chips">{"".join(f'<span class="chip">{e(x)}</span>' for x in cur_list)}</dd>
<dt>{t["dt_lang"]}</dt><dd>{e(lang_s)}</dd>
</dl>'''
    note = NOTE[c["id"]][lg]
    if c["id"] == "spincrypto" and lg in ("ru", "es", "pt"):
        word = {"ru": "«Криптоказино»", "es": "«Casino cripto»", "pt": "“Cassino cripto”"}[lg]
        note = note.replace(word, f'<a href="{a}kriptokazino.html">{word}</a>')
    regs = "".join(f"<li>{e(s.format(n=n))}</li>" for s in t["reg"])
    checks = "".join(f"<li>{s.format(a=a)}</li>" for s in t["check"])
    box = f'''<div class="box"><p>{e(t["box_p"].format(n=n))}</p><a class="btn casino-ref" data-casino="{c["id"]}" href="#">{e(t["go"].format(n=n))}</a><div class="note">{t["box_note"]}</div></div>'''
    faq = [(t["q1"].format(n=n), t["a1"].format(n=n, geo=geo)), (t["q2"].format(n=n), t["a2"].format(n=n, cur=cur)),
           (t["q3"].format(n=n), t["a3"].format(n=n, lang=lang_s))]
    faq_html = f'\n<section class="faq">\n<h2>{t["faq_h2"]}</h2>\n' + "".join(f'<details><summary>{e(q)}</summary><p>{e(x)}</p></details>\n' for q, x in faq) + '</section>'
    ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": x}} for q, x in faq]}
    head = '<script type="application/ld+json">' + _J.dumps(ld, ensure_ascii=False) + '</script>'
    others = [i for i in ids if i != c["id"]]
    other_html = '\n    <section class="related">\n      <h2>' + t["h_other"] + '</h2>\n      <div class="grid">\n' + "".join(
        f'        <a class="card" href="{o}.html"><h3>{e(names[o])}</h3><p>{e(t["more"].format(n=names[o]))}</p></a>\n' for o in others) + \
        f'      </div>\n      <p class="note" style="text-align:center"><a href="{cmp}">{t["other_all"]}</a></p>\n    </section>'
    body = f'''    <article class="casino-page">
      <div class="crumbs"><a href="../index.html">{t["crumb_home"]}</a> / <a href="{cmp}">{t["crumb_cmp"]}</a> / {e(n)}</div>
      <h1>{e(t["h1"].format(n=n))}</h1>
      <div class="casino-head">{logo_html}</div>
      <p>{t["intro"].format(n=e(n), cmp=cmp)}</p>
      <h2>{e(t["h_facts"].format(n=n))}</h2>
      {facts}
      <h2>{t["h_note"]}</h2>
      <p>{note}</p>
      <h2>{e(t["h_reg"].format(n=n))}</h2>
      <ol>{regs}</ol>
      <h2>{t["h_check"]}</h2>
      <ul>{checks}</ul>
{box}{faq_html}
    </article>{other_html}'''
    return t["title"].format(n=n), t["desc"].format(n=n), body, head

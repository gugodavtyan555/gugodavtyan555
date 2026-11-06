# Articles hub page stati.html (ru/en/es/pt). exec'd from gen.py and i18n.py.
HUB_SLUG = "stati.html"
HUB_CATS = [
 ("bonus", {"ru": "🎁 Бонусы и вейджер", "en": "🎁 Bonuses and wagering", "es": "🎁 Bonos y requisito de apuesta", "pt": "🎁 Bônus e rollover"},
  ["kak-poluchit-bonus", "chto-takoe-vejdzher", "frispiny"]),
 ("games", {"ru": "🎰 Игры и правила", "en": "🎰 Games and rules", "es": "🎰 Juegos y reglas", "pt": "🎰 Jogos e regras"},
  ["kak-rabotayut-sloty", "blekdzhek-pravila", "kak-igrat-v-ruletku", "live-kazino", "demo-rezhim"]),
 ("money", {"ru": "💳 Платежи и вывод денег", "en": "💳 Payments and withdrawals", "es": "💳 Pagos y retiros", "pt": "💳 Pagamentos e saques"},
  ["kak-vyvesti-dengi", "verifikaciya", "kriptokazino"]),
 ("choose", {"ru": "🧭 Как выбрать казино", "en": "🧭 Choosing a casino", "es": "🧭 Cómo elegir un casino", "pt": "🧭 Como escolher um cassino"},
  ["kak-vybrat-kazino", "mobilnoe-kazino", "slovar-kazino"]),
 ("rg", {"ru": "🛡️ Ответственная игра", "en": "🛡️ Responsible gambling", "es": "🛡️ Juego responsable", "pt": "🛡️ Jogo responsável"},
  ["otvetstvennaya-igra"]),
]
HUB_TXT = {
 "ru": dict(title="Статьи об онлайн-казино: гид для новичков | Lucky Spin Club",
   desc="Все статьи Lucky Spin Club по темам: бонусы и вейджер, слоты и настольные игры, платежи и вывод, выбор казино и ответственная игра. Простыми словами. 18+",
   h1="Статьи об онлайн-казино", intro="Все материалы сайта по темам. Начните с бонусов и вейджера, если впервые регистрируетесь в казино, или с раздела об играх, если хотите разобраться в правилах.",
   home="Главная", crumb="Статьи", other="📚 Другие статьи", tools="🧮 Калькуляторы и тесты", quiz=('Тест «Миф или факт»', '10 утверждений о казино: проверьте, где правда.'), selft=('Самопроверка', 'Контролирую ли я игру? 8 вопросов, анонимно.'),
   calc=("Калькулятор вейджера", "Сколько нужно отыграть и выгоден ли бонус."), bank=("Калькулятор банкролла", "На сколько спинов хватит денег и как часто они заканчиваются.")),
 "en": dict(title="Online casino articles: a beginner's guide | Lucky Spin Club",
   desc="All Lucky Spin Club articles by topic: bonuses and wagering, slots and table games, payments and withdrawals, and responsible gambling. In plain words. 18+",
   h1="Online casino articles", intro="All our guides, grouped by topic. Start with bonuses and wagering if you are signing up for the first time, or with games if you want to learn the rules.",
   home="Home", crumb="Articles", other="📚 More articles", tools="", calc=None, bank=None, quiz=None, selft=None),
 "es": dict(title="Artículos sobre casinos online para principiantes",
   desc="Todos los artículos de Lucky Spin Club por tema: bonos y requisito de apuesta, tragamonedas, pagos y retiros, criptomonedas y juego responsable. 18+",
   h1="Artículos sobre casinos online", intro="Todas nuestras guías agrupadas por tema. Empieza por los bonos y el requisito de apuesta si te registras por primera vez, o por los juegos si quieres entender las reglas.",
   home="Inicio", crumb="Artículos", other="📚 Más artículos", tools="🧮 Calculadoras y tests", quiz=('Test «Mito o realidad»', '10 afirmaciones sobre casinos: ¿cuál es verdad?'), selft=('Autoevaluación', '¿Controlo mi juego? 8 preguntas, anónima.'),
   calc=("Calculadora de requisito de apuesta", "Cuánto hay que apostar y si el bono conviene."), bank=("Calculadora de bankroll", "Para cuántos giros alcanza tu dinero.")),
 "pt": dict(title="Artigos sobre cassinos online para iniciantes",
   desc="Todos os artigos do Lucky Spin Club por tema: bônus e rollover, caça-níqueis, pagamentos e saques, criptomoedas e jogo responsável. 18+",
   h1="Artigos sobre cassinos online", intro="Todos os nossos guias organizados por tema. Comece pelos bônus e rollover se for se cadastrar pela primeira vez, ou pelos jogos se quiser entender as regras.",
   home="Início", crumb="Artigos", other="📚 Mais artigos", tools="🧮 Calculadoras e testes", quiz=('Teste «Mito ou verdade»', '10 afirmações sobre cassinos: qual é verdade?'), selft=('Autoavaliação', 'Eu controlo o meu jogo? 8 perguntas, anônima.'),
   calc=("Calculadora de rollover", "Quanto apostar e se o bônus compensa."), bank=("Calculadora de banca", "Quantos giros seu dinheiro aguenta.")),
}

def hub_parts(lg, items):
    """items: ordered list of (slug, ico, short, teaser) for this language. Returns title, desc, body (page at the language root)."""
    t = HUB_TXT[lg]
    by = {s: (s, i, sh, te) for s, i, sh, te in items}
    seen = set(); sections = []
    def card(s):
        _, i, sh, te = by[s]
        return f'<a class="card" href="articles/{s}.html"><div class="ico">{i}</div><h3>{sh}</h3><p>{te}</p></a>'
    for key, names, slugs in HUB_CATS:
        got = [s for s in slugs if s in by]
        if not got: continue
        seen.update(got)
        sections.append(f'    <section class="hub-cat" id="{key}"><h2>{names[lg]}</h2><div class="grid">{"".join(card(s) for s in got)}</div></section>')
    rest = [s for s, *_ in items if s not in seen]
    if rest:
        sections.append(f'    <section class="hub-cat" id="other"><h2>{t["other"]}</h2><div class="grid">{"".join(card(s) for s in rest)}</div></section>')
    if t["calc"]:
        tools = (f'<a class="card" href="kalkulyator.html"><div class="ico">🧮</div><h3>{t["calc"][0]}</h3><p>{t["calc"][1]}</p></a>'
                 f'<a class="card" href="kalkulyator-bankrolla.html"><div class="ico">📊</div><h3>{t["bank"][0]}</h3><p>{t["bank"][1]}</p></a>'
                 f'<a class="card" href="viktorina.html"><div class="ico">❓</div><h3>{t["quiz"][0]}</h3><p>{t["quiz"][1]}</p></a>'
                 f'<a class="card" href="samoproverka.html"><div class="ico">🧭</div><h3>{t["selft"][0]}</h3><p>{t["selft"][1]}</p></a>')
        sections.append(f'    <section class="hub-cat" id="tools"><h2>{t["tools"]}</h2><div class="grid">{tools}</div></section>')
    body = f'''    <article>
      <div class="crumbs"><a href="index.html">{t["home"]}</a> / {t["crumb"]}</div>
      <h1>{t["h1"]}</h1>
      <p>{t["intro"]}</p>
    </article>
''' + "\n".join(sections)
    return t["title"], t["desc"], body

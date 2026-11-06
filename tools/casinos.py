# Facts only from the user's affiliate cabinet screenshots. Links live in config.js.
CASINOS = [
 {"id": "jozz", "name": "Jozz",
  "geo": "СНГ, Ирландия, Канада, Греция, Новая Зеландия, Словакия, Словения",
  "cur": ["RUB", "USD", "EUR", "KZT", "BTC", "LTC", "ETH"],
  "lang": "русский, английский"},
 {"id": "playfortuna", "name": "Play Fortuna",
  "geo": "СНГ (кроме Украины и Грузии), Бразилия, Мексика, Аргентина, Чили, Перу, Канада, Польша, Греция, Ирландия, Новая Зеландия, Словакия, Словения",
  "cur": ["RUB", "EUR", "USD", "KZT", "PLN", "CAD", "BRL", "NZD", "CLP", "MXN", "ARS"],
  "lang": "русский, английский, польский, испанский, французский, португальский, казахский, немецкий"},
 {"id": "booi", "name": "Booi",
  "geo": "СНГ (кроме Украины и Грузии), Бразилия, Мексика, Аргентина, Чили, Перу, Канада, Польша, Греция, Ирландия, Новая Зеландия, Словакия, Словения",
  "cur": ["RUB", "EUR", "USD", "KZT", "PLN", "CAD", "BRL", "NZD", "CLP", "ARS", "MXN", "BTC", "DOGE", "ETH", "LTC", "USDT", "XRP"],
  "lang": "русский, английский, польский, испанский, французский, португальский, казахский, немецкий"},
 {"id": "winity", "name": "Winity",
  "geo": "Россия, Бразилия, Турция",
  "cur": ["RUB", "EUR", "USD", "KZT", "TRY", "BRL"],
  "lang": "русский, английский, испанский, португальский, турецкий"},
 {"id": "spincrypto", "name": "SpinCrypto",
  "geo": "Большинство стран мира, кроме запрещённых (список стран смотрите на сайте казино)",
  "cur": ["Только криптовалюта", "USDT (TRC20, ERC20, BSC, SOL, POL, Arbitrum)", "USDC (ERC20, BSC, SOL, Arbitrum)", "JUSDT", "BTC", "ETH", "SOL", "TRX", "LTC", "BNB", "DOGE", "GRAM", "POL", "ARB", "XRP"],
  "lang": "русский, английский, польский, испанский, португальский, французский, финский"},
]
import html as _hh
LOGOS = {'jozz': (260, 146), 'playfortuna': (260, 146), 'booi': (260, 146), 'spincrypto': (226, 150), 'winity': (500, 300)}
def _logo(c, pre):
    if c["id"] in LOGOS:
        w, h = LOGOS[c["id"]]
        return f'<img class="logo" src="{pre}images/logos/{c["id"]}.jpg" width="{w}" height="{h}" alt="{_hh.escape(c["name"])}">'
    return _hh.escape(c["name"])
def _card(c):
    chips = "".join(f'<span class="chip">{_hh.escape(x)}</span>' for x in c["cur"])
    return f'''      <div class="casino">
        <h2>{_logo(c, "")}</h2>
        <dl>
          <dt>Для игроков из</dt><dd>{_hh.escape(c["geo"])}</dd>
          <dt>Валюты счёта</dt><dd class="chips">{chips}</dd>
          <dt>Языки сайта</dt><dd>{_hh.escape(c["lang"])}</dd>
        </dl>
        <a class="more-link" href="kazino/{c["id"]}.html">Подробнее о {_hh.escape(c["name"])} →</a>
        <a class="btn casino-ref" data-casino="{c["id"]}" href="#">Перейти в {_hh.escape(c["name"])}</a>
      </div>
'''
_cards = "".join(_card(c) for c in CASINOS)
_compare = f'''    <article class="compare">
      <div class="crumbs"><a href="index.html">Главная</a> / Казино</div>
      <h1>Сравнение онлайн-казино</h1>
      <p>Здесь собраны казино, с которыми мы работаем. Мы указываем только проверенные данные: для игроков из каких стран открыто казино, в каких валютах можно открыть счёт и на каких языках работает сайт. Перед регистрацией проверьте, что казино принимает игроков из вашей страны, и выберите валюту, в которой будете пополнять счёт.</p>
      <p>Подробнее о выборе — в статьях <a href="articles/kak-vybrat-kazino.html">«Как выбрать онлайн-казино»</a> и <a href="articles/kak-poluchit-bonus.html">«Как получить приветственный бонус»</a>.</p>
    </article>
    <section class="casinos">
{_cards}    </section>
    <p class="note compare-note">Порядок карточек не является рейтингом. Условия бонусов и правила смотрите на сайте казино. Ссылки на этой странице партнёрские. 18+</p>'''
page("kazino.html", "Сравнение онлайн-казино: страны, валюты, языки | Lucky Spin Club",
     "Сравнение онлайн-казино: для игроков из каких стран, какие валюты счёта (RUB, KZT, USD, EUR, крипто) и языки сайта. Только проверенные данные. 18+",
     _compare, 0)

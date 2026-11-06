# Bankroll calculator pages (ru/es/pt) and the embeddable widget. exec'd from gen.py and i18n.py after calc_pages.py.
import json as _bj, os as _bos, html as _bh

BANK_SLUG = "kalkulyator-bankrolla.html"
BT = {
 "ru": dict(title="Калькулятор банкролла: на сколько спинов хватит денег | Lucky Spin Club",
   desc="Калькулятор банкролла для слотов: укажите сумму, ставку, RTP и волатильность — и посмотрите на 2000 смоделированных сессий, как часто банкролл заканчивается и сколько в среднем теряется. 18+",
   crumb="Калькулятор банкролла", home="Главная", h1="Калькулятор банкролла",
   intro="Сколько спинов выдержит ваш бюджет? Калькулятор 2000 раз моделирует игровую сессию с вашими параметрами и показывает, как часто деньги заканчиваются раньше времени и сколько в среднем стоит такая игра.",
   l_bank="Банкролл", l_bet="Ставка за спин", l_rtp="RTP слота, %", l_spins="Сколько спинов планируете", l_vol="Волатильность",
   v_low="низкая", v_mid="средняя", v_high="высокая",
   r_loss="Средний проигрыш за сессию", r_profit="Сессий закончились в плюсе", r_bust="Банкролл закончился раньше", r_median="Типичный остаток (медиана)",
   chart="Пять случайных сессий (пунктир — стартовый банкролл)", again="Смоделировать ещё раз",
   cur="₽", d_bank=10000, d_bet=50, d_spins=500,
   note="Модель упрощённая: настоящие слоты устроены сложнее, и у каждого своя таблица выплат. Калькулятор показывает общую закономерность, а не прогноз для конкретной игры. Казино в среднем всегда в плюсе.",
   h_how="Что показывает калькулятор", how=["Средний проигрыш = число спинов × ставка × (1 − RTP). Это математическое ожидание: на длинной дистанции результат стремится к нему.",
      "Волатильность не меняет средний проигрыш, но меняет разброс. При высокой волатильности чаще бывают и крупные выигрыши, и быстрые потери всего банкролла.",
      "Чем больше спинов и чем выше ставка относительно банкролла, тем выше шанс, что деньги закончатся раньше, чем вы планировали."],
   h_tips="Как пользоваться результатом", tips=["Выбирайте ставку так, чтобы банкролла хватало на запланированное число спинов с запасом — часто советуют ставку не больше 1–2% от банкролла.",
      "Считайте средний проигрыш платой за развлечение. Если эта сумма для вас слишком велика — уменьшите ставку или время игры.",
      "Заранее решите, когда остановитесь — и при выигрыше, и при проигрыше."],
   more='Про RTP и волатильность — в статье <a href="articles/kak-rabotayut-sloty.html">«Как работают слоты»</a>. Посчитать отыгрыш бонуса можно в <a href="kalkulyator.html">калькуляторе вейджера</a>.',
   h_embed="Добавить калькулятор на свой сайт", embed_p="Скопируйте код и вставьте его на страницу своего сайта или форума — калькулятор будет работать у вас бесплатно.",
   copy="Скопировать код", copied="Скопировано ✓", embed_link="Калькулятор банкролла — Lucky Spin Club",
   faq_h2="Часто задаваемые вопросы",
   faq=[("Что такое банкролл?", "Банкролл — это сумма, которую вы заранее выделили на игру и готовы потерять. Её не смешивают с деньгами на жизнь, а размер ставки выбирают исходя из банкролла."),
        ("Какую ставку выбрать от банкролла?", "Часто советуют ставку около 1–2% от банкролла: так его хватит на сотни спинов. Чем выше ставка, тем выше шанс быстро проиграть всё, даже при хорошем RTP."),
        ("Можно ли с помощью калькулятора выиграть?", "Нет. Калькулятор не повышает шансы и не предсказывает результат. Он показывает, сколько в среднем стоит игра и насколько велик разброс, чтобы вы могли поставить разумный лимит.")],
   promo="📊 На сколько спинов хватит ваших денег? Проверьте в калькуляторе банкролла.", promo_btn="Калькулятор банкролла"),
 "es": dict(title="Calculadora de bankroll: ¿para cuántos giros alcanza tu dinero? | Lucky Spin Club",
   desc="Calculadora de bankroll para tragamonedas: indica saldo, apuesta, RTP y volatilidad y mira en 2000 sesiones simuladas con qué frecuencia se acaba el dinero y cuánto se pierde en promedio. 18+",
   crumb="Calculadora de bankroll", home="Inicio", h1="Calculadora de bankroll",
   intro="¿Para cuántos giros alcanza tu presupuesto? La calculadora simula 2000 veces una sesión con tus parámetros y muestra con qué frecuencia el dinero se acaba antes de tiempo y cuánto cuesta en promedio esa sesión.",
   l_bank="Bankroll", l_bet="Apuesta por giro", l_rtp="RTP de la tragamonedas, %", l_spins="Cuántos giros planeas", l_vol="Volatilidad",
   v_low="baja", v_mid="media", v_high="alta",
   r_loss="Pérdida media por sesión", r_profit="Sesiones que terminaron con ganancia", r_bust="El saldo se acabó antes", r_median="Saldo típico al final (mediana)",
   chart="Cinco sesiones al azar (línea punteada: saldo inicial)", again="Simular otra vez",
   cur="$", d_bank=200, d_bet=1, d_spins=500,
   note="Modelo simplificado: las tragamonedas reales son más complejas y cada una tiene su propia tabla de pagos. La calculadora muestra la tendencia general, no un pronóstico para un juego concreto. En promedio, el casino siempre gana.",
   h_how="Qué muestra la calculadora", how=["Pérdida media = número de giros × apuesta × (1 − RTP). Es la esperanza matemática: a largo plazo el resultado tiende a ella.",
      "La volatilidad no cambia la pérdida media, pero sí la dispersión. Con volatilidad alta hay más premios grandes y también más sesiones en las que se pierde todo rápido.",
      "Cuantos más giros y cuanto mayor sea la apuesta respecto al saldo, más probable es que el dinero se acabe antes de lo previsto."],
   h_tips="Cómo usar el resultado", tips=["Elige una apuesta con la que el saldo alcance para los giros que planeas con margen; se suele recomendar no más del 1–2 % del bankroll por giro.",
      "Considera la pérdida media como el precio del entretenimiento. Si te parece demasiado, baja la apuesta o el tiempo de juego.",
      "Decide de antemano cuándo vas a parar, tanto si ganas como si pierdes."],
   more='Sobre RTP y volatilidad: <a href="articles/kak-rabotayut-sloty.html">«Cómo funcionan las tragamonedas»</a>. Para calcular el requisito de un bono usa la <a href="kalkulyator.html">calculadora de requisito de apuesta</a>.',
   h_embed="Añade la calculadora a tu sitio", embed_p="Copia el código y pégalo en tu sitio o foro: la calculadora funcionará gratis.",
   copy="Copiar código", copied="Copiado ✓", embed_link="Calculadora de bankroll — Lucky Spin Club",
   faq_h2="Preguntas frecuentes",
   faq=[("¿Qué es el bankroll?", "Es el dinero que apartas de antemano para jugar y que estás dispuesto a perder. No se mezcla con el dinero para gastos, y el tamaño de la apuesta se elige según el bankroll."),
        ("¿Qué apuesta elegir según el bankroll?", "Se suele recomendar alrededor del 1–2 % del bankroll por giro, así alcanza para cientos de giros. Cuanto mayor la apuesta, más probable es perderlo todo rápido, incluso con buen RTP."),
        ("¿La calculadora ayuda a ganar?", "No. No mejora las probabilidades ni predice resultados. Muestra cuánto cuesta jugar en promedio y cuánta variación hay, para que pongas un límite razonable.")],
   promo="📊 ¿Para cuántos giros alcanza tu dinero? Compruébalo en la calculadora de bankroll.", promo_btn="Calculadora de bankroll"),
 "pt": dict(title="Calculadora de banca: quantos giros seu dinheiro aguenta? | Lucky Spin Club",
   desc="Calculadora de banca para caça-níqueis: informe valor, aposta, RTP e volatilidade e veja em 2000 sessões simuladas com que frequência a banca acaba e quanto se perde em média. 18+",
   crumb="Calculadora de banca", home="Início", h1="Calculadora de banca",
   intro="Quantos giros seu orçamento aguenta? A calculadora simula 2000 vezes uma sessão com seus parâmetros e mostra com que frequência o dinheiro acaba antes da hora e quanto essa sessão custa em média.",
   l_bank="Banca", l_bet="Aposta por giro", l_rtp="RTP do caça-níquel, %", l_spins="Quantos giros você planeja", l_vol="Volatilidade",
   v_low="baixa", v_mid="média", v_high="alta",
   r_loss="Perda média por sessão", r_profit="Sessões que terminaram no lucro", r_bust="A banca acabou antes", r_median="Saldo típico no fim (mediana)",
   chart="Cinco sessões aleatórias (tracejado: banca inicial)", again="Simular de novo",
   cur="R$", d_bank=1000, d_bet=5, d_spins=500,
   note="Modelo simplificado: caça-níqueis reais são mais complexos e cada um tem sua tabela de pagamentos. A calculadora mostra a tendência geral, não uma previsão para um jogo específico. Em média, o cassino sempre ganha.",
   h_how="O que a calculadora mostra", how=["Perda média = número de giros × aposta × (1 − RTP). É a expectativa matemática: no longo prazo o resultado tende a ela.",
      "A volatilidade não muda a perda média, mas muda a variação. Com volatilidade alta há mais prêmios grandes e também mais sessões em que a banca acaba rápido.",
      "Quanto mais giros e quanto maior a aposta em relação à banca, maior a chance de o dinheiro acabar antes do planejado."],
   h_tips="Como usar o resultado", tips=["Escolha uma aposta com a qual a banca dure os giros planejados com folga; costuma-se recomendar no máximo 1–2% da banca por giro.",
      "Encare a perda média como o preço da diversão. Se parecer alto demais, reduza a aposta ou o tempo de jogo.",
      "Decida antes quando vai parar, tanto ganhando quanto perdendo."],
   more='Sobre RTP e volatilidade: <a href="articles/kak-rabotayut-sloty.html">“Como funcionam os caça-níqueis”</a>. Para calcular o rollover de um bônus use a <a href="kalkulyator.html">calculadora de rollover</a>.',
   h_embed="Coloque a calculadora no seu site", embed_p="Copie o código e cole no seu site ou fórum: a calculadora vai funcionar de graça.",
   copy="Copiar código", copied="Copiado ✓", embed_link="Calculadora de banca — Lucky Spin Club",
   faq_h2="Perguntas frequentes",
   faq=[("O que é banca?", "É o dinheiro que você separa antes para jogar e que está disposto a perder. Não se mistura com o dinheiro das contas, e o valor da aposta é escolhido conforme a banca."),
        ("Qual aposta escolher em relação à banca?", "Costuma-se recomendar cerca de 1–2% da banca por giro, assim ela dura centenas de giros. Quanto maior a aposta, maior a chance de perder tudo rápido, mesmo com bom RTP."),
        ("A calculadora ajuda a ganhar?", "Não. Ela não aumenta as chances nem prevê resultados. Mostra quanto custa jogar em média e quanta variação existe, para você definir um limite sensato.")],
   promo="📊 Quantos giros seu dinheiro aguenta? Veja na calculadora de banca.", promo_btn="Calculadora de banca"),
}

def _bank_form(t, lg):
    return f'''<form class="calc" data-bank-calc data-lang="{lg}" onsubmit="return false">
  <div class="calc-grid">
    <label>{t["l_bank"]}, {t["cur"]}<input name="bank" type="number" inputmode="decimal" min="0" value="{t["d_bank"]}"></label>
    <label>{t["l_bet"]}, {t["cur"]}<input name="bet" type="number" inputmode="decimal" min="0" value="{t["d_bet"]}"></label>
    <label>{t["l_rtp"]}<input name="rtp" type="number" inputmode="decimal" min="0" max="100" step="0.1" value="96"></label>
    <label>{t["l_spins"]}<input name="spins" type="number" inputmode="numeric" min="1" max="5000" value="{t["d_spins"]}"></label>
    <label class="wide">{t["l_vol"]}<select name="vol"><option value="low">{t["v_low"]}</option><option value="mid" selected>{t["v_mid"]}</option><option value="high">{t["v_high"]}</option></select></label>
  </div>
  <div class="calc-out" aria-live="polite">
    <div><span>{t["r_loss"]}</span><b data-out="loss">—</b></div>
    <div><span>{t["r_profit"]}</span><b data-out="profit">—</b></div>
    <div><span>{t["r_bust"]}</span><b data-out="bust">—</b></div>
    <div><span>{t["r_median"]}</span><b data-out="median">—</b></div>
  </div>
  <p class="calc-verdict" data-out="summary"></p>
  <figure class="bank-chart"><div data-out="chart"></div><figcaption>{t["chart"]}</figcaption></figure>
  <button type="button" class="btn small" data-run>{t["again"]}</button>
</form>'''

def bank_page_parts(lg, root_prefix, lang_prefix):
    t = BT[lg]
    widget = f"{CALC_BASE}/widget/bankroll.html?lang={lg}"
    page_url = f"{CALC_BASE}/{lang_prefix}{BANK_SLUG}"
    embed = (f'<iframe src="{widget}" width="100%" height="760" style="border:0;max-width:640px" loading="lazy" title="{t["embed_link"]}"></iframe>\n'
             f'<p><a href="{page_url}">{t["embed_link"]}</a></p>')
    faq_html = f'<section class="faq">\n<h2>{t["faq_h2"]}</h2>\n' + "".join(f'<details><summary>{_bh.escape(q)}</summary><p>{_bh.escape(x)}</p></details>\n' for q, x in t["faq"]) + '</section>'
    ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": x}} for q, x in t["faq"]]}
    head = '<script type="application/ld+json">' + _bj.dumps(ld, ensure_ascii=False) + '</script>'
    body = f'''    <article>
      <div class="crumbs"><a href="index.html">{t["home"]}</a> / {t["crumb"]}</div>
      <h1>{t["h1"]}</h1>
      <p>{t["intro"]}</p>
    </article>
    {_bank_form(t, lg)}
    <p class="note calc-note">{t["note"]}</p>
    <article>
      <h2>{t["h_how"]}</h2>
      <ul>{"".join(f"<li>{x}</li>" for x in t["how"])}</ul>
      <h2>{t["h_tips"]}</h2>
      <ul>{"".join(f"<li>{x}</li>" for x in t["tips"])}</ul>
      <p>{t["more"]}</p>
      <h2>{t["h_embed"]}</h2>
      <p>{t["embed_p"]}</p>
      <textarea id="embed-code" class="embed-code" readonly rows="4">{_bh.escape(embed)}</textarea>
      <button type="button" class="btn small" data-copy-embed data-done="{t["copied"]}">{t["copy"]}</button>
      {faq_html}
    </article>
<script src="{root_prefix}bank.js"></script>'''
    return t["title"], t["desc"], body, head

def bank_promo(lg, pre):
    t = BT[lg]
    return f'<div class="box calc-promo"><p>{t["promo"]}</p><a class="btn small" href="{pre}{BANK_SLUG}">{t["promo_btn"]}</a></div>'

def write_bank_widget(root_dir):
    forms = "".join(f'<div class="w-lang" data-l="{lg}" hidden>{_bank_form(BT[lg], lg)}<p class="w-credit"><a href="{CALC_BASE}/{"" if lg=="ru" else lg + "/"}{BANK_SLUG}" target="_blank" rel="noopener">{BT[lg]["embed_link"]}</a></p></div>' for lg in ["ru", "es", "pt"])
    html = f'''<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{BT["ru"]["embed_link"]}</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="{CALC_BASE}/{BANK_SLUG}">
<link rel="stylesheet" href="../style.css">
<style>body{{background:var(--bg);padding:12px}} .calc{{margin:0}} .w-credit{{text-align:center;font-size:.85rem;margin:10px 0 0}} .w-credit a{{color:var(--gold)}}</style>
</head>
<body>
{forms}
<script>
(function(){{var l=new URLSearchParams(location.search).get("lang")||"ru";if(["ru","es","pt"].indexOf(l)<0)l="ru";
document.documentElement.lang=l;document.querySelectorAll(".w-lang").forEach(function(d){{if(d.getAttribute("data-l")===l)d.hidden=false;else d.remove();}});}})();
</script>
<script src="../bank.js"></script>
</body>
</html>
'''
    _bos.makedirs(_bos.path.join(root_dir, "widget"), exist_ok=True)
    open(_bos.path.join(root_dir, "widget", "bankroll.html"), "w").write(html)

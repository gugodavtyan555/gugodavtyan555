# Wagering calculator pages (ru/es/pt) and the embeddable widget. exec'd from gen.py and i18n.py.
import json as _cj, os as _cos

CALC_LANGS = ["es", "pt"]
CALC_BASE = "https://lucky-spin-ru.netlify.app"
CT2 = {
 "ru": dict(title="Калькулятор вейджера: сколько нужно отыграть и выгоден ли бонус | Lucky Spin Club",
   desc="Бесплатный калькулятор вейджера: введите бонус, вейджер и RTP — и узнайте сумму отыгрыша, число спинов, ожидаемый проигрыш и выгоден ли бонус. 18+",
   crumb="Калькулятор вейджера", home="Главная", h1="Калькулятор вейджера",
   intro="Введите условия бонуса — калькулятор посчитает, сколько нужно поставить, сколько это спинов и сколько в среднем «съест» отыгрыш. Так видно, выгоден ли бонус, ещё до депозита.",
   l_bonus="Бонус", l_dep="Депозит", l_wager="Вейджер (x)", l_base="Вейджер считается от", base_b="только бонуса", base_both="бонуса + депозита",
   l_rtp="RTP игры, %", l_bet="Ставка за спин", l_contrib="Вклад игры в отыгрыш, %",
   r_turn="Нужно поставить", r_spins="Это примерно", r_loss="Ожидаемый проигрыш при отыгрыше", r_ev="Ожидаемый результат бонуса",
   cur="₽", d_bonus=5000, d_dep=5000, d_bet=100,
   note="Расчёт упрощённый: он показывает среднее значение и не учитывает разброс результатов, максимальную ставку, лимит вывода и срок отыгрыша. Всегда читайте условия бонуса на сайте казино.",
   h_how="Как считается", how=["Сумма отыгрыша = база вейджера × вейджер ÷ вклад игры. База — это бонус или бонус + депозит, смотря по условиям.",
      "Ожидаемый проигрыш = сумма отыгрыша × (1 − RTP). При RTP 96% в среднем «сгорает» 4% от всех ставок.",
      "Ожидаемый результат = бонус − ожидаемый проигрыш. Если он отрицательный, отыгрыш в среднем стоит дороже самого бонуса."],
   h_ex="Пример", ex="Бонус 5 000 ₽, вейджер x35 от бонуса, слот с RTP 96%. Нужно поставить 175 000 ₽. Ожидаемый проигрыш — 4% от 175 000, то есть 7 000 ₽. Это больше бонуса, поэтому в среднем такой бонус невыгоден. С вейджером x20 сумма отыгрыша — 100 000 ₽, ожидаемый проигрыш — 4 000 ₽, и бонус уже в плюсе.",
   more='Подробнее о вейджере — в статье <a href="{a}chto-takoe-vejdzher.html">«Что такое вейджер»</a>.',
   h_embed="Добавить калькулятор на свой сайт", embed_p="Скопируйте код и вставьте его на страницу своего сайта или форума — калькулятор будет работать у вас бесплатно.",
   copy="Скопировать код", copied="Скопировано ✓", embed_link="Калькулятор вейджера — Lucky Spin Club",
   cta_p="Хотите выбрать казино с подходящими условиями?", cta_btn="Сравнить казино",
   faq_h2="Часто задаваемые вопросы",
   faq=[("Как посчитать вейджер бонуса?", "Умножьте базу вейджера (бонус или бонус + депозит) на вейджер. Например, бонус 1 000 ₽ с вейджером x35 — это ставок на 35 000 ₽. Если игра засчитывается не на 100%, разделите сумму на её вклад."),
        ("Какой вейджер считается хорошим?", "Чем ниже, тем лучше. Вейджер до x20 обычно считают мягким, x35–x40 — средним, x50 и выше — тяжёлым. Важно также, от чего он считается и сколько дней на отыгрыш."),
        ("Можно ли доверять расчёту калькулятора?", "Калькулятор показывает среднее ожидаемое значение по RTP. На практике результат может сильно отличаться в любую сторону из-за случайности, поэтому это ориентир, а не прогноз.")],
   promo="🧮 Посчитайте свой бонус: в нашем калькуляторе вейджера видно, сколько нужно отыграть и выгоден ли бонус.", promo_btn="Открыть калькулятор"),
 "es": dict(title="Calculadora de requisito de apuesta: cuánto apostar y si conviene el bono | Lucky Spin Club",
   desc="Calculadora gratuita del requisito de apuesta: introduce bono, requisito y RTP y descubre cuánto apostar, cuántos giros, la pérdida esperada y si el bono conviene. 18+",
   crumb="Calculadora", home="Inicio", h1="Calculadora de requisito de apuesta",
   intro="Introduce las condiciones del bono y la calculadora te dirá cuánto hay que apostar, cuántos giros son y cuánto «se come» en promedio el requisito. Así sabes si el bono conviene antes de depositar.",
   l_bonus="Bono", l_dep="Depósito", l_wager="Requisito (x)", l_base="El requisito se calcula sobre", base_b="solo el bono", base_both="bono + depósito",
   l_rtp="RTP del juego, %", l_bet="Apuesta por giro", l_contrib="Contribución del juego, %",
   r_turn="Hay que apostar", r_spins="Son aproximadamente", r_loss="Pérdida esperada al cumplirlo", r_ev="Resultado esperado del bono",
   cur="$", d_bonus=100, d_dep=100, d_bet=1,
   note="Cálculo simplificado: muestra el valor medio y no tiene en cuenta la variación de resultados, la apuesta máxima, el límite de retiro ni el plazo. Lee siempre las condiciones del bono en la web del casino.",
   h_how="Cómo se calcula", how=["Total a apostar = base del requisito × requisito ÷ contribución del juego. La base es el bono o bono + depósito, según las condiciones.",
      "Pérdida esperada = total a apostar × (1 − RTP). Con RTP del 96 %, en promedio se pierde el 4 % de todas las apuestas.",
      "Resultado esperado = bono − pérdida esperada. Si es negativo, cumplir el requisito cuesta en promedio más que el propio bono."],
   h_ex="Ejemplo", ex="Bono de 100 $, requisito x35 sobre el bono, tragamonedas con RTP del 96 %. Hay que apostar 3500 $. La pérdida esperada es el 4 % de 3500, es decir, 140 $. Es más que el bono, así que en promedio no conviene. Con x20 el total es 2000 $, la pérdida esperada 80 $ y el bono queda en positivo.",
   more='Más sobre el requisito de apuesta en <a href="{a}chto-takoe-vejdzher.html">«Qué es el requisito de apuesta»</a>.',
   h_embed="Añade la calculadora a tu sitio", embed_p="Copia el código y pégalo en tu sitio o foro: la calculadora funcionará gratis.",
   copy="Copiar código", copied="Copiado ✓", embed_link="Calculadora de requisito de apuesta — Lucky Spin Club",
   cta_p="¿Quieres elegir un casino con condiciones adecuadas?", cta_btn="Comparar casinos",
   faq_h2="Preguntas frecuentes",
   faq=[("¿Cómo se calcula el requisito de apuesta?", "Multiplica la base (bono o bono + depósito) por el requisito. Por ejemplo, un bono de 100 $ con x35 son 3500 $ en apuestas. Si el juego no cuenta al 100 %, divide por su contribución."),
        ("¿Qué requisito de apuesta es bueno?", "Cuanto más bajo, mejor. Hasta x20 suele considerarse suave, x35–x40 medio y x50 o más, duro. También importa sobre qué se calcula y cuántos días hay."),
        ("¿Puedo fiarme del cálculo?", "La calculadora muestra el valor medio esperado según el RTP. En la práctica el resultado puede variar mucho por el azar, así que es una referencia, no una predicción.")],
   promo="🧮 Calcula tu bono: nuestra calculadora muestra cuánto hay que apostar y si el bono conviene.", promo_btn="Abrir la calculadora"),
 "pt": dict(title="Calculadora de rollover: quanto apostar e se o bônus compensa | Lucky Spin Club",
   desc="Calculadora grátis de rollover: informe bônus, rollover e RTP e veja quanto apostar, quantos giros, a perda esperada e se o bônus compensa. 18+",
   crumb="Calculadora", home="Início", h1="Calculadora de rollover",
   intro="Informe as condições do bônus e a calculadora mostra quanto é preciso apostar, quantos giros são e quanto o rollover «come» em média. Assim você sabe se o bônus compensa antes de depositar.",
   l_bonus="Bônus", l_dep="Depósito", l_wager="Rollover (x)", l_base="O rollover é calculado sobre", base_b="só o bônus", base_both="bônus + depósito",
   l_rtp="RTP do jogo, %", l_bet="Aposta por giro", l_contrib="Contribuição do jogo, %",
   r_turn="É preciso apostar", r_spins="São cerca de", r_loss="Perda esperada no rollover", r_ev="Resultado esperado do bônus",
   cur="R$", d_bonus=500, d_dep=500, d_bet=5,
   note="Cálculo simplificado: mostra o valor médio e não considera a variação dos resultados, a aposta máxima, o limite de saque nem o prazo. Leia sempre as condições do bônus no site do cassino.",
   h_how="Como é calculado", how=["Total a apostar = base do rollover × rollover ÷ contribuição do jogo. A base é o bônus ou bônus + depósito, conforme as condições.",
      "Perda esperada = total a apostar × (1 − RTP). Com RTP de 96%, em média 4% de todas as apostas ficam com o cassino.",
      "Resultado esperado = bônus − perda esperada. Se for negativo, cumprir o rollover custa em média mais que o próprio bônus."],
   h_ex="Exemplo", ex="Bônus de R$500, rollover x35 sobre o bônus, caça-níquel com RTP de 96%. É preciso apostar R$17.500. A perda esperada é 4% de 17.500, ou seja, R$700. É mais que o bônus, então em média não compensa. Com x20 o total é R$10.000, a perda esperada R$400 e o bônus fica positivo.",
   more='Saiba mais em <a href="{a}chto-takoe-vejdzher.html">“O que é rollover”</a>.',
   h_embed="Coloque a calculadora no seu site", embed_p="Copie o código e cole no seu site ou fórum: a calculadora vai funcionar de graça.",
   copy="Copiar código", copied="Copiado ✓", embed_link="Calculadora de rollover — Lucky Spin Club",
   cta_p="Quer escolher um cassino com condições adequadas?", cta_btn="Comparar cassinos",
   faq_h2="Perguntas frequentes",
   faq=[("Como calcular o rollover do bônus?", "Multiplique a base (bônus ou bônus + depósito) pelo rollover. Por exemplo, um bônus de R$500 com x35 são R$17.500 em apostas. Se o jogo não conta 100%, divida pela contribuição dele."),
        ("Qual rollover é bom?", "Quanto menor, melhor. Até x20 costuma ser considerado leve, x35–x40 médio e x50 ou mais, pesado. Também importa sobre o que é calculado e quantos dias há."),
        ("Posso confiar no cálculo?", "A calculadora mostra o valor médio esperado pelo RTP. Na prática o resultado pode variar muito por causa do acaso, então é uma referência, não uma previsão.")],
   promo="🧮 Calcule seu bônus: nossa calculadora mostra quanto apostar e se o bônus compensa.", promo_btn="Abrir a calculadora"),
}

def _calc_form(t, lg):
    return f'''<form class="calc" data-wager-calc data-lang="{lg}" onsubmit="return false">
  <div class="calc-grid">
    <label>{t["l_bonus"]}, {t["cur"]}<input name="bonus" type="number" inputmode="decimal" min="0" value="{t["d_bonus"]}"></label>
    <label>{t["l_dep"]}, {t["cur"]}<input name="deposit" type="number" inputmode="decimal" min="0" value="{t["d_dep"]}"></label>
    <label>{t["l_wager"]}<input name="wager" type="number" inputmode="decimal" min="0" value="35"></label>
    <label>{t["l_base"]}<select name="base"><option value="bonus">{t["base_b"]}</option><option value="both">{t["base_both"]}</option></select></label>
    <label>{t["l_rtp"]}<input name="rtp" type="number" inputmode="decimal" min="0" max="100" step="0.1" value="96"></label>
    <label>{t["l_bet"]}, {t["cur"]}<input name="bet" type="number" inputmode="decimal" min="0" value="{t["d_bet"]}"></label>
    <label>{t["l_contrib"]}<input name="contrib" type="number" inputmode="decimal" min="0" max="100" value="100"></label>
  </div>
  <div class="calc-out" aria-live="polite">
    <div><span>{t["r_turn"]}</span><b data-out="turnover">—</b></div>
    <div><span>{t["r_spins"]}</span><b data-out="spins">—</b></div>
    <div><span>{t["r_loss"]}</span><b data-out="loss">—</b></div>
    <div><span>{t["r_ev"]}</span><b data-out="ev">—</b></div>
  </div>
  <p class="calc-verdict" data-out="verdict"></p>
</form>'''

def calc_page_parts(lg, root_prefix, lang_prefix):
    """root_prefix: path from the page to the site root; lang_prefix: '' for ru, 'es/' etc."""
    t = CT2[lg]; a = "articles/"
    widget = f"{CALC_BASE}/widget/wager.html?lang={lg}"
    page_url = f"{CALC_BASE}/{lang_prefix}kalkulyator.html"
    embed = (f'<iframe src="{widget}" width="100%" height="560" style="border:0;max-width:640px" loading="lazy" title="{t["embed_link"]}"></iframe>\n'
             f'<p><a href="{page_url}">{t["embed_link"]}</a></p>')
    import html as _ch
    faq_html = f'<section class="faq">\n<h2>{t["faq_h2"]}</h2>\n' + "".join(f'<details><summary>{_ch.escape(q)}</summary><p>{_ch.escape(x)}</p></details>\n' for q, x in t["faq"]) + '</section>'
    ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": x}} for q, x in t["faq"]]}
    head = '<script type="application/ld+json">' + _cj.dumps(ld, ensure_ascii=False) + '</script>'
    body = f'''    <article>
      <div class="crumbs"><a href="index.html">{t["home"]}</a> / {t["crumb"]}</div>
      <h1>{t["h1"]}</h1>
      <p>{t["intro"]}</p>
    </article>
    {_calc_form(t, lg)}
    <p class="note calc-note">{t["note"]}</p>
    <article>
      <h2>{t["h_how"]}</h2>
      <ul>{"".join(f"<li>{x}</li>" for x in t["how"])}</ul>
      <h2>{t["h_ex"]}</h2>
      <p>{t["ex"]}</p>
      <p>{t["more"].format(a=a)}</p>
      <div class="box"><p>{t["cta_p"]}</p><a class="btn ref" href="kazino.html">{t["cta_btn"]}</a><div class="note">18+</div></div>
      <h2>{t["h_embed"]}</h2>
      <p>{t["embed_p"]}</p>
      <textarea id="embed-code" class="embed-code" readonly rows="4">{_ch.escape(embed)}</textarea>
      <button type="button" class="btn small" data-copy-embed data-done="{t["copied"]}">{t["copy"]}</button>
      {faq_html}
    </article>
<script src="{root_prefix}calc.js"></script>'''
    return t["title"], t["desc"], body, head

def write_widget(root_dir):
    t = CT2["ru"]
    forms = "".join(f'<div class="w-lang" data-l="{lg}" hidden>{_calc_form(CT2[lg], lg)}<p class="w-credit"><a href="{CALC_BASE}/{"" if lg=="ru" else lg + "/"}kalkulyator.html" target="_blank" rel="noopener">{CT2[lg]["embed_link"]}</a></p></div>' for lg in ["ru", "es", "pt"])
    html = f'''<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{t["embed_link"]}</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="{CALC_BASE}/kalkulyator.html">
<link rel="stylesheet" href="../style.css">
<style>body{{background:var(--bg);padding:12px}} .calc{{margin:0}} .w-credit{{text-align:center;font-size:.85rem;margin:10px 0 0}} .w-credit a{{color:var(--gold)}}</style>
</head>
<body>
{forms}
<script>
(function(){{var l=new URLSearchParams(location.search).get("lang")||"ru";if(["ru","es","pt"].indexOf(l)<0)l="ru";
document.documentElement.lang=l;document.querySelectorAll(".w-lang").forEach(function(d){{if(d.getAttribute("data-l")===l)d.hidden=false;else d.remove();}});}})();
</script>
<script src="../calc.js"></script>
</body>
</html>
'''
    _cos.makedirs(_cos.path.join(root_dir, "widget"), exist_ok=True)
    open(_cos.path.join(root_dir, "widget", "wager.html"), "w").write(html)

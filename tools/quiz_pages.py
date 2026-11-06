# Myth-or-fact quiz (viktorina.html) and gambling self-check (samoproverka.html), ru/es/pt. exec'd from gen.py and i18n.py.
import json as _qj, html as _qh

QUIZ_SLUG = "viktorina.html"
SELF_SLUG = "samoproverka.html"
HELP_LINKS = '<a href="https://www.gamblersanonymous.org/" target="_blank" rel="noopener">Gamblers Anonymous</a> · <a href="https://www.gamblingtherapy.org/" target="_blank" rel="noopener">Gambling Therapy</a>'

QZ = {
 "ru": dict(title="Миф или факт: тест о казино из 10 вопросов",
   desc="Проверьте себя: 10 утверждений о слотах, RTP, вейджере и рулетке — где миф, а где факт. Объяснение к каждому ответу и результат, которым можно поделиться. 18+",
   home="Главная", crumb="Тест «Миф или факт»", h1="Миф или факт? Тест о казино",
   intro="10 популярных утверждений об онлайн-казино. Выберите ответ — и сразу увидите объяснение. В конце — ваш результат.",
   myth="Миф", fact="Факт", right="✅ Верно!", wrong="❌ Не совсем.",
   share="Я прошёл тест «Миф или факт» о казино: {s} из {n}. Попробуйте сами:",
   res_h="Ваш результат", lo="Многие мифы о казино звучат убедительно. Загляните в наши статьи — там всё простыми словами.",
   mid="Хороший результат! Пара мифов всё же сбила с толку — статьи помогут закрыть пробелы.",
   hi="Отлично! Вы хорошо понимаете, как устроены казино, и вас сложно обмануть мифами.",
   tg="Поделиться в Telegram", wa="WhatsApp", copy="Скопировать ссылку", copied="Ссылка скопирована ✓", again="Пройти ещё раз",
   more='Хотите разобраться подробнее? Все материалы — на странице <a href="stati.html">«Статьи»</a>.',
   items=[("Если слот долго не давал выигрыша, скоро он обязательно «отдаст».", "m", "Каждый спин определяет генератор случайных чисел, спины независимы. Автомат не «помнит» прошлые проигрыши."),
          ("RTP 96% означает, что на очень длинной дистанции слот в среднем возвращает 96% от всех ставок.", "f", "Это среднее значение на миллионах спинов. За один вечер результат может быть любым."),
          ("Вейджер x35 означает, что сумму бонуса нужно поставить 35 раз, прежде чем его можно вывести.", "f", "Например, бонус 1 000 ₽ с вейджером x35 — это ставок на 35 000 ₽."),
          ("Ставки в рулетке всегда засчитываются в отыгрыш бонуса на 100%.", "m", "Часто настольные и лайв-игры засчитываются частично (например, на 10–20%) или не засчитываются вовсе. Смотрите условия бонуса."),
          ("Система Мартингейла (удваивать ставку после проигрыша) гарантирует выигрыш в рулетке.", "m", "Она не меняет математику игры и быстро упирается в лимиты стола и банкролла. Серия проигрышей может съесть всё."),
          ("В демо-режиме можно изучить слот без риска для своих денег.", "f", "Демо-режим использует виртуальные кредиты: правила те же, но выиграть или проиграть реальные деньги нельзя."),
          ("Перед первым выводом казино может попросить подтвердить личность документами.", "f", "Это верификация (KYC). Лицензированные казино обязаны проверять возраст и личность игрока."),
          ("Высокая волатильность означает, что выигрыши выпадают реже, но бывают крупнее.", "f", "Волатильность описывает разброс результатов, а не средний возврат. Средний возврат задаёт RTP."),
          ("Чем дольше играешь, тем меньше становится преимущество казино.", "m", "Наоборот: преимущество казино постоянно, а на длинной дистанции результат всё ближе к математическому ожиданию."),
          ("Базовая стратегия в блэкджеке снижает преимущество казино, но не убирает его полностью.", "f", "Она помогает принимать математически лучшие решения, но небольшое преимущество у казино остаётся.")]),
 "es": dict(title="Mito o realidad: test de casino de 10 preguntas",
   desc="Ponte a prueba: 10 afirmaciones sobre tragamonedas, RTP, requisito de apuesta y ruleta. ¿Mito o realidad? Explicación en cada respuesta y resultado para compartir. 18+",
   home="Inicio", crumb="Test «Mito o realidad»", h1="¿Mito o realidad? Test de casino",
   intro="10 afirmaciones populares sobre los casinos online. Elige una respuesta y verás la explicación al instante. Al final, tu resultado.",
   myth="Mito", fact="Realidad", right="✅ ¡Correcto!", wrong="❌ No exactamente.",
   share="Hice el test «Mito o realidad» sobre casinos: {s} de {n}. Pruébalo:",
   res_h="Tu resultado", lo="Muchos mitos sobre los casinos suenan convincentes. Echa un vistazo a nuestros artículos: todo explicado de forma sencilla.",
   mid="¡Buen resultado! Algún mito te confundió, pero los artículos te ayudarán a cerrar las dudas.",
   hi="¡Excelente! Entiendes bien cómo funcionan los casinos y es difícil engañarte con mitos.",
   tg="Compartir en Telegram", wa="WhatsApp", copy="Copiar enlace", copied="Enlace copiado ✓", again="Repetir el test",
   more='¿Quieres saber más? Todo está en la página de <a href="stati.html">artículos</a>.',
   items=[("Si una tragamonedas lleva mucho sin pagar, pronto tiene que «soltar» un premio.", "m", "Cada giro lo decide un generador de números aleatorios y los giros son independientes. La máquina no «recuerda» las pérdidas."),
          ("Un RTP del 96 % significa que, a muy largo plazo, la tragamonedas devuelve en promedio el 96 % de lo apostado.", "f", "Es un promedio sobre millones de giros. En una sola sesión el resultado puede ser cualquiera."),
          ("Un requisito de apuesta x35 significa apostar 35 veces el importe del bono antes de poder retirarlo.", "f", "Por ejemplo, un bono de 100 $ con x35 equivale a 3500 $ en apuestas."),
          ("Las apuestas en la ruleta siempre cuentan al 100 % para el requisito del bono.", "m", "Con frecuencia los juegos de mesa y en vivo cuentan solo en parte (por ejemplo, 10–20 %) o no cuentan. Revisa las condiciones del bono."),
          ("La martingala (doblar la apuesta tras perder) garantiza ganar en la ruleta.", "m", "No cambia las matemáticas del juego y choca rápido con los límites de la mesa y del saldo. Una racha de pérdidas puede llevarse todo."),
          ("En el modo demo puedes conocer una tragamonedas sin arriesgar tu dinero.", "f", "El modo demo usa créditos virtuales: mismas reglas, pero no se gana ni se pierde dinero real."),
          ("Antes del primer retiro, el casino puede pedir documentos para verificar tu identidad.", "f", "Es la verificación (KYC). Los casinos con licencia deben comprobar la edad y la identidad del jugador."),
          ("Volatilidad alta significa premios menos frecuentes pero más grandes.", "f", "La volatilidad describe la dispersión de los resultados, no el retorno medio. El retorno medio lo marca el RTP."),
          ("Cuanto más tiempo juegas, menor es la ventaja del casino.", "m", "Al contrario: la ventaja del casino es constante y, a largo plazo, el resultado se acerca cada vez más a la esperanza matemática."),
          ("La estrategia básica del blackjack reduce la ventaja del casino, pero no la elimina.", "f", "Ayuda a tomar las decisiones matemáticamente mejores, pero el casino conserva una pequeña ventaja.")]),
 "pt": dict(title="Mito ou verdade: teste de cassino com 10 perguntas",
   desc="Teste seus conhecimentos: 10 afirmações sobre caça-níqueis, RTP, rollover e roleta. Mito ou verdade? Explicação em cada resposta e resultado para compartilhar. 18+",
   home="Início", crumb="Teste «Mito ou verdade»", h1="Mito ou verdade? Teste de cassino",
   intro="10 afirmações populares sobre cassinos online. Escolha uma resposta e veja a explicação na hora. No final, o seu resultado.",
   myth="Mito", fact="Verdade", right="✅ Certo!", wrong="❌ Não exatamente.",
   share="Fiz o teste «Mito ou verdade» sobre cassinos: {s} de {n}. Tente você também:",
   res_h="Seu resultado", lo="Muitos mitos sobre cassinos parecem convincentes. Dê uma olhada nos nossos artigos: tudo explicado de forma simples.",
   mid="Bom resultado! Algum mito confundiu você, mas os artigos ajudam a tirar as dúvidas.",
   hi="Excelente! Você entende bem como os cassinos funcionam e é difícil ser enganado por mitos.",
   tg="Compartilhar no Telegram", wa="WhatsApp", copy="Copiar link", copied="Link copiado ✓", again="Refazer o teste",
   more='Quer saber mais? Tudo está na página de <a href="stati.html">artigos</a>.',
   items=[("Se um caça-níquel está há muito tempo sem pagar, logo ele tem que «soltar» um prêmio.", "m", "Cada giro é decidido por um gerador de números aleatórios e os giros são independentes. A máquina não «lembra» das perdas."),
          ("RTP de 96% significa que, no longuíssimo prazo, o caça-níquel devolve em média 96% do que foi apostado.", "f", "É uma média sobre milhões de giros. Em uma única sessão o resultado pode ser qualquer um."),
          ("Rollover x35 significa apostar 35 vezes o valor do bônus antes de poder sacá-lo.", "f", "Por exemplo, um bônus de R$500 com x35 equivale a R$17.500 em apostas."),
          ("Apostas na roleta sempre contam 100% para o rollover do bônus.", "m", "Muitas vezes jogos de mesa e ao vivo contam só em parte (por exemplo, 10–20%) ou não contam. Confira as condições do bônus."),
          ("O Martingale (dobrar a aposta após perder) garante ganhar na roleta.", "m", "Ele não muda a matemática do jogo e logo esbarra nos limites da mesa e da banca. Uma sequência de perdas pode levar tudo."),
          ("No modo demo dá para conhecer um caça-níquel sem arriscar seu dinheiro.", "f", "O modo demo usa créditos virtuais: mesmas regras, mas não se ganha nem se perde dinheiro real."),
          ("Antes do primeiro saque, o cassino pode pedir documentos para confirmar sua identidade.", "f", "É a verificação (KYC). Cassinos licenciados precisam conferir a idade e a identidade do jogador."),
          ("Volatilidade alta significa prêmios menos frequentes, porém maiores.", "f", "A volatilidade descreve a variação dos resultados, não o retorno médio. O retorno médio é dado pelo RTP."),
          ("Quanto mais tempo você joga, menor fica a vantagem do cassino.", "m", "Pelo contrário: a vantagem do cassino é constante e, no longo prazo, o resultado se aproxima cada vez mais da expectativa matemática."),
          ("A estratégia básica do blackjack reduz a vantagem do cassino, mas não a elimina.", "f", "Ela ajuda a tomar as decisões matematicamente melhores, mas o cassino mantém uma pequena vantagem.")]),
}

ST = {
 "ru": dict(title="Тест: контролирую ли я игру? Самопроверка за 2 минуты",
   desc="Анонимная самопроверка из 8 вопросов о признаках проблемной игры. Ответы не сохраняются и никуда не отправляются. Советы и бесплатная помощь. 18+",
   home="Главная", crumb="Самопроверка", h1="Контролирую ли я игру? Самопроверка",
   intro="8 вопросов о том, как азартные игры влияют на вашу жизнь. Отвечайте честно — ответы остаются только в вашем браузере: мы их не сохраняем и никуда не отправляем.",
   period="Подумайте о последних 12 месяцах.", yes="Да", no="Нет", go="Показать результат", incomplete="Ответьте, пожалуйста, на все вопросы.",
   note="Это не медицинская диагностика, а повод внимательнее посмотреть на свою игру. Если вас что-то тревожит — поговорите со специалистом.",
   qs=["Вы играли дольше или на большие суммы, чем планировали?", "Вы пытались отыграться после проигрыша?", "Вы занимали деньги или продавали вещи, чтобы играть или покрыть проигрыши?",
       "Вы скрывали от близких, сколько времени или денег тратите на игру?", "Вы чувствовали раздражение или тревогу, когда пытались играть меньше?", "Игра мешала работе, учёбе или отношениям?",
       "Вы играли, чтобы уйти от проблем или плохого настроения?", "Близкие говорили вам, что игра стала проблемой?"],
   r0='<h2>Признаков проблемной игры не видно</h2><p>Продолжайте относиться к игре как к развлечению: заранее задавайте бюджет и время и не играйте на деньги, нужные для жизни.</p>',
   r1='<h2>Есть отдельные тревожные сигналы</h2><p>Стоит задуматься. Поставьте лимиты депозита и времени в настройках казино, делайте перерывы и не пытайтесь отыгрываться. Если сигналов станет больше — обратитесь за поддержкой.</p><p>Бесплатная анонимная помощь: ' + HELP_LINKS + '.</p>',
   r3='<h2>Несколько признаков проблемной игры</h2><p>Рекомендуем сделать паузу и поговорить с теми, кто может помочь. Многие казино позволяют включить самоисключение — блокировку аккаунта на выбранный срок. Обращаться за помощью нормально, и это работает.</p><p>Бесплатная анонимная помощь: ' + HELP_LINKS + '.</p>',
   more='Подробнее — в статье <a href="articles/otvetstvennaya-igra.html">«Ответственная игра»</a>.'),
 "es": dict(title="Test: ¿controlo mi juego? Autoevaluación en 2 minutos",
   desc="Autoevaluación anónima de 8 preguntas sobre señales de juego problemático. Las respuestas no se guardan ni se envían. Consejos y ayuda gratuita. 18+",
   home="Inicio", crumb="Autoevaluación", h1="¿Controlo mi juego? Autoevaluación",
   intro="8 preguntas sobre cómo el juego afecta tu vida. Responde con sinceridad: las respuestas se quedan solo en tu navegador; no las guardamos ni las enviamos.",
   period="Piensa en los últimos 12 meses.", yes="Sí", no="No", go="Ver resultado", incomplete="Por favor, responde todas las preguntas.",
   note="No es un diagnóstico médico, sino una invitación a mirar tu juego con atención. Si algo te preocupa, habla con un especialista.",
   qs=["¿Jugaste más tiempo o más dinero del que habías planeado?", "¿Intentaste recuperar lo perdido volviendo a jugar?", "¿Pediste dinero prestado o vendiste cosas para jugar o cubrir pérdidas?",
       "¿Ocultaste a tus seres queridos cuánto tiempo o dinero dedicas al juego?", "¿Sentiste irritación o ansiedad al intentar jugar menos?", "¿El juego afectó tu trabajo, estudios o relaciones?",
       "¿Jugaste para escapar de problemas o del mal humor?", "¿Alguien cercano te dijo que el juego se volvió un problema?"],
   r0='<h2>No se ven señales de juego problemático</h2><p>Sigue tratando el juego como entretenimiento: fija de antemano un presupuesto y un tiempo, y no juegues con dinero que necesitas para vivir.</p>',
   r1='<h2>Hay algunas señales de alerta</h2><p>Vale la pena reflexionar. Configura límites de depósito y de tiempo en el casino, haz pausas y no intentes recuperar pérdidas. Si las señales aumentan, busca apoyo.</p><p>Ayuda gratuita y confidencial: ' + HELP_LINKS + '.</p>',
   r3='<h2>Varias señales de juego problemático</h2><p>Te recomendamos hacer una pausa y hablar con quien pueda ayudarte. Muchos casinos permiten la autoexclusión: bloquear la cuenta durante el tiempo que elijas. Pedir ayuda es normal y funciona.</p><p>Ayuda gratuita y confidencial: ' + HELP_LINKS + '.</p>',
   more='Más información en <a href="articles/otvetstvennaya-igra.html">«Juego responsable»</a>.'),
 "pt": dict(title="Teste: eu controlo o meu jogo? Autoavaliação em 2 minutos",
   desc="Autoavaliação anônima com 8 perguntas sobre sinais de jogo problemático. As respostas não são salvas nem enviadas. Dicas e ajuda gratuita. 18+",
   home="Início", crumb="Autoavaliação", h1="Eu controlo o meu jogo? Autoavaliação",
   intro="8 perguntas sobre como o jogo afeta a sua vida. Responda com sinceridade: as respostas ficam só no seu navegador; não salvamos nem enviamos nada.",
   period="Pense nos últimos 12 meses.", yes="Sim", no="Não", go="Ver resultado", incomplete="Por favor, responda todas as perguntas.",
   note="Não é um diagnóstico médico, e sim um convite para olhar o seu jogo com atenção. Se algo preocupa você, converse com um especialista.",
   qs=["Você jogou por mais tempo ou com mais dinheiro do que tinha planejado?", "Você tentou recuperar perdas voltando a jogar?", "Você pegou dinheiro emprestado ou vendeu coisas para jogar ou cobrir perdas?",
       "Você escondeu das pessoas próximas quanto tempo ou dinheiro gasta com jogo?", "Você se sentiu irritado ou ansioso ao tentar jogar menos?", "O jogo atrapalhou seu trabalho, estudos ou relacionamentos?",
       "Você jogou para fugir de problemas ou do mau humor?", "Alguém próximo disse que o jogo virou um problema?"],
   r0='<h2>Não aparecem sinais de jogo problemático</h2><p>Continue tratando o jogo como diversão: defina antes um orçamento e um tempo, e não jogue com dinheiro de que você precisa para viver.</p>',
   r1='<h2>Há alguns sinais de alerta</h2><p>Vale a pena refletir. Configure limites de depósito e de tempo no cassino, faça pausas e não tente recuperar perdas. Se os sinais aumentarem, procure apoio.</p><p>Ajuda gratuita e confidencial: ' + HELP_LINKS + '.</p>',
   r3='<h2>Vários sinais de jogo problemático</h2><p>Recomendamos fazer uma pausa e conversar com quem pode ajudar. Muitos cassinos permitem a autoexclusão: bloquear a conta pelo tempo que você escolher. Pedir ajuda é normal e funciona.</p><p>Ajuda gratuita e confidencial: ' + HELP_LINKS + '.</p>',
   more='Saiba mais em <a href="articles/otvetstvennaya-igra.html">“Jogo responsável”</a>.'),
}

def _faq_ld(pairs):
    return '<script type="application/ld+json">' + _qj.dumps({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": a, "acceptedAnswer": {"@type": "Answer", "text": b}} for a, b in pairs]}, ensure_ascii=False) + '</script>'

def quiz_page_parts(lg, root_prefix):
    t = QZ[lg]; e = _qh.escape
    items = "".join(f'''<div class="qz-item" data-correct="{c}"><p class="qz-q"><b>{i + 1}.</b> {e(s)}</p>
<div class="qz-btns"><button type="button" class="btn small" data-a="m">{t["myth"]}</button><button type="button" class="btn small" data-a="f">{t["fact"]}</button></div>
<div class="qz-expl" hidden><b class="qz-verdict"></b> <span>{t["fact"] if c == "f" else t["myth"]}. {e(x)}</span></div></div>
''' for i, (s, c, x) in enumerate(t["items"]))
    body = f'''    <article>
      <div class="crumbs"><a href="index.html">{t["home"]}</a> / {t["crumb"]}</div>
      <h1>{t["h1"]}</h1>
      <p>{t["intro"]}</p>
    </article>
    <section class="calc quiz" data-quiz data-right="{e(t["right"])}" data-wrong="{e(t["wrong"])}" data-share="{e(t["share"])}">
{items}<div class="qz-result" hidden data-lo="{e(t["lo"])}" data-mid="{e(t["mid"])}" data-hi="{e(t["hi"])}">
<h2>{t["res_h"]}: <span class="qz-score"></span></h2><p class="qz-text"></p>
<div class="qz-share"><a class="btn small qz-tg" href="#" target="_blank" rel="noopener">{t["tg"]}</a><a class="btn small qz-wa" href="#" target="_blank" rel="noopener">{t["wa"]}</a><button type="button" class="btn small qz-copy" data-done="{e(t["copied"])}">{t["copy"]}</button></div>
<p><button type="button" class="linkish qz-again">{t["again"]}</button></p></div>
    </section>
    <article><p>{t["more"]}</p></article>
<script src="{root_prefix}quiz.js" defer></script>'''
    return t["title"], t["desc"], body, ""

def selftest_page_parts(lg, root_prefix):
    t = ST[lg]; e = _qh.escape
    qs = "".join(f'''<fieldset class="st-q"><legend>{i + 1}. {e(q)}</legend><label><input type="radio" name="q{i}" value="1"> {t["yes"]}</label><label><input type="radio" name="q{i}" value="0"> {t["no"]}</label></fieldset>
''' for i, q in enumerate(t["qs"]))
    body = f'''    <article>
      <div class="crumbs"><a href="index.html">{t["home"]}</a> / {t["crumb"]}</div>
      <h1>{t["h1"]}</h1>
      <p>{t["intro"]}</p>
    </article>
    <form class="calc selftest" data-selftest data-incomplete="{e(t["incomplete"])}" onsubmit="return false">
<p><b>{t["period"]}</b></p>
{qs}<button type="button" class="btn st-go">{t["go"]}</button>
<div class="st-result" hidden aria-live="polite"></div>
<template data-level="0">{t["r0"]}</template><template data-level="1">{t["r1"]}</template><template data-level="3">{t["r3"]}</template>
    </form>
    <p class="note calc-note">{t["note"]}</p>
    <article><p>{t["more"]}</p></article>
<script src="{root_prefix}quiz.js" defer></script>'''
    return t["title"], t["desc"], body, ""

def selftest_promo(lg, pre):
    txt = {"ru": ("🧭 Проверьте себя: анонимная самопроверка из 8 вопросов за 2 минуты.", "Пройти самопроверку"),
           "es": ("🧭 Ponte a prueba: autoevaluación anónima de 8 preguntas en 2 minutos.", "Hacer la autoevaluación"),
           "pt": ("🧭 Teste-se: autoavaliação anônima com 8 perguntas em 2 minutos.", "Fazer a autoavaliação")}[lg]
    return f'<div class="box calc-promo"><p>{txt[0]}</p><a class="btn small" href="{pre}{SELF_SLUG}">{txt[1]}</a></div>'

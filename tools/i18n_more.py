# Extra ES/PT translations: free spins, crypto casino, glossary.
# Facts mirror the Russian articles and the comparison page; nothing new about any casino.

def _crypto_box(lg):
    t = {"es": ("Casinos que aceptan criptomonedas. Antes de registrarte, comprueba que el casino acepte jugadores de tu país.", "Ir a", "Comparar todos los casinos"),
         "pt": ("Cassinos que aceitam criptomoedas. Antes de se cadastrar, confirme que o cassino aceita jogadores do seu país.", "Ir para", "Comparar todos os cassinos")}[lg]
    return f'''<div class="box"><p>{t[0]}</p>
<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><a class="btn casino-ref" data-casino="spincrypto" href="#">{t[1]} SpinCrypto</a><a class="btn casino-ref" data-casino="booi" href="#">{t[1]} Booi</a></div>
<div class="note">18+ · <a href="../kazino.html">{t[2]}</a></div></div>'''

ART["frispiny"] = {
 "es": ("🌀", "Giros gratis", "Qué son los giros gratis y cómo conseguirlos.",
  "Giros gratis en el casino: qué son y cómo conseguirlos",
  "Qué son los giros gratis en los casinos online, cómo conseguirlos, qué condiciones tienen y en qué se diferencian de los giros gratis dentro de una tragamonedas. 18+",
  """<p>Los giros gratis (free spins) son tiradas sin coste en las tragamonedas. Se pueden obtener de dos formas distintas, y es importante no confundirlas.</p>
<h2>Dos tipos de giros gratis</h2>
<ul><li><strong>Giros gratis de bonificación del casino.</strong> El casino los da por registrarte, por un depósito o en promociones. Normalmente valen para una tragamonedas concreta.</li><li><strong>Giros gratis dentro de la tragamonedas.</strong> Es una función del propio juego: por ejemplo, salen tres símbolos scatter y la máquina activa tiradas gratis.</li></ul>
<h2>Cómo conseguir giros gratis de bonificación</h2>
<ul><li>Como parte del paquete de bienvenida para nuevos jugadores.</li><li>Por depositar durante una promoción.</li><li>En torneos y programas de fidelidad.</li></ul>
<p>Busca las ofertas actuales en la sección «Bonos» o «Promociones» del casino.</p>
<h2>Condiciones de los giros gratis</h2>
<ul><li><strong>Valor del giro:</strong> lo fija el casino y no se puede cambiar.</li><li><strong>Tragamonedas:</strong> los giros solo funcionan en el juego indicado.</li><li><strong>Plazo:</strong> los giros no usados caducan.</li><li><strong>Requisito de apuesta sobre las ganancias:</strong> a menudo hay que cumplirlo. Más información en <a href="chto-takoe-vejdzher.html">«Qué es el requisito de apuesta»</a>.</li></ul>
<h2>Consejo</h2>
<p>Antes de activarlos, revisa cuántos días son válidos y si hay un límite de retiro de las ganancias.</p>""",
  [("¿Se pueden retirar las ganancias de los giros gratis?", "Sí, pero a menudo solo después de cumplir el requisito de apuesta y dentro del límite de retiro, si las condiciones lo establecen."),
   ("¿Puedo usar los giros gratis en cualquier tragamonedas?", "Por lo general no: los giros gratis de bonificación solo valen para la tragamonedas indicada en las condiciones de la promoción."),
   ("¿Los giros gratis caducan?", "Sí, tienen un plazo de validez. Los giros no usados normalmente se anulan al terminar.")]),
 "pt": ("🌀", "Giros grátis", "O que são giros grátis e como consegui-los.",
  "Giros grátis no cassino: o que são e como consegui-los",
  "O que são giros grátis em cassinos online, como consegui-los, quais condições eles têm e como diferem dos giros grátis dentro de um caça-níquel. 18+",
  """<p>Giros grátis (free spins) são rodadas sem custo nos caça-níqueis. Eles podem vir de duas formas diferentes, e é importante não confundir.</p>
<h2>Dois tipos de giros grátis</h2>
<ul><li><strong>Giros grátis de bônus do cassino.</strong> O cassino os dá pelo cadastro, por um depósito ou em promoções. Normalmente valem para um caça-níquel específico.</li><li><strong>Giros grátis dentro do caça-níquel.</strong> É um recurso do próprio jogo: por exemplo, saem três símbolos scatter e a máquina ativa rodadas grátis.</li></ul>
<h2>Como conseguir giros grátis de bônus</h2>
<ul><li>No pacote de boas-vindas para novos jogadores.</li><li>Ao depositar durante uma promoção.</li><li>Em torneios e programas de fidelidade.</li></ul>
<p>Veja as ofertas atuais na seção “Bônus” ou “Promoções” do cassino.</p>
<h2>Condições dos giros grátis</h2>
<ul><li><strong>Valor do giro:</strong> definido pelo cassino, não pode ser alterado.</li><li><strong>Caça-níquel:</strong> os giros só funcionam no jogo indicado.</li><li><strong>Prazo:</strong> giros não usados expiram.</li><li><strong>Rollover dos ganhos:</strong> muitas vezes é preciso cumpri-lo. Saiba mais em <a href="chto-takoe-vejdzher.html">“O que é rollover”</a>.</li></ul>
<h2>Dica</h2>
<p>Antes de ativar, veja por quantos dias os giros valem e se há limite de saque dos ganhos.</p>""",
  [("Dá para sacar os ganhos dos giros grátis?", "Sim, mas muitas vezes só depois de cumprir o rollover e dentro do limite de saque, se as condições tiverem um."),
   ("Posso usar giros grátis em qualquer caça-níquel?", "Em geral não: giros grátis de bônus valem apenas para o caça-níquel indicado nas condições da promoção."),
   ("Os giros grátis expiram?", "Sim, eles têm prazo de validade. Giros não usados normalmente são cancelados depois disso.")]),
}

ART["kriptokazino"] = {
 "es": ("🪙", "Casino cripto", "Cómo jugar con criptomonedas: billetera, redes, comisiones y riesgos.",
  "Casino cripto: cómo jugar con criptomonedas, guía para principiantes",
  "Qué es un casino cripto y cómo jugar con criptomonedas: qué billetera necesitas, cómo elegir la red de USDT (TRC20, ERC20, BSC), comisiones, confirmaciones, stablecoins y riesgos. 18+",
  """<p>Un casino cripto es un casino online donde puedes depositar y retirar en criptomonedas: bitcoin, ether, USDT y otras. Algunos casinos funcionan solo con cripto; otros la aceptan junto con dinero normal. Veamos cómo funciona y qué debe tener en cuenta un principiante.</p>
<h2>Qué necesitas</h2>
<ul><li><strong>Una billetera cripto</strong>: puede ser la billetera de un exchange o una aplicación de billetera donde solo tú controlas las claves.</li><li><strong>Monedas en la billetera</strong>: se compran en un exchange o en una casa de cambio.</li><li><strong>Una cuenta en un casino</strong> que acepte la moneda que quieres usar.</li></ul>
<h2>Stablecoins o criptomonedas normales</h2>
<p>El precio del bitcoin, del ether y de otras monedas puede cambiar mucho incluso en un solo día. Si tu cuenta del casino está en BTC, el valor de tu saldo en dólares «flotará» con el precio, independientemente del juego.</p>
<p>Las stablecoins USDT y USDC están vinculadas al dólar estadounidense, por lo que su valor casi no cambia. Para principiantes suelen ser más sencillas: siempre sabes cuánto tienes.</p>
<h2>La regla principal: elige la red correcta</h2>
<p>Una misma moneda puede existir en varias redes. Por ejemplo, USDT existe en TRC20 (Tron), ERC20 (Ethereum), BSC, Solana y otras. La dirección de depósito del casino está vinculada a una red concreta.</p>
<ul><li>La red de envío en tu billetera debe coincidir con la red indicada por el casino.</li><li>Si envías monedas por la red equivocada, puedes perderlas para siempre.</li><li>Antes del primer depósito, envía una pequeña cantidad de prueba.</li></ul>
<h2>Comisiones y tiempo de acreditación</h2>
<p>Cada transferencia en blockchain paga una comisión de red. Su tamaño depende de la red y de la congestión: en Ethereum suele ser más alta, y en Tron, BSC y Solana, por lo general, más baja. Tenla en cuenta, sobre todo con importes pequeños.</p>
<p>El pago se acredita tras varias confirmaciones de la red. Normalmente tarda de unos minutos a una hora, según la moneda y la congestión.</p>
<h2>Las transferencias son irreversibles</h2>
<ul><li>Copia la dirección con el botón «Copiar», no a mano, y revisa los primeros y últimos caracteres.</li><li>No envíes monedas a direcciones recibidas por mensajería: toma la dirección solo de tu cuenta en el casino.</li><li>Si la moneda necesita etiqueta o memo (por ejemplo, XRP), indícala siempre.</li></ul>
<h2>Retirar las ganancias</h2>
<p>El retiro también se hace a una billetera cripto: indica la dirección y la misma red. Incluso en un casino cripto puede pedirse verificación. Si retiras a un exchange, revisa antes sus reglas: algunos limitan las transferencias relacionadas con el juego.</p>
<h2>Qué casinos aceptan criptomonedas</h2>
<p>De los casinos de nuestra <a href="../kazino.html">página de comparación</a>: SpinCrypto funciona solo con criptomonedas (USDT y USDC en varias redes, BTC, ETH, SOL, TRX, LTC y otras), y Booi acepta BTC, DOGE, ETH, LTC, USDT y XRP.</p>
<h2>Importante</h2>
<p>La criptomoneda cambia solo la forma de pago, no las matemáticas del juego: el casino sigue teniendo ventaja. Juega solo con lo que puedas permitirte perder y ten en cuenta las leyes y normas fiscales de tu país.</p>""" + _crypto_box("es"),
  [("¿Qué criptomoneda conviene a un principiante?", "Las stablecoins USDT o USDC suelen ser más cómodas: están vinculadas al dólar, así que el saldo no cambia con el precio."),
   ("¿Qué pasa si envío USDT por la red equivocada?", "Una transferencia por la red equivocada puede hacerte perder los fondos. Comprueba siempre que la red de tu billetera coincida con la indicada por el casino."),
   ("¿Se puede cancelar una transferencia cripto?", "No. Las transferencias en blockchain son irreversibles; revisa la dirección y la red antes de enviar y, la primera vez, envía una pequeña cantidad de prueba.")]),
 "pt": ("🪙", "Cassino cripto", "Como jogar com criptomoedas: carteira, redes, taxas e riscos.",
  "Cassino cripto: como jogar com criptomoedas, guia para iniciantes",
  "O que é um cassino cripto e como jogar com criptomoedas: qual carteira usar, como escolher a rede do USDT (TRC20, ERC20, BSC), taxas, confirmações, stablecoins e riscos. 18+",
  """<p>Um cassino cripto é um cassino online em que você pode depositar e sacar em criptomoedas: bitcoin, ether, USDT e outras. Alguns cassinos funcionam só com cripto; outros aceitam cripto junto com dinheiro comum. Veja como funciona e o que um iniciante precisa saber.</p>
<h2>O que você precisa</h2>
<ul><li><strong>Uma carteira cripto</strong>: pode ser a carteira de uma corretora ou um aplicativo de carteira em que só você controla as chaves.</li><li><strong>Moedas na carteira</strong>: compradas em uma corretora ou casa de câmbio.</li><li><strong>Uma conta em um cassino</strong> que aceite a moeda que você quer usar.</li></ul>
<h2>Stablecoins ou criptomoedas comuns</h2>
<p>O preço do bitcoin, do ether e de outras moedas pode mudar muito até em um único dia. Se a conta do cassino estiver em BTC, o valor do saldo em dólares vai “flutuar” com o preço, independentemente do jogo.</p>
<p>As stablecoins USDT e USDC são atreladas ao dólar americano, então o valor quase não muda. Para iniciantes costumam ser mais simples: você sempre sabe quanto tem.</p>
<h2>A regra principal: escolha a rede certa</h2>
<p>A mesma moeda pode existir em várias redes. Por exemplo, o USDT existe em TRC20 (Tron), ERC20 (Ethereum), BSC, Solana e outras. O endereço de depósito do cassino é ligado a uma rede específica.</p>
<ul><li>A rede de envio na sua carteira precisa ser a mesma indicada pelo cassino.</li><li>Se você enviar pela rede errada, pode perder as moedas para sempre.</li><li>Antes do primeiro depósito, envie um valor pequeno de teste.</li></ul>
<h2>Taxas e tempo de crédito</h2>
<p>Toda transferência em blockchain paga uma taxa de rede. O valor depende da rede e do congestionamento: no Ethereum costuma ser mais alta; em Tron, BSC e Solana, em geral, mais baixa. Leve isso em conta, principalmente em valores pequenos.</p>
<p>O pagamento é creditado após algumas confirmações da rede. Normalmente leva de alguns minutos a uma hora, conforme a moeda e o congestionamento.</p>
<h2>Transferências são irreversíveis</h2>
<ul><li>Copie o endereço pelo botão “Copiar”, não à mão, e confira os primeiros e últimos caracteres.</li><li>Não envie moedas para endereços recebidos por mensagem: pegue o endereço só na sua conta do cassino.</li><li>Se a moeda exigir tag ou memo (por exemplo, XRP), informe sempre.</li></ul>
<h2>Sacar os ganhos</h2>
<p>O saque também vai para uma carteira cripto: informe o endereço e a mesma rede. Mesmo em um cassino cripto pode haver verificação. Se for sacar para uma corretora, veja antes as regras dela: algumas limitam transferências ligadas a jogos de azar.</p>
<h2>Quais cassinos aceitam criptomoedas</h2>
<p>Dos cassinos da nossa <a href="../kazino.html">página de comparação</a>: o SpinCrypto funciona só com criptomoedas (USDT e USDC em várias redes, BTC, ETH, SOL, TRX, LTC e outras), e o Booi aceita BTC, DOGE, ETH, LTC, USDT e XRP.</p>
<h2>Importante</h2>
<p>A criptomoeda muda só a forma de pagamento, não a matemática do jogo: o cassino continua tendo vantagem. Jogue apenas o que pode perder e respeite as leis e regras fiscais do seu país.</p>""" + _crypto_box("pt"),
  [("Qual criptomoeda é melhor para iniciantes?", "As stablecoins USDT ou USDC costumam ser mais práticas: são atreladas ao dólar, então o saldo não muda com o preço."),
   ("O que acontece se eu enviar USDT pela rede errada?", "Uma transferência pela rede errada pode fazer você perder o dinheiro. Confira sempre se a rede na carteira é a mesma indicada pelo cassino."),
   ("Dá para cancelar uma transferência cripto?", "Não. Transferências em blockchain são irreversíveis; confira endereço e rede antes de enviar e, na primeira vez, mande um valor pequeno de teste.")]),
}

_GL = {
 "es": [("Conceptos generales", [
   ("Bono", "Fondos extra o giros gratis del casino, normalmente con requisito de apuesta."),
   ("Requisito de apuesta (wagering)", "Cuántas veces hay que apostar el bono para poder retirarlo. Más información en «Qué es el requisito de apuesta»."),
   ("Depósito", "Ingreso de dinero en la cuenta de juego."),
   ("Verificación (KYC)", "Comprobación de la identidad del jugador con documentos, normalmente antes del primer retiro."),
   ("Bankroll", "La cantidad que has reservado de antemano para jugar y que estás dispuesto a perder."),
   ("Cashback", "Devolución de una parte de lo perdido según las reglas de una promoción."),
   ("Programa de fidelidad", "Sistema de niveles o puntos por jugar, con recompensas al subir de nivel."),
   ("Autoexclusión", "Bloqueo voluntario de la cuenta durante un período elegido; herramienta de juego responsable."),
   ("Espejo", "Copia del sitio del casino en otra dirección. Usa solo direcciones de fuentes oficiales del casino: los estafadores crean espejos falsos.")]),
  ("Tragamonedas", [
   ("RTP", "Porcentaje de retorno al jugador: qué parte de las apuestas devuelve la máquina de media a muy largo plazo."),
   ("Volatilidad", "Con qué frecuencia y de qué tamaño paga la máquina: baja, a menudo y poco; alta, rara vez pero mucho."),
   ("RNG", "Generador de números aleatorios que decide el resultado de cada giro."),
   ("Giro (spin)", "Una tirada de los rodillos de la tragamonedas."),
   ("Línea de pago", "Línea de los rodillos en la que cuentan las combinaciones ganadoras."),
   ("Wild (comodín)", "Símbolo que sustituye a otros y ayuda a formar combinaciones."),
   ("Scatter", "Símbolo que paga en cualquier lugar de la pantalla y a menudo activa el bono o los giros gratis."),
   ("Giros gratis", "Tiradas sin coste: un bono del casino o una función de la propia máquina."),
   ("Multiplicador", "Aumenta el premio un número de veces, por ejemplo ×2 o ×10."),
   ("Megaways", "Mecánica en la que el número de formas de ganar cambia en cada giro."),
   ("Jackpot", "Premio grande. El jackpot progresivo crece con una parte de las apuestas de los jugadores."),
   ("Bonus Buy", "Opción de comprar la ronda de bonificación por un precio fijo en lugar de esperar a que salga."),
   ("Modo demo", "Jugar con fichas virtuales sin arriesgar dinero real.")]),
  ("Mesa y juegos en vivo", [
   ("Ventaja de la casa (house edge)", "La ventaja matemática del casino en un juego. Por ejemplo, en la ruleta europea es de alrededor del 2,7 %."),
   ("Crupier", "La persona que dirige el juego en la mesa o en el estudio en vivo."),
   ("Casino en vivo", "Juegos con crupier real en transmisión en directo."),
   ("Blackjack", "Juego de cartas contra el crupier: el objetivo es sumar más puntos que él sin pasar de 21."),
   ("Split (dividir)", "En blackjack, separar dos cartas iguales en dos manos."),
   ("Doblar", "En blackjack, doblar la apuesta y recibir exactamente una carta más."),
   ("Baccarat", "Juego de cartas en el que se apuesta a la mano del jugador, de la banca o al empate.")]),
  ("Pagos", [
   ("Moneda de la cuenta", "La moneda en la que está abierta la cuenta de juego. A menudo no se puede cambiar después del registro."),
   ("Stablecoin", "Criptomoneda con precio vinculado al dólar, como USDT o USDC."),
   ("Red (TRC20, ERC20, BSC)", "La blockchain por la que se envía la cripto. La red de envío debe coincidir con la indicada por el casino."),
   ("Límite de retiro", "El importe mínimo o máximo que se puede retirar de una vez o en un período.")])],
 "pt": [("Conceitos gerais", [
   ("Bônus", "Fundos extras ou giros grátis do cassino, normalmente com rollover."),
   ("Rollover (wagering)", "Quantas vezes é preciso apostar o bônus para poder sacá-lo. Saiba mais em “O que é rollover”."),
   ("Depósito", "Colocar dinheiro na conta de jogo."),
   ("Verificação (KYC)", "Confirmação da identidade do jogador com documentos, normalmente antes do primeiro saque."),
   ("Banca (bankroll)", "O valor que você separou antes para jogar e está disposto a perder."),
   ("Cashback", "Devolução de parte do que foi perdido, conforme as regras de uma promoção."),
   ("Programa de fidelidade", "Sistema de níveis ou pontos por jogar, com recompensas ao subir de nível."),
   ("Autoexclusão", "Bloqueio voluntário da conta por um período escolhido; ferramenta de jogo responsável."),
   ("Espelho", "Cópia do site do cassino em outro endereço. Use só endereços de fontes oficiais do cassino: golpistas criam espelhos falsos.")]),
  ("Caça-níqueis", [
   ("RTP", "Percentual de retorno ao jogador: que parte das apostas a máquina devolve em média em um período muito longo."),
   ("Volatilidade", "Com que frequência e de que tamanho a máquina paga: baixa, sempre e pouco; alta, raramente mas muito."),
   ("RNG", "Gerador de números aleatórios que define o resultado de cada giro."),
   ("Giro (spin)", "Uma rodada dos rolos do caça-níquel."),
   ("Linha de pagamento", "Linha nos rolos em que as combinações vencedoras contam."),
   ("Wild (curinga)", "Símbolo que substitui outros e ajuda a formar combinações."),
   ("Scatter", "Símbolo que paga em qualquer lugar da tela e muitas vezes ativa o bônus ou giros grátis."),
   ("Giros grátis", "Rodadas sem custo: um bônus do cassino ou um recurso da própria máquina."),
   ("Multiplicador", "Aumenta o prêmio em um número de vezes, por exemplo ×2 ou ×10."),
   ("Megaways", "Mecânica em que o número de formas de ganhar muda a cada giro."),
   ("Jackpot", "Prêmio grande. O jackpot progressivo cresce com parte das apostas dos jogadores."),
   ("Bonus Buy", "Opção de comprar a rodada de bônus por um preço fixo em vez de esperar que ela saia."),
   ("Modo demo", "Jogar com fichas virtuais sem arriscar dinheiro real.")]),
  ("Mesa e jogos ao vivo", [
   ("Vantagem da casa (house edge)", "A vantagem matemática do cassino em um jogo. Por exemplo, na roleta europeia é de cerca de 2,7%."),
   ("Dealer (crupiê)", "A pessoa que conduz o jogo na mesa ou no estúdio ao vivo."),
   ("Cassino ao vivo", "Jogos com dealer real em transmissão ao vivo."),
   ("Blackjack", "Jogo de cartas contra o dealer: o objetivo é somar mais pontos que ele sem passar de 21."),
   ("Split (dividir)", "No blackjack, separar duas cartas iguais em duas mãos."),
   ("Dobrar", "No blackjack, dobrar a aposta e receber exatamente mais uma carta."),
   ("Bacará", "Jogo de cartas em que se aposta na mão do jogador, da banca ou no empate.")]),
  ("Pagamentos", [
   ("Moeda da conta", "A moeda em que a conta de jogo é aberta. Muitas vezes não pode ser trocada depois do cadastro."),
   ("Stablecoin", "Criptomoeda com preço atrelado ao dólar, como USDT ou USDC."),
   ("Rede (TRC20, ERC20, BSC)", "A blockchain pela qual a cripto é enviada. A rede de envio precisa ser a mesma indicada pelo cassino."),
   ("Limite de saque", "O valor mínimo ou máximo que pode ser sacado de uma vez ou em um período.")])],
}

exec(open(S + "/gloss_extra.py").read())
_GL = {_l: gloss_merge(_GL[_l], _l) for _l in _GL}

def _gloss(lg):
    intro = {"es": "Un breve glosario de términos que aparecen en los casinos online. Si una palabra de las reglas de un bono o juego no está clara, búscala aquí.",
             "pt": "Um glossário curto de termos que aparecem nos cassinos online. Se alguma palavra das regras de um bônus ou jogo não estiver clara, procure aqui."}[lg]
    link_from = {"es": "«Qué es el requisito de apuesta»", "pt": "“O que é rollover”"}[lg]
    out = f'<p>{intro}</p>\n'
    for sec, items in _GL[lg]:
        out += f'<h2>{sec}</h2>\n<dl class="gloss">\n' + "".join(
            f'<dt id="{gloss_slug(t)}">{t}</dt><dd>{d.replace(link_from, chr(60) + "a href=\"chto-takoe-vejdzher.html\"" + chr(62) + link_from + chr(60) + "/a" + chr(62))}</dd>\n' for t, d in items) + '</dl>\n'
    return out

ART["slovar-kazino"] = {
 "es": ("📖", "Glosario de casino", "RTP, requisito de apuesta, wild, scatter, cashback y otros términos explicados.",
  "Glosario de casino: términos para principiantes explicados",
  "Glosario de términos de casinos online: RTP, requisito de apuesta, volatilidad, wild, scatter, giros gratis, cashback, Megaways, house edge, stablecoins y más. 18+",
  _gloss("es"),
  [("¿Qué significa RTP en las tragamonedas?", "El RTP es el porcentaje de retorno al jugador: qué parte de todas las apuestas devuelve la máquina de media a muy largo plazo."),
   ("¿En qué se diferencia el wild del scatter?", "El wild sustituye a otros símbolos en una combinación, y el scatter paga en cualquier lugar de la pantalla y a menudo activa el bono o los giros gratis."),
   ("¿Qué es la ventaja de la casa?", "Es la ventaja matemática del casino en un juego. Por ejemplo, en la ruleta europea es de alrededor del 2,7 %.")]),
 "pt": ("📖", "Glossário de cassino", "RTP, rollover, wild, scatter, cashback e outros termos explicados.",
  "Glossário de cassino: termos para iniciantes explicados",
  "Glossário de termos de cassinos online: RTP, rollover, volatilidade, wild, scatter, giros grátis, cashback, Megaways, house edge, stablecoins e mais. 18+",
  _gloss("pt"),
  [("O que significa RTP nos caça-níqueis?", "RTP é o percentual de retorno ao jogador: que parte de todas as apostas a máquina devolve em média em um período muito longo."),
   ("Qual a diferença entre wild e scatter?", "O wild substitui outros símbolos em uma combinação, e o scatter paga em qualquer lugar da tela e muitas vezes ativa o bônus ou giros grátis."),
   ("O que é vantagem da casa?", "É a vantagem matemática do cassino em um jogo. Por exemplo, na roleta europeia é de cerca de 2,7%.")]),
}

LANG_ARTS = {"en": ["kak-poluchit-bonus", "chto-takoe-vejdzher", "kak-rabotayut-sloty", "kak-vyvesti-dengi", "otvetstvennaya-igra"],
             "es": ["kak-poluchit-bonus", "chto-takoe-vejdzher", "frispiny", "kak-rabotayut-sloty", "kriptokazino", "kak-vyvesti-dengi", "slovar-kazino", "otvetstvennaya-igra"],
             "pt": ["kak-poluchit-bonus", "chto-takoe-vejdzher", "frispiny", "kak-rabotayut-sloty", "kriptokazino", "kak-vyvesti-dengi", "slovar-kazino", "otvetstvennaya-igra"]}

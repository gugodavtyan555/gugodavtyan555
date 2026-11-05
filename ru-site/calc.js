// Калькулятор вейджера (wagering calculator). Used on kalkulyator.html (ru/es/pt) and widget/wager.html.
(function () {
  var root = document.querySelector("[data-wager-calc]");
  if (!root) return;
  var params = new URLSearchParams(location.search);
  var lang = params.get("lang") || root.getAttribute("data-lang") || document.documentElement.lang || "ru";
  var T = {
    ru: { cur: "₽", locale: "ru-RU",
      ok: "В среднем бонус выгоден: ожидаемый результат отыгрыша +{v}.",
      bad: "В среднем отыгрыш обойдётся дороже бонуса: ожидаемый результат {v}.",
      zero: "Заполните поля, чтобы увидеть расчёт.",
      spins: "{n} спинов по {s}" },
    es: { cur: "$", locale: "es-MX",
      ok: "En promedio el bono conviene: resultado esperado del requisito +{v}.",
      bad: "En promedio cumplir el requisito cuesta más que el bono: resultado esperado {v}.",
      zero: "Rellena los campos para ver el cálculo.",
      spins: "{n} giros de {s}" },
    pt: { cur: "R$", locale: "pt-BR",
      ok: "Em média o bônus compensa: resultado esperado do rollover +{v}.",
      bad: "Em média cumprir o rollover custa mais que o bônus: resultado esperado {v}.",
      zero: "Preencha os campos para ver o cálculo.",
      spins: "{n} giros de {s}" }
  }[lang] || null;
  if (!T) return;
  var $ = function (n) { return root.querySelector('[name="' + n + '"]'); };
  var out = function (n) { return root.querySelector('[data-out="' + n + '"]'); };
  var money = function (x) {
    var v = Math.round(x);
    return (v < 0 ? "−" : "") + Math.abs(v).toLocaleString(T.locale) + " " + T.cur;
  };
  function num(n) { var v = parseFloat(String($(n).value).replace(",", ".")); return isFinite(v) && v >= 0 ? v : 0; }
  function calc() {
    var bonus = num("bonus"), dep = num("deposit"), wager = num("wager"), rtp = num("rtp"), bet = num("bet"), contrib = num("contrib");
    var base = $("base").value === "both" ? bonus + dep : bonus;
    var verdict = out("verdict");
    if (!bonus || !wager || !rtp || !contrib) {
      ["turnover", "spins", "loss", "ev"].forEach(function (k) { out(k).textContent = "—"; });
      verdict.textContent = T.zero; verdict.className = "calc-verdict"; return;
    }
    var turnover = base * wager / (Math.min(contrib, 100) / 100);
    var loss = turnover * (1 - Math.min(rtp, 100) / 100);
    var ev = bonus - loss;
    out("turnover").textContent = money(turnover);
    out("spins").textContent = bet ? T.spins.replace("{n}", Math.ceil(turnover / bet).toLocaleString(T.locale)).replace("{s}", money(bet)) : "—";
    out("loss").textContent = money(loss);
    out("ev").textContent = (ev >= 0 ? "+" : "") + money(ev);
    verdict.textContent = (ev >= 0 ? T.ok : T.bad).replace("{v}", (ev >= 0 ? "" : "") + money(ev));
    verdict.className = "calc-verdict " + (ev >= 0 ? "good" : "badv");
  }
  root.addEventListener("input", calc);
  root.addEventListener("change", calc);
  calc();
  var copy = document.querySelector("[data-copy-embed]");
  if (copy) copy.addEventListener("click", function () {
    var ta = document.getElementById("embed-code");
    var done = function () { copy.textContent = copy.getAttribute("data-done"); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ta.value).then(done, function () { ta.select(); });
    } else { ta.select(); }
  });
})();

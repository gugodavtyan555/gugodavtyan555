// Калькулятор банкролла: Monte Carlo simulation of slot sessions. Used on kalkulyator-bankrolla.html (ru/es/pt) and widget/bankroll.html.
(function () {
  var root = document.querySelector("[data-bank-calc]");
  if (!root) return;
  var lang = new URLSearchParams(location.search).get("lang") || root.getAttribute("data-lang") || "ru";
  var T = {
    ru: { cur: "₽", locale: "ru-RU", zero: "Заполните поля, чтобы увидеть расчёт.", spins: "{n} спинов",
      summary: "Из {s} смоделированных сессий по {n} спинов: в плюсе закончили {p}, весь банкролл проиграли {b}. В среднем за такую сессию теряется около {l}." },
    es: { cur: "$", locale: "es-MX", zero: "Rellena los campos para ver el cálculo.", spins: "{n} giros",
      summary: "De {s} sesiones simuladas de {n} giros: terminaron con ganancia {p} y perdieron todo el saldo {b}. En promedio, una sesión así cuesta unos {l}." },
    pt: { cur: "R$", locale: "pt-BR", zero: "Preencha os campos para ver o cálculo.", spins: "{n} giros",
      summary: "De {s} sessões simuladas de {n} giros: terminaram no lucro {p} e perderam toda a banca {b}. Em média, uma sessão assim custa cerca de {l}." }
  }[lang];
  if (!T) return;
  // Simplified payout tables (multiplier of the bet, probability). Multipliers are rescaled so the average return equals the chosen RTP.
  var TABLES = {
    low:  [[0.5, .2], [1, .2], [2, .12], [5, .05], [20, .008], [50, .001]],
    mid:  [[0.5, .12], [1, .1], [2, .08], [5, .04], [20, .01], [100, .0015], [500, .0002]],
    high: [[1, .1], [2, .06], [5, .03], [20, .008], [100, .0015], [1000, .0002], [5000, .00002]]
  };
  var SESSIONS = 2000, MAX_SPINS = 5000;
  var $ = function (n) { return root.querySelector('[name="' + n + '"]'); };
  var out = function (n) { return root.querySelector('[data-out="' + n + '"]'); };
  var money = function (x) { var v = Math.round(x); return (v < 0 ? "−" : "") + Math.abs(v).toLocaleString(T.locale) + " " + T.cur; };
  var pct = function (x) { return (Math.round(x * 1000) / 10).toLocaleString(T.locale) + "%"; };
  function num(n) { var v = parseFloat(String($(n).value).replace(",", ".")); return isFinite(v) && v >= 0 ? v : 0; }
  function table(vol, rtp) {
    var t = TABLES[vol] || TABLES.mid, ev = 0;
    t.forEach(function (r) { ev += r[0] * r[1]; });
    var k = rtp / ev, acc = 0;
    return t.map(function (r) { acc += r[1]; return [r[0] * k, acc]; });
  }
  function spin(tb) {
    var u = Math.random();
    for (var i = 0; i < tb.length; i++) if (u < tb[i][1]) return tb[i][0];
    return 0;
  }
  function run() {
    var bank = num("bank"), bet = num("bet"), rtp = Math.min(num("rtp"), 100) / 100, n = Math.min(Math.floor(num("spins")), MAX_SPINS);
    var vol = $("vol").value;
    if (!bank || !bet || !rtp || !n || bet > bank) {
      ["loss", "profit", "bust", "median"].forEach(function (k) { out(k).textContent = "—"; });
      out("summary").textContent = T.zero; out("chart").innerHTML = ""; return;
    }
    var tb = table(vol, rtp), finals = [], profit = 0, bust = 0, paths = [];
    for (var s = 0; s < SESSIONS; s++) {
      var b = bank, path = s < 5 ? [b] : null, step = Math.max(1, Math.ceil(n / 120));
      for (var i = 1; i <= n; i++) {
        if (b < bet) break;
        b += bet * (spin(tb) - 1);
        if (path && i % step === 0) path.push(b);
      }
      if (path) { path.push(b); paths.push(path); }
      finals.push(b);
      if (b > bank) profit++;
      if (b < bet) bust++;
    }
    finals.sort(function (a, c) { return a - c; });
    var loss = n * bet * (1 - rtp);
    out("loss").textContent = money(loss);
    out("profit").textContent = pct(profit / SESSIONS);
    out("bust").textContent = pct(bust / SESSIONS);
    out("median").textContent = money(finals[Math.floor(SESSIONS / 2)]);
    out("summary").textContent = T.summary.replace("{s}", SESSIONS.toLocaleString(T.locale)).replace("{n}", n.toLocaleString(T.locale))
      .replace("{p}", pct(profit / SESSIONS)).replace("{b}", pct(bust / SESSIONS)).replace("{l}", money(loss));
    draw(paths, bank);
  }
  function draw(paths, bank) {
    var W = 600, H = 220, max = bank * 1.5;
    paths.forEach(function (p) { p.forEach(function (v) { if (v > max) max = v; }); });
    var len = 0; paths.forEach(function (p) { if (p.length > len) len = p.length; });
    var x = function (i) { return (i / Math.max(1, len - 1)) * W; };
    var y = function (v) { return H - (v / max) * (H - 10) - 5; };
    var colors = ["#ffc940", "#7dd3fc", "#c4b5fd", "#86efac", "#fda4af"];
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-hidden="true">' +
      '<line x1="0" x2="' + W + '" y1="' + y(bank) + '" y2="' + y(bank) + '" stroke="#b3abd6" stroke-dasharray="4 4" stroke-width="1"/>';
    paths.forEach(function (p, k) {
      svg += '<polyline fill="none" stroke-width="2" vector-effect="non-scaling-stroke" stroke="' + colors[k] + '" points="' +
        p.map(function (v, i) { return x(i).toFixed(1) + "," + y(Math.max(0, v)).toFixed(1); }).join(" ") + '"/>';
    });
    out("chart").innerHTML = svg + "</svg>";
  }
  var timer;
  root.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(run, 250); });
  root.addEventListener("change", function () { clearTimeout(timer); timer = setTimeout(run, 50); });
  var again = root.querySelector("[data-run]");
  if (again) again.addEventListener("click", run);
  run();
  var copy = document.querySelector("[data-copy-embed]");
  if (copy) copy.addEventListener("click", function () {
    var ta = document.getElementById("embed-code");
    var done = function () { copy.textContent = copy.getAttribute("data-done"); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(done, function () { ta.select(); });
    else ta.select();
  });
})();

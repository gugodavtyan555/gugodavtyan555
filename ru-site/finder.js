// "Which casino suits me" filter on kazino.html (ru/en/es/pt). Data = only the verified facts shown on the cards
// (countries, account currencies). Countries are listed only where the partner terms name them unambiguously.
(function () {
  var box = document.getElementById("finder");
  if (!box) return;
  var lang = box.getAttribute("data-lang") || "ru";
  var CIS = ["ru", "kz", "by", "am", "az", "uz", "kg", "tj"];
  var EXTRA = ["ie", "ca", "gr", "nz", "sk", "si"];
  var LATAM_EU = ["br", "mx", "ar", "cl", "pe", "pl"];
  var DATA = {
    jozz:        { countries: CIS.concat(EXTRA), cur: ["RUB", "USD", "EUR", "KZT", "CRYPTO"] },
    playfortuna: { countries: CIS.concat(EXTRA, LATAM_EU), cur: ["RUB", "EUR", "USD", "KZT", "PLN", "CAD", "BRL", "NZD", "CLP", "MXN", "ARS"] },
    booi:        { countries: CIS.concat(EXTRA, LATAM_EU), cur: ["RUB", "EUR", "USD", "KZT", "PLN", "CAD", "BRL", "NZD", "CLP", "ARS", "MXN", "CRYPTO"] },
    winity:      { countries: ["ru", "br", "tr"], cur: ["RUB", "EUR", "USD", "KZT", "TRY", "BRL"] },
    spincrypto:  { countries: "*", cur: ["CRYPTO"] }
  };
  var C = {
    ru: { ru: "Россия", kz: "Казахстан", by: "Беларусь", am: "Армения", az: "Азербайджан", uz: "Узбекистан", kg: "Кыргызстан", tj: "Таджикистан", br: "Бразилия", mx: "Мексика", ar: "Аргентина", cl: "Чили", pe: "Перу", ca: "Канада", pl: "Польша", gr: "Греция", ie: "Ирландия", nz: "Новая Зеландия", sk: "Словакия", si: "Словения", tr: "Турция" },
    en: { ru: "Russia", kz: "Kazakhstan", by: "Belarus", am: "Armenia", az: "Azerbaijan", uz: "Uzbekistan", kg: "Kyrgyzstan", tj: "Tajikistan", br: "Brazil", mx: "Mexico", ar: "Argentina", cl: "Chile", pe: "Peru", ca: "Canada", pl: "Poland", gr: "Greece", ie: "Ireland", nz: "New Zealand", sk: "Slovakia", si: "Slovenia", tr: "Turkey" },
    es: { ru: "Rusia", kz: "Kazajistán", by: "Bielorrusia", am: "Armenia", az: "Azerbaiyán", uz: "Uzbekistán", kg: "Kirguistán", tj: "Tayikistán", br: "Brasil", mx: "México", ar: "Argentina", cl: "Chile", pe: "Perú", ca: "Canadá", pl: "Polonia", gr: "Grecia", ie: "Irlanda", nz: "Nueva Zelanda", sk: "Eslovaquia", si: "Eslovenia", tr: "Turquía" },
    pt: { ru: "Rússia", kz: "Cazaquistão", by: "Belarus", am: "Armênia", az: "Azerbaijão", uz: "Uzbequistão", kg: "Quirguistão", tj: "Tajiquistão", br: "Brasil", mx: "México", ar: "Argentina", cl: "Chile", pe: "Peru", ca: "Canadá", pl: "Polônia", gr: "Grécia", ie: "Irlanda", nz: "Nova Zelândia", sk: "Eslováquia", si: "Eslovênia", tr: "Turquia" }
  }[lang];
  var T = {
    ru: { h: "Подобрать казино за 10 секунд", country: "Ваша страна", cur: "Валюта счёта", any: "любая", other: "другая страна", crypto: "криптовалюта",
      found: "Подходит: {n} из {t}", none: "По этим условиям ни одно казино из списка не подходит. Попробуйте другую валюту.", reset: "Сбросить",
      note: "Подбор по данным партнёрских программ. SpinCrypto принимает игроков из большинства стран, кроме запрещённых — проверьте список на сайте казино. Перед регистрацией убедитесь, что онлайн-казино разрешены в вашей стране. 18+" },
    en: { h: "Find a casino in 10 seconds", country: "Your country", cur: "Account currency", any: "any", other: "another country", crypto: "cryptocurrency",
      found: "Matches: {n} of {t}", none: "No casino on this list matches these settings. Try another currency.", reset: "Reset",
      note: "Based on the affiliate programmes' terms. SpinCrypto accepts players from most countries except restricted ones — check the list on the casino site. Before signing up, make sure online casinos are legal where you live. 18+" },
    es: { h: "Encuentra un casino en 10 segundos", country: "Tu país", cur: "Moneda de la cuenta", any: "cualquiera", other: "otro país", crypto: "criptomoneda",
      found: "Coinciden: {n} de {t}", none: "Ningún casino de la lista coincide con estos datos. Prueba otra moneda.", reset: "Restablecer",
      note: "Según las condiciones de los programas de afiliados. SpinCrypto acepta jugadores de la mayoría de los países excepto los restringidos: revisa la lista en la web del casino. Antes de registrarte, verifica que los casinos online sean legales donde vives. 18+" },
    pt: { h: "Encontre um cassino em 10 segundos", country: "Seu país", cur: "Moeda da conta", any: "qualquer", other: "outro país", crypto: "criptomoeda",
      found: "Combinam: {n} de {t}", none: "Nenhum cassino da lista combina com esses dados. Tente outra moeda.", reset: "Limpar",
      note: "Com base nas condições dos programas de afiliados. A SpinCrypto aceita jogadores da maioria dos países, exceto os restritos: confira a lista no site do cassino. Antes de se cadastrar, verifique se cassinos online são permitidos onde você mora. 18+" }
  }[lang];
  if (!C || !T) return;
  var cards = [].slice.call(document.querySelectorAll("a.casino-ref[data-casino]")).map(function (a) {
    return { id: a.getAttribute("data-casino"), el: a.closest(".casino") };
  }).filter(function (c) { return DATA[c.id] && c.el; });
  if (!cards.length) return;
  // only offer options that at least one casino on this page has
  var cset = {}, curset = {};
  cards.forEach(function (c) {
    var d = DATA[c.id];
    if (d.countries !== "*") d.countries.forEach(function (k) { cset[k] = 1; });
    d.cur.forEach(function (k) { curset[k] = 1; });
  });
  var countries = Object.keys(cset).sort(function (a, b) { return C[a].localeCompare(C[b]); });
  var curOrder = ["RUB", "KZT", "USD", "EUR", "BRL", "MXN", "ARS", "CLP", "PLN", "CAD", "NZD", "TRY", "CRYPTO"];
  var curs = curOrder.filter(function (k) { return curset[k]; });
  var opt = function (v, t) { return '<option value="' + v + '">' + t + "</option>"; };
  box.innerHTML = '<h2>' + T.h + '</h2><div class="calc-grid">' +
    '<label>' + T.country + '<select name="country">' + opt("", T.any) + countries.map(function (k) { return opt(k, C[k]); }).join("") + opt("other", T.other) + "</select></label>" +
    '<label>' + T.cur + '<select name="cur">' + opt("", T.any) + curs.map(function (k) { return opt(k, k === "CRYPTO" ? T.crypto : k); }).join("") + "</select></label>" +
    '</div><p class="finder-res" aria-live="polite"></p><button type="button" class="btn small finder-reset" hidden>' + T.reset + '</button><p class="note">' + T.note + "</p>";
  var sc = box.querySelector('[name="country"]'), su = box.querySelector('[name="cur"]'), res = box.querySelector(".finder-res"), rb = box.querySelector(".finder-reset");
  var used = false;
  function apply() {
    var co = sc.value, cu = su.value, n = 0;
    cards.forEach(function (c) {
      var d = DATA[c.id];
      var okC = !co || d.countries === "*" || (co !== "other" && d.countries.indexOf(co) >= 0);
      var okU = !cu || d.cur.indexOf(cu) >= 0;
      var ok = okC && okU;
      c.el.hidden = !ok; if (ok) n++;
    });
    var active = co || cu;
    res.textContent = !active ? "" : (n ? T.found.replace("{n}", n).replace("{t}", cards.length) : T.none);
    rb.hidden = !active;
    if (active && !used && typeof window.goal === "function") { used = true; try { window.goal("finder_use"); } catch (e) {} }
  }
  sc.addEventListener("change", apply); su.addEventListener("change", apply);
  rb.addEventListener("click", function () { sc.value = ""; su.value = ""; apply(); });
})();

// ================================================
//  ВАША РЕФЕРАЛЬНАЯ ССЫЛКА — меняется только здесь
// ================================================
const REFERRAL_LINK = "https://jozz-promo1.com/alt/jozz/registration?b9dab0004f88cec80c2544d65b8c71ad";
const METRIKA_ID = 114096229;

// Партнёрские ссылки для страницы сравнения (kazino.html)
const CASINO_LINKS = {
  jozz: REFERRAL_LINK,
  playfortuna: "https://fortuna-promo1.com/alt/playfortuna/registration?3f8ed9bbea3359cd978fd69d234c9bf0",
  booi: "https://booi-promo.com/alt/booi/sign-up?f8729271ae45ec45d6eb84a67f64af27",
  winity: "https://winity.one/alt/winity/sign-up?08219d77a748266687fdd0015d6001c6",
  spincrypto: "https://spincrypto-redirect.com/ru/registration/?b22ef87c356509c5b863b1c20f804df1",
};

function goal(name, params) {
  try { if (typeof ym === "function") ym(METRIKA_ID, "reachGoal", name, params); } catch (e) {}
}

// Кнопки «Получить бонус» / «Регистрация» ведут на страницу сравнения казино (kazino.html)
document.querySelectorAll("a.ref").forEach(a => {
  a.addEventListener("click", () => goal("compare_click"));
});
document.querySelectorAll("a.casino-ref").forEach(a => {
  const id = a.dataset.casino;
  if (!CASINO_LINKS[id]) return;
  a.href = CASINO_LINKS[id];
  a.target = "_blank";
  a.rel = "sponsored noopener";
  a.addEventListener("click", () => goal("register_click", { casino: id }));
});
document.querySelectorAll('a[href^="https://t.me/luckyspinclub_ru"]').forEach(a => {
  a.addEventListener("click", () => goal("telegram_click"));
});
document.querySelectorAll(".year").forEach(el => el.textContent = new Date().getFullYear());

// Согласие на cookie (Яндекс Метрика включается только после «Принять»)
var LSC_CONSENT = null;
try { LSC_CONSENT = localStorage.getItem("lsc_consent"); } catch (e) {}
(function () {
  var lang = document.documentElement.lang || "ru";
  var T = {
    ru: ["Мы используем cookie Яндекс Метрики, чтобы понимать, какие статьи полезны. Без вашего согласия статистика не собирается.", "Принять", "Отклонить", "Подробнее"],
    en: ["We use Yandex Metrica cookies to understand which articles are useful. No statistics are collected without your consent.", "Accept", "Decline", "Details"],
    es: ["Usamos cookies de Yandex Metrica para saber qué artículos son útiles. Sin tu consentimiento no se recopilan estadísticas.", "Aceptar", "Rechazar", "Más información"],
    pt: ["Usamos cookies do Yandex Metrica para entender quais artigos são úteis. Sem o seu consentimento, nenhuma estatística é coletada.", "Aceitar", "Recusar", "Saiba mais"]
  }[lang] || null;
  var root = (document.currentScript && document.currentScript.src) ? document.currentScript.src.replace(/config\.js.*$/, "") : "/";
  document.querySelectorAll("a.cookie-reset").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      try { localStorage.removeItem("lsc_consent"); } catch (err) {}
      location.reload();
    });
  });
  if (LSC_CONSENT || !T) return;
  var bar = document.createElement("div");
  bar.className = "lang-bar cookie-bar";
  bar.innerHTML = '<span></span><a class="more"></a><button type="button" class="btn ok"></button><button type="button" class="no"></button>';
  bar.querySelector("span").textContent = T[0];
  var more = bar.querySelector("a.more");
  more.textContent = T[3];
  more.href = root + (lang === "ru" ? "" : lang + "/") + "privacy.html";
  bar.querySelector(".ok").textContent = T[1];
  bar.querySelector(".no").textContent = T[2];
  function choose(v) {
    LSC_CONSENT = v;
    try { localStorage.setItem("lsc_consent", v); } catch (e) {}
    bar.remove();
    if (v === "yes" && window.lscLoadMetrika) window.lscLoadMetrika();
  }
  bar.querySelector(".ok").addEventListener("click", function () { choose("yes"); });
  bar.querySelector(".no").addEventListener("click", function () { choose("no"); });
  document.body.appendChild(bar);
})();

// Предложить версию сайта на языке браузера (без автоматического перехода)
(function () {
  try {
    if (document.documentElement.lang !== "ru") return;
    if (!LSC_CONSENT) return; // сначала выбор по cookie, чтобы панели не перекрывались
    if (localStorage.getItem("langBarClosed")) return;
  } catch (e) {}
  var texts = {
    en: ["This site is available in English", "Open in English"],
    es: ["Este sitio está disponible en español", "Abrir en español"],
    pt: ["Este site está disponível em português", "Abrir em português"]
  };
  var langs = navigator.languages || [navigator.language || ""];
  var pick = null;
  for (var i = 0; i < langs.length; i++) {
    var l = (langs[i] || "").slice(0, 2).toLowerCase();
    if (l === "ru") return;
    if (texts[l]) { pick = l; break; }
  }
  if (!pick) return;
  var link = document.querySelector('.langs a[hreflang="' + pick + '"]');
  if (!link) return;
  var bar = document.createElement("div");
  bar.className = "lang-bar";
  bar.innerHTML = '<span></span><a class="btn"></a><button type="button" aria-label="Close">✕</button>';
  bar.querySelector("span").textContent = texts[pick][0];
  var a = bar.querySelector("a"); a.href = link.href; a.textContent = texts[pick][1];
  bar.querySelector("button").addEventListener("click", function () {
    bar.remove();
    try { localStorage.setItem("langBarClosed", "1"); } catch (e) {}
  });
  document.body.appendChild(bar);
})();

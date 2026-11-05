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

document.querySelectorAll("a.ref").forEach(a => {
  a.href = REFERRAL_LINK;
  a.target = "_blank";
  a.rel = "sponsored noopener";
  a.addEventListener("click", () => goal("register_click", { casino: "jozz" }));
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

// Предложить версию сайта на языке браузера (без автоматического перехода)
(function () {
  try {
    if (document.documentElement.lang !== "ru") return;
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

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

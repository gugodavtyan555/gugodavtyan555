// ================================================
//  ВАША РЕФЕРАЛЬНАЯ ССЫЛКА — меняется только здесь
// ================================================
const REFERRAL_LINK = "https://jozz-promo1.com/alt/jozz/registration?b9dab0004f88cec80c2544d65b8c71ad";
const METRIKA_ID = 114096229;

function goal(name) {
  try { if (typeof ym === "function") ym(METRIKA_ID, "reachGoal", name); } catch (e) {}
}

document.querySelectorAll("a.ref").forEach(a => {
  a.href = REFERRAL_LINK;
  a.target = "_blank";
  a.rel = "sponsored noopener";
  a.addEventListener("click", () => goal("register_click"));
});
document.querySelectorAll('a[href^="https://t.me/luckyspinclub_ru"]').forEach(a => {
  a.addEventListener("click", () => goal("telegram_click"));
});
document.querySelectorAll(".year").forEach(el => el.textContent = new Date().getFullYear());

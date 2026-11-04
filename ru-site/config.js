// ================================================
//  ВАША РЕФЕРАЛЬНАЯ ССЫЛКА — меняется только здесь
// ================================================
const REFERRAL_LINK = "https://jozz-promo1.com/alt/jozz/registration?b9dab0004f88cec80c2544d65b8c71ad";

document.querySelectorAll("a.ref").forEach(a => {
  a.href = REFERRAL_LINK;
  a.target = "_blank";
  a.rel = "sponsored noopener";
});
document.querySelectorAll(".year").forEach(el => el.textContent = new Date().getFullYear());

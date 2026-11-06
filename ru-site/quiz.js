// Myth-or-fact quiz (viktorina.html) and the self-check (samoproverka.html). Answers never leave the browser.
(function () {
  var q = document.querySelector("[data-quiz]");
  if (q) {
    var items = [].slice.call(q.querySelectorAll(".qz-item"));
    var res = q.querySelector(".qz-result"), score = 0, done = 0;
    items.forEach(function (it) {
      it.querySelectorAll("button[data-a]").forEach(function (b) {
        b.addEventListener("click", function () {
          if (it.classList.contains("answered")) return;
          it.classList.add("answered");
          var ok = b.getAttribute("data-a") === it.getAttribute("data-correct");
          if (ok) score++;
          done++;
          b.classList.add(ok ? "right" : "wrong");
          it.querySelector(".qz-expl").hidden = false;
          it.querySelector(".qz-verdict").textContent = ok ? q.getAttribute("data-right") : q.getAttribute("data-wrong");
          if (done === items.length) finish();
        });
      });
    });
    function finish() {
      var lvl = score >= 8 ? "hi" : score >= 5 ? "mid" : "lo";
      res.querySelector(".qz-score").textContent = score + " / " + items.length;
      res.querySelector(".qz-text").textContent = res.getAttribute("data-" + lvl);
      var text = q.getAttribute("data-share").replace("{s}", score).replace("{n}", items.length);
      var url = location.href.split("#")[0];
      res.querySelector(".qz-tg").href = "https://t.me/share/url?url=" + encodeURIComponent(url) + "&text=" + encodeURIComponent(text);
      res.querySelector(".qz-wa").href = "https://wa.me/?text=" + encodeURIComponent(text + " " + url);
      res.hidden = false;
      res.scrollIntoView({ behavior: "smooth", block: "center" });
      if (typeof window.goal === "function") { try { window.goal("quiz_done", { score: score }); } catch (e) {} }
    }
    var again = q.querySelector(".qz-again");
    if (again) again.addEventListener("click", function () { location.reload(); });
    var cp = q.querySelector(".qz-copy");
    if (cp) cp.addEventListener("click", function () {
      var url = location.href.split("#")[0];
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { cp.textContent = cp.getAttribute("data-done"); });
    });
  }
  var t = document.querySelector("[data-selftest]");
  if (t) {
    var btn = t.querySelector(".st-go"), out = t.querySelector(".st-result");
    btn.addEventListener("click", function () {
      var qs = [].slice.call(t.querySelectorAll(".st-q"));
      var answered = qs.filter(function (x) { return x.querySelector("input:checked"); }).length;
      if (answered < qs.length) { out.hidden = false; out.className = "st-result"; out.innerHTML = "<p>" + t.getAttribute("data-incomplete") + "</p>"; return; }
      var yes = qs.filter(function (x) { var c = x.querySelector("input:checked"); return c && c.value === "1"; }).length;
      var lvl = yes === 0 ? "0" : yes <= 2 ? "1" : "3";
      out.hidden = false;
      out.className = "st-result st-" + lvl;
      out.innerHTML = t.querySelector('template[data-level="' + lvl + '"]').innerHTML;
      out.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
})();

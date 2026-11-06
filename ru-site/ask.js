// "Ask a question": searches the site's own FAQ answers and glossary (ask/<lang>.json). No AI, nothing leaves the browser.
(function () {
  var box = document.querySelector("[data-ask]");
  if (!box) return;
  var lang = box.getAttribute("data-lang"), root = box.getAttribute("data-root") || "";
  var form = box.querySelector("form"), input = box.querySelector("input"), out = box.querySelector(".ask-res");
  var STOP = {
    ru: "как что это где когда почему зачем ли и в во на с со по к ко от до из у о об для при не ни а но или то же бы мне меня мой я ты вы мы можно нужно надо есть ли такое такой какой какие казино",
    en: "how what is are the a an to of in on for with do does can i my me you it why when where which casino",
    es: "como cómo que qué es son el la los las un una de del en con para por se mi me yo tu puedo hay cuál cual casino",
    pt: "como que o a os as um uma de do da dos das em no na com para por se meu me eu você posso tem qual é são cassino"
  }[lang] || "";
  var stop = {}; STOP.split(" ").forEach(function (w) { stop[w] = 1; });
  // synonyms -> the stem the site's own texts use
  var SYN = {
    ru: { wager: "вейдж", вэйдж: "вейдж", отыгр: "вейдж", кешбэ: "кэшбэ", кешбе: "кэшбэ", снять: "вывод", kyc: "верис", блекд: "блэкд", rtp: "rtp" },
    en: { rollo: "wager", playt: "wager", cashi: "withd", payou: "withd" },
    es: { rollo: "requi", wager: "requi", retir: "retir", sacar: "retir", tirad: "giros", spins: "giros" },
    pt: { wager: "rollo", requi: "rollo", retir: "sacar", saque: "sacar", rodad: "giros", spins: "giros" }
  }[lang] || {};
  function norm(s) { return s.toLowerCase().replace(/ё/g, "е").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zа-я0-9]+/g, " ").trim(); }
  function stems(s) {
    return norm(s).split(" ").filter(function (w) { return w.length > 1 && !stop[w]; })
      .map(function (w) { return w.length > 5 ? w.slice(0, 5) : w; });
  }
  function qstems(s) { var out = []; stems(s).forEach(function (w) { out.push(w); if (SYN[w] && SYN[w] !== w) out.push(SYN[w]); }); return out; }
  var data = null, loading = null;
  function load() {
    if (data) return Promise.resolve(data);
    if (!loading) loading = fetch(root + "ask/" + lang + ".json").then(function (r) { return r.json(); }).then(function (d) {
      data = d.map(function (e) { return { e: e, q: stems(e.q), t: stems(e.t || ""), a: stems(e.a) }; }); return data;
    });
    return loading;
  }
  function score(qs, it) {
    var s = 0;
    qs.forEach(function (w) {
      if (it.q.indexOf(w) >= 0) s += 3;
      else if (it.t.indexOf(w) >= 0) s += 2;
      else if (it.a.indexOf(w) >= 0) s += 1;
    });
    if (it.e.g && it.q.length && it.q.every(function (w) { return qs.indexOf(w) >= 0; }) && qs.length <= it.q.length + 1) s += 3;
    return s;
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  function search(q) {
    var qs = qstems(q);
    if (!qs.length) { out.innerHTML = ""; return; }
    load().then(function (d) {
      var seen = {}, res = d.map(function (it) { return { it: it, s: score(qs, it) }; })
        .filter(function (r) { return r.s >= Math.min(3, qs.length * 2); })
        .sort(function (a, b) { return b.s - a.s; })
        .filter(function (r, i, arr) { return r.s >= arr[0].s * 0.6; })
        .filter(function (r) { var k = r.it.e.u; if (seen[k]) return false; seen[k] = 1; return true; }).slice(0, 3);
      if (!res.length) {
        out.innerHTML = '<p class="ask-none">' + esc(box.getAttribute("data-none")) + ' <a href="' + root + (lang === "ru" ? "" : lang + "/") + 'stati.html">' + esc(box.getAttribute("data-all")) + "</a>.</p>";
        return;
      }
      out.innerHTML = res.map(function (r) {
        var e = r.it.e, a = e.a.length > 260 ? e.a.slice(0, 257).replace(/\s+\S*$/, "") + "…" : e.a;
        return '<div class="ask-item"><b>' + esc(e.q) + "</b><p>" + esc(a) + '</p><a href="' + root + esc(e.u) + '">' + esc(e.t || "") + " " + esc(box.getAttribute("data-more")) + "</a></div>";
      }).join("");
      if (typeof window.goal === "function") { try { window.goal("ask_use"); } catch (e) {} }
    }).catch(function () { out.innerHTML = ""; });
  }
  form.addEventListener("submit", function (ev) { ev.preventDefault(); search(input.value); });
  var t; input.addEventListener("input", function () { clearTimeout(t); t = setTimeout(function () { if (input.value.trim().length >= 3) search(input.value); else out.innerHTML = ""; }, 350); });
  input.addEventListener("focus", load, { once: true });
})();

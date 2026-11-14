// ==UserScript==
// @name         PO WS logger
// @match        https://*.pocketoption.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==
(function () {
  const log = [];
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;top:60px;left:4px;z-index:99999;background:#000c;color:#0f0;font:11px monospace;padding:4px;max-width:70vw';
  box.textContent = 'WS: 0';
  const btn = document.createElement('button');
  btn.textContent = 'Copy';
  btn.onclick = () => navigator.clipboard.writeText(log.slice(-40).join('\n'));
  box.appendChild(btn);
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(box));
  const Orig = window.WebSocket;
  window.WebSocket = function (...a) {
    const ws = new Orig(...a);
    ws.addEventListener('message', async (e) => {
      let d = e.data;
      if (d instanceof Blob) d = await d.text();
      else if (d instanceof ArrayBuffer) d = new TextDecoder().decode(d);
      log.push(String(d).slice(0, 400));
      box.firstChild.textContent = 'WS: ' + log.length + ' ';
    });
    return ws;
  };
  window.WebSocket.prototype = Orig.prototype;
})();

# Site build tools

Scripts that generate and deploy https://lucky-spin-ru.netlify.app (static site in `../ru-site`).

Build order (always the full chain, see `build.sh`):
1. `gen.py` – Russian pages (exec's `more.py`, `faq.py`, `casino_pages.py`, `casinos.py`, `legal.py`, `calc_pages.py`, `bank_pages.py`, `hub.py`)
2. `i18n.py` – English / Spanish / Portuguese pages (texts in `i18n_text.py`, `i18n_more.py`)
3. `covers.py` (+ `covers.js`) – article cover images and og:image
4. `seo.py` – titles, contextual links, WebP pictures, casino finder, editorial blocks, `_headers`
5. `schema.py` – BreadcrumbList / Article / WebSite JSON-LD

Checks: `t_full.js` (every page), `t_calc.js`, `t_bank.js`, `t_finder.js` – run against `python3 -m http.server 8765` in `ru-site`.
Deploy: `deploy.sh "message"` (zip upload to Netlify; one deploy ≈ 15 of the 300 monthly free credits).

The scripts use absolute scratchpad paths of the session that created them; adjust `S`/`G`/`ROOT` when running elsewhere.
No secrets are stored here: the Netlify token is injected by the network proxy and the Telegram token comes from the environment.

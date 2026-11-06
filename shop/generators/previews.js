// Renders the product cover images (1600x1200) used on the site and the
// checkout pages. The mockups show the same sample data the files contain.
// Usage: node previews.js <planner_png_dir> <out_dir>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [plannerDir = '../dist/png', outDir = '../site/img'] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });

const money = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const css = `
*{box-sizing:border-box;margin:0}
body{width:1600px;height:1200px;font-family:Inter,system-ui,sans-serif;background:#EEF4F0;color:#1F2A37;overflow:hidden;position:relative}
.label{position:absolute;left:90px;top:80px;width:580px}
.brand{font-size:26px;font-weight:600;color:#2F7D5B;letter-spacing:.04em;text-transform:uppercase}
h1{font-size:76px;line-height:1.05;margin-top:22px;font-weight:800;letter-spacing:-.02em}
.sub{font-size:30px;color:#4B5563;margin-top:26px;line-height:1.35}
.chips{display:flex;flex-wrap:wrap;gap:12px;margin-top:36px}
.chip{background:#fff;border:2px solid #CFE3D7;border-radius:999px;padding:10px 20px;font-size:22px;font-weight:600;color:#2F7D5B}
.screen{position:absolute;right:-40px;top:120px;width:880px;height:960px;background:#fff;border-radius:22px;box-shadow:0 40px 80px rgba(31,42,55,.18);overflow:hidden;border:1px solid #D9DEE3}
.bar{height:44px;background:#F3F4F6;border-bottom:1px solid #E5E7EB;display:flex;align-items:center;gap:8px;padding:0 18px}
.bar i{width:13px;height:13px;border-radius:50%;background:#D1D5DB;display:block}
.tabs{display:flex;gap:2px;padding:0 18px;background:#F3F4F6;border-top:1px solid #E5E7EB;position:absolute;bottom:0;left:0;right:0;height:44px;align-items:center;font-size:15px}
.tabs span{padding:8px 16px;color:#6B7280}.tabs span.on{background:#fff;color:#2F7D5B;font-weight:700;border-radius:0 0 6px 6px}
.pad{padding:34px 40px}
.t{font-size:34px;font-weight:800}.ts{font-size:16px;color:#6B7280;margin-top:4px}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:24px}
.kpi{background:#E3F1EA;padding:14px 16px;border-radius:8px}.kpi b{display:block;font-size:13px;color:#6B7280;letter-spacing:.05em}.kpi span{font-size:26px;font-weight:800}
table{border-collapse:collapse;width:100%;margin-top:24px;font-size:16px}
th{background:#2F7D5B;color:#fff;padding:9px 10px;text-align:left;font-weight:600}
td{border:1px solid #E1E5E9;padding:8px 10px}td.n{text-align:right;font-variant-numeric:tabular-nums}
td.in{background:#FFF8E1}
.neg{color:#C0392B;background:#FBE4E1;font-weight:700}
.barcell{position:relative}.barcell div{position:absolute;left:0;top:0;bottom:0;background:#BFE3CF}.barcell span{position:relative}
.chart{display:flex;align-items:flex-end;gap:14px;height:200px;margin-top:26px;padding:0 6px;border-bottom:2px solid #E5E7EB}
.chart div{flex:1;display:flex;gap:4px;align-items:flex-end;height:100%}
.chart u{flex:1;background:#2F7D5B;border-radius:4px 4px 0 0;display:block}.chart s{flex:1;background:#9FD3B8;border-radius:4px 4px 0 0;display:block}
.pdfstack img{position:absolute;width:820px;border-radius:12px;box-shadow:0 30px 60px rgba(31,42,55,.2);border:1px solid #D9DEE3}
.price{position:absolute;left:90px;bottom:90px;font-size:28px;font-weight:700;color:#2F7D5B}
`;

function page(p, inner, chips, sheetTabs) {
  const tabs = sheetTabs ? `<div class="tabs">${sheetTabs.map((t, i) => `<span class="${i === 1 ? 'on' : ''}">${t}</span>`).join('')}</div>` : '';
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
  <div class="label"><div class="brand">Penny &amp; Plan</div><h1>${p.title}</h1><div class="sub">${p.sub}</div>
  <div class="chips">${chips.map((c) => `<span class="chip">${c}</span>`).join('')}</div></div>
  ${inner.startsWith('<div class="pdfstack') ? inner : `<div class="screen"><div class="bar"><i></i><i></i><i></i></div>${inner}${tabs}</div>`}
  </body></html>`;
}

const budgetRows = [
  ['Rent / Mortgage', 1450, 1450], ['Utilities', 220, 96.4], ['Groceries', 520, 394.25], ['Transport', 260, 85],
  ['Insurance', 180, 180], ['Phone & Internet', 90, 0], ['Dining out', 200, 64.5], ['Shopping', 150, 89.99],
  ['Health', 80, 32.1], ['Subscriptions', 45, 15.99], ['Savings transfer', 600, 600], ['Debt payments', 300, 300],
];
const budget = page({ title: 'Monthly Budget Planner', sub: 'Know where every dollar goes. Budget vs. actual updates as you type.' },
  `<div class="pad"><div class="t">January 2027</div><div class="ts">Monthly dashboard</div>
  <div class="kpis"><div class="kpi"><b>INCOME</b><span>$4,650</span></div><div class="kpi"><b>EXPENSES</b><span>$3,308</span></div><div class="kpi"><b>LEFT OVER</b><span>$1,342</span></div><div class="kpi"><b>SAVINGS RATE</b><span>29%</span></div></div>
  <table><tr><th>Category</th><th>Budget</th><th>Actual</th><th>Remaining</th><th>% used</th></tr>
  ${budgetRows.map(([c, b, a]) => { const r = b - a; const pct = Math.round(a / b * 100); return `<tr><td>${c}</td><td class="n">${money(b)}</td><td class="n">${money(a)}</td><td class="n ${r < 0 ? 'neg' : ''}">${r < 0 ? '-' : ''}${money(Math.abs(r))}</td><td class="barcell"><div style="width:${Math.min(pct, 100)}%"></div><span>${pct}%</span></td></tr>`; }).join('')}
  </table></div>`,
  ['Excel', 'Google Sheets', 'Instant download'], ['Start Here', 'Dashboard', 'Annual Summary', 'Setup', 'Transactions']);

const debts = [['Credit card A', 4200, 22.9, 1, 'Feb 2028'], ['Credit card B', 1350, 18.5, 2, 'Apr 2028'], ['Car loan', 9800, 6.9, 3, 'Feb 2029'], ['Student loan', 15400, 5.0, 4, 'May 2030'], ['Medical bill', 620, 0, 5, 'Jan 2028']];
const curve = [31370, 29600, 27700, 25700, 23600, 21400, 19100, 16700, 14200, 11600, 8800, 5900, 2900, 0];
const debt = page({ title: 'Debt Payoff Planner', sub: 'Snowball or avalanche. See the exact month you become debt-free.' },
  `<div class="pad"><div class="t">Your debt-free plan</div><div class="ts">Method: Avalanche · Extra payment $250 / month</div>
  <div class="kpis"><div class="kpi"><b>DEBT-FREE</b><span>May 2030</span></div><div class="kpi"><b>MONTHS</b><span>41</span></div><div class="kpi"><b>INTEREST</b><span>$3,766</span></div><div class="kpi"><b>PER MONTH</b><span>$865</span></div></div>
  <table><tr><th>Debt</th><th>Balance</th><th>APR</th><th>Order</th><th>Paid off</th></tr>
  ${debts.map(([n, b, a, o, d]) => `<tr><td class="in">${n}</td><td class="n in">${money(b)}</td><td class="n in">${a}%</td><td class="n">${o}</td><td>${d}</td></tr>`).join('')}</table>
  <div class="ts" style="margin-top:28px;font-weight:700;color:#1F2A37">Total debt over time</div>
  <div class="chart">${curve.map((v) => `<div><u style="height:${v / 31370 * 100}%"></u></div>`).join('')}</div></div>`,
  ['Snowball', 'Avalanche', 'Excel + Sheets'], ['Start Here', 'Debts', 'Schedule']);

const pl = [[2841, 444], [1635, 441], [1611, 150]];
const biz = page({ title: 'Small Business Income & Expense Tracker', sub: 'Bookkeeping for freelancers and online sellers, with a P&L and tax set-aside.' },
  `<div class="pad"><div class="t">Business Dashboard</div><div class="ts">Your Business LLC · 2027 · year to date</div>
  <div class="kpis"><div class="kpi"><b>INCOME</b><span>$6,087</span></div><div class="kpi"><b>EXPENSES</b><span>$1,035</span></div><div class="kpi"><b>PROFIT</b><span>$5,051</span></div><div class="kpi"><b>TAX SET-ASIDE</b><span>$1,263</span></div></div>
  <div class="ts" style="margin-top:28px;font-weight:700;color:#1F2A37">Income vs. expenses by month</div>
  <div class="chart">${pl.map(([i, e]) => `<div><u style="height:${i / 3000 * 100}%"></u><s style="height:${e / 3000 * 100}%"></s></div>`).join('')}</div>
  <table><tr><th>Category</th><th>Jan</th><th>Feb</th><th>Mar</th><th>Year</th></tr>
  <tr><td>Product sales</td><td class="n">$1,241</td><td class="n">$1,385</td><td class="n">$1,611</td><td class="n">$4,237</td></tr>
  <tr><td>Services</td><td class="n">$1,600</td><td class="n">$0</td><td class="n">$0</td><td class="n">$1,600</td></tr>
  <tr><td>Advertising</td><td class="n">$120</td><td class="n">$0</td><td class="n">$150</td><td class="n">$270</td></tr>
  <tr><td>Contractors</td><td class="n">$0</td><td class="n">$300</td><td class="n">$0</td><td class="n">$300</td></tr>
  <tr><td><b>Net profit</b></td><td class="n"><b>$2,396</b></td><td class="n"><b>$1,194</b></td><td class="n"><b>$1,461</b></td><td class="n"><b>$5,059</b></td></tr></table></div>`,
  ['Profit & Loss', 'Tax set-aside', 'Excel + Sheets'], ['Start Here', 'Dashboard', 'Setup', 'Ledger', 'Profit & Loss']);

const goals = [['Emergency fund', 6000, 1200, '$369'], ['Vacation', 2500, 240, '$283'], ['New laptop', 1400, 400, '$167'], ['House deposit', 25000, 500, '$645'], ['Wedding', 12000, 4800, '$400'], ['New car', 8000, 6500, '$125']];
const sav = page({ title: 'Savings Goals Tracker', sub: 'Watch your goals fill up and know exactly what to save each month.' },
  `<div class="pad"><div class="t">Savings goals</div><div class="ts">Updated automatically from your deposits</div>
  <table><tr><th>Goal</th><th>Target</th><th>Saved</th><th style="width:34%">Progress</th><th>Per month</th></tr>
  ${goals.map(([g, t, s, m]) => `<tr><td class="in">${g}</td><td class="n">${money(t)}</td><td class="n">${money(s)}</td><td class="barcell"><div style="width:${s / t * 100}%"></div><span>${Math.round(s / t * 100)}%</span></td><td class="n">${m}</td></tr>`).join('')}</table>
  <div class="kpis"><div class="kpi"><b>TOTAL SAVED</b><span>$13,640</span></div><div class="kpi"><b>STILL TO SAVE</b><span>$41,260</span></div><div class="kpi"><b>PER MONTH</b><span>$1,989</span></div><div class="kpi"><b>OVERALL</b><span>25%</span></div></div></div>`,
  ['12 goals', 'Progress bars', 'Excel + Sheets'], ['Start Here', 'Goals', 'Deposits']);

const img = (f) => 'data:image/png;base64,' + fs.readFileSync(path.join(plannerDir, f)).toString('base64');
const planner = page({ title: '2027 Hyperlinked Planner', sub: 'Year, month, week and habit pages. Tap the tabs to jump anywhere.' },
  `<div class="pdfstack"><img src="${img('p-05.png')}" style="right:-60px;top:560px;transform:rotate(3deg)"><img src="${img('p-03.png')}" style="right:120px;top:110px;transform:rotate(-2deg)"></div>`,
  ['iPad / GoodNotes', 'US Letter', 'A4', '85 pages']);

const bundle = page({ title: 'The Complete Money Bundle', sub: 'All five products in one download. Save $15.' },
  `<div class="pdfstack"><img src="${img('p-03.png')}" style="right:-40px;top:620px;transform:rotate(4deg);width:700px"></div>
   <div class="screen" style="width:760px;height:540px;top:90px;right:160px"><div class="bar"><i></i><i></i><i></i></div>
   <div class="pad"><div class="t">5 products</div><table>
   ${['Monthly Budget Planner', 'Debt Payoff Planner', 'Small Business Income & Expense Tracker', 'Savings Goals Tracker', '2027 Hyperlinked Planner'].map((n) => `<tr><td>✓ ${n}</td></tr>`).join('')}
   </table><div class="kpis"><div class="kpi" style="grid-column:span 2"><b>BUNDLE PRICE</b><span>$29 <s style="color:#8A94A3;font-size:20px">$44</s></span></div></div></div></div>`,
  ['Excel', 'Google Sheets', 'PDF', 'Instant download']);

(async () => {
  const browser = await chromium.launch();
  const pg = await browser.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 1 });
  const items = { 'budget-planner': budget, 'debt-payoff-planner': debt, 'small-business-tracker': biz, 'savings-goals-tracker': sav, '2027-planner': planner, 'money-bundle': bundle };
  for (const [id, html] of Object.entries(items)) {
    await pg.setContent(html, { waitUntil: 'load' });
    await pg.screenshot({ path: path.join(outDir, `${id}.png`) });
    console.log('wrote', id);
  }
  await browser.close();
})();

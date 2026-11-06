// Renders vertical Pinterest pins (1000x1500 JPEG) and a bulk-upload CSV.
// Usage: node pins.js            (reads ../products.json, writes ../pins/)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'pins');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'products.json'), 'utf8'));
const SITE = data.site_url.replace(/\/$/, '');
// Pins are served from the public GitHub repo; Pinterest copies each image when the pin is created.
const IMG_BASE = 'https://raw.githubusercontent.com/gugodavtyan555/gugodavtyan555/claude/online-shop-sales-scheme-typp8c/shop/pins/';
fs.mkdirSync(OUT, { recursive: true });

// Which product image and board a blog guide's pin uses.
const BLOG_PRODUCT = {
  'debt-snowball-vs-avalanche': 'debt-payoff-planner', '50-30-20-budget-rule': 'budget-planner',
  'track-small-business-income-expenses': 'small-business-tracker', 'how-much-to-save-each-month-for-a-goal': 'savings-goals-tracker',
  'how-to-pay-off-credit-card-debt-fast': 'debt-payoff-planner', 'sinking-funds-explained': 'savings-goals-tracker',
  'how-to-make-a-budget-in-google-sheets': 'budget-planner', 'how-to-set-financial-goals-for-2027': '2027-planner',
};

const BOARDS = {
  'holiday-budget-planner': 'Budget Templates',
  'free-budget-template': 'Budget Templates',
  'budget-planner': 'Budget Templates',
  'debt-payoff-planner': 'Debt Payoff Plan',
  'small-business-tracker': 'Small Business Finance',
  'savings-goals-tracker': 'Saving Money Tips',
  '2027-planner': '2027 Planner',
  'money-bundle': 'Budget Templates',
};

// [product or article id, headline, small line above, description, keywords]
const PINS = [
  ['budget-planner', 'Monthly Budget Spreadsheet That Does the Math for You', 'Excel + Google Sheets', 'Set a budget for every category, log your spending, and watch budget vs. actual update by itself. Includes a dashboard, savings rate and a 12-month summary.', 'budget spreadsheet, monthly budget template, budget planner, google sheets budget'],
  ['budget-planner', 'Stop Wondering Where Your Money Went', 'Budget planner template', 'A simple monthly budget template: type in your transactions and see exactly where every dollar goes, with an over-budget warning for each category.', 'budgeting for beginners, money tracker, expense tracker, budget template'],
  ['budget-planner', 'Budget vs. Actual Tracker', 'Monthly budget dashboard', 'Compare what you planned with what you spent, category by category. Works in Excel, Google Sheets, LibreOffice and Numbers.', 'budget tracker, budget vs actual, household budget, personal finance'],
  ['budget-planner', 'Easy Budget Template for Beginners', 'No formulas to write', 'Ready-made budget spreadsheet with dropdowns, a dashboard and an annual summary. Fill in the yellow cells; everything else is calculated.', 'easy budget, budget for beginners, budget spreadsheet template, money management'],
  ['debt-payoff-planner', 'See Your Exact Debt-Free Date', 'Debt payoff planner', 'Enter your debts, pick Snowball or Avalanche, and see the month you become debt-free, total interest and the payoff month of every debt.', 'debt free, debt payoff plan, debt snowball, debt avalanche'],
  ['debt-payoff-planner', 'Debt Snowball vs. Avalanche Calculator', 'Compare both methods', 'Switch between the snowball and avalanche methods with one click and compare total interest. Freed-up minimum payments roll over automatically.', 'debt snowball calculator, debt avalanche, pay off debt, debt tracker'],
  ['debt-payoff-planner', 'Debt Payoff Tracker Spreadsheet', 'Up to 10 debts', 'Credit cards, car loan, student loans: track up to 10 debts and see a month-by-month payoff schedule. Excel and Google Sheets.', 'debt payoff tracker, debt spreadsheet, credit card debt, student loan payoff'],
  ['debt-payoff-planner', 'Make a Debt-Free Plan in 10 Minutes', 'Snowball or avalanche', 'Type in balances, interest rates and minimum payments. The planner builds your debt-free plan and shows how much an extra payment saves.', 'debt free journey, get out of debt, debt plan, money goals'],
  ['small-business-tracker', 'Small Business Bookkeeping Spreadsheet', 'Income + expenses + P&L', 'Log every sale and expense, get a monthly profit & loss statement and an estimate of what to set aside for taxes. Excel and Google Sheets.', 'small business bookkeeping, bookkeeping spreadsheet, profit and loss template, small business tips'],
  ['small-business-tracker', 'Income & Expense Tracker for Etsy Sellers', 'For freelancers and shops', 'A simple ledger and dashboard for Etsy and Shopify sellers, freelancers and side hustles. See your profit and margin month by month.', 'etsy seller tips, income and expense tracker, side hustle, freelancer finances'],
  ['small-business-tracker', 'Simple Profit & Loss Template', 'Monthly P&L by category', 'Your monthly profit and loss statement, built automatically from your transactions. Handy at tax time.', 'profit and loss statement, P&L template, business finances, small business accounting'],
  ['small-business-tracker', 'Know How Much to Save for Taxes', 'Tax set-aside calculator', 'Set your own rate and the tracker shows how much of your profit to put aside for taxes each month. Plus a full income and expense ledger.', 'self employed taxes, tax savings, small business taxes, freelancer taxes'],
  ['savings-goals-tracker', 'Savings Goals Tracker with Progress Bars', 'Up to 12 goals', 'Set goals with a target and a deadline, log deposits and watch the progress bars fill up. Shows how much to save each month.', 'savings tracker, savings goals, savings challenge, money saving'],
  ['savings-goals-tracker', 'Sinking Funds Tracker Spreadsheet', 'Plan for big expenses', 'Track sinking funds for holidays, car repairs and insurance. Each goal shows saved, remaining and the monthly amount you need.', 'sinking funds, sinking funds tracker, budget savings, money planning'],
  ['savings-goals-tracker', 'How Much to Save Each Month for Every Goal', 'Automatic monthly amount', 'The tracker divides what is left by the months to your deadline, so you always know your monthly savings target.', 'how to save money, savings plan, saving goals, financial goals'],
  ['savings-goals-tracker', 'Emergency Fund Tracker', 'Build your safety net', 'Track your emergency fund and other goals in one place. Progress bars, deadlines and the amount to save each month.', 'emergency fund, emergency savings, save money, financial freedom'],
  ['2027-planner', '2027 Digital Planner for GoodNotes', 'Hyperlinked · 85 pages', 'Tap the tabs to jump from year to month to week. Monthly calendars, weekly pages, habit trackers and notes. Works in any PDF app.', '2027 digital planner, goodnotes planner, ipad planner, digital planner'],
  ['2027-planner', '2027 Printable Planner: Letter & A4', 'Print at home', 'Year at a glance, 12 monthly calendars, 53 weekly pages and habit trackers. Prints on US Letter or A4 paper.', '2027 planner printable, printable planner, weekly planner, monthly planner'],
  ['2027-planner', 'Hyperlinked iPad Planner 2027', 'Year · month · week · habits', 'A clean, minimal hyperlinked planner for iPad. Use it in GoodNotes, Notability or Noteshelf.', 'hyperlinked planner, ipad planner 2027, notability planner, minimalist planner'],
  ['2027-planner', 'Plan Your 2027 Week by Week', 'Weekly + monthly pages', 'Weekly pages with a to-do list, monthly goals and priorities, and a habit tracker for every month.', 'weekly planner, 2027 goals, planner ideas, plan with me'],
  ['money-bundle', '5 Money Templates in 1 Bundle', 'Save $15', 'Budget planner, debt payoff planner, savings tracker, small business tracker and a 2027 planner in one download.', 'personal finance bundle, budget bundle, finance templates, money organization'],
  ['money-bundle', 'Get Your Money Organized for 2027', 'The complete money bundle', 'Everything you need for a calm money year: budget, debt, savings and business spreadsheets plus a 2027 planner.', 'money organization, new year goals, financial planning, budget 2027'],
  ['money-bundle', 'Personal Finance Spreadsheet Bundle', 'Excel + Google Sheets + PDF', 'Four spreadsheets that do the math for you and a hyperlinked 2027 planner. Instant download, no subscription.', 'finance spreadsheet, personal finance, budget spreadsheet, excel templates'],
  ['money-bundle', 'Budget + Debt + Savings in One Download', 'All 5 templates', 'One bundle for your whole money plan. Pay once, keep the files forever.', 'budget planner bundle, debt free, savings plan, money tips'],
  ['blog:debt-snowball-vs-avalanche', 'Debt Snowball vs. Avalanche: Which Is Faster?', 'Worked example', 'A side-by-side example with five debts shows how much the avalanche method saves and why the snowball still works.', 'debt snowball, debt avalanche, pay off debt fast, debt free tips'],
  ['blog:50-30-20-budget-rule', 'The 50/30/20 Budget Rule, Explained', 'Step-by-step guide', 'Split your take-home pay into needs, wants and savings, then turn it into a monthly budget you can actually follow.', '50/30/20 budget, budgeting tips, how to budget, budget for beginners'],
  ['blog:track-small-business-income-expenses', 'How to Track Small Business Expenses', 'A 15-minute weekly routine', 'Categories, a ledger, a monthly profit & loss and a tax set-aside: simple bookkeeping for freelancers and online sellers.', 'small business tips, bookkeeping for beginners, track expenses, small business finances'],
  ['blog:how-much-to-save-each-month-for-a-goal', 'How Much Should You Save Each Month?', 'One simple formula', 'Use one formula to know exactly how much to save each month for an emergency fund, a vacation or a house deposit.', 'how much to save, savings tips, saving money, money goals'],
];

// Batch 2 (Nov 2026): holiday planner, free template and the new guides. Seasonal ones first.
const PINS2 = [
  ['holiday-budget-planner', 'Christmas Budget Planner Spreadsheet', 'Holiday 2026', 'Plan every gift and holiday cost against one total budget. Tick bought and wrapped, and see what is left to spend.', 'christmas budget, holiday budget planner, christmas planning, gift budget'],
  ['free-budget-template', 'Free One-Page Budget Template', 'Free download', 'A free one-page budget that splits your pay into needs, wants and savings and compares it with the 50/30/20 rule.', 'free budget template, free printable budget, 50 30 20 budget, budget spreadsheet free'],
  ['holiday-budget-planner', 'Holiday Gift List + Budget Tracker', 'Never overspend at Christmas', 'One list for everyone you buy for: gift ideas, budget, actual cost, bought and wrapped. Excel and Google Sheets.', 'christmas gift list, gift tracker, holiday gift ideas, christmas organization'],
  ['blog:how-to-make-a-budget-in-google-sheets', 'How to Make a Budget in Google Sheets', 'Step by step, with formulas', 'Build a simple monthly budget in Google Sheets with SUMIFS, dropdowns and a budget vs. actual chart.', 'google sheets budget, budget spreadsheet, how to budget, google sheets tips'],
  ['blog:how-to-set-financial-goals-for-2027', 'How to Set Financial Goals for 2027', 'New year money plan', 'Review 2026, pick three money goals, turn them into monthly numbers and check in every week.', 'financial goals, new year goals 2027, money goals, new year resolutions'],
  ['free-budget-template', 'Is Your Budget 50/30/20? Free Checker', 'Free spreadsheet', 'Type in your take-home pay and costs and see how your split compares with 50% needs, 30% wants, 20% savings.', '50/30/20 rule, budget for beginners, free budget spreadsheet, money tips'],
  ['blog:how-to-pay-off-credit-card-debt-fast', 'How to Pay Off Credit Card Debt Fast', '6 steps that work', 'See how much a bigger monthly payment saves on a $5,000 card balance, plus six steps to clear credit card debt faster.', 'pay off credit card debt, debt free tips, credit card debt, debt payoff'],
  ['holiday-budget-planner', 'Plan a Stress-Free Christmas on a Budget', 'Gifts · food · decor · travel', 'Holiday budget dashboard: plan vs. total budget, spent so far and left to spend, by gift group.', 'christmas on a budget, frugal christmas, holiday spending, budget christmas'],
  ['blog:sinking-funds-explained', 'Sinking Funds Explained', 'Stop big bills wrecking your budget', 'What sinking funds are, the most common ones and how much to put in each month.', 'sinking funds, sinking funds list, budgeting tips, saving money tips'],
  ['free-budget-template', 'Free Budget Spreadsheet for Beginners', 'Excel + Google Sheets', 'Start budgeting today with a free one-page template. Download and fill in the yellow cells.', 'budget for beginners, free budget spreadsheet, budgeting 101, simple budget'],
];

const THEMES = [
  { bg: '#EEF4F0', ink: '#1F2A37', accent: '#2F7D5B', band: '#2F7D5B', bandInk: '#FFFFFF' },
  { bg: '#FBF3E8', ink: '#2B2118', accent: '#B5622E', band: '#2B2118', bandInk: '#FBF3E8' },
  { bg: '#1F2A37', ink: '#FFFFFF', accent: '#8FD3AE', band: '#8FD3AE', bandInk: '#1F2A37' },
  { bg: '#F1EEF8', ink: '#251F3A', accent: '#5B4B9A', band: '#5B4B9A', bandInk: '#FFFFFF' },
];

function html(pin, i) {
  const [ref, headline, kicker] = pin;
  const t = THEMES[i % THEMES.length];
  const pid = ref.startsWith('blog:') ? null : ref;
  const imgId = pid || BLOG_PRODUCT[ref.slice(5)];
  const img = 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'site', 'img', imgId + '.png')).toString('base64');
  const p = pid && data.products.find((x) => x.id === pid);
  const bottom = !pid ? 'Free guide · read on the blog' : p.price ? `Instant download · $${p.price}` : 'Free download';
  return `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}body{width:1000px;height:1500px;background:${t.bg};font-family:Inter,system-ui,sans-serif;color:${t.ink};overflow:hidden;position:relative}
.k{position:absolute;left:70px;top:90px;font-size:30px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${t.accent}}
h1{position:absolute;left:70px;right:70px;top:150px;font-size:${headline.length > 38 ? 78 : 90}px;line-height:1.04;font-weight:800;letter-spacing:-.02em}
.shot{position:absolute;left:70px;right:70px;bottom:250px;height:760px;border-radius:26px;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.22);background:#fff}
.shot img{position:absolute;width:1580px;left:-730px;top:-100px}
.band{position:absolute;left:0;right:0;bottom:0;height:190px;background:${t.band};color:${t.bandInk};display:flex;flex-direction:column;justify-content:center;padding:0 70px}
.band b{font-size:40px;font-weight:800}.band span{font-size:28px;opacity:.85;margin-top:6px}
</style></head><body><div class="k">${kicker}</div><h1>${headline}</h1>
<div class="shot"><img src="${img}" style="${imgId === 'money-bundle' ? 'left:-560px;top:-60px' : ''}"></div>
<div class="band"><b>${bottom}</b><span>Penny &amp; Plan · penny-and-plan.pages.dev</span></div></body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 1500 }, deviceScaleFactor: 1 });
  const rows = [];
  const ALL = [...PINS, ...PINS2];
  for (let i = 0; i < ALL.length; i++) {
    const [ref, headline, , description, keywords] = ALL[i];
    const file = `pin-${String(i + 1).padStart(2, '0')}-${ref.replace('blog:', '')}.jpg`;
    await page.setContent(html(ALL[i], i), { waitUntil: 'load' });
    await page.screenshot({ path: path.join(OUT, file), type: 'jpeg', quality: 86 });
    const isBlog = ref.startsWith('blog:');
    const link = isBlog ? `${SITE}/blog/${ref.slice(5)}.html` : `${SITE}/p/${ref}.html`;
    const board = BOARDS[isBlog ? BLOG_PRODUCT[ref.slice(5)] : ref];
    rows.push({ title: headline, media: IMG_BASE + file, board, description, link: `${link}?utm_source=pinterest&utm_medium=pin&utm_campaign=pin${i + 1}`, keywords });
  }
  await browser.close();
  // Batch 1: interleave so consecutive pins show different products.
  const old = rows.slice(0, PINS.length);
  const order1 = [];
  for (let k = 0; k < 4; k++) for (let j = k; j < old.length; j += 4) order1.push(old[j]);
  // Batch 2 was added after pin #1 was published. pins.json order must never change for pins already
  // sent (the worker keeps an index), so they stay first; new pins then alternate with the rest.
  const SENT_BEFORE_BATCH2 = 1;
  const fresh = rows.slice(PINS.length);
  const rest = order1.slice(SENT_BEFORE_BATCH2);
  const order = order1.slice(0, SENT_BEFORE_BATCH2);
  while (fresh.length || rest.length) { if (fresh.length) order.push(fresh.shift()); if (rest.length) order.push(rest.shift()); }
  fs.writeFileSync(path.join(OUT, 'pins.json'), JSON.stringify(order.map((r) => ({
    title: r.title, description: r.description, link: r.link, image_url: r.media, board: r.board,
    alt_text: r.title + ' - ' + r.description.split('. ')[0] + '.', keywords: r.keywords,
  })), null, 1) + '\n');
  console.log(`wrote ${rows.length} pins to ${OUT}`);
})();

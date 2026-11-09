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
  'word-search-large-print': 'Puzzle Books',
  'sudoku-puzzle-book': 'Puzzle Books',
  'mazes-for-kids': 'Puzzle Books',
  'puzzle-bundle': 'Puzzle Books',
  'christmas-party-games': 'Christmas Party Ideas',
  'thanksgiving-party-games': 'Puzzle Books',
  'murder-mystery-mistletoe-manor': 'Christmas Party Ideas',
  'new-years-eve-party-games': 'Christmas Party Ideas',
  'escape-room-clockwork-lab': 'Puzzle Books',
  'resume-templates': 'Resume Templates',
  'boho-wall-art': 'Wall Art Prints',
  'armenian-alphabet-kids': 'Armenian for Kids',
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

// Batch 3 (Nov 7, 2026): puzzle books. Mazes and the bundle come last because they go live on Gumroad later the same day.
const PINS3 = [
  ['word-search-large-print', 'Large Print Word Search Puzzles', 'Printable · answers included', '50 relaxing word searches with big, easy-to-read letters. Words never run backwards. Print on Letter or A4.', 'large print word search, printable word search, word search for seniors, word find'],
  ['sudoku-puzzle-book', '120 Printable Sudoku Puzzles', 'Easy to expert', 'Four levels, two puzzles per page, and every puzzle has exactly one solution. Answers at the back.', 'printable sudoku, sudoku puzzles, brain games, sudoku for beginners'],
  ['word-search-large-print', 'Word Search for Seniors: Big Letters', 'Easy on the eyes', 'Themed puzzles with large 15 x 15 grids and a tick-box word list. A calm, screen-free activity.', 'word search for seniors, activities for seniors, large print puzzles, brain exercise'],
  ['sudoku-puzzle-book', 'Sudoku for Beginners to Experts', 'Printable puzzle book', 'Start easy and work up to expert. Every grid is computer-checked so you never need to guess.', 'sudoku book, logic puzzles, puzzle book, printable games'],
  ['word-search-large-print', 'Christmas & Winter Word Search', 'Printable holiday puzzles', 'Holiday, winter and New Year word searches with big letters, plus 47 more themes. Great for family gatherings.', 'christmas word search, holiday printables, winter activities, christmas activities'],
  ['sudoku-puzzle-book', 'Screen-Free Brain Games: Sudoku', 'Print at home', 'Keep your mind sharp with 120 sudoku puzzles you can print as often as you like.', 'brain games, screen free activities, sudoku printable, puzzle lovers'],
  ['mazes-for-kids', 'Printable Mazes for Kids', 'Ages 5–10 · 60 mazes', '60 mazes that grow from simple to tricky, with every solution drawn at the back. Great for road trips and rainy days.', 'mazes for kids, printable mazes, kids activities, rainy day activities'],
  ['puzzle-bundle', 'Printable Puzzle Book Bundle', 'Word search · sudoku · mazes', 'Three printable puzzle books in one download: 230 puzzles with answers, Letter and A4.', 'puzzle book bundle, printable puzzles, activity book, family activities'],
  ['mazes-for-kids', 'Screen-Free Activity: Maze Book', 'Easy · medium · hard', 'One maze per page with a clear start and finish. Every maze has exactly one path.', 'screen free kids activities, maze puzzles, kids printables, homeschool activities'],
  ['puzzle-bundle', '230 Printable Puzzles With Answers', 'For kids and grown-ups', 'Large print word search, sudoku and mazes for kids in one bundle. Print as many copies as you like.', 'printable activities, puzzle printables, brain teasers, family game night'],
];

// Batch 4 (Nov 8, 2026): Christmas Party Games. Seasonal, so these go to the front of the queue.
const PINS4 = [
  ['christmas-party-games', 'Christmas Party Games for the Whole Family', '9 printable games', 'Scavenger hunt, trivia, 30 bingo cards, charades, Who Am I? and more. Print at home and play tonight.', 'christmas party games, family christmas games, christmas activities, holiday party ideas'],
  ['christmas-party-games', 'Christmas Scavenger Hunt with Rhyming Clues', 'Kids love it', '12 rhyming clues that lead around the house to a hidden prize, with a hiding chart for grown-ups.', 'christmas scavenger hunt, scavenger hunt for kids, christmas morning ideas, kids christmas activities'],
  ['christmas-party-games', 'Printable Christmas Bingo: 30 Cards', 'Plus a caller sheet', '30 different bingo cards with festive words and a FREE square. Great for classrooms and family parties.', 'christmas bingo, printable bingo, classroom christmas party, christmas games for kids'],
  ['christmas-party-games', 'Christmas Trivia: 40 Questions + Answers', 'For kids and grown-ups', 'From the Twelve Days of Christmas to Christmas in Japan: 40 fun questions with an answer key.', 'christmas trivia, christmas quiz, holiday trivia, christmas party ideas'],
  ['christmas-party-games', 'Left-Right Christmas Gift Exchange Game', 'Original story included', 'Pass the presents left and right as the story is read aloud. Whoever holds a gift at the end keeps it!', 'left right game, gift exchange game, white elephant ideas, christmas party games'],
  ['christmas-party-games', 'Christmas Games for Kids: Print & Play', 'Charades · Would You Rather', 'Screen-free fun for Christmas Eve: charades, Would You Rather, word scramble and Finish the Carol.', 'christmas games for kids, christmas eve activities, screen free christmas, kids printables'],
];

// Batch 5 (Nov 9, 2026): Thanksgiving Party Games (Thanksgiving is Nov 26), front of the queue.
const PINS5 = [
  ['thanksgiving-party-games', 'Thanksgiving Games for the Whole Family', '9 printable games', 'Trivia, 30 bingo cards, a scavenger hunt, charades and gratitude Table Talk cards. Print at home and play after dinner.', 'thanksgiving games, family thanksgiving activities, thanksgiving party ideas, printable games'],
  ['thanksgiving-party-games', 'Thanksgiving Table Talk: 40 Gratitude Questions', 'Dinner conversation cards', 'Questions that get everyone sharing what they are thankful for, from kids to grandparents.', 'thanksgiving conversation starters, gratitude questions, thanksgiving table ideas, family dinner'],
  ['thanksgiving-party-games', 'Printable Thanksgiving Bingo: 30 Cards', 'Plus a caller sheet', '30 different bingo cards with turkey, pie and harvest words. Great for classrooms and family gatherings.', 'thanksgiving bingo, printable bingo, thanksgiving classroom party, kids thanksgiving activities'],
  ['thanksgiving-party-games', 'Thanksgiving Trivia: 40 Questions + Answers', 'From 1621 to pumpkin pie', 'The Mayflower, the Wampanoag, the first parade and turkey facts: 40 questions with an answer key.', 'thanksgiving trivia, thanksgiving quiz, thanksgiving facts, family game night'],
  ['thanksgiving-party-games', 'Pass the Pie: Thanksgiving Left-Right Game', 'Original story included', 'Pass the pie left and right while the story is read aloud. Whoever holds it at the end keeps it!', 'left right game, thanksgiving party games, thanksgiving activities for adults, pass the parcel'],
  ['thanksgiving-party-games', 'Thanksgiving Scavenger Hunt for Kids', '12 rhyming clues', 'Keep the kids busy while dinner cooks: rhyming clues lead around the house to a hidden prize.', 'thanksgiving scavenger hunt, kids thanksgiving games, thanksgiving activities for kids, scavenger hunt clues'],
];

// Batch 6 (Nov 9, 2026): the Christmas murder mystery party kit.
const PINS6 = [
  ['murder-mystery-mistletoe-manor', 'Host a Christmas Murder Mystery Party', '6–8 players · printable kit', 'Murder at Mistletoe Manor: 8 suspects, 20 evidence cards, invitations, a host script and a solution that really adds up.', 'murder mystery party, christmas murder mystery, christmas party ideas for adults, dinner party games'],
  ['murder-mystery-mistletoe-manor', 'Murder Mystery Dinner Party Game for 8', 'Christmas Eve, a snowed-in manor', 'Who poisoned Sir Nicholas\'s cocoa? Character booklets, clues, name tags and awards: just print and play.', 'murder mystery dinner, printable party game, christmas dinner party, game night ideas'],
  ['murder-mystery-mistletoe-manor', 'Christmas Party Idea: A Murder Mystery Night', 'Costumes · clues · suspects', 'Give every guest a secret, a motive and an alibi. Three rounds of clues lead to one killer.', 'christmas party theme, adult christmas party ideas, murder mystery night, holiday party games'],
  ['murder-mystery-mistletoe-manor', 'Printable Murder Mystery Party Kit', 'Invitations to solution', 'Everything you need to host: host guide, invitations, 8 character booklets, evidence cards, ballots and awards.', 'murder mystery kit, host a murder mystery, printable party kit, party planning'],
];

// Batch 7 (Nov 9, 2026): New Year's Eve games. Placed from queue position 28 (about Nov 21) so they go out
// 3-5 weeks before New Year's Eve, when people plan their parties.
const PINS7 = [
  ['new-years-eve-party-games', "New Year's Eve Games for Families", '9 printable games', 'Trivia on New Year traditions around the world, 30 bingo cards, a countdown hunt and Year in Review cards.', "new years eve games, family new years eve, new years eve with kids, nye party ideas"],
  ['new-years-eve-party-games', "New Year's Eve Trivia: Traditions Around the World", '40 questions + answers', '12 grapes in Spain, plates in Denmark, polka dots in the Philippines: how well do you know New Year?', "new years eve trivia, new year traditions, new years eve party games, trivia night"],
  ['new-years-eve-party-games', 'Year in Review + 2027 Wishes Cards', 'Look back · dream ahead', '40 conversation cards for New Year\'s Eve: the best moments of the year and big dreams for 2027.', "new years eve activities, year in review, 2027 goals, new years conversation starters"],
  ['new-years-eve-party-games', "Printable New Year's Eve Bingo", '30 cards + caller sheet', 'Confetti, countdown, sparklers and more: 30 different bingo cards to play before midnight.', "new years eve bingo, printable bingo, nye games for kids, new years party printables"],
];

// Batch 8 (Nov 9, 2026): escape room for kids. Evergreen, so spread out from queue position 16.
const PINS8 = [
  ['escape-room-clockwork-lab', 'Printable Escape Room for Kids', 'Ages 7–12 · 45 minutes', 'Six puzzles, one secret code: ciphers, a maze, Morse code and more. Set up at home in 15 minutes.', 'escape room for kids, printable escape room, kids party games, indoor activities for kids'],
  ['escape-room-clockwork-lab', 'DIY Escape Room Party at Home', 'Birthday party idea', 'Hide the envelopes, start the timer and let the kids crack the code. Hint cards and certificates included.', 'kids birthday party ideas, escape room party, birthday games for kids, diy escape room'],
  ['escape-room-clockwork-lab', 'Rainy Day Activity: Escape the Clockwork Lab', 'Screen-free fun', 'A story, six brain-teasing puzzles and a prize at the end. Every puzzle has one clear answer.', 'rainy day activities, screen free activities for kids, brain games for kids, boredom busters'],
  ['escape-room-clockwork-lab', 'Escape Room Puzzles for Kids (Printable)', 'Cipher · maze · Morse code', 'Great for classrooms, homeschool and sleepovers: kids practise maths, logic and reading while racing the clock.', 'escape room classroom, homeschool activities, logic puzzles for kids, educational games'],
];

// Batch 9 (Nov 9, 2026): resume templates, boho wall art and the Armenian alphabet pack.
const PINS9 = [
  ['resume-templates', 'Resume Templates for Word & Google Docs', '5 designs + cover letters', 'Classic, Modern, Two-Column, Minimal and Executive: one-page resumes you can edit in minutes. Letter and A4.', 'resume template, google docs resume, word resume template, job search tips'],
  ['boho-wall-art', 'Boho Wall Art Set of 6', 'Printable · mid-century', 'Warm earth-tone prints for a gallery wall: sun and hills, rainbow arches, Bauhaus shapes and more. 5 sizes each.', 'boho wall art, mid century modern art, printable wall art, gallery wall ideas'],
  ['armenian-alphabet-kids', 'Armenian Alphabet for Kids: Printable Pack', 'Հայոց այբուբեն', 'All 39 letters with colouring, tracing, an example word, flashcards and a poster. Eastern Armenian.', 'armenian alphabet, learn armenian, armenian for kids, armenian worksheets'],
  ['resume-templates', 'One-Page Resume That Gets Interviews', 'Edit in 10 minutes', 'Professional resume and cover letter templates with an editing guide and tips for writing strong bullet points.', 'resume tips, one page resume, cover letter template, career advice'],
  ['boho-wall-art', 'Gallery Wall Ideas: Earthy Abstract Prints', 'Download · print · frame', 'Six prints that work together in any room. Re-composed for every frame ratio, from 4x6 to 24x36 and A5 to A1.', 'gallery wall, living room wall decor, abstract art print, earthy home decor'],
  ['armenian-alphabet-kids', 'Teach Your Child the Armenian Alphabet', 'Colour · trace · learn', 'One page a day: colour the letter, say the word, trace the letters. With flashcards and a certificate.', 'armenian language, armenian heritage, bilingual kids, alphabet tracing'],
  ['resume-templates', 'Two-Column Resume Template', 'Modern and easy to edit', 'A clean two-column layout with a sidebar for skills and contact details. Word and Google Docs, Letter and A4.', 'two column resume, modern resume template, creative resume, resume design'],
  ['boho-wall-art', 'Mid-Century Rainbow & Sun Prints', 'Printable wall art', 'Rainbow arches, a sunset over hills and golden waves: cheerful boho prints for a nursery, bedroom or office.', 'rainbow wall art, sun print, nursery wall art, boho bedroom decor'],
  ['armenian-alphabet-kids', 'Armenian Flashcards for Kids', '39 letter cards', 'Capital and small letters with an example word and meaning on every card. Print, cut and play.', 'armenian flashcards, armenian school, diaspora kids, language learning'],
  ['resume-templates', 'Executive Resume Template', 'Bold header, serif style', 'A confident resume design with a coloured header and matching cover letter. Edit in Word or Google Docs.', 'executive resume, professional resume template, cv template, job application'],
  ['boho-wall-art', 'Bauhaus & Boho Leaf Wall Prints', 'Instant download', 'Geometric Bauhaus shapes and a boho leaf in terracotta, mustard and sage. 300 dpi, sharp up to 24x36.', 'bauhaus print, boho leaf art, geometric wall art, terracotta decor'],
  ['armenian-alphabet-kids', 'Armenian Alphabet Poster + Tracing Pages', 'Ages 3–8', 'A colourful alphabet poster for the wall and tracing pages for every letter, from Ա to Ֆ.', 'armenian alphabet poster, armenian printables, kids learning, homeschool armenian'],
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
  const ALL = [...PINS, ...PINS2, ...PINS3, ...PINS4, ...PINS5, ...PINS6, ...PINS7, ...PINS8, ...PINS9];
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
  const fresh = rows.slice(PINS.length, PINS.length + PINS2.length);
  const rest = order1.slice(SENT_BEFORE_BATCH2);
  const order = order1.slice(0, SENT_BEFORE_BATCH2);
  while (fresh.length || rest.length) { if (fresh.length) order.push(fresh.shift()); if (rest.length) order.push(rest.shift()); }
  // Batch 3 (puzzle books) was added after SENT_BEFORE_BATCH3 pins had been published; same rule:
  // never reorder what was already sent, then alternate the new pins with the remaining queue.
  const SENT_BEFORE_BATCH3 = 3;
  const fresh3 = rows.slice(PINS.length + PINS2.length, PINS.length + PINS2.length + PINS3.length);
  const rest3 = order.splice(SENT_BEFORE_BATCH3);
  while (fresh3.length || rest3.length) { if (rest3.length) order.push(rest3.shift()); if (fresh3.length) order.push(fresh3.shift()); }
  // Batch 4 (Christmas games) after SENT_BEFORE_BATCH4 pins: seasonal, so a new pin comes first in every pair.
  const SENT_BEFORE_BATCH4 = 5;
  const fresh4 = rows.slice(PINS.length + PINS2.length + PINS3.length, PINS.length + PINS2.length + PINS3.length + PINS4.length);
  const rest4 = order.splice(SENT_BEFORE_BATCH4);
  while (fresh4.length || rest4.length) { if (fresh4.length) order.push(fresh4.shift()); if (rest4.length) order.push(rest4.shift()); }
  // Batch 5 (Thanksgiving) after SENT_BEFORE_BATCH5 pins: seasonal, new pin first in every pair.
  const SENT_BEFORE_BATCH5 = 7;
  const fresh5 = rows.slice(PINS.length + PINS2.length + PINS3.length + PINS4.length, PINS.length + PINS2.length + PINS3.length + PINS4.length + PINS5.length);
  const rest5 = order.splice(SENT_BEFORE_BATCH5);
  while (fresh5.length || rest5.length) { if (fresh5.length) order.push(fresh5.shift()); if (rest5.length) order.push(rest5.shift()); }
  // Batch 6 (murder mystery): one every 3 pins after the first unsent Thanksgiving pin, so Thanksgiving still leads.
  const SENT_BEFORE_BATCH6 = 8;
  const fresh6 = rows.slice(PINS.length + PINS2.length + PINS3.length + PINS4.length + PINS5.length, PINS.length + PINS2.length + PINS3.length + PINS4.length + PINS5.length + PINS6.length);
  const rest6 = order.splice(SENT_BEFORE_BATCH6);
  while (fresh6.length || rest6.length) { if (fresh6.length) order.push(fresh6.shift()); for (let k = 0; k < 2 && rest6.length; k++) order.push(rest6.shift()); }
  // Batch 7 (New Year's Eve): one every 3 pins starting at queue position 28.
  const START7 = 28;
  const fresh7 = rows.slice(PINS.length + PINS2.length + PINS3.length + PINS4.length + PINS5.length + PINS6.length, PINS.length + PINS2.length + PINS3.length + PINS4.length + PINS5.length + PINS6.length + PINS7.length);
  const rest7 = order.splice(START7);
  while (fresh7.length || rest7.length) { if (fresh7.length) order.push(fresh7.shift()); for (let k = 0; k < 2 && rest7.length; k++) order.push(rest7.shift()); }
  // Batch 8 (escape room): one every 6 pins from queue position 16.
  const START8 = 16;
  const fresh8 = rows.slice(PINS.length + PINS2.length + PINS3.length + PINS4.length + PINS5.length + PINS6.length + PINS7.length, PINS.length + PINS2.length + PINS3.length + PINS4.length + PINS5.length + PINS6.length + PINS7.length + PINS8.length);
  const rest8 = order.splice(START8);
  while (fresh8.length || rest8.length) { if (fresh8.length) order.push(fresh8.shift()); for (let k = 0; k < 5 && rest8.length; k++) order.push(rest8.shift()); }
  // Batch 9 (resume, wall art, Armenian): one every 3 pins from queue position 12.
  const START9 = 12;
  const fresh9 = rows.slice(PINS.length + PINS2.length + PINS3.length + PINS4.length + PINS5.length + PINS6.length + PINS7.length + PINS8.length);
  const rest9 = order.splice(START9);
  while (fresh9.length || rest9.length) { if (fresh9.length) order.push(fresh9.shift()); for (let k = 0; k < 2 && rest9.length; k++) order.push(rest9.shift()); }
  fs.writeFileSync(path.join(OUT, 'pins.json'), JSON.stringify(order.map((r) => ({
    title: r.title, description: r.description, link: r.link, image_url: r.media, board: r.board,
    alt_text: r.title + ' - ' + r.description.split('. ')[0] + '.', keywords: r.keywords,
  })), null, 1) + '\n');
  console.log(`wrote ${rows.length} pins to ${OUT}`);
})();

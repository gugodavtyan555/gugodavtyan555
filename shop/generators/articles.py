"""SEO guides published on /blog/. Each links to the matching template.

Numbers in the debt article come from the Debt Payoff Planner's sample
data (5 debts, $250 extra per month, starting January 2027).
"""

ARTICLES = [
    {
        "slug": "debt-snowball-vs-avalanche",
        "title": "Debt Snowball vs. Avalanche: Which Pays Off Debt Faster? (Worked Example)",
        "description": "A side-by-side example with five real-looking debts shows how much the avalanche method saves, why the snowball still works, and how to pick.",
        "date": "2026-11-06",
        "products": ["debt-payoff-planner", "money-bundle"],
        "html": """
<p>If you have more than one debt, the order you pay them off in matters. The two popular methods are the <strong>debt snowball</strong> and the <strong>debt avalanche</strong>. Both start the same way: pay the minimum on every debt, then put every extra dollar on one target debt. When that debt is gone, its minimum payment "rolls over" to the next target.</p>
<ul><li><strong>Snowball:</strong> target the <em>smallest balance</em> first.</li>
<li><strong>Avalanche:</strong> target the <em>highest interest rate</em> first.</li></ul>
<h2>A worked example</h2>
<p>Here are five debts, with $250 extra each month on top of the minimums, starting in January 2027:</p>
<table><tr><th>Debt</th><th>Balance</th><th>APR</th><th>Minimum</th></tr>
<tr><td>Credit card A</td><td>$4,200</td><td>22.9%</td><td>$110</td></tr>
<tr><td>Credit card B</td><td>$1,350</td><td>18.5%</td><td>$40</td></tr>
<tr><td>Car loan</td><td>$9,800</td><td>6.9%</td><td>$245</td></tr>
<tr><td>Student loan</td><td>$15,400</td><td>5.0%</td><td>$170</td></tr>
<tr><td>Medical bill</td><td>$620</td><td>0%</td><td>$50</td></tr></table>
<h2>The results</h2>
<table><tr><th></th><th>Minimums only</th><th>Snowball + $250</th><th>Avalanche + $250</th></tr>
<tr><td>Months to debt-free</td><td>63</td><td>41</td><td>41</td></tr>
<tr><td>Total interest</td><td>$7,008</td><td>$3,905</td><td>$3,766</td></tr>
<tr><td>First debt gone</td><td>Month 13</td><td>Month 3</td><td>Month 13</td></tr></table>
<p>Three lessons:</p>
<ol><li><strong>The extra $250 matters most.</strong> Either method cuts almost two years and over $3,000 of interest compared with paying minimums.</li>
<li><strong>Avalanche costs less.</strong> Here it saves $139 because the 22.9% card shrinks faster. The gap grows when your rates are far apart and your balances are large.</li>
<li><strong>Snowball feels better sooner.</strong> The medical bill is gone in month 3 and card B in month 7. Many people stay motivated because of these early wins, and the method that you stick with beats the one you abandon.</li></ol>
<h2>How to choose</h2>
<p>Pick <strong>avalanche</strong> if you are motivated by the math and your high-interest debt is also large. Pick <strong>snowball</strong> if you have several small balances and want quick wins. If two debts have similar rates, start with the smaller one. You get the early win at almost no cost.</p>
<h2>Run your own numbers</h2>
<p>Your result depends on your exact balances, rates and extra payment. A payoff spreadsheet can simulate every month for you, including the rollover of freed-up minimums, and show the date you become debt-free under each method.</p>
""",
    },
    {
        "slug": "50-30-20-budget-rule",
        "title": "The 50/30/20 Budget Rule: How to Set Up a Monthly Budget That Works",
        "description": "Split your take-home pay into needs, wants and savings, turn it into category budgets, and track it each month in a spreadsheet.",
        "date": "2026-11-06",
        "products": ["budget-planner", "money-bundle"],
        "html": """
<p>The 50/30/20 rule is the simplest way to start a budget. Take your monthly <strong>take-home pay</strong> (after tax) and split it three ways:</p>
<ul><li><strong>50% needs:</strong> rent or mortgage, utilities, groceries, insurance, transport, minimum debt payments.</li>
<li><strong>30% wants:</strong> dining out, shopping, entertainment, subscriptions, travel.</li>
<li><strong>20% savings and extra debt payments:</strong> emergency fund, retirement, goals, paying debt faster.</li></ul>
<h2>Example: $4,650 a month</h2>
<table><tr><th>Bucket</th><th>Share</th><th>Amount</th></tr>
<tr><td>Needs</td><td>50%</td><td>$2,325</td></tr><tr><td>Wants</td><td>30%</td><td>$1,395</td></tr><tr><td>Savings &amp; debt</td><td>20%</td><td>$930</td></tr></table>
<p>Then break each bucket into categories. For needs, that might be rent $1,450, utilities $220, groceries $520 and transport $260. Write a number next to every category. That number is your budget.</p>
<h2>Step by step</h2>
<ol><li><strong>Find your real income.</strong> Use the amount that lands in your account, not your salary.</li>
<li><strong>List fixed costs first.</strong> Rent, insurance, phone and loan payments rarely change.</li>
<li><strong>Estimate variable costs from last month.</strong> Look at your bank statement for groceries, fuel and dining out.</li>
<li><strong>Pay yourself first.</strong> Set the savings transfer to happen on payday.</li>
<li><strong>Track every transaction.</strong> Once a week, log what you spent. It takes ten minutes.</li>
<li><strong>Review at month end.</strong> Where did you go over? Move money between categories for next month, not after the fact.</li></ol>
<h2>When 50/30/20 doesn't fit</h2>
<p>In expensive cities, needs can take 60% or more. That's fine: shrink wants first, and keep savings above zero, even at 5%. If you have high-interest debt, push the third bucket toward debt until it's gone. The point is to choose your split instead of discovering it afterwards.</p>
<h2>Make it automatic</h2>
<p>A budget spreadsheet with a dashboard does the adding up for you: enter transactions, and it shows budget vs. actual for each category, your savings rate, and where you went over.</p>
""",
    },
    {
        "slug": "track-small-business-income-expenses",
        "title": "How to Track Small Business Income and Expenses in a Spreadsheet",
        "description": "A simple bookkeeping routine for freelancers, Etsy sellers and side hustles: categories, a ledger, a monthly profit & loss, and a tax set-aside.",
        "date": "2026-11-06",
        "products": ["small-business-tracker", "money-bundle"],
        "html": """
<p>You don't need accounting software to keep clean books when you're starting out. A good spreadsheet and a 15-minute weekly habit will cover most freelancers, online sellers and side businesses.</p>
<h2>1. Separate business money</h2>
<p>Open a separate bank account (or at least a separate card) for the business. It makes every later step faster, and it makes your records far easier to defend.</p>
<h2>2. Choose your categories once</h2>
<p>Income: product sales, services, consulting, affiliate income. Expenses: advertising, software, supplies, shipping, platform and payment fees, contractors, phone and internet, education. Keep the list short and consistent so you can compare months.</p>
<h2>3. Log every transaction in a ledger</h2>
<p>One row per transaction with date, description, income or expense, category, amount, payment method and an invoice or receipt number. Save the receipt in a folder named by month. Platform payouts (Etsy, Shopify, Stripe) arrive with fees already taken out, so record the gross sale as income and the fees as an expense if you want an accurate picture.</p>
<h2>4. Read your monthly profit &amp; loss</h2>
<p>Total income minus total expenses equals net profit. Look at it by month: which months are slow, which expenses grow faster than sales, and what your profit margin is.</p>
<h2>5. Set money aside for tax</h2>
<p>Every month, move a percentage of your profit into a savings account for tax. Many self-employed people use 25–30% as a starting point, but the right number depends on your country and income. Confirm it with a tax professional. It is much easier than finding the full amount at once at the end of the year.</p>
<h2>A weekly routine</h2>
<ol><li>Download the week's transactions from your bank and platforms.</li><li>Add them to the ledger with a category.</li><li>Check the dashboard: profit so far, tax set-aside, top expenses.</li></ol>
<p>A ready-made tracker gives you the ledger, the monthly P&amp;L and the tax set-aside in one file, so you only enter the transactions.</p>
""",
    },
    {
        "slug": "how-much-to-save-each-month-for-a-goal",
        "title": "How Much to Save Each Month for a Goal (Simple Formula + Examples)",
        "description": "Use one simple formula to know exactly how much to save each month for an emergency fund, a vacation or a house deposit, and how to track several goals at once.",
        "date": "2026-11-06",
        "products": ["savings-goals-tracker", "money-bundle"],
        "html": """
<p>The formula is short:</p>
<p style="font-size:20px"><strong>Monthly saving = (Target − Already saved) ÷ Months left</strong></p>
<h2>Examples</h2>
<table><tr><th>Goal</th><th>Target</th><th>Saved</th><th>Months left</th><th>Per month</th></tr>
<tr><td>Emergency fund</td><td>$6,000</td><td>$1,200</td><td>13</td><td>$369</td></tr>
<tr><td>Vacation</td><td>$2,500</td><td>$240</td><td>8</td><td>$283</td></tr>
<tr><td>New laptop</td><td>$1,400</td><td>$400</td><td>6</td><td>$167</td></tr></table>
<p>Add the last column together and you have your monthly savings plan: $819 in this case. If that is more than you can afford, push a deadline back or lower a target. Now that trade-off is visible instead of hidden.</p>
<h2>Sinking funds</h2>
<p>Saving a little every month for something you know is coming (holidays, car repairs, insurance renewals) is called a sinking fund. It turns big surprise bills into small planned ones. Treat each one as its own goal.</p>
<h2>How big should an emergency fund be?</h2>
<p>A common guideline is three to six months of essential expenses. Start with a first milestone of one month. It already covers most car repairs and medical bills.</p>
<h2>Track it</h2>
<p>Keep a simple log of each deposit and which goal it was for. A savings tracker adds them up per goal, shows a progress bar, and recalculates the monthly amount as deadlines get closer.</p>
""",
    },
    {
        "slug": "how-to-pay-off-credit-card-debt-fast",
        "title": "How to Pay Off Credit Card Debt Fast: 6 Steps That Actually Work",
        "description": "See how much a bigger monthly payment saves on a $5,000 card balance at 22% APR, and the six steps that get credit card debt gone faster.",
        "date": "2026-11-06",
        "products": ["debt-payoff-planner", "money-bundle"],
        "html": """
<p>Credit card interest is usually the most expensive money you owe, so it deserves to be paid off first and fast. The single biggest lever is simple: <strong>pay more than the minimum every month</strong>. Here is how much it matters.</p>
<h2>What a bigger payment does</h2>
<p>A $5,000 balance at 22% APR, with no new purchases:</p>
<table><tr><th>Monthly payment</th><th>Months to pay off</th><th>Total interest</th></tr>
<tr><td>$150</td><td>52</td><td>$2,798</td></tr>
<tr><td>$250</td><td>26</td><td>$1,286</td></tr>
<tr><td>$400</td><td>15</td><td>$732</td></tr></table>
<p>Going from $150 to $250 a month halves the time and saves over $1,500. That is why every step below is about freeing up money for the card.</p>
<h2>6 steps</h2>
<ol>
<li><strong>Stop adding to the balance.</strong> Take the card out of your phone wallet and online shops. Use a debit card while you pay it down.</li>
<li><strong>List every debt.</strong> Write the balance, interest rate (APR) and minimum payment for each card and loan. You can't plan what you can't see.</li>
<li><strong>Pick an order.</strong> Highest interest first (the <em>avalanche</em>) saves the most money; smallest balance first (the <em>snowball</em>) gives quicker wins. See our <a href="/blog/debt-snowball-vs-avalanche.html">snowball vs. avalanche example</a>.</li>
<li><strong>Find a fixed extra amount.</strong> Look at your budget for $50–$200 a month: subscriptions, dining out, a side gig. Make it automatic on payday.</li>
<li><strong>Roll payments over.</strong> When one card is paid off, add its whole payment to the next one. Your total monthly payment stays the same, but each debt falls faster.</li>
<li><strong>Ask about a lower rate.</strong> Call your card issuer and ask for a lower APR, or compare 0% balance-transfer offers. Read the fees (often 3–5%) and the date the promotional rate ends before you move a balance.</li>
</ol>
<h2>Know your debt-free date</h2>
<p>Motivation is easier when you can see the finish line. A payoff planner simulates every month, including the rollover, and shows the exact month each card is paid off and how much interest an extra $50 saves.</p>
""",
    },
    {
        "slug": "sinking-funds-explained",
        "title": "Sinking Funds Explained: How to Stop Big Bills From Wrecking Your Budget",
        "description": "What sinking funds are, a list of common ones, how to calculate the monthly amount, and how to track several funds at once.",
        "date": "2026-11-06",
        "products": ["savings-goals-tracker", "money-bundle"],
        "html": """
<p>Most budgets don't fail because of the monthly bills. They fail because of the bills that come once or twice a year: car insurance, holiday gifts, a new set of tires. A <strong>sinking fund</strong> is money you set aside a little at a time for one of those known, future expenses.</p>
<h2>Sinking fund vs. emergency fund</h2>
<p>An emergency fund is for the <em>unexpected</em>: a job loss or a medical bill. A sinking fund is for the <em>expected</em>: you know the car registration is due in September, you just don't want to pay it all at once from one paycheck.</p>
<h2>Common sinking funds</h2>
<ul><li>Car insurance and registration</li><li>Car repairs and maintenance</li><li>Holidays and gifts</li><li>Vacation</li><li>Annual subscriptions and memberships</li><li>Back to school</li><li>Medical and dental costs not covered by insurance</li><li>Home repairs</li><li>Pet care</li></ul>
<h2>How much to put in each month</h2>
<p>Divide what you still need by the months left: <strong>(target − saved) ÷ months until due</strong>.</p>
<table><tr><th>Fund</th><th>Target</th><th>Due in</th><th>Per month</th></tr>
<tr><td>Holiday gifts</td><td>$600</td><td>12 months</td><td>$50</td></tr>
<tr><td>Car insurance</td><td>$900</td><td>6 months</td><td>$150</td></tr>
<tr><td>Vacation</td><td>$1,800</td><td>9 months</td><td>$200</td></tr></table>
<p>Add the last column to your budget as one line, "sinking funds: $400", and transfer it on payday.</p>
<h2>Where to keep the money</h2>
<p>A separate savings account keeps sinking-fund money away from everyday spending. Many banks let you create several "pockets" or sub-accounts with names. If yours doesn't, one account plus a tracker that splits the balance by fund works just as well.</p>
<h2>Track them in one place</h2>
<p>Log each deposit with the fund's name. A savings tracker adds up each fund, shows a progress bar, and tells you the monthly amount needed to be ready on time.</p>
""",
    },
    {
        "slug": "how-to-make-a-budget-in-google-sheets",
        "title": "How to Make a Budget in Google Sheets (Step by Step, With Formulas)",
        "description": "Build a simple monthly budget in Google Sheets with SUMIFS: categories, a transaction log and a budget-vs-actual summary, or start from a ready-made template.",
        "date": "2026-11-06",
        "products": ["budget-planner", "money-bundle"],
        "html": """
<p>Google Sheets is free, works on your phone, and is all you need for a solid budget. Here is how to build one in about 20 minutes. The key is one formula: <code>SUMIFS</code>.</p>
<h2>1. Create three tabs</h2>
<ul><li><strong>Categories</strong>: one row per category with its monthly budget.</li>
<li><strong>Transactions</strong>: every income and expense.</li>
<li><strong>Summary</strong>: budget vs. actual.</li></ul>
<h2>2. Set up the Transactions tab</h2>
<p>Columns: <em>Date</em> (A), <em>Description</em> (B), <em>Category</em> (C), <em>Amount</em> (D). To get a dropdown for Category, select column C, open <strong>Data → Data validation</strong>, choose "Dropdown (from a range)" and pick the category list on the Categories tab.</p>
<h2>3. Add up each category with SUMIFS</h2>
<p>On the Summary tab, put the category name in A2 and the month's first day in B1 (for example 2027-01-01). Then the actual spending for that category in that month is:</p>
<p><code>=SUMIFS(Transactions!D:D, Transactions!C:C, A2, Transactions!A:A, "&gt;="&amp;B1, Transactions!A:A, "&lt;"&amp;EDATE(B1,1))</code></p>
<p>Copy it down for every category. Next to it, pull in the budget and calculate what is left: <code>=budget − actual</code>.</p>
<h2>4. Highlight overspending</h2>
<p>Select the "remaining" column, open <strong>Format → Conditional formatting</strong>, and set "Less than 0" to a red fill. Now every overspent category jumps out.</p>
<h2>5. Add a chart</h2>
<p>Select the category, budget and actual columns, then <strong>Insert → Chart</strong> and choose a bar chart. You get budget vs. actual at a glance.</p>
<h2>6. Review once a week</h2>
<p>Ten minutes a week is enough: download the transactions from your bank app, paste them in, set the categories, and look at the red cells.</p>
<h2>Skip the setup</h2>
<p>If you'd rather start budgeting today, a ready-made template has all of this built in: dropdowns, a monthly dashboard, a savings rate and a 12-month annual summary. Upload it to Google Sheets with <strong>File → Import</strong>.</p>
""",
    },
    {
        "slug": "how-to-set-financial-goals-for-2027",
        "title": "How to Set Financial Goals for 2027 (And Actually Keep Them)",
        "description": "A simple year-planning routine: review 2026, pick three money goals, turn them into monthly numbers, and check in every week and month.",
        "date": "2026-11-06",
        "products": ["2027-planner", "money-bundle"],
        "html": """
<p>Most New Year money resolutions are too vague to keep. "Save more" and "get out of debt" don't tell you what to do on a Tuesday in March. This routine turns them into numbers and small weekly actions.</p>
<h2>1. Look back at 2026 (30 minutes)</h2>
<p>Pull up your bank statements and answer three questions: What did I earn? What did I spend, roughly by category? What did I save or pay off? You need a starting point before you can set a target.</p>
<h2>2. Pick no more than three goals</h2>
<p>Three goals you finish beat ten you forget. Good money goals are specific and have a number and a date:</p>
<ul><li>"Build a $3,000 emergency fund by December 2027."</li>
<li>"Pay off the $4,200 credit card by August 2027."</li>
<li>"Save $1,800 for a summer trip by June 2027."</li></ul>
<h2>3. Turn each goal into a monthly number</h2>
<p>Divide the amount by the months you have. $3,000 over 12 months is $250 a month; $1,800 over 6 months is $300. Add these to your budget as fixed lines, and automate the transfers on payday.</p>
<h2>4. Plan the year, then the month, then the week</h2>
<ul><li><strong>Year:</strong> mark the deadlines and the months with big bills (insurance, holidays).</li>
<li><strong>Month:</strong> on the 1st, write the month's three priorities and the money moves for each goal.</li>
<li><strong>Week:</strong> on Sunday, check last week's spending and list one action per goal.</li></ul>
<h2>5. Track a habit, not just a number</h2>
<p>Small daily habits move the big numbers: no-spend days, packing lunch, logging expenses. A habit tracker that you tick every day keeps the goal in front of you.</p>
<h2>6. Review every quarter</h2>
<p>In April, July and October, compare your progress with the plan. Behind? Lower a target or extend a date instead of giving up. The goal is progress, not perfection.</p>
""",
    },
]

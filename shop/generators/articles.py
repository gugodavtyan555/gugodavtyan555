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
]

"""Seasonal party guides (Thanksgiving, Christmas, New Year's Eve) published on /blog/.

The trivia in the Christmas article is the same set as the free Christmas games download.
"""
from xmas_content import TRIVIA

_trivia = "".join(f"<li>{q} <em>Answer: {a}</em></li>" for q, a in TRIVIA[:20])

SEASONAL = [
    {
        "slug": "christmas-party-games-for-adults",
        "title": "15 Christmas Party Games for Adults (and Mixed Ages) That Actually Get People Playing",
        "description": "Easy Christmas party games for adults, families and office parties: trivia, bingo, gift swaps, charades and a murder mystery, with tips on what works for which crowd.",
        "date": "2026-11-11",
        "products": ["holiday-party-mega-bundle", "christmas-party-games", "free-christmas-games"],
        "html": """
<p>The best Christmas party games are simple to explain, work with a drink in one hand, and let quieter guests join in without performing. Here are fifteen that we have seen work, grouped by the kind of party you are hosting.</p>
<h2>Easy icebreakers (first 30 minutes)</h2>
<ol><li><strong>Who Am I?</strong> Stick a card with a Christmas character on each guest's back. They ask yes/no questions until they guess it. Great for mixing people who don't know each other.</li>
<li><strong>Christmas Would You Rather.</strong> Read a question ("Would you rather wrap every present or cook the whole dinner?") and let people move to one side of the room. No skill needed, lots of talking.</li>
<li><strong>Two Truths and a Christmas Lie.</strong> Everyone shares three holiday memories; the others guess which one is invented.</li></ol>
<h2>Table games (after dinner)</h2>
<ol start="4"><li><strong>Christmas trivia.</strong> Play in teams of three or four. Forty questions take about 30 minutes. Mix easy ones ("What plant do people kiss under?") with a few hard ones so every team scores.</li>
<li><strong>Finish the Carol.</strong> Read the first line of a carol, teams write the missing word. Surprisingly competitive.</li>
<li><strong>Christmas word scramble.</strong> Hand out a sheet of scrambled festive words; first team to solve them all wins.</li>
<li><strong>Christmas bingo.</strong> Works for 6 to 30 people. Use different cards for every player so there is one winner at a time.</li></ol>
<h2>Gift games</h2>
<ol start="8"><li><strong>Left-Right gift exchange.</strong> Everyone holds a wrapped gift while you read a story. Every time you say LEFT or RIGHT, gifts move. Whoever holds a gift at the end keeps it. Takes 5 minutes and works for any age.</li>
<li><strong>White elephant / Yankee swap.</strong> Guests bring a wrapped gift under a set price and can "steal" opened ones. Set a limit of two steals per gift so it ends.</li>
<li><strong>Gift bingo.</strong> While someone opens presents, guests mark off items on their card ("socks", "candle", "something homemade").</li></ol>
<h2>Active games</h2>
<ol start="11"><li><strong>Christmas charades.</strong> Act out a movie, song or object. Split into two teams and use a one-minute timer.</li>
<li><strong>Scavenger hunt.</strong> Hide clues around the house, each one leading to the next. Rhyming clues make it feel special for kids and adults.</li>
<li><strong>Minute-to-win-it.</strong> Stack ornaments, move candy canes with a spoon, unwrap a present with oven gloves.</li></ol>
<h2>The big one: a murder mystery night</h2>
<ol start="14"><li><strong>Christmas murder mystery.</strong> Each guest plays a suspect with secrets and an alibi. Over three rounds the clues come out, and everyone votes on the killer. Plan 2–3 hours and 6–8 players. It turns an ordinary dinner into the party people talk about for years.</li>
<li><strong>Escape-the-room puzzle.</strong> A printable escape room with locks and codes works for teams of kids or adults at the same table.</li></ol>
<h2>Which games for which party?</h2>
<table><tr><th>Party</th><th>Best picks</th></tr>
<tr><td>Office party</td><td>Trivia in teams, bingo, Would You Rather</td></tr>
<tr><td>Family with kids</td><td>Scavenger hunt, Left-Right game, charades, word scramble</td></tr>
<tr><td>Friends' dinner</td><td>Murder mystery, Finish the Carol, white elephant</td></tr>
<tr><td>Big group (15+)</td><td>Bingo, Who Am I?, trivia with teams of five</td></tr></table>
<h2>Hosting tips</h2>
<ul><li>Print everything the day before and put each game in its own envelope.</li>
<li>Small prizes (chocolate, a candle, a silly hat) make people try harder.</li>
<li>Play the loud games before dinner and the table games after.</li>
<li>Always have a tie-breaker question ready.</li></ul>
<p>Want to try before you print a whole pack? Our <a href="/p/free-christmas-games.html">free Christmas games</a> include 40 trivia questions, a word scramble and Finish the Carol, all with answers.</p>
""",
    },
    {
        "slug": "christmas-trivia-questions-and-answers",
        "title": "Christmas Trivia Questions and Answers: 20 Easy and Fun Questions for Kids and Adults",
        "description": "20 Christmas trivia questions with answers for family night, school or the office party, plus tips for running a trivia round and a free printable with 40 questions.",
        "date": "2026-11-11",
        "products": ["free-christmas-games", "christmas-party-games"],
        "html": """
<p>Christmas trivia is the easiest party game to run: one host, a few pens and teams of three or four. Here are twenty questions that work for mixed ages, from easy to tricky, with the answers right after each one.</p>
<h2>20 Christmas trivia questions</h2>
<ol>""" + _trivia + """</ol>
<h2>How to run a great trivia round</h2>
<ul><li><strong>Play in teams.</strong> Teams of 3–4 mix ages and let shy guests help without being on the spot.</li>
<li><strong>Read each question twice</strong> and give 30 seconds before the next one.</li>
<li><strong>Swap answer sheets</strong> between teams for marking. It's faster and more fun.</li>
<li><strong>Keep a tie-breaker:</strong> "How many lights are on our tree?" Closest guess wins.</li>
<li><strong>Kids' version:</strong> let younger players answer out loud and give a point for every good try.</li></ul>
<h2>Get the printable</h2>
<p>Our <a href="/p/free-christmas-games.html">free Christmas party games</a> PDF has all 40 questions on printable sheets with an answer key, plus a word scramble and Finish the Carol. The full <a href="/p/christmas-party-games.html">Christmas Party Games Bundle</a> adds bingo with 30 cards, a scavenger hunt, charades, Who Am I? and more.</p>
""",
    },
    {
        "slug": "thanksgiving-games-for-family",
        "title": "Thanksgiving Games for the Whole Family: 10 Ideas for Before and After Dinner",
        "description": "Fun Thanksgiving games for kids and adults: trivia, bingo, a pie-passing game, gratitude cards and a scavenger hunt, with tips to keep everyone at the table happy.",
        "date": "2026-11-11",
        "products": ["thanksgiving-party-games"],
        "html": """
<p>Thanksgiving Day brings together people of every age, from toddlers to grandparents. The right games fill the long wait for the turkey, keep kids busy and get relatives who rarely see each other talking. Here are ten that work in a crowded living room.</p>
<h2>While the turkey is cooking</h2>
<ol><li><strong>Thanksgiving scavenger hunt.</strong> Hide rhyming clues around the house, each leading to the next, with a small prize at the end. Kids can do it in pairs with an adult reading the clues.</li>
<li><strong>Thanksgiving bingo.</strong> Easy for all ages. Call out words like "pumpkin pie", "parade" and "leftovers" and use a different card for every player.</li>
<li><strong>Who Am I?</strong> A card on each guest's back (a pilgrim, a turkey, a pumpkin pie) and yes/no questions until they guess.</li>
<li><strong>Word scramble.</strong> A quiet game for kids at the table while the grown-ups cook.</li></ol>
<h2>At the table</h2>
<ol start="5"><li><strong>Gratitude table talk cards.</strong> Put a few cards at each place: "What made you laugh this year?" "Who are you thankful for and why?" They start real conversations instead of the usual small talk.</li>
<li><strong>Thanksgiving trivia.</strong> Play in teams between dinner and dessert. Mix history ("In what year was the first Thanksgiving celebrated?") with food and football questions.</li>
<li><strong>Would You Rather, Thanksgiving edition.</strong> "Would you rather only eat stuffing or only eat pie?" Kids love it.</li></ol>
<h2>After dinner</h2>
<ol start="8"><li><strong>Pass the Pie (Left-Right game).</strong> Everyone sits in a circle, one person reads a short story, and a small wrapped prize moves left or right every time those words are read. Five minutes, lots of laughs.</li>
<li><strong>Charades.</strong> Act out Thanksgiving words. Two teams, one-minute timer.</li>
<li><strong>Family "minute to win it".</strong> Stack cups, move corn kernels with a straw, balance a spoon on your nose.</li></ol>
<h2>Tips for a relaxed game time</h2>
<ul><li>Print the games a day or two early. Thanksgiving morning is busy.</li>
<li>Give each game to a different relative to host. It shares the work and gets everyone involved.</li>
<li>Small prizes (candy, a chocolate turkey, first pick of dessert) make it more exciting.</li>
<li>Keep games short: 10–20 minutes each works better than one long game.</li></ul>
""",
    },
    {
        "slug": "new-years-eve-party-ideas-at-home",
        "title": "New Year's Eve Party Ideas at Home: Games and a Countdown Plan for Families and Friends",
        "description": "How to plan a fun New Year's Eve at home: an hour-by-hour plan to midnight, party games for kids and adults, and a Year in Review activity.",
        "date": "2026-11-11",
        "products": ["new-years-eve-party-games", "holiday-party-mega-bundle"],
        "html": """
<p>A New Year's Eve party at home can be more fun than a crowded bar, if you plan the evening so it doesn't drag before midnight. Here is a simple plan with games that work for families with kids and for friends.</p>
<h2>An easy plan for the evening</h2>
<table><tr><th>Time</th><th>What happens</th></tr>
<tr><td>7:00 pm</td><td>Snacks and an icebreaker: Who Am I? cards</td></tr>
<tr><td>8:00 pm</td><td>Dinner, then New Year trivia in teams</td></tr>
<tr><td>9:30 pm</td><td>Bingo or charades. Younger kids can do an early "midnight" countdown now</td></tr>
<tr><td>10:30 pm</td><td>Year in Review cards and wishes for the new year</td></tr>
<tr><td>11:30 pm</td><td>Countdown scavenger hunt: the last clue is found just before midnight</td></tr>
<tr><td>12:00 am</td><td>Countdown, toast and noise-makers</td></tr></table>
<h2>Games that work</h2>
<ul><li><strong>New Year trivia.</strong> Questions on traditions around the world: grapes at midnight in Spain, the ball drop in Times Square, Hogmanay in Scotland.</li>
<li><strong>New Year's Eve bingo.</strong> Different card for every player; works for any group size.</li>
<li><strong>Countdown scavenger hunt.</strong> Hide 12 clues, one for each "hour". The final clue leads to the party poppers.</li>
<li><strong>Year in Review cards.</strong> "Best thing I ate this year", "A moment I'm proud of", "One thing I want to learn next year". Read them aloud or seal them in an envelope to open next New Year's Eve.</li>
<li><strong>Left-Right prize game.</strong> A short story where the prize moves every time you hear LEFT or RIGHT. Perfect right after the countdown, while everyone is still together.</li>
<li><strong>Charades and Would You Rather</strong> for the hour when energy dips.</li></ul>
<h2>Small touches that make it feel like a party</h2>
<ul><li>A "time capsule" jar for everyone's wishes.</li>
<li>Party hats and noise-makers handed out at 11:55.</li>
<li>For kids: celebrate "New Year" in another time zone at 6 pm or 9 pm, then let them sleep.</li></ul>
""",
    },
    {
        "slug": "how-to-host-a-murder-mystery-party",
        "title": "How to Host a Murder Mystery Party: A Step-by-Step Guide for First-Time Hosts",
        "description": "Everything you need to host a murder mystery dinner party at home: how many guests, invitations, costumes, the three rounds, and how the big reveal works.",
        "date": "2026-11-11",
        "products": ["murder-mystery-mistletoe-manor", "holiday-party-mega-bundle"],
        "html": """
<p>A murder mystery party turns an ordinary dinner into a game where every guest plays a character, and one of them is secretly the killer. It sounds complicated, but with a good kit the host only needs to read a short script. Here is how to do it.</p>
<h2>1. Choose the kit and the number of guests</h2>
<p>Most kits are written for a fixed number of characters, often 6 to 8. Check that the game still works if someone cancels: good kits mark which characters are optional and let anyone (any gender, any age over 12) play any role.</p>
<h2>2. Send invitations 2–3 weeks before</h2>
<p>Each guest gets their character name, a one-line description and a costume idea. People enjoy the party much more when they have had a few days to think about their character.</p>
<h2>3. Prepare on the day</h2>
<ul><li>Print the character booklets, evidence cards and name tags.</li>
<li>Put each guest's booklet in an envelope with their name on it.</li>
<li>Read the host script and the solution once, so you can answer questions.</li></ul>
<h2>4. How the evening runs</h2>
<table><tr><th>Round</th><th>What happens</th></tr>
<tr><td>Arrival</td><td>Guests meet in character; the host announces the murder</td></tr>
<tr><td>Round 1: Secrets</td><td>Everyone reads their booklet and starts asking questions</td></tr>
<tr><td>Round 2: Where were you?</td><td>Alibis are shared and the first evidence cards come out</td></tr>
<tr><td>Round 3: The evidence</td><td>The last clues: photos, letters, phone logs</td></tr>
<tr><td>Accusations</td><td>Everyone writes down who they think did it and why</td></tr>
<tr><td>The reveal</td><td>The host reads the solution and the timeline</td></tr></table>
<p>Plan 2 to 3 hours with dinner. Serve the main course between rounds 1 and 2 and dessert before the reveal.</p>
<h2>5. Tips from experienced hosts</h2>
<ul><li><strong>Nobody needs to act.</strong> Guests can read lines straight from the booklet. Shy guests relax after the first round.</li>
<li><strong>Prizes:</strong> best costume, best detective and best liar.</li>
<li><strong>Theme the food and music:</strong> a Christmas manor, a 1920s speakeasy, a cruise ship.</li></ul>
<h2>Why it works so well at Christmas</h2>
<p>Holiday dinners are when friends and family are already together for a whole evening. A murder mystery gives the evening a story, gets people who barely know each other laughing, and makes the night memorable.</p>
""",
    },
]

SEASONAL += [
    {
        "slug": "new-year-budget-reset",
        "title": "New Year Budget Reset: A 7-Step Plan to Start 2027 With Your Money Organized",
        "description": "After the holidays, reset your budget in one evening: total up December, rebuild your categories, set three money goals and automate them for 2027.",
        "date": "2026-11-22",
        "products": ["budget-planner", "money-bundle"],
        "html": """
<p>January is the best month to fix your money: the holiday spending is over, and everyone is in a fresh-start mood. This reset takes one evening and sets up the whole year.</p>
<h2>1. Total up December</h2>
<p>Add up what you spent on gifts, food, travel and parties. Don't judge it, just write the number down. It becomes your holiday budget for next year, and you can start saving for it monthly in January.</p>
<h2>2. Check what you really earn</h2>
<p>Use your take-home pay, not your salary. If your income changes month to month, budget with your lowest typical month and treat anything extra as a bonus.</p>
<h2>3. Rebuild your categories from last year</h2>
<p>Look at three months of bank statements and list what you actually spend on rent, utilities, groceries, transport, insurance, subscriptions and eating out. A budget built on real numbers is one you can keep.</p>
<h2>4. Cancel what you forgot about</h2>
<p>January is subscription-cleaning month. Free trials from the holidays turn into paid plans now. Cancel anything you didn't use in December.</p>
<h2>5. Pick three money goals</h2>
<p>For example: a $1,000 emergency fund by April, the $2,500 credit card paid off by September, $100 a month into a holiday fund. Give each goal a number and a date.</p>
<h2>6. Automate the goals on payday</h2>
<p>Turn each goal into a monthly amount and set up automatic transfers the day after payday. Money you never see is money you don't spend.</p>
<h2>7. Schedule a 15-minute monthly check-in</h2>
<p>On the first Sunday of every month, compare budget with actual spending and move money between categories if needed. Small corrections every month beat a big rescue in December.</p>
<h2>A simple tool helps</h2>
<p>A budget spreadsheet that calculates totals, what's left and your savings rate for you makes the monthly check-in quick. Pair it with a yearly planner to keep the three goals in front of you.</p>
""",
    },
    {
        "slug": "small-business-tax-prep-checklist",
        "title": "Small Business Tax Prep Checklist: What to Gather Before Tax Season",
        "description": "A simple year-end checklist for freelancers and small business owners: income records, expenses by category, mileage, home office, receipts and what to hand to your accountant.",
        "date": "2026-11-22",
        "products": ["small-business-tracker", "money-bundle"],
        "html": """
<p>Tax season is much easier when your records are ready before January. Use this checklist in December to get organized. It is general guidance, not tax advice: rules differ by country and state, so confirm details with a tax professional.</p>
<h2>1. Income</h2>
<ul><li>Total income for the year, by month and by client or sales channel.</li>
<li>Payment platform reports (card processors, marketplaces, online stores).</li>
<li>Any forms or statements your clients or platforms send you.</li></ul>
<h2>2. Expenses by category</h2>
<p>Group every business expense: software and subscriptions, equipment, supplies, advertising, website, phone and internet, professional fees, education, bank and payment fees. Totals per category are what your accountant needs.</p>
<h2>3. Receipts</h2>
<p>Match each expense to a receipt or invoice. Save them as PDFs in one folder per month so nothing is lost.</p>
<h2>4. Mileage and travel</h2>
<p>If you drive for business, list the date, purpose and miles of each trip. Keep travel receipts for flights, hotels and meals with clients.</p>
<h2>5. Home office</h2>
<p>If you work from home, note the size of your workspace and your household costs (rent, utilities, internet). Your accountant can tell you what applies to you.</p>
<h2>6. Profit and set-aside</h2>
<p>Income minus expenses is your profit. Many freelancers set aside 25–30% of profit through the year for taxes. Check how close your savings are to what you'll owe.</p>
<h2>7. Start next year organized</h2>
<p>On January 1, start a fresh income and expense tracker. Ten minutes a week of entering transactions means next year's tax prep takes an hour, not a weekend.</p>
""",
    },
]

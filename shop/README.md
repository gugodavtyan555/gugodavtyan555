# Penny & Plan — թվային ապրանքների խանութ (անգլալեզու)

**Կայքը.** https://penny-and-plan.pages.dev

Ֆինանսական Excel/Google Sheets շաբլոններ և 2027-ի պլանավորիչ ենք վաճառում անգլալեզու գնորդներին։ Ապրանքները թվային են. գնորդը վճարում է և ֆայլն ավտոմատ ստանում email-ով։ Ոչ մի բան չի առաքվում, պահեստ պետք չէ։

## Ապրանքներ

| Ապրանք | Գին | Ֆայլ |
|---|---|---|
| Monthly Budget Planner | $9 | `Monthly-Budget-Planner.zip` |
| Debt Payoff Planner | $8 | `Debt-Payoff-Planner.zip` |
| Small Business Income & Expense Tracker | $14 | `Small-Business-Income-Expense-Tracker.zip` |
| Savings Goals Tracker | $6 | `Savings-Goals-Tracker.zip` |
| 2027 Hyperlinked Planner (iPad + Letter + A4, 85 էջ) | $7 | `2027-Planner.zip` |
| The Complete Money Bundle (բոլոր 5-ը) | $29 | `Complete-Money-Bundle.zip` |

Excel ֆայլերի բոլոր թվերը բանաձևեր են։ Դրանք ստուգված են LibreOffice-ով, իսկ պարտքի հաշվիչը համեմատված է առանձին հաշվարկի հետ։

## Gumroad (արված է)

Բոլոր 6 ապրանքը հրապարակված են https://pennyplanshop.gumroad.com հաշվում, և կայքի «Buy now» կոճակները տանում են դրանց։ Ապրանքները վերբեռնվել են `gumroad_upload.py`-ով (Gumroad API)։ Նոր ապրանքի համար բավական է այն ավելացնել `products.json`-ում և նորից գործարկել այս ծրագիրը։

## Ձեռքով տեղադրում (եթե API-ն հասանելի չէ)

Կայքում «Buy» կոճակների փոխարեն հիմա «Coming soon» է գրված։ Վճարումներ ընդունելու համար.

1. **Գրանցվիր վճարային հարթակում։** Ընտրիր մեկը.
   - [Lemon Squeezy](https://www.lemonsqueezy.com). ինքն է հաշվարկում և վճարում բոլոր երկրների VAT/հարկերը (merchant of record)։
   - [Gumroad](https://gumroad.com). ամենապարզն է։
   - [Payhip](https://payhip.com). աշխատում է PayPal-ով կամ Stripe-ով։

   ⚠️ **Ապրանք ստեղծելուց առաջ** մտիր Payout/Settings բաժին և ստուգիր, որ հարթակը կարող է գումարը փոխանցել **Հայաստանի** քո բանկային քարտին կամ PayPal-ին։ Եթե չի կարող, փորձիր հաջորդ հարթակը։
2. **Ստեղծիր 6 ապրանք։** Յուրաքանչյուրի համար.
   - Անունը և գինը վերցրու վերևի աղյուսակից։
   - Նկարագրությունը պատճենիր կայքի տվյալ ապրանքի էջից։
   - Ապրանքի ֆայլը՝ համապատասխան `.zip`։
   - Գլխավոր նկարը (cover)՝ համապատասխան `.png`։
3. **Ուղարկիր ինձ checkout հղումները** (օրինակ՝ `https://….gumroad.com/l/…`)։ Ես դրանք կավելացնեմ `products.json`-ի `checkout` դաշտերում և կթարմացնեմ կայքը։ Դրանից հետո կոճակները կդառնան «Buy now»։

ZIP ֆայլերը և նկարները չեն պահվում ռեպոզիտորիայում, որովհետև ռեպոն public է։ Նորից ստեղծելու համար.

```bash
cd shop
python3 generators/xlsx_products.py dist
python3 generators/planner_pdf.py dist
```

## Ինչ եմ անում ես (առանց քո մասնակցության)

- Գրում եմ նոր ապրանքներ և նոր SEO հոդվածներ (`generators/articles.py`)։
- Թարմացնում և տեղադրում եմ կայքը. `./deploy.sh` (Cloudflare Pages, անվճար)։
- Կարող եմ ամեն տարի ավելացնել նոր տարվա պլանավորիչը. `planner_pdf.py dist 2028`։

## Կառուցվածքը

| Ֆայլ | Ինչ է անում |
|---|---|
| `products.json` | Ապրանքներ, գներ, checkout հղումներ |
| `generators/xlsx_products.py` | Ստեղծում է 4 Excel շաբլոնը |
| `generators/planner_pdf.py` | Ստեղծում է պլանավորիչը (iPad, Letter, A4) |
| `generators/previews.js` | Ստեղծում է ապրանքների նկարները (Playwright) |
| `generators/articles.py` | SEO հոդվածներ (blog) |
| `generators/build_site.py` | Կառուցում է կայքը `site/` թղթապանակում |
| `generators/build_worker.py` | Կայքը փաթեթավորում է Cloudflare Worker-ի մեջ |
| `deploy.sh` | Կառուցում և տեղադրում է |

## Ազնիվ ակնկալիքներ

- Առաջին վաճառքը կախված է այցելուներից։ Google-ից եկող այցելուների համար սովորաբար 2–6 ամիս է պետք։
- Ամենաարագ աղբյուրը **Pinterest**-ն է. այս տեսակի ապրանքներն այնտեղ լավ են վաճառվում։ Ռեպոյում արդեն կա `pins/` ավտոմատացումը, և այն կարելի է միացնել այս խանութին։
- Etsy-ն նույնպես մեծ շուկա է նման շաբլոնների համար, եթե քո երկրից հնարավոր է այնտեղ վաճառող լինել։

## Pinterest (ավտոմատ)

- `pinbot/` — Cloudflare Worker `penny-pins`, որն ամեն օր 15:00 UTC-ին `pins/pins.json`-ից հաջորդ pin-ը ուղարկում է Make.com webhook-ին։ Կառավարման էջը՝ `/setup?key=...` (բանալին `SETUP_KEY` secret-ն է)։
- Make scenario «Penny Pins → Pinterest» (`pinbot/make-blueprint.json`). webhook → Pinterest List Boards → Create a Pin, board-ը ընտրվում է ըստ անվան։
- Նոր pin-եր. ավելացրու `generators/pins.js`-ի `PINS` ցանկում, գործարկիր `node pins.js`, commit/push, ապա `cd pinbot && npx wrangler deploy`։

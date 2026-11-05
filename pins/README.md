# 📌 Modern Haven Finds — Pinterest-ի ավտոմատ փիներ Amazon affiliate-ի համար

Համակարգը արդեն տեղադրված է քո Cloudflare հաշվում և աշխատում է 24/7՝
**https://haven-pins.gugodavtyan555.workers.dev**

## Ինչպես է աշխատում

```
Դու (Telegram) ──► Amazon-ի հղում + անուն (+ նկար, ըստ ցանկության)
                        │
                Cloudflare AI ──► վերնագիր, նկարագրություն, SEO հեշթեգեր, բորդ
                        │     └─► 2:3 lifestyle նկար (կամ քո ուղարկած նկարը)
                        ▼
          Նախադիտում Telegram-ում ✅ / 🔄 / ✍️ / 🗑
                        │ ✅
                     Հերթ
                        │  ամեն օր 3 անգամ (ԱՄՆ-ի պիկ ժամերին)
                        ▼
   Pinterest API ─┬─ Make.com ─┬─ քո կայքը + RSS
                  └────────────┴─► 📌 փինը՝ քո affiliate հղումով
```

Քո գործը մնում է միայն **շաբաթը մեկ անգամ 10–20 հղում ուղարկելը**։ Երբ հերթը սկսում է դատարկվել, բոտը ինքը կհիշեցնի։

---

## ✅ Քայլ 1 — Telegram բոտ (5 րոպե)

1. Telegram-ում բացիր **@BotFather** → `/newbot` → անունը, օրինակ՝ `Haven Pins`, username-ը՝ `haven_pins_xxx_bot`։
2. Պատճենիր տոկենը (`123456:ABC...`)։
3. Safari-ում բացիր **https://haven-pins.gugodavtyan555.workers.dev/setup**
4. Տեղադրիր տոկենը և **Amazon tracking ID**-ն (տե՛ս Քայլ 2) → **💾 Պահպանել**։
5. Բացիր բոտդ → **Start**։ Առաջինը, ով սեղմում է Start, դառնում է բոտի տերը։ Մյուսներին բոտը չի պատասխանի։

> ⚠️ Արա սա հենց հիմա. մինչև առաջին պահպանումը `/setup` էջը բաց է բոլորի համար։ Դրանից հետո էջը հասանելի է միայն `/panel` հրամանով ստացված գաղտնի հղումով։

## ✅ Քայլ 2 — Amazon Associates

1. Մտիր **affiliate-program.amazon.com** → ստուգիր, որ հաշիվդ ակտիվ է։
   Amazon-ը փակում է հաշիվը, եթե առաջին 180 օրում 3 վաճառք չի եղել։ Եթե փակվել է, կարող ես կրկին դիմել. նոր դիմումից հետո 180 օրը նորից է սկսվում։
2. Վերևի աջ անկյունում կա tracking ID-ն (օրինակ՝ `modernhaven-20`). այն գրիր `/setup` էջում։
3. **Profile → Websites and Mobile Apps** բաժնում ավելացրու՝
   - `https://www.pinterest.com/ModernHavenFinds_/`
   - `https://haven-pins.gugodavtyan555.workers.dev/`

**Ինչպես վերցնել հղումը iPhone-ից.** Amazon-ի հավելվածում բացիր ապրանքը → **Share** → պատճենիր հղումը և ուղարկիր բոտին։ Համակարգը ինքը կավելացնի քո `tag`-ը։ Կարող ես օգտագործել նաև SiteStripe-ի `amzn.to` հղումը (Safari, desktop տեսք)։

## ✅ Քայլ 3 — Pinterest-ին միացնելու 3 եղանակ

| | Արագություն | Արժեք | Ինչ է պետք |
|---|---|---|---|
| **A. Make.com** (առաջարկում եմ սկզբի համար) | աշխատում է հենց այսօր | անվճար (1000 գործողություն/ամիս ≈ 450 փին) | Make-ի հաշիվ |
| **B. Pinterest API** (ուղիղ) | 1–3 շաբաթ սպասել հաստատմանը | անվճար | Developer app + Standard access |
| **C. RSS ավտոհրապարակում** | ~1 օր | դոմեն ≈ $10/տարի | Սեփական դոմեն + Pinterest-ում claim |

Կարող ես միացնել մի քանիսը միասին։ Առաջարկում եմ **A + B**. սկսիր Make-ով, իսկ API-ի հաստատումից հետո անցիր դրան։

### A. Make.com (≈15 րոպե)

1. **make.com** → գրանցվիր (Free)։
2. **Create a new scenario** → **+** → փնտրիր **Webhooks** → **Custom webhook** → **Add** → անունը՝ `haven-pins` → **Save**։ Պատճենիր URL-ը (`https://hook...make.com/...`)։
3. Այդ URL-ը տեղադրիր `/setup` էջի **Make.com Webhook URL** դաշտում → **Պահպանել**։
4. Make-ում սեղմիր **Redetermine data structure**, հետո Telegram-ում բոտին գրիր `/next`, որ փորձնական տվյալ գա. Make-ը կսովորի դաշտերը։
5. Webhook-ից հետո **+** → **Pinterest** → **Create a Pin** → **Add connection** → մտիր Pinterest-ի հաշիվ → Allow։
   - **Board**՝ ընտրիր բորդը
   - **Title** → `title`, **Description** → `description`, **Link** → `link`
   - **Alt text** → `alt_text`, **Image URL** → `image_url`
6. Ներքևում միացրու **Scheduling → Immediately as data arrives** → **Save** → սեղմիր ON։

> Եթե ուզում ես, որ Make-ը ինքը ընտրի բորդը, ավելացրու Router և զտիչներ՝ ըստ `board` դաշտի։ Սկզբի համար բավական է մեկ բորդը։

### B. Pinterest API (ուղիղ, առանց Make-ի)

1. Pinterest-ի պրոֆիլը պետք է լինի **Business** (քոնը արդեն ունի «Центр для авторов», ուրեմն Business է)։
2. **developers.pinterest.com** → **My apps** → **Connect app**։
   - App name՝ `Modern Haven Pins`
   - Website՝ `https://haven-pins.gugodavtyan555.workers.dev/`
   - Privacy policy՝ `https://haven-pins.gugodavtyan555.workers.dev/privacy`
   - Նկարագրություն՝ *Internal tool to schedule and publish pins with my own product images to my own Pinterest account.*
3. Հավելվածի էջում **Redirect URIs** → ավելացրու՝
   `https://haven-pins.gugodavtyan555.workers.dev/pinterest/callback`
4. Պատճենիր **App ID** և **App secret key** → `/setup` → Ռեժիմ՝ **Sandbox (Trial)** → Պահպանել → **🔗 Միացնել Pinterest հաշիվը**։
5. Trial access-ով փիները գնում են sandbox, ոչ թե իրական պրոֆիլ։ Հավելվածի էջում սեղմիր **Upgrade → Standard access**։ Պահանջում են տեսանյութ, որը ցույց է տալիս OAuth-ը և փինի ստեղծումը։ Էկրանի ձայնագրությունը արա iPhone-ով. `/setup` → Միացնել → Telegram-ում ապրանք → ✅ → 🚀 Հիմա։
6. Հաստատումից հետո `/setup` → Ռեժիմ՝ **Production** → **🔁 Վերամիացնել**։

### C. RSS (ըստ ցանկության)

Քո կայքն արդեն ունի RSS՝ `https://haven-pins.gugodavtyan555.workers.dev/rss.xml`։ Pinterest-ը կարող է ինքը ստեղծել փիներ RSS-ից (**Settings → Bulk create Pins → Auto-publish**), բայց դրա համար պետք է **claim** անել կայքը, իսկ դա աշխատում է միայն սեփական դոմենով։ Եթե գնես դոմեն (օր.՝ `modernhavenfinds.com` Cloudflare-ում ≈ $10/տարի), Claude-ը կմիացնի այն այս worker-ին։

---

## 📱 Ամենօրյա օգտագործում

- **Ապրանք ավելացնել.** `https://amzn.to/xxxx Cuckoo 6 cup rice cooker`
- **Իրական նկարով.** ուղարկիր ապրանքի լուսանկարը, իսկ caption-ում գրիր հղումը և անունը
- Նախադիտման տակ՝
  - ✅ — հերթ
  - 🚀 — հրապարակել հիմա
  - 🔄 — նոր AI նկար
  - ✍️ — նոր տեքստ
  - 📷/🎨 — քո նկարը կամ AI-ինը
  - 🗑 — ջնջել
- `/queue` — հերթը, `/stats` — վիճակագրություն, `/pause` / `/resume`, `/panel` — կարգավորումներ

## 📈 Խորհուրդներ, որոնք իրականում ազդում են արդյունքի վրա

1. **Օրական 3 փինը** (լռելյայն) անվտանգ է։ 10+-ից բարձր Pinterest-ը կարող է սպամ համարել։
2. **Ստեղծիր 4–6 թեմատիկ բորդ** (Home Decor Ideas, Kitchen Gadgets, Gaming Setup, Cozy Bedroom...)։ AI-ը ինքը կընտրի համապատասխան բորդը։
3. **Ընտրիր ապրանքներ 4★+ գնահատականով և 500+ կարծիքով**, $25–150 գնով։ Դրանք ավելի լավ են վաճառվում։
4. **Սեզոնայնություն.** Pinterest-ի օգտատերերը պլանավորում են 1–2 ամիս առաջ։ Նոյեմբերին դիր Սուրբ Ծննդյան նվերներ, հունվարին՝ Valentine's/organization։
5. **Արդյունքը գալիս է 2–4 ամսից։** Pinterest-ը կուտակային է. հին փիները շարունակում են դիտումներ բերել։
6. **AI նկարը ապրանքի իրական տեսքը չէ։** Եթե ապրանքի դիզայնը կարևոր է (գույն, ձև), ուղարկիր իրական նկարը. դա նաև Amazon-ի կանոնների համար է անվտանգ։

## 🛠 Տեխնիկական

- `worker.js` — ամբողջ համակարգը (Telegram, AI, Pinterest OAuth/API, Make, կայք, RSS, cron)
- Bindings՝ `DB` (D1 `haven-pins`), `AI` (Workers AI). Cron՝ `0 * * * *`
- Տեղադրում՝ `npm install && npx wrangler deploy`
- Ծախսեր՝ 0 ֏ (Workers Free + Workers AI-ի օրական անվճար սահմանաչափ)

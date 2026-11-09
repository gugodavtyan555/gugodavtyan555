# AI-ролик: генератор вертикальных видео кодом

## Быстрый старт
1. Правь `scenes.js`: `top`/`big`/`sub` (текст на экране), `icon`, `say` (реплика диктора), `handle` (твой ник).
2. Озвучка (ElevenLabs):
   ```
   export ELEVENLABS_API_KEY=...        # ключ из elevenlabs.io
   # в scenes.js впиши voice.id (Voices → выбери русский голос → Copy ID)
   node voice.cjs                       # audio/voice.wav + timing.js
   node build.cjs out.mp4               # видео с голосом, длина сцен = длина реплик
   ```
   Повторный запуск озвучивает только изменённые реплики (кэш по тексту).
3. Музыка (по желанию): положи `music.mp3` рядом — она подмешается тихо и приглушается под голос.
4. Без озвучки: просто `node build.cjs out.mp4` (сцены по 2.6 сек, тихое видео).

Нужны: node 18+, playwright (chromium), ffmpeg.
`PROVIDER=mock node voice.cjs` — писк вместо голоса (проверка конвейера).
После озвучки: `python3 mix.py` (нужен numpy) синтезирует музыку и SFX и миксует с дакингом → audio/mix.wav, затем `node build.cjs out.mp4`.

Иконки: clock, timer, film, bulb, doc, wave, timeline, coin, arrow.
Герои: робот «Пикс» и слизень «Глюк» — спрайты в `render.html`.

## Серия роликов (производство)
- `episodes/epNN.js` — один ролик (заголовок, подпись, хэштеги, сцены с `data` для центральных визуалов).
- `base.js` — общие настройки (ник, голоса).
- `node produce.cjs [ep02 ep03 …]` → `out/epNN.mp4`, `out/epNN.txt` (подпись), `out/schedule.csv` (даты/время).
- Публикация в TikTok: TikTok Studio → Upload → Schedule (подпись и хэштеги из `.txt`).

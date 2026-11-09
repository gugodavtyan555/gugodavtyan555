# AI-ролик: генератор вертикальных видео кодом

1. Отредактируй `scenes.js` (текст, иконки, ник).
2. `node build.cjs out.mp4` — рендер 1080×1920, 24 fps (нужны playwright и ffmpeg).
3. Озвучку (ElevenLabs и др.) и музыку добавь поверх через ffmpeg:
   `ffmpeg -i out.mp4 -i voice.mp3 -map 0:v -map 1:a -c:v copy -shortest final.mp4`

Иконки: clock, timer, film, bulb, doc, wave, timeline, coin, arrow.
Герои: робот «Пикс» и слизень «Глюк» — спрайты в `render.html`.

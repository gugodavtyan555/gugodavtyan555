#!/bin/bash
# Сборка: рендер 4 сегментов, обложка в первые 0.5 c, звук. usage: finish.sh <out.mp4> <cover args...>
set -e
OUT=$1; shift
python3 music2.py >/dev/null
if [ -z "$SKIP_RENDER" ]; then for i in 0 1 2 3; do a=$(python3 -c "print($i/4)"); b=$(python3 -c "print(($i+1)/4)"); node render.mjs seg $a $b seg$i > work/seg$i.log 2>&1 & done; wait; fi
[ "$(cat work/seg*.log | grep -c "seg ok")" = "4" ] || { echo "render failed"; exit 1; }
node cover.mjs "$@" work/cover.png
ffmpeg -y -loglevel error -loop 1 -framerate 30 -t 0.5 -i work/cover.png -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -r 30 work/cov.mp4
printf "file 'seg0.mp4'\nfile 'seg1.mp4'\nfile 'seg2.mp4'\nfile 'seg3.mp4'\n" > work/list.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i work/list.txt -c copy work/video.mp4
ffmpeg -y -loglevel error -i work/cov.mp4 -i work/video.mp4 -i work/voice.wav -i work/music.wav -filter_complex "[0:v][1:v]concat=n=2:v=1:a=0[vv];[2:a]adelay=1000:all=1,volume=1.6,apad[v];[3:a]adelay=500:all=1,volume=0.42[m];[v][m]amix=inputs=2:duration=shortest:normalize=0,alimiter=limit=0.95[a]" -map "[vv]" -map "[a]" -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "$OUT"
ffprobe -v error -show_entries format=duration,size -of default=nw=1 "$OUT"

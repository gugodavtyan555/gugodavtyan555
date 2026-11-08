#!/usr/bin/env bash
# Օգտագործում.  ./deploy.sh <թղթապանակ> <կայքի-անուն>
# Օրինակ.       ./deploy.sh orders/aram-ani aram-ani-harsanik
# Ստեղծում է Netlify կայք (եթե չկա) և տեղադրում թղթապանակի պարունակությունը։
set -euo pipefail
DIR="$1"; NAME="$2"; API=https://api.netlify.com/api/v1
ZIP=$(mktemp -u).zip
(cd "$DIR" && zip -qr "$ZIP" .)
ID=$(curl -sS "$API/sites?name=$NAME&filter=all" | python3 -c "import sys,json;s=[x for x in json.load(sys.stdin) if x['name']=='$NAME'];print(s[0]['id'] if s else '')")
if [ -z "$ID" ]; then
  ID=$(curl -sS -X POST "$API/sites" -H "Content-Type: application/json" -d "{\"name\":\"$NAME\"}" | python3 -c "import sys,json;print(json.load(sys.stdin)['id'])")
fi
curl -sS -X POST "$API/sites/$ID/deploys" -H "Content-Type: application/zip" --data-binary @"$ZIP" >/dev/null
rm -f "$ZIP"
echo "✅ https://$NAME.netlify.app"

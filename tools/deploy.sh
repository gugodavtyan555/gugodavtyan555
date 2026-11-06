#!/bin/bash
# Build zip, deploy to Netlify, refresh artifact staging folder. Usage: deploy.sh "commit msg"
set -e
cd /home/user/gugodavtyan555
rm -f ru-site.zip && (cd ru-site && zip -qr ../ru-site.zip .)
R=$(curl -sS -X POST -H "Authorization: Bearer proxy-injected" -H "Content-Type: application/zip" --data-binary @ru-site.zip https://api.netlify.com/api/v1/sites/3eaf9284-d462-419c-93b3-26048ad18375/deploys | python3 -c "import sys,json;print(json.load(sys.stdin)['id'])")
for i in 1 2 3 4 5 6 7 8; do s=$(curl -sS -H "Authorization: Bearer proxy-injected" https://api.netlify.com/api/v1/deploys/$R | python3 -c "import sys,json;print(json.load(sys.stdin)['state'])"); [ "$s" = ready ] && break; sleep 5; done
echo "deploy: $s"
curl -sS -H "Authorization: Bearer proxy-injected" https://api.netlify.com/api/v1/sites/3eaf9284-d462-419c-93b3-26048ad18375 | python3 -c "import sys,json;d=json.load(sys.stdin);print('published:', d['published_deploy']['id']=='$R')"
S=/tmp/claude-0/-workspace/8aeb4342-0200-5c82-93a5-effabca2f09f/scratchpad/ru-art
rm -rf $S/src $S/articles && mkdir -p $S/src && cp -r ru-site/. $S/src/
for f in ru-site/*; do [ "$(basename $f)" != index.html ] && cp -r $f $S/; done
python3 - "$S" <<'PY'
import sys
S=sys.argv[1]; t=open('ru-site/index.html').read()
for s in ['<!doctype html>\n','<html lang="ru">\n','<head>\n','<meta charset="utf-8">\n','<meta name="viewport" content="width=device-width, initial-scale=1">\n','</head>\n','<body>\n','</body>\n','</html>\n']:
    t=t.replace(s,'',1)
open(S+'/index.html','w').write(t)
PY
G=/tmp/claude-0/-home-user-gugodavtyan555/8aeb4342-0200-5c82-93a5-effabca2f09f/scratchpad; T=/tmp/claude-0/-workspace/8aeb4342-0200-5c82-93a5-effabca2f09f/scratchpad
mkdir -p tools; cp $G/gen.py $G/more.py tools/ 2>/dev/null || true
for f in i18n.py i18n_text.py i18n_more.py legal.py faq.py casinos.py casino_pages.py calc_pages.py bank_pages.py hub.py seo.py schema.py covers.py covers.js build.sh deploy.sh telegraph_publish.py t_full.js t_calc.js t_bank.js t_finder.js; do cp $T/$f tools/ 2>/dev/null || true; done
git add -A ru-site tools promo .gitignore; git commit -qm "$1

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017hhL3Xf6Kv3CN4Eq9hc9ut" && echo committed
git push -q -u origin claude/capabilities-overview-lhvfjb && echo pushed || echo "git push failed"

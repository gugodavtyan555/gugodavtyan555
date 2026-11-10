#!/bin/bash
# usage: BOT_TOKEN=.. WEBHOOK_SECRET=.. ALLOWED_CHAT=.. D1_ID=.. ./deploy.sh <name> <file.js>
A=50c7dd7a8d23c2bc2e53d86f0ce6f0cc
NAME=$1; FILE=$2
META=$(python3 - <<PY
import os, json
print(json.dumps({"main_module":"worker.js","compatibility_date":"2025-01-01","bindings":[
 {"type":"d1","name":"DB","id":os.environ["D1_ID"]},
 {"type":"secret_text","name":"BOT_TOKEN","text":os.environ["BOT_TOKEN"]},
 {"type":"secret_text","name":"WEBHOOK_SECRET","text":os.environ["WEBHOOK_SECRET"]},
 {"type":"plain_text","name":"ALLOWED_CHAT","text":os.environ["ALLOWED_CHAT"]}] + ([{"type":"secret_text","name":"API_TOKEN","text":os.environ["API_TOKEN"]}] if os.environ.get("API_TOKEN") else []),
 "keep_bindings":[]}))
PY
)
curl -s -m 60 -X PUT "https://api.cloudflare.com/client/v4/accounts/$A/workers/scripts/$NAME" \
  -F "metadata=$META;type=application/json" -F "worker.js=@$FILE;filename=worker.js;type=application/javascript+module" \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('success'),d.get('errors'))"

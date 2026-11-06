#!/usr/bin/env bash
# Rebuilds the site from products.json and deploys it to Cloudflare Pages
# (https://penny-and-plan.pages.dev). The whole site is packed into one
# _worker.js, so the deploy is a single API call with no asset upload.
# Needs a Cloudflare API token (in Claude Code cloud sessions the proxy injects it).
set -euo pipefail
cd "$(dirname "$0")"
ACCOUNT="${CLOUDFLARE_ACCOUNT_ID:-50c7dd7a8d23c2bc2e53d86f0ce6f0cc}"
PROJECT="penny-and-plan"
AUTH=()
[ -n "${CLOUDFLARE_API_TOKEN:-}" ] && AUTH=(-H "Authorization: Bearer $CLOUDFLARE_API_TOKEN")
python3 generators/build_site.py
python3 generators/build_worker.py
curl -sS -m 120 -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT/pages/projects/$PROJECT/deployments" "${AUTH[@]}" \
  -F 'manifest={}' -F 'branch=main' -F '_worker.js=@worker/worker.js;type=application/javascript+module' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('deployed' if d['success'] else d['errors'], (d.get('result') or {}).get('url'))"

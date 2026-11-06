#!/usr/bin/env bash
# Rebuilds the site from products.json and deploys it to Cloudflare Workers.
# Needs CLOUDFLARE_API_TOKEN (in Claude Code cloud sessions the proxy injects it).
set -euo pipefail
cd "$(dirname "$0")"
export CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-50c7dd7a8d23c2bc2e53d86f0ce6f0cc}"
export CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-placeholder-replaced-by-proxy}"
python3 generators/build_site.py
python3 generators/build_worker.py
npx -y wrangler@4 deploy

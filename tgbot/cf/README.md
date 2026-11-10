# Cloudflare Workers version (free, 24/7)
- worker.js: webhook + 2 cron triggers (*/5), D1 database `fx-analyzer` (tables scan, trades, kv).
- deploy: `BOT_TOKEN=.. WEBHOOK_SECRET=.. ALLOWED_CHAT=.. D1_ID=.. ./deploy.sh fx-analyzer-bot worker.js`
- secrets are Worker secrets, never committed.

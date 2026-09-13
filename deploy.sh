#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "==> AkkarZar.ma deploy (PM2 :3012)"

if [[ ! -d .git ]]; then
  echo "error: run this script from the git checkout of AkkarZar.ma" >&2
  exit 1
fi

git pull --ff-only

if [[ ! -f .env.production ]]; then
  echo "error: missing .env.production in $ROOT" >&2
  exit 1
fi

npm ci
npm run build

export NODE_ENV=production
export PORT=3012

if pm2 describe akkarzar-app >/dev/null 2>&1; then
  pm2 restart akkarzar-app --update-env
else
  pm2 start npm --name akkarzar-app --cwd "$ROOT" -- start -- -p 3012
fi

pm2 save
echo "==> akkarzar-app is listening on 127.0.0.1:3012"

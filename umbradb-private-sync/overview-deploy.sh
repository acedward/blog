#!/bin/sh
# Publishes overview.html as the only page of the Cloudflare Pages project umbradb-private-sync.
# The site is public but unlisted: robots.txt and an X-Robots-Tag header ask search engines not to index it.
# Only three files are uploaded, from a temporary folder: index.html (a copy of overview.html), robots.txt, _headers.
#
#   sh overview-deploy.sh
#
# The project was created once with:
#   npx -y wrangler@4.149.0 pages project create umbradb-private-sync --production-branch main --force
# (run in an empty folder; --force keeps it on classic Pages: without it wrangler deploys the folder it runs in)
set -eu
here=$(cd "$(dirname "$0")" && pwd)
site=$(mktemp -d)
trap 'rm -rf "$site"' EXIT
cp "$here/overview.html" "$site/index.html"
printf 'User-agent: *\nDisallow: /\n' > "$site/robots.txt"
cat > "$site/_headers" <<'EOF'
/*
  X-Robots-Tag: noindex, nofollow
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  X-Frame-Options: DENY
EOF
cd "$site"
npx -y wrangler@4.149.0 pages deploy . --project-name umbradb-private-sync --branch main \
  --commit-message "overview page" --commit-dirty=true

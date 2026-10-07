#!/bin/sh
# いまのブランチを検証環境（Vercel の Preview）にデプロイし、検証用のアドレス www.rufu.dev をそこに向ける。
# Preview は Vercel のログイン保護があるため、チームのメンバーしか見られない。
# rufu.dev は Vercel のドメイン設定で www.rufu.dev に転送されている。
#
#   sh scripts/staging-deploy.sh
#
# 事前に、Vercel のドメイン設定で rufu.dev・www.rufu.dev を本番（Production）から外しておくこと。
# 外していないと、本番のデプロイのたびに本番の内容に向き直ってしまう。
set -eu
cd "$(dirname "$0")/../.."

STAGING_DOMAIN=www.rufu.dev

vercel pull --yes --environment=preview
vercel build
URL=$(vercel deploy --prebuilt --archive=tgz)
echo "検証環境にデプロイしました: $URL"
vercel alias set "$URL" "$STAGING_DOMAIN"
echo "https://$STAGING_DOMAIN を、このデプロイに向けました（Vercel にログインして開いてください）"

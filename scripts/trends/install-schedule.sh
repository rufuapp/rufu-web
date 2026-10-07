#!/bin/sh
# 最新の動向の日次バッチ（pnpm trends:update）を、この Mac で毎朝 7 時に動かすよう登録する。
# Mac がスリープ中だった場合は、起きたときに 1 回動く（launchd の StartCalendarInterval の動き）。
#
#   sh scripts/trends/install-schedule.sh            # 登録する
#   sh scripts/trends/install-schedule.sh uninstall  # 登録を外す
#
# ログ: ~/Library/Logs/fde-trends.log
set -eu

LABEL=dev.rufu.trends
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
WEB_DIR=$(cd "$(dirname "$0")/../.." && pwd)
LOG="$HOME/Library/Logs/fde-trends.log"

if [ "${1:-}" = "uninstall" ]; then
  launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
  rm -f "$PLIST"
  echo "登録を外しました: $LABEL"
  exit 0
fi

# launchd は PATH を引き継がないので、いまの PATH（node・pnpm・git・vercel が入っているもの）を書き込む
cat >"$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/sh</string>
    <string>-c</string>
    <string>cd "$WEB_DIR" &amp;&amp; echo "=== \$(date) ===" &amp;&amp; pnpm trends:update</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key><string>$PATH</string>
  </dict>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key><integer>7</integer>
    <key>Minute</key><integer>0</integer>
  </dict>
  <key>StandardOutPath</key><string>$LOG</string>
  <key>StandardErrorPath</key><string>$LOG</string>
</dict>
</plist>
EOF

launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
echo "登録しました: 毎朝 7 時に $WEB_DIR で pnpm trends:update を動かします"
echo "ログ: $LOG"
echo "今すぐ試すには: launchctl kickstart gui/$(id -u)/$LABEL"

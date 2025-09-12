#!/usr/bin/env bash
set -euo pipefail

PORT=${1:-8080}
echo "Serving repo on http://localhost:$PORT … (Ctrl+C to stop)"
python3 -m http.server "$PORT" >/dev/null 2>&1 &
PID=$!
sleep 1
URL="http://localhost:$PORT/popup-redesign-comparison.html"
echo "Open: $URL"
if command -v open >/dev/null 2>&1; then
  open "$URL"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL"
fi
wait $PID

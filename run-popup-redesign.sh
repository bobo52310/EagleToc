#!/bin/bash

# Popup Redesign multi-version runner
# Usage: ./run-popup-redesign.sh [1|2|3|all|report|stop]

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

declare -A VERS=(
  ["1"]="popup-v1|../smart-toc-popup-v1|popup-redesign-v1|8101"
  ["2"]="popup-v2|../smart-toc-popup-v2|popup-redesign-v2|8102"
  ["3"]="popup-v3|../smart-toc-popup-v3|popup-redesign-v3|8103"
)

print(){ echo -e "$1"; }

serve_version(){
  local key=$1
  IFS='|' read -ra I <<< "${VERS[$key]}"
  local name=${I[0]} dir=${I[1]} branch=${I[2]} port=${I[3]}
  if [ ! -d "$dir" ]; then
    print "${RED}❌ Missing worktree: $dir${NC}"
    exit 1
  fi
  (cd "$dir" && python3 -m http.server "$port")
}

serve_all(){
  print "${BLUE}🚀 Starting all popup redesign servers...${NC}"
  # main host for comparison page
  (python3 -m http.server 8100 > /dev/null 2>&1 &) && echo "Main server at :8100"
  for k in 1 2 3; do
    IFS='|' read -ra I <<< "${VERS[$k]}"
    (cd "${I[1]}" && python3 -m http.server "${I[3]}" > /dev/null 2>&1 &) && echo "v$k at :${I[3]}"
  done
  print "${GREEN}✅ Ready. Open http://localhost:8100/popup-redesign-comparison.html${NC}"
}

stop_all(){
  pkill -f "python3 -m http.server 810" || true
  print "${GREEN}All popup servers stopped${NC}"
}

report(){
  local out="popup-redesign-report.md"
  print "${BLUE}📋 Generating popup redesign report...${NC}"
  cat > "$out" << EOF
# Popup Redesign Comparison Report

Generated: $(date)

## Branches

| Version | Branch | Worktree |
|--------:|--------|----------|
| v1      | popup-redesign-v1 | ../smart-toc-popup-v1 |
| v2      | popup-redesign-v2 | ../smart-toc-popup-v2 |
| v3      | popup-redesign-v3 | ../smart-toc-popup-v3 |

## Recent Commits

### v1
\`\`\`
$(cd ../smart-toc-popup-v1 2>/dev/null && git log --oneline -3 || echo "missing worktree")
\`\`\`

### v2
\`\`\`
$(cd ../smart-toc-popup-v2 2>/dev/null && git log --oneline -3 || echo "missing worktree")
\`\`\`

### v3
\`\`\`
$(cd ../smart-toc-popup-v3 2>/dev/null && git log --oneline -3 || echo "missing worktree")
\`\`\`

## How to Preview

1. Run \`./run-popup-redesign.sh all\`
2. Open http://localhost:8100/popup-redesign-comparison.html
3. Inspect usability, visual quality, and intuitiveness

## Screenshots

Run \`npm run popup:screenshots\` (requires Chrome at /Applications/Google\\ Chrome.app ...). Output:
- screenshots/popup-v1.png
- screenshots/popup-v2.png
- screenshots/popup-v3.png

---
EOF
  print "${GREEN}✅ Report generated: $out${NC}"
}

case "${1:-all}" in
  1|2|3) serve_version "$1" ;;
  all) serve_all ;;
  stop) stop_all ;;
  report) report ;;
  *) print "${YELLOW}Usage:${NC} $0 [1|2|3|all|stop|report]" ;;
esac


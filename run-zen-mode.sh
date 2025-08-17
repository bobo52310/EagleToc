#!/bin/bash

# Smart TOC Zen Mode 啟動腳本
# 啟動增強版: 智能手動滾動與視覺回饋系統

echo "🚀 Smart TOC Zen Mode 增強版測試環境"
echo "=============================================="

# 檢查是否有 Python 或 Node.js 可用於建立簡單的 HTTP 服務器
check_server() {
    if command -v python3 &> /dev/null; then
        echo "使用 Python3 HTTP 服務器"
        SERVER_CMD="python3 -m http.server"
    elif command -v python &> /dev/null; then
        echo "使用 Python2 HTTP 服務器"
        SERVER_CMD="python -m SimpleHTTPServer"
    elif command -v node &> /dev/null && command -v npx &> /dev/null; then
        echo "使用 Node.js HTTP 服務器"
        SERVER_CMD="npx http-server -c-1"
    else
        echo "❌ 錯誤：需要 Python 或 Node.js 來啟動 HTTP 服務器"
        exit 1
    fi
}

# 停止服務器的函數
cleanup() {
    echo ""
    echo "🛑 正在停止服務器..."
    
    if [ -f /tmp/zen_mode_server.pid ]; then
        local pid
        pid=$(cat /tmp/zen_mode_server.pid)
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            echo "   已停止 PID: $pid"
        fi
        rm /tmp/zen_mode_server.pid
    fi
    
    echo "✅ 服務器已停止"
    exit 0
}

# 設置陷阱來捕獲中斷信號
trap cleanup SIGINT SIGTERM

# 檢查服務器類型
check_server

# 清理之前的 PID 文件
rm -f /tmp/zen_mode_server.pid

# 設置目錄
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🌟 啟動 Zen Mode 增強版服務器..."
echo "   目錄: $SCRIPT_DIR"
echo "   測試頁面: zen-mode-enhanced-test.html"

cd "$SCRIPT_DIR" || exit 1

# 啟動服務器
if [[ $SERVER_CMD == *"python"* ]]; then
    $SERVER_CMD 8080 > /dev/null 2>&1 &
else
    $SERVER_CMD -p 8080 > /dev/null 2>&1 &
fi

local_pid=$!
echo "$local_pid" > /tmp/zen_mode_server.pid

# 等待服務器啟動
sleep 2

echo "   ✅ Zen Mode 增強版已啟動: http://localhost:8080/zen-mode-enhanced-test.html"
echo ""

echo "🎉 Zen Mode 增強版已成功啟動！"
echo "=============================================="
echo ""
echo "📖 測試頁面連結："
echo "   ⚡ 增強版: http://localhost:8080/zen-mode-enhanced-test.html"
echo ""
echo "💡 使用說明："
echo "   • 點擊右側 Smart TOC 面板的 Zen Mode 按鈕（全螢幕圖標）"
echo "   • ESC: 退出 Zen Mode"
echo "   • Space: 暫停/繼續播放"
echo "   • ↑↓: 手動滾動控制"
echo "   • 1/2/3: 快速切換速度"
echo "   • S: 開啟/關閉設置面板"
echo "   • T: 快速切換主題"
echo ""
echo "⚡ 增強版特色功能："
echo "   • 修復滾動方向：由上往下的自然閱讀體驗"
echo "   • 平滑手動滾動：300ms 緩出動畫效果"
echo "   • 即時視覺回饋：智能狀態提示 (已移除方向指示器，提供更沉浸的閱讀體驗)"
echo "   • 智能模式切換：自動/手動滾動無縫轉換"
echo "   • 保持原有功能：6種主題、設置面板、快捷鍵"
echo ""
echo "⚠️  注意："
echo "   • 按 Ctrl+C 停止服務器"
echo "   • 確保端口 8080 未被其他程序佔用"
echo ""
echo "🔄 服務器持續運行中... (按 Ctrl+C 停止)"

# 保持腳本運行
while true; do
    sleep 10
    
    # 檢查服務器是否還在運行
    if [ -f /tmp/zen_mode_server.pid ]; then
        local pid
        pid=$(cat /tmp/zen_mode_server.pid)
        if ! kill -0 "$pid" 2>/dev/null; then
            echo "❌ 服務器已停止"
            cleanup
        fi
    else
        echo "❌ 找不到服務器 PID 文件"
        break
    fi
done
#!/bin/bash

# Run All Zen Mode Versions Script
# 同時啟動所有3個版本的 Zen Mode 測試環境

echo "🚀 Smart TOC Zen Mode - 啟動所有版本測試環境"
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

# 啟動服務器的函數
start_server() {
    local version=$1
    local port=$2
    local dir=$3
    local test_file=$4
    
    echo "📂 啟動 $version (端口 $port)"
    echo "   目錄: $dir"
    echo "   測試頁面: $test_file"
    
    cd "$dir"
    
    if [[ $SERVER_CMD == *"python"* ]]; then
        $SERVER_CMD $port > /dev/null 2>&1 &
    else
        $SERVER_CMD -p $port > /dev/null 2>&1 &
    fi
    
    local pid=$!
    echo "   PID: $pid"
    echo $pid >> /tmp/zen_mode_servers.pid
    
    # 等待服務器啟動
    sleep 2
    
    echo "   ✅ $version 已啟動: http://localhost:$port/$test_file"
    echo ""
    
    cd - > /dev/null
}

# 停止所有服務器的函數
cleanup() {
    echo ""
    echo "🛑 正在停止所有服務器..."
    
    if [ -f /tmp/zen_mode_servers.pid ]; then
        while read pid; do
            if kill -0 $pid 2>/dev/null; then
                kill $pid
                echo "   已停止 PID: $pid"
            fi
        done < /tmp/zen_mode_servers.pid
        rm /tmp/zen_mode_servers.pid
    fi
    
    echo "✅ 所有服務器已停止"
    exit 0
}

# 設置陷阱來捕獲中斷信號
trap cleanup SIGINT SIGTERM

# 檢查服務器類型
check_server

# 清理之前的 PID 文件
rm -f /tmp/zen_mode_servers.pid

# 基礎路徑
BASE_DIR="/Users/bobochen/Desktop/github/bobo52310"

echo "🌟 啟動各版本服務器..."
echo ""

# 啟動版本1 - 基礎跑馬燈效果 (端口 8001)
start_server "版本1: 基礎跑馬燈效果" 8001 "$BASE_DIR/zen-v1-basic" "zen-mode-test.html"

# 啟動版本2 - 進階動效和控制功能 (端口 8002)
start_server "版本2: 進階動效和控制功能" 8002 "$BASE_DIR/zen-v2-advanced" "zen-mode-v2-test.html"

# 啟動版本3 - 個性化設置和主題系統 (端口 8003)
start_server "版本3: 個性化設置和主題系統" 8003 "$BASE_DIR/zen-v3-premium" "zen-mode-v3-test.html"

# 啟動比較頁面 (端口 8000)
start_server "比較報告頁面" 8000 "$BASE_DIR/zen-comparison" "index.html"

echo "🎉 所有版本已成功啟動！"
echo "=============================================="
echo ""
echo "📖 測試頁面連結："
echo "   🥉 版本1: http://localhost:8001/zen-mode-test.html"
echo "   🥈 版本2: http://localhost:8002/zen-mode-v2-test.html"
echo "   🥇 版本3: http://localhost:8003/zen-mode-v3-test.html"
echo "   📊 比較報告: http://localhost:8000/index.html"
echo ""
echo "💡 使用說明："
echo "   • 在每個頁面中點擊右側 Smart TOC 面板的 Zen Mode 按鈕"
echo "   • 版本1: ESC 退出"
echo "   • 版本2: Space 暫停/繼續, ↑↓ 手動控制, 1/2/3 切換速度"
echo "   • 版本3: S 鍵開啟設置面板, T 鍵切換主題"
echo ""
echo "⚠️  注意："
echo "   • 所有版本都在背景運行"
echo "   • 按 Ctrl+C 停止所有服務器"
echo "   • 如需個別停止，請使用瀏覽器關閉對應頁面"
echo ""
echo "🔄 服務器持續運行中... (按 Ctrl+C 停止)"

# 保持腳本運行
while true; do
    sleep 10
    
    # 檢查是否還有服務器在運行
    if [ -f /tmp/zen_mode_servers.pid ]; then
        active_servers=0
        while read pid; do
            if kill -0 $pid 2>/dev/null; then
                ((active_servers++))
            fi
        done < /tmp/zen_mode_servers.pid
        
        if [ $active_servers -eq 0 ]; then
            echo "❌ 所有服務器都已停止"
            cleanup
        fi
    else
        echo "❌ 找不到服務器 PID 文件"
        break
    fi
done
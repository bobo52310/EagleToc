#!/bin/bash

# Smart TOC Zen Mode 修復版本啟動腳本
# 同時啟動三個修復版本的測試環境

echo "🚀 Smart TOC Zen Mode 修復版本測試環境"
echo "=============================================="
echo "📦 啟動三個修復版本："
echo "   🔧 版本1: 簡單反轉方案"
echo "   ⚡ 版本2: 增強控制方案" 
echo "   🧠 版本3: 智能適應方案"
echo ""

# 檢查是否有 Python 或 Node.js 可用於建立 HTTP 服務器
check_server() {
    if command -v python3 &> /dev/null; then
        echo "使用 Python3 HTTP 服務器"
        SERVER_CMD="python3 -m http.server"
        PYTHON_VERSION=3
    elif command -v python &> /dev/null; then
        echo "使用 Python2 HTTP 服務器"
        SERVER_CMD="python -m SimpleHTTPServer"
        PYTHON_VERSION=2
    elif command -v node &> /dev/null && command -v npx &> /dev/null; then
        echo "使用 Node.js HTTP 服務器"
        SERVER_CMD="npx http-server -c-1"
        PYTHON_VERSION=0
    else
        echo "❌ 錯誤：需要 Python 或 Node.js 來啟動 HTTP 服務器"
        exit 1
    fi
}

# 停止所有服務器的函數
cleanup() {
    echo ""
    echo "🛑 正在停止所有服務器..."
    
    # 停止版本1服務器
    if [ -f /tmp/zen_fix_v1_server.pid ]; then
        local pid
        pid=$(cat /tmp/zen_fix_v1_server.pid)
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            echo "   ✅ 已停止版本1服務器 (PID: $pid)"
        fi
        rm /tmp/zen_fix_v1_server.pid
    fi
    
    # 停止版本2服務器
    if [ -f /tmp/zen_fix_v2_server.pid ]; then
        local pid
        pid=$(cat /tmp/zen_fix_v2_server.pid)
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            echo "   ✅ 已停止版本2服務器 (PID: $pid)"
        fi
        rm /tmp/zen_fix_v2_server.pid
    fi
    
    # 停止版本3服務器
    if [ -f /tmp/zen_fix_v3_server.pid ]; then
        local pid
        pid=$(cat /tmp/zen_fix_v3_server.pid)
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            echo "   ✅ 已停止版本3服務器 (PID: $pid)"
        fi
        rm /tmp/zen_fix_v3_server.pid
    fi
    
    echo "✅ 所有服務器已停止"
    exit 0
}

# 啟動單個服務器的函數
start_server() {
    local version=$1
    local port=$2
    local dir=$3
    local pid_file=$4
    
    echo "🌟 啟動版本${version}服務器 (端口 ${port})..."
    echo "   目錄: $dir"
    
    cd "$dir" || {
        echo "❌ 錯誤：無法進入目錄 $dir"
        return 1
    }
    
    # 啟動服務器
    if [ $PYTHON_VERSION -eq 3 ] || [ $PYTHON_VERSION -eq 2 ]; then
        $SERVER_CMD $port > /dev/null 2>&1 &
    else
        $SERVER_CMD -p $port > /dev/null 2>&1 &
    fi
    
    local server_pid=$!
    echo "$server_pid" > "$pid_file"
    
    # 等待服務器啟動
    sleep 1
    
    if kill -0 "$server_pid" 2>/dev/null; then
        echo "   ✅ 版本${version}已啟動 (PID: $server_pid)"
        return 0
    else
        echo "   ❌ 版本${version}啟動失敗"
        rm -f "$pid_file"
        return 1
    fi
}

# 設置陷阱來捕獲中斷信號
trap cleanup SIGINT SIGTERM

# 檢查服務器類型
check_server

# 清理之前的 PID 文件
rm -f /tmp/zen_fix_v1_server.pid
rm -f /tmp/zen_fix_v2_server.pid
rm -f /tmp/zen_fix_v3_server.pid

# 設置基礎目錄
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 設定各版本目錄
V1_DIR="${SCRIPT_DIR}/../zen-fix-v1-simple"
V2_DIR="${SCRIPT_DIR}/../zen-fix-v2-enhanced"
V3_DIR="${SCRIPT_DIR}/../zen-fix-v3-smart"

echo ""
echo "📂 檢查版本目錄..."

# 檢查目錄是否存在
if [ ! -d "$V1_DIR" ]; then
    echo "❌ 錯誤：版本1目錄不存在 ($V1_DIR)"
    exit 1
fi

if [ ! -d "$V2_DIR" ]; then
    echo "❌ 錯誤：版本2目錄不存在 ($V2_DIR)"
    exit 1
fi

if [ ! -d "$V3_DIR" ]; then
    echo "❌ 錯誤：版本3目錄不存在 ($V3_DIR)"
    exit 1
fi

echo "   ✅ 所有版本目錄存在"
echo ""

# 啟動各版本服務器
start_server "1" "8081" "$V1_DIR" "/tmp/zen_fix_v1_server.pid"
start_server "2" "8082" "$V2_DIR" "/tmp/zen_fix_v2_server.pid"  
start_server "3" "8083" "$V3_DIR" "/tmp/zen_fix_v3_server.pid"

echo ""
echo "🎉 所有 Zen Mode 修復版本已成功啟動！"
echo "=============================================="
echo ""
echo "📖 測試頁面連結："
echo "   🔧 版本1 (簡單反轉): http://localhost:8081/zen-fix-v1-test.html"
echo "   ⚡ 版本2 (增強控制): http://localhost:8082/zen-fix-v2-test.html"
echo "   🧠 版本3 (智能適應): http://localhost:8083/zen-fix-v3-test.html"
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
echo "🔧 修復對比："
echo "   版本1: 基本方向修復 - 將滾動方向改為由上往下"
echo "   版本2: 增強控制體驗 - 平滑動畫 + 視覺回饋"
echo "   版本3: AI智能適應 - 內容感知 + 閱讀分析"
echo ""
echo "🎯 測試重點："
echo "   ✅ 確認滾動方向為由上往下（所有版本）"
echo "   ✅ 測試↑↓鍵手動滾動功能（所有版本）"
echo "   🌊 體驗平滑動畫效果（版本2&3）"
echo "   👁️ 觀察方向指示器（版本2&3）"
echo "   🧠 感受智能暫停和適應速度（版本3）"
echo "   📊 查看閱讀統計報告（版本3）"
echo ""
echo "⚠️  注意："
echo "   • 按 Ctrl+C 停止所有服務器"
echo "   • 確保端口 8081, 8082, 8083 未被佔用"
echo "   • 建議使用 Chrome 或 Firefox 瀏覽器測試"
echo ""
echo "🔄 服務器持續運行中... (按 Ctrl+C 停止所有服務器)"

# 保持腳本運行並監控服務器狀態
while true; do
    sleep 10
    
    # 檢查所有服務器是否還在運行
    servers_running=0
    
    if [ -f /tmp/zen_fix_v1_server.pid ]; then
        local pid
        pid=$(cat /tmp/zen_fix_v1_server.pid)
        if kill -0 "$pid" 2>/dev/null; then
            ((servers_running++))
        else
            echo "⚠️  版本1服務器已停止"
            rm -f /tmp/zen_fix_v1_server.pid
        fi
    fi
    
    if [ -f /tmp/zen_fix_v2_server.pid ]; then
        local pid
        pid=$(cat /tmp/zen_fix_v2_server.pid)
        if kill -0 "$pid" 2>/dev/null; then
            ((servers_running++))
        else
            echo "⚠️  版本2服務器已停止"
            rm -f /tmp/zen_fix_v2_server.pid
        fi
    fi
    
    if [ -f /tmp/zen_fix_v3_server.pid ]; then
        local pid
        pid=$(cat /tmp/zen_fix_v3_server.pid)
        if kill -0 "$pid" 2>/dev/null; then
            ((servers_running++))
        else
            echo "⚠️  版本3服務器已停止"
            rm -f /tmp/zen_fix_v3_server.pid
        fi
    fi
    
    if [ $servers_running -eq 0 ]; then
        echo "❌ 所有服務器都已停止"
        cleanup
    fi
done
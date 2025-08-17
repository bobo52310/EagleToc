#!/bin/bash

# Smart TOC - 運行所有版本比較腳本
# 此腳本會同時啟動三個版本的測試環境，方便比較功能差異

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 版本資訊
VERSION_A_NAME="版本A（基礎連動）"
VERSION_B_NAME="版本B（進階連動）"  
VERSION_C_NAME="版本C（完整連動）"

# 路徑設定
CURRENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VERSION_A_DIR="${CURRENT_DIR}/../smart-toc-version-a"
VERSION_B_DIR="${CURRENT_DIR}/../smart-toc-version-b"
VERSION_C_DIR="${CURRENT_DIR}/../smart-toc-version-c"

# 端口設定
PORT_A=8080
PORT_B=8081
PORT_C=8082
REPORT_PORT=8083

# 函數：打印彩色訊息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 函數：檢查目錄是否存在
check_directory() {
    local dir=$1
    local name=$2
    if [ ! -d "$dir" ]; then
        print_message $RED "錯誤: $name 目錄不存在: $dir"
        exit 1
    fi
}

# 函數：檢查端口是否被佔用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        print_message $YELLOW "警告: 端口 $port 已被佔用，嘗試終止進程..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# 函數：啟動HTTP伺服器
start_server() {
    local port=$1
    local dir=$2
    local name=$3
    local color=$4
    
    print_message $color "正在啟動 $name (端口: $port)..."
    cd "$dir"
    
    # 檢查Python版本並啟動適當的HTTP伺服器
    if command -v python3 &> /dev/null; then
        python3 -m http.server $port > /dev/null 2>&1 &
    elif command -v python &> /dev/null; then
        python -m SimpleHTTPServer $port > /dev/null 2>&1 &
    else
        print_message $RED "錯誤: 找不到Python，無法啟動HTTP伺服器"
        exit 1
    fi
    
    local server_pid=$!
    echo $server_pid > "/tmp/smart_toc_${port}.pid"
    
    # 等待伺服器啟動
    sleep 2
    print_message $GREEN "✓ $name 已啟動 (PID: $server_pid)"
}

# 函數：創建測試頁面
create_test_page() {
    local port=$1
    local version=$2
    local title=$3
    local color=$4
    
    cat > "/tmp/test_page_${port}.html" << EOF
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart TOC ${title} - 測試頁面</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background: #f8f9fa;
        }
        
        .version-header {
            background: ${color};
            color: white;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .version-header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        
        .version-header p {
            margin: 10px 0 0 0;
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .content-section {
            background: white;
            padding: 30px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        h2 { 
            color: #2c3e50; 
            margin-top: 50px;
            font-size: 1.8em;
            border-bottom: 3px solid ${color};
            padding-bottom: 10px;
        }
        h3 { 
            color: #34495e; 
            margin-top: 40px;
            font-size: 1.4em;
        }
        h4 { 
            color: #7f8c8d; 
            margin-top: 30px;
            font-size: 1.2em;
        }
        
        p { 
            margin-bottom: 20px; 
            font-size: 1.1em;
            text-align: justify;
        }
        
        .feature-list {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .feature-list ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .feature-list li {
            margin: 10px 0;
            font-size: 1.1em;
        }
        
        .demo-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin: 30px 0;
        }
        
        .instructions {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .scroll-content {
            min-height: 150vh;
        }
    </style>
</head>
<body>
    <div class="version-header">
        <h1>Smart TOC ${title}</h1>
        <p>測試 ${version} 的scroll連動功能</p>
    </div>

    <div class="instructions">
        <h3>📋 測試說明</h3>
        <p><strong>請安裝Smart TOC擴展並啟動，然後滾動此頁面測試不同版本的功能差異：</strong></p>
        <ul>
            <li>觀察TOC面板如何響應頁面滾動</li>
            <li>注意active項目的標示和同步效果</li>
            <li>測試不同滾動速度下的反應</li>
            <li>比較各版本的視覺效果和互動體驗</li>
        </ul>
    </div>

    <div class="scroll-content">
EOF

    # 根據版本添加特定內容
    case $version in
        "A")
            cat >> "/tmp/test_page_${port}.html" << EOF
        <div class="content-section">
            <h2>版本A特色：基礎scroll連動</h2>
            <div class="feature-list">
                <h3>✨ 主要功能</h3>
                <ul>
                    <li>防抖動機制（50ms）減少頻繁觸發</li>
                    <li>改進的Intersection Observer設置</li>
                    <li>多階段閾值檢測（0-1.0）</li>
                    <li>智能滾動同步位置計算</li>
                    <li>滾動進度指示器</li>
                    <li>平滑動畫過渡效果</li>
                </ul>
            </div>
            <p>版本A專注於改善基礎的scroll連動體驗，提供穩定可靠的核心功能。通過防抖動機制和精確的位置計算，確保TOC與頁面內容的完美同步。</p>
        </div>

        <div class="content-section">
            <h2>滾動測試區域 1</h2>
            <h3>基礎連動測試</h3>
            <p>這個區域用於測試基本的滾動連動功能。當你滾動到這裡時，TOC應該高亮對應的項目並自動滾動到視野範圍內。</p>
            <h4>子區域 1.1</h4>
            <p>注意觀察TOC中的項目如何平滑地切換active狀態。版本A使用了改進的算法來選擇最佳的活動標題。</p>
            <h4>子區域 1.2</h4>
            <p>進度指示器會顯示當前的閱讀進度，這是版本A的特色功能之一。</p>
        </div>

        <div class="demo-section">
            <h2>✨ 版本A演示</h2>
            <p>請嘗試快速滾動和慢速滾動，感受防抖動機制帶來的穩定體驗。</p>
        </div>
EOF
            ;;
        "B")
            cat >> "/tmp/test_page_${port}.html" << EOF
        <div class="content-section">
            <h2>版本B特色：進階scroll連動</h2>
            <div class="feature-list">
                <h3>🚀 進階功能</h3>
                <ul>
                    <li>滾動速度檢測和自適應邏輯</li>
                    <li>Minimap視覺導航系統</li>
                    <li>智能預覽：顯示上下節內容</li>
                    <li>鍵盤快捷鍵導航（Alt+↑↓, Ctrl+G）</li>
                    <li>閱讀統計和時間追蹤</li>
                    <li>快速滾動模式視覺反饋</li>
                </ul>
            </div>
            <p>版本B在基礎功能上增加了智能化特性，能夠根據用戶的滾動行為自動調整反應方式，並提供豐富的視覺輔助工具。</p>
        </div>

        <div class="content-section">
            <h2>滾動測試區域 1</h2>
            <h3>速度檢測測試</h3>
            <p>嘗試不同的滾動速度，觀察版本B如何智能地調整標題選擇邏輯。快速滾動時會選擇接近螢幕中央的標題，慢速滾動時選擇最上方的標題。</p>
            <h4>Minimap測試</h4>
            <p>右側的minimap提供了整個文檔的視覺概覽，點擊可以快速跳轉。</p>
            <h4>智能預覽</h4>
            <p>底部的預覽面板會顯示上一節和下一節的內容，幫助你了解文檔結構。</p>
        </div>

        <div class="content-section">
            <h2>滾動測試區域 2</h2>
            <h3>鍵盤導航測試</h3>
            <p>使用鍵盤快捷鍵進行導航：</p>
            <ul>
                <li><code>Alt + ↑</code>：上一節</li>
                <li><code>Alt + ↓</code>：下一節</li>
                <li><code>Ctrl + G</code>：跳轉到指定百分比</li>
            </ul>
            <h4>閱讀統計</h4>
            <p>版本B會記錄你在每個章節的停留時間，幫助分析閱讀習慣。</p>
        </div>

        <div class="demo-section">
            <h2>🎯 版本B演示</h2>
            <p>嘗試快速滾動和慢速滾動，觀察不同的標題選擇邏輯。使用鍵盤快捷鍵進行精確導航。</p>
        </div>
EOF
            ;;
        "C")
            cat >> "/tmp/test_page_${port}.html" << EOF
        <div class="content-section">
            <h2>版本C特色：完整scroll連動</h2>
            <div class="feature-list">
                <h3>🧠 AI驅動功能</h3>
                <ul>
                    <li>AI智能預測：多因素分析選擇最佳標題</li>
                    <li>機器學習：記錄閱讀模式並預測下一章節</li>
                    <li>個人化推薦：基於閱讀習慣的智能建議</li>
                    <li>手勢控制：支援觸摸滑動導航</li>
                    <li>語音導航：中文語音命令識別</li>
                    <li>高級動畫：morphing轉換和粒子效果</li>
                    <li>協作功能：分享和註解系統</li>
                    <li>性能優化：智能緩存和虛擬滾動</li>
                </ul>
            </div>
            <p>版本C是最先進的實現，整合了AI、機器學習、手勢控制等前沿技術，提供最智能和個人化的閱讀體驗。</p>
        </div>

        <div class="content-section">
            <h2>滾動測試區域 1</h2>
            <h3>AI預測測試</h3>
            <p>版本C使用AI算法分析你的閱讀行為，會根據位置、可見度、閱讀模式和預測等多個因素來選擇最適合的活動標題。</p>
            <h4>機器學習</h4>
            <p>系統會學習你的閱讀習慣，並預測你接下來可能想要閱讀的章節。</p>
            <h4>個人化推薦</h4>
            <p>基於你的閱讀歷史，系統會推薦相關的章節和內容。</p>
        </div>

        <div class="content-section">
            <h2>滾動測試區域 2</h2>
            <h3>手勢控制測試</h3>
            <p>在觸控設備上，你可以使用以下手勢：</p>
            <ul>
                <li>垂直滑動：上下導航章節</li>
                <li>水平滑動：摺疊/展開或顯示快速操作</li>
            </ul>
            <h4>語音導航</h4>
            <p>點擊語音按鈕，說出命令如"下一節"、"上一節"、"跳到第三節"等。</p>
        </div>

        <div class="content-section">
            <h2>滾動測試區域 3</h2>
            <h3>高級動畫測試</h3>
            <p>當切換活動標題時，注意觀察morphing轉換效果和粒子動畫。</p>
            <h4>協作功能</h4>
            <p>可以生成分享鏈接，與他人協作閱讀和添加註解。</p>
            <h4>性能優化</h4>
            <p>智能緩存和虛擬滾動確保在長文檔中也能保持流暢的性能。</p>
        </div>

        <div class="demo-section">
            <h2>🔮 版本C演示</h2>
            <p>體驗最先進的AI驅動導航。嘗試語音命令、手勢控制，觀察系統如何學習你的閱讀習慣。</p>
        </div>
EOF
            ;;
    esac

    # 添加更多測試內容
    cat >> "/tmp/test_page_${port}.html" << EOF
        <div class="content-section">
            <h2>長內容測試區域</h2>
            <h3>測試章節 A</h3>
            <p>這是一個較長的測試章節，用於測試在長內容中的滾動行為。Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <h4>子章節 A.1</h4>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <h4>子章節 A.2</h4>
            <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
        </div>

        <div class="content-section">
            <h2>測試章節 B</h2>
            <h3>性能測試</h3>
            <p>這個區域用於測試在複雜內容結構中的性能表現。Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
            <h4>子章節 B.1</h4>
            <p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.</p>
            <h4>子章節 B.2</h4>
            <p>Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.</p>
        </div>

        <div class="content-section">
            <h2>測試章節 C</h2>
            <h3>邊界條件測試</h3>
            <p>測試在文檔邊界和特殊情況下的行為。At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.</p>
            <h4>最後的子章節</h4>
            <p>這是最後一個測試區域，用於測試到達文檔末尾時的行為。Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.</p>
        </div>
    </div>

    <script>
        // 添加一些互動功能來輔助測試
        document.addEventListener('DOMContentLoaded', function() {
            // 滾動監聽
            let scrollTimeout;
            window.addEventListener('scroll', function() {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(function() {
                    console.log('滾動位置:', window.pageYOffset);
                    console.log('文檔高度:', document.documentElement.scrollHeight);
                    console.log('視窗高度:', window.innerHeight);
                }, 100);
            });
            
            console.log('${title} 測試頁面已載入');
            console.log('頁面包含', document.querySelectorAll('h1,h2,h3,h4,h5,h6').length, '個標題');
        });
    </script>
</body>
</html>
EOF
}

# 函數：清理資源
cleanup() {
    print_message $YELLOW "正在清理資源..."
    
    # 停止所有HTTP伺服器
    for port in $PORT_A $PORT_B $PORT_C $REPORT_PORT; do
        if [ -f "/tmp/smart_toc_${port}.pid" ]; then
            local pid=$(cat "/tmp/smart_toc_${port}.pid")
            if kill -0 $pid 2>/dev/null; then
                kill $pid 2>/dev/null || true
            fi
            rm -f "/tmp/smart_toc_${port}.pid"
        fi
        
        # 額外檢查端口
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    done
    
    # 清理臨時文件
    rm -f /tmp/test_page_*.html
    rm -f /tmp/smart_toc_*.pid
    
    print_message $GREEN "✓ 清理完成"
}

# 函數：創建比較報告頁面
create_comparison_report() {
    cat > "/tmp/comparison_report.html" << EOF
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart TOC 版本比較報告</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f7fa;
            line-height: 1.6;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            font-size: 3em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.3em;
            opacity: 0.9;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        .version-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }
        
        .version-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.1);
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .version-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 32px rgba(0,0,0,0.15);
        }
        
        .version-header {
            padding: 30px;
            color: white;
            text-align: center;
        }
        
        .version-a .version-header {
            background: linear-gradient(135deg, #007AFF, #5856D6);
        }
        
        .version-b .version-header {
            background: linear-gradient(135deg, #FF6B35, #F7931E);
        }
        
        .version-c .version-header {
            background: linear-gradient(135deg, #34C759, #30D158);
        }
        
        .version-header h2 {
            font-size: 2em;
            margin-bottom: 10px;
        }
        
        .version-content {
            padding: 30px;
        }
        
        .feature-list {
            list-style: none;
            margin: 20px 0;
        }
        
        .feature-list li {
            padding: 8px 0;
            border-bottom: 1px solid #eee;
            position: relative;
            padding-left: 20px;
        }
        
        .feature-list li:before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #34C759;
            font-weight: bold;
        }
        
        .action-buttons {
            margin-top: 20px;
            display: flex;
            gap: 10px;
        }
        
        .btn {
            flex: 1;
            padding: 12px 20px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            text-align: center;
            display: inline-block;
        }
        
        .btn-primary {
            background: #007AFF;
            color: white;
        }
        
        .btn-primary:hover {
            background: #0056b3;
            transform: translateY(-2px);
        }
        
        .comparison-table {
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.1);
            overflow: hidden;
            margin: 40px 0;
        }
        
        .table-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th, td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        th {
            background: #f8f9fa;
            font-weight: 600;
            color: #2c3e50;
        }
        
        .feature-check {
            text-align: center;
            font-size: 1.2em;
        }
        
        .check-yes {
            color: #34C759;
        }
        
        .check-partial {
            color: #FF9500;
        }
        
        .check-no {
            color: #FF3B30;
        }
        
        .instructions {
            background: white;
            border-radius: 16px;
            padding: 30px;
            margin: 40px 0;
            box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
        
        .instructions h3 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 1.5em;
        }
        
        .step {
            display: flex;
            align-items: flex-start;
            margin: 15px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .step-number {
            background: #007AFF;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            font-weight: bold;
            flex-shrink: 0;
        }
        
        .footer {
            text-align: center;
            padding: 40px;
            color: #666;
            border-top: 1px solid #eee;
            margin-top: 60px;
        }
        
        @media (max-width: 768px) {
            .version-grid {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 2em;
            }
            
            .action-buttons {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Smart TOC 版本比較</h1>
        <p>探索三種不同層次的scroll連動實現</p>
    </div>
    
    <div class="container">
        <div class="version-grid">
            <div class="version-card version-a">
                <div class="version-header">
                    <h2>版本 A</h2>
                    <p>基礎連動</p>
                </div>
                <div class="version-content">
                    <ul class="feature-list">
                        <li>防抖動機制</li>
                        <li>改進Intersection Observer</li>
                        <li>滾動進度指示</li>
                        <li>平滑動畫效果</li>
                        <li>多階段閾值檢測</li>
                    </ul>
                    <div class="action-buttons">
                        <a href="http://localhost:${PORT_A}/test.html" class="btn btn-primary" target="_blank">測試版本A</a>
                    </div>
                </div>
            </div>
            
            <div class="version-card version-b">
                <div class="version-header">
                    <h2>版本 B</h2>
                    <p>進階連動</p>
                </div>
                <div class="version-content">
                    <ul class="feature-list">
                        <li>滾動速度檢測</li>
                        <li>Minimap視覺導航</li>
                        <li>智能預覽系統</li>
                        <li>鍵盤快捷鍵</li>
                        <li>閱讀統計追蹤</li>
                    </ul>
                    <div class="action-buttons">
                        <a href="http://localhost:${PORT_B}/test.html" class="btn btn-primary" target="_blank">測試版本B</a>
                    </div>
                </div>
            </div>
            
            <div class="version-card version-c">
                <div class="version-header">
                    <h2>版本 C</h2>
                    <p>完整連動</p>
                </div>
                <div class="version-content">
                    <ul class="feature-list">
                        <li>AI智能預測</li>
                        <li>機器學習系統</li>
                        <li>手勢控制</li>
                        <li>語音導航</li>
                        <li>高級動畫效果</li>
                    </ul>
                    <div class="action-buttons">
                        <a href="http://localhost:${PORT_C}/test.html" class="btn btn-primary" target="_blank">測試版本C</a>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="comparison-table">
            <div class="table-header">
                <h3>📊 功能對比表</h3>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>功能特性</th>
                        <th>版本A</th>
                        <th>版本B</th>
                        <th>版本C</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>基礎scroll連動</td>
                        <td class="feature-check check-yes">✓</td>
                        <td class="feature-check check-yes">✓</td>
                        <td class="feature-check check-yes">✓</td>
                    </tr>
                    <tr>
                        <td>防抖動機制</td>
                        <td class="feature-check check-yes">✓</td>
                        <td class="feature-check check-yes">✓</td>
                        <td class="feature-check check-yes">✓</td>
                    </tr>
                    <tr>
                        <td>進度指示器</td>
                        <td class="feature-check check-yes">✓</td>
                        <td class="feature-check check-yes">✓</td>
                        <td class="feature-check check-yes">✓</td>
                    </tr>
                    <tr>
                        <td>滾動速度檢測</td>
                        <td class="feature-check check-no">✗</td>
                        <td class="feature-check check-yes">✓</td>
                        <td class="feature-check check-yes">✓</td>
                    </tr>
                    <tr>
                        <td>Minimap導航</td>
                        <td class="feature-check check-no">✗</td>
                        <td class="feature-check check-yes">✓</td>
                        <td class="feature-check check-yes">✓</td>
                    </tr>
                    <tr>
                        <td>智能預覽</td>
                        <td class="feature-check check-no">✗</td>
                        <td class="feature-check check-yes">✓</td>
                        <td class="feature-check check-yes">✓</td>
                    </tr>
                    <tr>
                        <td>鍵盤導航</td>
                        <td class="feature-check check-no">✗</td>
                        <td class="feature-check check-yes">✓</td>
                        <td class="feature-check check-yes">✓</td>
                    </tr>
                    <tr>
                        <td>AI智能預測</td>
                        <td class="feature-check check-no">✗</td>
                        <td class="feature-check check-no">✗</td>
                        <td class="feature-check check-yes">✓</td>
                    </tr>
                    <tr>
                        <td>機器學習</td>
                        <td class="feature-check check-no">✗</td>
                        <td class="feature-check check-no">✗</td>
                        <td class="feature-check check-yes">✓</td>
                    </tr>
                    <tr>
                        <td>手勢控制</td>
                        <td class="feature-check check-no">✗</td>
                        <td class="feature-check check-no">✗</td>
                        <td class="feature-check check-yes">✓</td>
                    </tr>
                    <tr>
                        <td>語音導航</td>
                        <td class="feature-check check-no">✗</td>
                        <td class="feature-check check-no">✗</td>
                        <td class="feature-check check-yes">✓</td>
                    </tr>
                    <tr>
                        <td>高級動畫</td>
                        <td class="feature-check check-partial">△</td>
                        <td class="feature-check check-partial">△</td>
                        <td class="feature-check check-yes">✓</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="instructions">
            <h3>🎯 測試指南</h3>
            <div class="step">
                <div class="step-number">1</div>
                <div>
                    <strong>安裝擴展</strong><br>
                    確保Smart TOC Chrome擴展已安裝並啟用
                </div>
            </div>
            <div class="step">
                <div class="step-number">2</div>
                <div>
                    <strong>分別測試</strong><br>
                    點擊上方按鈕分別打開三個版本的測試頁面
                </div>
            </div>
            <div class="step">
                <div class="step-number">3</div>
                <div>
                    <strong>對比體驗</strong><br>
                    在每個頁面中滾動，觀察TOC的反應和視覺效果差異
                </div>
            </div>
            <div class="step">
                <div class="step-number">4</div>
                <div>
                    <strong>功能測試</strong><br>
                    嘗試不同滾動速度、鍵盤快捷鍵等進階功能
                </div>
            </div>
        </div>
    </div>
    
    <div class="footer">
        <p>🚀 Smart TOC 版本比較系統 | 生成時間: $(date)</p>
    </div>
</body>
</html>
EOF
}

# 主執行邏輯
main() {
    print_message $BLUE "🚀 Smart TOC 版本比較系統啟動中..."
    
    # 檢查目錄
    check_directory "$VERSION_A_DIR" "$VERSION_A_NAME"
    check_directory "$VERSION_B_DIR" "$VERSION_B_NAME"
    check_directory "$VERSION_C_DIR" "$VERSION_C_NAME"
    
    # 設置trap處理Ctrl+C
    trap cleanup EXIT INT TERM
    
    # 清理可能存在的舊進程
    cleanup
    
    # 檢查端口
    for port in $PORT_A $PORT_B $PORT_C $REPORT_PORT; do
        check_port $port
    done
    
    print_message $CYAN "正在準備測試環境..."
    
    # 創建測試頁面
    create_test_page $PORT_A "A" "$VERSION_A_NAME" "#007AFF"
    create_test_page $PORT_B "B" "$VERSION_B_NAME" "#FF6B35"
    create_test_page $PORT_C "C" "$VERSION_C_NAME" "#34C759"
    
    # 將測試頁面複製到各版本目錄
    cp "/tmp/test_page_${PORT_A}.html" "${VERSION_A_DIR}/test.html"
    cp "/tmp/test_page_${PORT_B}.html" "${VERSION_B_DIR}/test.html"
    cp "/tmp/test_page_${PORT_C}.html" "${VERSION_C_DIR}/test.html"
    
    # 啟動HTTP伺服器
    start_server $PORT_A "$VERSION_A_DIR" "$VERSION_A_NAME" $GREEN
    start_server $PORT_B "$VERSION_B_DIR" "$VERSION_B_NAME" $YELLOW
    start_server $PORT_C "$VERSION_C_DIR" "$VERSION_C_NAME" $PURPLE
    
    # 創建比較報告
    print_message $CYAN "正在生成比較報告..."
    create_comparison_report
    
    # 啟動報告服務器
    print_message $BLUE "正在啟動比較報告服務器..."
    cd "/tmp"
    if command -v python3 &> /dev/null; then
        python3 -m http.server $REPORT_PORT > /dev/null 2>&1 &
    else
        python -m SimpleHTTPServer $REPORT_PORT > /dev/null 2>&1 &
    fi
    local report_pid=$!
    echo $report_pid > "/tmp/smart_toc_${REPORT_PORT}.pid"
    
    # 等待服務器完全啟動
    sleep 3
    
    print_message $GREEN "✅ 所有服務已啟動完成！"
    echo
    print_message $CYAN "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_message $YELLOW "📋 訪問地址："
    echo
    print_message $GREEN "   🌐 比較報告: http://localhost:${REPORT_PORT}/comparison_report.html"
    echo
    print_message $BLUE "   📄 ${VERSION_A_NAME}: http://localhost:${PORT_A}/test.html"
    print_message $YELLOW "   📄 ${VERSION_B_NAME}: http://localhost:${PORT_B}/test.html"
    print_message $PURPLE "   📄 ${VERSION_C_NAME}: http://localhost:${PORT_C}/test.html"
    echo
    print_message $CYAN "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo
    print_message $YELLOW "💡 使用說明："
    print_message $NC "   1. 首先訪問比較報告頁面獲得完整概覽"
    print_message $NC "   2. 確保Smart TOC擴展已安裝並啟用"
    print_message $NC "   3. 分別在三個測試頁面中測試滾動效果"
    print_message $NC "   4. 觀察各版本的功能差異和視覺效果"
    print_message $NC "   5. 按 Ctrl+C 停止所有服務"
    echo
    
    # 自動打開瀏覽器（如果可能）
    if command -v open &> /dev/null; then
        print_message $GREEN "🚀 正在打開比較報告..."
        open "http://localhost:${REPORT_PORT}/comparison_report.html"
    elif command -v xdg-open &> /dev/null; then
        print_message $GREEN "🚀 正在打開比較報告..."
        xdg-open "http://localhost:${REPORT_PORT}/comparison_report.html"
    fi
    
    # 等待用戶中斷
    print_message $GREEN "✨ 服務運行中... (按 Ctrl+C 停止)"
    
    while true; do
        sleep 1
    done
}

# 執行主程序
main "$@"
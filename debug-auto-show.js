// 自動顯示功能調試腳本
// 在瀏覽器開發者工具的 Console 中運行此腳本來診斷問題

console.log('🔍 Smart TOC 自動顯示功能診斷開始...');

function debugAutoShow() {
    // 檢查 Smart TOC 是否存在
    if (typeof window.smartTOC === 'undefined') {
        console.log('❌ Smart TOC 未載入！請檢查擴展是否正確安裝和啟用。');
        return;
    }
    
    const toc = window.smartTOC;
    console.log('✅ Smart TOC 實例找到:', toc);
    
    // 檢查設置
    console.log('\n📋 當前設置:');
    console.log('- autoShow:', toc.settings.autoShow);
    console.log('- autoShowMinHeadings:', toc.settings.autoShowMinHeadings);
    console.log('- autoShowDelay:', toc.settings.autoShowDelay + 'ms');
    
    // 檢查標題
    const headingCount = toc.headings ? toc.headings.length : 0;
    console.log('\n📝 標題檢查:');
    console.log('- 找到的標題數量:', headingCount);
    console.log('- 最少需要標題數:', toc.settings.autoShowMinHeadings);
    
    if (headingCount >= toc.settings.autoShowMinHeadings) {
        console.log('✅ 標題數量符合要求');
    } else {
        console.log('❌ 標題數量不足，無法自動顯示');
    }
    
    // 檢查域名黑名單
    const currentDomain = window.location.hostname;
    const disabledDomains = toc.getAutoShowDisabledDomains();
    console.log('\n🌐 域名檢查:');
    console.log('- 當前域名:', currentDomain);
    console.log('- 被禁用的域名:', disabledDomains);
    
    const isDomainDisabled = disabledDomains.includes(currentDomain);
    if (isDomainDisabled) {
        console.log('❌ 當前域名已被禁用自動顯示');
        console.log('💡 解決方案: 到擴展設置中清除被禁用的域名，或刪除此域名');
    } else {
        console.log('✅ 當前域名未被禁用');
    }
    
    // 檢查 TOC 面板狀態
    console.log('\n👁️ TOC 面板狀態:');
    console.log('- isVisible:', toc.isVisible);
    const panel = document.querySelector('.smart-toc-panel');
    if (panel) {
        console.log('- DOM 元素存在:', !!panel);
        console.log('- CSS visible 類:', panel.classList.contains('smart-toc-visible'));
    } else {
        console.log('- DOM 元素不存在');
    }
    
    // 綜合判斷
    console.log('\n📊 自動顯示條件檢查:');
    const conditions = {
        'autoShow 啟用': toc.settings.autoShow,
        '標題數量足夠': headingCount >= toc.settings.autoShowMinHeadings,
        '域名未被禁用': !isDomainDisabled,
        'TOC 未顯示': !toc.isVisible
    };
    
    Object.entries(conditions).forEach(([condition, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${condition}: ${passed}`);
    });
    
    const allConditionsMet = Object.values(conditions).every(Boolean);
    
    console.log('\n🎯 診斷結果:');
    if (allConditionsMet) {
        console.log('✅ 所有條件都滿足！自動顯示應該會運行。');
        console.log(`⏱️ 請等待 ${toc.settings.autoShowDelay}ms 後查看結果。`);
        
        // 手動觸發自動顯示測試
        console.log('\n🧪 手動觸發測試...');
        setTimeout(() => {
            if (toc.shouldAutoShow()) {
                console.log('✅ shouldAutoShow() 返回 true');
                toc.show();
                toc.showAutoDisplayNotification();
                console.log('✅ 手動觸發成功！');
            } else {
                console.log('❌ shouldAutoShow() 返回 false');
            }
        }, 100);
        
    } else {
        console.log('❌ 部分條件未滿足，自動顯示不會運行。');
        
        console.log('\n🔧 解決建議:');
        if (!toc.settings.autoShow) {
            console.log('- 到擴展設置中啟用 "Auto-show TOC"');
        }
        if (headingCount < toc.settings.autoShowMinHeadings) {
            console.log(`- 頁面需要至少 ${toc.settings.autoShowMinHeadings} 個標題，當前只有 ${headingCount} 個`);
            console.log('- 可以降低 "Minimum headings" 設置');
        }
        if (isDomainDisabled) {
            console.log('- 到擴展設置中清除此域名的禁用狀態');
        }
        if (toc.isVisible) {
            console.log('- TOC 已經顯示，無需自動顯示');
        }
    }
}

// 延遲執行以確保頁面完全載入
setTimeout(debugAutoShow, 1000);

// 也提供即時執行的函數
window.debugAutoShow = debugAutoShow;
console.log('\n💡 如需重新診斷，請運行: debugAutoShow()');
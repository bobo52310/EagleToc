// 測試去重功能的腳本
// 在瀏覽器開發者工具中運行

console.log('=== Smart TOC 去重功能測試 ===');

// 等待頁面完全載入
setTimeout(() => {
    // 檢查頁面中所有的標題元素
    const allH1 = Array.from(document.querySelectorAll('h1'));
    const allH2 = Array.from(document.querySelectorAll('h2'));
    const allH3 = Array.from(document.querySelectorAll('h3'));
    
    console.log('\n📊 頁面標題統計:');
    console.log(`H1 標題: ${allH1.length} 個`);
    console.log(`H2 標題: ${allH2.length} 個`);  
    console.log(`H3 標題: ${allH3.length} 個`);
    
    // 顯示所有 H1 標題及其容器
    console.log('\n📝 H1 標題詳情:');
    allH1.forEach((h1, index) => {
        const text = h1.textContent.trim();
        const containers = [];
        
        // 檢查標題所在的容器
        if (h1.closest('.main-content')) containers.push('main-content');
        if (h1.closest('#content')) containers.push('#content');
        if (h1.closest('article')) containers.push('article');
        if (h1.closest('main')) containers.push('main');
        
        console.log(`  ${index + 1}. "${text}" (容器: ${containers.join(', ') || '無特定容器'})`);
    });
    
    // 檢查 Smart TOC 是否已載入
    if (typeof window.smartTOC === 'undefined') {
        console.log('\n❌ Smart TOC 尚未載入，請稍後再試');
        return;
    }
    
    // 等待 Smart TOC 完成初始化
    setTimeout(() => {
        const toc = window.smartTOC;
        
        if (!toc.headings || toc.headings.length === 0) {
            console.log('\n❌ Smart TOC 尚未找到標題，請稍後再試');
            return;
        }
        
        const tocH1 = toc.headings.filter(h => h.level === 1);
        const tocH2 = toc.headings.filter(h => h.level === 2);
        const tocH3 = toc.headings.filter(h => h.level === 3);
        
        console.log('\n📊 Smart TOC 標題統計:');
        console.log(`H1 標題: ${tocH1.length} 個`);
        console.log(`H2 標題: ${tocH2.length} 個`);
        console.log(`H3 標題: ${tocH3.length} 個`);
        
        console.log('\n📝 TOC 中的 H1 標題:');
        tocH1.forEach((h1, index) => {
            console.log(`  ${index + 1}. "${h1.text}"`);
        });
        
        // 去重測試結果
        console.log('\n🧪 去重測試結果:');
        
        if (tocH1.length < allH1.length) {
            console.log(`✅ H1 去重成功！頁面有 ${allH1.length} 個 H1，TOC 中有 ${tocH1.length} 個`);
        } else if (tocH1.length === allH1.length) {
            console.log(`⚠️  H1 數量相同（${allH1.length} 個），可能沒有重複或去重未生效`);
        } else {
            console.log(`❌ H1 數量異常！TOC 中有 ${tocH1.length} 個，但頁面只有 ${allH1.length} 個`);
        }
        
        // 檢查是否有重複文本
        const h1Texts = tocH1.map(h => h.text);
        const uniqueH1Texts = [...new Set(h1Texts)];
        
        if (h1Texts.length === uniqueH1Texts.length) {
            console.log('✅ 沒有發現重複的 H1 文本內容');
        } else {
            console.log(`❌ 發現重複的 H1 文本！總共 ${h1Texts.length} 個，唯一 ${uniqueH1Texts.length} 個`);
            
            // 找出重複的項目
            const duplicates = h1Texts.filter((text, index) => h1Texts.indexOf(text) !== index);
            console.log('重複的文本:', [...new Set(duplicates)]);
        }
        
        console.log('\n=== 測試完成 ===');
        
    }, 1000);
    
}, 500);
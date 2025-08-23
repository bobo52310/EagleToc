chrome.runtime.onInstalled.addListener(() => {
  console.log('EagleToc extension installed with eagle precision!');
});

chrome.action.onClicked.addListener(async (tab) => {
  console.log('Extension icon clicked, sending message to tab:', tab.id);
  
  try {
    // First try to send message
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'toggle-toc' });
    console.log('Message sent successfully, response:', response);
  } catch (error) {
    console.log('Content script not found, injecting scripts...');
    
    try {
      // Inject CSS first
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['content/content.css']
      });
      
      // Then inject JS
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content/content.js']
      });
      
      // Wait a bit for initialization
      setTimeout(async () => {
        try {
          const response = await chrome.tabs.sendMessage(tab.id, { action: 'toggle-toc' });
          console.log('Message sent after injection, response:', response);
        } catch (retryError) {
          console.error('Still failed after injection:', retryError);
        }
      }, 500);
      
    } catch (injectionError) {
      console.error('Failed to inject scripts:', injectionError);
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'get-settings') {
    chrome.storage.sync.get(null, (result) => {
      if (chrome.runtime.lastError) {
        console.error('❌ Failed to load settings:', chrome.runtime.lastError);
        sendResponse({ error: chrome.runtime.lastError.message });
      } else {
        console.log('✅ Settings loaded successfully from chrome.storage');
        sendResponse(result);
      }
    });
    return true;
  }
  
  if (request.action === 'save-settings') {
    // 分離白名單和其他設定以避免超過儲存限制
    const { autoShowWhitelist, ...otherSettings } = request.settings;
    
    // 檢查資料大小
    const settingsSize = JSON.stringify(otherSettings).length;
    const whitelistSize = JSON.stringify(autoShowWhitelist || []).length;
    
    console.log('📊 Storage size check - Settings:', settingsSize, 'bytes, Whitelist:', whitelistSize, 'bytes');
    
    // Chrome storage.sync 限制：單項 8KB，總計 100KB
    if (settingsSize > 7000 || whitelistSize > 7000) {
      console.error('❌ Data too large for chrome.storage.sync');
      sendResponse({ 
        success: false, 
        error: 'Data size exceeds storage limits',
        details: { settingsSize, whitelistSize, limit: 8192 }
      });
      return true;
    }
    
    // 使用批次儲存來確保原子性
    const dataToStore = {
      ...otherSettings
    };
    
    // 如果有白名單，分別儲存
    if (autoShowWhitelist) {
      dataToStore.autoShowWhitelist = autoShowWhitelist;
    }
    
    chrome.storage.sync.set(dataToStore, () => {
      if (chrome.runtime.lastError) {
        console.error('❌ Failed to save settings:', chrome.runtime.lastError);
        sendResponse({ 
          success: false, 
          error: chrome.runtime.lastError.message,
          details: { settingsSize, whitelistSize }
        });
      } else {
        console.log('✅ Settings saved successfully to chrome.storage');
        sendResponse({ success: true });
      }
    });
    return true;
  }
  
  // 新增專門的白名單儲存處理
  if (request.action === 'save-whitelist') {
    const whitelistSize = JSON.stringify(request.whitelist).length;
    
    if (whitelistSize > 7000) {
      console.error('❌ Whitelist too large for chrome.storage.sync');
      sendResponse({ 
        success: false, 
        error: 'Whitelist size exceeds storage limits',
        size: whitelistSize,
        limit: 8192
      });
      return true;
    }
    
    chrome.storage.sync.set({ autoShowWhitelist: request.whitelist }, () => {
      if (chrome.runtime.lastError) {
        console.error('❌ Failed to save whitelist:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        console.log('✅ Whitelist saved successfully to chrome.storage');
        sendResponse({ success: true });
      }
    });
    return true;
  }
});
chrome.runtime.onInstalled.addListener(() => {
  console.log('Smart TOC extension installed');
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
      sendResponse(result);
    });
    return true;
  }
  
  if (request.action === 'save-settings') {
    chrome.storage.sync.set(request.settings, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
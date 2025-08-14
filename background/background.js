chrome.runtime.onInstalled.addListener(() => {
  console.log('Smart TOC extension installed');
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: 'toggle-toc' });
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
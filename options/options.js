// Allow running outside extension context (comparison/demo)
const isExtensionEnv = typeof chrome !== 'undefined' && chrome?.storage?.sync;
if (!isExtensionEnv) {
  window.chrome = window.chrome || {};
  if (!chrome.storage) {
    chrome.storage = { sync: { get: (defaults, cb) => cb(defaults), set: (_s, cb) => cb && cb() } };
  }
  if (!chrome.tabs) {
    chrome.tabs = { query: (_q, cb) => cb([{ id: 0, url: location.href }]), sendMessage: (_id, _msg, cb) => cb && cb({}) };
  }
}

document.addEventListener('DOMContentLoaded', loadSettings);

const defaultSettings = {
  enableLocalFiles: false,
  autoShow: false,
  autoShowMinHeadings: 2,
  autoShowDelay: 500,
  maxHeadingLevels: 3,
  tocPosition: 'right',
  tocWidth: 300,
  fontSize: 16,
  highlightDuration: 5
};

function loadSettings() {
  chrome.storage.sync.get(defaultSettings, (settings) => {
    document.getElementById('enableLocalFiles').checked = settings.enableLocalFiles;
    document.getElementById('autoShow').checked = settings.autoShow;
    document.getElementById('autoShowMinHeadings').value = settings.autoShowMinHeadings;
    document.getElementById('autoShowDelay').value = settings.autoShowDelay;
    document.getElementById('maxHeadingLevels').value = settings.maxHeadingLevels;
    document.getElementById('tocPosition').value = settings.tocPosition;
    document.getElementById('tocWidth').value = settings.tocWidth;
    document.getElementById('tocWidthValue').textContent = settings.tocWidth + 'px';
    document.getElementById('fontSize').value = settings.fontSize;
    document.getElementById('fontSizeValue').textContent = settings.fontSize + 'px';
    document.getElementById('highlightDuration').value = settings.highlightDuration;
    document.getElementById('highlightDurationValue').textContent = settings.highlightDuration + 's';
    
    // 根據 autoShow 狀態更新相關選項的可見性
    updateAutoShowOptionsVisibility(settings.autoShow);
  });
  
  // 載入被禁用的域名列表
  loadDisabledDomains();

  setupEventListeners();
}

function setupEventListeners() {
  // Keep quick toggles in sync with main controls (if present)
  const qAuto = document.getElementById('autoShow_quick');
  const qLocal = document.getElementById('enableLocalFiles_quick');
  if (qAuto) {
    const mainAuto = document.getElementById('autoShow');
    qAuto.addEventListener('change', () => { mainAuto.checked = qAuto.checked; updateAutoShowOptionsVisibility(qAuto.checked); });
    mainAuto.addEventListener('change', () => { qAuto.checked = mainAuto.checked; });
  }
  if (qLocal) {
    const mainLocal = document.getElementById('enableLocalFiles');
    qLocal.addEventListener('change', () => { mainLocal.checked = qLocal.checked; });
    mainLocal.addEventListener('change', () => { qLocal.checked = mainLocal.checked; });
  }
  document.getElementById('tocWidth').addEventListener('input', (e) => {
    document.getElementById('tocWidthValue').textContent = e.target.value + 'px';
  });

  document.getElementById('fontSize').addEventListener('input', (e) => {
    document.getElementById('fontSizeValue').textContent = e.target.value + 'px';
  });

  document.getElementById('highlightDuration').addEventListener('input', (e) => {
    document.getElementById('highlightDurationValue').textContent = e.target.value + 's';
  });

  // Auto-show 複選框事件
  document.getElementById('autoShow').addEventListener('change', (e) => {
    updateAutoShowOptionsVisibility(e.target.checked);
  });

  // 清除禁用域名按鈕
  document.getElementById('clearDisabledDomains').addEventListener('click', clearDisabledDomains);

  document.getElementById('saveSettings').addEventListener('click', saveSettings);
  document.getElementById('resetSettings').addEventListener('click', resetSettings);
}

function saveSettings() {
  const settings = {
    enableLocalFiles: document.getElementById('enableLocalFiles').checked,
    autoShow: document.getElementById('autoShow').checked,
    autoShowMinHeadings: parseInt(document.getElementById('autoShowMinHeadings').value),
    autoShowDelay: parseInt(document.getElementById('autoShowDelay').value),
    maxHeadingLevels: parseInt(document.getElementById('maxHeadingLevels').value),
    tocPosition: document.getElementById('tocPosition').value,
    tocWidth: parseInt(document.getElementById('tocWidth').value),
    fontSize: parseInt(document.getElementById('fontSize').value),
    highlightDuration: parseInt(document.getElementById('highlightDuration').value)
  };

  chrome.storage.sync.set(settings, () => {
    showStatus('Settings saved successfully!', 'success');
    
    if (settings.enableLocalFiles) {
      showLocalFilePermissionInfo();
    }
  });
}

function resetSettings() {
  if (confirm('Are you sure you want to reset all settings to their default values?')) {
    chrome.storage.sync.set(defaultSettings, () => {
      loadSettings();
      showStatus('Settings reset to defaults', 'success');
    });
  }
}

function showStatus(message, type) {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;
  
  setTimeout(() => {
    statusEl.className = 'status-message';
  }, 3000);
}

function showLocalFilePermissionInfo() {
  const message = 'To enable local files, you may need to allow "file://" access in Chrome extensions settings.';
  showStatus(message, 'success');
}

function updateAutoShowOptionsVisibility(enabled) {
  const autoShowOptions = document.querySelectorAll('.auto-show-options');
  autoShowOptions.forEach(option => {
    if (enabled) {
      option.classList.add('enabled');
    } else {
      option.classList.remove('enabled');
    }
  });
}

function loadDisabledDomains() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'get-disabled-domains' }, (response) => {
        if (response && response.disabledDomains) {
          displayDisabledDomains(response.disabledDomains);
        } else {
          // 如果無法從內容腳本獲取，嘗試從 localStorage
          displayDisabledDomains([]);
        }
      });
    }
  });
}

function displayDisabledDomains(domains) {
  const listContainer = document.getElementById('disabledDomainsList');
  const clearButton = document.getElementById('clearDisabledDomains');
  
  listContainer.innerHTML = '';
  
  if (domains.length === 0) {
    clearButton.disabled = true;
    return;
  }
  
  clearButton.disabled = false;
  
  domains.forEach(domain => {
    const domainItem = document.createElement('div');
    domainItem.className = 'domain-item';
    
    domainItem.innerHTML = `
      <span class="domain-name">${domain}</span>
      <button class="remove-domain" data-domain="${domain}">Remove</button>
    `;
    
    // 為移除按鈕添加事件監聽器
    const removeButton = domainItem.querySelector('.remove-domain');
    removeButton.addEventListener('click', () => {
      removeDomain(domain);
    });
    
    listContainer.appendChild(domainItem);
  });
}

function removeDomain(domain) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: 'remove-disabled-domain', 
        domain: domain 
      }, (response) => {
        if (response && response.success) {
          loadDisabledDomains(); // 重新載入列表
          showStatus(`Removed ${domain} from disabled list`, 'success');
        }
      });
    }
  });
}

function clearDisabledDomains() {
  if (confirm('Are you sure you want to clear all disabled domains? Auto-show will work on these sites again.')) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'clear-disabled-domains' }, (response) => {
          if (response && response.success) {
            loadDisabledDomains(); // 重新載入列表
            showStatus('All disabled domains cleared', 'success');
          }
        });
      }
    });
  }
}

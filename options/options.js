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

document.addEventListener('DOMContentLoaded', () => {
  try { localizePage(); } catch {}
  // Set document title via i18n if available
  try { document.title = getMessage('optionsPageTitle', document.title); } catch {}
  loadSettings();
});

const defaultSettings = {
  enableLocalFiles: false,
  autoShow: false,
  autoShowMinHeadings: 2,
  autoShowDelay: 500,
  maxHeadingLevels: 3,
  tocPosition: 'right',
  tocWidth: 300,
  fontSize: 16,
  highlightDuration: 5,
  // Extended defaults for lists and floating persistence
  autoShowWhitelist: [
    'wikipedia.org',
    '*.wikipedia.org',
    'github.com',
    '*.github.com',
    'developer.mozilla.org',
    'docs.microsoft.com',
    'developer.apple.com',
    'nodejs.org',
    'reactjs.org',
    'vuejs.org'
  ],
  excludedDomains: [],
  tocTop: null,
  tocLeft: null
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

    // Render whitelist/excluded lists
    displayWhitelist(settings.autoShowWhitelist || []);
    displayExcluded(settings.excludedDomains || []);
  });
  
  // 載入被禁用的域名列表
  // Legacy section (kept for compatibility). New lists render from storage above.
  // loadDisabledDomains();

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

  // Position reset
  const resetPosBtn = document.getElementById('resetPosition');
  if (resetPosBtn) resetPosBtn.addEventListener('click', resetPosition);

  // Whitelist actions
  const wlAddBtn = document.getElementById('addWhitelist');
  const wlAddCurBtn = document.getElementById('addCurrentToWhitelist');
  const wlInput = document.getElementById('whitelistInput');
  const wlReset = document.getElementById('resetWhitelist');
  if (wlAddBtn) wlAddBtn.addEventListener('click', addWhitelistFromInput);
  if (wlAddCurBtn) wlAddCurBtn.addEventListener('click', addCurrentToWhitelist);
  if (wlInput) wlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addWhitelistFromInput(); });
  if (wlReset) wlReset.addEventListener('click', resetWhitelistToDefaults);

  // Excluded actions
  const exAddBtn = document.getElementById('addExcluded');
  const exAddCurBtn = document.getElementById('addCurrentToExcluded');
  const exInput = document.getElementById('excludedInput');
  const exClear = document.getElementById('clearExcluded');
  if (exAddBtn) exAddBtn.addEventListener('click', addExcludedFromInput);
  if (exAddCurBtn) exAddCurBtn.addEventListener('click', addCurrentToExcluded);
  if (exInput) exInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addExcludedFromInput(); });
  if (exClear) exClear.addEventListener('click', clearExcluded);
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
  // allow i18n key passthrough
  const localized = getMessage(message, message);
  statusEl.textContent = localized;
  statusEl.className = `status-message ${type}`;
  
  setTimeout(() => {
    statusEl.className = 'status-message';
  }, 3000);
}

function showLocalFilePermissionInfo() {
  const msg = 'To enable local files, you may need to allow "file://" access in Chrome extensions settings.';
  showStatus(msg, 'success');
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

// ===== i18n helpers =====
function hasI18n() {
  return typeof chrome !== 'undefined' && chrome.i18n && typeof chrome.i18n.getMessage === 'function';
}

function getMessage(key, fallback = '') {
  if (hasI18n()) {
    const msg = chrome.i18n.getMessage(key);
    return msg || fallback || key;
  }
  return fallback || key;
}

function localizePage() {
  // text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = getMessage(key, el.textContent);
  });
  // placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) el.setAttribute('placeholder', getMessage(key, el.getAttribute('placeholder') || ''));
  });
  // titles
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (key) el.setAttribute('title', getMessage(key, el.getAttribute('title') || ''));
  });
}

// =========== New: Whitelist/Excluded helpers ===========
function normalizeDomain(input) {
  if (!input) return '';
  try {
    let d = input.trim().toLowerCase();
    d = d.replace(/^https?:\/\//, '');
    d = d.replace(/\/.*/, '');
    return d;
  } catch { return ''; }
}

function displayWhitelist(list) {
  const container = document.getElementById('whitelistList');
  if (!container) return;
  container.innerHTML = '';
  list.forEach((domain) => {
    const item = document.createElement('div');
    item.className = 'domain-item';
    const removeText = getMessage('remove', 'Remove');
    item.innerHTML = `
      <span class="domain-name">${domain}</span>
      <button class="remove-domain" data-domain="${domain}">${removeText}</button>
    `;
    item.querySelector('.remove-domain').addEventListener('click', () => removeWhitelistDomain(domain));
    container.appendChild(item);
  });
}

function displayExcluded(list) {
  const container = document.getElementById('excludedList');
  if (!container) return;
  container.innerHTML = '';
  list.forEach((domain) => {
    const item = document.createElement('div');
    item.className = 'domain-item';
    const removeText = getMessage('remove', 'Remove');
    item.innerHTML = `
      <span class="domain-name">${domain}</span>
      <button class="remove-domain" data-domain="${domain}">${removeText}</button>
    `;
    item.querySelector('.remove-domain').addEventListener('click', () => removeExcludedDomain(domain));
    container.appendChild(item);
  });
}

function addWhitelistFromInput() {
  const input = document.getElementById('whitelistInput');
  const raw = input?.value || '';
  const domain = normalizeDomain(raw);
  if (!domain) return;
  chrome.storage.sync.get(defaultSettings, (settings) => {
    const list = settings.autoShowWhitelist || [];
    if (list.includes(domain)) return;
    list.push(domain);
    chrome.storage.sync.set({ autoShowWhitelist: list }, () => {
      displayWhitelist(list);
      input.value = '';
      showStatus(`Added ${domain} to whitelist`, 'success');
    });
  });
}

function addCurrentToWhitelist() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs?.[0]?.url || '';
    const domain = normalizeDomain(url);
    if (!domain) return;
    chrome.storage.sync.get(defaultSettings, (settings) => {
      const list = settings.autoShowWhitelist || [];
      if (!list.includes(domain)) list.push(domain);
      chrome.storage.sync.set({ autoShowWhitelist: list }, () => {
        displayWhitelist(list);
        showStatus(`Added ${domain} to whitelist`, 'success');
      });
    });
  });
}

function removeWhitelistDomain(domain) {
  chrome.storage.sync.get(defaultSettings, (settings) => {
    const list = (settings.autoShowWhitelist || []).filter(d => d !== domain);
    chrome.storage.sync.set({ autoShowWhitelist: list }, () => {
      displayWhitelist(list);
      showStatus(`Removed ${domain} from whitelist`, 'success');
    });
  });
}

function resetWhitelistToDefaults() {
  if (!confirm('Reset whitelist to defaults?')) return;
  const list = defaultSettings.autoShowWhitelist.slice();
  chrome.storage.sync.set({ autoShowWhitelist: list }, () => {
    displayWhitelist(list);
    showStatus('Whitelist reset to defaults', 'success');
  });
}

function addExcludedFromInput() {
  const input = document.getElementById('excludedInput');
  const raw = input?.value || '';
  const domain = normalizeDomain(raw);
  if (!domain) return;
  chrome.storage.sync.get(defaultSettings, (settings) => {
    const list = settings.excludedDomains || [];
    if (list.includes(domain)) return;
    list.push(domain);
    chrome.storage.sync.set({ excludedDomains: list }, () => {
      displayExcluded(list);
      input.value = '';
      showStatus(`Added ${domain} to hidden list`, 'success');
    });
  });
}

function addCurrentToExcluded() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs?.[0]?.url || '';
    const domain = normalizeDomain(url);
    if (!domain) return;
    chrome.storage.sync.get(defaultSettings, (settings) => {
      const list = settings.excludedDomains || [];
      if (!list.includes(domain)) list.push(domain);
      chrome.storage.sync.set({ excludedDomains: list }, () => {
        displayExcluded(list);
        showStatus(`Hidden on ${domain}`, 'success');
      });
    });
  });
}

function removeExcludedDomain(domain) {
  chrome.storage.sync.get(defaultSettings, (settings) => {
    const list = (settings.excludedDomains || []).filter(d => d !== domain);
    chrome.storage.sync.set({ excludedDomains: list }, () => {
      displayExcluded(list);
      showStatus(`Removed ${domain} from hidden list`, 'success');
    });
  });
}

function clearExcluded() {
  if (!confirm('Clear all hidden domains?')) return;
  chrome.storage.sync.set({ excludedDomains: [] }, () => {
    displayExcluded([]);
    showStatus('Hidden list cleared', 'success');
  });
}

function resetPosition() {
  chrome.storage.sync.set({ tocTop: null, tocLeft: null }, () => {
    showStatus('Position reset. Reopen page to apply.', 'success');
  });
}

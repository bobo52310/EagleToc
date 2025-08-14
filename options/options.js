document.addEventListener('DOMContentLoaded', loadSettings);

const defaultSettings = {
  enableLocalFiles: false,
  autoShow: false,
  maxHeadingLevels: 3,
  tocPosition: 'right',
  tocWidth: 300
};

function loadSettings() {
  chrome.storage.sync.get(defaultSettings, (settings) => {
    document.getElementById('enableLocalFiles').checked = settings.enableLocalFiles;
    document.getElementById('autoShow').checked = settings.autoShow;
    document.getElementById('maxHeadingLevels').value = settings.maxHeadingLevels;
    document.getElementById('tocPosition').value = settings.tocPosition;
    document.getElementById('tocWidth').value = settings.tocWidth;
    document.getElementById('tocWidthValue').textContent = settings.tocWidth + 'px';
  });

  setupEventListeners();
}

function setupEventListeners() {
  document.getElementById('tocWidth').addEventListener('input', (e) => {
    document.getElementById('tocWidthValue').textContent = e.target.value + 'px';
  });

  document.getElementById('saveSettings').addEventListener('click', saveSettings);
  document.getElementById('resetSettings').addEventListener('click', resetSettings);
}

function saveSettings() {
  const settings = {
    enableLocalFiles: document.getElementById('enableLocalFiles').checked,
    autoShow: document.getElementById('autoShow').checked,
    maxHeadingLevels: parseInt(document.getElementById('maxHeadingLevels').value),
    tocPosition: document.getElementById('tocPosition').value,
    tocWidth: parseInt(document.getElementById('tocWidth').value)
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
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggle-toc');
  const settingsBtn = document.getElementById('settings-btn');
  const helpBtn = document.getElementById('help-btn');

  toggleBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { action: 'toggle-toc' }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('TOC script not loaded on this page');
      }
    });
    
    window.close();
  });

  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });

  helpBtn.addEventListener('click', () => {
    chrome.tabs.create({
      url: 'https://github.com/your-username/smart-toc#usage'
    });
    window.close();
  });

  updateToggleButton();
});

async function updateToggleButton() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('moz-extension://')) {
      document.querySelector('.popup-info .info-text').textContent = 
        'Smart TOC is not available on this page.';
      document.getElementById('toggle-toc').disabled = true;
      document.getElementById('toggle-toc').style.opacity = '0.5';
      return;
    }

    chrome.tabs.sendMessage(tab.id, { action: 'get-status' }, (response) => {
      if (chrome.runtime.lastError) {
        return;
      }
      
      if (response && response.isVisible) {
        document.getElementById('toggle-toc').innerHTML = `
          <span class="button-icon">📋</span>
          <span class="button-text">Hide TOC</span>
        `;
      } else {
        document.getElementById('toggle-toc').innerHTML = `
          <span class="button-icon">📋</span>
          <span class="button-text">Show TOC</span>
        `;
      }
    });
    
  } catch (error) {
    console.error('Error updating toggle button:', error);
  }
}
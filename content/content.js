class EagleTOC {
  constructor() {
    this.tocPanel = null;
    this.headings = [];
    this.isVisible = false;
    this.wasAutoShown = false; // 標記是否為自動顯示
    this.autoShowTimeout = null; // 儲存自動顯示的 setTimeout ID
    this.isCollapsed = false;
    this.currentHeading = null;
    this.intersectionObserver = null;
    this.isDragging = false;
    this.isResizing = false;
    this.dragOffset = { x: 0, y: 0 };
    this.altPressed = false;
    this.glanceMode = false;
    this.glanceTimeout = null;
    this.searchQuery = '';
    this.searchActive = false;
    this.filteredHeadings = [];
    this.searchModal = null;
    this.selectedResultIndex = -1;
    this.currentTheme = 'auto';
    this.themeMenu = null;
    this.moreMenu = null;
    // Zen Mode 相關屬性
    this.zenMode = false;
    this.zenContainer = null;
    this.zenScrollContainer = null;
    this.zenContent = null;
    // 版本2: 進階控制功能
    this.zenPaused = false;
    this.zenSpeed = 'medium'; // 'slow', 'medium', 'fast'
    this.zenProgress = 0;
    this.zenAnimationId = null;
    this.zenStartTime = 0;
    this.zenDuration = 30000;
    this.zenControlPanel = null;
    // 版本3: 個性化設置和主題
    this.zenTheme = 'classic'; // 'classic', 'starry', 'ocean', 'forest', 'sunset', 'galaxy'
    this.zenFontSize = 32;
    this.zenLineSpacing = 80;
    this.zenBlurLevel = 20;
    this.zenSettingsPanel = null;
    this.zenReadingPosition = 0;
    this.zenThemes = {
      classic: {
        background: 'rgba(0, 0, 0, 0.95)',
        textColor: '#ffffff',
        accentColor: '#4a90e2'
      },
      starry: {
        background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)',
        textColor: '#e8f4f8',
        accentColor: '#ffd700',
        particles: true
      },
      ocean: {
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%)',
        textColor: '#b8e6ff',
        accentColor: '#00d4ff'
      },
      forest: {
        background: 'linear-gradient(135deg, #134e5e 0%, #71b280 50%, #134e5e 100%)',
        textColor: '#d4f1d4',
        accentColor: '#7dd87d'
      },
      sunset: {
        background: 'linear-gradient(135deg, #ff7b7b 0%, #ff9a56 50%, #ffad56 100%)',
        textColor: '#fff3e0',
        accentColor: '#ff6b35'
      },
      galaxy: {
        background: 'linear-gradient(135deg, #2d1b69 0%, #11998e 50%, #38ef7d 100%)',
        textColor: '#f0fff0',
        accentColor: '#ff6a88'
      }
    };
    this.themes = {
      auto: null, // 使用自動偵測
      light: {
        panelBg: 'rgba(255, 255, 255, 0.95)',
        headerBg: 'rgba(248, 249, 250, 0.98)',
        textColor: '#24292f',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        buttonBg: 'rgba(246, 248, 250, 0.8)',
        buttonHoverBg: 'rgba(208, 215, 222, 0.8)',
        itemHoverBg: 'rgba(246, 248, 250, 0.8)'
      },
      dark: {
        panelBg: 'rgba(28, 28, 30, 0.95)',
        headerBg: 'rgba(44, 44, 46, 0.98)',
        textColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        buttonBg: 'rgba(44, 44, 46, 0.8)',
        buttonHoverBg: 'rgba(58, 58, 60, 0.8)',
        itemHoverBg: 'rgba(58, 58, 60, 0.6)'
      },
      ocean: {
        panelBg: 'rgba(102, 126, 234, 0.15)',
        headerBg: 'rgba(102, 126, 234, 0.2)',
        textColor: '#1a365d',
        borderColor: 'rgba(102, 126, 234, 0.3)',
        shadowColor: 'rgba(102, 126, 234, 0.2)',
        buttonBg: 'rgba(102, 126, 234, 0.1)',
        buttonHoverBg: 'rgba(102, 126, 234, 0.25)',
        itemHoverBg: 'rgba(102, 126, 234, 0.15)'
      },
      forest: {
        panelBg: 'rgba(34, 197, 94, 0.15)',
        headerBg: 'rgba(34, 197, 94, 0.2)',
        textColor: '#14532d',
        borderColor: 'rgba(34, 197, 94, 0.3)',
        shadowColor: 'rgba(34, 197, 94, 0.2)',
        buttonBg: 'rgba(34, 197, 94, 0.1)',
        buttonHoverBg: 'rgba(34, 197, 94, 0.25)',
        itemHoverBg: 'rgba(34, 197, 94, 0.15)'
      },
      sunset: {
        panelBg: 'rgba(251, 146, 60, 0.15)',
        headerBg: 'rgba(251, 146, 60, 0.2)',
        textColor: '#7c2d12',
        borderColor: 'rgba(251, 146, 60, 0.3)',
        shadowColor: 'rgba(251, 146, 60, 0.2)',
        buttonBg: 'rgba(251, 146, 60, 0.1)',
        buttonHoverBg: 'rgba(251, 146, 60, 0.25)',
        itemHoverBg: 'rgba(251, 146, 60, 0.15)'
      },
      coral: {
        panelBg: 'rgba(255, 107, 107, 0.15)',
        headerBg: 'rgba(255, 107, 107, 0.2)',
        textColor: '#7f1d1d',
        borderColor: 'rgba(255, 107, 107, 0.3)',
        shadowColor: 'rgba(255, 107, 107, 0.2)',
        buttonBg: 'rgba(255, 107, 107, 0.1)',
        buttonHoverBg: 'rgba(255, 107, 107, 0.25)',
        itemHoverBg: 'rgba(255, 107, 107, 0.15)'
      }
    };
    this.settings = {
      maxHeadingLevels: 3,
      tocPosition: 'right',
      tocWidth: 300,
      enableLocalFiles: false,
      autoShowMinHeadings: 2,
      autoShowDelay: 500,
      fontSize: 16,
      highlightDuration: 5,
      theme: 'auto',
      whitelistEnabled: true,
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
      ]
    };
    
    // 版本2: 增強導出功能屬性
    this.exportButton = null;
    this.exportModal = null;
    this.exportOptions = {
      template: 'notes', // 'notes', 'outline', 'reference'
      includeMetadata: true,
      includeContent: true,
      includeTOC: true,
      format: 'markdown' // 'markdown', 'txt', 'json'
    };
    
    // 啟動初始化（不需要等待完成）
    this.init().catch(error => {
      console.error('EagleToc initialization failed:', error);
    });
  }

  async init() {
    await this.loadSettings();
    await this.cleanupWhitelist(); // 清理白名單中的錯誤項目
    this.createTOCPanel();
    this.adaptToPageBackground();
    this.extractHeadings();
    this.setupEventListeners();
    this.setupScrollTracking();
    this.makeDraggable();
    this.makeResizable();
    this.setupGlanceMode();
    this.createSearchModal();
    this.setupSearch();
    this.setupTooltips();
    this.setupThemeEvents();
  }

  async loadSettings() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({ action: 'get-settings' }, (response) => {
          if (response) {
            this.settings = { ...this.settings, ...response };
            // 載入主題設定
            if (response.theme) {
              this.currentTheme = response.theme;
            }
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  createTOCPanel() {
    // 清理可能存在的舊元素
    const existingPanel = document.getElementById('eagle-toc-panel');
    const existingTrigger = document.querySelector('.eagle-toc-slide-trigger');
    if (existingPanel) existingPanel.remove();
    if (existingTrigger) existingTrigger.remove();
    
    // Plan B: 創建主面板
    this.tocPanel = document.createElement('div');
    this.tocPanel.id = 'eagle-toc-panel';
    this.tocPanel.className = 'eagle-toc-panel'; // 默認隱藏狀態
    
    // Plan B: 創建滑動觸發條
    this.slideTrigger = document.createElement('div');
    this.slideTrigger.className = 'eagle-toc-slide-trigger';
    this.slideTrigger.title = 'TOC 滑動展開 - 點擊、滑動或滑鼠操作';
    this.isExpanded = false;
    this.isPinned = false;
    this.isAnimating = false;
    this.tocPanel.innerHTML = `
      <div class="eagle-toc-header">
        <div class="eagle-toc-controls">
          <button class="eagle-toc-toggle" title="收合/展開面板">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="12" height="12">
              <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" fill="currentColor"/>
            </svg>
          </button>
          <div class="eagle-toc-depth-controls">
            <button class="eagle-toc-depth-decrease" title="減少顯示深度">−</button>
            <span class="eagle-toc-depth-display">H${this.settings.maxHeadingLevels}</span>
            <button class="eagle-toc-depth-increase" title="增加顯示深度">+</button>
          </div>
          <div class="eagle-toc-font-toolbar-controls">
            <button class="eagle-toc-font-toolbar-decrease" title="減小字體">−</button>
            <span class="eagle-toc-font-toolbar-display">${this.settings.fontSize}px</span>
            <button class="eagle-toc-font-toolbar-increase" title="增大字體">+</button>
          </div>
          <button class="eagle-toc-toolbar-search" title="搜尋">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="12" height="12">
              <path d="M6.5 0C2.91 0 0 2.91 0 6.5S2.91 13 6.5 13c1.61 0 3.09-.59 4.23-1.57l4.92 4.92a.75.75 0 1 0 1.06-1.06l-4.92-4.92A6.5 6.5 0 0 0 6.5 0zM1.5 6.5a5 5 0 1 1 10 0 5 5 0 0 1-10 0z" fill="currentColor"/>
            </svg>
          </button>
          <button class="eagle-toc-toolbar-export" title="智能導出 - 多格式導出選項">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="12" height="12">
              <path d="M8.5 1.5a.5.5 0 0 0-1 0v5.793L5.354 5.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 7.293V1.5z" fill="currentColor"/>
              <path d="M3 9.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5z" fill="currentColor"/>
              <path d="M2.5 11.5A1.5 1.5 0 0 0 4 13h8a1.5 1.5 0 0 0 1.5-1.5v-1a.5.5 0 0 0-1 0v1a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 0-1 0v1z" fill="currentColor"/>
            </svg>
          </button>
          <button class="eagle-toc-toolbar-zen" title="Zen Mode - 全螢幕閱讀模式">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="12" height="12">
              <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z" fill="currentColor"/>
            </svg>
          </button>
          <div class="eagle-toc-action-buttons">
            <button class="eagle-toc-close" title="關閉">×</button>
            <div class="eagle-toc-more-container">
              <button class="eagle-toc-more" title="更多選項">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="12" height="12">
                  <path d="M8 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM1.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm13 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" fill="currentColor"/>
                </svg>
              </button>
              <div class="eagle-toc-more-menu">
                <div class="eagle-toc-more-option eagle-toc-pin">
                  <span class="eagle-toc-more-icon">📍</span>
                  <span class="eagle-toc-more-text">自動開啟</span>
                </div>
                <div class="eagle-toc-more-option eagle-toc-theme-toggle">
                  <span class="eagle-toc-more-icon">🎨</span>
                  <span class="eagle-toc-more-text">主題</span>
                </div>
                <div class="eagle-toc-more-option eagle-toc-copy">
                  <span class="eagle-toc-more-icon">📋</span>
                  <span class="eagle-toc-more-text">複製</span>
                </div>
                <div class="eagle-toc-more-option eagle-toc-settings">
                  <span class="eagle-toc-more-icon">⚙️</span>
                  <span class="eagle-toc-more-text">設定</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="eagle-toc-theme-menu" style="display: none;">
          <div class="eagle-toc-theme-option" data-theme="auto">
            <div class="eagle-toc-theme-dot auto"></div>
            <span>自動適應</span>
          </div>
          <div class="eagle-toc-theme-option" data-theme="light">
            <div class="eagle-toc-theme-dot light"></div>
            <span>亮色</span>
          </div>
          <div class="eagle-toc-theme-option" data-theme="dark">
            <div class="eagle-toc-theme-dot dark"></div>
            <span>深色</span>
          </div>
          <div class="eagle-toc-theme-option" data-theme="ocean">
            <div class="eagle-toc-theme-dot ocean"></div>
            <span>海洋</span>
          </div>
          <div class="eagle-toc-theme-option" data-theme="forest">
            <div class="eagle-toc-theme-dot forest"></div>
            <span>森林</span>
          </div>
          <div class="eagle-toc-theme-option" data-theme="sunset">
            <div class="eagle-toc-theme-dot sunset"></div>
            <span>日落</span>
          </div>
          <div class="eagle-toc-theme-option" data-theme="coral">
            <div class="eagle-toc-theme-dot coral"></div>
            <span>珊瑚</span>
          </div>
        </div>
      </div>
      <div class="eagle-toc-content">
        <div class="eagle-toc-loading">Analyzing page structure...</div>
      </div>
      <!-- 調整大小的處理元素 -->
      <div class="resize-handle resize-handle-right"></div>
      <div class="resize-handle resize-handle-left"></div>
      <div class="resize-handle resize-handle-top"></div>
      <div class="resize-handle resize-handle-bottom"></div>
      <div class="resize-handle resize-handle-corner-nw"></div>
      <div class="resize-handle resize-handle-corner-ne"></div>
      <div class="resize-handle resize-handle-corner-sw"></div>
      <div class="resize-handle resize-handle-corner-se"></div>
    `;
    
    this.tocPanel.style.width = this.settings.tocWidth + 'px';
    this.tocPanel.style.right = this.settings.tocPosition === 'right' ? '20px' : 'auto';
    this.tocPanel.style.left = this.settings.tocPosition === 'left' ? '20px' : 'auto';
    
    // Apply font size to content area only
    this.applyContentFontSize();
    
    document.body.appendChild(this.tocPanel);
    document.body.appendChild(this.slideTrigger);
    
    // Plan B: 初始狀態設置
    this.tocPanel.style.display = 'block'; // 面板始終存在，通過 CSS 控制位置
    
    // Create settings modal
    this.createSettingsModal();
    
    // Update settings display with actual values
    this.updateSettingsDisplay();
    
    // Update depth button display
    this.updateDepthButtonDisplay();
    
  }

  createSettingsModal() {
    // Create settings modal container
    this.settingsModal = document.createElement('div');
    this.settingsModal.className = 'eagle-toc-settings-modal';
    this.settingsModal.innerHTML = `
      <div class="eagle-toc-settings-overlay"></div>
      <div class="eagle-toc-settings-dialog">
        <div class="eagle-toc-settings-header">
          <h3 class="eagle-toc-settings-title">EagleToc 設定</h3>
          <button class="eagle-toc-settings-close" title="關閉設定">×</button>
        </div>
        <div class="eagle-toc-settings-content">
          <div class="eagle-toc-settings-item">
            <span class="eagle-toc-settings-label">字體大小</span>
            <div class="eagle-toc-font-controls">
              <button class="eagle-toc-font-btn eagle-toc-font-decrease" title="減小字體">-</button>
              <span class="eagle-toc-font-size-display">16px</span>
              <button class="eagle-toc-font-btn eagle-toc-font-increase" title="增大字體">+</button>
            </div>
          </div>
          <div class="eagle-toc-settings-item">
            <span class="eagle-toc-settings-label">高亮時間</span>
            <div class="eagle-toc-font-controls">
              <button class="eagle-toc-font-btn eagle-toc-highlight-decrease" title="減少時間">-</button>
              <span class="eagle-toc-highlight-duration-display">5s</span>
              <button class="eagle-toc-font-btn eagle-toc-highlight-increase" title="增加時間">+</button>
            </div>
          </div>
          <div class="eagle-toc-settings-item eagle-toc-whitelist-section">
            <div class="eagle-toc-whitelist-header">
              <span class="eagle-toc-settings-label">自動顯示白名單</span>
              <label class="eagle-toc-whitelist-toggle">
                <input type="checkbox" class="eagle-toc-whitelist-enabled" checked />
                <span class="eagle-toc-toggle-slider"></span>
              </label>
            </div>
            <div class="eagle-toc-whitelist-controls">
              <div class="eagle-toc-whitelist-input-row">
                <input type="text" class="eagle-toc-whitelist-input" placeholder="新增網域 (例: example.com)" />
                <button class="eagle-toc-whitelist-add" title="新增網域">+</button>
              </div>
              <div class="eagle-toc-whitelist-actions">
                <button class="eagle-toc-whitelist-add-current" title="新增當前網域">新增當前網域</button>
                <button class="eagle-toc-whitelist-reset" title="重置為預設值">重置</button>
              </div>
            </div>
            <div class="eagle-toc-whitelist-list">
              <!-- 白名單項目會動態生成 -->
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.settingsModal);
    this.settingsModal.style.display = 'none';
    
    // Add event listeners for modal interactions
    this.setupSettingsModalEvents();
  }

  setupSettingsModalEvents() {
    if (!this.settingsModal) return;
    
    // Close button
    const closeBtn = this.settingsModal.querySelector('.eagle-toc-settings-close');
    closeBtn.addEventListener('click', () => {
      this.hideSettingsPanel();
    });
    
    // Background overlay click
    const overlay = this.settingsModal.querySelector('.eagle-toc-settings-overlay');
    overlay.addEventListener('click', () => {
      this.hideSettingsPanel();
    });
    
    // ESC key to close (with higher priority)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.settingsModal.classList.contains('show')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.hideSettingsPanel();
      }
    }, true); // Use capture phase for higher priority
    
    // Prevent modal dialog click from closing
    const dialog = this.settingsModal.querySelector('.eagle-toc-settings-dialog');
    dialog.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    // Font size controls
    const fontIncreaseBtn = this.settingsModal.querySelector('.eagle-toc-font-increase');
    if (fontIncreaseBtn) {
      fontIncreaseBtn.addEventListener('click', async () => await this.changeFontSize(1));
    }

    const fontDecreaseBtn = this.settingsModal.querySelector('.eagle-toc-font-decrease');
    if (fontDecreaseBtn) {
      fontDecreaseBtn.addEventListener('click', async () => await this.changeFontSize(-1));
    }

    // Highlight duration controls
    const highlightIncreaseBtn = this.settingsModal.querySelector('.eagle-toc-highlight-increase');
    if (highlightIncreaseBtn) {
      highlightIncreaseBtn.addEventListener('click', async () => await this.changeHighlightDuration(1));
    }

    const highlightDecreaseBtn = this.settingsModal.querySelector('.eagle-toc-highlight-decrease');
    if (highlightDecreaseBtn) {
      highlightDecreaseBtn.addEventListener('click', async () => await this.changeHighlightDuration(-1));
    }
    
    // Setup whitelist event listeners for modal
    this.setupModalWhitelistEventListeners();
  }

  setupModalWhitelistEventListeners() {
    if (!this.settingsModal) return;
    
    const whitelistToggle = this.settingsModal.querySelector('.eagle-toc-whitelist-enabled');
    const whitelistInput = this.settingsModal.querySelector('.eagle-toc-whitelist-input');
    const whitelistAddBtn = this.settingsModal.querySelector('.eagle-toc-whitelist-add');
    const addCurrentBtn = this.settingsModal.querySelector('.eagle-toc-whitelist-add-current');
    const resetBtn = this.settingsModal.querySelector('.eagle-toc-whitelist-reset');
    
    if (whitelistToggle) {
      whitelistToggle.addEventListener('change', async () => {
        await this.toggleWhitelistEnabled();
      });
    }
    
    if (whitelistInput) {
      whitelistInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
          await this.addDomainFromInput();
        }
      });
    }
    
    if (whitelistAddBtn) {
      whitelistAddBtn.addEventListener('click', async () => {
        await this.addDomainFromInput();
      });
    }
    
    if (addCurrentBtn) {
      addCurrentBtn.addEventListener('click', async () => {
        if (await this.addCurrentDomainToWhitelist()) {
          this.showNotification(`已新增 ${window.location.hostname} 到白名單`);
          this.renderWhitelistItems();
        } else {
          this.showNotification(`${window.location.hostname} 已在白名單中`);
        }
      });
    }
    
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        await this.resetWhitelistToDefault();
        this.showNotification('白名單已重置為預設值');
        this.renderWhitelistItems();
      });
    }
    
    // 初始化白名單顯示
    this.updateWhitelistUI();
    this.renderWhitelistItems();
  }

  // Helper method to get settings container (modal or legacy panel)
  getSettingsContainer() {
    return this.settingsModal || this.tocPanel;
  }

  extractHeadings() {
    if (document.readyState !== 'complete') {
      setTimeout(() => this.extractHeadings(), 500);
      return;
    }

    const potentialContainers = this.findMainContent();
    let headings = [];
    
    if (potentialContainers.length > 0) {
      potentialContainers.forEach(container => {
        const containerHeadings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings = headings.concat(Array.from(containerHeadings));
      });
    } else {
      headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    }

    // 去除重複的標題元素
    headings = this.deduplicateHeadings(headings);
    headings = this.filterHeadings(headings);
    
    if (headings.length === 0) {
      setTimeout(() => this.extractHeadings(), 2000);
      return;
    }
    
    this.headings = headings.map((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      
      return {
        element: heading,
        text: this.cleanHeadingText(heading.textContent.trim()),
        level: level,
        id: heading.id || `eagle-toc-heading-${index}`,
        index,
        visible: level <= this.settings.maxHeadingLevels
      };
    });

    if (!this.headings.length) {
      this.showNoHeadingsMessage();
      return;
    }

    this.headings.forEach(heading => {
      if (!heading.element.id) {
        heading.element.id = heading.id;
      }
    });

    this.renderTOC();
    this.watchForDynamicContent();
    
    // 檢查是否需要自動顯示 TOC
    this.checkAutoShow();
  }

  checkAutoShow() {
    console.log('🔍 Checking auto show conditions...');
    
    // 檢查是否滿足基本條件（標題數量）
    const hasEnoughHeadings = this.headings.length >= this.settings.autoShowMinHeadings;
    console.log(`📊 Headings count: ${this.headings.length}, Min required: ${this.settings.autoShowMinHeadings}, Enough: ${hasEnoughHeadings}`);
    
    if (!hasEnoughHeadings) {
      console.log('❌ Not enough headings for auto show');
      return;
    }
    
    // 檢查是否應該自動顯示
    const shouldShow = this.shouldAutoShowBySettings();
    console.log(`⚙️ Should auto show: ${shouldShow}`);
    
    if (shouldShow) {
      console.log(`⏰ Scheduling auto show in ${this.settings.autoShowDelay}ms`);
      // 取消之前的自動顯示排程（如果有的話）
      if (this.autoShowTimeout) {
        clearTimeout(this.autoShowTimeout);
        console.log('🗑️ Cancelled previous auto show timeout');
      }
      this.autoShowTimeout = setTimeout(() => {
        this.autoShowTOC();
        this.autoShowTimeout = null; // 清除 timeout ID
      }, this.settings.autoShowDelay);
    } else {
      console.log('❌ Auto show conditions not met');
      // 如果條件不滿足，取消任何待處理的自動顯示
      if (this.autoShowTimeout) {
        clearTimeout(this.autoShowTimeout);
        this.autoShowTimeout = null;
        console.log('🗑️ Cancelled auto show timeout due to unmet conditions');
      }
    }
  }

  shouldAutoShowBySettings() {
    const currentDomain = window.location.hostname;
    console.log(`🌐 Checking auto show for domain: ${currentDomain} (純白名單系統)`);
    
    // 純白名單系統：只檢查當前網站是否在白名單中
    if (this.settings.whitelistEnabled && this.isInWhitelist(currentDomain)) {
      console.log('✅ Domain is in whitelist, enabling auto show');
      return true;
    }
    
    console.log('❌ Domain not in whitelist, auto show disabled');
    return false;
  }

  findMainContent() {
    const selectors = [
      'main',
      'article', 
      '[role="main"]',
      '.main-content',
      '.content',
      '.article-content',
      '.post-content',
      '.entry-content',
      '#content',
      '#main'
    ];

    let containers = [];
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        containers = containers.concat(Array.from(elements));
      }
    }

    return containers.filter(container => {
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return headings.length >= 2;
    });
  }

  deduplicateHeadings(headings) {
    const seen = new Set();
    const uniqueElements = [];
    
    for (const heading of headings) {
      // 首先檢查是否是同一個 DOM 元素
      if (uniqueElements.includes(heading)) {
        continue;
      }
      
      // 使用文本內容和標籤名創建唯一標識
      const text = heading.textContent.trim();
      const tagName = heading.tagName.toLowerCase();
      
      // 如果文本內容和標籤完全相同，檢查是否為嵌套關係
      const duplicateKey = `${tagName}:${text}`;
      
      if (seen.has(duplicateKey)) {
        // 如果已存在相同的標題，比較 DOM 層級，保留較外層的元素
        const existingHeading = uniqueElements.find(h => 
          h.tagName.toLowerCase() === tagName && h.textContent.trim() === text
        );
        
        if (existingHeading && this.isChildOf(heading, existingHeading)) {
          // 當前標題是已存在標題的子元素，跳過
          continue;
        } else if (existingHeading && this.isChildOf(existingHeading, heading)) {
          // 已存在的標題是當前標題的子元素，替換為當前標題
          const index = uniqueElements.indexOf(existingHeading);
          uniqueElements[index] = heading;
          continue;
        }
        // 如果不是嵌套關係，可能是真正的重複內容，保留第一個
        continue;
      }
      
      seen.add(duplicateKey);
      uniqueElements.push(heading);
    }
    
    return uniqueElements;
  }
  
  isChildOf(child, parent) {
    return parent.contains(child) && parent !== child;
  }

  filterHeadings(headings) {
    return headings.filter(heading => {
      const rect = heading.getBoundingClientRect();
      const style = window.getComputedStyle(heading);
      
      // Basic visibility checks
      return rect.width > 0 && 
             rect.height > 0 && 
             style.visibility !== 'hidden' && 
             style.display !== 'none' &&
             heading.textContent.trim().length > 0 &&
             !heading.closest('.eagle-toc-panel');
    });
  }

  cleanHeadingText(text) {
    return text
      .replace(/^#+\s*/, '')
      .replace(/\s+/g, ' ')
      .replace(/[#¶§]/g, '')
      .trim();
  }

  renderTOC() {
    const content = this.tocPanel.querySelector('.eagle-toc-content');
    const tocList = this.createTOCList(this.headings.filter(h => h.visible));
    content.innerHTML = '';
    content.appendChild(tocList);
    this.updateCurrentHeading();
    
    // Apply font size after rendering TOC
    this.applyContentFontSize();
  }

  createTOCList(headings) {
    const ul = document.createElement('ul');
    ul.className = 'eagle-toc-list';

    headings.forEach(heading => {
      const li = document.createElement('li');
      li.className = `eagle-toc-item eagle-toc-level-${heading.level}`;
      li.dataset.headingId = heading.id;
      
      const a = document.createElement('a');
      a.href = `#${heading.id}`;
      a.textContent = heading.text;
      a.className = 'eagle-toc-link';
      a.dataset.headingId = heading.id;
      
      a.addEventListener('click', (e) => {
        e.preventDefault();
        this.hideMoreMenu();
        this.scrollToHeading(heading);
      });

      // Create copy link button
      const copyBtn = document.createElement('button');
      copyBtn.className = 'eagle-toc-copy-btn';
      copyBtn.innerHTML = '🔗';
      copyBtn.title = '複製連結';
      copyBtn.setAttribute('aria-label', '複製此標題的連結');
      
      copyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.copyHeadingLink(heading, copyBtn);
      });

      li.appendChild(a);
      li.appendChild(copyBtn);
      ul.appendChild(li);
    });

    return ul;
  }

  scrollToHeading(heading) {
    const element = heading.element;
    const offset = 20;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    this.setActiveHeading(heading.id);
    this.highlightElement(element);
  }

  copyHeadingLink(heading, button) {
    const url = window.location.origin + window.location.pathname + '#' + heading.id;
    
    // Use modern clipboard API if available, fallback to older method
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(() => {
        this.showCopyFeedback(button, '已複製!');
      }).catch(() => {
        this.fallbackCopyToClipboard(url, button);
      });
    } else {
      this.fallbackCopyToClipboard(url, button);
    }
  }

  fallbackCopyToClipboard(text, button) {
    // Fallback method for older browsers or non-secure contexts
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.showCopyFeedback(button, '已複製!');
    } catch (err) {
      this.showCopyFeedback(button, '複製失敗');
    } finally {
      document.body.removeChild(textArea);
    }
  }

  showCopyFeedback(button, message) {
    const originalText = button.innerHTML;
    button.innerHTML = message;
    button.classList.add('eagle-toc-copy-success');
    
    setTimeout(() => {
      button.innerHTML = originalText;
      button.classList.remove('eagle-toc-copy-success');
    }, 1500);
  }

  highlightElement(element) {
    // Remove any existing highlights
    document.querySelectorAll('.eagle-toc-highlighted').forEach(el => {
      el.classList.remove('eagle-toc-highlighted');
      el.style.removeProperty('--eagle-toc-highlight-duration');
    });

    // Apply highlight with custom duration
    element.style.setProperty('--eagle-toc-highlight-duration', `${this.settings.highlightDuration}s`);
    element.classList.add('eagle-toc-highlighted');

    // Remove highlight after animation completes
    setTimeout(() => {
      element.classList.remove('eagle-toc-highlighted');
      element.style.removeProperty('--eagle-toc-highlight-duration');
    }, this.settings.highlightDuration * 1000);
  }

  setupScrollTracking() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    const options = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      let visibleHeadings = entries.filter(entry => entry.isIntersecting);
      
      if (visibleHeadings.length > 0) {
        const topHeading = visibleHeadings.reduce((prev, current) => {
          return (prev.boundingClientRect.top < current.boundingClientRect.top) ? prev : current;
        });
        
        this.setActiveHeading(topHeading.target.id);
      }
    }, options);

    this.headings.forEach(heading => {
      this.intersectionObserver.observe(heading.element);
    });
  }

  setActiveHeading(headingId) {
    if (this.currentHeading === headingId) return;
    
    this.currentHeading = headingId;
    this.updateCurrentHeading();
  }

  updateCurrentHeading() {
    const tocLinks = this.tocPanel.querySelectorAll('.eagle-toc-link');
    tocLinks.forEach(link => {
      if (link.dataset.headingId === this.currentHeading) {
        link.classList.add('eagle-toc-active');
        this.scrollTOCToActiveItem(link);
      } else {
        link.classList.remove('eagle-toc-active');
      }
    });
  }

  scrollTOCToActiveItem(activeLink) {
    const tocContent = this.tocPanel.querySelector('.eagle-toc-content');
    const linkRect = activeLink.getBoundingClientRect();
    const contentRect = tocContent.getBoundingClientRect();
    
    if (linkRect.top < contentRect.top || linkRect.bottom > contentRect.bottom) {
      const scrollTop = activeLink.offsetTop - tocContent.offsetTop - tocContent.clientHeight / 2;
      tocContent.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }
  }

  showNoHeadingsMessage() {
    const content = this.tocPanel.querySelector('.eagle-toc-content');
    content.innerHTML = '<div class="eagle-toc-no-headings">No headings found on this page.</div>';
  }

  setupEventListeners() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('Content script received message:', request);
      if (request.action === 'toggle-toc') {
        console.log('Toggling TOC, current visible state:', this.isVisible);
        this.toggle();
        sendResponse({ success: true, isVisible: this.isVisible });
      } else if (request.action === 'get-status') {
        sendResponse({ isVisible: this.isVisible });
      }
      return true; // Important for async response
    });

    // 關閉按鈕
    const closeBtn = this.tocPanel.querySelector('.eagle-toc-close');
    closeBtn.addEventListener('click', () => {
      this.hideMoreMenu();
      this.hideSettingsPanel();
      this.hide();
    });

    // Toggle 按鈕（收合/展開）
    const toggleBtn = this.tocPanel.querySelector('.eagle-toc-toggle');
    toggleBtn.addEventListener('click', () => {
      if (this.isCollapsed) {
        this.expandPanel();
      } else {
        this.collapsePanel();
      }
    });

    // 更多選單按鈕
    const moreBtn = this.tocPanel.querySelector('.eagle-toc-more');
    const moreMenu = this.tocPanel.querySelector('.eagle-toc-more-menu');
    this.moreMenu = moreMenu;
    
    moreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMoreMenu();
    });

    // 工具列搜尋按鈕事件
    const toolbarSearchBtn = this.tocPanel.querySelector('.eagle-toc-toolbar-search');
    toolbarSearchBtn.addEventListener('click', () => {
      this.hideMoreMenu();
      this.showSearchModal();
    });

    // 版本2: 增強導出按鈕事件
    const toolbarExportBtn = this.tocPanel.querySelector('.eagle-toc-toolbar-export');
    toolbarExportBtn.addEventListener('click', () => {
      this.hideMoreMenu();
      this.showEnhancedExportModal();
    });

    // Zen Mode 按鈕事件
    const toolbarZenBtn = this.tocPanel.querySelector('.eagle-toc-toolbar-zen');
    toolbarZenBtn.addEventListener('click', () => {
      this.hideMoreMenu();
      this.toggleZenMode();
    });

    // 更多選單選項事件

    const themeToggle = this.tocPanel.querySelector('.eagle-toc-more-option.eagle-toc-theme-toggle');
    themeToggle.addEventListener('click', () => {
      this.hideMoreMenu();
      this.showThemeMenu();
    });

    const settingsOption = this.tocPanel.querySelector('.eagle-toc-more-option.eagle-toc-settings');
    settingsOption.addEventListener('click', () => {
      this.hideMoreMenu();
      this.toggleSettingsPanel();
    });

    const copyOption = this.tocPanel.querySelector('.eagle-toc-more-option.eagle-toc-copy');
    copyOption.addEventListener('click', () => {
      this.hideMoreMenu();
      this.copyToClipboard();
    });

    const pinOption = this.tocPanel.querySelector('.eagle-toc-more-option.eagle-toc-pin');
    pinOption.addEventListener('click', () => {
      this.hideMoreMenu();
      this.togglePin();
    });

    // 初始化釘選按鈕狀態
    this.updatePinButtonState();



    const depthIncreaseBtn = this.tocPanel.querySelector('.eagle-toc-depth-increase');
    const depthDecreaseBtn = this.tocPanel.querySelector('.eagle-toc-depth-decrease');
    
    depthIncreaseBtn.addEventListener('click', async () => {
      this.hideSettingsPanel();
      this.hideMoreMenu();
      await this.increaseHeadingDepth();
    });
    depthDecreaseBtn.addEventListener('click', async () => {
      this.hideSettingsPanel();
      this.hideMoreMenu();
      await this.decreaseHeadingDepth();
    });


    const fontIncreaseBtn = this.tocPanel.querySelector('.eagle-toc-font-increase');
    if (fontIncreaseBtn) {
      fontIncreaseBtn.addEventListener('click', async () => {
        this.hideMoreMenu();
        await this.changeFontSize(1);
      });
    }

    const fontDecreaseBtn = this.tocPanel.querySelector('.eagle-toc-font-decrease');
    if (fontDecreaseBtn) {
      fontDecreaseBtn.addEventListener('click', async () => {
        this.hideMoreMenu();
        await this.changeFontSize(-1);
      });
    }

    // Toolbar font controls
    const fontToolbarIncreaseBtn = this.tocPanel.querySelector('.eagle-toc-font-toolbar-increase');
    if (fontToolbarIncreaseBtn) {
      fontToolbarIncreaseBtn.addEventListener('click', async () => {
        this.hideMoreMenu();
        await this.changeFontSize(1);
      });
    }

    const fontToolbarDecreaseBtn = this.tocPanel.querySelector('.eagle-toc-font-toolbar-decrease');
    if (fontToolbarDecreaseBtn) {
      fontToolbarDecreaseBtn.addEventListener('click', async () => {
        this.hideMoreMenu();
        await this.changeFontSize(-1);
      });
    }

    const highlightIncreaseBtn = this.tocPanel.querySelector('.eagle-toc-highlight-increase');
    if (highlightIncreaseBtn) {
      highlightIncreaseBtn.addEventListener('click', async () => {
        this.hideMoreMenu();
        await this.changeHighlightDuration(1);
      });
    }

    const highlightDecreaseBtn = this.tocPanel.querySelector('.eagle-toc-highlight-decrease');
    if (highlightDecreaseBtn) {
      highlightDecreaseBtn.addEventListener('click', async () => {
        this.hideMoreMenu();
        await this.changeHighlightDuration(-1);
      });
    }

    // 白名單相關事件監聽器
    this.setupWhitelistEventListeners();
    
    // Plan B: 設置滑動事件監聽
    this.setupSlideEvents();

    document.addEventListener('click', (e) => {
      if (!this.tocPanel.contains(e.target)) {
        this.hideSettingsPanel();
        this.hideMoreMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Check priority: Settings Modal > Search Modal > TOC Panel
        if (this.settingsModal && this.settingsModal.classList.contains('show')) {
          // Settings modal will handle this with higher priority - do nothing
          return;
        } else if (this.searchModal && this.searchModal.classList.contains('show')) {
          this.hideSearchModal();
        } else if (this.isVisible) {
          this.hide();
        }
      }
      if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        this.toggle();
      }
      // Ctrl/Cmd + K to open search modal (global shortcut)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // 如果 TOC 沒有開啟，先開啟它
        if (!this.isVisible) {
          this.show();
        }
        // 然後開啟搜尋模態框
        this.showSearchModal();
      }
      // Alt + S to open search modal (only when TOC is visible)
      if (this.isVisible && e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        this.showSearchModal();
      }
    });
  }

  collapsePanel() {
    this.isCollapsed = true;
    this.tocPanel.classList.add('eagle-toc-collapsed');
    // Clear any dynamic height that might interfere with collapse
    this.tocPanel.style.removeProperty('height');
  }

  expandPanel() {
    this.isCollapsed = false;
    this.tocPanel.classList.remove('eagle-toc-collapsed');
    // Restore default height behavior when expanded
    if (!this.tocPanel.style.height) {
      this.tocPanel.style.removeProperty('height');
    }
  }


  async copyToClipboard() {
    const tocText = this.generateTOCText();
    const tocMarkdown = this.generateTOCMarkdown();
    
    try {
      await navigator.clipboard.writeText(tocMarkdown);
      this.showCopySuccess();
    } catch (err) {
      this.fallbackCopyToClipboard(tocText);
    }
  }

  generateTOCText() {
    return this.headings
      .filter(h => h.visible)
      .map(heading => {
        const indent = '  '.repeat(heading.level - 1);
        return `${indent}${heading.text}`;
      })
      .join('\n');
  }

  generateTOCMarkdown() {
    return this.headings
      .filter(h => h.visible)
      .map(heading => {
        const indent = '  '.repeat(heading.level - 1);
        return `${indent}- [${heading.text}](#${heading.id})`;
      })
      .join('\n');
  }

  showCopySuccess() {
    this.showNotification('已複製到剪貼簿');
  }

  showNotification(message, duration = 2000, type = 'default') {
    // Remove any existing notification of the same type
    let selector, className;
    if (type === 'auto-show') {
      selector = '.eagle-toc-auto-notification';
      className = 'eagle-toc-auto-notification';
    } else if (type === 'pin-action') {
      selector = '.eagle-toc-pin-notification';
      className = 'eagle-toc-pin-notification';
    } else {
      selector = '.eagle-toc-notification';
      className = 'eagle-toc-notification';
    }
    
    const existingNotification = document.querySelector(selector);
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create new notification
    const notification = document.createElement('div');
    notification.className = className;
    
    // For pin-action notifications, support multi-line text
    if (type === 'pin-action') {
      notification.innerHTML = message.replace(/\n/g, '<br>');
    } else {
      notification.textContent = message;
    }
    document.body.appendChild(notification);

    // Show notification
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });

    // Hide and remove notification
    setTimeout(() => {
      if (type === 'auto-show' || type === 'pin-action') {
        notification.classList.add('fade-out');
      } else {
        notification.classList.remove('show');
      }
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 400);
    }, duration);
  }

  fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    this.showCopySuccess();
  }

  toggleSettingsPanel() {
    if (!this.settingsModal) {
      console.error('Settings modal not found');
      return;
    }
    
    const isVisible = this.settingsModal.classList.contains('show');
    if (isVisible) {
      this.hideSettingsPanel();
    } else {
      this.showSettingsPanel();
    }
  }

  showSettingsPanel() {
    if (!this.settingsModal) return;
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    
    this.settingsModal.style.display = 'flex';
    // Force reflow for animation
    this.settingsModal.offsetHeight;
    this.settingsModal.classList.add('show');
    
    console.log('Settings modal shown');
  }

  hideSettingsPanel() {
    if (!this.settingsModal) return;
    
    this.settingsModal.classList.remove('show');
    
    // Restore background scrolling
    document.body.style.overflow = '';
    
    // Hide after animation
    setTimeout(() => {
      if (!this.settingsModal.classList.contains('show')) {
        this.settingsModal.style.display = 'none';
      }
    }, 300);
    
    console.log('Settings modal hidden');
  }

  async changeFontSize(delta) {
    const newSize = Math.max(12, Math.min(24, this.settings.fontSize + delta));
    if (newSize !== this.settings.fontSize) {
      this.settings.fontSize = newSize;
      
      // Apply font size only to content area, not the whole panel
      this.applyContentFontSize();
      
      // Update display in settings modal
      if (this.settingsModal) {
        const display = this.settingsModal.querySelector('.eagle-toc-font-size-display');
        if (display) {
          display.textContent = newSize + 'px';
        }
      }
      
      // Update display in toolbar
      const toolbarDisplay = this.tocPanel.querySelector('.eagle-toc-font-toolbar-display');
      if (toolbarDisplay) {
        toolbarDisplay.textContent = newSize + 'px';
      }
      
      await this.saveSettings();
    }
  }

  async changeHighlightDuration(delta) {
    const newDuration = Math.max(1, Math.min(15, this.settings.highlightDuration + delta));
    if (newDuration !== this.settings.highlightDuration) {
      this.settings.highlightDuration = newDuration;
      
      // Update display in settings modal
      if (this.settingsModal) {
        const display = this.settingsModal.querySelector('.eagle-toc-highlight-duration-display');
        if (display) {
          display.textContent = newDuration + 's';
        }
      }
      
      await this.saveSettings();
    }
  }

  applyContentFontSize() {
    const tocList = this.tocPanel.querySelector('.eagle-toc-list');
    if (tocList) {
      // Set base font size for the list
      tocList.style.fontSize = this.settings.fontSize + 'px';
      
      // Calculate relative font sizes for each level based on the base font size
      const baseFontSize = this.settings.fontSize;
      const level1Size = baseFontSize;           // H1 uses base font size (16px default)
      const level2Size = Math.max(11, Math.round(baseFontSize * 0.875)); // 87.5% of base (14px default)
      const level3Size = Math.max(10, Math.round(baseFontSize * 0.75));  // 75% of base (12px default)
      const level4Size = Math.max(10, Math.round(baseFontSize * 0.75));  // 75% of base (12px default)
      const level5Size = Math.max(9, Math.round(baseFontSize * 0.6875)); // 68.75% of base (11px default)
      const level6Size = Math.max(9, Math.round(baseFontSize * 0.6875)); // 68.75% of base (11px default)
      
      // Apply font sizes to each level
      const level1Links = tocList.querySelectorAll('.eagle-toc-level-1 .eagle-toc-link');
      const level2Links = tocList.querySelectorAll('.eagle-toc-level-2 .eagle-toc-link');
      const level3Links = tocList.querySelectorAll('.eagle-toc-level-3 .eagle-toc-link');
      const level4Links = tocList.querySelectorAll('.eagle-toc-level-4 .eagle-toc-link');
      const level5Links = tocList.querySelectorAll('.eagle-toc-level-5 .eagle-toc-link');
      const level6Links = tocList.querySelectorAll('.eagle-toc-level-6 .eagle-toc-link');
      
      level1Links.forEach(link => link.style.fontSize = level1Size + 'px');
      level2Links.forEach(link => link.style.fontSize = level2Size + 'px');
      level3Links.forEach(link => link.style.fontSize = level3Size + 'px');
      level4Links.forEach(link => link.style.fontSize = level4Size + 'px');
      level5Links.forEach(link => link.style.fontSize = level5Size + 'px');
      level6Links.forEach(link => link.style.fontSize = level6Size + 'px');
      
      console.log('Applied font sizes - H1:', level1Size + 'px', 'H2:', level2Size + 'px', 'H3:', level3Size + 'px', 'H4:', level4Size + 'px', 'H5:', level5Size + 'px', 'H6:', level6Size + 'px');
    } else {
      console.log('TOC list not found for font size application');
    }
  }

  updateSettingsDisplay() {
    // Update displays in settings modal if it exists
    if (this.settingsModal) {
      const fontSizeDisplay = this.settingsModal.querySelector('.eagle-toc-font-size-display');
      const highlightDurationDisplay = this.settingsModal.querySelector('.eagle-toc-highlight-duration-display');
      
      if (fontSizeDisplay) {
        fontSizeDisplay.textContent = this.settings.fontSize + 'px';
      }
      if (highlightDurationDisplay) {
        highlightDurationDisplay.textContent = this.settings.highlightDuration + 's';
      }
    }
    
    // Apply the current font size to content
    this.applyContentFontSize();
  }

  async increaseHeadingDepth() {
    if (this.settings.maxHeadingLevels < 6) {
      this.settings.maxHeadingLevels++;
      this.updateDepthControls();
      this.updateHeadingVisibility();
      this.renderTOC();
      await this.saveSettings();
    }
  }

  async decreaseHeadingDepth() {
    if (this.settings.maxHeadingLevels > 1) {
      this.settings.maxHeadingLevels--;
      this.updateDepthControls();
      this.updateHeadingVisibility();
      this.renderTOC();
      await this.saveSettings();
    }
  }

  updateDepthControls() {
    const depthDisplay = this.tocPanel.querySelector('.eagle-toc-depth-display');
    const increaseBtn = this.tocPanel.querySelector('.eagle-toc-depth-increase');
    const decreaseBtn = this.tocPanel.querySelector('.eagle-toc-depth-decrease');
    
    if (depthDisplay) {
      depthDisplay.textContent = `H${this.settings.maxHeadingLevels}`;
    }
    
    // 更新按鈕狀態
    if (increaseBtn) {
      increaseBtn.disabled = this.settings.maxHeadingLevels >= 6;
      increaseBtn.style.opacity = this.settings.maxHeadingLevels >= 6 ? '0.3' : '0.7';
    }
    
    if (decreaseBtn) {
      decreaseBtn.disabled = this.settings.maxHeadingLevels <= 1;
      decreaseBtn.style.opacity = this.settings.maxHeadingLevels <= 1 ? '0.3' : '0.7';
    }
  }

  updateHeadingVisibility() {
    this.headings.forEach(heading => {
      heading.visible = heading.level <= this.settings.maxHeadingLevels;
    });
  }

  updateDepthButtonDisplay() {
    // 使用新的 updateDepthControls 方法
    this.updateDepthControls();
  }

  async saveSettings(retryCount = 0) {
    const maxRetries = 3;
    console.log(`💾 Attempting to save settings (attempt ${retryCount + 1}/${maxRetries + 1}):`, this.settings);
    
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      try {
        const response = await new Promise((resolve, reject) => {
          console.log('📤 Sending save-settings message to background script');
          chrome.runtime.sendMessage({ 
            action: 'save-settings', 
            settings: this.settings 
          }, (response) => {
            console.log('📥 Received response from background script:', response);
            if (chrome.runtime.lastError) {
              console.error('🚨 Chrome runtime error:', chrome.runtime.lastError);
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          });
        });
        
        if (response && response.success) {
          console.log('✅ Settings saved successfully');
          return true;
        } else {
          console.error('❌ Failed to save settings - Background script returned:', response);
          
          // 檢查是否是大小限制問題
          if (response && response.error && response.error.includes('storage limits')) {
            console.log('🔄 Storage limit exceeded, trying optimized whitelist save...');
            return await this.saveWhitelistSeparately(retryCount);
          }
          
          // 如果不是大小問題且還有重試次數，則重試
          if (retryCount < maxRetries) {
            console.log(`🔄 Retrying save settings in 1 second... (${retryCount + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return await this.saveSettings(retryCount + 1);
          }
          
          return false;
        }
      } catch (error) {
        console.error('❌ Error saving settings - Exception caught:', error);
        
        // 重試機制
        if (retryCount < maxRetries) {
          console.log(`🔄 Retrying save settings after error in 1 second... (${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return await this.saveSettings(retryCount + 1);
        }
        
        return false;
      }
    } else {
      console.error('❌ Chrome runtime not available for saving settings');
      return false;
    }
  }

  async saveWhitelistSeparately(retryCount = 0) {
    const maxRetries = 3;
    console.log(`🗂️ Attempting to save whitelist separately (attempt ${retryCount + 1}/${maxRetries + 1})`);
    
    try {
      // 先儲存非白名單設定
      const { autoShowWhitelist, ...settingsWithoutWhitelist } = this.settings;
      
      const settingsResponse = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ 
          action: 'save-settings', 
          settings: settingsWithoutWhitelist 
        }, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      });
      
      if (!settingsResponse || !settingsResponse.success) {
        throw new Error('Failed to save settings without whitelist');
      }
      
      // 再單獨儲存白名單
      if (autoShowWhitelist) {
        const whitelistResponse = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({ 
            action: 'save-whitelist', 
            whitelist: autoShowWhitelist 
          }, (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          });
        });
        
        if (!whitelistResponse || !whitelistResponse.success) {
          throw new Error('Failed to save whitelist separately');
        }
      }
      
      console.log('✅ Settings and whitelist saved successfully (separately)');
      return true;
      
    } catch (error) {
      console.error('❌ Error saving settings separately:', error);
      
      // 重試機制
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying separate save in 1 second... (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await this.saveWhitelistSeparately(retryCount + 1);
      }
      
      return false;
    }
  }

  autoShowTOC() {
    // 檢查是否應該自動顯示（考慮域名記憶等）
    if (this.shouldAutoShow()) {
      this.wasAutoShown = true; // 標記為自動顯示
      this.show();
      this.showAutoDisplayNotification();
    }
  }

  shouldAutoShow() {
    const currentDomain = window.location.hostname;
    console.log(`🔍 shouldAutoShow: Checking domain ${currentDomain}`);
    
    // 簡化邏輯：只使用白名單機制，不再使用黑名單
    const enabledBySettings = this.shouldAutoShowBySettings();
    console.log(`⚙️ shouldAutoShow: Enabled by settings: ${enabledBySettings}`);
    
    return enabledBySettings;
  }


  showAutoDisplayNotification() {
    // 只有在用戶首次在此域名看到自動顯示時才顯示通知
    const currentDomain = window.location.hostname;
    const notifiedDomains = this.getNotifiedDomains();
    
    if (!notifiedDomains.includes(currentDomain)) {
      this.showNotification('TOC 已自動顯示。如不需要，可點擊 × 關閉', 4000, 'auto-show');
      notifiedDomains.push(currentDomain);
      localStorage.setItem('eagle-toc-notified-domains', JSON.stringify(notifiedDomains));
    }
  }

  getNotifiedDomains() {
    try {
      const stored = localStorage.getItem('eagle-toc-notified-domains');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }


  // 清理白名單中的錯誤項目（完整 URL 等）
  async cleanupWhitelist() {
    if (!this.settings.autoShowWhitelist) return;
    
    console.log('Before cleanup:', this.settings.autoShowWhitelist);
    
    const cleanWhitelist = this.settings.autoShowWhitelist.filter(item => {
      // 移除包含路徑的完整 URL
      if (item.includes('/') && !item.startsWith('*.')) {
        console.log('Removing invalid URL:', item);
        return false;
      }
      
      // 移除過長的項目（可能是完整 URL）
      if (item.length > 100) {
        console.log('Removing too long item:', item.substring(0, 50) + '...');
        return false;
      }
      
      return true;
    });
    
    // 如果有變化，保存設定
    if (cleanWhitelist.length !== this.settings.autoShowWhitelist.length) {
      this.settings.autoShowWhitelist = cleanWhitelist;
      await this.saveSettings();
      console.log('After cleanup:', this.settings.autoShowWhitelist);
    }
  }

  isInWhitelist(domain) {
    if (!domain) return false;
    
    // 清理域名格式
    domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
    
    const whitelist = this.settings.autoShowWhitelist || [];
    
    return whitelist.some(pattern => {
      // 移除協議前綴並轉為小寫
      const cleanPattern = pattern.replace(/^https?:\/\//, '').toLowerCase();
      
      // 完全匹配
      if (cleanPattern === domain) {
        return true;
      }
      
      // 檢查是否包含萬用字元
      if (cleanPattern.includes('*')) {
        // 將萬用字元模式轉換為正則表達式
        const regexPattern = cleanPattern
          .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // 轉義正則特殊字符
          .replace(/\*/g, '.*'); // 將 * 轉換為 .*
        
        try {
          const regex = new RegExp(`^${regexPattern}$`, 'i');
          return regex.test(domain);
        } catch (e) {
          // 如果正則表達式無效，回退到原始匹配
          console.warn('Invalid wildcard pattern:', cleanPattern, e);
          return false;
        }
      }
      
      // 子域名匹配 (example.com 也匹配 www.example.com)
      if (domain.endsWith('.' + cleanPattern)) {
        return true;
      }
      
      return false;
    });
  }

  // 釘選功能專用：檢查域名是否精確存在於白名單中 [v2.0]
  isExactlyInWhitelist(domain) {
    console.log('🔍 Using NEW isExactlyInWhitelist method v2.0');
    if (!domain) return false;
    
    // 清理域名格式
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
    console.log('🧹 Clean domain:', cleanDomain);
    
    const whitelist = this.settings.autoShowWhitelist || [];
    console.log('📝 Checking against whitelist:', whitelist);
    
    const result = whitelist.some(pattern => {
      // 移除協議前綴並轉為小寫
      const cleanPattern = pattern.replace(/^https?:\/\//, '').toLowerCase();
      const isMatch = cleanPattern === cleanDomain;
      console.log(`🔍 Comparing "${cleanPattern}" === "${cleanDomain}": ${isMatch}`);
      
      // 只檢查完全匹配，不做子域名匹配
      return isMatch;
    });
    
    console.log('🎯 Final result:', result);
    return result;
  }

  // 驗證域名格式是否有效
  isValidDomain(domain) {
    if (!domain || typeof domain !== 'string') {
      return false;
    }
    
    // 基本域名格式檢查
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    // 檢查長度限制
    if (domain.length > 253) {
      return false;
    }
    
    // 檢查基本格式
    if (!domainRegex.test(domain)) {
      return false;
    }
    
    // 檢查是否包含有效的頂級域名
    const parts = domain.split('.');
    if (parts.length < 2) {
      return false;
    }
    
    // 最後一部分應該是有效的 TLD（至少 2 個字符）
    const tld = parts[parts.length - 1];
    if (tld.length < 2) {
      return false;
    }
    
    return true;
  }

  // 檢查域名是否在排除列表中（用戶明確 unpin 的域名）
  isInExcludedList(domain) {
    if (!domain) return false;
    
    // 清理域名格式
    domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
    
    const excludedList = this.settings.excludedDomains || [];
    console.log(`🚫 Checking excluded list for domain: ${domain}`);
    console.log(`📝 Excluded domains:`, excludedList);
    
    return excludedList.includes(domain);
  }

  // 添加域名到排除列表
  addToExcludedList(domain) {
    if (!domain) return;
    
    // 清理域名格式
    domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
    
    if (!this.settings.excludedDomains) {
      this.settings.excludedDomains = [];
    }
    
    // 避免重複添加
    if (!this.settings.excludedDomains.includes(domain)) {
      this.settings.excludedDomains.push(domain);
      console.log(`🚫 Added ${domain} to excluded list`);
    }
  }

  // 從排除列表移除域名
  removeFromExcludedList(domain) {
    if (!domain) return;
    
    // 清理域名格式
    domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
    
    if (!this.settings.excludedDomains) {
      this.settings.excludedDomains = [];
      return;
    }
    
    const index = this.settings.excludedDomains.indexOf(domain);
    if (index !== -1) {
      this.settings.excludedDomains.splice(index, 1);
      console.log(`✅ Removed ${domain} from excluded list`);
    }
  }

  // 獲取白名單儲存大小信息
  getWhitelistStorageInfo() {
    const whitelist = this.settings.autoShowWhitelist || [];
    const size = JSON.stringify(whitelist).length;
    const itemCount = whitelist.length;
    
    return {
      size,
      itemCount,
      sizeKB: (size / 1024).toFixed(2),
      percentOfLimit: ((size / 8192) * 100).toFixed(1),
      canAddMore: size < 6000
    };
  }

  async addToWhitelist(domain, retryCount = 0) {
    const maxRetries = 2;
    
    if (!domain) {
      console.warn('🚨 addToWhitelist: No domain provided');
      return false;
    }
    
    // 清理域名
    const originalDomain = domain;
    domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
    console.log(`🌍 addToWhitelist: Original domain: ${originalDomain} -> Clean domain: ${domain} (attempt ${retryCount + 1}/${maxRetries + 1})`);
    
    // 檢查域名是否已存在
    if (this.isInWhitelist(domain)) {
      console.log('ℹ️  addToWhitelist: Domain already in whitelist');
      return false;
    }
    
    // 驗證域名格式
    if (!this.isValidDomain(domain)) {
      console.error('❌ addToWhitelist: Invalid domain format:', domain);
      return false;
    }
    
    // 檢查白名單大小限制
    const currentSize = JSON.stringify(this.settings.autoShowWhitelist).length;
    const estimatedNewSize = currentSize + domain.length + 10; // 加一些緩衝
    if (estimatedNewSize > 6000) { // 保留安全邊際
      console.error('❌ addToWhitelist: Whitelist too large, cannot add more domains');
      return false;
    }
    
    // 添加到本地設定
    const originalWhitelist = [...this.settings.autoShowWhitelist];
    this.settings.autoShowWhitelist.push(domain);
    console.log('📝 addToWhitelist: Added to local settings, saving...');
    
    try {
      const success = await this.saveSettings();
      
      if (success) {
        console.log('✅ addToWhitelist: Successfully added and saved');
        return true;
      } else {
        throw new Error('Save settings returned false');
      }
    } catch (error) {
      console.error('❌ addToWhitelist: Save failed:', error);
      
      // 回滾本地更改
      this.settings.autoShowWhitelist = originalWhitelist;
      console.log('🔄 Rolled back whitelist to original state');
      
      // 重試機制
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying addToWhitelist in 1 second... (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await this.addToWhitelist(originalDomain, retryCount + 1);
      }
      
      return false;
    }
  }

  async removeFromWhitelist(domain, retryCount = 0) {
    const maxRetries = 2;
    
    if (!domain) {
      console.warn('🚨 removeFromWhitelist: No domain provided');
      return false;
    }
    
    // 清理域名格式，與 addToWhitelist 保持一致
    const originalDomain = domain;
    domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
    console.log(`🌍 removeFromWhitelist: Original domain: ${originalDomain} -> Clean domain: ${domain} (attempt ${retryCount + 1}/${maxRetries + 1})`);
    
    const whitelist = this.settings.autoShowWhitelist || [];
    const index = whitelist.findIndex(pattern => {
      // 移除協議前綴並轉為小寫
      const cleanPattern = pattern.replace(/^https?:\/\//, '').toLowerCase();
      
      // 只做精確匹配
      return cleanPattern === domain;
    });
    
    if (index === -1) {
      console.log('ℹ️  removeFromWhitelist: Domain not found in whitelist');
      return false;
    }
    
    // 保存原始白名單以便回滾
    const originalWhitelist = [...this.settings.autoShowWhitelist];
    const removedItem = this.settings.autoShowWhitelist[index];
    
    // 從本地設定中移除
    this.settings.autoShowWhitelist.splice(index, 1);
    console.log('📝 removeFromWhitelist: Removed from local settings, saving...');
    
    try {
      const success = await this.saveSettings();
      
      if (success) {
        console.log('✅ removeFromWhitelist: Successfully removed and saved');
        return true;
      } else {
        throw new Error('Save settings returned false');
      }
    } catch (error) {
      console.error('❌ removeFromWhitelist: Save failed:', error);
      
      // 回滾本地更改
      this.settings.autoShowWhitelist = originalWhitelist;
      console.log('🔄 Rolled back whitelist to original state');
      
      // 重試機制
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying removeFromWhitelist in 1 second... (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await this.removeFromWhitelist(originalDomain, retryCount + 1);
      }
      
      return false;
    }
  }

  async addCurrentDomainToWhitelist() {
    const currentDomain = window.location.hostname;
    return await this.addToWhitelist(currentDomain);
  }

  async resetWhitelistToDefault() {
    this.settings.autoShowWhitelist = [
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
    ];
    await this.saveSettings();
  }

  async toggleWhitelistEnabled() {
    this.settings.whitelistEnabled = !this.settings.whitelistEnabled;
    await this.saveSettings();
    this.updateWhitelistUI();
  }

  setupWhitelistEventListeners() {
    const whitelistToggle = this.tocPanel.querySelector('.eagle-toc-whitelist-enabled');
    const whitelistInput = this.tocPanel.querySelector('.eagle-toc-whitelist-input');
    const whitelistAddBtn = this.tocPanel.querySelector('.eagle-toc-whitelist-add');
    const addCurrentBtn = this.tocPanel.querySelector('.eagle-toc-whitelist-add-current');
    const resetBtn = this.tocPanel.querySelector('.eagle-toc-whitelist-reset');

    if (whitelistToggle) {
      whitelistToggle.addEventListener('change', async () => {
        await this.toggleWhitelistEnabled();
      });
    }

    if (whitelistInput) {
      whitelistInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
          await this.addDomainFromInput();
        }
      });
    }

    if (whitelistAddBtn) {
      whitelistAddBtn.addEventListener('click', async () => {
        await this.addDomainFromInput();
      });
    }

    if (addCurrentBtn) {
      addCurrentBtn.addEventListener('click', async () => {
        if (await this.addCurrentDomainToWhitelist()) {
          this.showNotification(`已新增 ${window.location.hostname} 到白名單`);
          this.renderWhitelistItems();
        } else {
          this.showNotification(`${window.location.hostname} 已在白名單中`);
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        await this.resetWhitelistToDefault();
        this.showNotification('白名單已重置為預設值');
        this.renderWhitelistItems();
      });
    }

    // 初始化白名單顯示
    this.updateWhitelistUI();
    this.renderWhitelistItems();
  }

  async addDomainFromInput() {
    const container = this.getSettingsContainer();
    const input = container.querySelector('.eagle-toc-whitelist-input');
    const domain = input.value.trim();
    
    if (!domain) {
      this.showNotification('請輸入網域名稱');
      return;
    }

    if (await this.addToWhitelist(domain)) {
      input.value = '';
      this.showNotification(`已新增 ${domain} 到白名單`);
      this.renderWhitelistItems();
    } else {
      this.showNotification(`${domain} 已在白名單中`);
    }
  }

  updateWhitelistUI() {
    const container = this.getSettingsContainer();
    const toggle = container.querySelector('.eagle-toc-whitelist-enabled');
    const controls = container.querySelector('.eagle-toc-whitelist-controls');
    const list = container.querySelector('.eagle-toc-whitelist-list');

    if (toggle) {
      toggle.checked = this.settings.whitelistEnabled;
    }

    if (controls && list) {
      const opacity = this.settings.whitelistEnabled ? '1' : '0.5';
      const pointerEvents = this.settings.whitelistEnabled ? 'auto' : 'none';
      
      controls.style.opacity = opacity;
      controls.style.pointerEvents = pointerEvents;
      list.style.opacity = opacity;
      list.style.pointerEvents = pointerEvents;
    }
  }

  renderWhitelistItems() {
    const container = this.getSettingsContainer();
    const listContainer = container.querySelector('.eagle-toc-whitelist-list');
    if (!listContainer) return;

    const whitelist = this.settings.autoShowWhitelist || [];
    
    listContainer.innerHTML = whitelist.map((domain, index) => `
      <div class="eagle-toc-whitelist-item" data-index="${index}">
        <span class="eagle-toc-whitelist-domain" data-original="${domain}">${domain}</span>
        <input class="eagle-toc-whitelist-input-edit" type="text" value="${domain}" style="display: none;">
        <div class="eagle-toc-whitelist-actions">
          <button class="eagle-toc-whitelist-edit" data-index="${index}" title="編輯">✏️</button>
          <button class="eagle-toc-whitelist-save" data-index="${index}" title="保存" style="display: none;">✓</button>
          <button class="eagle-toc-whitelist-cancel" data-index="${index}" title="取消" style="display: none;">✕</button>
          <button class="eagle-toc-whitelist-remove" data-domain="${domain}" title="移除">🗑️</button>
        </div>
      </div>
    `).join('');

    this.bindWhitelistItemEvents(listContainer);
  }

  bindWhitelistItemEvents(listContainer) {
    // 編輯按鈕事件
    listContainer.querySelectorAll('.eagle-toc-whitelist-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.startEditWhitelistItem(index);
      });
    });

    // 保存按鈕事件
    listContainer.querySelectorAll('.eagle-toc-whitelist-save').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const index = parseInt(e.target.dataset.index);
        await this.saveWhitelistItemEdit(index);
      });
    });

    // 取消按鈕事件
    listContainer.querySelectorAll('.eagle-toc-whitelist-cancel').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.cancelWhitelistItemEdit(index);
      });
    });

    // 移除按鈕事件
    listContainer.querySelectorAll('.eagle-toc-whitelist-remove').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const domain = e.target.dataset.domain;
        if (await this.removeFromWhitelist(domain)) {
          this.showNotification(`已從白名單移除 ${domain}`);
          this.renderWhitelistItems();
        }
      });
    });

    // 輸入框 Enter 鍵事件
    listContainer.querySelectorAll('.eagle-toc-whitelist-input-edit').forEach(input => {
      input.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
          const item = input.closest('.eagle-toc-whitelist-item');
          const index = parseInt(item.dataset.index);
          await this.saveWhitelistItemEdit(index);
        } else if (e.key === 'Escape') {
          const item = input.closest('.eagle-toc-whitelist-item');
          const index = parseInt(item.dataset.index);
          this.cancelWhitelistItemEdit(index);
        }
      });
    });
  }

  startEditWhitelistItem(index) {
    const listContainer = this.tocPanel.querySelector('.eagle-toc-whitelist-list');
    const item = listContainer.querySelector(`[data-index="${index}"]`);
    if (!item) return;

    const domainSpan = item.querySelector('.eagle-toc-whitelist-domain');
    const inputEdit = item.querySelector('.eagle-toc-whitelist-input-edit');
    const editBtn = item.querySelector('.eagle-toc-whitelist-edit');
    const saveBtn = item.querySelector('.eagle-toc-whitelist-save');
    const cancelBtn = item.querySelector('.eagle-toc-whitelist-cancel');

    // 切換到編輯模式
    domainSpan.style.display = 'none';
    inputEdit.style.display = 'block';
    editBtn.style.display = 'none';
    saveBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';

    // 選中輸入框內容
    inputEdit.focus();
    inputEdit.select();
  }

  async saveWhitelistItemEdit(index) {
    const listContainer = this.tocPanel.querySelector('.eagle-toc-whitelist-list');
    const item = listContainer.querySelector(`[data-index="${index}"]`);
    if (!item) return;

    const domainSpan = item.querySelector('.eagle-toc-whitelist-domain');
    const inputEdit = item.querySelector('.eagle-toc-whitelist-input-edit');
    const originalDomain = domainSpan.dataset.original;
    const newDomain = inputEdit.value.trim();

    if (!newDomain) {
      this.showNotification('網域名稱不能為空');
      return;
    }

    if (newDomain === originalDomain) {
      // 沒有變化，直接取消編輯
      this.cancelWhitelistItemEdit(index);
      return;
    }

    // 檢查新域名是否已存在
    if (this.settings.autoShowWhitelist.includes(newDomain)) {
      this.showNotification(`${newDomain} 已存在於白名單中`);
      return;
    }

    // 更新白名單
    this.settings.autoShowWhitelist[index] = newDomain;
    await this.saveSettings();

    // 顯示成功提示
    this.showNotification(`已將 ${originalDomain} 更新為 ${newDomain}`);

    // 重新渲染
    this.renderWhitelistItems();
  }

  cancelWhitelistItemEdit(index) {
    const listContainer = this.tocPanel.querySelector('.eagle-toc-whitelist-list');
    const item = listContainer.querySelector(`[data-index="${index}"]`);
    if (!item) return;

    const domainSpan = item.querySelector('.eagle-toc-whitelist-domain');
    const inputEdit = item.querySelector('.eagle-toc-whitelist-input-edit');
    const editBtn = item.querySelector('.eagle-toc-whitelist-edit');
    const saveBtn = item.querySelector('.eagle-toc-whitelist-save');
    const cancelBtn = item.querySelector('.eagle-toc-whitelist-cancel');

    // 恢復原值
    inputEdit.value = domainSpan.dataset.original;

    // 切換回顯示模式
    domainSpan.style.display = 'block';
    inputEdit.style.display = 'none';
    editBtn.style.display = 'inline-block';
    saveBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
  }

  // Plan B: 滑動展開 TOC 面板
  show() {
    if (this.isAnimating) return;
    
    this.isVisible = true;
    this.isExpanded = true;
    this.isAnimating = true;
    
    // 移除之前的動畫 class
    this.tocPanel.classList.remove('eagle-toc-slide-out');
    
    // 開始滑入動畫
    this.tocPanel.classList.add('eagle-toc-slide-in', 'eagle-toc-visible', 'eagle-toc-expanded');
    
    // 動畫結束後清理 class
    setTimeout(() => {
      this.tocPanel.classList.remove('eagle-toc-slide-in');
      this.isAnimating = false;
    }, 600);
    
    // 隱藏滑動條
    if (this.slideTrigger) {
      this.slideTrigger.style.opacity = '0';
      this.slideTrigger.style.pointerEvents = 'none';
    }
  }

  // Plan B: 滑動隱藏 TOC 面板
  hide() {
    if (this.isPinned || this.isAnimating) {
      return; // 如果固定或正在動畫，不能隱藏
    }
    
    this.isVisible = false;
    this.isExpanded = false;
    this.isAnimating = true;
    
    // 移除之前的動畫 class
    this.tocPanel.classList.remove('eagle-toc-slide-in', 'eagle-toc-expanded');
    
    // 開始滑出動畫
    this.tocPanel.classList.add('eagle-toc-slide-out');
    
    // 動畫結束後清理 class
    setTimeout(() => {
      this.tocPanel.classList.remove('eagle-toc-slide-out', 'eagle-toc-visible');
      this.isAnimating = false;
      
      // 顯示滑動條
      if (this.slideTrigger) {
        this.slideTrigger.style.opacity = '1';
        this.slideTrigger.style.pointerEvents = 'auto';
      }
    }, 400);
    
    // 重置自動顯示標記
    if (this.wasAutoShown) {
      this.wasAutoShown = false;
    }
  }

  // Plan B: 切換滑動展開/隱藏狀態
  toggle() {
    if (this.isAnimating) return;
    
    if (this.isExpanded) {
      this.hide();
    } else {
      this.show();
    }
  }
  
  // Plan B: 切換pin狀態和滑動動畫
  togglePin() {
    this.isPinned = !this.isPinned;
    
    if (this.isPinned) {
      this.show();
      this.tocPanel.classList.add('eagle-toc-pinned');
      this.showNotification('TOC 已固定顯示 - 滑動模式', 2000, 'pin-action');
    } else {
      this.tocPanel.classList.remove('eagle-toc-pinned');
      this.showNotification('TOC 已取消固定', 2000, 'pin-action');
    }
    
    // 更新菜單的pin按鈕狀態
    this.updatePinButtonState();
  }


  handleDrag(e) {
    if (!this.isDragging) return;
    
    // Store the position for requestAnimationFrame
    this.pendingDragX = e.clientX - this.dragOffset.x;
    this.pendingDragY = e.clientY - this.dragOffset.y;
    
    // Use requestAnimationFrame for smooth dragging
    if (!this.dragFrameRequest) {
      this.dragFrameRequest = requestAnimationFrame(() => {
        const maxX = window.innerWidth - this.tocPanel.offsetWidth;
        const maxY = window.innerHeight - this.tocPanel.offsetHeight;
        
        const clampedX = Math.max(0, Math.min(this.pendingDragX, maxX));
        const clampedY = Math.max(0, Math.min(this.pendingDragY, maxY));
        
        this.tocPanel.style.left = clampedX + 'px';
        this.tocPanel.style.top = clampedY + 'px';
        this.tocPanel.style.right = 'auto';
        
        this.dragFrameRequest = null;
      });
    }
  }

  stopDragging() {
    this.isDragging = false;
    this.tocPanel.classList.remove('eagle-toc-dragging');
    document.removeEventListener('mousemove', this.boundHandleDrag);
    document.removeEventListener('mouseup', this.boundStopDragging);
    
    // Cancel any pending frame request
    if (this.dragFrameRequest) {
      cancelAnimationFrame(this.dragFrameRequest);
      this.dragFrameRequest = null;
    }
  }


  setupGlanceMode() {
    document.addEventListener('keydown', (e) => {
      if (e.altKey && !this.altPressed) {
        this.altPressed = true;
        document.body.classList.add('eagle-toc-glance-mode');
      }
    });

    document.addEventListener('keyup', (e) => {
      if (!e.altKey && this.altPressed) {
        this.altPressed = false;
        this.glanceMode = false;
        document.body.classList.remove('eagle-toc-glance-mode');
        if (this.glanceTimeout) {
          clearTimeout(this.glanceTimeout);
        }
        if (this.isVisible && this.glanceMode) {
          this.hide();
        }
      }
    });

    document.addEventListener('mouseover', (e) => {
      if (this.altPressed && !this.isDragging) {
        const heading = e.target.closest('h1, h2, h3, h4, h5, h6');
        if (heading && this.headings.find(h => h.element === heading)) {
          this.showGlance();
        }
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (this.altPressed && this.glanceMode) {
        this.glanceTimeout = setTimeout(() => {
          if (this.glanceMode && !this.tocPanel.matches(':hover')) {
            this.hideGlance();
          }
        }, 300);
      }
    });
  }

  showGlance() {
    if (!this.glanceMode && !this.isVisible) {
      this.glanceMode = true;
      this.show();
      this.tocPanel.classList.add('eagle-toc-glance');
    }
  }

  hideGlance() {
    if (this.glanceMode) {
      this.glanceMode = false;
      this.tocPanel.classList.remove('eagle-toc-glance');
      this.hide();
    }
  }

  watchForDynamicContent() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }

    this.mutationObserver = new MutationObserver(
      this.debounce((mutations) => {
        let shouldReextract = false;
        
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            const addedNodes = Array.from(mutation.addedNodes);
            const removedNodes = Array.from(mutation.removedNodes);
            
            const hasHeadings = [...addedNodes, ...removedNodes].some(node => 
              node.nodeType === Node.ELEMENT_NODE && 
              (node.matches('h1, h2, h3, h4, h5, h6') || 
               node.querySelector('h1, h2, h3, h4, h5, h6'))
            );
            
            if (hasHeadings) {
              shouldReextract = true;
            }
          }
        });

        if (shouldReextract) {
          this.extractHeadings();
          if (this.intersectionObserver) {
            this.setupScrollTracking();
          }
        }
      }, 1000)
    );

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Plan B: 設置滑動觸發條事件監聽
  setupSlideEvents() {
    if (!this.slideTrigger) return;
    
    let slideTimeout = null;
    let isDragging = false;
    let dragStartY = 0;
    let dragCurrentY = 0;
    
    // 滑鼠懸停事件
    this.slideTrigger.addEventListener('mouseenter', () => {
      if (this.isPinned || this.isExpanded || this.isAnimating) return;
      
      // 清除之前的延遲
      if (slideTimeout) {
        clearTimeout(slideTimeout);
      }
      
      // 加入懸停效果
      this.slideTrigger.style.transform = 'translateY(-50%) translateX(-8px)';
      this.slideTrigger.style.width = '40px';
      
      // 立即展開，提升響應速度
      slideTimeout = setTimeout(() => {
        this.show();
      }, 50);
    });
    
    // 滑鼠離開事件
    this.slideTrigger.addEventListener('mouseleave', () => {
      if (slideTimeout) {
        clearTimeout(slideTimeout);
        slideTimeout = null;
      }
      
      // 重置觸發條樣式
      this.slideTrigger.style.transform = 'translateY(-50%)';
      this.slideTrigger.style.width = '20px';
    });
    
    // 點擊事件
    this.slideTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragging) {
        this.show();
      }
    });
    
    // 雙擊固定
    this.slideTrigger.addEventListener('dblclick', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.togglePin();
    });
    
    // 滑動手勢支持
    this.slideTrigger.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // 只處理左鍵
      e.preventDefault();
      
      isDragging = true;
      dragStartY = e.clientY;
      this.slideTrigger.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      dragCurrentY = e.clientY;
      const deltaY = dragCurrentY - dragStartY;
      
      // 如果向左拖拽足夠的距離，展開面板
      if (Math.abs(deltaY) > 20) {
        this.show();
        isDragging = false;
        this.slideTrigger.style.cursor = 'pointer';
      }
    });
    
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        this.slideTrigger.style.cursor = 'pointer';
      }
    });
    
    // 面板離開時隱藏（如果未固定）
    this.tocPanel.addEventListener('mouseleave', () => {
      if (!this.isPinned && this.isExpanded && !this.isAnimating) {
        // 延遲隱藏，給用戶時間操作
        setTimeout(() => {
          if (!this.tocPanel.matches(':hover') && !this.isPinned) {
            this.hide();
          }
        }, 800); // Plan B 的延遲時間較長
      }
    });
    
    // 键盤快捷鍵支持
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+S 快速展開滑動面板
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        this.toggle();
      }
      // 雙擊 ESC 快速隱藏
      if (e.key === 'Escape' && this.isExpanded && !this.isPinned) {
        this.hide();
      }
    });
  }

  createSearchModal() {
    // 創建搜尋模態框
    this.searchModal = document.createElement('div');
    this.searchModal.className = 'eagle-toc-search-modal';
    this.searchModal.innerHTML = `
      <div class="eagle-toc-search-overlay"></div>
      <div class="eagle-toc-search-dialog">
        <div class="eagle-toc-search-input-container">
          <input type="text" class="eagle-toc-search-input" placeholder="搜尋標題..." />
          <div class="eagle-toc-search-icon">🔍</div>
        </div>
        <div class="eagle-toc-search-results"></div>
        <div class="eagle-toc-search-footer">
          <div class="eagle-toc-search-tips">
            <span>↑↓ 導航</span>
            <span>Enter 選擇</span>
            <span>ESC 關閉</span>
          </div>
        </div>
      </div>
    `;

    // 添加到 body
    document.body.appendChild(this.searchModal);
    this.searchModal.style.display = 'none';
  }

  setupSearch() {
    const searchToggle = this.tocPanel.querySelector('.eagle-toc-toolbar-search');
    const modalSearchInput = this.searchModal.querySelector('.eagle-toc-search-input');
    const overlay = this.searchModal.querySelector('.eagle-toc-search-overlay');

    if (searchToggle) {
      searchToggle.addEventListener('click', () => {
        this.hideSettingsPanel();
        this.showSearchModal();
      });
    }

    if (modalSearchInput) {
      modalSearchInput.addEventListener('input', (e) => {
        this.performModalSearch(e.target.value);
      });
      
      modalSearchInput.addEventListener('keydown', (e) => {
        this.handleSearchKeydown(e);
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => this.hideSearchModal());
    }

    // 點擊搜尋模態框外部關閉
    this.searchModal.addEventListener('click', (e) => {
      if (e.target === this.searchModal) {
        this.hideSearchModal();
      }
    });

    // 阻止點擊對話框內部時關閉模態框
    const searchDialog = this.searchModal.querySelector('.eagle-toc-search-dialog');
    if (searchDialog) {
      searchDialog.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  }

  showSearchModal() {
    this.searchModal.style.display = 'block';
    
    // 動態計算搜尋對話框的位置（相對於TOC面板）
    const tocRect = this.tocPanel.getBoundingClientRect();
    const searchDialog = this.searchModal.querySelector('.eagle-toc-search-dialog');
    
    if (searchDialog) {
      // 判斷TOC面板是在左側還是右側
      const tocPosition = this.settings.tocPosition || 'right';
      const viewportWidth = window.innerWidth;
      
      if (tocPosition === 'right' || tocRect.right > viewportWidth / 2) {
        // TOC在右側，搜尋框放在左側
        searchDialog.style.right = 'auto';
        searchDialog.style.left = Math.max(20, tocRect.left - 400) + 'px';
      } else {
        // TOC在左側，搜尋框放在右側
        searchDialog.style.left = 'auto';
        searchDialog.style.right = Math.max(20, viewportWidth - tocRect.right - 400) + 'px';
      }
      
      // 設定垂直位置
      searchDialog.style.top = tocRect.top + 'px';
    }
    
    // 強制瀏覽器重繪，然後添加 show class
    requestAnimationFrame(() => {
      this.searchModal.classList.add('show');
      const searchInput = this.searchModal.querySelector('.eagle-toc-search-input');
      if (searchInput) {
        setTimeout(() => {
          searchInput.focus();
          searchInput.select();
        }, 100);
      }
    });
  }

  hideSearchModal() {
    this.searchModal.classList.remove('show');
    setTimeout(() => {
      this.searchModal.style.display = 'none';
      this.clearModalSearch();
    }, 200);
  }

  performModalSearch(query) {
    this.searchQuery = query.trim().toLowerCase();
    this.selectedResultIndex = -1;
    
    if (!this.searchQuery) {
      this.clearModalSearchResults();
      return;
    }

    this.searchActive = true;
    
    // 過濾符合搜尋的標題
    this.filteredHeadings = this.headings.filter(heading => {
      if (!heading.visible) return false;
      const headingText = heading.text.toLowerCase();
      return this.fuzzyMatch(headingText, this.searchQuery);
    });

    this.renderSearchResults();
  }

  fuzzyMatch(text, query) {
    // Simple fuzzy matching algorithm
    if (!query) return true;
    
    // Direct substring match (case insensitive)
    if (text.includes(query)) return true;
    
    // Character sequence match (allows gaps between characters)
    let queryIndex = 0;
    for (let i = 0; i < text.length && queryIndex < query.length; i++) {
      if (text[i] === query[queryIndex]) {
        queryIndex++;
      }
    }
    
    return queryIndex === query.length;
  }

  renderSearchResults() {
    const resultsContainer = this.searchModal.querySelector('.eagle-toc-search-results');
    
    if (this.filteredHeadings.length === 0) {
      resultsContainer.innerHTML = `
        <div class="eagle-toc-search-no-results">
          找不到匹配的標題
        </div>
      `;
      return;
    }

    const resultsHTML = this.filteredHeadings.map((heading, index) => {
      const levelText = `H${heading.level}`;
      const highlightedTitle = this.highlightMatchingText(heading.text, this.searchQuery);
      
      return `
        <div class="eagle-toc-search-result-item" data-index="${index}">
          <div class="eagle-toc-search-result-content">
            <div class="eagle-toc-search-result-title">${highlightedTitle}</div>
            <div class="eagle-toc-search-result-level">${levelText}</div>
          </div>
        </div>
      `;
    }).join('');

    resultsContainer.innerHTML = resultsHTML;

    // 綁定點擊事件
    resultsContainer.querySelectorAll('.eagle-toc-search-result-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        this.selectSearchResult(index);
      });
    });
  }

  highlightMatchingText(originalText, query) {
    if (!query) {
      return originalText;
    }
    
    const lowerText = originalText.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    // Find direct matches to highlight
    const startIndex = lowerText.indexOf(lowerQuery);
    
    if (startIndex !== -1) {
      const beforeMatch = originalText.substring(0, startIndex);
      const match = originalText.substring(startIndex, startIndex + query.length);
      const afterMatch = originalText.substring(startIndex + query.length);
      
      return beforeMatch + 
             '<span class="eagle-toc-search-match">' + match + '</span>' + 
             afterMatch;
    }
    
    return originalText;
  }

  handleSearchKeydown(e) {
    if (e.key === 'Escape') {
      e.stopPropagation(); // 阻止事件冒泡，避免觸發全域的 ESC 處理器
      this.hideSearchModal();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.navigateResults(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.navigateResults(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this.selectCurrentResult();
    }
  }

  navigateResults(direction) {
    const maxIndex = this.filteredHeadings.length - 1;
    
    if (maxIndex < 0) return;
    
    this.selectedResultIndex = Math.max(0, Math.min(maxIndex, this.selectedResultIndex + direction));
    
    // 更新視覺選中狀態
    const resultItems = this.searchModal.querySelectorAll('.eagle-toc-search-result-item');
    resultItems.forEach((item, index) => {
      if (index === this.selectedResultIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
    
    // 立即滾動到對應的標題內容
    if (this.selectedResultIndex >= 0 && this.selectedResultIndex < this.filteredHeadings.length) {
      const heading = this.filteredHeadings[this.selectedResultIndex];
      this.scrollToHeading(heading);
    }
  }

  selectCurrentResult() {
    if (this.selectedResultIndex >= 0 && this.selectedResultIndex < this.filteredHeadings.length) {
      this.selectSearchResult(this.selectedResultIndex);
    } else if (this.filteredHeadings.length > 0) {
      this.selectSearchResult(0);
    }
  }

  selectSearchResult(index) {
    if (index < 0 || index >= this.filteredHeadings.length) return;
    
    const heading = this.filteredHeadings[index];
    this.hideSearchModal();
    this.scrollToHeading(heading);
  }

  clearModalSearch() {
    const searchInput = this.searchModal.querySelector('.eagle-toc-search-input');
    if (searchInput) {
      searchInput.value = '';
    }
    this.clearModalSearchResults();
  }

  clearModalSearchResults() {
    this.searchQuery = '';
    this.searchActive = false;
    this.filteredHeadings = [];
    this.selectedResultIndex = -1;
    
    const resultsContainer = this.searchModal.querySelector('.eagle-toc-search-results');
    if (resultsContainer) {
      resultsContainer.innerHTML = '';
    }
  }

  setupTooltips() {
    // 創建 tooltip 元素
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'eagle-toc-tooltip';
    document.body.appendChild(this.tooltip);
    
    // 為所有帶有 title 屬性的按鈕設置 tooltip
    const buttonsWithTitle = this.tocPanel.querySelectorAll('[title]');
    
    buttonsWithTitle.forEach(button => {
      const originalTitle = button.getAttribute('title');
      
      // 移除原生 title 屬性以避免原生 tooltip 顯示
      button.removeAttribute('title');
      
      // 存儲 tooltip 文本
      button.dataset.tooltip = originalTitle;
      
      // 添加事件監聽器
      button.addEventListener('mouseenter', (e) => {
        this.showTooltip(e.target, originalTitle);
      });
      
      button.addEventListener('mouseleave', () => {
        this.hideTooltip();
      });
      
      // 處理按鈕被點擊或失焦的情況
      button.addEventListener('mousedown', () => {
        this.hideTooltip();
      });
    });
  }
  
  showTooltip(element, text) {
    if (!text || !this.tooltip) return;
    
    this.tooltip.textContent = text;
    this.tooltip.classList.add('show');
    
    // 計算位置
    const rect = element.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    
    // 水平居中對齊到按鈕
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    
    // 確保不超出視窗邊界
    const padding = 10;
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));
    
    // 垂直位置在按鈕上方
    const top = rect.top - tooltipRect.height - 8;
    
    this.tooltip.style.left = left + 'px';
    this.tooltip.style.top = top + 'px';
  }
  
  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.classList.remove('show');
    }
  }

  adaptToPageBackground() {
    // 偵測網頁背景顏色
    const backgroundColor = this.detectPageBackground();
    const isDark = this.isColorDark(backgroundColor);
    
    // 根據背景顏色調整 TOC 面板的配色
    this.applyAdaptiveColors(isDark, backgroundColor);
  }

  detectPageBackground() {
    // 嘗試多個元素來獲取最具代表性的背景顏色
    const elementsToCheck = [
      document.body,
      document.documentElement,
      document.querySelector('main'),
      document.querySelector('.content'),
      document.querySelector('#content'),
      document.querySelector('article'),
      document.querySelector('.post'),
      document.querySelector('.page')
    ].filter(el => el !== null);

    for (let element of elementsToCheck) {
      const computed = window.getComputedStyle(element);
      const bgColor = computed.backgroundColor;
      
      // 如果背景不是透明的，使用這個顏色
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        return bgColor;
      }
    }
    
    // 如果所有元素都是透明的，默認為白色
    return 'rgb(255, 255, 255)';
  }

  isColorDark(color) {
    // 將顏色轉換為 RGB 值
    let rgb = this.parseColor(color);
    if (!rgb) return false;
    
    // 使用相對亮度公式判斷顏色深淺
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance < 0.5;
  }

  parseColor(color) {
    // 處理 rgb() 格式
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1]),
        g: parseInt(rgbMatch[2]),
        b: parseInt(rgbMatch[3])
      };
    }
    
    // 處理 rgba() 格式
    const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
    if (rgbaMatch) {
      return {
        r: parseInt(rgbaMatch[1]),
        g: parseInt(rgbaMatch[2]),
        b: parseInt(rgbaMatch[3])
      };
    }
    
    // 處理十六進制格式
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      if (hex.length === 6) {
        return {
          r: parseInt(hex.slice(0, 2), 16),
          g: parseInt(hex.slice(2, 4), 16),
          b: parseInt(hex.slice(4, 6), 16)
        };
      }
    }
    
    return null;
  }

  adjustBrightness(rgb, factor) {
    // factor > 1 = 變亮, factor < 1 = 變暗
    return {
      r: Math.min(255, Math.max(0, Math.round(rgb.r * factor))),
      g: Math.min(255, Math.max(0, Math.round(rgb.g * factor))),
      b: Math.min(255, Math.max(0, Math.round(rgb.b * factor)))
    };
  }

  adjustBrightnessAdditive(rgb, amount) {
    // amount > 0 = 增加亮度, amount < 0 = 減少亮度
    return {
      r: Math.min(255, Math.max(0, rgb.r + amount)),
      g: Math.min(255, Math.max(0, rgb.g + amount)),
      b: Math.min(255, Math.max(0, rgb.b + amount))
    };
  }

  rgbToString(rgb, alpha = 1) {
    if (alpha < 1) {
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    }
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }

  generateHarmonousColors(backgroundColor) {
    const rgb = this.parseColor(backgroundColor);
    if (!rgb) {
      // 預設顏色方案
      return {
        panelBg: 'rgba(255, 255, 255, 0.9)',
        headerBg: 'rgba(248, 249, 250, 0.95)',
        textColor: '#333333',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        shadowColor: 'rgba(0, 0, 0, 0.1)'
      };
    }

    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    const isDark = luminance < 0.5;

    if (isDark) {
      // 深色背景：使用較亮的相近色調
      const lighterBg = this.adjustBrightnessAdditive(rgb, 40);
      const lighterHeader = this.adjustBrightnessAdditive(rgb, 60);
      
      return {
        panelBg: this.rgbToString(lighterBg, 0.85),
        headerBg: this.rgbToString(lighterHeader, 0.9),
        textColor: '#e0e0e0',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        buttonBg: this.rgbToString(this.adjustBrightnessAdditive(rgb, 30), 0.8),
        buttonHoverBg: this.rgbToString(this.adjustBrightnessAdditive(rgb, 50), 0.8),
        itemHoverBg: this.rgbToString(this.adjustBrightnessAdditive(rgb, 25), 0.6)
      };
    } else {
      // 淺色背景：使用較暗的相近色調
      const darkerBg = this.adjustBrightnessAdditive(rgb, -25);
      const darkerHeader = this.adjustBrightnessAdditive(rgb, -35);
      
      return {
        panelBg: this.rgbToString(darkerBg, 0.85),
        headerBg: this.rgbToString(darkerHeader, 0.9),
        textColor: '#333333',
        borderColor: 'rgba(0, 0, 0, 0.12)',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        buttonBg: this.rgbToString(this.adjustBrightnessAdditive(rgb, -15), 0.8),
        buttonHoverBg: this.rgbToString(this.adjustBrightnessAdditive(rgb, -30), 0.8),
        itemHoverBg: this.rgbToString(this.adjustBrightnessAdditive(rgb, -15), 0.6)
      };
    }
  }

  getContrastColor(backgroundColor) {
    const rgb = this.parseColor(backgroundColor);
    if (!rgb) return '#333333';
    
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance < 0.5 ? '#e0e0e0' : '#333333';
  }

  applyAdaptiveColors(isDark, backgroundColor) {
    if (!this.tocPanel) return;
    
    // 檢查是否使用預設主題
    if (this.currentTheme !== 'auto') {
      this.applyTheme(this.currentTheme);
      return;
    }
    
    // 生成和諧的配色方案
    const colors = this.generateHarmonousColors(backgroundColor);
    
    // 創建自定義 CSS 變數
    const customStyle = document.createElement('style');
    customStyle.id = 'eagle-toc-adaptive-colors';
    
    // 移除已存在的樣式
    const existingStyle = document.getElementById('eagle-toc-adaptive-colors');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // 使用融合式配色方案
    const cssRules = `
      .eagle-toc-panel {
        background: ${colors.panelBg} !important;
        color: ${colors.textColor} !important;
        border: 1px solid ${colors.borderColor} !important;
        box-shadow: 0 4px 16px ${colors.shadowColor} !important;
        backdrop-filter: blur(8px) !important;
      }
      
      .eagle-toc-header {
        background: ${colors.headerBg} !important;
        border-bottom: 1px solid ${colors.borderColor} !important;
        color: ${colors.textColor} !important;
      }
      
      .eagle-toc-controls button {
        color: ${colors.textColor} !important;
        background: ${colors.buttonBg} !important;
        opacity: 0.8 !important;
      }
      
      .eagle-toc-controls button:hover {
        background: ${colors.buttonHoverBg} !important;
        color: ${colors.textColor} !important;
        opacity: 1 !important;
      }
      
      .eagle-toc-item {
        color: ${colors.textColor} !important;
      }
      
      .eagle-toc-item:hover {
        background: ${colors.itemHoverBg} !important;
      }
      
      .eagle-toc-item.active {
        background: ${isDark ? 'rgba(56, 88, 152, 0.4)' : 'rgba(9, 105, 218, 0.15)'} !important;
        color: ${isDark ? '#ffffff' : '#0969da'} !important;
        border-left: 3px solid ${isDark ? '#5B9BD5' : '#0969da'} !important;
      }
      
      .eagle-toc-depth-controls {
        background: ${colors.buttonBg} !important;
        border: 1px solid ${colors.borderColor} !important;
      }
      
      .eagle-toc-depth-controls button {
        color: ${colors.textColor} !important;
        background: transparent !important;
      }
      
      .eagle-toc-depth-controls button:hover {
        background: ${colors.buttonHoverBg} !important;
      }
      
      .eagle-toc-depth-display {
        color: ${colors.textColor} !important;
        background: transparent !important;
      }
      
      .eagle-toc-font-toolbar-controls {
        background: ${colors.buttonBg} !important;
        border: 1px solid ${colors.borderColor} !important;
      }
      
      .eagle-toc-font-toolbar-controls button {
        color: ${colors.textColor} !important;
        background: transparent !important;
      }
      
      .eagle-toc-font-toolbar-controls button:hover {
        background: ${colors.buttonHoverBg} !important;
      }
      
      .eagle-toc-font-toolbar-display {
        color: ${colors.textColor} !important;
        background: transparent !important;
      }
      
      .eagle-toc-settings-panel {
        background: ${colors.panelBg} !important;
        border-top: 1px solid ${colors.borderColor} !important;
      }
      
      .eagle-toc-settings-label {
        color: ${colors.textColor} !important;
      }
      
      .eagle-toc-font-size-display {
        color: ${colors.textColor} !important;
      }
      
      .eagle-toc-search-modal {
        background: ${colors.panelBg} !important;
        border: 1px solid ${colors.borderColor} !important;
        box-shadow: 0 8px 24px ${colors.shadowColor} !important;
      }
      
      .eagle-toc-search-input {
        background: ${colors.buttonBg} !important;
        color: ${colors.textColor} !important;
        border: 1px solid ${colors.borderColor} !important;
      }
      
      .eagle-toc-search-input::placeholder {
        color: ${isDark ? 'rgba(224, 224, 224, 0.6)' : 'rgba(51, 51, 51, 0.6)'} !important;
      }
      
      .eagle-toc-search-results {
        background: ${colors.panelBg} !important;
      }
      
      .eagle-toc-search-result {
        color: ${colors.textColor} !important;
      }
      
      .eagle-toc-search-result:hover,
      .eagle-toc-search-result.selected {
        background: ${colors.itemHoverBg} !important;
      }
      
      .eagle-toc-content {
        background: ${colors.panelBg} !important;
        color: ${colors.textColor} !important;
      }
      
      .eagle-toc-loading,
      .eagle-toc-no-headings {
        color: ${colors.textColor} !important;
      }
      
      .eagle-toc-link {
        color: ${colors.textColor} !important;
      }
      
      .eagle-toc-item.eagle-toc-active {
        background: ${isDark ? 'rgba(56, 88, 152, 0.4)' : 'rgba(9, 105, 218, 0.15)'} !important;
        color: ${isDark ? '#ffffff' : '#0969da'} !important;
      }
      
      .eagle-toc-item.eagle-toc-active .eagle-toc-link {
        color: ${isDark ? '#ffffff' : '#0969da'} !important;
      }
      
      .eagle-toc-no-search-results {
        color: ${colors.textColor} !important;
        opacity: 0.7;
      }
      
      .eagle-toc-content::-webkit-scrollbar-track {
        background: ${colors.buttonBg} !important;
      }
      
      .eagle-toc-content::-webkit-scrollbar-thumb {
        background: ${colors.borderColor} !important;
      }
      
      .eagle-toc-content::-webkit-scrollbar-thumb:hover {
        background: ${colors.buttonHoverBg} !important;
      }
    `;
    
    customStyle.textContent = cssRules;
    document.head.appendChild(customStyle);
  }

  applyTheme(themeName) {
    if (!this.tocPanel || !this.themes[themeName]) return;
    
    const colors = this.themes[themeName];
    const isDark = themeName === 'dark' || (colors.textColor && colors.textColor.includes('ffffff'));
    
    // 創建自定義 CSS 變數
    const customStyle = document.createElement('style');
    customStyle.id = 'eagle-toc-adaptive-colors';
    
    // 移除已存在的樣式
    const existingStyle = document.getElementById('eagle-toc-adaptive-colors');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // 使用主題配色方案
    const cssRules = `
      .eagle-toc-panel {
        background: ${colors.panelBg} !important;
        color: ${colors.textColor} !important;
        border: 1px solid ${colors.borderColor} !important;
        box-shadow: 0 4px 16px ${colors.shadowColor} !important;
        backdrop-filter: blur(8px) !important;
      }
      
      .eagle-toc-header {
        background: ${colors.headerBg} !important;
        border-bottom: 1px solid ${colors.borderColor} !important;
        color: ${colors.textColor} !important;
      }
      
      .eagle-toc-controls button {
        color: ${colors.textColor} !important;
        background: ${colors.buttonBg} !important;
        opacity: 0.8 !important;
      }
      
      .eagle-toc-controls button:hover {
        background: ${colors.buttonHoverBg} !important;
        color: ${colors.textColor} !important;
        opacity: 1 !important;
      }
      
      .eagle-toc-item {
        color: ${colors.textColor} !important;
      }
      
      .eagle-toc-item:hover {
        background: ${colors.itemHoverBg} !important;
      }
      
      .eagle-toc-item.active {
        background: ${isDark ? 'rgba(56, 88, 152, 0.4)' : 'rgba(9, 105, 218, 0.15)'} !important;
        color: ${isDark ? '#ffffff' : '#0969da'} !important;
        border-left: 3px solid ${isDark ? '#5B9BD5' : '#0969da'} !important;
      }
      
      .eagle-toc-depth-controls {
        background: ${colors.buttonBg} !important;
        border: 1px solid ${colors.borderColor} !important;
      }
      
      .eagle-toc-depth-controls button {
        color: ${colors.textColor} !important;
        background: transparent !important;
      }
      
      .eagle-toc-depth-controls button:hover {
        background: ${colors.buttonHoverBg} !important;
      }
      
      .eagle-toc-depth-display {
        color: ${colors.textColor} !important;
        background: transparent !important;
      }
      
      .eagle-toc-font-toolbar-controls {
        background: ${colors.buttonBg} !important;
        border: 1px solid ${colors.borderColor} !important;
      }
      
      .eagle-toc-font-toolbar-controls button {
        color: ${colors.textColor} !important;
        background: transparent !important;
      }
      
      .eagle-toc-font-toolbar-controls button:hover {
        background: ${colors.buttonHoverBg} !important;
      }
      
      .eagle-toc-font-toolbar-display {
        color: ${colors.textColor} !important;
        background: transparent !important;
      }
      
      .eagle-toc-settings-panel {
        background: ${colors.panelBg} !important;
        border-top: 1px solid ${colors.borderColor} !important;
      }
      
      .eagle-toc-settings-label {
        color: ${colors.textColor} !important;
      }
      
      .eagle-toc-font-size-display {
        color: ${colors.textColor} !important;
      }
      
      .eagle-toc-search-modal {
        background: ${colors.panelBg} !important;
        border: 1px solid ${colors.borderColor} !important;
        box-shadow: 0 8px 24px ${colors.shadowColor} !important;
      }
      
      .eagle-toc-search-input {
        background: ${colors.buttonBg} !important;
        color: ${colors.textColor} !important;
        border: 1px solid ${colors.borderColor} !important;
      }
      
      .eagle-toc-search-input::placeholder {
        color: ${isDark ? 'rgba(224, 224, 224, 0.6)' : 'rgba(51, 51, 51, 0.6)'} !important;
      }
      
      .eagle-toc-search-results {
        background: ${colors.panelBg} !important;
      }
      
      .eagle-toc-search-result {
        color: ${colors.textColor} !important;
      }
      
      .eagle-toc-search-result:hover,
      .eagle-toc-search-result.selected {
        background: ${colors.itemHoverBg} !important;
      }
      
      .eagle-toc-theme-menu {
        background: ${colors.panelBg} !important;
        border: 1px solid ${colors.borderColor} !important;
        box-shadow: 0 4px 12px ${colors.shadowColor} !important;
      }
      
      .eagle-toc-theme-option {
        color: ${colors.textColor} !important;
      }
      
      .eagle-toc-theme-option:hover {
        background: ${colors.itemHoverBg} !important;
      }
      
      .eagle-toc-content {
        background: ${colors.panelBg} !important;
        color: ${colors.textColor} !important;
      }
      
      .eagle-toc-loading,
      .eagle-toc-no-headings {
        color: ${colors.textColor} !important;
      }
      
      .eagle-toc-link {
        color: ${colors.textColor} !important;
      }
      
      .eagle-toc-item.eagle-toc-active {
        background: ${isDark ? 'rgba(56, 88, 152, 0.4)' : 'rgba(9, 105, 218, 0.15)'} !important;
        color: ${isDark ? '#ffffff' : '#0969da'} !important;
      }
      
      .eagle-toc-item.eagle-toc-active .eagle-toc-link {
        color: ${isDark ? '#ffffff' : '#0969da'} !important;
      }
      
      .eagle-toc-no-search-results {
        color: ${colors.textColor} !important;
        opacity: 0.7;
      }
      
      .eagle-toc-content::-webkit-scrollbar-track {
        background: ${colors.buttonBg} !important;
      }
      
      .eagle-toc-content::-webkit-scrollbar-thumb {
        background: ${colors.borderColor} !important;
      }
      
      .eagle-toc-content::-webkit-scrollbar-thumb:hover {
        background: ${colors.buttonHoverBg} !important;
      }
    `;
    
    customStyle.textContent = cssRules;
    document.head.appendChild(customStyle);
    
    // 更新主題選單的選中狀態
    this.updateThemeMenuSelection();
  }

  switchToNextTheme() {
    const themeKeys = Object.keys(this.themes);
    const currentIndex = themeKeys.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    const nextTheme = themeKeys[nextIndex];
    
    this.setTheme(nextTheme);
  }

  setTheme(themeName) {
    if (!this.themes.hasOwnProperty(themeName)) return;
    
    this.currentTheme = themeName;
    this.settings.theme = themeName;
    
    // 儲存到 chrome.storage
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({
        action: 'save-settings',
        settings: { theme: themeName }
      });
    }
    
    // 應用主題
    if (themeName === 'auto') {
      // 重新偵測背景
      this.adaptToPageBackground();
    } else {
      this.applyTheme(themeName);
    }
    
    // 顯示主題切換提示
    this.showThemeToast(themeName);
    
    // 更新主題選單
    this.updateThemeMenuSelection();
  }

  updateThemeMenuSelection() {
    const themeOptions = this.tocPanel.querySelectorAll('.eagle-toc-theme-option');
    themeOptions.forEach(option => {
      const theme = option.dataset.theme;
      if (theme === this.currentTheme) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  }

  showThemeToast(themeName) {
    const themeNames = {
      auto: '自動適應',
      light: '亮色主題',
      dark: '深色主題',
      ocean: '海洋主題',
      forest: '森林主題',
      sunset: '日落主題',
      coral: '珊瑚主題'
    };
    
    // 創建 toast 元素
    const toast = document.createElement('div');
    toast.className = 'eagle-toc-theme-toast';
    toast.textContent = `已切換至 ${themeNames[themeName] || themeName}`;
    
    // 添加到面板中
    this.tocPanel.appendChild(toast);
    
    // 顯示動畫
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // 自動隱藏
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 1500);
  }

  setupThemeEvents() {
    if (!this.tocPanel) return;
    
    const themeMenu = this.tocPanel.querySelector('.eagle-toc-theme-menu');
    if (!themeMenu) return;
    
    this.themeMenu = themeMenu;
    
    // 選單項目點擊
    const themeOptions = themeMenu.querySelectorAll('.eagle-toc-theme-option');
    themeOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const themeName = option.dataset.theme;
        this.setTheme(themeName);
        this.hideThemeMenu();
      });
    });
    
    // 點擊外部隱藏選單 - 主題選單現在由更多選單中的主題選項觸發
    
    // 鍵盤快捷鍵 Alt+T
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 't') {
        e.preventDefault();
        this.switchToNextTheme();
      }
    });
    
    // 初始化主題選單狀態
    this.updateThemeMenuSelection();
  }

  showThemeMenu() {
    if (this.themeMenu) {
      this.themeMenu.style.display = 'block';
    }
  }

  hideThemeMenu() {
    if (this.themeMenu) {
      this.themeMenu.style.display = 'none';
    }
  }

  toggleThemeMenu() {
    if (this.themeMenu) {
      const isVisible = this.themeMenu.style.display === 'block';
      this.themeMenu.style.display = isVisible ? 'none' : 'block';
    }
  }

  // 更多選單相關方法
  showMoreMenu() {
    if (this.moreMenu) {
      this.moreMenu.classList.add('show');
    }
  }

  hideMoreMenu() {
    if (this.moreMenu) {
      this.moreMenu.classList.remove('show');
    }
  }

  toggleMoreMenu() {
    if (this.moreMenu) {
      const isVisible = this.moreMenu.classList.contains('show');
      if (isVisible) {
        this.hideMoreMenu();
      } else {
        this.showMoreMenu();
      }
    }
  }

  // 釘選功能相關方法 - 將當前網址加入/移除自動啟動白名單 [v2.0]
  async togglePin() {
    console.log('🔥 Using NEW togglePin method v2.0');
    const currentDomain = window.location.hostname;
    const isExactlyInWhitelist = this.isExactlyInWhitelist(currentDomain);
    
    console.log('🎯 Toggle pin - Current domain:', currentDomain);
    console.log('🔍 Is exactly in whitelist (NEW METHOD):', isExactlyInWhitelist);
    console.log('📋 Current whitelist:', this.settings.autoShowWhitelist);
    
    let success = false;
    
    if (isExactlyInWhitelist) {
      success = await this.removeFromWhitelist(currentDomain);
      console.log('Remove result:', success);
      if (success) {
        this.showNotification(`已取消自動開啟\n${currentDomain} 將不會自動顯示 EagleToc`, 4000, 'pin-action');
      } else {
        this.showNotification(`取消失敗，請稍後再試`);
      }
    } else {
      success = await this.addToWhitelist(currentDomain);
      console.log('Add result:', success);
      if (success) {
        this.showNotification(`已設定自動開啟\n下次訪問 ${currentDomain} 將自動顯示 EagleToc`, 4000, 'pin-action');
      } else {
        this.showNotification(`設定失敗，請稍後再試`);
      }
    }
    
    if (success) {
      // 重新檢查自動顯示條件，可能需要取消或啟動自動顯示
      this.recheckAutoShowConditions();
      // 更新釘選按鈕狀態
      this.updatePinButtonState();
    }
  }

  // 更新釘選按鈕的顯示狀態
  updatePinButtonState() {
    const pinOption = this.tocPanel.querySelector('.eagle-toc-more-option.eagle-toc-pin');
    if (!pinOption) return;
    
    const currentDomain = window.location.hostname;
    const isExactlyInWhitelist = this.isExactlyInWhitelist(currentDomain);
    const iconElement = pinOption.querySelector('.eagle-toc-more-icon');
    const textElement = pinOption.querySelector('.eagle-toc-more-text');
    
    if (isExactlyInWhitelist) {
      iconElement.textContent = '📌';
      textElement.textContent = '取消自動開啟';
      pinOption.removeAttribute('title');
      pinOption.style.color = '#d73a49';
    } else {
      iconElement.textContent = '📍';
      textElement.textContent = '自動開啟';
      pinOption.removeAttribute('title');
      pinOption.style.color = '';
    }
  }

  // 重新檢查自動顯示條件（在設定改變後使用）
  recheckAutoShowConditions() {
    console.log('🔄 Rechecking auto show conditions after settings change...');
    
    // 檢查是否滿足基本條件（標題數量）
    const hasEnoughHeadings = this.headings.length >= this.settings.autoShowMinHeadings;
    if (!hasEnoughHeadings) {
      console.log('❌ Not enough headings, cancelling any pending auto show');
      if (this.autoShowTimeout) {
        clearTimeout(this.autoShowTimeout);
        this.autoShowTimeout = null;
      }
      return;
    }
    
    // 檢查是否應該自動顯示
    const shouldShow = this.shouldAutoShowBySettings();
    console.log(`⚙️ Should auto show after recheck: ${shouldShow}`);
    
    if (!shouldShow) {
      // 如果不應該自動顯示，取消任何待處理的自動顯示
      if (this.autoShowTimeout) {
        clearTimeout(this.autoShowTimeout);
        this.autoShowTimeout = null;
        console.log('🗑️ Cancelled pending auto show due to settings change');
      }
    }
    // 注意：如果 shouldShow 為 true，我們不重新啟動自動顯示，
    // 因為用戶可能是在頁面載入後才加入白名單，此時不應該自動顯示
  }


  // 拖曳功能
  makeDraggable() {
    const header = this.tocPanel.querySelector('.eagle-toc-header');
    
    // Bind methods once
    this.boundHandleDrag = this.handleDrag.bind(this);
    this.boundStopDragging = this.stopDragging.bind(this);
    
    header.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      
      this.isDragging = true;
      this.tocPanel.classList.add('eagle-toc-dragging');
      const rect = this.tocPanel.getBoundingClientRect();
      this.dragOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      document.addEventListener('mousemove', this.boundHandleDrag);
      document.addEventListener('mouseup', this.boundStopDragging);
      
      e.preventDefault();
    });
  }

  // 調整大小功能
  makeResizable() {
    const resizeHandles = this.tocPanel.querySelectorAll('.resize-handle');
    
    resizeHandles.forEach(handle => {
      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation(); // 防止觸發拖拽功能
        
        const handleClass = Array.from(handle.classList).find(cls => cls.startsWith('resize-handle-'));
        const resizeType = handleClass.replace('resize-handle-', '');
        
        this.isResizing = true;
        this.resizeType = resizeType;
        
        // 記錄初始狀態
        const rect = this.tocPanel.getBoundingClientRect();
        this.resizeStart = {
          x: e.clientX,
          y: e.clientY,
          width: rect.width,
          height: rect.height,
          left: rect.left,
          top: rect.top
        };
        
        // 綁定事件處理函數
        this.boundHandleResize = this.handleResize.bind(this);
        this.boundStopResize = this.stopResize.bind(this);
        
        document.addEventListener('mousemove', this.boundHandleResize);
        document.addEventListener('mouseup', this.boundStopResize);
        
        // 添加調整大小時的樣式
        this.tocPanel.classList.add('eagle-toc-resizing');
      });
    });
  }

  handleResize(e) {
    if (!this.isResizing) return;
    
    const deltaX = e.clientX - this.resizeStart.x;
    const deltaY = e.clientY - this.resizeStart.y;
    
    let newWidth = this.resizeStart.width;
    let newHeight = this.resizeStart.height;
    let newLeft = this.tocPanel.style.left;
    let newTop = this.tocPanel.style.top;
    
    // 根據調整類型計算新尺寸和位置
    switch (this.resizeType) {
      case 'right':
        newWidth = Math.max(250, this.resizeStart.width + deltaX);
        break;
        
      case 'left':
        newWidth = Math.max(250, this.resizeStart.width - deltaX);
        newLeft = (this.resizeStart.left + deltaX) + 'px';
        break;
        
      case 'bottom':
        newHeight = Math.max(200, this.resizeStart.height + deltaY);
        break;
        
      case 'top':
        newHeight = Math.max(200, this.resizeStart.height - deltaY);
        newTop = (this.resizeStart.top + deltaY) + 'px';
        break;
        
      case 'corner-se': // 右下角
        newWidth = Math.max(250, this.resizeStart.width + deltaX);
        newHeight = Math.max(200, this.resizeStart.height + deltaY);
        break;
        
      case 'corner-sw': // 左下角
        newWidth = Math.max(250, this.resizeStart.width - deltaX);
        newHeight = Math.max(200, this.resizeStart.height + deltaY);
        newLeft = (this.resizeStart.left + deltaX) + 'px';
        break;
        
      case 'corner-ne': // 右上角
        newWidth = Math.max(250, this.resizeStart.width + deltaX);
        newHeight = Math.max(200, this.resizeStart.height - deltaY);
        newTop = (this.resizeStart.top + deltaY) + 'px';
        break;
        
      case 'corner-nw': // 左上角
        newWidth = Math.max(250, this.resizeStart.width - deltaX);
        newHeight = Math.max(200, this.resizeStart.height - deltaY);
        newLeft = (this.resizeStart.left + deltaX) + 'px';
        newTop = (this.resizeStart.top + deltaY) + 'px';
        break;
    }
    
    // 應用新尺寸和位置
    this.tocPanel.style.width = newWidth + 'px';
    this.tocPanel.style.height = newHeight + 'px';
    
    if (newLeft !== this.tocPanel.style.left) {
      this.tocPanel.style.left = newLeft;
      this.tocPanel.style.right = 'auto';
    }
    
    if (newTop !== this.tocPanel.style.top) {
      this.tocPanel.style.top = newTop;
    }
    
    // 更新設定中的寬度
    this.settings.tocWidth = newWidth;
  }

  stopResize() {
    if (!this.isResizing) return;
    
    this.isResizing = false;
    this.resizeType = null;
    
    // 移除事件監聽器
    document.removeEventListener('mousemove', this.boundHandleResize);
    document.removeEventListener('mouseup', this.boundStopResize);
    
    // 移除調整大小時的樣式
    this.tocPanel.classList.remove('eagle-toc-resizing');
    
    // 保存設定
    this.saveSettings();
  }

  // Zen Mode 功能 - 版本1: 基礎跑馬燈效果
  toggleZenMode() {
    if (this.zenMode) {
      this.exitZenMode();
    } else {
      this.enterZenMode();
    }
  }

  enterZenMode() {
    if (this.headings.length === 0) {
      console.log('No headings found for Zen Mode');
      return;
    }

    this.zenMode = true;
    
    // 載入個人化設置
    this.loadZenSettings();
    
    // 創建 Zen Mode 容器
    this.createZenContainer();
    
    // 生成內容
    this.generateZenContent();
    
    // 開始滾動動畫
    this.startZenScroll();
    
    // 添加鍵盤監聽
    this.setupZenKeyboardEvents();
    
    // 隱藏原始 TOC 面板
    this.tocPanel.style.display = 'none';
  }

  exitZenMode() {
    this.zenMode = false;
    
    // 停止動畫
    if (this.zenAnimationId) {
      cancelAnimationFrame(this.zenAnimationId);
      this.zenAnimationId = null;
    }
    
    // 移除 Zen Mode 容器
    if (this.zenContainer && this.zenContainer.parentNode) {
      this.zenContainer.parentNode.removeChild(this.zenContainer);
    }
    
    // 清理引用
    this.zenContainer = null;
    this.zenScrollContainer = null;
    this.zenContent = null;
    this.zenControlPanel = null;
    
    // 重置狀態
    this.zenPaused = false;
    this.zenProgress = 0;
    this.zenStartTime = 0;
    
    // 顯示原始 TOC 面板
    this.tocPanel.style.display = '';
    
    // 移除鍵盤監聽
    this.removeZenKeyboardEvents();
  }

  createZenContainer() {
    this.zenContainer = document.createElement('div');
    this.zenContainer.className = 'eagle-toc-zen-container zen-v3-premium';
    
    this.zenContainer.innerHTML = `
      <div class="eagle-toc-zen-overlay"></div>
      <div class="eagle-toc-zen-scroll-container">
        <div class="eagle-toc-zen-content"></div>
      </div>
      <div class="eagle-toc-zen-controls">
        <div class="zen-control-group">
          <button class="zen-control-btn zen-play-pause" title="暫停/繼續 (空格鍵)">
            <svg class="zen-play-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0zm4.879-2.773l4.264 2.559a.25.25 0 0 1 0 .428l-4.264 2.559A.25.25 0 0 1 6 10.559V5.442a.25.25 0 0 1 .379-.215z" fill="currentColor"/>
            </svg>
            <svg class="zen-pause-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" style="display: none;">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0zm2-1.5v3a.5.5 0 0 0 1 0v-3a.5.5 0 0 0-1 0zm3.5 0v3a.5.5 0 0 0 1 0v-3a.5.5 0 0 0-1 0z" fill="currentColor"/>
            </svg>
          </button>
          <div class="zen-speed-controls">
            <button class="zen-control-btn zen-speed-btn" data-speed="slow" title="慢速">🐌</button>
            <button class="zen-control-btn zen-speed-btn active" data-speed="medium" title="中速">🚶</button>
            <button class="zen-control-btn zen-speed-btn" data-speed="fast" title="快速">🏃</button>
          </div>
          <button class="zen-control-btn zen-settings-btn" title="個性化設置 (S鍵)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
              <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" fill="currentColor"/>
              <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.292-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.292c.415.764-.42 1.6-1.185 1.184l-.292-.159a1.873 1.873 0 0 0-2.692 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.693-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.292A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <div class="zen-progress-container">
          <div class="zen-progress-bar">
            <div class="zen-progress-fill"></div>
          </div>
          <span class="zen-progress-text">0%</span>
        </div>
      </div>
      <div class="eagle-toc-zen-instructions">
        <div>ESC: 退出 | 空格: 暫停/繼續 | ↑↓: 手動滾動 | S: 設置</div>
      </div>
      <div class="zen-settings-panel" style="display: none;">
        <div class="zen-settings-content">
          <h3>🎨 個性化設置</h3>
          
          <div class="zen-setting-group">
            <label>主題選擇</label>
            <div class="zen-theme-grid">
              <button class="zen-theme-btn active" data-theme="classic">
                <div class="theme-preview classic-preview"></div>
                <span>經典</span>
              </button>
              <button class="zen-theme-btn" data-theme="starry">
                <div class="theme-preview starry-preview"></div>
                <span>星空</span>
              </button>
              <button class="zen-theme-btn" data-theme="ocean">
                <div class="theme-preview ocean-preview"></div>
                <span>海洋</span>
              </button>
              <button class="zen-theme-btn" data-theme="forest">
                <div class="theme-preview forest-preview"></div>
                <span>森林</span>
              </button>
              <button class="zen-theme-btn" data-theme="sunset">
                <div class="theme-preview sunset-preview"></div>
                <span>夕陽</span>
              </button>
              <button class="zen-theme-btn" data-theme="galaxy">
                <div class="theme-preview galaxy-preview"></div>
                <span>銀河</span>
              </button>
            </div>
          </div>
          
          <div class="zen-setting-group">
            <label>字體大小: <span class="zen-font-size-value">${this.zenFontSize}px</span></label>
            <input type="range" class="zen-font-size-slider" min="20" max="60" value="${this.zenFontSize}">
          </div>
          
          <div class="zen-setting-group">
            <label>行間距: <span class="zen-line-spacing-value">${this.zenLineSpacing}px</span></label>
            <input type="range" class="zen-line-spacing-slider" min="40" max="120" value="${this.zenLineSpacing}">
          </div>
          
          <div class="zen-setting-group">
            <label>背景模糊: <span class="zen-blur-value">${this.zenBlurLevel}px</span></label>
            <input type="range" class="zen-blur-slider" min="0" max="40" value="${this.zenBlurLevel}">
          </div>
          
          <div class="zen-setting-actions">
            <button class="zen-settings-close">關閉</button>
            <button class="zen-settings-reset">重置</button>
          </div>
        </div>
      </div>
    `;
    
    this.zenScrollContainer = this.zenContainer.querySelector('.eagle-toc-zen-scroll-container');
    this.zenContent = this.zenContainer.querySelector('.eagle-toc-zen-content');
    this.zenControlPanel = this.zenContainer.querySelector('.eagle-toc-zen-controls');
    this.zenSettingsPanel = this.zenContainer.querySelector('.zen-settings-panel');
    
    // 設置控制面板事件
    this.setupZenControlEvents();
    
    // 應用當前主題
    this.applyZenTheme();
    
    document.body.appendChild(this.zenContainer);
  }

  setupZenControlEvents() {
    // 播放/暫停按鈕
    const playPauseBtn = this.zenContainer.querySelector('.zen-play-pause');
    playPauseBtn.addEventListener('click', () => {
      this.toggleZenPlayPause();
    });

    // 速度控制按鈕
    const speedBtns = this.zenContainer.querySelectorAll('.zen-speed-btn');
    speedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setZenSpeed(btn.dataset.speed);
        
        // 更新按鈕狀態
        speedBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // 設置按鈕
    const settingsBtn = this.zenContainer.querySelector('.zen-settings-btn');
    settingsBtn.addEventListener('click', () => {
      this.toggleZenSettings();
    });

    // 設置面板事件
    this.setupZenSettingsEvents();
  }

  toggleZenPlayPause() {
    this.zenPaused = !this.zenPaused;
    
    const playIcon = this.zenContainer.querySelector('.zen-play-icon');
    const pauseIcon = this.zenContainer.querySelector('.zen-pause-icon');
    
    if (this.zenPaused) {
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
    } else {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
    }
  }

  setZenSpeed(speed) {
    this.zenSpeed = speed;
    
    // 重新計算持續時間
    const baseSpeed = 30000; // 基礎30秒
    switch (speed) {
      case 'slow':
        this.zenDuration = baseSpeed * 1.5; // 45秒
        break;
      case 'medium':
        this.zenDuration = baseSpeed; // 30秒
        break;
      case 'fast':
        this.zenDuration = baseSpeed * 0.7; // 21秒
        break;
    }
  }

  updateZenProgress() {
    if (!this.zenMode || !this.zenStartTime) return;
    
    const elapsed = Date.now() - this.zenStartTime;
    const progress = Math.min(elapsed / this.zenDuration, 1);
    this.zenProgress = progress;
    
    const progressFill = this.zenContainer.querySelector('.zen-progress-fill');
    const progressText = this.zenContainer.querySelector('.zen-progress-text');
    
    if (progressFill && progressText) {
      progressFill.style.width = `${progress * 100}%`;
      progressText.textContent = `${Math.round(progress * 100)}%`;
    }
  }

  generateZenContent() {
    const contentHtml = this.headings.map((heading, index) => {
      const levelClass = `zen-level-${heading.level}`;
      const spacing = index < this.headings.length - 1 ? 'margin-bottom: 80px;' : '';
      
      return `
        <div class="eagle-toc-zen-item ${levelClass}" style="${spacing}" data-index="${index}">
          <div class="eagle-toc-zen-item-text">${heading.text}</div>
        </div>
      `;
    }).join('');
    
    // 添加開頭和結尾的空白空間
    this.zenContent.innerHTML = `
      <div style="height: 100vh;"></div>
      ${contentHtml}
      <div style="height: 100vh;"></div>
    `;
  }

  startZenScroll() {
    // 重置位置到頂部 (版本2增強：改為由上往下滾動)
    this.zenScrollContainer.scrollTop = 0;
    
    // 初始化滾動參數
    this.zenStartTime = Date.now();
    this.zenPaused = false;
    this.zenManualScrollActive = false; // 版本2增強：手動滾動狀態追蹤
    const startScrollTop = this.zenScrollContainer.scrollTop;
    const maxScrollTop = this.zenScrollContainer.scrollHeight - this.zenScrollContainer.clientHeight;
    
    // 版本2增強：顯示方向指示器 (已移除，避免干擾用戶)
    // this.showDirectionIndicator('向下');
    
    // 設置初始狀態
    const pauseIcon = this.zenContainer.querySelector('.zen-pause-icon');
    const playIcon = this.zenContainer.querySelector('.zen-play-icon');
    pauseIcon.style.display = 'block';
    playIcon.style.display = 'none';
    
    // 開始動畫循環
    const animateScroll = () => {
      if (!this.zenMode) {
        if (this.zenAnimationId) {
          cancelAnimationFrame(this.zenAnimationId);
        }
        return;
      }
      
      if (!this.zenPaused) {
        const elapsed = Date.now() - this.zenStartTime;
        const progress = Math.min(elapsed / this.zenDuration, 1);
        
        // 使用緩入緩出動畫 (版本2增強：改為向下滾動並增強回馔)
        const easeProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI);
        
        // 版本2增強：不在手動滾動時更新位置
        if (!this.zenManualScrollActive) {
          this.zenScrollContainer.scrollTop = startScrollTop + (maxScrollTop * easeProgress);
        }
        
        // 更新進度
        this.updateZenProgress();
        
        // 檢查是否完成
        if (progress >= 1) {
          this.onZenScrollComplete();
          return;
        }
      }
      
      this.zenAnimationId = requestAnimationFrame(animateScroll);
    };
    
    this.zenAnimationId = requestAnimationFrame(animateScroll);
  }

  onZenScrollComplete() {
    // 滾動完成時的處理
    console.log('Zen Mode scroll completed');
    
    // 可以在這裡添加完成後的動作，比如重播選項
    setTimeout(() => {
      if (this.zenMode) {
        // 重置到開始位置，準備重播 (版本2增強：重置到頂部)
        this.zenScrollContainer.scrollTop = 0;
        this.zenStartTime = Date.now();
        this.startZenScroll();
      }
    }, 2000);
  }

  setupZenKeyboardEvents() {
    this.zenKeyHandler = (e) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          this.exitZenMode();
          break;
        case ' ':
        case 'Space':
          e.preventDefault();
          this.toggleZenPlayPause();
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.manualZenScroll(-100);
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.manualZenScroll(100);
          break;
        case '1':
          e.preventDefault();
          this.setZenSpeed('slow');
          this.updateSpeedButtonStates();
          break;
        case '2':
          e.preventDefault();
          this.setZenSpeed('medium');
          this.updateSpeedButtonStates();
          break;
        case '3':
          e.preventDefault();
          this.setZenSpeed('fast');
          this.updateSpeedButtonStates();
          break;
        case 's':
        case 'S':
          e.preventDefault();
          this.toggleZenSettings();
          break;
      }
    };
    
    document.addEventListener('keydown', this.zenKeyHandler);
  }

  manualZenScroll(delta) {
    if (!this.zenMode) return;
    
    // 版本2增強：標記手動滾動狀態
    this.zenManualScrollActive = true;
    
    const currentScrollTop = this.zenScrollContainer.scrollTop;
    const maxScrollTop = this.zenScrollContainer.scrollHeight - this.zenScrollContainer.clientHeight;
    const newScrollTop = Math.max(0, Math.min(maxScrollTop, currentScrollTop + delta));
    
    // 版本2增強：平滑轉場動畫
    this.smoothScrollTo(newScrollTop);
    
    // 版本2增強：顯示方向指示 (已移除，避免干擾用戶)
    // const direction = delta > 0 ? '向下' : '向上';
    // this.showDirectionIndicator(direction);
    
    // 版本2增強：短暂停止手動滾動狀態
    clearTimeout(this.zenManualScrollTimeout);
    this.zenManualScrollTimeout = setTimeout(() => {
      this.zenManualScrollActive = false;
    }, 1000);
  }

  updateSpeedButtonStates() {
    const speedBtns = this.zenContainer.querySelectorAll('.zen-speed-btn');
    speedBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.speed === this.zenSpeed);
    });
  }
  
  // 版本2增強：平滑滾動方法
  smoothScrollTo(targetScrollTop) {
    const startScrollTop = this.zenScrollContainer.scrollTop;
    const distance = targetScrollTop - startScrollTop;
    const duration = 300; // 300ms 平滑動畫
    const startTime = Date.now();
    
    const animateSmooth = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用緩出動畫
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      this.zenScrollContainer.scrollTop = startScrollTop + (distance * easeProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animateSmooth);
      }
    };
    
    requestAnimationFrame(animateSmooth);
  }
  
  // 版本2增強：方向指示器
  showDirectionIndicator(direction) {
    // 移除舊的指示器
    const existingIndicator = this.zenContainer.querySelector('.zen-direction-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }
    
    // 創建新的指示器
    const indicator = document.createElement('div');
    indicator.className = 'zen-direction-indicator';
    indicator.textContent = direction;
    indicator.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 25px;
      font-size: 18px;
      font-weight: bold;
      z-index: 10001;
      pointer-events: none;
      animation: zenDirectionFade 1s ease-out forwards;
    `;
    
    this.zenContainer.appendChild(indicator);
    
    // 1秒後移除
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.remove();
      }
    }, 1000);
  }

  // 版本3: 個性化設置方法
  toggleZenSettings() {
    const isVisible = this.zenSettingsPanel.style.display !== 'none';
    this.zenSettingsPanel.style.display = isVisible ? 'none' : 'block';
  }

  setupZenSettingsEvents() {
    // 主題選擇按鈕
    const themeBtns = this.zenContainer.querySelectorAll('.zen-theme-btn');
    themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setZenTheme(btn.dataset.theme);
        
        // 更新按鈕狀態
        themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // 字體大小滑桿
    const fontSizeSlider = this.zenContainer.querySelector('.zen-font-size-slider');
    const fontSizeValue = this.zenContainer.querySelector('.zen-font-size-value');
    fontSizeSlider.addEventListener('input', (e) => {
      this.zenFontSize = parseInt(e.target.value);
      fontSizeValue.textContent = this.zenFontSize + 'px';
      this.updateZenStyles();
    });

    // 行間距滑桿
    const lineSpacingSlider = this.zenContainer.querySelector('.zen-line-spacing-slider');
    const lineSpacingValue = this.zenContainer.querySelector('.zen-line-spacing-value');
    lineSpacingSlider.addEventListener('input', (e) => {
      this.zenLineSpacing = parseInt(e.target.value);
      lineSpacingValue.textContent = this.zenLineSpacing + 'px';
      this.updateZenStyles();
    });

    // 背景模糊滑桿
    const blurSlider = this.zenContainer.querySelector('.zen-blur-slider');
    const blurValue = this.zenContainer.querySelector('.zen-blur-value');
    blurSlider.addEventListener('input', (e) => {
      this.zenBlurLevel = parseInt(e.target.value);
      blurValue.textContent = this.zenBlurLevel + 'px';
      this.updateZenStyles();
    });

    // 關閉按鈕
    const closeBtn = this.zenContainer.querySelector('.zen-settings-close');
    closeBtn.addEventListener('click', () => {
      this.toggleZenSettings();
    });

    // 重置按鈕
    const resetBtn = this.zenContainer.querySelector('.zen-settings-reset');
    resetBtn.addEventListener('click', () => {
      this.resetZenSettings();
    });
  }

  setZenTheme(theme) {
    this.zenTheme = theme;
    this.applyZenTheme();
    this.saveZenSettings();
  }

  applyZenTheme() {
    const theme = this.zenThemes[this.zenTheme];
    if (!theme) return;

    const overlay = this.zenContainer.querySelector('.eagle-toc-zen-overlay');
    overlay.style.background = theme.background;
    
    // 添加星空粒子效果
    if (theme.particles && this.zenTheme === 'starry') {
      this.createStarryParticles();
    }

    this.updateZenStyles();
  }

  updateZenStyles() {
    const theme = this.zenThemes[this.zenTheme];
    if (!theme) return;

    const items = this.zenContainer.querySelectorAll('.eagle-toc-zen-item-text');
    items.forEach((item, index) => {
      item.style.fontSize = this.zenFontSize + 'px';
      item.style.color = theme.textColor;
    });

    const zenItems = this.zenContainer.querySelectorAll('.eagle-toc-zen-item');
    zenItems.forEach((item, index) => {
      if (index < zenItems.length - 1) {
        item.style.marginBottom = this.zenLineSpacing + 'px';
      }
    });

    const overlay = this.zenContainer.querySelector('.eagle-toc-zen-overlay');
    overlay.style.backdropFilter = `blur(${this.zenBlurLevel}px)`;
    overlay.style.webkitBackdropFilter = `blur(${this.zenBlurLevel}px)`;
  }

  createStarryParticles() {
    // 移除現有粒子
    const existing = this.zenContainer.querySelector('.zen-starry-particles');
    if (existing) existing.remove();

    // 簡單的星空粒子效果
    const particles = document.createElement('div');
    particles.className = 'zen-starry-particles';
    particles.innerHTML = Array.from({length: 50}, () => 
      `<div class="zen-star" style="
        left: ${Math.random() * 100}%; 
        top: ${Math.random() * 100}%; 
        animation-delay: ${Math.random() * 3}s;
      "></div>`
    ).join('');
    
    this.zenContainer.querySelector('.eagle-toc-zen-overlay').appendChild(particles);
  }

  resetZenSettings() {
    this.zenTheme = 'classic';
    this.zenFontSize = 32;
    this.zenLineSpacing = 80;
    this.zenBlurLevel = 20;

    // 更新滑桿值
    this.zenContainer.querySelector('.zen-font-size-slider').value = this.zenFontSize;
    this.zenContainer.querySelector('.zen-font-size-value').textContent = this.zenFontSize + 'px';
    this.zenContainer.querySelector('.zen-line-spacing-slider').value = this.zenLineSpacing;
    this.zenContainer.querySelector('.zen-line-spacing-value').textContent = this.zenLineSpacing + 'px';
    this.zenContainer.querySelector('.zen-blur-slider').value = this.zenBlurLevel;
    this.zenContainer.querySelector('.zen-blur-value').textContent = this.zenBlurLevel + 'px';

    // 更新主題按鈕狀態
    this.zenContainer.querySelectorAll('.zen-theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === this.zenTheme);
    });

    this.applyZenTheme();
    this.saveZenSettings();
  }

  saveZenSettings() {
    const settings = {
      theme: this.zenTheme,
      fontSize: this.zenFontSize,
      lineSpacing: this.zenLineSpacing,
      blurLevel: this.zenBlurLevel,
      readingPosition: this.zenReadingPosition
    };
    
    localStorage.setItem('zenModeSettings', JSON.stringify(settings));
  }

  loadZenSettings() {
    try {
      const saved = localStorage.getItem('zenModeSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        this.zenTheme = settings.theme || 'classic';
        this.zenFontSize = settings.fontSize || 32;
        this.zenLineSpacing = settings.lineSpacing || 80;
        this.zenBlurLevel = settings.blurLevel || 20;
        this.zenReadingPosition = settings.readingPosition || 0;
      }
    } catch (e) {
      console.log('Failed to load zen settings:', e);
    }
  }

  removeZenKeyboardEvents() {
    if (this.zenKeyHandler) {
      document.removeEventListener('keydown', this.zenKeyHandler);
      this.zenKeyHandler = null;
    }
  }

  destroy() {
    // 清理 Zen Mode
    if (this.zenMode) {
      this.exitZenMode();
    }
    
    // 清理自動顯示 timeout
    if (this.autoShowTimeout) {
      clearTimeout(this.autoShowTimeout);
      this.autoShowTimeout = null;
      console.log('🗑️ Cleared auto show timeout during destroy');
    }
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    if (this.tocPanel && this.tocPanel.parentNode) {
      this.tocPanel.parentNode.removeChild(this.tocPanel);
    }
    if (this.searchModal && this.searchModal.parentNode) {
      this.searchModal.parentNode.removeChild(this.searchModal);
    }
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
    }
    // 清理自適應配色樣式
    const adaptiveStyle = document.getElementById('eagle-toc-adaptive-colors');
    if (adaptiveStyle) {
      adaptiveStyle.remove();
    }
    document.body.classList.remove('eagle-toc-glance-mode');
  }

  // ==================== 版本2: 增強導出功能 ====================

  showEnhancedExportModal() {
    // 移除已存在的模態框
    if (this.exportModal) {
      this.exportModal.remove();
    }

    this.exportModal = document.createElement('div');
    this.exportModal.className = 'eagle-toc-enhanced-export-modal eagle-toc-v3';
    this.exportModal.innerHTML = `
      <div class="eagle-toc-enhanced-export-content">
        <div class="eagle-toc-enhanced-export-header">
          <h3>✨ 智能導出</h3>
          <button class="eagle-toc-enhanced-export-close">×</button>
        </div>
        
        <div class="eagle-toc-enhanced-export-toolbar">
          <div class="toolbar-section format-section">
            <label class="section-label">格式</label>
            <select class="inline-dropdown" name="format">
              <option value="markdown">Markdown</option>
              <option value="txt">文字</option>
              <option value="json">JSON</option>
            </select>
          </div>
          
          <div class="toolbar-divider"></div>
          
          <div class="toolbar-section actions-section">
            <button class="toolbar-action primary" data-action="copy">
              <span class="action-icon">📋</span>
              <span class="action-label">複製</span>
            </button>
            <button class="toolbar-action secondary" data-action="download">
              <span class="action-icon">💾</span>
              <span class="action-label">下載</span>
            </button>
          </div>
        </div>
        
        <div class="eagle-toc-enhanced-export-preview compact-horizontal" style="display: block;">
          <textarea class="eagle-toc-enhanced-export-textarea" readonly>${this.generateEnhancedContent('outline', {
            includeMetadata: false,
            includeTOC: true,
            format: 'markdown'
          })}</textarea>
        </div>
      </div>
    `;

    document.body.appendChild(this.exportModal);
    this.setupEnhancedExportEvents();
  }

  setupEnhancedExportEvents() {
    const modal = this.exportModal;
    const closeBtn = modal.querySelector('.eagle-toc-enhanced-export-close');
    const copyBtn = modal.querySelector('.eagle-toc-enhanced-export-copy');
    const downloadBtn = modal.querySelector('.eagle-toc-enhanced-export-download');
    const templateRadios = modal.querySelectorAll('input[name="template"]');
    const formatRadios = modal.querySelectorAll('input[name="format"]');
    const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
    const textarea = modal.querySelector('.eagle-toc-enhanced-export-textarea');
    
    // V3 specific elements
    const isV3 = modal.classList.contains('eagle-toc-v3');
    const toolbarActions = modal.querySelectorAll('.toolbar-action');
    const inlineOptions = modal.querySelectorAll('.inline-option');
    const inlineCheckboxes = modal.querySelectorAll('.inline-checkbox');
    const inlineDropdown = modal.querySelector('.inline-dropdown');

    // 關閉按鈕
    closeBtn.addEventListener('click', () => this.closeEnhancedExportModal());

    // V3 toolbar actions
    if (isV3) {
      const previewSection = modal.querySelector('.eagle-toc-enhanced-export-preview.compact-horizontal');
      
      toolbarActions.forEach(action => {
        action.addEventListener('click', () => {
          const actionType = action.getAttribute('data-action');
          if (actionType === 'copy') {
            this.copyEnhancedToClipboard();
          } else if (actionType === 'download') {
            this.downloadEnhancedFile();
          }
        });
      });
      
      // Format dropdown
      if (inlineDropdown) {
        inlineDropdown.addEventListener('change', () => {
          this.updateV3Preview();
        });
      }
    } else {
      // Original copy/download buttons for non-V3
      copyBtn.addEventListener('click', () => this.copyEnhancedToClipboard());
      downloadBtn.addEventListener('click', () => this.downloadEnhancedFile());
    }

    // 模板變更時更新預覽 (only for non-V3)
    if (!isV3) {
      templateRadios.forEach(radio => {
        radio.addEventListener('change', () => this.updateEnhancedPreview());
      });

      // 格式變更時更新預覽
      formatRadios.forEach(radio => {
        radio.addEventListener('change', () => this.updateEnhancedPreview());
      });

      // 選項變更時更新預覽
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => this.updateEnhancedPreview());
      });
    }

    // 背景點擊關閉
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeEnhancedExportModal();
      }
    });

    // ESC 鍵關閉
    const escHandler = (e) => {
      if (e.key === 'Escape' && this.exportModal) {
        this.closeEnhancedExportModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  updateEnhancedPreview() {
    const modal = this.exportModal;
    const isV3 = modal.classList.contains('eagle-toc-v3');
    
    // V3 has its own preview update method
    if (isV3) return;
    
    const selectedTemplate = modal.querySelector('input[name="template"]:checked').value;
    const selectedFormat = modal.querySelector('input[name="format"]:checked').value;
    const options = {
      includeMetadata: modal.querySelector('#includeMetadata').checked,
      includeTOC: modal.querySelector('#includeTOC').checked,
      includeContent: modal.querySelector('#includeContent').checked,
      includeTimestamp: modal.querySelector('#includeTimestamp').checked,
      format: selectedFormat
    };

    const content = this.generateEnhancedContent(selectedTemplate, options);
    const textarea = modal.querySelector('.eagle-toc-enhanced-export-textarea');
    if (textarea) {
      textarea.value = content;
    }
  }

  toggleV3Preview() {
    const modal = this.exportModal;
    const previewSection = modal.querySelector('.eagle-toc-enhanced-export-preview.compact-horizontal');
    
    if (previewSection.style.display === 'none') {
      previewSection.style.display = 'block';
      this.updateV3Preview();
    } else {
      previewSection.style.display = 'none';
    }
  }

  updateV3Preview() {
    const modal = this.exportModal;
    const selectedTemplate = 'outline'; // 固定為大綱模板
    const selectedFormat = modal.querySelector('.inline-dropdown')?.value || 'markdown';
    
    const options = {
      includeMetadata: false, // 固定不包含頁面資訊
      includeTOC: true,       // 固定包含目錄
      format: selectedFormat
    };

    const content = this.generateEnhancedContent(selectedTemplate, options);
    const textarea = modal.querySelector('.eagle-toc-enhanced-export-textarea');
    if (textarea) {
      textarea.value = content;
    }
  }

  generateEnhancedContent(template, options) {
    // 版本2: 智能元數據提取
    const metadata = this.extractEnhancedMetadata();
    let content = '';

    switch (template) {
      case 'notes':
        content = this.generateNotesTemplate(metadata, options);
        break;
      case 'outline':
        content = this.generateOutlineTemplate(metadata, options);
        break;
      case 'reference':
        content = this.generateReferenceTemplate(metadata, options);
        break;
    }

    if (options.format === 'json') {
      return this.convertToJSON(metadata, options);
    } else if (options.format === 'txt') {
      return this.convertToPlainText(content);
    }

    return content;
  }

  extractEnhancedMetadata() {
    // 版本2: 增強的元數據提取
    const pageTitle = document.title || '未命名頁面';
    const pageUrl = window.location.href;
    const currentDate = new Date().toLocaleString('zh-TW');
    
    // 嘗試提取更多元數據
    const author = this.extractAuthor();
    const publishDate = this.extractPublishDate();
    const description = this.extractDescription();
    const keywords = this.extractKeywords();
    const domain = window.location.hostname;
    const language = document.documentElement.lang || 'zh-TW';
    
    return {
      title: pageTitle,
      url: pageUrl,
      domain,
      author,
      publishDate,
      description,
      keywords,
      language,
      exportDate: currentDate,
      headingsCount: this.headings.length,
      characterCount: document.body.innerText.length
    };
  }

  extractAuthor() {
    // 嘗試從多個來源提取作者信息
    const authorSelectors = [
      'meta[name="author"]',
      'meta[property="article:author"]',
      '.author',
      '.byline',
      '[rel="author"]'
    ];
    
    for (const selector of authorSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.content || element.textContent?.trim() || null;
      }
    }
    return null;
  }

  extractPublishDate() {
    // 嘗試提取發布日期
    const dateSelectors = [
      'meta[property="article:published_time"]',
      'meta[name="publish_date"]',
      'time[datetime]',
      '.publish-date',
      '.date'
    ];
    
    for (const selector of dateSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const date = element.getAttribute('datetime') || element.getAttribute('content') || element.textContent?.trim();
        if (date) {
          try {
            return new Date(date).toLocaleDateString('zh-TW');
          } catch (e) {
            return date;
          }
        }
      }
    }
    return null;
  }

  extractDescription() {
    // 提取頁面描述
    const description = document.querySelector('meta[name="description"]')?.content ||
                      document.querySelector('meta[property="og:description"]')?.content;
    return description || null;
  }

  extractKeywords() {
    // 提取關鍵字
    const keywords = document.querySelector('meta[name="keywords"]')?.content;
    return keywords ? keywords.split(',').map(k => k.trim()) : [];
  }

  generateNotesTemplate(metadata, options) {
    let content = '';
    
    if (options.format === 'markdown') {
      content += `# 📝 ${metadata.title}\n\n`;
      
      if (options.includeMetadata) {
        content += `## 📊 頁面資訊\n\n`;
        content += `- **來源**: [${metadata.title}](${metadata.url})\n`;
        content += `- **網域**: ${metadata.domain}\n`;
        if (metadata.author) content += `- **作者**: ${metadata.author}\n`;
        if (metadata.publishDate) content += `- **發布時間**: ${metadata.publishDate}\n`;
        if (options.includeTimestamp) content += `- **導出時間**: ${metadata.exportDate}\n`;
        if (metadata.description) content += `- **描述**: ${metadata.description}\n`;
        content += `- **標題數量**: ${metadata.headingsCount}\n`;
        content += `- **字數統計**: ${metadata.characterCount.toLocaleString()} 字符\n\n`;
        
        if (metadata.keywords.length > 0) {
          content += `### 🏷️ 關鍵字\n\n`;
          content += metadata.keywords.map(k => `\`${k}\``).join(', ') + '\n\n';
        }
        
        content += `---\n\n`;
      }
      
      if (options.includeTOC && this.headings.length > 0) {
        content += `## 📋 目錄結構\n\n`;
        this.headings.forEach(heading => {
          const level = heading.level;
          const indent = '  '.repeat(level - 1);
          const text = heading.text.trim();
          const anchor = text.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-\u4e00-\u9fff]/g, '');
          content += `${indent}- [${text}](#${anchor})\n`;
        });
        content += `\n---\n\n`;
      }
      
      if (options.includeContent && this.headings.length > 0) {
        content += `## 📖 筆記內容\n\n`;
        this.headings.forEach(heading => {
          const level = heading.level;
          const markdownLevel = '#'.repeat(level + 2);
          const text = heading.text.trim();
          content += `${markdownLevel} ${text}\n\n`;
          content += `> **筆記**: [在此添加你的筆記內容]\n\n`;
          content += `**要點**:\n- \n- \n- \n\n`;
        });
      }
    }
    
    return content;
  }

  generateOutlineTemplate(metadata, options) {
    let content = '';
    
    if (options.format === 'markdown') {
      if (options.includeTOC && this.headings.length > 0) {
        this.headings.forEach((heading) => {
          const level = heading.level;
          const text = heading.text.trim();
          const markdownPrefix = '#'.repeat(level);
          
          content += `${markdownPrefix} ${text}\n\n`;
        });
      }
    }
    
    return content;
  }

  generateReferenceTemplate(metadata, options) {
    let content = '';
    
    if (options.format === 'markdown') {
      content += `# 📚 ${metadata.title} - 參考文獻\n\n`;
      
      content += `## 🔗 引用信息\n\n`;
      content += `**APA 格式**:\n`;
      const author = metadata.author || '作者不詳';
      const year = metadata.publishDate ? new Date(metadata.publishDate).getFullYear() : new Date().getFullYear();
      content += `> ${author} (${year}). *${metadata.title}*. 取自 ${metadata.url}\n\n`;
      
      content += `**MLA 格式**:\n`;
      content += `> ${author}. "${metadata.title}." *${metadata.domain}*, ${metadata.publishDate || metadata.exportDate}. Web. ${new Date().toLocaleDateString('en-US')}.\n\n`;
      
      content += `**IEEE 格式**:\n`;
      content += `> [1] ${author}, "${metadata.title}," ${metadata.domain}. [Online]. Available: ${metadata.url}. [Accessed: ${new Date().toLocaleDateString('en-US')}].\n\n`;
      
      if (options.includeMetadata) {
        content += `## 📊 詳細資訊\n\n`;
        content += `| 項目 | 內容 |\n`;
        content += `|------|------|\n`;
        content += `| 標題 | ${metadata.title} |\n`;
        content += `| URL | ${metadata.url} |\n`;
        content += `| 作者 | ${metadata.author || 'N/A'} |\n`;
        content += `| 發布日期 | ${metadata.publishDate || 'N/A'} |\n`;
        content += `| 存取日期 | ${metadata.exportDate} |\n`;
        content += `| 語言 | ${metadata.language} |\n\n`;
      }
      
      if (options.includeTOC && this.headings.length > 0) {
        content += `## 📝 內容摘要\n\n`;
        content += `本文檔包含 ${this.headings.length} 個主要段落：\n\n`;
        this.headings.forEach((heading, index) => {
          content += `${index + 1}. ${heading.text.trim()}\n`;
        });
        content += '\n';
      }
    }
    
    return content;
  }

  convertToJSON(metadata, options) {
    const data = {
      metadata,
      headings: this.headings.map(h => ({
        level: h.level,
        text: h.text.trim(),
        id: h.id
      })),
      exportOptions: options,
      exportedAt: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }

  convertToPlainText(markdownContent) {
    return markdownContent
      .replace(/^#+\s/gm, '') // 移除 markdown 標題符號
      .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗體標記
      .replace(/\*(.*?)\*/g, '$1') // 移除斜體標記
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 移除鏈接標記，保留文字
      .replace(/`(.*?)`/g, '$1') // 移除代碼標記
      .replace(/^[\s]*[-\*\+]\s/gm, '• ') // 轉換列表
      .replace(/^\s*>/gm, '') // 移除引用標記
      .replace(/---+/g, '───────────') // 轉換分隔線
      .replace(/\n{3,}/g, '\n\n'); // 移除多餘空行
  }

  async copyEnhancedToClipboard() {
    const modal = this.exportModal;
    const isV3 = modal.classList.contains('eagle-toc-v3');
    
    let content;
    let copyBtn;
    
    if (isV3) {
      // V3: Generate content on-demand
      const selectedTemplate = modal.querySelector('input[name="template"]:checked')?.value || 'outline';
      const formatDropdown = modal.querySelector('.inline-dropdown');
      const selectedFormat = formatDropdown ? formatDropdown.value : 'markdown';
      
      const options = {
        includeMetadata: false, // 固定不包含頁面資訊
        includeTOC: true,       // 固定包含目錄
        format: selectedFormat
      };
      
      content = this.generateEnhancedContent(selectedTemplate, options);
      copyBtn = modal.querySelector('[data-action="copy"]');
    } else {
      // V1/V2: Use textarea content
      const textarea = modal.querySelector('.eagle-toc-enhanced-export-textarea');
      content = textarea.value;
      copyBtn = modal.querySelector('.eagle-toc-enhanced-export-copy');
    }
    
    try {
      await navigator.clipboard.writeText(content);
      
      // 視覺反饋
      const originalContent = copyBtn.innerHTML;
      if (isV3) {
        copyBtn.innerHTML = '<span class="action-icon">✅</span><span class="action-text">已複製</span>';
      } else {
        copyBtn.textContent = '✅ 已複製!';
      }
      copyBtn.style.background = '#27ae60';
      
      setTimeout(() => {
        copyBtn.innerHTML = originalContent;
        copyBtn.style.background = '';
      }, 2000);
      
    } catch (err) {
      console.error('複製失敗:', err);
      
      // V3 fallback
      if (isV3) {
        copyBtn.innerHTML = '<span class="action-icon">❌</span><span class="action-text">失敗</span>';
        setTimeout(() => {
          copyBtn.innerHTML = '<span class="action-icon">📋</span><span class="action-text">複製</span>';
        }, 2000);
      } else {
        // V1/V2 fallback
        const textarea = modal.querySelector('.eagle-toc-enhanced-export-textarea');
        textarea.select();
        textarea.setSelectionRange(0, 99999);
        
        try {
          document.execCommand('copy');
          copyBtn.textContent = '✅ 已複製!';
          setTimeout(() => {
            copyBtn.textContent = '📋 複製到剪貼板';
          }, 2000);
        } catch (err2) {
          copyBtn.textContent = '❌ 複製失敗';
          setTimeout(() => {
            copyBtn.textContent = '📋 複製到剪貼板';
          }, 2000);
        }
      }
    }
  }

  downloadEnhancedFile() {
    const modal = this.exportModal;
    const isV3 = modal.classList.contains('eagle-toc-v3');
    
    let content, selectedFormat, selectedTemplate, downloadBtn;
    
    if (isV3) {
      // V3: Generate content on-demand
      selectedTemplate = modal.querySelector('input[name="template"]:checked')?.value || 'outline';
      const formatDropdown = modal.querySelector('.inline-dropdown');
      selectedFormat = formatDropdown ? formatDropdown.value : 'markdown';
      
      const options = {
        includeMetadata: false, // 固定不包含頁面資訊
        includeTOC: true,       // 固定包含目錄
        format: selectedFormat
      };
      
      content = this.generateEnhancedContent(selectedTemplate, options);
      downloadBtn = modal.querySelector('[data-action="download"]');
    } else {
      // V1/V2: Use existing content and selectors
      content = modal.querySelector('.eagle-toc-enhanced-export-textarea').value;
      selectedFormat = modal.querySelector('input[name="format"]:checked').value;
      selectedTemplate = modal.querySelector('input[name="template"]:checked').value;
      downloadBtn = modal.querySelector('.eagle-toc-enhanced-export-download');
    }
    
    // 生成文件名
    const timestamp = new Date().toISOString().split('T')[0];
    const pageTitle = document.title.replace(/[<>:"/\\|?*]/g, '-').substring(0, 50);
    const templateName = { 'notes': '筆記', 'outline': '大綱', 'reference': '參考' }[selectedTemplate];
    const fileName = `${pageTitle}-${templateName}-${timestamp}.${selectedFormat}`;
    
    // 設置 MIME 類型
    const mimeTypes = {
      'markdown': 'text/markdown',
      'txt': 'text/plain',
      'json': 'application/json'
    };
    
    try {
      const blob = new Blob([content], { type: mimeTypes[selectedFormat] });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      a.href = url;
      a.download = fileName;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // 清理
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      // 視覺反饋
      const originalContent = downloadBtn.innerHTML;
      if (isV3) {
        downloadBtn.innerHTML = '<span class="action-icon">✅</span><span class="action-text">完成</span>';
      } else {
        downloadBtn.textContent = '✅ 下載完成!';
      }
      downloadBtn.style.background = '#27ae60';
      
      setTimeout(() => {
        downloadBtn.innerHTML = originalContent;
        downloadBtn.style.background = '';
      }, 2000);
      
    } catch (err) {
      console.error('下載失敗:', err);
      
      if (isV3) {
        downloadBtn.innerHTML = '<span class="action-icon">❌</span><span class="action-text">失敗</span>';
        setTimeout(() => {
          downloadBtn.innerHTML = '<span class="action-icon">💾</span><span class="action-text">下載</span>';
        }, 2000);
      } else {
        downloadBtn.textContent = '❌ 下載失敗';
        setTimeout(() => {
          downloadBtn.textContent = '💾 下載文件';
        }, 2000);
      }
    }
  }

  closeEnhancedExportModal() {
    if (this.exportModal) {
      this.exportModal.remove();
      this.exportModal = null;
    }
  }
}

if (typeof window !== 'undefined') {
  console.log('🦅 EagleToc content script loaded [v2.0 - Eagle Precision]');
  
  // Prevent multiple initialization
  if (window.eagleTOC) {
    console.log('🔄 EagleToc already exists, cleaning up...');
    window.eagleTOC.destroy();
  }
  
  console.log('🦅 Initializing EagleTOC v2.0...');
  window.eagleTOC = new EagleTOC();
  console.log('✅ EagleTOC initialized:', window.eagleTOC);
}
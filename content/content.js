class SmartTOC {
  constructor() {
    this.tocPanel = null;
    this.headings = [];
    this.isVisible = false;
    this.wasAutoShown = false; // 標記是否為自動顯示
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
    this.isPinned = false;
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
      autoShow: false,
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
    this.init();
  }

  async init() {
    await this.loadSettings();
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
    this.tocPanel = document.createElement('div');
    this.tocPanel.id = 'smart-toc-panel';
    this.tocPanel.className = 'smart-toc-panel';
    this.tocPanel.innerHTML = `
      <div class="smart-toc-header">
        <div class="smart-toc-controls">
          <div class="smart-toc-depth-controls">
            <button class="smart-toc-depth-decrease" title="減少顯示深度">−</button>
            <span class="smart-toc-depth-display">H${this.settings.maxHeadingLevels}</span>
            <button class="smart-toc-depth-increase" title="增加顯示深度">+</button>
          </div>
          <div class="smart-toc-action-buttons">
            <button class="smart-toc-close" title="關閉">×</button>
            <div class="smart-toc-more-container">
              <button class="smart-toc-more" title="更多選項">⋯</button>
              <div class="smart-toc-more-menu">
                <div class="smart-toc-more-option smart-toc-search-toggle" title="搜尋">
                  <span class="smart-toc-more-icon">🔍</span>
                  <span class="smart-toc-more-text">搜尋</span>
                </div>
                <div class="smart-toc-more-option smart-toc-theme-toggle" title="切換主題">
                  <span class="smart-toc-more-icon">🎨</span>
                  <span class="smart-toc-more-text">主題</span>
                </div>
                <div class="smart-toc-more-option smart-toc-settings" title="設定">
                  <span class="smart-toc-more-icon">⚙️</span>
                  <span class="smart-toc-more-text">設定</span>
                </div>
                <div class="smart-toc-more-option smart-toc-copy" title="複製">
                  <span class="smart-toc-more-icon">📋</span>
                  <span class="smart-toc-more-text">複製</span>
                </div>
                <div class="smart-toc-more-option smart-toc-collapse" title="收合面板">
                  <span class="smart-toc-more-icon">📁</span>
                  <span class="smart-toc-more-text">收合</span>
                </div>
                <div class="smart-toc-more-option smart-toc-expand" title="展開面板" style="display: none;">
                  <span class="smart-toc-more-icon">📂</span>
                  <span class="smart-toc-more-text">展開</span>
                </div>
              </div>
            </div>
            <button class="smart-toc-pin" title="釘選面板">📌</button>
          </div>
        </div>
        <div class="smart-toc-theme-menu" style="display: none;">
          <div class="smart-toc-theme-option" data-theme="auto">
            <div class="smart-toc-theme-dot auto"></div>
            <span>自動適應</span>
          </div>
          <div class="smart-toc-theme-option" data-theme="light">
            <div class="smart-toc-theme-dot light"></div>
            <span>亮色</span>
          </div>
          <div class="smart-toc-theme-option" data-theme="dark">
            <div class="smart-toc-theme-dot dark"></div>
            <span>深色</span>
          </div>
          <div class="smart-toc-theme-option" data-theme="ocean">
            <div class="smart-toc-theme-dot ocean"></div>
            <span>海洋</span>
          </div>
          <div class="smart-toc-theme-option" data-theme="forest">
            <div class="smart-toc-theme-dot forest"></div>
            <span>森林</span>
          </div>
          <div class="smart-toc-theme-option" data-theme="sunset">
            <div class="smart-toc-theme-dot sunset"></div>
            <span>日落</span>
          </div>
          <div class="smart-toc-theme-option" data-theme="coral">
            <div class="smart-toc-theme-dot coral"></div>
            <span>珊瑚</span>
          </div>
        </div>
        <div class="smart-toc-settings-panel">
          <div class="smart-toc-settings-item">
            <span class="smart-toc-settings-label">字體大小</span>
            <div class="smart-toc-font-controls">
              <button class="smart-toc-font-btn smart-toc-font-decrease" title="減小字體">-</button>
              <span class="smart-toc-font-size-display">16px</span>
              <button class="smart-toc-font-btn smart-toc-font-increase" title="增大字體">+</button>
            </div>
          </div>
          <div class="smart-toc-settings-item">
            <span class="smart-toc-settings-label">高亮時間</span>
            <div class="smart-toc-font-controls">
              <button class="smart-toc-font-btn smart-toc-highlight-decrease" title="減少時間">-</button>
              <span class="smart-toc-highlight-duration-display">5s</span>
              <button class="smart-toc-font-btn smart-toc-highlight-increase" title="增加時間">+</button>
            </div>
          </div>
          <div class="smart-toc-settings-item smart-toc-whitelist-section">
            <div class="smart-toc-whitelist-header">
              <span class="smart-toc-settings-label">自動顯示白名單</span>
              <label class="smart-toc-whitelist-toggle">
                <input type="checkbox" class="smart-toc-whitelist-enabled" checked />
                <span class="smart-toc-toggle-slider"></span>
              </label>
            </div>
            <div class="smart-toc-whitelist-controls">
              <div class="smart-toc-whitelist-input-row">
                <input type="text" class="smart-toc-whitelist-input" placeholder="新增網域 (例: example.com)" />
                <button class="smart-toc-whitelist-add" title="新增網域">+</button>
              </div>
              <div class="smart-toc-whitelist-actions">
                <button class="smart-toc-whitelist-add-current" title="新增當前網域">新增當前網域</button>
                <button class="smart-toc-whitelist-reset" title="重置為預設值">重置</button>
              </div>
            </div>
            <div class="smart-toc-whitelist-list">
              <!-- 白名單項目會動態生成 -->
            </div>
          </div>
        </div>
      </div>
      <div class="smart-toc-content">
        <div class="smart-toc-loading">Analyzing page structure...</div>
      </div>
      <!-- Resize handles -->
      <div class="smart-toc-resize-handle corner top-left" data-direction="top-left"></div>
      <div class="smart-toc-resize-handle edge top" data-direction="top"></div>
      <div class="smart-toc-resize-handle corner top-right" data-direction="top-right"></div>
      <div class="smart-toc-resize-handle edge right" data-direction="right"></div>
      <div class="smart-toc-resize-handle corner bottom-right" data-direction="bottom-right"></div>
      <div class="smart-toc-resize-handle edge bottom" data-direction="bottom"></div>
      <div class="smart-toc-resize-handle corner bottom-left" data-direction="bottom-left"></div>
      <div class="smart-toc-resize-handle edge left" data-direction="left"></div>
    `;
    
    this.tocPanel.style.width = this.settings.tocWidth + 'px';
    this.tocPanel.style.right = this.settings.tocPosition === 'right' ? '20px' : 'auto';
    this.tocPanel.style.left = this.settings.tocPosition === 'left' ? '20px' : 'auto';
    
    // Apply font size to content area only
    this.applyContentFontSize();
    
    document.body.appendChild(this.tocPanel);
    this.tocPanel.style.display = 'none';
    
    // Update settings display with actual values
    this.updateSettingsDisplay();
    
    // Update depth button display
    this.updateDepthButtonDisplay();
    
    // Initialize button visibility
    setTimeout(() => this.updateCollapseExpandButtons(), 0);
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
        const containerHeadings = container.querySelectorAll('h1, h2, h3, h4, h5, h6, strong');
        headings = headings.concat(Array.from(containerHeadings));
      });
    } else {
      headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, strong'));
    }

    // 去除重複的標題元素
    headings = this.deduplicateHeadings(headings);
    headings = this.filterHeadings(headings);
    
    if (headings.length === 0) {
      setTimeout(() => this.extractHeadings(), 2000);
      return;
    }
    
    this.headings = headings.map((heading, index) => {
      let level;
      if (heading.tagName.toLowerCase() === 'strong') {
        level = 7; // Assign level 7 to strong tags
      } else {
        level = parseInt(heading.tagName.charAt(1));
      }
      
      return {
        element: heading,
        text: this.cleanHeadingText(heading.textContent.trim()),
        level: level,
        id: heading.id || `smart-toc-heading-${index}`,
        index,
        visible: level <= this.settings.maxHeadingLevels || heading.tagName.toLowerCase() === 'strong'
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
    if (this.settings.autoShow && 
        this.headings.length >= this.settings.autoShowMinHeadings) {
      setTimeout(() => this.autoShowTOC(), this.settings.autoShowDelay);
    }
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
      const isVisible = rect.width > 0 && 
                       rect.height > 0 && 
                       style.visibility !== 'hidden' && 
                       style.display !== 'none' &&
                       heading.textContent.trim().length > 0 &&
                       !heading.closest('.smart-toc-panel');
      
      if (!isVisible) return false;
      
      // Additional filtering for strong tags
      if (heading.tagName.toLowerCase() === 'strong') {
        const text = heading.textContent.trim();
        // Filter out very short strong tags (likely just formatting, not headings)
        if (text.length < 3) return false;
        
        // Check if the strong tag appears to be a heading based on context
        const parent = heading.parentElement;
        const parentTag = parent?.tagName.toLowerCase();
        
        // Skip strong tags that are clearly inline formatting
        if (parentTag === 'span' || parentTag === 'em' || parentTag === 'i' || parentTag === 'b') {
          return false;
        }
        
        // Check if it's the only or main content in its parent
        const parentText = parent?.textContent.trim() || '';
        const strongText = text;
        const isMainContent = parentText === strongText || parentText.startsWith(strongText);
        
        return isMainContent && text.length >= 3;
      }
      
      return true;
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
    const content = this.tocPanel.querySelector('.smart-toc-content');
    const tocList = this.createTOCList(this.headings.filter(h => h.visible));
    content.innerHTML = '';
    content.appendChild(tocList);
    this.updateCurrentHeading();
    
    // Apply font size after rendering TOC
    this.applyContentFontSize();
  }

  createTOCList(headings) {
    const ul = document.createElement('ul');
    ul.className = 'smart-toc-list';

    headings.forEach(heading => {
      const li = document.createElement('li');
      li.className = `smart-toc-item smart-toc-level-${heading.level}`;
      li.dataset.headingId = heading.id;
      
      const a = document.createElement('a');
      a.href = `#${heading.id}`;
      a.textContent = heading.text;
      a.className = 'smart-toc-link';
      a.dataset.headingId = heading.id;
      
      a.addEventListener('click', (e) => {
        e.preventDefault();
        this.scrollToHeading(heading);
      });

      li.appendChild(a);
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

  highlightElement(element) {
    // Remove any existing highlights
    document.querySelectorAll('.smart-toc-highlighted').forEach(el => {
      el.classList.remove('smart-toc-highlighted');
      el.style.removeProperty('--smart-toc-highlight-duration');
    });

    // Apply highlight with custom duration
    element.style.setProperty('--smart-toc-highlight-duration', `${this.settings.highlightDuration}s`);
    element.classList.add('smart-toc-highlighted');

    // Remove highlight after animation completes
    setTimeout(() => {
      element.classList.remove('smart-toc-highlighted');
      element.style.removeProperty('--smart-toc-highlight-duration');
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
    const tocLinks = this.tocPanel.querySelectorAll('.smart-toc-link');
    tocLinks.forEach(link => {
      if (link.dataset.headingId === this.currentHeading) {
        link.classList.add('smart-toc-active');
        this.scrollTOCToActiveItem(link);
      } else {
        link.classList.remove('smart-toc-active');
      }
    });
  }

  scrollTOCToActiveItem(activeLink) {
    const tocContent = this.tocPanel.querySelector('.smart-toc-content');
    const linkRect = activeLink.getBoundingClientRect();
    const contentRect = tocContent.getBoundingClientRect();
    
    if (linkRect.top < contentRect.top || linkRect.bottom > contentRect.bottom) {
      const scrollTop = activeLink.offsetTop - tocContent.offsetTop - tocContent.clientHeight / 2;
      tocContent.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }
  }

  showNoHeadingsMessage() {
    const content = this.tocPanel.querySelector('.smart-toc-content');
    content.innerHTML = '<div class="smart-toc-no-headings">No headings found on this page.</div>';
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
      } else if (request.action === 'get-disabled-domains') {
        sendResponse({ disabledDomains: this.getAutoShowDisabledDomains() });
      } else if (request.action === 'remove-disabled-domain') {
        this.removeDomainFromDisabledList(request.domain);
        sendResponse({ success: true });
      } else if (request.action === 'clear-disabled-domains') {
        this.clearAllDisabledDomains();
        sendResponse({ success: true });
      }
      return true; // Important for async response
    });

    // 關閉按鈕
    const closeBtn = this.tocPanel.querySelector('.smart-toc-close');
    closeBtn.addEventListener('click', () => {
      this.hideMoreMenu();
      this.hideSettingsPanel();
      this.hide();
    });

    // 釘選按鈕
    const pinBtn = this.tocPanel.querySelector('.smart-toc-pin');
    pinBtn.addEventListener('click', () => {
      this.hideMoreMenu();
      this.togglePin();
    });

    // 更多選單按鈕
    const moreBtn = this.tocPanel.querySelector('.smart-toc-more');
    const moreMenu = this.tocPanel.querySelector('.smart-toc-more-menu');
    this.moreMenu = moreMenu;
    
    moreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMoreMenu();
    });

    // 更多選單選項事件
    const searchToggle = this.tocPanel.querySelector('.smart-toc-more-option.smart-toc-search-toggle');
    searchToggle.addEventListener('click', () => {
      this.hideMoreMenu();
      this.showSearchModal();
    });

    const themeToggle = this.tocPanel.querySelector('.smart-toc-more-option.smart-toc-theme-toggle');
    themeToggle.addEventListener('click', () => {
      this.hideMoreMenu();
      this.showThemeMenu();
    });

    const settingsOption = this.tocPanel.querySelector('.smart-toc-more-option.smart-toc-settings');
    settingsOption.addEventListener('click', () => {
      this.hideMoreMenu();
      this.toggleSettingsPanel();
    });

    const copyOption = this.tocPanel.querySelector('.smart-toc-more-option.smart-toc-copy');
    copyOption.addEventListener('click', () => {
      this.hideMoreMenu();
      this.copyToClipboard();
    });

    const collapseOption = this.tocPanel.querySelector('.smart-toc-more-option.smart-toc-collapse');
    collapseOption.addEventListener('click', () => {
      this.hideMoreMenu();
      this.collapsePanel();
    });

    const expandOption = this.tocPanel.querySelector('.smart-toc-more-option.smart-toc-expand');
    expandOption.addEventListener('click', () => {
      this.hideMoreMenu();
      this.expandPanel();
    });

    const depthIncreaseBtn = this.tocPanel.querySelector('.smart-toc-depth-increase');
    const depthDecreaseBtn = this.tocPanel.querySelector('.smart-toc-depth-decrease');
    
    depthIncreaseBtn.addEventListener('click', () => {
      this.hideSettingsPanel();
      this.increaseHeadingDepth();
    });
    depthDecreaseBtn.addEventListener('click', () => {
      this.hideSettingsPanel();
      this.decreaseHeadingDepth();
    });


    const fontIncreaseBtn = this.tocPanel.querySelector('.smart-toc-font-increase');
    if (fontIncreaseBtn) {
      fontIncreaseBtn.addEventListener('click', () => this.changeFontSize(1));
    }

    const fontDecreaseBtn = this.tocPanel.querySelector('.smart-toc-font-decrease');
    if (fontDecreaseBtn) {
      fontDecreaseBtn.addEventListener('click', () => this.changeFontSize(-1));
    }

    const highlightIncreaseBtn = this.tocPanel.querySelector('.smart-toc-highlight-increase');
    if (highlightIncreaseBtn) {
      highlightIncreaseBtn.addEventListener('click', () => this.changeHighlightDuration(1));
    }

    const highlightDecreaseBtn = this.tocPanel.querySelector('.smart-toc-highlight-decrease');
    if (highlightDecreaseBtn) {
      highlightDecreaseBtn.addEventListener('click', () => this.changeHighlightDuration(-1));
    }

    // 白名單相關事件監聽器
    this.setupWhitelistEventListeners();

    document.addEventListener('click', (e) => {
      if (!this.tocPanel.contains(e.target)) {
        this.hideSettingsPanel();
        this.hideMoreMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // If search modal is open, close it first, otherwise hide TOC
        if (this.searchModal && this.searchModal.classList.contains('show')) {
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
    this.tocPanel.classList.add('smart-toc-collapsed');
    // Clear any dynamic height that might interfere with collapse
    this.tocPanel.style.removeProperty('height');
    this.updateCollapseExpandButtons();
  }

  expandPanel() {
    this.isCollapsed = false;
    this.tocPanel.classList.remove('smart-toc-collapsed');
    // Restore default height behavior when expanded
    if (!this.tocPanel.style.height) {
      this.tocPanel.style.removeProperty('height');
    }
    this.updateCollapseExpandButtons();
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
    const selector = type === 'auto-show' ? '.smart-toc-auto-notification' : '.smart-toc-notification';
    const existingNotification = document.querySelector(selector);
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create new notification
    const notification = document.createElement('div');
    notification.className = type === 'auto-show' ? 'smart-toc-auto-notification' : 'smart-toc-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Show notification
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });

    // Hide and remove notification
    setTimeout(() => {
      if (type === 'auto-show') {
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
    const settingsPanel = this.tocPanel.querySelector('.smart-toc-settings-panel');
    if (settingsPanel) {
      const isVisible = settingsPanel.style.display === 'block';
      settingsPanel.style.display = isVisible ? 'none' : 'block';
      console.log('Settings panel toggled:', isVisible ? 'hidden' : 'shown');
    } else {
      console.error('Settings panel not found');
    }
  }

  hideSettingsPanel() {
    const settingsPanel = this.tocPanel.querySelector('.smart-toc-settings-panel');
    if (settingsPanel) {
      settingsPanel.style.display = 'none';
    }
  }

  changeFontSize(delta) {
    const newSize = Math.max(12, Math.min(24, this.settings.fontSize + delta));
    if (newSize !== this.settings.fontSize) {
      this.settings.fontSize = newSize;
      
      // Apply font size only to content area, not the whole panel
      this.applyContentFontSize();
      
      const display = this.tocPanel.querySelector('.smart-toc-font-size-display');
      if (display) {
        display.textContent = newSize + 'px';
      }
      
      this.saveSettings();
    }
  }

  changeHighlightDuration(delta) {
    const newDuration = Math.max(1, Math.min(15, this.settings.highlightDuration + delta));
    if (newDuration !== this.settings.highlightDuration) {
      this.settings.highlightDuration = newDuration;
      
      const display = this.tocPanel.querySelector('.smart-toc-highlight-duration-display');
      display.textContent = newDuration + 's';
      
      this.saveSettings();
    }
  }

  applyContentFontSize() {
    const tocList = this.tocPanel.querySelector('.smart-toc-list');
    if (tocList) {
      tocList.style.fontSize = this.settings.fontSize + 'px';
      console.log('Applied font size:', this.settings.fontSize + 'px', 'to TOC list');
    } else {
      console.log('TOC list not found for font size application');
    }
  }

  updateSettingsDisplay() {
    const fontSizeDisplay = this.tocPanel.querySelector('.smart-toc-font-size-display');
    const highlightDurationDisplay = this.tocPanel.querySelector('.smart-toc-highlight-duration-display');
    
    if (fontSizeDisplay) {
      fontSizeDisplay.textContent = this.settings.fontSize + 'px';
    }
    if (highlightDurationDisplay) {
      highlightDurationDisplay.textContent = this.settings.highlightDuration + 's';
    }
    
    // Apply the current font size to content
    this.applyContentFontSize();
  }

  increaseHeadingDepth() {
    if (this.settings.maxHeadingLevels < 6) {
      this.settings.maxHeadingLevels++;
      this.updateDepthControls();
      this.updateHeadingVisibility();
      this.renderTOC();
      this.saveSettings();
    }
  }

  decreaseHeadingDepth() {
    if (this.settings.maxHeadingLevels > 1) {
      this.settings.maxHeadingLevels--;
      this.updateDepthControls();
      this.updateHeadingVisibility();
      this.renderTOC();
      this.saveSettings();
    }
  }

  updateDepthControls() {
    const depthDisplay = this.tocPanel.querySelector('.smart-toc-depth-display');
    const increaseBtn = this.tocPanel.querySelector('.smart-toc-depth-increase');
    const decreaseBtn = this.tocPanel.querySelector('.smart-toc-depth-decrease');
    
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
      heading.visible = heading.level <= this.settings.maxHeadingLevels || heading.element.tagName.toLowerCase() === 'strong';
    });
  }

  updateDepthButtonDisplay() {
    // 使用新的 updateDepthControls 方法
    this.updateDepthControls();
  }

  async saveSettings() {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ 
        action: 'save-settings', 
        settings: this.settings 
      });
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
    
    // 如果啟用白名單，先檢查是否在白名單中
    if (this.settings.whitelistEnabled) {
      if (!this.isInWhitelist(currentDomain)) {
        return false;
      }
    }
    
    // 檢查當前域名是否在黑名單中
    const autoShowDisabledDomains = this.getAutoShowDisabledDomains();
    if (autoShowDisabledDomains.includes(currentDomain)) {
      return false;
    }
    
    return true;
  }

  getAutoShowDisabledDomains() {
    // 從 localStorage 獲取被用戶手動關閉過的域名
    try {
      const stored = localStorage.getItem('smart-toc-disabled-domains');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  disableAutoShowForCurrentDomain() {
    const currentDomain = window.location.hostname;
    const disabledDomains = this.getAutoShowDisabledDomains();
    
    if (!disabledDomains.includes(currentDomain)) {
      disabledDomains.push(currentDomain);
      localStorage.setItem('smart-toc-disabled-domains', JSON.stringify(disabledDomains));
    }
  }

  showAutoDisplayNotification() {
    // 只有在用戶首次在此域名看到自動顯示時才顯示通知
    const currentDomain = window.location.hostname;
    const notifiedDomains = this.getNotifiedDomains();
    
    if (!notifiedDomains.includes(currentDomain)) {
      this.showNotification('TOC 已自動顯示。如不需要，可點擊 × 關閉', 4000, 'auto-show');
      notifiedDomains.push(currentDomain);
      localStorage.setItem('smart-toc-notified-domains', JSON.stringify(notifiedDomains));
    }
  }

  getNotifiedDomains() {
    try {
      const stored = localStorage.getItem('smart-toc-notified-domains');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  removeDomainFromDisabledList(domain) {
    const disabledDomains = this.getAutoShowDisabledDomains();
    const filteredDomains = disabledDomains.filter(d => d !== domain);
    localStorage.setItem('smart-toc-disabled-domains', JSON.stringify(filteredDomains));
  }

  clearAllDisabledDomains() {
    localStorage.removeItem('smart-toc-disabled-domains');
    localStorage.removeItem('smart-toc-notified-domains');
  }

  isInWhitelist(domain) {
    const whitelist = this.settings.autoShowWhitelist || [];
    
    return whitelist.some(pattern => {
      // 移除協議前綴 (如果有)
      pattern = pattern.replace(/^https?:\/\//, '');
      domain = domain.replace(/^https?:\/\//, '');
      
      // 完全匹配
      if (pattern === domain) {
        return true;
      }
      
      // 檢查是否包含萬用字元
      if (pattern.includes('*')) {
        // 將萬用字元模式轉換為正則表達式
        const regexPattern = pattern
          .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // 轉義正則特殊字符
          .replace(/\*/g, '.*'); // 將 * 轉換為 .*
        
        try {
          const regex = new RegExp(`^${regexPattern}$`, 'i');
          return regex.test(domain);
        } catch (e) {
          // 如果正則表達式無效，回退到原始匹配
          console.warn('Invalid wildcard pattern:', pattern, e);
          return false;
        }
      }
      
      // 子域名匹配 (example.com 也匹配 www.example.com)
      if (domain.endsWith('.' + pattern)) {
        return true;
      }
      
      return false;
    });
  }

  addToWhitelist(domain) {
    if (!domain) return false;
    
    // 清理域名
    domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
    
    if (!this.isInWhitelist(domain)) {
      this.settings.autoShowWhitelist.push(domain);
      this.saveSettings();
      return true;
    }
    return false;
  }

  removeFromWhitelist(domain) {
    const index = this.settings.autoShowWhitelist.indexOf(domain);
    if (index > -1) {
      this.settings.autoShowWhitelist.splice(index, 1);
      this.saveSettings();
      return true;
    }
    return false;
  }

  addCurrentDomainToWhitelist() {
    const currentDomain = window.location.hostname;
    return this.addToWhitelist(currentDomain);
  }

  resetWhitelistToDefault() {
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
    this.saveSettings();
  }

  toggleWhitelistEnabled() {
    this.settings.whitelistEnabled = !this.settings.whitelistEnabled;
    this.saveSettings();
    this.updateWhitelistUI();
  }

  setupWhitelistEventListeners() {
    const whitelistToggle = this.tocPanel.querySelector('.smart-toc-whitelist-enabled');
    const whitelistInput = this.tocPanel.querySelector('.smart-toc-whitelist-input');
    const whitelistAddBtn = this.tocPanel.querySelector('.smart-toc-whitelist-add');
    const addCurrentBtn = this.tocPanel.querySelector('.smart-toc-whitelist-add-current');
    const resetBtn = this.tocPanel.querySelector('.smart-toc-whitelist-reset');

    if (whitelistToggle) {
      whitelistToggle.addEventListener('change', () => {
        this.toggleWhitelistEnabled();
      });
    }

    if (whitelistInput) {
      whitelistInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.addDomainFromInput();
        }
      });
    }

    if (whitelistAddBtn) {
      whitelistAddBtn.addEventListener('click', () => {
        this.addDomainFromInput();
      });
    }

    if (addCurrentBtn) {
      addCurrentBtn.addEventListener('click', () => {
        if (this.addCurrentDomainToWhitelist()) {
          this.showNotification(`已新增 ${window.location.hostname} 到白名單`);
          this.renderWhitelistItems();
        } else {
          this.showNotification(`${window.location.hostname} 已在白名單中`);
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetWhitelistToDefault();
        this.showNotification('白名單已重置為預設值');
        this.renderWhitelistItems();
      });
    }

    // 初始化白名單顯示
    this.updateWhitelistUI();
    this.renderWhitelistItems();
  }

  addDomainFromInput() {
    const input = this.tocPanel.querySelector('.smart-toc-whitelist-input');
    const domain = input.value.trim();
    
    if (!domain) {
      this.showNotification('請輸入網域名稱');
      return;
    }

    if (this.addToWhitelist(domain)) {
      input.value = '';
      this.showNotification(`已新增 ${domain} 到白名單`);
      this.renderWhitelistItems();
    } else {
      this.showNotification(`${domain} 已在白名單中`);
    }
  }

  updateWhitelistUI() {
    const toggle = this.tocPanel.querySelector('.smart-toc-whitelist-enabled');
    const controls = this.tocPanel.querySelector('.smart-toc-whitelist-controls');
    const list = this.tocPanel.querySelector('.smart-toc-whitelist-list');

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
    const listContainer = this.tocPanel.querySelector('.smart-toc-whitelist-list');
    if (!listContainer) return;

    const whitelist = this.settings.autoShowWhitelist || [];
    
    listContainer.innerHTML = whitelist.map(domain => `
      <div class="smart-toc-whitelist-item">
        <span class="smart-toc-whitelist-domain">${domain}</span>
        <button class="smart-toc-whitelist-remove" data-domain="${domain}" title="移除">×</button>
      </div>
    `).join('');

    // 綁定移除按鈕事件
    listContainer.querySelectorAll('.smart-toc-whitelist-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const domain = e.target.dataset.domain;
        if (this.removeFromWhitelist(domain)) {
          this.showNotification(`已從白名單移除 ${domain}`);
          this.renderWhitelistItems();
        }
      });
    });
  }

  show() {
    this.tocPanel.style.display = 'block';
    this.isVisible = true;
    requestAnimationFrame(() => {
      this.tocPanel.classList.add('smart-toc-visible');
    });
  }

  hide() {
    this.tocPanel.classList.remove('smart-toc-visible');
    this.isVisible = false;
    setTimeout(() => {
      this.tocPanel.style.display = 'none';
    }, 300);
    
    // 只有當 TOC 是自動顯示的情況下，用戶手動關閉才記錄域名偏好
    if (this.settings.autoShow && this.wasAutoShown) {
      this.disableAutoShowForCurrentDomain();
      this.wasAutoShown = false; // 重置標記
    }
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
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
    this.tocPanel.classList.remove('smart-toc-dragging');
    document.removeEventListener('mousemove', this.boundHandleDrag);
    document.removeEventListener('mouseup', this.boundStopDragging);
    
    // Cancel any pending frame request
    if (this.dragFrameRequest) {
      cancelAnimationFrame(this.dragFrameRequest);
      this.dragFrameRequest = null;
    }
  }

  makeResizable() {
    const resizeHandles = this.tocPanel.querySelectorAll('.smart-toc-resize-handle');
    
    // Bind methods once
    this.boundHandleResize = this.handleResize.bind(this);
    this.boundStopResizing = this.stopResizing.bind(this);
    
    resizeHandles.forEach(handle => {
      handle.addEventListener('mousedown', (e) => {
        this.isResizing = true;
        this.resizeDirection = handle.dataset.direction;
        this.resizeStartX = e.clientX;
        this.resizeStartY = e.clientY;
        this.resizeStartWidth = parseInt(window.getComputedStyle(this.tocPanel).width, 10);
        this.resizeStartHeight = parseInt(window.getComputedStyle(this.tocPanel).height, 10);
        this.resizeStartLeft = this.tocPanel.offsetLeft;
        this.resizeStartTop = this.tocPanel.offsetTop;
        
        this.tocPanel.classList.add('smart-toc-resizing');
        document.addEventListener('mousemove', this.boundHandleResize);
        document.addEventListener('mouseup', this.boundStopResizing);
        e.preventDefault();
        e.stopPropagation();
      });
    });
  }

  handleResize(e) {
    if (!this.isResizing) return;
    
    // Store the delta values for requestAnimationFrame
    this.pendingDeltaX = e.clientX - this.resizeStartX;
    this.pendingDeltaY = e.clientY - this.resizeStartY;
    
    // Use requestAnimationFrame for smooth resizing
    if (!this.resizeFrameRequest) {
      this.resizeFrameRequest = requestAnimationFrame(() => {
        const deltaX = this.pendingDeltaX;
        const deltaY = this.pendingDeltaY;
        
        const minWidth = 250;
        const minHeight = 200;
        const maxWidth = window.innerWidth * 0.8;
        const maxHeight = window.innerHeight * 0.8;
        
        let newWidth = this.resizeStartWidth;
        let newHeight = this.resizeStartHeight;
        let newLeft = this.resizeStartLeft;
        let newTop = this.resizeStartTop;
        
        switch (this.resizeDirection) {
          case 'right':
            newWidth = Math.max(minWidth, Math.min(maxWidth, this.resizeStartWidth + deltaX));
            break;
            
          case 'left':
            newWidth = Math.max(minWidth, Math.min(maxWidth, this.resizeStartWidth - deltaX));
            newLeft = this.resizeStartLeft + (this.resizeStartWidth - newWidth);
            break;
            
          case 'bottom':
            newHeight = Math.max(minHeight, Math.min(maxHeight, this.resizeStartHeight + deltaY));
            break;
            
          case 'top':
            newHeight = Math.max(minHeight, Math.min(maxHeight, this.resizeStartHeight - deltaY));
            newTop = this.resizeStartTop + (this.resizeStartHeight - newHeight);
            break;
            
          case 'bottom-right':
            newWidth = Math.max(minWidth, Math.min(maxWidth, this.resizeStartWidth + deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, this.resizeStartHeight + deltaY));
            break;
            
          case 'bottom-left':
            newWidth = Math.max(minWidth, Math.min(maxWidth, this.resizeStartWidth - deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, this.resizeStartHeight + deltaY));
            newLeft = this.resizeStartLeft + (this.resizeStartWidth - newWidth);
            break;
            
          case 'top-right':
            newWidth = Math.max(minWidth, Math.min(maxWidth, this.resizeStartWidth + deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, this.resizeStartHeight - deltaY));
            newTop = this.resizeStartTop + (this.resizeStartHeight - newHeight);
            break;
            
          case 'top-left':
            newWidth = Math.max(minWidth, Math.min(maxWidth, this.resizeStartWidth - deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, this.resizeStartHeight - deltaY));
            newLeft = this.resizeStartLeft + (this.resizeStartWidth - newWidth);
            newTop = this.resizeStartTop + (this.resizeStartHeight - newHeight);
            break;
        }
        
        this.tocPanel.style.width = newWidth + 'px';
        this.tocPanel.style.height = newHeight + 'px';
        this.tocPanel.style.left = newLeft + 'px';
        this.tocPanel.style.top = newTop + 'px';
        this.tocPanel.style.right = 'auto';
        this.tocPanel.style.bottom = 'auto';
        
        this.resizeFrameRequest = null;
      });
    }
  }

  stopResizing() {
    this.isResizing = false;
    this.resizeDirection = null;
    this.tocPanel.classList.remove('smart-toc-resizing');
    document.removeEventListener('mousemove', this.boundHandleResize);
    document.removeEventListener('mouseup', this.boundStopResizing);
    
    // Cancel any pending frame request
    if (this.resizeFrameRequest) {
      cancelAnimationFrame(this.resizeFrameRequest);
      this.resizeFrameRequest = null;
    }
  }

  setupGlanceMode() {
    document.addEventListener('keydown', (e) => {
      if (e.altKey && !this.altPressed) {
        this.altPressed = true;
        document.body.classList.add('smart-toc-glance-mode');
      }
    });

    document.addEventListener('keyup', (e) => {
      if (!e.altKey && this.altPressed) {
        this.altPressed = false;
        this.glanceMode = false;
        document.body.classList.remove('smart-toc-glance-mode');
        if (this.glanceTimeout) {
          clearTimeout(this.glanceTimeout);
        }
        if (this.isVisible && this.glanceMode) {
          this.hide();
        }
      }
    });

    document.addEventListener('mouseover', (e) => {
      if (this.altPressed && !this.isDragging && !this.isResizing) {
        const heading = e.target.closest('h1, h2, h3, h4, h5, h6, strong');
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
      this.tocPanel.classList.add('smart-toc-glance');
    }
  }

  hideGlance() {
    if (this.glanceMode) {
      this.glanceMode = false;
      this.tocPanel.classList.remove('smart-toc-glance');
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
              (node.matches('h1, h2, h3, h4, h5, h6, strong') || 
               node.querySelector('h1, h2, h3, h4, h5, h6, strong'))
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

  createSearchModal() {
    // 創建搜尋模態框
    this.searchModal = document.createElement('div');
    this.searchModal.className = 'smart-toc-search-modal';
    this.searchModal.innerHTML = `
      <div class="smart-toc-search-overlay"></div>
      <div class="smart-toc-search-dialog">
        <div class="smart-toc-search-input-container">
          <input type="text" class="smart-toc-search-input" placeholder="搜尋標題..." />
          <div class="smart-toc-search-icon">🔍</div>
        </div>
        <div class="smart-toc-search-results"></div>
        <div class="smart-toc-search-footer">
          <div class="smart-toc-search-tips">
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
    const searchToggle = this.tocPanel.querySelector('.smart-toc-search-toggle');
    const modalSearchInput = this.searchModal.querySelector('.smart-toc-search-input');
    const overlay = this.searchModal.querySelector('.smart-toc-search-overlay');

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
  }

  showSearchModal() {
    this.searchModal.style.display = 'block';
    
    // 動態計算搜尋對話框的位置（相對於TOC面板）
    const tocRect = this.tocPanel.getBoundingClientRect();
    const searchDialog = this.searchModal.querySelector('.smart-toc-search-dialog');
    
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
      const searchInput = this.searchModal.querySelector('.smart-toc-search-input');
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
    const resultsContainer = this.searchModal.querySelector('.smart-toc-search-results');
    
    if (this.filteredHeadings.length === 0) {
      resultsContainer.innerHTML = `
        <div class="smart-toc-search-no-results">
          找不到匹配的標題
        </div>
      `;
      return;
    }

    const resultsHTML = this.filteredHeadings.map((heading, index) => {
      const levelText = `H${heading.level}`;
      const highlightedTitle = this.highlightMatchingText(heading.text, this.searchQuery);
      
      return `
        <div class="smart-toc-search-result-item" data-index="${index}">
          <div class="smart-toc-search-result-content">
            <div class="smart-toc-search-result-title">${highlightedTitle}</div>
            <div class="smart-toc-search-result-level">${levelText}</div>
          </div>
        </div>
      `;
    }).join('');

    resultsContainer.innerHTML = resultsHTML;

    // 綁定點擊事件
    resultsContainer.querySelectorAll('.smart-toc-search-result-item').forEach((item, index) => {
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
             '<span class="smart-toc-search-match">' + match + '</span>' + 
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
    const resultItems = this.searchModal.querySelectorAll('.smart-toc-search-result-item');
    resultItems.forEach((item, index) => {
      if (index === this.selectedResultIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
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
    const searchInput = this.searchModal.querySelector('.smart-toc-search-input');
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
    
    const resultsContainer = this.searchModal.querySelector('.smart-toc-search-results');
    if (resultsContainer) {
      resultsContainer.innerHTML = '';
    }
  }

  setupTooltips() {
    // 創建 tooltip 元素
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'smart-toc-tooltip';
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
    customStyle.id = 'smart-toc-adaptive-colors';
    
    // 移除已存在的樣式
    const existingStyle = document.getElementById('smart-toc-adaptive-colors');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // 使用融合式配色方案
    const cssRules = `
      .smart-toc-panel {
        background: ${colors.panelBg} !important;
        color: ${colors.textColor} !important;
        border: 1px solid ${colors.borderColor} !important;
        box-shadow: 0 4px 16px ${colors.shadowColor} !important;
        backdrop-filter: blur(8px) !important;
      }
      
      .smart-toc-header {
        background: ${colors.headerBg} !important;
        border-bottom: 1px solid ${colors.borderColor} !important;
        color: ${colors.textColor} !important;
      }
      
      .smart-toc-controls button {
        color: ${colors.textColor} !important;
        background: ${colors.buttonBg} !important;
        opacity: 0.8 !important;
      }
      
      .smart-toc-controls button:hover {
        background: ${colors.buttonHoverBg} !important;
        color: ${colors.textColor} !important;
        opacity: 1 !important;
      }
      
      .smart-toc-item {
        color: ${colors.textColor} !important;
      }
      
      .smart-toc-item:hover {
        background: ${colors.itemHoverBg} !important;
      }
      
      .smart-toc-item.active {
        background: ${isDark ? 'rgba(100, 149, 237, 0.25)' : 'rgba(9, 105, 218, 0.15)'} !important;
        color: ${isDark ? '#87CEEB' : '#0969da'} !important;
        border-left: 3px solid ${isDark ? '#87CEEB' : '#0969da'} !important;
      }
      
      .smart-toc-depth-controls {
        background: ${colors.buttonBg} !important;
        border: 1px solid ${colors.borderColor} !important;
      }
      
      .smart-toc-depth-controls button {
        color: ${colors.textColor} !important;
        background: transparent !important;
      }
      
      .smart-toc-depth-controls button:hover {
        background: ${colors.buttonHoverBg} !important;
      }
      
      .smart-toc-depth-display {
        color: ${colors.textColor} !important;
        background: transparent !important;
      }
      
      .smart-toc-settings-panel {
        background: ${colors.panelBg} !important;
        border-top: 1px solid ${colors.borderColor} !important;
      }
      
      .smart-toc-settings-label {
        color: ${colors.textColor} !important;
      }
      
      .smart-toc-font-size-display {
        color: ${colors.textColor} !important;
      }
      
      .smart-toc-search-modal {
        background: ${colors.panelBg} !important;
        border: 1px solid ${colors.borderColor} !important;
        box-shadow: 0 8px 24px ${colors.shadowColor} !important;
      }
      
      .smart-toc-search-input {
        background: ${colors.buttonBg} !important;
        color: ${colors.textColor} !important;
        border: 1px solid ${colors.borderColor} !important;
      }
      
      .smart-toc-search-input::placeholder {
        color: ${isDark ? 'rgba(224, 224, 224, 0.6)' : 'rgba(51, 51, 51, 0.6)'} !important;
      }
      
      .smart-toc-search-results {
        background: ${colors.panelBg} !important;
      }
      
      .smart-toc-search-result {
        color: ${colors.textColor} !important;
      }
      
      .smart-toc-search-result:hover,
      .smart-toc-search-result.selected {
        background: ${colors.itemHoverBg} !important;
      }
      
      .smart-toc-content {
        background: ${colors.panelBg} !important;
        color: ${colors.textColor} !important;
      }
      
      .smart-toc-loading,
      .smart-toc-no-headings {
        color: ${colors.textColor} !important;
      }
      
      .smart-toc-link {
        color: ${colors.textColor} !important;
      }
      
      .smart-toc-item.smart-toc-active {
        background: ${isDark ? 'rgba(100, 149, 237, 0.25)' : 'rgba(9, 105, 218, 0.15)'} !important;
        color: ${isDark ? '#87CEEB' : '#0969da'} !important;
      }
      
      .smart-toc-item.smart-toc-active .smart-toc-link {
        color: ${isDark ? '#87CEEB' : '#0969da'} !important;
      }
      
      .smart-toc-no-search-results {
        color: ${colors.textColor} !important;
        opacity: 0.7;
      }
      
      .smart-toc-content::-webkit-scrollbar-track {
        background: ${colors.buttonBg} !important;
      }
      
      .smart-toc-content::-webkit-scrollbar-thumb {
        background: ${colors.borderColor} !important;
      }
      
      .smart-toc-content::-webkit-scrollbar-thumb:hover {
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
    customStyle.id = 'smart-toc-adaptive-colors';
    
    // 移除已存在的樣式
    const existingStyle = document.getElementById('smart-toc-adaptive-colors');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // 使用主題配色方案
    const cssRules = `
      .smart-toc-panel {
        background: ${colors.panelBg} !important;
        color: ${colors.textColor} !important;
        border: 1px solid ${colors.borderColor} !important;
        box-shadow: 0 4px 16px ${colors.shadowColor} !important;
        backdrop-filter: blur(8px) !important;
      }
      
      .smart-toc-header {
        background: ${colors.headerBg} !important;
        border-bottom: 1px solid ${colors.borderColor} !important;
        color: ${colors.textColor} !important;
      }
      
      .smart-toc-controls button {
        color: ${colors.textColor} !important;
        background: ${colors.buttonBg} !important;
        opacity: 0.8 !important;
      }
      
      .smart-toc-controls button:hover {
        background: ${colors.buttonHoverBg} !important;
        color: ${colors.textColor} !important;
        opacity: 1 !important;
      }
      
      .smart-toc-item {
        color: ${colors.textColor} !important;
      }
      
      .smart-toc-item:hover {
        background: ${colors.itemHoverBg} !important;
      }
      
      .smart-toc-item.active {
        background: ${isDark ? 'rgba(100, 149, 237, 0.25)' : 'rgba(9, 105, 218, 0.15)'} !important;
        color: ${isDark ? '#87CEEB' : '#0969da'} !important;
        border-left: 3px solid ${isDark ? '#87CEEB' : '#0969da'} !important;
      }
      
      .smart-toc-depth-controls {
        background: ${colors.buttonBg} !important;
        border: 1px solid ${colors.borderColor} !important;
      }
      
      .smart-toc-depth-controls button {
        color: ${colors.textColor} !important;
        background: transparent !important;
      }
      
      .smart-toc-depth-controls button:hover {
        background: ${colors.buttonHoverBg} !important;
      }
      
      .smart-toc-depth-display {
        color: ${colors.textColor} !important;
        background: transparent !important;
      }
      
      .smart-toc-settings-panel {
        background: ${colors.panelBg} !important;
        border-top: 1px solid ${colors.borderColor} !important;
      }
      
      .smart-toc-settings-label {
        color: ${colors.textColor} !important;
      }
      
      .smart-toc-font-size-display {
        color: ${colors.textColor} !important;
      }
      
      .smart-toc-search-modal {
        background: ${colors.panelBg} !important;
        border: 1px solid ${colors.borderColor} !important;
        box-shadow: 0 8px 24px ${colors.shadowColor} !important;
      }
      
      .smart-toc-search-input {
        background: ${colors.buttonBg} !important;
        color: ${colors.textColor} !important;
        border: 1px solid ${colors.borderColor} !important;
      }
      
      .smart-toc-search-input::placeholder {
        color: ${isDark ? 'rgba(224, 224, 224, 0.6)' : 'rgba(51, 51, 51, 0.6)'} !important;
      }
      
      .smart-toc-search-results {
        background: ${colors.panelBg} !important;
      }
      
      .smart-toc-search-result {
        color: ${colors.textColor} !important;
      }
      
      .smart-toc-search-result:hover,
      .smart-toc-search-result.selected {
        background: ${colors.itemHoverBg} !important;
      }
      
      .smart-toc-theme-menu {
        background: ${colors.panelBg} !important;
        border: 1px solid ${colors.borderColor} !important;
        box-shadow: 0 4px 12px ${colors.shadowColor} !important;
      }
      
      .smart-toc-theme-option {
        color: ${colors.textColor} !important;
      }
      
      .smart-toc-theme-option:hover {
        background: ${colors.itemHoverBg} !important;
      }
      
      .smart-toc-content {
        background: ${colors.panelBg} !important;
        color: ${colors.textColor} !important;
      }
      
      .smart-toc-loading,
      .smart-toc-no-headings {
        color: ${colors.textColor} !important;
      }
      
      .smart-toc-link {
        color: ${colors.textColor} !important;
      }
      
      .smart-toc-item.smart-toc-active {
        background: ${isDark ? 'rgba(100, 149, 237, 0.25)' : 'rgba(9, 105, 218, 0.15)'} !important;
        color: ${isDark ? '#87CEEB' : '#0969da'} !important;
      }
      
      .smart-toc-item.smart-toc-active .smart-toc-link {
        color: ${isDark ? '#87CEEB' : '#0969da'} !important;
      }
      
      .smart-toc-no-search-results {
        color: ${colors.textColor} !important;
        opacity: 0.7;
      }
      
      .smart-toc-content::-webkit-scrollbar-track {
        background: ${colors.buttonBg} !important;
      }
      
      .smart-toc-content::-webkit-scrollbar-thumb {
        background: ${colors.borderColor} !important;
      }
      
      .smart-toc-content::-webkit-scrollbar-thumb:hover {
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
    const themeOptions = this.tocPanel.querySelectorAll('.smart-toc-theme-option');
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
    toast.className = 'smart-toc-theme-toast';
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
    
    const themeMenu = this.tocPanel.querySelector('.smart-toc-theme-menu');
    if (!themeMenu) return;
    
    this.themeMenu = themeMenu;
    
    // 選單項目點擊
    const themeOptions = themeMenu.querySelectorAll('.smart-toc-theme-option');
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

  // 釘選功能相關方法
  togglePin() {
    this.isPinned = !this.isPinned;
    this.updatePinState();
  }

  updatePinState() {
    const pinBtn = this.tocPanel.querySelector('.smart-toc-pin');
    if (this.isPinned) {
      pinBtn.classList.add('pinned');
      this.tocPanel.classList.add('pinned');
      pinBtn.title = '取消釘選';
    } else {
      pinBtn.classList.remove('pinned');
      this.tocPanel.classList.remove('pinned');
      pinBtn.title = '釘選面板';
    }
  }

  // 更新收合/展開按鈕顯示
  updateCollapseExpandButtons() {
    const collapseOption = this.tocPanel.querySelector('.smart-toc-more-option.smart-toc-collapse');
    const expandOption = this.tocPanel.querySelector('.smart-toc-more-option.smart-toc-expand');
    
    if (this.isCollapsed) {
      if (collapseOption) collapseOption.style.display = 'none';
      if (expandOption) expandOption.style.display = 'flex';
    } else {
      if (collapseOption) collapseOption.style.display = 'flex';
      if (expandOption) expandOption.style.display = 'none';
    }
  }

  // 修改原本的拖曳功能以支援釘選狀態
  makeDraggable() {
    const header = this.tocPanel.querySelector('.smart-toc-header');
    
    // Bind methods once
    this.boundHandleDrag = this.handleDrag.bind(this);
    this.boundStopDragging = this.stopDragging.bind(this);
    
    header.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      if (this.isPinned) return; // 釘選時不允許拖曳
      
      this.isDragging = true;
      this.tocPanel.classList.add('smart-toc-dragging');
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

  destroy() {
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
    const adaptiveStyle = document.getElementById('smart-toc-adaptive-colors');
    if (adaptiveStyle) {
      adaptiveStyle.remove();
    }
    document.body.classList.remove('smart-toc-glance-mode');
  }
}

if (typeof window !== 'undefined') {
  console.log('Smart TOC content script loaded');
  
  // Prevent multiple initialization
  if (window.smartTOC) {
    console.log('Smart TOC already exists, cleaning up...');
    window.smartTOC.destroy();
  }
  
  console.log('Initializing Smart TOC...');
  window.smartTOC = new SmartTOC();
  console.log('Smart TOC initialized:', window.smartTOC);
}
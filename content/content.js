class SmartTOC {
  constructor() {
    this.tocPanel = null;
    this.headings = [];
    this.isVisible = false;
    this.isCollapsed = false;
    this.currentHeading = null;
    this.intersectionObserver = null;
    this.isDragging = false;
    this.isResizing = false;
    this.dragOffset = { x: 0, y: 0 };
    this.altPressed = false;
    this.glanceMode = false;
    this.glanceTimeout = null;
    this.settings = {
      maxHeadingLevels: 3,
      tocPosition: 'right',
      tocWidth: 300,
      enableLocalFiles: false,
      autoShow: false,
      fontSize: 16,
      highlightDuration: 5
    };
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.createTOCPanel();
    this.extractHeadings();
    this.setupEventListeners();
    this.setupScrollTracking();
    this.makeDraggable();
    this.makeResizable();
    this.setupGlanceMode();
    
    if (this.settings.autoShow && this.headings.length > 2) {
      setTimeout(() => this.show(), 1000);
    }
  }

  async loadSettings() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({ action: 'get-settings' }, (response) => {
          if (response) {
            this.settings = { ...this.settings, ...response };
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
        <span class="smart-toc-title">Table of Contents</span>
        <div class="smart-toc-controls">
          <button class="smart-toc-settings" title="Settings">⚙️</button>
          <button class="smart-toc-collapse" title="Collapse panel">📁</button>
          <button class="smart-toc-expand" title="Expand panel">📂</button>
          <button class="smart-toc-copy" title="Copy to clipboard">📋</button>
          <button class="smart-toc-close" title="Close">×</button>
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
      }
      return true; // Important for async response
    });

    const closeBtn = this.tocPanel.querySelector('.smart-toc-close');
    closeBtn.addEventListener('click', () => this.hide());

    const collapseBtn = this.tocPanel.querySelector('.smart-toc-collapse');
    collapseBtn.addEventListener('click', () => this.collapsePanel());

    const expandBtn = this.tocPanel.querySelector('.smart-toc-expand');
    expandBtn.addEventListener('click', () => this.expandPanel());

    const copyBtn = this.tocPanel.querySelector('.smart-toc-copy');
    copyBtn.addEventListener('click', () => this.copyToClipboard());

    const settingsBtn = this.tocPanel.querySelector('.smart-toc-settings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Settings button clicked');
        this.toggleSettingsPanel();
      });
    } else {
      console.error('Settings button not found');
    }

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

    document.addEventListener('click', (e) => {
      if (!this.tocPanel.contains(e.target)) {
        this.hideSettingsPanel();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
      if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        this.toggle();
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

  updateCollapseExpandButtons() {
    const collapseBtn = this.tocPanel.querySelector('.smart-toc-collapse');
    const expandBtn = this.tocPanel.querySelector('.smart-toc-expand');
    
    if (this.isCollapsed) {
      collapseBtn.style.display = 'none';
      expandBtn.style.display = 'flex';
    } else {
      collapseBtn.style.display = 'flex';
      expandBtn.style.display = 'none';
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

  showNotification(message) {
    // Remove any existing notification
    const existingNotification = document.querySelector('.smart-toc-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create new notification
    const notification = document.createElement('div');
    notification.className = 'smart-toc-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Show notification
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });

    // Hide and remove notification
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 2000);
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

  async saveSettings() {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ 
        action: 'save-settings', 
        settings: this.settings 
      });
    }
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
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  makeDraggable() {
    const header = this.tocPanel.querySelector('.smart-toc-header');
    
    header.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      
      this.isDragging = true;
      const rect = this.tocPanel.getBoundingClientRect();
      this.dragOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      document.addEventListener('mousemove', this.handleDrag.bind(this));
      document.addEventListener('mouseup', this.stopDragging.bind(this));
      
      e.preventDefault();
    });
  }

  handleDrag(e) {
    if (!this.isDragging) return;
    
    const x = e.clientX - this.dragOffset.x;
    const y = e.clientY - this.dragOffset.y;
    
    const maxX = window.innerWidth - this.tocPanel.offsetWidth;
    const maxY = window.innerHeight - this.tocPanel.offsetHeight;
    
    const clampedX = Math.max(0, Math.min(x, maxX));
    const clampedY = Math.max(0, Math.min(y, maxY));
    
    this.tocPanel.style.left = clampedX + 'px';
    this.tocPanel.style.top = clampedY + 'px';
    this.tocPanel.style.right = 'auto';
  }

  stopDragging() {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.handleDrag.bind(this));
    document.removeEventListener('mouseup', this.stopDragging.bind(this));
  }

  makeResizable() {
    const resizeHandles = this.tocPanel.querySelectorAll('.smart-toc-resize-handle');
    
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
        document.addEventListener('mousemove', this.handleResize.bind(this));
        document.addEventListener('mouseup', this.stopResizing.bind(this));
        e.preventDefault();
        e.stopPropagation();
      });
    });
  }

  handleResize(e) {
    if (!this.isResizing) return;
    
    const deltaX = e.clientX - this.resizeStartX;
    const deltaY = e.clientY - this.resizeStartY;
    
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
  }

  stopResizing() {
    this.isResizing = false;
    this.resizeDirection = null;
    this.tocPanel.classList.remove('smart-toc-resizing');
    document.removeEventListener('mousemove', this.handleResize.bind(this));
    document.removeEventListener('mouseup', this.stopResizing.bind(this));
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
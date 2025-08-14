class SmartTOC {
  constructor() {
    this.tocPanel = null;
    this.headings = [];
    this.isVisible = false;
    this.currentHeading = null;
    this.intersectionObserver = null;
    this.isDragging = false;
    this.isResizing = false;
    this.dragOffset = { x: 0, y: 0 };
    this.settings = {
      maxHeadingLevels: 3,
      tocPosition: 'right',
      tocWidth: 300
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
          <button class="smart-toc-collapse-all" title="Collapse all">📁</button>
          <button class="smart-toc-expand-all" title="Expand all">📂</button>
          <button class="smart-toc-copy" title="Copy to clipboard">📋</button>
          <button class="smart-toc-close" title="Close">×</button>
        </div>
      </div>
      <div class="smart-toc-content">
        <div class="smart-toc-loading">Analyzing page structure...</div>
      </div>
      <div class="smart-toc-resize-handle"></div>
    `;
    
    this.tocPanel.style.width = this.settings.tocWidth + 'px';
    this.tocPanel.style.right = this.settings.tocPosition === 'right' ? '20px' : 'auto';
    this.tocPanel.style.left = this.settings.tocPosition === 'left' ? '20px' : 'auto';
    
    document.body.appendChild(this.tocPanel);
    this.tocPanel.style.display = 'none';
  }

  extractHeadings() {
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

    headings = this.filterHeadings(headings);
    
    this.headings = headings.map((heading, index) => ({
      element: heading,
      text: this.cleanHeadingText(heading.textContent.trim()),
      level: parseInt(heading.tagName.charAt(1)),
      id: heading.id || `smart-toc-heading-${index}`,
      index,
      visible: parseInt(heading.tagName.charAt(1)) <= this.settings.maxHeadingLevels
    }));

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
      
      return rect.width > 0 && 
             rect.height > 0 && 
             style.visibility !== 'hidden' && 
             style.display !== 'none' &&
             heading.textContent.trim().length > 0 &&
             !heading.closest('.smart-toc-panel');
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
      if (request.action === 'toggle-toc') {
        this.toggle();
      } else if (request.action === 'get-status') {
        sendResponse({ isVisible: this.isVisible });
      }
    });

    const closeBtn = this.tocPanel.querySelector('.smart-toc-close');
    closeBtn.addEventListener('click', () => this.hide());

    const collapseAllBtn = this.tocPanel.querySelector('.smart-toc-collapse-all');
    collapseAllBtn.addEventListener('click', () => this.collapseAll());

    const expandAllBtn = this.tocPanel.querySelector('.smart-toc-expand-all');
    expandAllBtn.addEventListener('click', () => this.expandAll());

    const copyBtn = this.tocPanel.querySelector('.smart-toc-copy');
    copyBtn.addEventListener('click', () => this.copyToClipboard());

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

  collapseAll() {
    this.headings.forEach(heading => {
      if (heading.level > 2) {
        heading.visible = false;
      }
    });
    this.renderTOC();
  }

  expandAll() {
    this.headings.forEach(heading => {
      heading.visible = heading.level <= this.settings.maxHeadingLevels;
    });
    this.renderTOC();
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
    const copyBtn = this.tocPanel.querySelector('.smart-toc-copy');
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '✅';
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
    }, 1500);
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
    const resizeHandle = this.tocPanel.querySelector('.smart-toc-resize-handle');
    
    resizeHandle.addEventListener('mousedown', (e) => {
      this.isResizing = true;
      document.addEventListener('mousemove', this.handleResize.bind(this));
      document.addEventListener('mouseup', this.stopResizing.bind(this));
      e.preventDefault();
      e.stopPropagation();
    });
  }

  handleResize(e) {
    if (!this.isResizing) return;
    
    const rect = this.tocPanel.getBoundingClientRect();
    const width = e.clientX - rect.left;
    const height = e.clientY - rect.top;
    
    const minWidth = 250;
    const minHeight = 200;
    const maxWidth = window.innerWidth * 0.5;
    const maxHeight = window.innerHeight * 0.8;
    
    if (width >= minWidth && width <= maxWidth) {
      this.tocPanel.style.width = width + 'px';
    }
    
    if (height >= minHeight && height <= maxHeight) {
      this.tocPanel.style.height = height + 'px';
    }
  }

  stopResizing() {
    this.isResizing = false;
    document.removeEventListener('mousemove', this.handleResize.bind(this));
    document.removeEventListener('mouseup', this.stopResizing.bind(this));
  }
}

if (typeof window !== 'undefined') {
  window.smartTOC = new SmartTOC();
}
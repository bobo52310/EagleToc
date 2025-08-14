class SmartTOC {
  constructor() {
    this.tocPanel = null;
    this.headings = [];
    this.isVisible = false;
    this.init();
  }

  init() {
    this.createTOCPanel();
    this.extractHeadings();
    this.setupEventListeners();
  }

  createTOCPanel() {
    this.tocPanel = document.createElement('div');
    this.tocPanel.id = 'smart-toc-panel';
    this.tocPanel.className = 'smart-toc-panel';
    this.tocPanel.innerHTML = `
      <div class="smart-toc-header">
        <span class="smart-toc-title">Table of Contents</span>
        <button class="smart-toc-close">×</button>
      </div>
      <div class="smart-toc-content">
        <div class="smart-toc-loading">Analyzing page structure...</div>
      </div>
    `;
    
    document.body.appendChild(this.tocPanel);
    this.tocPanel.style.display = 'none';
  }

  extractHeadings() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    this.headings = Array.from(headings).map((heading, index) => ({
      element: heading,
      text: heading.textContent.trim(),
      level: parseInt(heading.tagName.charAt(1)),
      id: heading.id || `smart-toc-heading-${index}`,
      index
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

  renderTOC() {
    const content = this.tocPanel.querySelector('.smart-toc-content');
    const tocList = this.createTOCList(this.headings);
    content.innerHTML = '';
    content.appendChild(tocList);
  }

  createTOCList(headings) {
    const ul = document.createElement('ul');
    ul.className = 'smart-toc-list';

    headings.forEach(heading => {
      const li = document.createElement('li');
      li.className = `smart-toc-item smart-toc-level-${heading.level}`;
      
      const a = document.createElement('a');
      a.href = `#${heading.id}`;
      a.textContent = heading.text;
      a.className = 'smart-toc-link';
      
      a.addEventListener('click', (e) => {
        e.preventDefault();
        heading.element.scrollIntoView({ behavior: 'smooth' });
      });

      li.appendChild(a);
      ul.appendChild(li);
    });

    return ul;
  }

  showNoHeadingsMessage() {
    const content = this.tocPanel.querySelector('.smart-toc-content');
    content.innerHTML = '<div class="smart-toc-no-headings">No headings found on this page.</div>';
  }

  setupEventListeners() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'toggle-toc') {
        this.toggle();
      }
    });

    const closeBtn = this.tocPanel.querySelector('.smart-toc-close');
    closeBtn.addEventListener('click', () => this.hide());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
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
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
}

if (typeof window !== 'undefined') {
  window.smartTOC = new SmartTOC();
}
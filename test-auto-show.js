// Test script for auto-show functionality
// This can be run in the browser console to test auto-show behavior

console.log('Testing Smart TOC Auto-show functionality...');

// Check if SmartTOC is available
if (typeof window.smartTOC !== 'undefined') {
  const toc = window.smartTOC;
  
  console.log('SmartTOC instance found:', toc);
  
  // Test heading detection
  const headings = toc.getHeadings();
  console.log('Headings found:', headings.length);
  headings.forEach((heading, index) => {
    console.log(`${index + 1}. ${heading.tagName}: ${heading.textContent.trim()}`);
  });
  
  // Test auto-show settings
  chrome.storage.sync.get(['autoShow', 'autoShowMinHeadings', 'autoShowDelay'], (settings) => {
    console.log('Auto-show settings:', settings);
    
    if (settings.autoShow && headings.length >= settings.autoShowMinHeadings) {
      console.log('✅ Auto-show conditions met');
      console.log(`- Auto-show enabled: ${settings.autoShow}`);
      console.log(`- Headings required: ${settings.autoShowMinHeadings}`);
      console.log(`- Headings found: ${headings.length}`);
      console.log(`- Delay: ${settings.autoShowDelay}ms`);
    } else {
      console.log('❌ Auto-show conditions not met');
      console.log(`- Auto-show enabled: ${settings.autoShow}`);
      console.log(`- Headings required: ${settings.autoShowMinHeadings}`);
      console.log(`- Headings found: ${headings.length}`);
    }
  });
  
  // Test disabled domains
  const disabledDomains = toc.getAutoShowDisabledDomains();
  const currentDomain = window.location.hostname;
  console.log('Current domain:', currentDomain);
  console.log('Disabled domains:', disabledDomains);
  console.log('Is current domain disabled?', disabledDomains.includes(currentDomain));
  
} else {
  console.log('❌ SmartTOC not found. Make sure the extension is loaded.');
}

// Test manual TOC trigger
console.log('To manually test TOC, run: window.smartTOC?.show()');
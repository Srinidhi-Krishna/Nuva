// ====================
// FILE: content.js - COMPLETE VERSION
// ====================

const API_KEY = 'AIzaSyBk-ldqEuFGUgKVOI7P6sZC_7XYmyXdweM';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

let preferences = {
  theme: 'light',
  primaryColor: '#667eea',
  secondaryColor: '#764ba2',
  dyslexicMode: false
};

if (chrome && chrome.storage) {
  chrome.storage.local.get('nuvaPreferences', (result) => {
    if (result.nuvaPreferences) {
      preferences = { ...preferences, ...result.nuvaPreferences };
      applyPreferences();
    }
  });
}

if (!document.getElementById('nuva-panel')) {
  createPanel();
}

function createPanel() {
  const overlay = document.createElement('div');
  overlay.id = 'nuva-panel';
  overlay.innerHTML = `
    <div class="nuva-panel-container">
      <div class="nuva-header">
        <div class="nuva-title">
          <span class="nuva-icon">✨</span>
          <span>Nuva AI Assistant</span>
        </div>
        <div class="nuva-header-controls">
          <button class="nuva-settings-btn" id="nuva-settings-toggle" title="Settings">⚙️</button>
          <button class="nuva-theme-toggle" id="nuva-theme-toggle" title="Toggle Theme">🌙</button>
          <button class="nuva-close" id="nuva-close">✕</button>
        </div>
      </div>
      
      <div class="nuva-settings-panel" id="nuva-settings-panel" style="display: none;">
        <h3 style="margin: 0 0 15px 0; font-size: 16px;">Customization</h3>
        
        <div class="nuva-setting-group">
          <label class="nuva-setting-label">
            <span>🎨 Primary Color</span>
            <input type="color" id="nuva-primary-color" value="#667eea" class="nuva-color-input">
          </label>
        </div>
        
        <div class="nuva-setting-group">
          <label class="nuva-setting-label">
            <span>🎨 Secondary Color</span>
            <input type="color" id="nuva-secondary-color" value="#764ba2" class="nuva-color-input">
          </label>
        </div>
        
        <div class="nuva-setting-group">
          <label class="nuva-setting-label">
            <span>📖 Dyslexic Mode</span>
            <label class="nuva-toggle">
              <input type="checkbox" id="nuva-dyslexic-toggle">
              <span class="nuva-toggle-slider"></span>
            </label>
          </label>
          <p class="nuva-setting-hint">Uses OpenDyslexic font for better readability</p>
        </div>
        
        <button class="nuva-save-settings" id="nuva-save-settings">💾 Save Settings</button>
      </div>
      
      <div class="nuva-content">
        <div class="nuva-tabs">
          <button class="nuva-tab active" data-tab="restructure" title="AI-powered text restructuring">🔄 Restructure</button>
          <button class="nuva-tab" data-tab="simplify" title="Simplified conceptual breakdown">🔤 Simplify</button>
          <button class="nuva-tab" data-tab="organize" title="Improved visual organization">📋 Organize</button>
          <button class="nuva-tab" data-tab="doubt" title="Ask questions about the content">💬 Ask Doubt</button>
        </div>
        
        <div class="nuva-settings" id="nuva-intensity-settings">
          <label class="nuva-label">
            <span>Intensity:</span>
            <select id="nuva-intensity" class="nuva-select">
              <option value="low">Low</option>
              <option value="mid" selected>Mid</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>
        
        <div class="nuva-doubt-input" id="nuva-doubt-input" style="display: none;">
          <textarea 
            id="nuva-doubt-question" 
            class="nuva-doubt-textarea" 
            placeholder="Ask your question about the content..."
            rows="3"
          ></textarea>
        </div>
        
        <div class="nuva-source-options">
          <label class="nuva-source-label">
            <input type="radio" name="source" value="page" checked>
            <span>📄 Entire Page</span>
          </label>
          <label class="nuva-source-label">
            <input type="radio" name="source" value="selection">
            <span>✂️ Selected Text</span>
          </label>
          <label class="nuva-source-label">
            <input type="radio" name="source" value="pdf">
            <span>📕 PDF Viewer</span>
          </label>
        </div>
        
        <button class="nuva-analyze-btn" id="nuva-analyze">
          🚀 Transform
        </button>
        
        <div class="nuva-result" id="nuva-result">
          <div class="nuva-placeholder">
            <div class="nuva-placeholder-icon">📄</div>
            <p>Click "Transform" to restructure content!</p>
            <p class="nuva-hint">Select your source and let AI improve readability.</p>
          </div>
        </div>
        
        <div class="nuva-loading" id="nuva-loading" style="display: none;">
          <div class="nuva-spinner"></div>
          <p>Transforming content with AI...</p>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=OpenDyslexic:wght@400;700&display=swap');
    
    #nuva-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 420px;
      height: 100vh;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      box-shadow: -5px 0 20px rgba(0, 0, 0, 0.2);
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    
    .nuva-panel-container {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, var(--nuva-primary, #667eea) 0%, var(--nuva-secondary, #764ba2) 100%);
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
    }
    
    .nuva-panel-container.dark-mode {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    }
    
    .nuva-header {
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }
    
    .nuva-header-controls {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    .nuva-title {
      display: flex;
      align-items: center;
      gap: 10px;
      color: white;
      font-size: 20px;
      font-weight: 700;
    }
    
    .nuva-icon { font-size: 28px; }
    
    .nuva-close, .nuva-theme-toggle, .nuva-settings-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .nuva-close:hover, .nuva-theme-toggle:hover, .nuva-settings-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }
    
    .nuva-close:hover {
      transform: rotate(90deg) scale(1.1);
    }
    
    .nuva-settings-panel {
      padding: 20px;
      background: rgba(255, 255, 255, 0.95);
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }
    
    .dark-mode .nuva-settings-panel {
      background: rgba(30, 30, 50, 0.95);
      color: white;
    }
    
    .nuva-setting-group {
      margin-bottom: 15px;
    }
    
    .nuva-setting-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      font-weight: 600;
    }
    
    .nuva-setting-hint {
      font-size: 12px;
      color: #666;
      margin: 5px 0 0 0;
    }
    
    .dark-mode .nuva-setting-hint {
      color: #aaa;
    }
    
    .nuva-color-input {
      width: 50px;
      height: 32px;
      border: 2px solid #ddd;
      border-radius: 6px;
      cursor: pointer;
    }
    
    .nuva-toggle {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 24px;
    }
    
    .nuva-toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .nuva-toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .3s;
      border-radius: 24px;
    }
    
    .nuva-toggle-slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .3s;
      border-radius: 50%;
    }
    
    .nuva-toggle input:checked + .nuva-toggle-slider {
      background: linear-gradient(135deg, var(--nuva-primary, #667eea) 0%, var(--nuva-secondary, #764ba2) 100%);
    }
    
    .nuva-toggle input:checked + .nuva-toggle-slider:before {
      transform: translateX(26px);
    }
    
    .nuva-save-settings {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, var(--nuva-primary, #667eea) 0%, var(--nuva-secondary, #764ba2) 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .nuva-save-settings:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    
    .nuva-content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background: white;
    }
    
    .dark-mode .nuva-content {
      background: #1e1e2e;
      color: white;
    }
    
    .nuva-content.dyslexic-mode, .nuva-content.dyslexic-mode * {
      font-family: 'OpenDyslexic', sans-serif !important;
    }
    
    .nuva-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
    }
    
    .nuva-tab {
      flex: 1;
      padding: 12px 8px;
      background: #f0f0f0;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 11px;
      font-weight: 600;
      color: #666;
      transition: all 0.3s;
    }
    
    .dark-mode .nuva-tab {
      background: #2a2a3e;
      color: #aaa;
    }
    
    .nuva-tab:hover { 
      background: #e0e0e0;
      transform: translateY(-2px);
    }
    
    .dark-mode .nuva-tab:hover {
      background: #3a3a4e;
    }
    
    .nuva-tab.active {
      background: linear-gradient(135deg, var(--nuva-primary, #667eea) 0%, var(--nuva-secondary, #764ba2) 100%);
      color: white;
    }
    
    .nuva-settings {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 10px;
      margin-bottom: 15px;
    }
    
    .dark-mode .nuva-settings {
      background: #2a2a3e;
    }
    
    .nuva-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      color: #333;
      font-weight: 600;
    }
    
    .dark-mode .nuva-label {
      color: white;
    }
    
    .nuva-select {
      padding: 8px 12px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      background: white;
      font-size: 14px;
      cursor: pointer;
    }
    
    .dark-mode .nuva-select {
      background: #1e1e2e;
      border-color: #3a3a4e;
      color: white;
    }
    
    .nuva-source-options {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }
    
    .nuva-source-label {
      flex: 1;
      min-width: 110px;
      padding: 10px;
      background: #f8f9fa;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      text-align: center;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }
    
    .dark-mode .nuva-source-label {
      background: #2a2a3e;
      border-color: #3a3a4e;
      color: white;
    }
    
    .nuva-source-label:hover {
      border-color: var(--nuva-primary, #667eea);
      transform: translateY(-2px);
    }
    
    .nuva-source-label input {
      display: none;
    }
    
    .nuva-source-label:has(input:checked) {
      background: linear-gradient(135deg, var(--nuva-primary, #667eea) 0%, var(--nuva-secondary, #764ba2) 100%);
      color: white;
      border-color: transparent;
    }
    
    .nuva-analyze-btn {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, var(--nuva-primary, #667eea) 0%, var(--nuva-secondary, #764ba2) 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
      margin-bottom: 20px;
    }
    
    .nuva-analyze-btn:hover {
      transform: scale(1.02);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }
    
    .nuva-result {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      min-height: 200px;
      line-height: 1.8;
      color: #333;
    }
    
    .dark-mode .nuva-result {
      background: #2a2a3e;
      color: white;
    }
    
    .nuva-placeholder {
      text-align: center;
      padding: 40px 20px;
    }
    
    .nuva-placeholder-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    
    .nuva-placeholder p {
      color: #666;
      margin: 8px 0;
    }
    
    .dark-mode .nuva-placeholder p {
      color: #aaa;
    }
    
    .nuva-hint {
      font-size: 13px;
      color: #999;
    }
    
    .nuva-loading {
      text-align: center;
      padding: 40px 20px;
    }
    
    .nuva-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f0f0f0;
      border-top: 4px solid var(--nuva-primary, #667eea);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 15px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .nuva-content::-webkit-scrollbar {
      width: 8px;
    }
    
    .nuva-content::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    
    .dark-mode .nuva-content::-webkit-scrollbar-track {
      background: #2a2a3e;
    }
    
    .nuva-content::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 4px;
    }
    
    .nuva-doubt-input {
      margin-bottom: 15px;
    }
    
    .nuva-doubt-textarea {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      transition: all 0.3s;
    }
    
    .nuva-doubt-textarea:focus {
      outline: none;
      border-color: var(--nuva-primary, #667eea);
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .dark-mode .nuva-doubt-textarea {
      background: #2a2a3e;
      border-color: #3a3a4e;
      color: white;
    }
    
    .dark-mode .nuva-doubt-textarea::placeholder {
      color: #aaa;
    }
  `;
  
  document.head.appendChild(style);
  
  let currentMode = 'restructure';
  let currentSource = 'page';
  
  applyPreferences();
  
  const settingsToggle = document.getElementById('nuva-settings-toggle');
  const settingsPanel = document.getElementById('nuva-settings-panel');
  if (settingsToggle && settingsPanel) {
    settingsToggle.addEventListener('click', () => {
      settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
    });
  }
  
  const themeToggle = document.getElementById('nuva-theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      preferences.theme = preferences.theme === 'light' ? 'dark' : 'light';
      applyPreferences();
      savePreferences();
    });
  }
  
  const primaryColorInput = document.getElementById('nuva-primary-color');
  const secondaryColorInput = document.getElementById('nuva-secondary-color');
  if (primaryColorInput) primaryColorInput.value = preferences.primaryColor;
  if (secondaryColorInput) secondaryColorInput.value = preferences.secondaryColor;
  
  const dyslexicToggle = document.getElementById('nuva-dyslexic-toggle');
  if (dyslexicToggle) dyslexicToggle.checked = preferences.dyslexicMode;
  
  const saveSettingsBtn = document.getElementById('nuva-save-settings');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', () => {
      if (primaryColorInput) preferences.primaryColor = primaryColorInput.value;
      if (secondaryColorInput) preferences.secondaryColor = secondaryColorInput.value;
      if (dyslexicToggle) preferences.dyslexicMode = dyslexicToggle.checked;
      
      applyPreferences();
      savePreferences();
      
      saveSettingsBtn.textContent = '✅ Saved!';
      setTimeout(() => {
        saveSettingsBtn.textContent = '💾 Save Settings';
      }, 2000);
    });
  }
  
  const closeBtn = document.getElementById('nuva-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => overlay.remove());
  }
  
  const tabs = document.querySelectorAll('.nuva-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentMode = tab.getAttribute('data-tab') || 'restructure';
      
      // Show/hide relevant UI elements based on mode
      const intensitySettings = document.getElementById('nuva-intensity-settings');
      const doubtInput = document.getElementById('nuva-doubt-input');
      
      if (currentMode === 'doubt') {
        if (intensitySettings) intensitySettings.style.display = 'none';
        if (doubtInput) doubtInput.style.display = 'block';
      } else {
        if (intensitySettings) intensitySettings.style.display = 'block';
        if (doubtInput) doubtInput.style.display = 'none';
      }
    });
  });
  
  const sourceRadios = document.querySelectorAll('input[name="source"]');
  sourceRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      currentSource = e.target.value;
    });
  });
  
  const analyzeBtn = document.getElementById('nuva-analyze');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', async () => {
      const intensitySelect = document.getElementById('nuva-intensity');
      const intensity = intensitySelect ? intensitySelect.value : 'mid';
      const resultDiv = document.getElementById('nuva-result');
      const loadingDiv = document.getElementById('nuva-loading');
      const doubtQuestion = document.getElementById('nuva-doubt-question');
      
      if (resultDiv) resultDiv.style.display = 'none';
      if (loadingDiv) loadingDiv.style.display = 'block';
      
      const pageContent = extractContent(currentSource);
      
      if (!pageContent || pageContent.trim() === '') {
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (resultDiv) {
          resultDiv.style.display = 'block';
          resultDiv.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #e74c3c;">
              <p style="font-size: 24px; margin-bottom: 10px;">⚠️</p>
              <p><strong>No content found!</strong></p>
              <p style="font-size: 14px; margin-top: 10px;">
                ${currentSource === 'selection' ? 'Please select some text first.' : 
                  currentSource === 'pdf' ? 'Unable to extract PDF content. Try selecting text manually.' :
                  'No readable content found on this page.'}
              </p>
            </div>
          `;
        }
        return;
      }
      
      // Check if doubt mode and validate question
      if (currentMode === 'doubt') {
        const question = doubtQuestion ? doubtQuestion.value.trim() : '';
        if (!question) {
          if (loadingDiv) loadingDiv.style.display = 'none';
          if (resultDiv) {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
              <div style="padding: 20px; text-align: center; color: #e74c3c;">
                <p style="font-size: 24px; margin-bottom: 10px;">⚠️</p>
                <p><strong>Please enter your question!</strong></p>
                <p style="font-size: 14px; margin-top: 10px;">Type a question in the text box above.</p>
              </div>
            `;
          }
          return;
        }
        const result = await analyzeContent(pageContent, currentMode, intensity, question);
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (resultDiv) {
          resultDiv.style.display = 'block';
          resultDiv.innerHTML = result;
        }
      } else {
        const result = await analyzeContent(pageContent, currentMode, intensity);
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (resultDiv) {
          resultDiv.style.display = 'block';
          resultDiv.innerHTML = result;
        }
      }
    });
  }
}

function applyPreferences() {
  const container = document.querySelector('.nuva-panel-container');
  const content = document.querySelector('.nuva-content');
  const themeToggle = document.getElementById('nuva-theme-toggle');
  
  if (container) {
    if (preferences.theme === 'dark') {
      container.classList.add('dark-mode');
      if (themeToggle) themeToggle.textContent = '☀️';
    } else {
      container.classList.remove('dark-mode');
      if (themeToggle) themeToggle.textContent = '🌙';
    }
  }
  
  if (content) {
    if (preferences.dyslexicMode) {
      content.classList.add('dyslexic-mode');
    } else {
      content.classList.remove('dyslexic-mode');
    }
  }
  
  document.documentElement.style.setProperty('--nuva-primary', preferences.primaryColor);
  document.documentElement.style.setProperty('--nuva-secondary', preferences.secondaryColor);
}

function savePreferences() {
  if (chrome && chrome.storage) {
    chrome.storage.local.set({ nuvaPreferences: preferences });
  }
}

function extractContent(source) {
  if (source === 'selection') {
    return window.getSelection().toString().trim() || '';
  }
  
  if (source === 'pdf') {
    return extractPDFContent() || '';
  }
  
  let mainContent = '';
  const article = document.querySelector('article');
  if (article) {
    mainContent = article.innerText;
  } else {
    const main = document.querySelector('main');
    if (main) {
      mainContent = main.innerText;
    } else {
      const paragraphs = document.querySelectorAll('p');
      paragraphs.forEach(p => {
        mainContent += p.innerText + '\n';
      });
    }
  }
  
  mainContent = mainContent.trim();
  return mainContent.length > 4000 ? mainContent.substring(0, 4000) : mainContent;
}

function extractPDFContent() {
  const textLayers = document.querySelectorAll('.textLayer');
  if (textLayers.length > 0) {
    let pdfText = '';
    textLayers.forEach(layer => {
      pdfText += layer.innerText + '\n';
    });
    return pdfText.trim();
  }
  
  const pdfViewers = [
    '#viewer .page',
    '.pdfViewer .page',
    '[data-page-number]',
    '.page',
    '#pageContainer'
  ];
  
  for (const selector of pdfViewers) {
    const pages = document.querySelectorAll(selector);
    if (pages.length > 0) {
      let pdfText = '';
      pages.forEach(page => {
        pdfText += page.innerText + '\n';
      });
      if (pdfText.trim()) return pdfText.trim();
    }
  }
  
  const iframes = document.querySelectorAll('iframe');
  for (const iframe of iframes) {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      const iframeText = iframeDoc.body.innerText;
      if (iframeText && iframeText.trim()) return iframeText.trim();
    } catch (e) {
      continue;
    }
  }
  
  return '';
}

async function analyzeContent(content, mode, intensity, userQuestion = null) {
  try {
    const prompts = {
      restructure: {
        low: `Restructure this text to improve readability. Use simple language and short sentences. Keep all the original information:\n\n${content}`,
        mid: `Restructure this text with better organization and flow. Break complex sentences into simpler ones. Maintain all original information but improve clarity:\n\n${content}`,
        high: `Completely restructure this text for optimal readability. Use clear headings, short paragraphs, and simple language. Transform complex ideas into accessible explanations while preserving all details:\n\n${content}`
      },
      simplify: {
        low: `Break down the main concepts in this text into simple explanations:\n\n${content}`,
        mid: `Provide a conceptual breakdown of this text. Explain key ideas in simple terms with examples where helpful:\n\n${content}`,
        high: `Create a comprehensive conceptual breakdown. Explain each major idea simply, use analogies, and provide clear examples:\n\n${content}`
      },
      organize: {
        low: `Organize this text with clear headings and better structure:\n\n${content}`,
        mid: `Reorganize this text with a logical hierarchy. Use headings, subheadings, and bullet points for clarity:\n\n${content}`,
        high: `Create a highly organized version of this text. Use multiple heading levels, bullet points, numbered lists, and clear sections for maximum visual clarity:\n\n${content}`
      },
      doubt: {
        low: `Based on this content, answer the following question in a clear and simple way:\n\nContent: ${content}\n\nQuestion: ${userQuestion}`,
        mid: `Based on this content, provide a detailed answer to the following question. Include relevant examples and explanations:\n\nContent: ${content}\n\nQuestion: ${userQuestion}`,
        high: `Based on this content, provide a comprehensive answer to the following question. Include detailed explanations, examples, and any relevant context:\n\nContent: ${content}\n\nQuestion: ${userQuestion}`
      }
    };
    
    const prompt = mode === 'doubt' ? prompts[mode][intensity] : prompts[mode][intensity];
    
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`API Error ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      return text.replace(/\n/g, '<br>');
    }
    
    return '<p style="color: #e74c3c;">Unable to process content. Please try again.</p>';
    
  } catch (error) {
    console.error('Error:', error);
    return `<p style="color: #e74c3c;">Error processing content: ${error.message}</p>`;
  }
}
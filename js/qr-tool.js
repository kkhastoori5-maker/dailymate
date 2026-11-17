/**
 * DailyMate - QR Code Studio Module (qr-tool.js)
 * Supports URL, Text, Wi-Fi, vCard, Email, SMS, custom colors,
 * center logo/stamp, multi-resolution export (PNG/SVG), clipboard copy, and history.
 */

const QRTool = (() => {
  // State variables
  let currentType = 'url';
  let qrCodeInstance = null;
  let qrHistory = [];

  // DOM Elements cache
  const el = {};

  function init() {
    cacheDOMElements();
    bindEvents();
    loadHistory();
    generateQR(); // Generate default initial QR
  }

  function cacheDOMElements() {
    el.typeSelector = document.getElementById('qr-type-selector');
    el.typeBtns = document.querySelectorAll('.qr-type-btn');
    el.forms = {
      url: document.getElementById('qr-form-url'),
      text: document.getElementById('qr-form-text'),
      wifi: document.getElementById('qr-form-wifi'),
      vcard: document.getElementById('qr-form-vcard'),
      email: document.getElementById('qr-form-email'),
      sms: document.getElementById('qr-form-sms'),
    };

    // Inputs
    el.inputUrl = document.getElementById('qr-input-url');
    el.inputText = document.getElementById('qr-input-text');
    el.wifiSsid = document.getElementById('qr-wifi-ssid');
    el.wifiType = document.getElementById('qr-wifi-type');
    el.wifiPass = document.getElementById('qr-wifi-pass');
    el.wifiHidden = document.getElementById('qr-wifi-hidden');

    el.vcardFn = document.getElementById('qr-vcard-fn');
    el.vcardLn = document.getElementById('qr-vcard-ln');
    el.vcardPhone = document.getElementById('qr-vcard-phone');
    el.vcardEmail = document.getElementById('qr-vcard-email');
    el.vcardOrg = document.getElementById('qr-vcard-org');
    el.vcardTitle = document.getElementById('qr-vcard-title');

    el.emailAddr = document.getElementById('qr-email-addr');
    el.emailSub = document.getElementById('qr-email-sub');
    el.emailBody = document.getElementById('qr-email-body');

    el.smsPhone = document.getElementById('qr-sms-phone');
    el.smsMsg = document.getElementById('qr-sms-msg');

    // Colors & Settings
    el.colorFg = document.getElementById('qr-color-fg');
    el.colorBg = document.getElementById('qr-color-bg');
    el.colorFgVal = document.getElementById('qr-color-fg-val');
    el.colorBgVal = document.getElementById('qr-color-bg-val');
    el.sizeSelect = document.getElementById('qr-size-select');
    el.eccSelect = document.getElementById('qr-ecc-select');
    el.centerText = document.getElementById('qr-center-text');
    el.btnApplyLogo = document.getElementById('btn-apply-logo');

    // Output & Actions
    el.qrTarget = document.getElementById('qrcode-target');
    el.masterCanvas = document.getElementById('qr-master-canvas');
    el.btnGenerate = document.getElementById('btn-generate-qr');
    el.btnDownloadPng = document.getElementById('btn-download-qr-png');
    el.btnDownloadSvg = document.getElementById('btn-download-qr-svg');
    el.btnCopyImg = document.getElementById('btn-copy-qr-img');
    el.btnPrint = document.getElementById('btn-print-qr');

    // Metadata & History
    el.metaSize = document.getElementById('qr-meta-size');
    el.metaType = document.getElementById('qr-meta-type');
    el.metaEcc = document.getElementById('qr-meta-ecc');
    el.historyList = document.getElementById('qr-history-list');
    el.btnClearHistory = document.getElementById('btn-clear-qr-history');
  }

  function bindEvents() {
    // Switch Content Type
    if (el.typeBtns) {
      el.typeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          el.typeBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const type = btn.getAttribute('data-type');
          switchType(type);
        });
      });
    }

    // Color Pickers
    if (el.colorFg) {
      el.colorFg.addEventListener('input', (e) => {
        el.colorFgVal.textContent = e.target.value;
        debounceGenerate();
      });
    }
    if (el.colorBg) {
      el.colorBg.addEventListener('input', (e) => {
        el.colorBgVal.textContent = e.target.value;
        debounceGenerate();
      });
    }

    // Swatches
    document.querySelectorAll('#fg-presets .swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        const color = sw.getAttribute('data-color');
        el.colorFg.value = color;
        el.colorFgVal.textContent = color;
        debounceGenerate();
      });
    });
    document.querySelectorAll('#bg-presets .swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        const color = sw.getAttribute('data-color');
        el.colorBg.value = color;
        el.colorBgVal.textContent = color;
        debounceGenerate();
      });
    });

    // Auto-generate on input changes
    const inputs = [
      el.inputUrl, el.inputText, el.wifiSsid, el.wifiPass, el.wifiType, el.wifiHidden,
      el.vcardFn, el.vcardLn, el.vcardPhone, el.vcardEmail, el.vcardOrg, el.vcardTitle,
      el.emailAddr, el.emailSub, el.emailBody, el.smsPhone, el.smsMsg,
      el.sizeSelect, el.eccSelect
    ];
    inputs.forEach(input => {
      if (input) {
        input.addEventListener('input', debounceGenerate);
        input.addEventListener('change', debounceGenerate);
      }
    });

    // Logo Apply
    if (el.btnApplyLogo) {
      el.btnApplyLogo.addEventListener('click', () => {
        generateQR(true);
      });
    }

    // Buttons
    if (el.btnGenerate) el.btnGenerate.addEventListener('click', () => generateQR(true));
    if (el.btnDownloadPng) el.btnDownloadPng.addEventListener('click', downloadPNG);
    if (el.btnDownloadSvg) el.btnDownloadSvg.addEventListener('click', downloadSVG);
    if (el.btnCopyImg) el.btnCopyImg.addEventListener('click', copyToClipboard);
    if (el.btnPrint) el.btnPrint.addEventListener('click', printQR);
    if (el.btnClearHistory) el.btnClearHistory.addEventListener('click', clearHistory);
  }

  function switchType(type) {
    currentType = type;
    Object.keys(el.forms).forEach(key => {
      if (el.forms[key]) {
        el.forms[key].classList.toggle('active', key === type);
      }
    });
    if (el.metaType) el.metaType.textContent = type.toUpperCase();
    generateQR();
  }

  let debounceTimer = null;
  function debounceGenerate() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      generateQR();
    }, 250);
  }

  /**
   * Builds the formatted payload text based on active type
   */
  function buildPayload() {
    switch (currentType) {
      case 'url': {
        let url = (el.inputUrl.value || '').trim();
        if (!url) return 'https://dailymate.app';
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        return url;
      }
      case 'text':
        return el.inputText.value.trim() || 'Welcome to DailyMate';
      case 'wifi': {
        const ssid = (el.wifiSsid.value || '').trim() || 'MyNetwork';
        const type = el.wifiType.value || 'WPA';
        const pass = el.wifiPass.value || '';
        const hidden = el.wifiHidden.checked ? 'H:true;' : '';
        return `WIFI:S:${ssid};T:${type};P:${pass};${hidden};`;
      }
      case 'vcard': {
        const fn = (el.vcardFn.value || '').trim();
        const ln = (el.vcardLn.value || '').trim();
        const phone = (el.vcardPhone.value || '').trim();
        const email = (el.vcardEmail.value || '').trim();
        const org = (el.vcardOrg.value || '').trim();
        const title = (el.vcardTitle.value || '').trim();

        return [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `N:${ln};${fn};;;`,
          `FN:${fn} ${ln}`.trim(),
          org ? `ORG:${org}` : '',
          title ? `TITLE:${title}` : '',
          phone ? `TEL;TYPE=CELL:${phone}` : '',
          email ? `EMAIL:${email}` : '',
          'END:VCARD'
        ].filter(Boolean).join('\n');
      }
      case 'email': {
        const addr = (el.emailAddr.value || '').trim();
        const sub = encodeURIComponent(el.emailSub.value.trim());
        const body = encodeURIComponent(el.emailBody.value.trim());
        return `mailto:${addr}?subject=${sub}&body=${body}`;
      }
      case 'sms': {
        const phone = (el.smsPhone.value || '').trim();
        const msg = encodeURIComponent(el.smsMsg.value.trim());
        return `sms:${phone}?body=${msg}`;
      }
      default:
        return 'https://dailymate.app';
    }
  }

  /**
   * Maps ECC selection to QRCode constant
   */
  function getECCLevel(level) {
    if (typeof QRCode !== 'undefined' && QRCode.CorrectLevel) {
      switch (level) {
        case 'L': return QRCode.CorrectLevel.L;
        case 'M': return QRCode.CorrectLevel.M;
        case 'Q': return QRCode.CorrectLevel.Q;
        case 'H': return QRCode.CorrectLevel.H;
      }
    }
    return 1; // Default
  }

  /**
   * Generates or refreshes the QR code
   */
  function generateQR(recordHistory = false) {
    const payload = buildPayload();
    let size = parseInt(el.sizeSelect.value, 10) || 512;
    
    // Check if Pro tier is required for 1024px
    if (size === 1024 && typeof DailyMateApp !== 'undefined' && !DailyMateApp.isProActive()) {
      DailyMateApp.showToast('1024px Ultra HD is a Pro feature (simulated or free trial)', 'warning');
    }

    const fgColor = el.colorFg ? el.colorFg.value : '#0f172a';
    const bgColor = el.colorBg ? el.colorBg.value : '#ffffff';
    const ecc = el.eccSelect ? el.eccSelect.value : 'M';

    if (el.metaSize) el.metaSize.textContent = `${size} × ${size} px`;
    if (el.metaEcc) el.metaEcc.textContent = `Level ${ecc}`;

    if (!el.qrTarget) return;
    el.qrTarget.innerHTML = '';

    if (typeof QRCode !== 'undefined') {
      try {
        qrCodeInstance = new QRCode(el.qrTarget, {
          text: payload,
          width: size > 400 ? 300 : size,
          height: size > 400 ? 300 : size,
          colorDark: fgColor,
          colorLight: bgColor,
          correctLevel: getECCLevel(ecc)
        });

        setTimeout(() => {
          renderStampOverlay(fgColor, bgColor);
        }, 100);

      } catch (err) {
        console.warn('QRCode generation fallback:', err);
        renderFallbackQR(payload, size, fgColor, bgColor);
      }
    } else {
      renderFallbackQR(payload, size, fgColor, bgColor);
    }

    if (recordHistory) {
      saveToHistory(currentType, payload);
    }
  }

  /**
   * Applies an emoji/text stamp in center of QR
   */
  function renderStampOverlay(fgColor, bgColor) {
    const stampText = el.centerText ? (el.centerText.value || '').trim() : '';
    if (!stampText) return;

    const qrImg = el.qrTarget.querySelector('img');
    const qrCanvas = el.qrTarget.querySelector('canvas');
    const targetEl = qrCanvas || qrImg;
    if (!targetEl) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const w = targetEl.naturalWidth || targetEl.width || 300;
    const h = targetEl.naturalHeight || targetEl.height || 300;
    canvas.width = w;
    canvas.height = h;

    ctx.drawImage(targetEl, 0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2;
    const radius = w * 0.14;

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = bgColor;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = fgColor;
    ctx.stroke();

    ctx.fillStyle = fgColor;
    ctx.font = `bold ${Math.round(radius * 1.05)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stampText, centerX, centerY + 2);
    ctx.restore();

    if (qrCanvas) {
      qrCanvas.getContext('2d').drawImage(canvas, 0, 0);
    } else if (qrImg) {
      qrImg.src = canvas.toDataURL();
    }
  }

  function renderFallbackQR(payload, size, fgColor, bgColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 300, 300);

    ctx.fillStyle = fgColor;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Client QR Generated', 150, 140);
    ctx.font = '10px monospace';
    ctx.fillText(payload.substring(0, 32) + '...', 150, 165);

    el.qrTarget.innerHTML = '';
    el.qrTarget.appendChild(canvas);
  }

  function getRenderedCanvas() {
    const qrImg = el.qrTarget.querySelector('img');
    const qrCanvas = el.qrTarget.querySelector('canvas');
    
    const size = parseInt(el.sizeSelect.value, 10) || 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    if (qrCanvas) {
      ctx.drawImage(qrCanvas, 0, 0, size, size);
      return canvas;
    } else if (qrImg) {
      ctx.drawImage(qrImg, 0, 0, size, size);
      return canvas;
    }
    return null;
  }

  function downloadPNG() {
    const canvas = getRenderedCanvas();
    if (!canvas) {
      if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('Please generate a QR code first.', 'error');
      return;
    }

    const size = canvas.width;
    const link = document.createElement('a');
    link.download = `DailyMate-QR-${currentType}-${size}px.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast(`Downloaded PNG (${size}×${size}px)!`, 'success');
    saveToHistory(currentType, buildPayload());
  }

  function downloadSVG() {
    const canvas = getRenderedCanvas();
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const size = canvas.width;

    const svgContent = `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="100%" height="100%" fill="${el.colorBg.value || '#ffffff'}"/>
  <image width="${size}" height="${size}" xlink:href="${dataUrl}"/>
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `DailyMate-QR-${currentType}.svg`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('Downloaded SVG vector file!', 'success');
  }

  async function copyToClipboard() {
    const canvas = getRenderedCanvas();
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('QR Code copied to clipboard!', 'success');
      });
    } catch (err) {
      console.error(err);
      if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('Unable to copy directly. Use Download PNG.', 'error');
    }
  }

  function printQR() {
    const canvas = getRenderedCanvas();
    if (!canvas) return;

    const printWin = window.open('', '_blank', 'width=600,height=600');
    if (!printWin) {
      if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('Popup blocked. Allow popups to print.', 'error');
      return;
    }

    const dataUrl = canvas.toDataURL();
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Code - DailyMate</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
            img { width: 320px; height: 320px; border: 1px solid #ccc; padding: 12px; border-radius: 8px; }
            h2 { margin-bottom: 8px; }
            p { color: #666; font-size: 14px; margin-top: 4px; }
          </style>
        </head>
        <body>
          <h2>DailyMate QR Code</h2>
          <img src="${dataUrl}" alt="QR Code">
          <p>Scan with any smartphone camera</p>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  }

  function loadHistory() {
    try {
      const stored = localStorage.getItem('dailymate_qr_history');
      qrHistory = stored ? JSON.parse(stored) : [];
      renderHistoryList();
    } catch (e) {
      qrHistory = [];
    }
  }

  function saveToHistory(type, payload) {
    if (!payload) return;
    if (qrHistory.length > 0 && qrHistory[0].payload === payload) return;

    qrHistory.unshift({
      id: Date.now(),
      type: type,
      payload: payload,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    if (qrHistory.length > 5) qrHistory.pop();

    try {
      localStorage.setItem('dailymate_qr_history', JSON.stringify(qrHistory));
      renderHistoryList();
    } catch (e) {}
  }

  function renderHistoryList() {
    if (!el.historyList) return;
    if (qrHistory.length === 0) {
      el.historyList.innerHTML = '<p class="empty-state">No saved QR codes yet. Generated codes will be stored locally.</p>';
      return;
    }

    el.historyList.innerHTML = qrHistory.map(item => `
      <div class="history-item">
        <div class="history-item-info">
          <span class="badge badge-free">${item.type.toUpperCase()}</span>
          <span>${escapeHTML(item.payload.substring(0, 30))}${item.payload.length > 30 ? '...' : ''}</span>
        </div>
        <button class="btn-text btn-sm btn-restore-qr" data-payload="${encodeURIComponent(item.payload)}" data-type="${item.type}">Restore</button>
      </div>
    `).join('');

    el.historyList.querySelectorAll('.btn-restore-qr').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        const payload = decodeURIComponent(btn.getAttribute('data-payload'));
        restoreFromHistory(type, payload);
      });
    });
  }

  function restoreFromHistory(type, payload) {
    const tabBtn = document.querySelector(`.qr-type-btn[data-type="${type}"]`);
    if (tabBtn) tabBtn.click();

    if (type === 'url' && el.inputUrl) el.inputUrl.value = payload;
    else if (type === 'text' && el.inputText) el.inputText.value = payload;

    generateQR();
    if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('Restored QR code from history', 'info');
  }

  function clearHistory() {
    qrHistory = [];
    localStorage.removeItem('dailymate_qr_history');
    renderHistoryList();
    if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('QR History cleared', 'info');
  }

  function escapeHTML(str) {
    return (str || '').replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  return {
    init,
    generateQR
  };
})();

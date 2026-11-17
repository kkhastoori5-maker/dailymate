/**
 * DailyMate - Image & PDF Studio Module (image-pdf-tool.js)
 * High-performance client-side image resizing, compression, photographic filters,
 * multi-image PDF generation and note-to-PDF maker.
 */

const ImagePDFTool = (() => {
  // State: Resizer & Compressor
  let currentResizerImage = null;
  let resizerOriginalFile = null;
  let isAspectRatioLocked = true;
  let originalAspectRatio = 1;

  // State: Filters
  let currentFilterImage = null;
  let filterOriginalFile = null;
  let filterRotation = 0; // 0, 90, 180, 270
  let filterFlipH = false;
  let filterFlipV = false;

  // State: PDF Maker
  let pdfQueue = []; // array of { file, dataUrl, name, size }

  // DOM Elements cache
  const el = {};

  function init() {
    cacheDOMElements();
    bindEvents();
    initSubTabs();
    initNoteDates();
  }

  function cacheDOMElements() {
    // Sub-tabs
    el.subTabBtns = document.querySelectorAll('.sub-nav-tabs .sub-tab-btn');
    el.subTabContents = document.querySelectorAll('.subtab-content');

    // Resizer elements
    el.resizerDropzone = document.getElementById('img-dropzone');
    el.resizerFileInput = document.getElementById('img-file-input');
    el.resizerEditorArea = document.getElementById('img-editor-area');
    el.btnChangeImage = document.getElementById('btn-change-image');

    el.imgWidthInput = document.getElementById('img-width-input');
    el.imgHeightInput = document.getElementById('img-height-input');
    el.btnAspectLock = document.getElementById('btn-aspect-lock');
    el.imgFormatSelect = document.getElementById('img-format-select');
    el.imgQualitySlider = document.getElementById('img-quality-slider');
    el.imgQualityVal = document.getElementById('img-quality-val');
    el.qualitySliderGroup = document.getElementById('quality-slider-group');

    el.sizeOriginal = document.getElementById('size-original');
    el.sizeOutput = document.getElementById('size-output');
    el.sizeSavingsBadge = document.getElementById('size-savings-badge');
    el.previewDimBadge = document.getElementById('preview-dim-badge');
    el.imgPreviewTarget = document.getElementById('img-preview-target');
    el.btnDownloadProcessed = document.getElementById('btn-download-processed-img');

    // Filter elements
    el.filterDropzone = document.getElementById('filter-dropzone');
    el.filterFileInput = document.getElementById('filter-file-input');
    el.filterEditorArea = document.getElementById('filter-editor-area');
    el.btnChangeFilterImg = document.getElementById('btn-change-filter-img');
    el.btnResetFilters = document.getElementById('btn-reset-filters');
    el.filterPreviewImg = document.getElementById('filter-preview-img');
    el.filterCanvasHidden = document.getElementById('filter-canvas-hidden');
    el.btnDownloadFiltered = document.getElementById('btn-download-filtered-img');

    // Filter sliders
    el.sliderBrightness = document.getElementById('slider-brightness');
    el.sliderContrast = document.getElementById('slider-contrast');
    el.sliderSaturation = document.getElementById('slider-saturation');
    el.sliderSepia = document.getElementById('slider-sepia');
    el.sliderBlur = document.getElementById('slider-blur');

    el.valBrightness = document.getElementById('val-brightness');
    el.valContrast = document.getElementById('val-contrast');
    el.valSaturation = document.getElementById('val-saturation');
    el.valSepia = document.getElementById('val-sepia');
    el.valBlur = document.getElementById('val-blur');

    // PDF Maker elements
    el.pdfDropzone = document.getElementById('pdf-dropzone');
    el.pdfFileInput = document.getElementById('pdf-file-input');
    el.pdfPagesList = document.getElementById('pdf-pages-list');
    el.btnClearPdfQueue = document.getElementById('btn-clear-pdf-queue');
    el.pdfPageCount = document.getElementById('pdf-page-count');
    el.pdfPageSize = document.getElementById('pdf-page-size');
    el.pdfOrientation = document.getElementById('pdf-orientation');
    el.pdfMargin = document.getElementById('pdf-margin');
    el.pdfFilename = document.getElementById('pdf-filename');
    el.btnBuildPdf = document.getElementById('btn-build-pdf');

    // Note to PDF elements
    el.noteTitle = document.getElementById('note-title');
    el.noteAuthor = document.getElementById('note-author');
    el.noteDate = document.getElementById('note-date');
    el.noteBody = document.getElementById('note-body');
    el.previewNoteTitle = document.getElementById('preview-note-title');
    el.previewNoteAuthor = document.getElementById('preview-note-author');
    el.previewNoteDate = document.getElementById('preview-note-date');
    el.previewNoteBody = document.getElementById('preview-note-body');
    el.btnDownloadNotePdf = document.getElementById('btn-download-note-pdf');
    el.btnPrintNote = document.getElementById('btn-print-note');
    el.btnTplInvoice = document.getElementById('btn-tpl-invoice');
    el.btnTplMeeting = document.getElementById('btn-tpl-meeting');
    el.btnTplBlank = document.getElementById('btn-tpl-blank');
  }

  function initSubTabs() {
    if (el.subTabBtns) {
      el.subTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-subtab');
          switchSubTab(target);
        });
      });
    }
  }

  function switchSubTab(targetSubTab) {
    if (el.subTabBtns) {
      el.subTabBtns.forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-subtab') === targetSubTab);
      });
    }
    if (el.subTabContents) {
      el.subTabContents.forEach(c => {
        c.classList.toggle('active', c.id === `subtab-${targetSubTab}`);
      });
    }
  }

  function bindEvents() {
    setupDropzone(el.resizerDropzone, el.resizerFileInput, handleResizerFile);

    if (el.btnChangeImage) {
      el.btnChangeImage.addEventListener('click', () => {
        el.resizerFileInput.click();
      });
    }

    if (el.btnAspectLock) {
      el.btnAspectLock.addEventListener('click', () => {
        isAspectRatioLocked = !isAspectRatioLocked;
        el.btnAspectLock.classList.toggle('active', isAspectRatioLocked);
        if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast(isAspectRatioLocked ? 'Aspect ratio locked' : 'Aspect ratio unlocked', 'info');
      });
    }

    if (el.imgWidthInput) {
      el.imgWidthInput.addEventListener('input', () => {
        if (!currentResizerImage) return;
        const w = parseInt(el.imgWidthInput.value, 10);
        if (isAspectRatioLocked && w && originalAspectRatio) {
          el.imgHeightInput.value = Math.round(w / originalAspectRatio);
        }
        updateResizerEstimates();
      });
    }

    if (el.imgHeightInput) {
      el.imgHeightInput.addEventListener('input', () => {
        if (!currentResizerImage) return;
        const h = parseInt(el.imgHeightInput.value, 10);
        if (isAspectRatioLocked && h && originalAspectRatio) {
          el.imgWidthInput.value = Math.round(h * originalAspectRatio);
        }
        updateResizerEstimates();
      });
    }

    document.querySelectorAll('.dimension-presets .btn-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!currentResizerImage) return;
        document.querySelectorAll('.dimension-presets .btn-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const scale = parseFloat(btn.getAttribute('data-scale'));
        el.imgWidthInput.value = Math.round(currentResizerImage.naturalWidth * scale);
        el.imgHeightInput.value = Math.round(currentResizerImage.naturalHeight * scale);
        updateResizerEstimates();
      });
    });

    if (el.imgFormatSelect) {
      el.imgFormatSelect.addEventListener('change', () => {
        const isPng = el.imgFormatSelect.value === 'image/png';
        if (el.qualitySliderGroup) {
          el.qualitySliderGroup.style.opacity = isPng ? '0.4' : '1';
          el.qualitySliderGroup.style.pointerEvents = isPng ? 'none' : 'auto';
        }
        updateResizerEstimates();
      });
    }

    if (el.imgQualitySlider) {
      el.imgQualitySlider.addEventListener('input', (e) => {
        el.imgQualityVal.textContent = `${e.target.value}%`;
        updateResizerEstimates();
      });
    }

    if (el.btnDownloadProcessed) {
      el.btnDownloadProcessed.addEventListener('click', downloadProcessedImage);
    }

    setupDropzone(el.filterDropzone, el.filterFileInput, handleFilterFile);

    if (el.btnChangeFilterImg) {
      el.btnChangeFilterImg.addEventListener('click', () => el.filterFileInput.click());
    }

    const btnRotL = document.getElementById('btn-rot-left');
    const btnRotR = document.getElementById('btn-rot-right');
    const btnFlipH = document.getElementById('btn-flip-h');
    const btnFlipV = document.getElementById('btn-flip-v');

    if (btnRotL) btnRotL.addEventListener('click', () => { filterRotation = (filterRotation - 90 + 360) % 360; applyFilters(); });
    if (btnRotR) btnRotR.addEventListener('click', () => { filterRotation = (filterRotation + 90) % 360; applyFilters(); });
    if (btnFlipH) btnFlipH.addEventListener('click', () => { filterFlipH = !filterFlipH; applyFilters(); });
    if (btnFlipV) btnFlipV.addEventListener('click', () => { filterFlipV = !filterFlipV; applyFilters(); });

    const filterSliders = [
      { input: el.sliderBrightness, valEl: el.valBrightness, unit: '%' },
      { input: el.sliderContrast, valEl: el.valContrast, unit: '%' },
      { input: el.sliderSaturation, valEl: el.valSaturation, unit: '%' },
      { input: el.sliderSepia, valEl: el.valSepia, unit: '%' },
      { input: el.sliderBlur, valEl: el.valBlur, unit: ' px' }
    ];

    filterSliders.forEach(s => {
      if (s.input) {
        s.input.addEventListener('input', (e) => {
          s.valEl.textContent = `${e.target.value}${s.unit}`;
          applyFilters();
        });
      }
    });

    document.querySelectorAll('.filter-presets-grid .preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        applyPresetFilter(btn.getAttribute('data-preset'));
      });
    });

    if (el.btnResetFilters) {
      el.btnResetFilters.addEventListener('click', resetFilters);
    }

    if (el.btnDownloadFiltered) {
      el.btnDownloadFiltered.addEventListener('click', downloadFilteredImage);
    }

    setupDropzone(el.pdfDropzone, el.pdfFileInput, handlePdfFiles);

    if (el.btnClearPdfQueue) {
      el.btnClearPdfQueue.addEventListener('click', clearPdfQueue);
    }

    if (el.btnBuildPdf) {
      el.btnBuildPdf.addEventListener('click', generateImagesPdf);
    }

    const noteInputs = [el.noteTitle, el.noteAuthor, el.noteDate, el.noteBody];
    noteInputs.forEach(input => {
      if (input) input.addEventListener('input', updateNotePreview);
    });

    if (el.btnDownloadNotePdf) el.btnDownloadNotePdf.addEventListener('click', generateNotePdf);
    if (el.btnPrintNote) el.btnPrintNote.addEventListener('click', printNoteDocument);

    if (el.btnTplInvoice) el.btnTplInvoice.addEventListener('click', applyInvoiceTemplate);
    if (el.btnTplMeeting) el.btnTplMeeting.addEventListener('click', applyMeetingTemplate);
    if (el.btnTplBlank) el.btnTplBlank.addEventListener('click', applyBlankTemplate);
  }

  function setupDropzone(dropzoneEl, fileInputEl, handler) {
    if (!dropzoneEl || !fileInputEl) return;

    dropzoneEl.addEventListener('click', () => fileInputEl.click());

    dropzoneEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzoneEl.classList.add('dragover');
    });

    dropzoneEl.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzoneEl.classList.remove('dragover');
    });

    dropzoneEl.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzoneEl.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handler(e.dataTransfer.files);
      }
    });

    fileInputEl.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handler(e.target.files);
      }
    });
  }

  function handleResizerFile(files) {
    const file = files[0];
    if (!file || !file.type.startsWith('image/')) {
      if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('Please select a valid image file (PNG, JPG, WebP).', 'error');
      return;
    }

    resizerOriginalFile = file;
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        currentResizerImage = img;
        originalAspectRatio = img.naturalWidth / img.naturalHeight;

        el.imgWidthInput.value = img.naturalWidth;
        el.imgHeightInput.value = img.naturalHeight;
        el.sizeOriginal.textContent = formatBytes(file.size);
        el.previewDimBadge.textContent = `${img.naturalWidth} × ${img.naturalHeight} px`;
        el.imgPreviewTarget.src = e.target.result;

        el.resizerDropzone.classList.add('hidden');
        el.resizerEditorArea.classList.remove('hidden');

        updateResizerEstimates();
        if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast(`Loaded ${file.name}`, 'success');
      };
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }

  function updateResizerEstimates() {
    if (!currentResizerImage || !resizerOriginalFile) return;

    const w = parseInt(el.imgWidthInput.value, 10) || currentResizerImage.naturalWidth;
    const h = parseInt(el.imgHeightInput.value, 10) || currentResizerImage.naturalHeight;
    const format = el.imgFormatSelect.value;
    const quality = parseInt(el.imgQualitySlider.value, 10) / 100;

    el.previewDimBadge.textContent = `${w} × ${h} px`;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(currentResizerImage, 0, 0, w, h);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const newSize = blob.size;
      el.sizeOutput.textContent = formatBytes(newSize);

      const diff = resizerOriginalFile.size - newSize;
      const pctSaved = Math.round((diff / resizerOriginalFile.size) * 100);

      if (pctSaved > 0) {
        el.sizeSavingsBadge.textContent = `-${pctSaved}% Saved`;
        el.sizeSavingsBadge.className = 'size-badge badge-success';
      } else {
        el.sizeSavingsBadge.textContent = `+${Math.abs(pctSaved)}% Larger`;
        el.sizeSavingsBadge.className = 'size-badge badge-danger';
      }
    }, format, quality);
  }

  function downloadProcessedImage() {
    if (!currentResizerImage) return;

    const w = parseInt(el.imgWidthInput.value, 10) || currentResizerImage.naturalWidth;
    const h = parseInt(el.imgHeightInput.value, 10) || currentResizerImage.naturalHeight;
    const format = el.imgFormatSelect.value;
    const quality = parseInt(el.imgQualitySlider.value, 10) / 100;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(currentResizerImage, 0, 0, w, h);

    const extMap = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
    const ext = extMap[format] || 'jpg';
    const baseName = resizerOriginalFile.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}-optimized-${w}x${h}.${ext}`;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast(`Downloaded ${filename}!`, 'success');
    }, format, quality);
  }

  function handleFilterFile(files) {
    const file = files[0];
    if (!file || !file.type.startsWith('image/')) {
      if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('Please select a valid image file.', 'error');
      return;
    }

    filterOriginalFile = file;
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        currentFilterImage = img;
        el.filterDropzone.classList.add('hidden');
        el.filterEditorArea.classList.remove('hidden');
        resetFilters();
        if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('Ready for photo editing', 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function applyPresetFilter(preset) {
    resetFilterSliders();
    switch (preset) {
      case 'vintage':
        el.sliderSepia.value = 65;
        el.sliderContrast.value = 115;
        el.sliderBrightness.value = 95;
        break;
      case 'noir':
        el.sliderSaturation.value = 0;
        el.sliderContrast.value = 140;
        break;
      case 'vibrant':
        el.sliderSaturation.value = 160;
        el.sliderContrast.value = 110;
        break;
      case 'warm':
        el.sliderSepia.value = 35;
        el.sliderBrightness.value = 105;
        break;
      case 'cool':
        el.sliderSaturation.value = 90;
        el.sliderContrast.value = 105;
        break;
      case 'dramatic':
        el.sliderContrast.value = 160;
        el.sliderBrightness.value = 90;
        break;
    }
    syncSliderLabels();
    applyFilters();
  }

  function resetFilterSliders() {
    el.sliderBrightness.value = 100;
    el.sliderContrast.value = 100;
    el.sliderSaturation.value = 100;
    el.sliderSepia.value = 0;
    el.sliderBlur.value = 0;
  }

  function syncSliderLabels() {
    el.valBrightness.textContent = `${el.sliderBrightness.value}%`;
    el.valContrast.textContent = `${el.sliderContrast.value}%`;
    el.valSaturation.textContent = `${el.sliderSaturation.value}%`;
    el.valSepia.textContent = `${el.sliderSepia.value}%`;
    el.valBlur.textContent = `${el.sliderBlur.value} px`;
  }

  function resetFilters() {
    filterRotation = 0;
    filterFlipH = false;
    filterFlipV = false;
    resetFilterSliders();
    syncSliderLabels();
    applyFilters();
  }

  function applyFilters() {
    if (!currentFilterImage) return;

    const b = el.sliderBrightness.value;
    const c = el.sliderContrast.value;
    const s = el.sliderSaturation.value;
    const sep = el.sliderSepia.value;
    const blr = el.sliderBlur.value;

    const filterString = `brightness(${b}%) contrast(${c}%) saturate(${s}%) sepia(${sep}%) blur(${blr}px)`;
    const transformString = `rotate(${filterRotation}deg) scale(${filterFlipH ? -1 : 1}, ${filterFlipV ? -1 : 1})`;

    el.filterPreviewImg.style.filter = filterString;
    el.filterPreviewImg.style.transform = transformString;
    el.filterPreviewImg.src = currentFilterImage.src;
  }

  function downloadFilteredImage() {
    if (!currentFilterImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const isRotated90 = filterRotation === 90 || filterRotation === 270;
    const w = isRotated90 ? currentFilterImage.naturalHeight : currentFilterImage.naturalWidth;
    const h = isRotated90 ? currentFilterImage.naturalWidth : currentFilterImage.naturalHeight;

    canvas.width = w;
    canvas.height = h;

    const b = el.sliderBrightness.value;
    const c = el.sliderContrast.value;
    const s = el.sliderSaturation.value;
    const sep = el.sliderSepia.value;
    const blr = el.sliderBlur.value;

    ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%) sepia(${sep}%) blur(${blr}px)`;

    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate((filterRotation * Math.PI) / 180);
    ctx.scale(filterFlipH ? -1 : 1, filterFlipV ? -1 : 1);
    ctx.drawImage(
      currentFilterImage,
      -currentFilterImage.naturalWidth / 2,
      -currentFilterImage.naturalHeight / 2
    );
    ctx.restore();

    const a = document.createElement('a');
    a.download = `DailyMate-Filtered-${Date.now()}.jpg`;
    a.href = canvas.toDataURL('image/jpeg', 0.92);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('Downloaded transformed image!', 'success');
  }

  function handlePdfFiles(files) {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('No valid images detected.', 'error');
      return;
    }

    let loadedCount = 0;
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        pdfQueue.push({
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          dataUrl: e.target.result
        });
        loadedCount++;
        if (loadedCount === validFiles.length) {
          renderPdfQueue();
          if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast(`Added ${loadedCount} page(s) to PDF queue.`, 'success');
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function renderPdfQueue() {
    if (!el.pdfPagesList) return;

    if (pdfQueue.length === 0) {
      el.pdfPagesList.innerHTML = '<p class="empty-state">No images added yet. Add one or more images to generate a multi-page PDF.</p>';
      el.btnClearPdfQueue.classList.add('hidden');
      el.btnBuildPdf.disabled = true;
      el.pdfPageCount.textContent = '0 Pages';
      return;
    }

    el.btnClearPdfQueue.classList.remove('hidden');
    el.btnBuildPdf.disabled = false;
    el.pdfPageCount.textContent = `${pdfQueue.length} ${pdfQueue.length === 1 ? 'Page' : 'Pages'}`;

    el.pdfPagesList.innerHTML = pdfQueue.map((item, index) => `
      <div class="pdf-page-row" data-id="${item.id}">
        <img src="${item.dataUrl}" alt="Page ${index + 1}" class="pdf-page-thumb">
        <div class="pdf-page-info">
          <div class="pdf-page-name">Page ${index + 1}: ${escapeHTML(item.name)}</div>
          <div class="pdf-page-meta">${formatBytes(item.size)}</div>
        </div>
        <div class="pdf-page-actions">
          ${index > 0 ? `<button class="btn-icon btn-sm btn-pdf-move-up" data-index="${index}" title="Move Up"><i data-lucide="chevron-up"></i></button>` : ''}
          ${index < pdfQueue.length - 1 ? `<button class="btn-icon btn-sm btn-pdf-move-down" data-index="${index}" title="Move Down"><i data-lucide="chevron-down"></i></button>` : ''}
          <button class="btn-icon btn-sm text-danger btn-pdf-remove" data-index="${index}" title="Remove"><i data-lucide="trash-2"></i></button>
        </div>
      </div>
    `).join('');

    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }

    el.pdfPagesList.querySelectorAll('.btn-pdf-remove').forEach(b => {
      b.addEventListener('click', () => {
        const idx = parseInt(b.getAttribute('data-index'), 10);
        pdfQueue.splice(idx, 1);
        renderPdfQueue();
      });
    });

    el.pdfPagesList.querySelectorAll('.btn-pdf-move-up').forEach(b => {
      b.addEventListener('click', () => {
        const idx = parseInt(b.getAttribute('data-index'), 10);
        if (idx > 0) {
          const temp = pdfQueue[idx];
          pdfQueue[idx] = pdfQueue[idx - 1];
          pdfQueue[idx - 1] = temp;
          renderPdfQueue();
        }
      });
    });

    el.pdfPagesList.querySelectorAll('.btn-pdf-move-down').forEach(b => {
      b.addEventListener('click', () => {
        const idx = parseInt(b.getAttribute('data-index'), 10);
        if (idx < pdfQueue.length - 1) {
          const temp = pdfQueue[idx];
          pdfQueue[idx] = pdfQueue[idx + 1];
          pdfQueue[idx + 1] = temp;
          renderPdfQueue();
        }
      });
    });
  }

  function clearPdfQueue() {
    pdfQueue = [];
    renderPdfQueue();
    if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('Cleared PDF queue', 'info');
  }

  async function generateImagesPdf() {
    if (pdfQueue.length === 0) return;

    if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('Generating PDF document...', 'info');

    const pageSize = el.pdfPageSize.value || 'a4';
    const orientation = el.pdfOrientation.value || 'p';
    const margin = parseInt(el.pdfMargin.value, 10) || 0;
    const filename = (el.pdfFilename.value || 'DailyMate-Document').trim() + '.pdf';

    const { jsPDF } = window.jspdf || {};

    if (!jsPDF) {
      printImagesAsPdfFallback();
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: pageSize
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const printableWidth = pageWidth - (margin * 2);
      const printableHeight = pageHeight - (margin * 2);

      for (let i = 0; i < pdfQueue.length; i++) {
        if (i > 0) doc.addPage(pageSize, orientation);

        const item = pdfQueue[i];
        const imgObj = await loadImagePromise(item.dataUrl);

        const imgRatio = imgObj.width / imgObj.height;
        let targetW = printableWidth;
        let targetH = targetW / imgRatio;

        if (targetH > printableHeight) {
          targetH = printableHeight;
          targetW = targetH * imgRatio;
        }

        const posX = margin + (printableWidth - targetW) / 2;
        const posY = margin + (printableHeight - targetH) / 2;

        doc.addImage(item.dataUrl, 'JPEG', posX, posY, targetW, targetH, undefined, 'FAST');
      }

      doc.save(filename);
      if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast(`Successfully created ${filename}!`, 'success');

    } catch (err) {
      console.error('jsPDF error:', err);
      printImagesAsPdfFallback();
    }
  }

  function loadImagePromise(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = src;
    });
  }

  function printImagesAsPdfFallback() {
    const printWin = window.open('', '_blank');
    if (!printWin) {
      if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('Please allow popups to export PDF.', 'error');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Export PDF - DailyMate</title>
          <style>
            @page { size: auto; margin: 10mm; }
            body { margin: 0; padding: 0; font-family: sans-serif; }
            .pdf-page { page-break-after: always; display: flex; align-items: center; justify-content: center; height: 95vh; }
            img { max-width: 100%; max-height: 100%; object-fit: contain; }
          </style>
        </head>
        <body>
          ${pdfQueue.map(item => `<div class="pdf-page"><img src="${item.dataUrl}"></div>`).join('')}
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    printWin.document.write(htmlContent);
    printWin.document.close();
  }

  function initNoteDates() {
    if (el.noteDate) {
      const today = new Date().toISOString().split('T')[0];
      el.noteDate.value = today;
      updateNotePreview();
    }
  }

  function updateNotePreview() {
    if (el.previewNoteTitle) el.previewNoteTitle.textContent = el.noteTitle.value || 'Untitled Document';
    if (el.previewNoteAuthor) el.previewNoteAuthor.textContent = el.noteAuthor.value || 'DailyMate';
    if (el.previewNoteDate) el.previewNoteDate.textContent = el.noteDate.value || 'Today';
    if (el.previewNoteBody) el.previewNoteBody.textContent = el.noteBody.value || '';
  }

  function applyInvoiceTemplate() {
    el.noteTitle.value = 'INVOICE #DM-2026-081';
    el.noteAuthor.value = 'DailyMate Design & Consulting';
    el.noteBody.value = `BILLED TO:
Client: Acme Digital Labs
Email: accounting@acmelabs.io

SERVICES RENDERED:
1. Website Engineering & Mobile Responsive Design ........ $1,200.00
2. Privacy & Client-side Tools Integration ................. $600.00
3. SEO & Speed Optimization Audit .......................... $350.00

TOTAL DUE: $2,150.00
Payment Terms: Net 15 Days
Thank you for your business!`;
    updateNotePreview();
  }

  function applyMeetingTemplate() {
    el.noteTitle.value = 'Executive Sync & Product Roadmap';
    el.noteAuthor.value = 'Product Strategy Group';
    el.noteBody.value = `ATTENDEES:
- Engineering Lead
- Product Manager
- UI/UX Designer

AGENDA:
1. Q4 Feature Rollout:
   - High-performance QR generation suite
   - Multi-format client-side image compression
   - Personal budget planner with CSV portability

2. ACTION ITEMS:
   - Finalize unit tests for EMI and health calculators.
   - Deploy dark mode custom tokens.
   - Verify zero-server-upload privacy guarantee.`;
    updateNotePreview();
  }

  function applyBlankTemplate() {
    el.noteTitle.value = '';
    el.noteBody.value = '';
    updateNotePreview();
  }

  function generateNotePdf() {
    const { jsPDF } = window.jspdf || {};
    const title = el.noteTitle.value.trim() || 'DailyMate Note';
    const author = el.noteAuthor.value.trim() || 'DailyMate';
    const date = el.noteDate.value || new Date().toLocaleDateString();
    const body = el.noteBody.value || '';

    if (!jsPDF) {
      printNoteDocument();
      return;
    }

    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(title, 20, 25);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`By: ${author}   |   Date: ${date}`, 20, 33);

      doc.setDrawColor(200);
      doc.line(20, 36, 190, 36);

      doc.setFontSize(11);
      doc.setTextColor(30);
      const splitLines = doc.splitTextToSize(body, 170);
      doc.text(splitLines, 20, 46);

      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('Generated via DailyMate Utility Suite • 100% Client-Side Privacy', 20, 285);

      doc.save(`${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`);
      if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('Note exported as PDF!', 'success');
    } catch (e) {
      printNoteDocument();
    }
  }

  function printNoteDocument() {
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${escapeHTML(el.noteTitle.value || 'Document')}</title>
          <style>
            body { font-family: sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; line-height: 1.6; }
            h1 { font-size: 24px; margin-bottom: 4px; }
            .meta { color: #666; font-size: 13px; margin-bottom: 16px; border-bottom: 2px solid #ddd; padding-bottom: 8px; }
            pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>${escapeHTML(el.noteTitle.value || 'Untitled')}</h1>
          <div class="meta">${escapeHTML(el.noteAuthor.value || '')} • ${escapeHTML(el.noteDate.value || '')}</div>
          <pre>${escapeHTML(el.noteBody.value || '')}</pre>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWin.document.close();
  }

  function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  function escapeHTML(str) {
    return (str || '').replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  return {
    init,
    switchSubTab
  };
})();

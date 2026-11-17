/**
 * DailyMate - Core Application Controller (app.js)
 * Handles View Routing, Theme Switching (Dark/Light), Free vs Pro Tier State,
 * Search Command Palette (Ctrl+K), Mobile Navigation, and Toast Hub.
 */

const DailyMateApp = (() => {
  let currentTheme = 'light';
  let isPro = false;
  let currentActiveView = 'home';

  const TOOL_CATALOG = [
    { id: 'qr', title: 'QR Code Studio', cat: 'QR Studio', view: 'qr', keywords: 'qr code wifi link url vcard barcode vcard scan contact' },
    { id: 'img-resizer', title: 'Image Resizer & Compressor', cat: 'Image & PDF', view: 'image-pdf', subtab: 'resizer', keywords: 'resize compress optimize shrink photo jpg png webp' },
    { id: 'img-filters', title: 'Image Filters & Transform', cat: 'Image & PDF', view: 'image-pdf', subtab: 'filters', keywords: 'filter rotate flip vintage noir sepia contrast blur' },
    { id: 'img-pdf', title: 'Images to PDF Maker', cat: 'Image & PDF', view: 'image-pdf', subtab: 'img-to-pdf', keywords: 'images to pdf convert photo document merge pictures' },
    { id: 'note-pdf', title: 'Text Note to PDF', cat: 'Image & PDF', view: 'image-pdf', subtab: 'note-pdf', keywords: 'note memo invoice text pdf export receipt print' },
    { id: 'budget', title: 'Personal Budget Planner', cat: 'Budget', view: 'budget', keywords: 'budget expense income tracker finance cash savings money chart' },
    { id: 'calc-emi', title: 'Loan & EMI Calculator', cat: 'Finance Calcs', view: 'calculators', subtab: 'emi', keywords: 'loan emi mortgage interest payment installment finance' },
    { id: 'calc-tip', title: 'Tip & Bill Splitter', cat: 'Finance Calcs', view: 'calculators', subtab: 'tip', keywords: 'tip bill split dining restaurant split food share' },
    { id: 'calc-disc', title: 'Discount & Sales Tax', cat: 'Finance Calcs', view: 'calculators', subtab: 'discount', keywords: 'discount sales tax promo shopping percent save' },
    { id: 'calc-health', title: 'Health Hub (BMI, Water, TDEE)', cat: 'Health Calcs', view: 'calculators', subtab: 'health', keywords: 'bmi health weight water intake hydration calorie tdee' },
    { id: 'calc-age', title: 'Age & Date Difference', cat: 'Daily Tools', view: 'calculators', subtab: 'date', keywords: 'age date difference birthday time years days hours' },
    { id: 'calc-util', title: 'Unit Converter & Password Gen', cat: 'Daily Tools', view: 'calculators', subtab: 'utility', keywords: 'unit converter length weight temp password generate' }
  ];

  const el = {};

  function init() {
    cacheDOMElements();
    initTheme();
    initProState();
    bindGlobalEvents();
    initHashRouting();
    initHeroSearch();
    initCommandPalette();

    if (typeof QRTool !== 'undefined') QRTool.init();
    if (typeof ImagePDFTool !== 'undefined') ImagePDFTool.init();
    if (typeof BudgetTool !== 'undefined') BudgetTool.init();
    if (typeof DailyCalculators !== 'undefined') DailyCalculators.init();

    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  }

  function cacheDOMElements() {
    el.body = document.body;
    el.themeToggle = document.getElementById('btn-theme-toggle');
    el.themeIcon = document.getElementById('theme-icon');

    el.desktopNavBtns = document.querySelectorAll('.desktop-nav .nav-item');
    el.bottomNavBtns = document.querySelectorAll('.mobile-bottom-nav .bottom-nav-item');
    el.drawerNavBtns = document.querySelectorAll('.mobile-nav-drawer .drawer-link');
    el.allViews = document.querySelectorAll('.app-view');

    el.btnMobileMenu = document.getElementById('btn-mobile-menu');
    el.mobileDrawer = document.getElementById('mobile-nav-drawer');
    el.btnCloseMobileNav = document.getElementById('btn-close-mobile-nav');

    el.btnProBadge = document.getElementById('btn-pro-badge');
    el.proBadgeLabel = document.getElementById('pro-badge-label');
    el.modalPro = document.getElementById('modal-pro');
    el.proModeCheckbox = document.getElementById('pro-mode-toggle-checkbox');
    el.modalActivateProBtn = document.getElementById('btn-modal-activate-pro');
    el.modalActivateProText = document.getElementById('modal-activate-pro-text');
    el.proStatusBanner = document.getElementById('pro-status-banner');
    el.btnToggleProQuick = document.getElementById('btn-toggle-pro-quick');
    el.btnFooterTogglePro = document.getElementById('btn-footer-toggle-pro');

    el.btnCloseTopAd = document.getElementById('btn-close-ad');
    el.topAdBanner = document.getElementById('top-ad-banner');

    el.btnSearchTrigger = document.getElementById('btn-search-trigger');
    el.modalSearch = document.getElementById('modal-search');
    el.paletteInput = document.getElementById('palette-input');
    el.paletteResults = document.getElementById('palette-results');

    el.homeSearchInput = document.getElementById('home-search-input');
    el.homeSearchClear = document.getElementById('home-search-clear');
    el.filterChips = document.querySelectorAll('#filter-chips .chip');
    el.toolCards = document.querySelectorAll('.tool-card');
    el.toolsCount = document.getElementById('tools-count');

    el.toastContainer = document.getElementById('toast-container');
  }

  function bindGlobalEvents() {
    if (el.themeToggle) {
      el.themeToggle.addEventListener('click', toggleTheme);
    }

    const bindNavBtns = (buttons) => {
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const view = btn.getAttribute('data-view');
          if (view) switchView(view);
          closeMobileDrawer();
        });
      });
    };
    bindNavBtns(el.desktopNavBtns);
    bindNavBtns(el.bottomNavBtns);
    bindNavBtns(el.drawerNavBtns);

    document.querySelectorAll('.switch-view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const view = btn.getAttribute('data-view');
        const subtab = btn.getAttribute('data-subtab');
        if (view) {
          switchView(view);
          if (subtab) {
            if (view === 'image-pdf' && typeof ImagePDFTool !== 'undefined') {
              ImagePDFTool.switchSubTab(subtab);
            } else if (view === 'calculators' && typeof DailyCalculators !== 'undefined') {
              DailyCalculators.switchCalcTab(subtab);
            }
          }
        }
      });
    });

    if (el.btnMobileMenu) el.btnMobileMenu.addEventListener('click', openMobileDrawer);
    if (el.btnCloseMobileNav) el.btnCloseMobileNav.addEventListener('click', closeMobileDrawer);

    if (el.btnCloseTopAd) {
      el.btnCloseTopAd.addEventListener('click', () => {
        if (el.topAdBanner) el.topAdBanner.style.display = 'none';
        showToast('Ad dismissed. Upgrade to Pro for an ad-free experience!', 'info');
      });
    }

    document.querySelectorAll('.btn-pro-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('modal-pro');
      });
    });

    if (el.proModeCheckbox) {
      el.proModeCheckbox.addEventListener('change', (e) => {
        setProTier(e.target.checked);
      });
    }

    if (el.modalActivateProBtn) {
      el.modalActivateProBtn.addEventListener('click', () => {
        setProTier(!isPro);
        closeModal('modal-pro');
      });
    }

    if (el.btnToggleProQuick) {
      el.btnToggleProQuick.addEventListener('click', () => {
        setProTier(!isPro);
      });
    }

    if (el.btnFooterTogglePro) {
      el.btnFooterTogglePro.addEventListener('click', () => {
        setProTier(!isPro);
      });
    }

    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-overlay');
        if (modal) modal.classList.add('hidden');
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.add('hidden');
        }
      });
    });

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openCommandPalette();
      } else if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(modal => {
          modal.classList.add('hidden');
        });
        closeMobileDrawer();
      }
    });

    if (el.btnSearchTrigger) {
      el.btnSearchTrigger.addEventListener('click', openCommandPalette);
    }
  }

  function initTheme() {
    const savedTheme = localStorage.getItem('dailymate_theme');
    if (savedTheme) {
      currentTheme = savedTheme;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      currentTheme = 'dark';
    }
    applyTheme(currentTheme);
  }

  function applyTheme(theme) {
    currentTheme = theme;
    el.body.setAttribute('data-theme', theme);
    localStorage.setItem('dailymate_theme', theme);

    if (el.themeIcon) {
      el.themeIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
      if (window.lucide && window.lucide.createIcons) {
        window.lucide.createIcons();
      }
    }
  }

  function toggleTheme() {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} theme`, 'info');
  }

  function initProState() {
    const savedPro = localStorage.getItem('dailymate_is_pro');
    isPro = savedPro === 'true';
    updateProUI();
  }

  function setProTier(active) {
    isPro = active;
    localStorage.setItem('dailymate_is_pro', isPro ? 'true' : 'false');
    updateProUI();

    if (isPro) {
      showToast('👑 DailyMate Pro Activated! Ads removed & Pro features unlocked.', 'success');
    } else {
      showToast('Switched to Free Tier (Ad-supported mode).', 'info');
    }
  }

  function updateProUI() {
    if (isPro) {
      el.body.classList.add('pro-tier-active');
      if (el.proBadgeLabel) el.proBadgeLabel.textContent = '👑 Pro Active';
      if (el.proModeCheckbox) el.proModeCheckbox.checked = true;
      if (el.modalActivateProText) el.modalActivateProText.textContent = 'Deactivate Pro Demo';
      if (el.proStatusBanner) el.proStatusBanner.classList.remove('hidden');
    } else {
      el.body.classList.remove('pro-tier-active');
      if (el.proBadgeLabel) el.proBadgeLabel.textContent = 'Upgrade to Pro';
      if (el.proModeCheckbox) el.proModeCheckbox.checked = false;
      if (el.modalActivateProText) el.modalActivateProText.textContent = 'Activate Pro Demo Now';
      if (el.proStatusBanner) el.proStatusBanner.classList.add('hidden');
    }
  }

  function isProActive() {
    return isPro;
  }

  function switchView(viewName) {
    currentActiveView = viewName;

    el.allViews.forEach(view => {
      view.classList.toggle('active', view.id === `view-${viewName}`);
    });

    const updateActiveNav = (buttons) => {
      buttons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
      });
    };
    updateActiveNav(el.desktopNavBtns);
    updateActiveNav(el.bottomNavBtns);
    updateActiveNav(el.drawerNavBtns);

    window.location.hash = viewName;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (viewName === 'budget' && typeof BudgetTool !== 'undefined') {
      BudgetTool.renderAll();
    }
  }

  function initHashRouting() {
    const hash = window.location.hash.replace('#', '');
    if (['home', 'qr', 'image-pdf', 'budget', 'calculators'].includes(hash)) {
      switchView(hash);
    } else {
      switchView('home');
    }

    window.addEventListener('hashchange', () => {
      const newHash = window.location.hash.replace('#', '');
      if (['home', 'qr', 'image-pdf', 'budget', 'calculators'].includes(newHash)) {
        switchView(newHash);
      }
    });
  }

  function openMobileDrawer() {
    if (el.mobileDrawer) el.mobileDrawer.classList.add('open');
  }

  function closeMobileDrawer() {
    if (el.mobileDrawer) el.mobileDrawer.classList.remove('open');
  }

  function initHeroSearch() {
    if (el.homeSearchInput) {
      el.homeSearchInput.addEventListener('input', (e) => {
        const val = e.target.value.trim().toLowerCase();
        if (el.homeSearchClear) {
          el.homeSearchClear.classList.toggle('hidden', val.length === 0);
        }
        filterToolCards(val, getActiveFilterChip());
      });
    }

    if (el.homeSearchClear) {
      el.homeSearchClear.addEventListener('click', () => {
        el.homeSearchInput.value = '';
        el.homeSearchClear.classList.add('hidden');
        filterToolCards('', getActiveFilterChip());
        el.homeSearchInput.focus();
      });
    }

    if (el.filterChips) {
      el.filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
          el.filterChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          const filter = chip.getAttribute('data-filter');
          const searchVal = el.homeSearchInput ? el.homeSearchInput.value.trim().toLowerCase() : '';
          filterToolCards(searchVal, filter);
        });
      });
    }
  }

  function getActiveFilterChip() {
    const activeChip = document.querySelector('#filter-chips .chip.active');
    return activeChip ? activeChip.getAttribute('data-filter') : 'all';
  }

  function filterToolCards(searchTerm, category) {
    let visibleCount = 0;

    el.toolCards.forEach(card => {
      const cardCat = card.getAttribute('data-category');
      const keywords = (card.getAttribute('data-keywords') || '') + ' ' + (card.querySelector('.tool-title')?.textContent || '');
      
      const matchesCategory = category === 'all' || cardCat === category;
      const matchesSearch = !searchTerm || keywords.toLowerCase().includes(searchTerm);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (el.toolsCount) {
      el.toolsCount.textContent = `${visibleCount} Tools Available`;
    }
  }

  let selectedPaletteIndex = 0;
  let currentPaletteMatches = [];

  function initCommandPalette() {
    if (!el.paletteInput) return;

    el.paletteInput.addEventListener('input', (e) => {
      renderPaletteResults(e.target.value.trim().toLowerCase());
    });

    el.paletteInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedPaletteIndex = (selectedPaletteIndex + 1) % Math.max(1, currentPaletteMatches.length);
        updatePaletteSelection();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedPaletteIndex = (selectedPaletteIndex - 1 + currentPaletteMatches.length) % Math.max(1, currentPaletteMatches.length);
        updatePaletteSelection();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentPaletteMatches[selectedPaletteIndex]) {
          navigateFromPalette(currentPaletteMatches[selectedPaletteIndex]);
        }
      }
    });
  }

  function openCommandPalette() {
    openModal('modal-search');
    if (el.paletteInput) {
      el.paletteInput.value = '';
      el.paletteInput.focus();
    }
    renderPaletteResults('');
  }

  function renderPaletteResults(query) {
    if (!el.paletteResults) return;

    currentPaletteMatches = TOOL_CATALOG.filter(item => {
      if (!query) return true;
      return item.title.toLowerCase().includes(query) ||
             item.cat.toLowerCase().includes(query) ||
             item.keywords.toLowerCase().includes(query);
    });

    selectedPaletteIndex = 0;

    if (currentPaletteMatches.length === 0) {
      el.paletteResults.innerHTML = '<div class="empty-state">No matching tools found.</div>';
      return;
    }

    el.paletteResults.innerHTML = currentPaletteMatches.map((item, index) => `
      <div class="palette-result-item ${index === 0 ? 'selected' : ''}" data-index="${index}">
        <div class="palette-item-icon bg-primary">
          <i data-lucide="wrench"></i>
        </div>
        <div class="palette-item-info">
          <div class="palette-item-title">${escapeHTML(item.title)}</div>
          <div class="palette-item-cat">${escapeHTML(item.cat)}</div>
        </div>
      </div>
    `).join('');

    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }

    el.paletteResults.querySelectorAll('.palette-result-item').forEach(itemEl => {
      itemEl.addEventListener('click', () => {
        const idx = parseInt(itemEl.getAttribute('data-index'), 10);
        if (currentPaletteMatches[idx]) {
          navigateFromPalette(currentPaletteMatches[idx]);
        }
      });
    });
  }

  function updatePaletteSelection() {
    if (!el.paletteResults) return;
    const items = el.paletteResults.querySelectorAll('.palette-result-item');
    items.forEach((item, idx) => {
      item.classList.toggle('selected', idx === selectedPaletteIndex);
    });
    if (items[selectedPaletteIndex]) {
      items[selectedPaletteIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  function navigateFromPalette(tool) {
    closeModal('modal-search');
    switchView(tool.view);
    if (tool.subtab) {
      if (tool.view === 'image-pdf' && typeof ImagePDFTool !== 'undefined') {
        ImagePDFTool.switchSubTab(tool.subtab);
      } else if (tool.view === 'calculators' && typeof DailyCalculators !== 'undefined') {
        DailyCalculators.switchCalcTab(tool.subtab);
      }
    }
  }

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  function showToast(message, type = 'info', duration = 3000) {
    if (!el.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    else if (type === 'error') iconName = 'alert-triangle';
    else if (type === 'warning') iconName = 'alert-circle';

    toast.innerHTML = `
      <i data-lucide="${iconName}"></i>
      <span>${escapeHTML(message)}</span>
    `;

    el.toastContainer.appendChild(toast);

    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 300);
    }, duration);
  }

  function escapeHTML(str) {
    return (str || '').replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  return {
    init,
    switchView,
    openModal,
    closeModal,
    showToast,
    isProActive,
    setProTier
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  DailyMateApp.init();
});

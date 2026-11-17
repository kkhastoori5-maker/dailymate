/**
 * DailyMate - Personal Budget Planner Module (budget-tool.js)
 * Fully-functional income & expense tracking, spending limit alerts,
 * canvas doughnut chart, filters, search, CSV export, and JSON backup.
 */

const BudgetTool = (() => {
  const STORAGE_KEY = 'dailymate_budget_tx';
  const LIMIT_KEY = 'dailymate_budget_limit';

  let transactions = [];
  let monthlyLimit = 3000;
  let editingTxId = null;

  const CATEGORY_COLORS = {
    'Food & Dining': '#f59e0b',
    'Housing & Rent': '#6366f1',
    'Groceries': '#10b981',
    'Utilities': '#0ea5e9',
    'Transport': '#8b5cf6',
    'Entertainment': '#ec4899',
    'Health': '#14b8a6',
    'Shopping': '#f43f5e',
    'Salary': '#059669',
    'Freelance': '#10b981',
    'Investment': '#3b82f6',
    'Other': '#64748b'
  };

  const el = {};

  function init() {
    cacheDOMElements();
    bindEvents();
    loadStoredData();
    renderAll();
  }

  function cacheDOMElements() {
    el.metricIncome = document.getElementById('metric-income');
    el.metricExpenses = document.getElementById('metric-expenses');
    el.metricBalance = document.getElementById('metric-balance');
    el.metricSavingsRate = document.getElementById('metric-savings-rate');

    el.inputBudgetLimit = document.getElementById('input-budget-limit');
    el.budgetStatusPill = document.getElementById('budget-status-pill');
    el.budgetProgressFill = document.getElementById('budget-progress-fill');
    el.spentVsLimit = document.getElementById('spent-vs-limit');
    el.spentPctLabel = document.getElementById('spent-pct-label');

    el.canvasChart = document.getElementById('budget-canvas-chart');
    el.chartCatCount = document.getElementById('chart-cat-count');
    el.chartCenterValue = document.getElementById('chart-center-value');
    el.categoryLegendList = document.getElementById('category-legend-list');

    el.txTableBody = document.getElementById('tx-table-body');
    el.txEmptyState = document.getElementById('tx-empty-state');
    el.txCountBadge = document.getElementById('tx-count-badge');
    el.txSearchInput = document.getElementById('tx-search-input');
    el.txFilterType = document.getElementById('tx-filter-type');
    el.txFilterCategory = document.getElementById('tx-filter-category');

    el.btnOpenAddTx = document.getElementById('btn-open-add-tx');
    el.btnLoadDemo = document.getElementById('btn-load-demo-budget');
    el.btnExportCsv = document.getElementById('btn-export-csv');
    el.btnClearBudget = document.getElementById('btn-clear-budget');
    el.btnBackupJson = document.getElementById('btn-backup-json');
    el.importJsonFile = document.getElementById('import-json-file');

    el.modalTx = document.getElementById('modal-transaction');
    el.txForm = document.getElementById('tx-form');
    el.txModalTitle = document.getElementById('tx-modal-title');
    el.txIdInput = document.getElementById('tx-id-input');
    el.txAmount = document.getElementById('tx-amount');
    el.txTitle = document.getElementById('tx-title');
    el.txCategory = document.getElementById('tx-category');
    el.txDate = document.getElementById('tx-date');
    el.txMethod = document.getElementById('tx-method');
  }

  function bindEvents() {
    if (el.btnOpenAddTx) {
      el.btnOpenAddTx.addEventListener('click', () => openTxModal());
    }

    if (el.txForm) {
      el.txForm.addEventListener('submit', handleFormSubmit);
    }

    document.querySelectorAll('input[name="tx-type"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        updateModalCategoryOptions(e.target.value);
      });
    });

    if (el.inputBudgetLimit) {
      el.inputBudgetLimit.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) || 0;
        monthlyLimit = val;
        try {
          localStorage.setItem(LIMIT_KEY, monthlyLimit.toString());
        } catch (err) {}
        updateBudgetLimitUI();
      });
    }

    if (el.txSearchInput) el.txSearchInput.addEventListener('input', renderTransactionsTable);
    if (el.txFilterType) el.txFilterType.addEventListener('change', renderTransactionsTable);
    if (el.txFilterCategory) el.txFilterCategory.addEventListener('change', renderTransactionsTable);

    if (el.btnLoadDemo) el.btnLoadDemo.addEventListener('click', loadDemoData);
    if (el.btnExportCsv) el.btnExportCsv.addEventListener('click', exportToCSV);
    if (el.btnClearBudget) el.btnClearBudget.addEventListener('click', clearAllTransactions);
    if (el.btnBackupJson) el.btnBackupJson.addEventListener('click', backupJSON);
    if (el.importJsonFile) el.importJsonFile.addEventListener('change', handleImportJSON);
  }

  function loadStoredData() {
    try {
      const storedTx = localStorage.getItem(STORAGE_KEY);
      transactions = storedTx ? JSON.parse(storedTx) : [];

      const storedLimit = localStorage.getItem(LIMIT_KEY);
      if (storedLimit) {
        monthlyLimit = parseFloat(storedLimit) || 3000;
        if (el.inputBudgetLimit) el.inputBudgetLimit.value = monthlyLimit;
      }
    } catch (e) {
      transactions = [];
    }

    if (transactions.length === 0) {
      loadDemoData(false);
    }
  }

  function saveTransactions() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  function openTxModal(txToEdit = null) {
    if (!el.modalTx) return;

    if (txToEdit) {
      editingTxId = txToEdit.id;
      el.txModalTitle.textContent = 'Edit Transaction';
      el.txIdInput.value = txToEdit.id;
      el.txAmount.value = txToEdit.amount;
      el.txTitle.value = txToEdit.title;
      el.txDate.value = txToEdit.date;
      el.txMethod.value = txToEdit.method || 'Credit / Debit Card';

      const radio = document.querySelector(`input[name="tx-type"][value="${txToEdit.type}"]`);
      if (radio) {
        radio.checked = true;
        updateModalCategoryOptions(txToEdit.type);
      }
      el.txCategory.value = txToEdit.category;
    } else {
      editingTxId = null;
      el.txModalTitle.textContent = 'Add New Transaction';
      el.txForm.reset();
      el.txIdInput.value = '';
      el.txDate.value = new Date().toISOString().split('T')[0];
      const defaultRadio = document.querySelector('input[name="tx-type"][value="expense"]');
      if (defaultRadio) defaultRadio.checked = true;
      updateModalCategoryOptions('expense');
    }

    if (typeof DailyMateApp !== 'undefined') DailyMateApp.openModal('modal-transaction');
  }

  function updateModalCategoryOptions(type) {
    const expenseGroup = document.getElementById('cat-group-expense');
    const incomeGroup = document.getElementById('cat-group-income');

    if (type === 'income') {
      if (expenseGroup) expenseGroup.style.display = 'none';
      if (incomeGroup) incomeGroup.style.display = 'block';
      el.txCategory.value = 'Salary';
    } else {
      if (expenseGroup) expenseGroup.style.display = 'block';
      if (incomeGroup) incomeGroup.style.display = 'none';
      el.txCategory.value = 'Food & Dining';
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault();

    const type = document.querySelector('input[name="tx-type"]:checked').value;
    const amount = parseFloat(el.txAmount.value);
    const title = el.txTitle.value.trim();
    const category = el.txCategory.value;
    const date = el.txDate.value;
    const method = el.txMethod.value;

    if (!amount || amount <= 0 || !title || !date) {
      if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('Please complete all required fields.', 'error');
      return;
    }

    if (editingTxId) {
      const idx = transactions.findIndex(t => t.id === editingTxId);
      if (idx !== -1) {
        transactions[idx] = { id: editingTxId, type, amount, title, category, date, method };
        if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('Transaction updated successfully!', 'success');
      }
    } else {
      transactions.unshift({
        id: Date.now(),
        type,
        amount,
        title,
        category,
        date,
        method
      });
      if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('Transaction added!', 'success');
    }

    saveTransactions();
    if (typeof DailyMateApp !== 'undefined') DailyMateApp.closeModal('modal-transaction');
    renderAll();
  }

  function renderAll() {
    renderMetrics();
    updateBudgetLimitUI();
    renderTransactionsTable();
    drawCategoryChart();
  }

  function renderMetrics() {
    let income = 0;
    let expenses = 0;

    transactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else if (t.type === 'expense') expenses += t.amount;
    });

    const balance = income - expenses;
    const savingsRate = income > 0 ? Math.max(0, ((income - expenses) / income) * 100) : 0;

    if (el.metricIncome) el.metricIncome.textContent = formatCurrency(income);
    if (el.metricExpenses) el.metricExpenses.textContent = formatCurrency(expenses);
    if (el.metricBalance) {
      el.metricBalance.textContent = formatCurrency(balance);
      el.metricBalance.className = `metric-val ${balance >= 0 ? 'text-primary' : 'text-danger'}`;
    }
    if (el.metricSavingsRate) {
      el.metricSavingsRate.textContent = `${savingsRate.toFixed(1)}%`;
    }
  }

  function updateBudgetLimitUI() {
    let totalExpense = 0;
    transactions.forEach(t => {
      if (t.type === 'expense') totalExpense += t.amount;
    });

    const pct = monthlyLimit > 0 ? (totalExpense / monthlyLimit) * 100 : 0;
    const clampedPct = Math.min(100, Math.round(pct));

    if (el.budgetProgressFill) {
      el.budgetProgressFill.style.width = `${clampedPct}%`;
      el.budgetProgressFill.className = 'budget-progress-fill';
      if (pct >= 100) el.budgetProgressFill.classList.add('danger');
      else if (pct >= 80) el.budgetProgressFill.classList.add('warning');
    }

    if (el.spentVsLimit) {
      el.spentVsLimit.textContent = `${formatCurrency(totalExpense)} of ${formatCurrency(monthlyLimit)}`;
    }
    if (el.spentPctLabel) {
      el.spentPctLabel.textContent = `${Math.round(pct)}% of monthly budget`;
    }

    if (el.budgetStatusPill) {
      if (pct >= 100) {
        el.budgetStatusPill.textContent = 'Exceeded!';
        el.budgetStatusPill.className = 'badge badge-danger';
      } else if (pct >= 80) {
        el.budgetStatusPill.textContent = 'Warning (80%+)';
        el.budgetStatusPill.className = 'badge badge-pro-feature';
      } else {
        el.budgetStatusPill.textContent = 'On Track';
        el.budgetStatusPill.className = 'badge badge-success';
      }
    }
  }

  function renderTransactionsTable() {
    if (!el.txTableBody) return;

    const searchTerm = (el.txSearchInput ? el.txSearchInput.value : '').toLowerCase().trim();
    const typeFilter = el.txFilterType ? el.txFilterType.value : 'all';
    const catFilter = el.txFilterCategory ? el.txFilterCategory.value : 'all';

    const filtered = transactions.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchTerm) || (t.category && t.category.toLowerCase().includes(searchTerm));
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      const matchesCat = catFilter === 'all' || t.category === catFilter;
      return matchesSearch && matchesType && matchesCat;
    });

    if (el.txCountBadge) {
      el.txCountBadge.textContent = `${filtered.length} Entries`;
    }

    if (filtered.length === 0) {
      el.txTableBody.innerHTML = '';
      if (el.txEmptyState) el.txEmptyState.style.display = 'block';
      return;
    }

    if (el.txEmptyState) el.txEmptyState.style.display = 'none';

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    el.txTableBody.innerHTML = filtered.map(t => {
      const isIncome = t.type === 'income';
      const color = CATEGORY_COLORS[t.category] || '#64748b';
      return `
        <tr>
          <td>${formatDate(t.date)}</td>
          <td><strong>${escapeHTML(t.title)}</strong></td>
          <td>
            <span class="badge" style="background: ${color}20; color: ${color};">
              ${escapeHTML(t.category)}
            </span>
          </td>
          <td class="text-muted" style="font-size: 0.8rem;">${escapeHTML(t.method || 'Card')}</td>
          <td class="text-right ${isIncome ? 'tx-amount-income' : 'tx-amount-expense'}">
            ${isIncome ? '+' : '-'}${formatCurrency(t.amount)}
          </td>
          <td class="text-center">
            <button class="btn-text btn-sm btn-edit-tx" data-id="${t.id}" title="Edit"><i data-lucide="edit-2"></i></button>
            <button class="btn-text btn-sm text-danger btn-del-tx" data-id="${t.id}" title="Delete"><i data-lucide="trash-2"></i></button>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }

    el.txTableBody.querySelectorAll('.btn-edit-tx').forEach(b => {
      b.addEventListener('click', () => {
        const id = parseInt(b.getAttribute('data-id'), 10);
        const item = transactions.find(t => t.id === id);
        if (item) openTxModal(item);
      });
    });

    el.txTableBody.querySelectorAll('.btn-del-tx').forEach(b => {
      b.addEventListener('click', () => {
        const id = parseInt(b.getAttribute('data-id'), 10);
        deleteTransaction(id);
      });
    });
  }

  function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    renderAll();
    if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('Transaction deleted', 'info');
  }

  function clearAllTransactions() {
    if (!confirm('Are you sure you want to reset all budget transactions?')) return;
    transactions = [];
    saveTransactions();
    renderAll();
    if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('All transactions cleared', 'info');
  }

  function drawCategoryChart() {
    if (!el.canvasChart) return;

    const ctx = el.canvasChart.getContext('2d');
    const w = el.canvasChart.width;
    const h = el.canvasChart.height;
    ctx.clearRect(0, 0, w, h);

    const catTotals = {};
    let totalExpenses = 0;

    transactions.forEach(t => {
      if (t.type === 'expense') {
        catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
        totalExpenses += t.amount;
      }
    });

    const categories = Object.keys(catTotals);
    if (el.chartCatCount) el.chartCatCount.textContent = `${categories.length} Categories`;
    if (el.chartCenterValue) el.chartCenterValue.textContent = formatCurrency(totalExpenses);

    if (categories.length === 0 || totalExpenses === 0) {
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 90, 0, 2 * Math.PI);
      ctx.lineWidth = 28;
      ctx.strokeStyle = '#e2e8f0';
      ctx.stroke();

      if (el.categoryLegendList) {
        el.categoryLegendList.innerHTML = '<p class="empty-state">No expense transactions recorded yet.</p>';
      }
      return;
    }

    const centerX = w / 2;
    const centerY = h / 2;
    const radius = 95;
    const lineWidth = 30;
    let startAngle = -0.5 * Math.PI;

    const legendItems = [];

    categories.forEach(cat => {
      const amount = catTotals[cat];
      const sliceAngle = (amount / totalExpenses) * 2 * Math.PI;
      const color = CATEGORY_COLORS[cat] || '#6366f1';
      const pct = Math.round((amount / totalExpenses) * 100);

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = color;
      ctx.stroke();

      startAngle += sliceAngle;

      legendItems.push({
        cat,
        amount,
        pct,
        color
      });
    });

    legendItems.sort((a, b) => b.amount - a.amount);
    if (el.categoryLegendList) {
      el.categoryLegendList.innerHTML = legendItems.map(item => `
        <div class="legend-item">
          <div class="legend-item-left">
            <span class="legend-dot" style="background: ${item.color};"></span>
            <strong>${escapeHTML(item.cat)}</strong>
          </div>
          <div>
            <span>${formatCurrency(item.amount)}</span>
            <span class="text-muted" style="font-size: 0.75rem; margin-left: 0.35rem;">(${item.pct}%)</span>
          </div>
        </div>
      `).join('');
    }
  }

  function loadDemoData(showToastAlert = true) {
    const today = new Date();
    const formatDateStr = (daysAgo) => {
      const d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };

    transactions = [
      { id: 1, type: 'income', title: 'Monthly Salary Deposit', amount: 3800.00, category: 'Salary', date: formatDateStr(1), method: 'Bank Transfer' },
      { id: 2, type: 'income', title: 'Client UI Design Project', amount: 850.00, category: 'Freelance', date: formatDateStr(3), method: 'Bank Transfer' },
      { id: 3, type: 'expense', title: 'Apartment Monthly Rent', amount: 1200.00, category: 'Housing & Rent', date: formatDateStr(2), method: 'Bank Transfer' },
      { id: 4, type: 'expense', title: 'Weekly Groceries - Whole Foods', amount: 165.40, category: 'Groceries', date: formatDateStr(3), method: 'Credit / Debit Card' },
      { id: 5, type: 'expense', title: 'Dinner with Team', amount: 78.50, category: 'Food & Dining', date: formatDateStr(4), method: 'Credit / Debit Card' },
      { id: 6, type: 'expense', title: 'High-Speed Fiber Internet', amount: 65.00, category: 'Utilities', date: formatDateStr(5), method: 'Credit / Debit Card' },
      { id: 7, type: 'expense', title: 'Subway & Transit Pass', amount: 45.00, category: 'Transport', date: formatDateStr(6), method: 'Digital Wallet' },
      { id: 8, type: 'expense', title: 'Fitness Gym Membership', amount: 55.00, category: 'Health', date: formatDateStr(7), method: 'Credit / Debit Card' },
      { id: 9, type: 'expense', title: 'Streaming Subscriptions', amount: 28.00, category: 'Entertainment', date: formatDateStr(8), method: 'Credit / Debit Card' }
    ];

    monthlyLimit = 2500;
    if (el.inputBudgetLimit) el.inputBudgetLimit.value = monthlyLimit;

    saveTransactions();
    renderAll();

    if (showToastAlert && typeof DailyMateApp !== 'undefined') {
      DailyMateApp.showToast('Sample budget data loaded!', 'success');
    }
  }

  function exportToCSV() {
    if (transactions.length === 0) {
      if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('No transactions to export.', 'error');
      return;
    }

    const headers = ['Date', 'Type', 'Description', 'Category', 'Payment Method', 'Amount ($)'];
    const rows = transactions.map(t => [
      t.date,
      t.type.toUpperCase(),
      `"${t.title.replace(/"/g, '""')}"`,
      t.category,
      t.method || 'Card',
      t.amount.toFixed(2)
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DailyMate-Budget-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('Exported CSV spreadsheet!', 'success');
  }

  function backupJSON() {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      monthlyLimit: monthlyLimit,
      transactions: transactions
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DailyMate-Budget-Backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('Backup JSON file downloaded!', 'success');
  }

  function handleImportJSON(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.transactions && Array.isArray(data.transactions)) {
          transactions = data.transactions;
          if (data.monthlyLimit) monthlyLimit = data.monthlyLimit;
          saveTransactions();
          renderAll();
          if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast(`Imported ${transactions.length} transactions!`, 'success');
        } else {
          if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('Invalid JSON budget schema.', 'error');
        }
      } catch (err) {
        if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('Failed to parse JSON file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function formatCurrency(val) {
    return '$' + (val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return dateStr;
  }

  function escapeHTML(str) {
    return (str || '').replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  return {
    init,
    openTxModal,
    renderAll
  };
})();

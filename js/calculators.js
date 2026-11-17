/**
 * DailyMate - Daily Calculators Suite (calculators.js)
 * EMI/Loan with amortization, BMI & Water tracker, Calorie/TDEE,
 * Tip splitter, Discount & Tax, Age/Date difference, Unit converter, and Password generator.
 */

const DailyCalculators = (() => {
  const el = {};

  const UNIT_DATA = {
    length: {
      base: 'meter',
      units: {
        'Meter (m)': 1,
        'Kilometer (km)': 1000,
        'Centimeter (cm)': 0.01,
        'Millimeter (mm)': 0.001,
        'Inch (in)': 0.0254,
        'Foot (ft)': 0.3048,
        'Yard (yd)': 0.9144,
        'Mile (mi)': 1609.344
      }
    },
    weight: {
      base: 'kilogram',
      units: {
        'Kilogram (kg)': 1,
        'Gram (g)': 0.001,
        'Pound (lb)': 0.45359237,
        'Ounce (oz)': 0.0283495,
        'Stone (st)': 6.35029
      }
    },
    temp: {
      isTemp: true,
      units: {
        'Celsius (°C)': 'C',
        'Fahrenheit (°F)': 'F',
        'Kelvin (K)': 'K'
      }
    },
    speed: {
      base: 'm/s',
      units: {
        'Meters per second (m/s)': 1,
        'Kilometers per hour (km/h)': 0.277778,
        'Miles per hour (mph)': 0.44704,
        'Knots (kt)': 0.514444
      }
    }
  };

  function init() {
    cacheDOMElements();
    bindEvents();
    initSubTabs();

    calculateEMI();
    calculateBMI();
    initWaterTracker();
    calculateTDEE();
    calculateTip();
    calculateDiscount();
    calculateAge();
    initUnitConverter();
    generatePassword();
  }

  function cacheDOMElements() {
    el.calcTabBtns = document.querySelectorAll('[data-calc-tab]');
    el.calcTabContents = document.querySelectorAll('.calc-tab-content');

    el.loanAmount = document.getElementById('loan-amount');
    el.loanAmountSlider = document.getElementById('loan-amount-slider');
    el.loanRate = document.getElementById('loan-rate');
    el.loanRateSlider = document.getElementById('loan-rate-slider');
    el.loanTenure = document.getElementById('loan-tenure');
    el.loanTenureSlider = document.getElementById('loan-tenure-slider');

    el.emiMonthlyVal = document.getElementById('emi-monthly-val');
    el.emiPrincipalVal = document.getElementById('emi-principal-val');
    el.emiInterestVal = document.getElementById('emi-interest-val');
    el.emiTotalVal = document.getElementById('emi-total-val');
    el.emiPrincipalPct = document.getElementById('emi-principal-pct');
    el.emiInterestPct = document.getElementById('emi-interest-pct');
    el.emiPrincipalFill = document.getElementById('emi-principal-fill');
    el.emiInterestFill = document.getElementById('emi-interest-fill');
    el.amortizationTbody = document.getElementById('amortization-tbody');

    el.btnBmiMetric = document.getElementById('btn-bmi-metric');
    el.btnBmiImperial = document.getElementById('btn-bmi-imperial');
    el.bmiInputsMetric = document.getElementById('bmi-inputs-metric');
    el.bmiInputsImperial = document.getElementById('bmi-inputs-imperial');
    el.bmiWeightMetric = document.getElementById('bmi-weight-metric');
    el.bmiHeightMetric = document.getElementById('bmi-height-metric');
    el.bmiWeightImp = document.getElementById('bmi-weight-imp');
    el.bmiHeightFt = document.getElementById('bmi-height-ft');
    el.bmiHeightIn = document.getElementById('bmi-height-in');
    el.bmiVal = document.getElementById('bmi-val');
    el.bmiCategory = document.getElementById('bmi-category');
    el.bmiNeedle = document.getElementById('bmi-needle');
    el.bmiHealthyAdvice = document.getElementById('bmi-healthy-advice');

    el.waterWeight = document.getElementById('water-weight');
    el.waterActivity = document.getElementById('water-activity');
    el.waterTargetLiters = document.getElementById('water-target-liters');
    el.glassesGrid = document.getElementById('glasses-grid');
    el.waterLoggedLabel = document.getElementById('water-logged-label');
    el.btnResetWater = document.getElementById('btn-reset-water');

    el.tdeeAge = document.getElementById('tdee-age');
    el.tdeeGender = document.getElementById('tdee-gender');
    el.tdeeActivity = document.getElementById('tdee-activity');
    el.tdeeMaintain = document.getElementById('tdee-maintain');
    el.tdeeLoss = document.getElementById('tdee-loss');
    el.tdeeGain = document.getElementById('tdee-gain');

    el.tipBillAmount = document.getElementById('tip-bill-amount');
    el.tipCustomPct = document.getElementById('tip-custom-pct');
    el.tipPeopleCount = document.getElementById('tip-people-count');
    el.btnPeopleMinus = document.getElementById('btn-people-minus');
    el.btnPeoplePlus = document.getElementById('btn-people-plus');
    el.tipPerPerson = document.getElementById('tip-per-person');
    el.tipBaseBill = document.getElementById('tip-base-bill');
    el.tipTotalVal = document.getElementById('tip-total-val');
    el.tipGrandTotal = document.getElementById('tip-grand-total');
    el.tipPerPersonTip = document.getElementById('tip-per-person-tip');
    el.tipPerPersonBase = document.getElementById('tip-per-person-base');

    el.discOriginalPrice = document.getElementById('disc-original-price');
    el.discPercent = document.getElementById('disc-percent');
    el.discTaxPercent = document.getElementById('disc-tax-percent');
    el.discSavingsBadge = document.getElementById('disc-savings-badge');
    el.discFinalPrice = document.getElementById('disc-final-price');
    el.discOrigDisplay = document.getElementById('disc-orig-display');
    el.discSavedVal = document.getElementById('disc-saved-val');
    el.discTaxVal = document.getElementById('disc-tax-val');

    el.dateBirthInput = document.getElementById('date-birth-input');
    el.dateCompareInput = document.getElementById('date-compare-input');
    el.ageHeroText = document.getElementById('age-hero-text');
    el.ageTotalMonths = document.getElementById('age-total-months');
    el.ageTotalWeeks = document.getElementById('age-total-weeks');
    el.ageTotalDays = document.getElementById('age-total-days');
    el.ageTotalHours = document.getElementById('age-total-hours');
    el.nextBirthdayText = document.getElementById('next-birthday-text');

    el.unitCategory = document.getElementById('unit-category');
    el.unitValFrom = document.getElementById('unit-val-from');
    el.unitSelectFrom = document.getElementById('unit-select-from');
    el.btnSwapUnits = document.getElementById('btn-swap-units');
    el.unitValTo = document.getElementById('unit-val-to');
    el.unitSelectTo = document.getElementById('unit-select-to');

    el.pwdOutput = document.getElementById('pwd-output');
    el.btnCopyPwd = document.getElementById('btn-copy-pwd');
    el.pwdLengthSlider = document.getElementById('pwd-length-slider');
    el.pwdLengthVal = document.getElementById('pwd-length-val');
    el.pwdIncUpper = document.getElementById('pwd-inc-upper');
    el.pwdIncLower = document.getElementById('pwd-inc-lower');
    el.pwdIncNum = document.getElementById('pwd-inc-num');
    el.pwdIncSym = document.getElementById('pwd-inc-sym');
    el.btnGeneratePwd = document.getElementById('btn-generate-pwd');
    el.strengthBarFill = document.getElementById('strength-bar-fill');
    el.strengthLabel = document.getElementById('strength-label');
  }

  function initSubTabs() {
    if (el.calcTabBtns) {
      el.calcTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const tab = btn.getAttribute('data-calc-tab');
          switchCalcTab(tab);
        });
      });
    }
  }

  function switchCalcTab(tab) {
    if (el.calcTabBtns) {
      el.calcTabBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-calc-tab') === tab));
    }
    if (el.calcTabContents) {
      el.calcTabContents.forEach(c => c.classList.toggle('active', c.id === `calc-tab-${tab}`));
    }
  }

  function bindEvents() {
    syncInputAndSlider(el.loanAmount, el.loanAmountSlider, calculateEMI);
    syncInputAndSlider(el.loanRate, el.loanRateSlider, calculateEMI);
    syncInputAndSlider(el.loanTenure, el.loanTenureSlider, calculateEMI);

    if (el.btnBmiMetric && el.btnBmiImperial) {
      el.btnBmiMetric.addEventListener('click', () => setBmiUnit(true));
      el.btnBmiImperial.addEventListener('click', () => setBmiUnit(false));
    }
    const bmiInputs = [el.bmiWeightMetric, el.bmiHeightMetric, el.bmiWeightImp, el.bmiHeightFt, el.bmiHeightIn];
    bmiInputs.forEach(input => {
      if (input) input.addEventListener('input', calculateBMI);
    });

    if (el.waterWeight) el.waterWeight.addEventListener('input', renderWaterGoal);
    if (el.waterActivity) el.waterActivity.addEventListener('change', renderWaterGoal);
    if (el.btnResetWater) el.btnResetWater.addEventListener('click', resetWaterTracker);

    const tdeeInputs = [el.tdeeAge, el.tdeeGender, el.tdeeActivity];
    tdeeInputs.forEach(input => {
      if (input) input.addEventListener('input', calculateTDEE);
    });

    if (el.tipBillAmount) el.tipBillAmount.addEventListener('input', calculateTip);
    if (el.tipCustomPct) el.tipCustomPct.addEventListener('input', () => {
      document.querySelectorAll('.tip-preset-grid .btn-tip-preset').forEach(b => b.classList.remove('active'));
      calculateTip();
    });

    document.querySelectorAll('.tip-preset-grid .btn-tip-preset').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('.tip-preset-grid .btn-tip-preset').forEach(btn => btn.classList.remove('active'));
        b.classList.add('active');
        if (el.tipCustomPct) el.tipCustomPct.value = '';
        calculateTip();
      });
    });

    if (el.btnPeopleMinus) {
      el.btnPeopleMinus.addEventListener('click', () => {
        let count = parseInt(el.tipPeopleCount.value, 10) || 1;
        if (count > 1) {
          el.tipPeopleCount.value = count - 1;
          calculateTip();
        }
      });
    }

    if (el.btnPeoplePlus) {
      el.btnPeoplePlus.addEventListener('click', () => {
        let count = parseInt(el.tipPeopleCount.value, 10) || 1;
        el.tipPeopleCount.value = count + 1;
        calculateTip();
      });
    }

    if (el.tipPeopleCount) el.tipPeopleCount.addEventListener('input', calculateTip);

    if (el.discOriginalPrice) el.discOriginalPrice.addEventListener('input', calculateDiscount);
    if (el.discPercent) el.discPercent.addEventListener('input', () => {
      document.querySelectorAll('.btn-disc-preset').forEach(b => b.classList.remove('active'));
      calculateDiscount();
    });
    if (el.discTaxPercent) el.discTaxPercent.addEventListener('input', calculateDiscount);

    document.querySelectorAll('.btn-disc-preset').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('.btn-disc-preset').forEach(btn => btn.classList.remove('active'));
        b.classList.add('active');
        el.discPercent.value = b.getAttribute('data-pct');
        calculateDiscount();
      });
    });

    if (el.dateBirthInput) el.dateBirthInput.addEventListener('input', calculateAge);
    if (el.dateCompareInput) {
      el.dateCompareInput.value = new Date().toISOString().split('T')[0];
      el.dateCompareInput.addEventListener('input', calculateAge);
    }

    if (el.unitCategory) el.unitCategory.addEventListener('change', populateUnitSelects);
    if (el.unitValFrom) el.unitValFrom.addEventListener('input', convertUnits);
    if (el.unitSelectFrom) el.unitSelectFrom.addEventListener('change', convertUnits);
    if (el.unitSelectTo) el.unitSelectTo.addEventListener('change', convertUnits);
    if (el.btnSwapUnits) el.btnSwapUnits.addEventListener('click', swapUnits);

    if (el.pwdLengthSlider) {
      el.pwdLengthSlider.addEventListener('input', (e) => {
        el.pwdLengthVal.textContent = `${e.target.value} chars`;
        generatePassword();
      });
    }
    const pwdBoxes = [el.pwdIncUpper, el.pwdIncLower, el.pwdIncNum, el.pwdIncSym];
    pwdBoxes.forEach(box => {
      if (box) box.addEventListener('change', generatePassword);
    });
    if (el.btnGeneratePwd) el.btnGeneratePwd.addEventListener('click', generatePassword);
    if (el.btnCopyPwd) el.btnCopyPwd.addEventListener('click', copyPassword);
  }

  function syncInputAndSlider(inputEl, sliderEl, callback) {
    if (!inputEl || !sliderEl) return;
    inputEl.addEventListener('input', () => {
      sliderEl.value = inputEl.value;
      callback();
    });
    sliderEl.addEventListener('input', () => {
      inputEl.value = sliderEl.value;
      callback();
    });
  }

  function calculateEMI() {
    const P = parseFloat(el.loanAmount.value) || 0;
    const annualRate = parseFloat(el.loanRate.value) || 0;
    const years = parseFloat(el.loanTenure.value) || 1;

    const r = (annualRate / 12) / 100;
    const n = years * 12;

    let emi = 0;
    if (r > 0) {
      emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    } else {
      emi = P / n;
    }

    const totalPayable = emi * n;
    const totalInterest = totalPayable - P;

    const principalPct = totalPayable > 0 ? Math.round((P / totalPayable) * 100) : 0;
    const interestPct = 100 - principalPct;

    el.emiMonthlyVal.textContent = formatCurrency(emi);
    el.emiPrincipalVal.textContent = formatCurrency(P);
    el.emiInterestVal.textContent = formatCurrency(totalInterest);
    el.emiTotalVal.textContent = formatCurrency(totalPayable);

    el.emiPrincipalPct.textContent = `${principalPct}%`;
    el.emiInterestPct.textContent = `${interestPct}%`;

    el.emiPrincipalFill.style.width = `${principalPct}%`;
    el.emiInterestFill.style.width = `${interestPct}%`;

    renderAmortizationSchedule(P, r, emi, years);
  }

  function renderAmortizationSchedule(principal, monthlyRate, emi, years) {
    if (!el.amortizationTbody) return;

    let balance = principal;
    const rows = [];

    for (let yr = 1; yr <= years; yr++) {
      let yearlyInterest = 0;
      let yearlyPrincipal = 0;

      for (let m = 1; m <= 12; m++) {
        const interest = balance * monthlyRate;
        const princ = emi - interest;
        yearlyInterest += interest;
        yearlyPrincipal += princ;
        balance = Math.max(0, balance - princ);
      }

      rows.push(`
        <tr>
          <td>Year ${yr}</td>
          <td>${formatCurrency(yearlyPrincipal)}</td>
          <td class="text-danger">${formatCurrency(yearlyInterest)}</td>
          <td>${formatCurrency(balance)}</td>
        </tr>
      `);
    }

    el.amortizationTbody.innerHTML = rows.join('');
  }

  let isMetricBMI = true;

  function setBmiUnit(metric) {
    isMetricBMI = metric;
    el.btnBmiMetric.classList.toggle('active', metric);
    el.btnBmiImperial.classList.toggle('active', !metric);

    el.bmiInputsMetric.classList.toggle('hidden', !metric);
    el.bmiInputsImperial.classList.toggle('hidden', metric);

    calculateBMI();
  }

  function calculateBMI() {
    let weightKg = 0;
    let heightM = 0;

    if (isMetricBMI) {
      weightKg = parseFloat(el.bmiWeightMetric.value) || 0;
      const heightCm = parseFloat(el.bmiHeightMetric.value) || 0;
      heightM = heightCm / 100;
    } else {
      const weightLbs = parseFloat(el.bmiWeightImp.value) || 0;
      const ft = parseFloat(el.bmiHeightFt.value) || 0;
      const inches = parseFloat(el.bmiHeightIn.value) || 0;
      const totalInches = (ft * 12) + inches;

      weightKg = weightLbs * 0.453592;
      heightM = totalInches * 0.0254;
    }

    if (weightKg <= 0 || heightM <= 0) return;

    const bmi = weightKg / (heightM * heightM);
    el.bmiVal.textContent = bmi.toFixed(1);

    let category = '';
    let catClass = 'badge-success';
    let needlePct = 50;

    if (bmi < 18.5) {
      category = 'Underweight';
      catClass = 'badge-info';
      needlePct = Math.min(25, (bmi / 18.5) * 25);
    } else if (bmi < 25) {
      category = 'Normal Weight';
      catClass = 'badge-success';
      needlePct = 25 + ((bmi - 18.5) / 6.5) * 35;
    } else if (bmi < 30) {
      category = 'Overweight';
      catClass = 'badge-pro-feature';
      needlePct = 60 + ((bmi - 25) / 5) * 20;
    } else {
      category = 'Obese';
      catClass = 'badge-danger';
      needlePct = Math.min(98, 80 + ((bmi - 30) / 10) * 18);
    }

    el.bmiCategory.textContent = category;
    el.bmiCategory.className = `bmi-category-badge badge ${catClass}`;
    el.bmiNeedle.style.left = `${needlePct}%`;

    const minHealthyKg = (18.5 * heightM * heightM).toFixed(1);
    const maxHealthyKg = (24.9 * heightM * heightM).toFixed(1);

    if (isMetricBMI) {
      el.bmiHealthyAdvice.innerHTML = `Healthy weight for your height: <strong>${minHealthyKg} kg – ${maxHealthyKg} kg</strong>`;
    } else {
      const minLbs = Math.round(minHealthyKg * 2.20462);
      const maxLbs = Math.round(maxHealthyKg * 2.20462);
      el.bmiHealthyAdvice.innerHTML = `Healthy weight for your height: <strong>${minLbs} lbs – ${maxLbs} lbs</strong>`;
    }
  }

  const WATER_LOG_KEY = 'dailymate_water_logged';

  function initWaterTracker() {
    renderWaterGoal();
  }

  function renderWaterGoal() {
    const weight = parseFloat(el.waterWeight.value) || 70;
    const activity = el.waterActivity.value;

    let multiplier = 35;
    if (activity === 'moderate') multiplier = 40;
    if (activity === 'active') multiplier = 48;

    const totalMl = weight * multiplier;
    const liters = (totalMl / 1000).toFixed(1);
    const totalGlasses = Math.round(totalMl / 250);

    el.waterTargetLiters.textContent = `${liters} Liters (approx ${totalGlasses} glasses)`;

    renderCupsGrid(totalGlasses);
  }

  function getLoggedGlassesToday() {
    try {
      const stored = localStorage.getItem(WATER_LOG_KEY);
      if (!stored) return 0;
      const data = JSON.parse(stored);
      const today = new Date().toISOString().split('T')[0];
      if (data.date === today) return data.count || 0;
    } catch (e) {}
    return 0;
  }

  function saveLoggedGlasses(count) {
    try {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(WATER_LOG_KEY, JSON.stringify({ date: today, count }));
    } catch (e) {}
  }

  function renderCupsGrid(targetCups) {
    if (!el.glassesGrid) return;
    const currentLogged = getLoggedGlassesToday();

    const cupsHTML = [];
    const displayCount = Math.max(8, Math.min(15, targetCups));

    for (let i = 1; i <= displayCount; i++) {
      const isFilled = i <= currentLogged;
      cupsHTML.push(`
        <button class="cup-btn ${isFilled ? 'filled' : ''}" data-cup="${i}" title="Glass #${i} (250ml)">
          ${isFilled ? '💧' : `${i}`}
        </button>
      `);
    }

    el.glassesGrid.innerHTML = cupsHTML.join('');
    el.waterLoggedLabel.textContent = `${currentLogged} of ${targetCups} glasses drunk today`;

    el.glassesGrid.querySelectorAll('.cup-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cupNum = parseInt(btn.getAttribute('data-cup'), 10);
        let newLogged = cupNum;
        if (cupNum === currentLogged) newLogged = cupNum - 1;
        saveLoggedGlasses(newLogged);
        renderCupsGrid(targetCups);
        if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast(`Logged ${newLogged} glasses of water!`, 'info');
      });
    });
  }

  function resetWaterTracker() {
    saveLoggedGlasses(0);
    renderWaterGoal();
    if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('Water log reset for today', 'info');
  }

  function calculateTDEE() {
    const age = parseInt(el.tdeeAge.value, 10) || 25;
    const gender = el.tdeeGender.value;
    const actFactor = parseFloat(el.tdeeActivity.value) || 1.375;
    const weightKg = parseFloat(el.waterWeight ? el.waterWeight.value : 70) || 70;
    const heightCm = parseFloat(el.bmiHeightMetric ? el.bmiHeightMetric.value : 175) || 175;

    let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
    bmr += gender === 'male' ? 5 : -161;

    const tdee = Math.round(bmr * actFactor);
    const loss = Math.max(1200, tdee - 500);
    const gain = tdee + 300;

    el.tdeeMaintain.textContent = `${tdee.toLocaleString()} kcal`;
    el.tdeeLoss.textContent = `${loss.toLocaleString()} kcal`;
    el.tdeeGain.textContent = `${gain.toLocaleString()} kcal`;
  }

  function calculateTip() {
    const bill = parseFloat(el.tipBillAmount.value) || 0;
    let tipPct = 15;

    const activePreset = document.querySelector('.tip-preset-grid .btn-tip-preset.active');
    if (activePreset) {
      tipPct = parseFloat(activePreset.getAttribute('data-pct'));
    }
    if (el.tipCustomPct && el.tipCustomPct.value) {
      tipPct = parseFloat(el.tipCustomPct.value) || 0;
    }

    const people = Math.max(1, parseInt(el.tipPeopleCount.value, 10) || 1);

    const tipTotal = bill * (tipPct / 100);
    const grandTotal = bill + tipTotal;
    const perPersonTotal = grandTotal / people;
    const perPersonTip = tipTotal / people;
    const perPersonBase = bill / people;

    el.tipPerPerson.textContent = formatCurrency(perPersonTotal);
    el.tipBaseBill.textContent = formatCurrency(bill);
    el.tipTotalVal.textContent = formatCurrency(tipTotal);
    el.tipGrandTotal.textContent = formatCurrency(grandTotal);

    el.tipPerPersonTip.textContent = formatCurrency(perPersonTip);
    el.tipPerPersonBase.textContent = formatCurrency(perPersonBase);
  }

  function calculateDiscount() {
    const original = parseFloat(el.discOriginalPrice.value) || 0;
    const discPct = parseFloat(el.discPercent.value) || 0;
    const taxPct = parseFloat(el.discTaxPercent.value) || 0;

    const savedAmount = original * (discPct / 100);
    const discountedPrice = Math.max(0, original - savedAmount);
    const taxAmount = discountedPrice * (taxPct / 100);
    const finalPrice = discountedPrice + taxAmount;

    el.discFinalPrice.textContent = formatCurrency(finalPrice);
    el.discOrigDisplay.textContent = formatCurrency(original);
    el.discSavedVal.textContent = `-${formatCurrency(savedAmount)}`;
    el.discTaxVal.textContent = `+${formatCurrency(taxAmount)}`;
    el.discSavingsBadge.textContent = `You Save ${formatCurrency(savedAmount)}!`;
  }

  function calculateAge() {
    const birthVal = el.dateBirthInput.value;
    const compareVal = el.dateCompareInput.value || new Date().toISOString().split('T')[0];

    if (!birthVal || !compareVal) return;

    const bDate = new Date(birthVal);
    const cDate = new Date(compareVal);

    if (bDate > cDate) {
      el.ageHeroText.textContent = 'Birthdate cannot be in the future!';
      return;
    }

    let years = cDate.getFullYear() - bDate.getFullYear();
    let months = cDate.getMonth() - bDate.getMonth();
    let days = cDate.getDate() - bDate.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(cDate.getFullYear(), cDate.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    el.ageHeroText.textContent = `${years} Years, ${months} Months, ${days} Days`;

    const diffMs = cDate - bDate;
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = (years * 12) + months;
    const totalHours = totalDays * 24;

    el.ageTotalMonths.textContent = totalMonths.toLocaleString();
    el.ageTotalWeeks.textContent = totalWeeks.toLocaleString();
    el.ageTotalDays.textContent = totalDays.toLocaleString();
    el.ageTotalHours.textContent = totalHours.toLocaleString();

    const nextBday = new Date(cDate.getFullYear(), bDate.getMonth(), bDate.getDate());
    if (nextBday < cDate) {
      nextBday.setFullYear(cDate.getFullYear() + 1);
    }
    const daysUntilNext = Math.ceil((nextBday - cDate) / (1000 * 60 * 60 * 24));
    if (daysUntilNext === 0) {
      el.nextBirthdayText.textContent = '🎉 Happy Birthday! It is your birthday today!';
    } else {
      el.nextBirthdayText.textContent = `Your next birthday is in ${daysUntilNext} day${daysUntilNext === 1 ? '' : 's'}!`;
    }
  }

  function initUnitConverter() {
    populateUnitSelects();
  }

  function populateUnitSelects() {
    const cat = el.unitCategory.value;
    const data = UNIT_DATA[cat];
    if (!data) return;

    const units = Object.keys(data.units);
    el.unitSelectFrom.innerHTML = units.map((u, i) => `<option value="${u}" ${i === 0 ? 'selected' : ''}>${u}</option>`).join('');
    el.unitSelectTo.innerHTML = units.map((u, i) => `<option value="${u}" ${i === 1 ? 'selected' : ''}>${u}</option>`).join('');

    convertUnits();
  }

  function convertUnits() {
    const cat = el.unitCategory.value;
    const valFrom = parseFloat(el.unitValFrom.value) || 0;
    const fromUnit = el.unitSelectFrom.value;
    const toUnit = el.unitSelectTo.value;
    const data = UNIT_DATA[cat];

    if (!data) return;

    if (data.isTemp) {
      const fromType = data.units[fromUnit];
      const toType = data.units[toUnit];
      let celsius = valFrom;

      if (fromType === 'F') celsius = (valFrom - 32) * (5 / 9);
      else if (fromType === 'K') celsius = valFrom - 273.15;

      let result = celsius;
      if (toType === 'F') result = (celsius * (9 / 5)) + 32;
      else if (toType === 'K') result = celsius + 273.15;

      el.unitValTo.value = parseFloat(result.toFixed(4));
    } else {
      const factorFrom = data.units[fromUnit];
      const factorTo = data.units[toUnit];
      const baseVal = valFrom * factorFrom;
      const result = baseVal / factorTo;

      el.unitValTo.value = parseFloat(result.toFixed(6));
    }
  }

  function swapUnits() {
    const temp = el.unitSelectFrom.value;
    el.unitSelectFrom.value = el.unitSelectTo.value;
    el.unitSelectTo.value = temp;
    convertUnits();
  }

  function generatePassword() {
    const length = parseInt(el.pwdLengthSlider.value, 10) || 16;
    const incUpper = el.pwdIncUpper.checked;
    const incLower = el.pwdIncLower.checked;
    const incNum = el.pwdIncNum.checked;
    const incSym = el.pwdIncSym.checked;

    let charset = '';
    if (incUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (incLower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (incNum) charset += '0123456789';
    if (incSym) charset += '!@#$%^&*()_+~|}{[]:;?><,.-=';

    if (!charset) {
      el.pwdOutput.value = 'Select at least one option';
      return;
    }

    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);

    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }

    el.pwdOutput.value = password;
    evaluatePasswordStrength(password);
  }

  function evaluatePasswordStrength(pwd) {
    let score = 0;
    if (pwd.length >= 10) score += 1;
    if (pwd.length >= 16) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    let text = 'Weak';
    let cls = 'strength-weak';
    let pct = 30;

    if (score >= 4 && pwd.length >= 14) {
      text = 'Very Strong';
      cls = 'strength-strong';
      pct = 100;
    } else if (score >= 3 && pwd.length >= 10) {
      text = 'Strong';
      cls = 'strength-strong';
      pct = 75;
    } else if (score >= 2) {
      text = 'Medium';
      cls = 'strength-medium';
      pct = 50;
    }

    el.strengthLabel.textContent = `Strength: ${text}`;
    el.strengthLabel.className = `strength-text ${cls === 'strength-strong' ? 'text-success' : cls === 'strength-medium' ? 'text-warning' : 'text-danger'}`;
    el.strengthBarFill.style.width = `${pct}%`;
    el.strengthBarFill.className = `strength-bar-fill ${cls}`;
  }

  function copyPassword() {
    const pwd = el.pwdOutput.value;
    if (!pwd || pwd.startsWith('Select')) return;

    navigator.clipboard.writeText(pwd).then(() => {
      if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('Password copied to clipboard!', 'success');
    }).catch(() => {
      if (typeof DailyMateApp !== 'undefined') DailyMateApp.showToast('Unable to copy automatically.', 'error');
    });
  }

  function formatCurrency(val) {
    return '$' + (val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return {
    init,
    switchCalcTab
  };
})();

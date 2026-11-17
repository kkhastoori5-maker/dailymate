# DailyMate ⚡ - Everyday Utility Suite

> **DailyMate** is a responsive, modern, privacy-first everyday utility web application built using **only standard HTML5, CSS3, and Vanilla JavaScript**.

No bundlers, no heavy frameworks, and zero server-side processing required. Every single computation runs securely inside the user's browser.

---

## 🌟 Key Features & Utilities Included

### 1. 📱 QR Code Studio (`qr-tool.js`)
* **Multi-Format Generators**:
  * **Website / URL**: Generates direct browser-launching QR codes.
  * **Wi-Fi Network**: Supports WPA/WPA2/WPA3, WEP, Open networks, and hidden SSIDs. Guests can connect with their phone camera with zero typing.
  * **vCard Business Card**: Encodes First/Last Name, Phone, Email, Company, and Title.
  * **Email & SMS**: Pre-fills recipients, subjects, and text bodies.
  * **Plain Text**: Arbitrary text, notes, or secret codes.
* **Custom Styling**:
  * Real-time color pickers for Foreground and Background with quick preset palettes.
  * Error correction levels: L (7%), M (15%), Q (25%), H (30% - best for stamped icons).
  * Center logo / emoji stamp overlay (Pro feature).
  * Resolution switcher: 256px, 512px, and 1024px Ultra-HD.
* **Actions**:
  * Download as high-resolution PNG.
  * Download as vector SVG.
  * Copy directly to clipboard (`navigator.clipboard.write`).
  * Instant print layout.
  * Local history log of recent QR codes with 1-click restore.

### 2. 🖼️ Image & PDF Studio (`image-pdf-tool.js`)
* **Image Resizer & Compressor**:
  * Drag-and-drop file upload with support for PNG, JPG, and WebP.
  * Custom pixel dimensions with aspect ratio lock toggle.
  * Quick scale presets (25%, 50%, 75%, 100%, 150%).
  * Target format selection (JPEG, PNG, WebP) and quality slider (10% to 100%).
  * Real-time byte calculation showing original size, optimized size, and exact percentage saved (`-X% Saved`).
* **Photo Filters & Transformations**:
  * 90° Clockwise / Counter-clockwise rotation, horizontal and vertical flips.
  * One-click presets: *Vintage 1970*, *B&W Noir*, *Vivid Color*, *Golden Hour*, *Nordic Cool*, *Dramatic*, and *Normal*.
  * Fine-tuning sliders: Brightness, Contrast, Saturation, Sepia Warmth, and Soft Blur.
  * Instant canvas download.
* **Multi-Image to PDF Maker**:
  * Drag & drop multiple images simultaneously.
  * Page reordering (Move Up / Move Down) and page deletion.
  * Customizable page format (A4, Letter), orientation (Portrait, Landscape), and margins (None, 10mm, 20mm).
  * Multi-page PDF generation via jsPDF with zero server uploads.
* **Text Note / Memo to PDF Generator**:
  * Invoice, Meeting Memo, and Blank templates.
  * Professional formatted PDF output with headers, dates, and clean print styles.

### 3. 💰 Personal Budget Planner (`budget-tool.js`)
* **Real-Time Financial Metrics**:
  * Total Income, Total Expenses, Net Savings Balance, and Savings Rate (%).
* **Monthly Spending Cap & Threshold Bar**:
  * Set a monthly spending goal.
  * Color-coded progress bar: Green (Safe <80%), Yellow (Warning 80-100%), Red (Budget Exceeded >100%).
* **Interactive Category Breakdown Chart**:
  * Custom HTML5 Canvas doughnut chart displaying category expenses with center total.
  * Color-coded breakdown legend with amounts and percentage shares.
* **Transactions Ledger**:
  * Add, edit, and delete transactions with Date, Description, Category, Amount, and Payment Method.
  * Instant search filter and dropdown filters (All, Income, Expense, Category).
* **Data Portability**:
  * Automatically persists in browser `localStorage`.
  * **Export to CSV** (Excel compatible).
  * **JSON Backup & Import** for device syncing.
  * One-click **"Load Sample Data"** button to immediately explore.

### 4. 🧮 Daily Calculators Suite (`calculators.js`)
* **Loan & EMI Calculator**:
  * Inputs with synchronized sliders for Loan Amount, Annual Interest Rate, and Tenure.
  * Calculates Monthly EMI, Total Interest Payable, and Total Amount to Pay.
  * Visual Principal vs. Interest percentage distribution bar.
  * Year-by-year amortization schedule preview table.
* **Health & Fitness Hub**:
  * **BMI Calculator**: Metric (cm, kg) vs Imperial (ft/in, lbs) toggle, category badge, healthy weight range advice, and 4-zone color gauge with animated needle.
  * **Daily Water Hydration Tracker**: Calculates daily target in liters and glasses based on body weight and activity. Features an interactive clickable cup tracker with daily local storage.
  * **Calorie & TDEE Calculator**: Computes Basal Metabolic Rate (BMR), Total Daily Energy Expenditure (TDEE), weight loss deficit, and muscle gain surplus.
* **Finance & Shopping Utilities**:
  * **Tip & Bill Splitter**: Bill amount, preset tips (10%, 15%, 18%, 20%, 25%, Custom), and friend count with steppers. Computes total tip, grand total, and per-person cost.
  * **Discount & Sales Tax**: Original price, discount %, and sales tax %. Displays final price and total savings.
* **Everyday Tools**:
  * **Age & Date Difference**: Calculates exact chronological age in years, months, and days, total elapsed hours/days, and next birthday countdown.
  * **Universal Unit Converter**: Bidirectional converter for Length, Weight, Temperature, and Speed with quick unit swap.
  * **Secure Password Generator**: Configurable character sets, length slider (8 to 36), entropy strength meter, and copy button.

---

## 💎 Free vs. Pro Monetization Model

DailyMate is designed with a realistic, ethical monetization architecture:
1. **Free Tier**:
   - Access to all core utilities with standard limits.
   - Non-intrusive, tasteful sponsor banners and ad slots.
2. **Pro Tier ($3.99/mo or $29/year)**:
   - 100% Ad-Free Experience (all `.free-ad` units hidden).
   - 1024px Ultra-HD QR exports & center logo stamping.
   - High DPI PDF rasterization.
3. **Interactive Pro Simulator**:
   - Includes a **"Toggle Pro Mode (Demo)"** switch in the Pro modal, header, and footer.
   - Anyone reviewing or testing the website can toggle between Free (with ads) and Pro (ad-free) with a single click.

---

## 🎨 Design & User Experience Highlights

* **Dark & Light Mode**: Seamless theme switching with system preference detection and localStorage persistence.
* **Global Command Palette (`Ctrl + K` / `Cmd + K`)**: Instant search overlay to jump to any tool or calculator with keyboard navigation.
* **Mobile-First Responsive Layout**: Slide-out navigation drawer and sticky bottom navigation bar on mobile devices (<768px).
* **Toast Notification Hub**: Floating confirmation badges for copy, download, and save events.
* **Privacy Guarantee**: 100% of processing occurs in-browser. No user images, budgets, or passwords are ever transmitted to an external server.

---

## 📂 Project Structure

```
dailymates web/
├── index.html            # Main semantic HTML structure & modals
├── css/
│   └── styles.css        # Clean CSS design tokens, light/dark themes, responsive layout
├── js/
│   ├── app.js            # Core router, theme manager, Pro simulator, search palette, toasts
│   ├── qr-tool.js        # QR Code generator, styles, downloads, history
│   ├── image-pdf-tool.js # Resizer, compressor, photographic filters, PDF generators
│   ├── budget-tool.js    # Budget tracking, canvas doughnut chart, CSV/JSON export
│   └── calculators.js    # EMI, BMI, Water, TDEE, Tip, Discount, Age, Converter, Password
└── README.md             # Documentation and usage guide
```

---

## 🚀 How to Run the Website

Simply open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari):

* **Directly in browser**: Double-click `index.html` or drag it into your browser window.
* **Using a local server (optional)**:
  ```bash
  # Using Node.js
  npx serve .
  
  # Or using Python
  python -m http.server 8080
  ```
  Then open `http://localhost:8080`.

# Volunteer Motivation Dashboard

**"Why Do We Volunteer? Motivations & Barriers among Indian Students and Early-Career Professionals"**

A production-quality, responsive web dashboard that analyses Google Form responses using the adapted Volunteer Functions Inventory (VFI, Clary et al., 1998).

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Run unit tests
npm test

# 4. Build for production
npm run build
```

---

## Connecting Your Google Sheet

The dashboard ships with 150-respondent **demo data** by default. To connect real responses:

### Option A: Publish to CSV (simplest)

1. Open your Google Sheet (Form → Responses → View in Sheets)
2. **File → Share → Publish to web**
3. Select the response sheet → choose **CSV** format → click **Publish**
4. Copy the URL
5. Open `src/config.js` and set:
   ```js
   export const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/...output=csv';
   ```

> ⚠️ The CSV URL is public — anyone with it can download the raw data. Use the Apps Script option for access control.

### Option B: Apps Script JSON Endpoint (recommended)

The included `apps-script/Code.gs` automatically **drops all PII columns** (name, email, phone) before returning data.

1. Open your Google Sheet → **Extensions → Apps Script**
2. Paste the entire contents of `apps-script/Code.gs`, replacing existing code
3. Click **Deploy → New deployment → Web App**
   - Execute as: **Me**
   - Who has access: **Anyone** (or restrict to your domain)
4. Copy the deployment URL
5. Open `src/config.js` and set:
   ```js
   export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/.../exec';
   ```

> Apps Script takes priority over the CSV URL if both are set.

---

## Column Matching

The dashboard matches Google Sheet column headers to internal keys by **normalising** them (trim, lowercase, collapse spaces, strip trailing `*` and punctuation) and using `startsWith` matching.

This means:
- Column headers can be slightly different from the config patterns (truncated, decorated with `*`, etc.)
- The form's full question text becomes the column header — matching works without renaming
- If a column can't be matched, it appears on the **Data & Setup** page under "Unmatched columns"

To customise matching, edit `COLUMN_MAP` in `src/config.js`.

---

## Privacy

- **No names or emails are ever ingested or displayed.** The Apps Script endpoint drops PII before transmitting.
- Only aggregate statistics are shown.
- Subgroups with **n < 5** are suppressed (configurable via `MIN_N_DISPLAY` in `src/config.js`).
- No data is stored — the app is entirely client-side.

---

## Deployment (Static Site)

```bash
npm run build
# Deploy the dist/ folder to Vercel, Netlify, or GitHub Pages
```

Add `base: '/your-repo-name/'` to `vite.config.js` if deploying to a subdirectory.

---

## Project Structure

```
src/
├── config.js              ← SHEET_CSV_URL, COLUMN_MAP, ITEMS array, BARRIERS
├── main.jsx
├── App.jsx                ← Layout, sidebar, filter bar, dark mode
├── index.css              ← Tailwind + custom classes
├── components/
│   ├── Sidebar.jsx
│   ├── FilterBar.jsx
│   ├── SkeletonLoader.jsx
│   └── ChartComponents.jsx
├── data/
│   ├── DataContext.jsx    ← Global state, auto-refresh, filters
│   ├── dataLoader.js      ← Fetch CSV/JSON, normalise, privacy filter
│   └── demoData.js        ← 150 generated respondents
├── hooks/
│   └── useAnalytics.js    ← All statistics derived from filtered rows
├── utils/
│   ├── stats.js           ← Pure stat functions
│   └── stats.test.js      ← Vitest unit tests
└── pages/
    ├── Overview.jsx
    ├── RespondentProfile.jsx
    ├── MotivationFunctions.jsx
    ├── QuestionWise.jsx
    ├── VolunteeringBehaviour.jsx
    ├── Barriers.jsx
    ├── SubgroupComparison.jsx
    ├── Methodology.jsx
    └── DataSetup.jsx
apps-script/
└── Code.gs
```

---

## Known Limitations

- **Sample size**: Results with n < 30 should be interpreted cautiously.
- **Self-report bias**: Ratings may not reflect actual volunteering behaviour.
- **Western instrument**: The VFI was developed in a US context.
- **Cross-sectional design**: No causality can be inferred from correlations.
- **2-item Values scale**: Cronbach's α less stable; Spearman-Brown shown instead.

---

*Adapted from Clary et al. (1998). Journal of Personality and Social Psychology, 74(6), 1516–1530.*

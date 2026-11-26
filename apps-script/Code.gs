// apps-script/Code.gs
// Deploy this as a Google Apps Script Web App to serve your sheet data as JSON.
// Steps:
// 1. Open your Google Sheet → Extensions → Apps Script
// 2. Paste this entire file, replacing any existing code.
// 3. Click Deploy → New deployment → Web App
// 4. Execute as: Me | Who has access: Anyone
// 5. Copy the web app URL into src/config.js as APPS_SCRIPT_URL

/** Columns to drop for privacy (case-insensitive, partial match) */
const PII_COLUMNS = ['full name', 'name', 'email', 'e-mail', 'phone', 'mobile'];

function isPII(header) {
  const h = header.toLowerCase().trim();
  return PII_COLUMNS.some(p => h === p || h.includes(p));
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    // Use the first sheet, or the sheet named 'Form Responses 1'
    let sheet = ss.getSheetByName('Form Responses 1') || ss.getSheets()[0];
    const data = sheet.getDataRange().getValues();
    
    if (data.length < 2) {
      return ContentService
        .createTextOutput(JSON.stringify({ headers: [], rows: [], n: 0 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const rawHeaders = data[0];
    
    // Filter out PII columns, record their indices
    const keepIndices = [];
    const headers = [];
    rawHeaders.forEach((h, i) => {
      if (!isPII(String(h))) {
        keepIndices.push(i);
        headers.push(String(h));
      }
    });
    
    // Build rows (skip header row, skip fully empty rows)
    const rows = [];
    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      const filtered = keepIndices.map(i => {
        const v = row[i];
        // Format dates as ISO strings
        if (v instanceof Date) return v.toISOString();
        return v === null || v === undefined ? '' : String(v);
      });
      // Skip completely blank rows
      if (filtered.some(v => v !== '')) {
        rows.push(filtered);
      }
    }
    
    const result = JSON.stringify({ headers, rows, n: rows.length });
    return ContentService
      .createTextOutput(result)
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


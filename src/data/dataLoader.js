// dataLoader.js — fetch, parse, normalise, and privacy-filter sheet data

import Papa from 'papaparse';
import { COLUMN_MAP, ITEMS, BARRIERS, FREQ_OPTIONS } from '../config.js';

// ── Column normalisation ──────────────────────────────────────────────────────
export function normalise(str) {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[*]+$/, '')          // trailing asterisk
    .replace(/[?!.:,;]+$/, '');   // trailing punctuation
}

/** Privacy: columns to drop (names, emails) */
const PII_PATTERNS = [
  'full name', 'name', 'email', 'e-mail', 'phone', 'mobile',
  'your name', 'student name', 'participant name',
];

export function isPII(header) {
  const n = normalise(header);
  return PII_PATTERNS.some(p => n === p || n.includes(p));
}

// ── Match a sheet header to a config key ──────────────────────────────────────
export function matchColumn(header, colMap) {
  const norm = normalise(header);
  for (const [key, pattern] of Object.entries(colMap)) {
    if (norm.startsWith(normalise(pattern))) return key;
  }
  return null;
}

// ── Map a barrier answer string to a barrier id ───────────────────────────────
function matchBarrier(val, barriers) {
  if (!val) return null;
  const trimmed = val.trim();
  // Leading number prefix: "1. ..." → prefix "1"
  const prefixMatch = trimmed.match(/^(\d+)\./);
  if (prefixMatch) {
    const prefix = prefixMatch[1];
    const b = barriers.find(b => b.prefix === prefix);
    if (b) return b.id;
  }
  // Fallback: startsWith normalised text
  const norm = normalise(trimmed);
  for (const b of barriers) {
    if (norm.startsWith(normalise(b.text))) return b.id;
  }
  return null;
}

// ── Map freq label → numeric value ───────────────────────────────────────────
function mapFreq(val) {
  if (!val) return null;
  const norm = normalise(val);
  for (const opt of FREQ_OPTIONS) {
    if (norm.startsWith(normalise(opt.label))) return opt.value;
  }
  // Plain numeric
  const n = parseInt(val, 10);
  if (!isNaN(n) && n >= 1 && n <= 5) return n;
  return null;
}

// ── Parse a single sheet row into a normalised record ─────────────────────────
export function parseRow(raw, headerMap) {
  const record = { _raw: true };

  // Timestamp
  const tsKey = headerMap['TIMESTAMP'];
  record._timestamp = tsKey ? raw[tsKey] : null;

  // Demographics
  record._age    = raw[headerMap['AGE']]    ?? null;
  record._gender = raw[headerMap['GENDER']] ?? null;
  record._status = raw[headerMap['STATUS']] ?? null;
  record._ever   = raw[headerMap['EVER']]   ?? null;
  record._freq   = raw[headerMap['FREQ']]   ?? null;
  record._freqNum = mapFreq(record._freq);

  // VFI items
  for (const item of ITEMS) {
    const col = headerMap[item.id];
    if (col === undefined) {
      record[item.id] = NaN;
      continue;
    }
    const v = parseInt(raw[col], 10);
    record[item.id] = (v >= 1 && v <= 6) ? v : NaN;
  }

  // Barriers
  const r1Col = headerMap['RANK1'];
  const r2Col = headerMap['RANK2'];
  record._rank1Label = r1Col ? raw[r1Col] : null;
  record._rank2Label = r2Col ? raw[r2Col] : null;
  record._rank1Id = matchBarrier(record._rank1Label, BARRIERS);
  record._rank2Id = matchBarrier(record._rank2Label, BARRIERS);

  return record;
}

// ── Build headerMap from sheet headers ────────────────────────────────────────
export function buildHeaderMap(headers) {
  const matched = {};   // configKey → sheetHeader
  const unmatched = []; // sheetHeaders that matched nothing
  const missing = [];   // configKeys that matched nothing

  const usedHeaders = new Set();

  for (const h of headers) {
    if (isPII(h)) continue; // skip PII silently
    const key = matchColumn(h, COLUMN_MAP);
    if (key) {
      matched[key] = h;
      usedHeaders.add(h);
    } else {
      unmatched.push(h);
    }
  }

  // Find config keys that never matched
  const allConfigKeys = [...Object.keys(COLUMN_MAP), ...ITEMS.map(i => i.id), 'RANK1', 'RANK2'];
  const uniqueKeys = [...new Set(allConfigKeys)];
  for (const key of uniqueKeys) {
    if (!matched[key]) missing.push(key);
  }

  return { matched, unmatched, missing };
}

// ── Fetch and parse CSV ───────────────────────────────────────────────────────
export async function fetchCSV(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  const text = await response.text();
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results),
      error: (err) => reject(err),
    });
  });
}

// ── Fetch and parse Apps Script JSON ─────────────────────────────────────────
export async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  const data = await response.json();
  // Expect { headers: [...], rows: [[...], ...] } or array of objects
  if (Array.isArray(data)) return data;
  if (data.rows && data.headers) {
    return data.rows.map(r => {
      const obj = {};
      data.headers.forEach((h, i) => { obj[h] = r[i]; });
      return obj;
    });
  }
  throw new Error('Unexpected JSON structure from Apps Script');
}

// ── Main loader ───────────────────────────────────────────────────────────────
export async function loadSheetData(csvUrl, appsScriptUrl) {
  let rawRows;
  let source;

  if (appsScriptUrl) {
    rawRows = await fetchJSON(appsScriptUrl);
    source = 'apps-script';
  } else if (csvUrl) {
    const parsed = await fetchCSV(csvUrl);
    rawRows = parsed.data;
    source = 'csv';
  } else {
    throw new Error('NO_URL');
  }

  if (!rawRows || rawRows.length === 0) {
    return { rows: [], headerMap: {}, matchReport: { matched: {}, unmatched: [], missing: [] }, source };
  }

  const headers = Object.keys(rawRows[0]);
  const { matched, unmatched, missing } = buildHeaderMap(headers);

  // Build headerMap: configKey → sheetHeader
  const headerMap = matched;

  const rows = rawRows
    .map(r => parseRow(r, headerMap, {}))
    .filter(r => {
      // Filter out rows that are entirely empty (no VFI scores at all)
      const hasAnyScore = ITEMS.some(item => !isNaN(r[item.id]));
      const hasDemog = r._age || r._gender || r._status;
      return hasAnyScore || hasDemog;
    });

  return {
    rows,
    headerMap,
    matchReport: { matched, unmatched, missing },
    source,
  };
}


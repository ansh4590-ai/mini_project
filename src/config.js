// ============================================================
//  config.js  –  Central configuration for the dashboard
//  Edit SHEET_CSV_URL or APPS_SCRIPT_URL to connect real data
// ============================================================

/** Publish Google Sheet to web → CSV link (File → Share → Publish to web → CSV) */
export const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSuA1dX3qpxEAjv3okFA6g7IiAVM8Dwg8ddgf8mvi6h9KyobVNw-qg_rQINX9g8x8VfVIudXyhuc66j/pub?output=csv';

/**
 * OR: deploy an Apps Script doGet endpoint (see apps-script/Code.gs)
 * This takes priority over SHEET_CSV_URL if both are set.
 */
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyezsEDl4pxZfXS9T4VR2D6c1nd26a3PHkNDftzxDaOa4YAH5x43OjhMizrQZRocx2u/exec';

/** Auto-refresh interval in milliseconds (60 s) */
export const REFRESH_INTERVAL_MS = 60_000;

/** Suppress display of any subgroup with n < this threshold */
export const MIN_N_DISPLAY = 5;

// ============================================================
//  COLUMN_MAP  –  maps internal keys → Google Sheet column headers
//  Matching is normalised (trim, lowercase, collapse spaces, strip
//  trailing * and punctuation).  Keys are matched with startsWith
//  so the form text appearing as a column header will match even
//  if truncated or decorated.
// ============================================================
export const COLUMN_MAP = {
  TIMESTAMP: 'timestamp',
  AGE:    'what is your age',
  GENDER: 'what is your gender',
  STATUS: 'what is your current status',
  EVER:   'have you ever participated in a volunteering activity',
  FREQ:   'how frequently do you participate in volunteering activities',
  // VFI items — matched by normalised startsWith
  V1: 'i feel it is important to help people',
  V2: 'i feel a sense of responsibility to give back',
  U1: 'volunteering helps me understand people',
  U2: 'i want to learn new skills through volunteering',
  U3: 'volunteering gives me a clearer understanding of real-world',
  S1: 'i volunteer because people close to me',
  S2: 'volunteering provides an opportunity to meet new people',
  S3: 'i am more likely to volunteer when it is a group',
  C1: 'volunteering helps me build skills or connections useful',
  C2: 'i would volunteer if it strengthened my resume',
  C3: 'volunteering experience gives me an advantage',
  P1: 'volunteering helps me feel less guilty',
  P2: 'i volunteer to take my mind off',
  P3: 'helping others makes me feel better about myself',
  E1: 'volunteering makes me feel good about myself',
  E2: 'i volunteer because it makes me feel needed',
  E3: 'volunteering gives me a sense of personal accomplishment',
  // Barriers
  RANK1: 'please select your most important barrier',
  RANK2: 'please select your second most important barrier',
};

// ============================================================
//  ITEMS  –  17 VFI items in form order
//  id: internal key; function: one of VALUES/UNDERSTANDING/SOCIAL/CAREER/PROTECTIVE/ENHANCEMENT
//  active: false to exclude from composite without deleting
// ============================================================
export const ITEMS = [
  // VALUES
  { id: 'V1', fn: 'VALUES', text: 'I feel it is important to help people or causes I care about, regardless of what I get in return.', active: true },
  { id: 'V2', fn: 'VALUES', text: 'I feel a sense of responsibility to give back to my community.', active: true },
  // UNDERSTANDING
  { id: 'U1', fn: 'UNDERSTANDING', text: 'Volunteering helps me understand people and situations different from my own.', active: true },
  { id: 'U2', fn: 'UNDERSTANDING', text: 'I want to learn new skills through volunteering that I cannot learn elsewhere.', active: true },
  { id: 'U3', fn: 'UNDERSTANDING', text: 'Volunteering gives me a clearer understanding of real-world social issues.', active: true },
  // SOCIAL
  { id: 'S1', fn: 'SOCIAL', text: 'I volunteer because people close to me (friends, family, colleagues) also volunteer.', active: true },
  { id: 'S2', fn: 'SOCIAL', text: 'Volunteering provides an opportunity to meet new people.', active: true },
  { id: 'S3', fn: 'SOCIAL', text: 'I am more likely to volunteer when it is a group activity rather than something I do alone.', active: true },
  // CAREER
  { id: 'C1', fn: 'CAREER', text: 'Volunteering helps me build skills or connections useful for my career.', active: true },
  { id: 'C2', fn: 'CAREER', text: 'I would volunteer if it strengthened my résumé or job applications.', active: true },
  { id: 'C3', fn: 'CAREER', text: 'Volunteering experience gives me an advantage in the job market.', active: true },
  // PROTECTIVE
  { id: 'P1', fn: 'PROTECTIVE', text: 'Volunteering helps me feel less guilty about being more fortunate than others.', active: true },
  { id: 'P2', fn: 'PROTECTIVE', text: 'I volunteer to take my mind off my own problems.', active: true },
  { id: 'P3', fn: 'PROTECTIVE', text: 'Helping others makes me feel better about myself when I am facing difficulties.', active: true },
  // ENHANCEMENT
  { id: 'E1', fn: 'ENHANCEMENT', text: 'Volunteering makes me feel good about myself.', active: true },
  { id: 'E2', fn: 'ENHANCEMENT', text: 'I volunteer because it makes me feel needed and valued.', active: true },
  { id: 'E3', fn: 'ENHANCEMENT', text: 'Volunteering gives me a sense of personal accomplishment.', active: true },
];

export const FUNCTIONS = ['VALUES', 'UNDERSTANDING', 'SOCIAL', 'CAREER', 'PROTECTIVE', 'ENHANCEMENT'];

export const FUNCTION_COLORS = {
  VALUES:       '#6366f1', // indigo
  UNDERSTANDING:'#0ea5e9', // sky
  SOCIAL:       '#10b981', // emerald
  CAREER:       '#f59e0b', // amber
  PROTECTIVE:   '#ef4444', // red
  ENHANCEMENT:  '#a855f7', // purple
};

export const FUNCTION_LABELS = {
  VALUES:       'Values',
  UNDERSTANDING:'Understanding',
  SOCIAL:       'Social',
  CAREER:       'Career',
  PROTECTIVE:   'Protective',
  ENHANCEMENT:  'Enhancement',
};

// ============================================================
//  Survey Options
// ============================================================
export const AGE_OPTIONS = ['Below 18', '18–20', '21–23', '24–26', '27–30', 'Above 30'];

export const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

export const STATUS_OPTIONS = [
  'Undergraduate Student',
  'Postgraduate Student',
  'Early-Career Professional',
  'Working Professional',
  'Other',
];

export const EVER_OPTIONS = [
  'Yes, I currently volunteer',
  'Yes, I have volunteered in the past',
  'No, I have never volunteered',
];

export const FREQ_OPTIONS = [
  { label: 'Very Frequently', value: 5 },
  { label: 'Frequently',      value: 4 },
  { label: 'Occasionally',    value: 3 },
  { label: 'Rarely',          value: 2 },
  { label: 'Never',           value: 1 },
];

export const SCALE_LABELS = {
  1: 'Not Important at All',
  2: 'Slightly Important',
  3: 'Moderately Important',
  4: 'Important',
  5: 'Very Important',
  6: 'Extremely Important',
};

// ============================================================
//  Barriers
// ============================================================
export const BARRIERS = [
  {
    id: 'B1',
    prefix: '1',
    shortLabel: 'Time constraints',
    text: 'I do not volunteer because academic, professional, or personal responsibilities leave me with insufficient time.',
  },
  {
    id: 'B2',
    prefix: '2',
    shortLabel: 'Awareness of opportunities',
    text: 'I do not know about suitable volunteering opportunities or where to find them.',
  },
  {
    id: 'B3',
    prefix: '3',
    shortLabel: 'Institutional support',
    text: 'I would volunteer more if my college/employer provided organised programmes, support, or opportunities.',
  },
  {
    id: 'B4',
    prefix: '4',
    shortLabel: 'Uncertain impact',
    text: 'I hesitate to volunteer because I am unsure whether my contribution creates meaningful change.',
  },
  {
    id: 'B5',
    prefix: '5',
    shortLabel: 'Lack of recognition',
    text: 'I am less motivated to volunteer because my contribution is not formally recognised through certificates, credentials, or professional benefits.',
  },
];


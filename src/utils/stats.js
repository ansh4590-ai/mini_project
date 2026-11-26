// ============================================================
//  stats.js  –  All statistical utilities (pure functions, no side effects)
// ============================================================

/** Arithmetic mean of a numeric array */
export function mean(arr) {
  if (!arr || arr.length === 0) return NaN;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

/** Sample standard deviation */
export function sd(arr) {
  if (!arr || arr.length < 2) return NaN;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1));
}

/** Median */
export function median(arr) {
  if (!arr || arr.length === 0) return NaN;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Mode (most frequent value; returns array of modes) */
export function mode(arr) {
  if (!arr || arr.length === 0) return [];
  const freq = {};
  arr.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
  const max = Math.max(...Object.values(freq));
  return Object.keys(freq).filter(k => freq[k] === max).map(Number);
}

/** p-th percentile (0–100) using linear interpolation */
export function percentile(arr, p) {
  if (!arr || arr.length === 0) return NaN;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (idx - lo) * (sorted[hi] - sorted[lo]);
}

/** 95% confidence interval for the mean (t-based) */
export function ci95(arr) {
  if (!arr || arr.length < 2) return { lower: NaN, upper: NaN };
  const m = mean(arr);
  const se = sd(arr) / Math.sqrt(arr.length);
  // t critical values (df → ∞ → z ≈ 1.96)
  const t = arr.length >= 30 ? 1.96 : tCritical95(arr.length - 1);
  return { lower: m - t * se, upper: m + t * se };
}

/** Look-up table for t critical value at 0.025 tail */
function tCritical95(df) {
  const TABLE = {
    1:12.706,2:4.303,3:3.182,4:2.776,5:2.571,6:2.447,7:2.365,8:2.306,9:2.262,
    10:2.228,11:2.201,12:2.179,13:2.160,14:2.145,15:2.131,16:2.120,17:2.110,
    18:2.101,19:2.093,20:2.086,25:2.060,29:2.045,
  };
  for (const k of Object.keys(TABLE).map(Number).sort((a,b) => b-a)) {
    if (df >= k) return TABLE[k];
  }
  return 1.96;
}

/** Top-box % — proportion answering 5 or 6 on a 6-point scale */
export function topBox(arr) {
  if (!arr || arr.length === 0) return NaN;
  return (arr.filter(v => v >= 5).length / arr.length) * 100;
}

/** Level-band classification on the 6-point scale */
export function levelBand(score) {
  if (score < 3.0) return 'Low';
  if (score < 4.5) return 'Moderate';
  return 'High';
}

/** Level-band counts for an array of scores */
export function levelBandCounts(arr) {
  const counts = { Low: 0, Moderate: 0, High: 0 };
  arr.forEach(v => counts[levelBand(v)]++);
  return counts;
}

// ============================================================
//  Pearson correlation (r)
// ============================================================
export function pearsonR(xs, ys) {
  if (!xs || !ys || xs.length !== ys.length || xs.length < 2) return NaN;
  const mx = mean(xs), my = mean(ys);
  let num = 0, dxSq = 0, dySq = 0;
  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i] - mx, dy = ys[i] - my;
    num += dx * dy; dxSq += dx * dx; dySq += dy * dy;
  }
  const denom = Math.sqrt(dxSq * dySq);
  return denom === 0 ? NaN : num / denom;
}

// ============================================================
//  Spearman rank correlation
// ============================================================
function ranks(arr) {
  const indexed = arr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  const r = new Array(arr.length);
  let i = 0;
  while (i < indexed.length) {
    let j = i;
    while (j < indexed.length && indexed[j].v === indexed[i].v) j++;
    const avg = (i + j + 1) / 2; // 1-based average rank
    for (let k = i; k < j; k++) r[indexed[k].i] = avg;
    i = j;
  }
  return r;
}

export function spearmanR(xs, ys) {
  if (!xs || !ys || xs.length !== ys.length || xs.length < 2) return NaN;
  return pearsonR(ranks(xs), ranks(ys));
}

// ============================================================
//  Cronbach's alpha
// ============================================================
export function cronbachAlpha(matrix) {
  // matrix: 2D array [respondents][items], each value numeric
  if (!matrix || matrix.length < 2) return NaN;
  const k = matrix[0].length;
  if (k < 2) return NaN;
  const itemArrays = Array.from({ length: k }, (_, j) => matrix.map(r => r[j]).filter(v => !isNaN(v)));
  const itemVars = itemArrays.map(a => variance(a));
  const totalScores = matrix.map(row => row.reduce((s, v) => s + (isNaN(v) ? 0 : v), 0));
  const totalVar = variance(totalScores);
  if (totalVar === 0) return NaN;
  const sumItemVars = itemVars.reduce((s, v) => s + v, 0);
  return (k / (k - 1)) * (1 - sumItemVars / totalVar);
}

function variance(arr) {
  if (!arr || arr.length < 2) return 0;
  const m = mean(arr);
  return arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1);
}

// ============================================================
//  Spearman-Brown reliability (for 2-item scales)
//  r_sb = (2 * r) / (1 + r)  where r = inter-item Pearson r
// ============================================================
export function spearmanBrown(r) {
  return (2 * r) / (1 + r);
}

// ============================================================
//  Welch two-sample t-test (unequal variances)
//  Returns { t, df, p }
// ============================================================
export function welchT(a, b) {
  if (!a || !b || a.length < 2 || b.length < 2) return { t: NaN, df: NaN, p: NaN };
  const m1 = mean(a), m2 = mean(b);
  const v1 = variance(a), v2 = variance(b);
  const n1 = a.length, n2 = b.length;
  const se = Math.sqrt(v1 / n1 + v2 / n2);
  if (se === 0) return { t: 0, df: n1 + n2 - 2, p: 1 };
  const t = (m1 - m2) / se;
  const df = (v1 / n1 + v2 / n2) ** 2 /
    ((v1 / n1) ** 2 / (n1 - 1) + (v2 / n2) ** 2 / (n2 - 1));
  const p = 2 * (1 - tCDF(Math.abs(t), df));
  return { t, df, p };
}

// ============================================================
//  One-way ANOVA
//  Returns { F, dfBetween, dfWithin, p, etaSquared }
// ============================================================
export function oneWayAnova(groups) {
  // groups: array of arrays of numbers
  const validGroups = groups.filter(g => g && g.length > 0);
  if (validGroups.length < 2) return { F: NaN, dfBetween: NaN, dfWithin: NaN, p: NaN, etaSquared: NaN };
  const allValues = validGroups.flat();
  const grandMean = mean(allValues);
  const N = allValues.length;
  const k = validGroups.length;

  const ssBetween = validGroups.reduce((s, g) => s + g.length * (mean(g) - grandMean) ** 2, 0);
  const ssWithin  = validGroups.reduce((s, g) => s + g.reduce((ss, v) => ss + (v - mean(g)) ** 2, 0), 0);
  const ssTotal   = ssBetween + ssWithin;

  const dfBetween = k - 1;
  const dfWithin  = N - k;
  // When all values are identical ssBetween = 0 and ssWithin = 0 → F = 0
  if (dfBetween === 0 || dfWithin <= 0) return { F: NaN, dfBetween, dfWithin, p: NaN, etaSquared: 0 };
  if (ssWithin === 0) return { F: 0, dfBetween, dfWithin, p: 1, etaSquared: 0 };

  const msBetween = ssBetween / dfBetween;
  const msWithin  = ssWithin / dfWithin;
  const F = msBetween / msWithin;
  const p = 1 - fCDF(F, dfBetween, dfWithin);
  const etaSquared = ssTotal > 0 ? ssBetween / ssTotal : 0;
  return { F, dfBetween, dfWithin, p, etaSquared };
}

// ============================================================
//  Weighted barrier score  (Rank1 = 2pts, Rank2 = 1pt)
// ============================================================
export function weightedBarrierScores(rows, barriers) {
  const scores = {};
  barriers.forEach(b => { scores[b.id] = { rank1: 0, rank2: 0, weighted: 0, total: 0 }; });

  rows.forEach(row => {
    const r1 = row._rank1Id;
    const r2 = row._rank2Id;
    const dupRank = r1 && r2 && r1 === r2;

    if (r1 && scores[r1]) {
      scores[r1].rank1++;
      scores[r1].weighted += 2;
      scores[r1].total++;
    }
    if (r2 && scores[r2] && !dupRank) {
      scores[r2].rank2++;
      scores[r2].weighted += 1;
      scores[r2].total++;
    }
  });
  return scores;
}

// ============================================================
//  Frequency distribution  (1–6 scale)
// ============================================================
export function freqDist(arr, min = 1, max = 6) {
  const counts = {};
  for (let i = min; i <= max; i++) counts[i] = 0;
  arr.forEach(v => { if (v >= min && v <= max) counts[v]++; });
  return counts;
}

// ============================================================
//  Numerical approximations for p-values
//  (accurate to ~3 decimal places for dashboard purposes)
// ============================================================

/** Regularised incomplete beta function (Numerical Recipes approximation) */
function betainc(x, a, b) {
  if (x < 0 || x > 1) return NaN;
  if (x === 0) return 0;
  if (x === 1) return 1;
  const lbeta = lgamma(a) + lgamma(b) - lgamma(a + b);
  const front = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - lbeta) / a;
  return front * betacf(x, a, b);
}

function betacf(x, a, b) {
  const MAXIT = 200, EPS = 3e-7;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - qab * x / qap;
  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < EPS) break;
  }
  return h;
}

function lgamma(z) {
  // Lanczos approximation
  const g = 7;
  const p = [0.99999999999980993,676.5203681218851,-1259.1392167224028,771.32342877765313,
    -176.61502916214059,12.507343278686905,-0.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];
  if (z < 0.5) return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - lgamma(1 - z);
  z -= 1;
  let x = p[0];
  for (let i = 1; i < g + 2; i++) x += p[i] / (z + i);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

/** CDF of Student's t-distribution */
function tCDF(t, df) {
  const x = df / (df + t * t);
  return 1 - 0.5 * betainc(x, df / 2, 0.5);
}

/** CDF of F-distribution */
function fCDF(f, d1, d2) {
  if (f <= 0) return 0;
  const x = d1 * f / (d1 * f + d2);
  return betainc(x, d1 / 2, d2 / 2);
}

/** Format p-value for display */
export function formatP(p) {
  if (isNaN(p)) return 'N/A';
  if (p < 0.001) return 'p < .001';
  if (p < 0.01)  return `p = ${p.toFixed(3)}`;
  return `p = ${p.toFixed(3)}`;
}

/** Format number to fixed decimal places, handling NaN */
export function fmt(val, dec = 2) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return Number(val).toFixed(dec);
}

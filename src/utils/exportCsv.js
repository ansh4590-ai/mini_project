// exportCsv.js — Generates and downloads an aggregated summary CSV
import { FUNCTIONS, FUNCTION_LABELS, ITEMS, BARRIERS } from '../config.js';
import { fmt } from './stats.js';

export function exportAggregatedSummaryCsv(analytics) {
  if (!analytics) return;

  const {
    n,
    fnData,
    itemStats,
    barrierScores,
    barrierPct,
    pctCurrent,
    pctNever,
    rankDups,
    consistencyIssues,
  } = analytics;

  const lines = [];

  // 1. Header & Meta
  lines.push(['"--- VOLUNTEER MOTIVATION DASHBOARD: AGGREGATED SUMMARY ---"']);
  lines.push(['"Instrument"', '"Adapted Volunteer Functions Inventory (VFI) & Barrier Analysis"']);
  lines.push(['"Export Timestamp"', `"${new Date().toISOString()}"`]);
  lines.push(['"Sample Size (n)"', n]);
  lines.push(['"Currently Volunteer (%)"', `"${fmt(pctCurrent, 1)}%"`]);
  lines.push(['"Never Volunteered (%)"', `"${fmt(pctNever, 1)}%"`]);
  lines.push(['"Rank 1 = Rank 2 Duplicates Excluded from Rank 2"', rankDups]);
  lines.push(['"Consistency Flags"', consistencyIssues]);
  lines.push([]);

  // 2. Motivation Functions Aggregates
  lines.push(['"=== MOTIVATION FUNCTIONS (6-POINT SCALE: 1=Not at all to 6=Extremely Important) ==="']);
  lines.push([
    '"Function ID"',
    '"Function Name"',
    '"Items Count"',
    '"Mean (M)"',
    '"Std Dev (SD)"',
    '"Median"',
    '"95% CI Lower"',
    '"95% CI Upper"',
    '"Cronbach Alpha"',
    '"Spearman-Brown (2-item)"',
    '"Top-Box % (5-6)"',
    '"Low % (1.0-2.99)"',
    '"Moderate % (3.0-4.49)"',
    '"High % (4.5-6.0)"',
  ]);

  FUNCTIONS.forEach(fn => {
    const d = fnData[fn];
    lines.push([
      `"${fn}"`,
      `"${FUNCTION_LABELS[fn]}"`,
      d.activeItems.length,
      fmt(d.mean),
      fmt(d.sd),
      fmt(d.median),
      fmt(d.ci95?.lower),
      fmt(d.ci95?.upper),
      d.alpha !== null && !isNaN(d.alpha) ? fmt(d.alpha) : 'N/A',
      d.sb !== null && !isNaN(d.sb) ? fmt(d.sb) : 'N/A',
      `${fmt(d.topBox, 1)}%`,
      `${fmt(d.bandPct?.Low, 1)}%`,
      `${fmt(d.bandPct?.Moderate, 1)}%`,
      `${fmt(d.bandPct?.High, 1)}%`,
    ]);
  });
  lines.push([]);

  // 3. Question-Wise Item Aggregates
  lines.push(['"=== QUESTION-WISE ITEM STATISTICS (17 ITEMS) ==="']);
  lines.push([
    '"Item ID"',
    '"Function"',
    '"Mean"',
    '"SD"',
    '"Median"',
    '"Top-Box %"',
    '"Question Text"',
  ]);

  ITEMS.filter(i => i.active).forEach(item => {
    const s = itemStats[item.id];
    lines.push([
      `"${item.id}"`,
      `"${FUNCTION_LABELS[item.fn]}"`,
      s ? fmt(s.mean) : '—',
      s ? fmt(s.sd) : '—',
      s ? fmt(s.median) : '—',
      s ? `${fmt(s.topBox, 1)}%` : '—',
      `"${item.text.replace(/"/g, '""')}"`,
    ]);
  });
  lines.push([]);

  // 4. Barriers Aggregates
  lines.push(['"=== BARRIERS TO VOLUNTEERING (WEIGHTED: RANK 1 = 2 PTS, RANK 2 = 1 PT) ==="']);
  lines.push([
    '"Barrier ID"',
    '"Short Label"',
    '"Rank 1 Count"',
    '"Rank 2 Count (Valid)"',
    '"Weighted Score"',
    '"Selected in Either Rank %"',
    '"Full Statement"',
  ]);

  BARRIERS.forEach(b => {
    const sc = barrierScores[b.id] || { rank1: 0, rank2: 0, weighted: 0 };
    const pct = barrierPct[b.id] || 0;
    lines.push([
      `"${b.id}"`,
      `"${b.shortLabel}"`,
      sc.rank1,
      sc.rank2,
      sc.weighted,
      `${fmt(pct, 1)}%`,
      `"${b.text.replace(/"/g, '""')}"`,
    ]);
  });
  lines.push([]);
  lines.push(['"Note: Responses are completely anonymous and exported in aggregate form only."']);

  const csvContent = lines.map(row => row.join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VFI_Aggregated_Summary_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


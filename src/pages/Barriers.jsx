// Barriers.jsx — Barrier analysis page
import React, { useMemo } from 'react';
import { useAnalytics } from '../hooks/useAnalytics.js';
import {
  BARRIERS, FUNCTIONS, FUNCTION_LABELS, FUNCTION_COLORS,
  ITEMS, MIN_N_DISPLAY,
} from '../config.js';
import {
  BarrierRankedBar,
  BarrierStackedBar,
} from '../components/ChartComponents.jsx';
import BorderBeam from '../components/magicui/BorderBeam.jsx';
import TiltCard from '../components/TiltCard.jsx';

// ── History group definitions ─────────────────────────────────────────────────
const HISTORY_GROUPS = [
  { key: 'Currently volunteers', color: '#6366f1' },
  { key: 'Volunteered in past',  color: '#0ea5e9' },
  { key: 'Never volunteered',    color: '#10b981' },
];

// ── Pure helpers ──────────────────────────────────────────────────────────────
/** Compute composite score for a single row on a given function */
function rowComposite(row, fn) {
  const activeItems = ITEMS.filter(it => it.fn === fn && it.active);
  const vals = activeItems
    .map(it => row[it.id])
    .filter(v => v !== null && v !== undefined && !isNaN(Number(v)))
    .map(Number);
  return vals.length >= Math.ceil(activeItems.length / 2)
    ? vals.reduce((a, b) => a + b, 0) / vals.length
    : NaN;
}

/** Arithmetic mean of a numeric array, NaN if empty */
function arrMean(arr) {
  const valid = arr.filter(v => !isNaN(v));
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : NaN;
}

function SectionHeading({ id, children }) {
  return (
    <h2 id={id} className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-3">
      {children}
    </h2>
  );
}

function EmptyState({ message = 'No data available.' }) {
  return (
    <div className="card text-center py-16 text-slate-400" role="status">
      {message}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Barriers() {
  const analytics = useAnalytics();

  // Sorted barrier chart data (by weighted desc)
  const sortedBarrierData = useMemo(() => {
    if (!analytics) return [];
    return BARRIERS
      .map(b => ({
        shortLabel: b.shortLabel,
        text:       b.text,
        weighted:   analytics.barrierScores[b.id]?.weighted ?? 0,
        rank1:      analytics.barrierScores[b.id]?.rank1    ?? 0,
        rank2:      analytics.barrierScores[b.id]?.rank2    ?? 0,
        pct:        analytics.barrierPct[b.id]              ?? 0,
        id:         b.id,
      }))
      .sort((a, b) => b.weighted - a.weighted);
  }, [analytics]);

  // Sorted by pct for Section 4
  const sortedByPct = useMemo(
    () => [...sortedBarrierData].sort((a, b) => b.pct - a.pct),
    [sortedBarrierData],
  );

  // Section 5: mean function scores by Rank1 barrier group
  const crossTable = useMemo(() => {
    if (!analytics) return [];
    return BARRIERS.map(barrier => {
      const groupRows = analytics.rows.filter(r => r._rank1Id === barrier.id);
      const n = groupRows.length;
      const fnMeans = {};
      FUNCTIONS.forEach(fn => {
        if (n < MIN_N_DISPLAY) {
          fnMeans[fn] = null;
          return;
        }
        const scores = groupRows.map(r => rowComposite(r, fn)).filter(v => !isNaN(v));
        fnMeans[fn] = scores.length >= MIN_N_DISPLAY ? arrMean(scores) : null;
      });
      return { barrier, n, fnMeans };
    });
  }, [analytics]);

  // Section 6: top barrier by history group
  const topBarrierByHistory = useMemo(() => {
    if (!analytics) return [];
    return HISTORY_GROUPS.map(hg => {
      const grp = analytics.historyGroups[hg.key] ?? [];
      const counts = {};
      grp.forEach(r => {
        if (r._rank1Id) counts[r._rank1Id] = (counts[r._rank1Id] || 0) + 1;
      });
      const topId      = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
      const topBarrier = BARRIERS.find(b => b.id === topId);
      return { ...hg, topBarrier, count: counts[topId] ?? 0, groupN: grp.length };
    });
  }, [analytics]);

  if (!analytics) {
    return (
      <EmptyState message="No data available yet. Apply a broader filter or connect a data source." />
    );
  }

  const { rankDups } = analytics;

  return (
    <article className="space-y-6" aria-label="Barrier analysis">

      {/* ── Section 1: Data quality card ─────────────────────────────────── */}
      <section aria-labelledby="dq-heading">
        <TiltCard glowColor={rankDups > 0 ? '#f59e0b' : '#10b981'} tiltMax={4} scale={1.01}>
          <div className="card-body">
            <SectionHeading id="dq-heading">Data Quality — Rank Duplicates</SectionHeading>
            <div className={`relative overflow-hidden flex items-start gap-3 rounded-xl border p-4 ${
              rankDups > 0
                ? 'border-amber-500/30 bg-amber-500/10'
                : 'border-emerald-500/30 bg-emerald-500/10'
            }`}>
              {rankDups > 0 && (
                <BorderBeam
                  size={140}
                  duration={10}
                  borderWidth={1.5}
                  colorFrom="#f59e0b"
                  colorTo="#ef4444"
                />
              )}
              <span className="text-2xl" aria-hidden="true">{rankDups > 0 ? '⚠️' : '✅'}</span>
              <div>
                <p className={`text-2xl font-bold mb-1 ${
                  rankDups > 0
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}>
                  {rankDups} respondent{rankDups !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-zinc-300">
                  selected the same barrier for both Rank 1 <em>and</em> Rank 2.
                  Their duplicate Rank 2 responses are{' '}
                  <strong>excluded from the weighted scoring</strong> below
                  (Rank 1 = 2 pts, Rank 2 = 1 pt).
                </p>
              </div>
            </div>
          </div>
        </TiltCard>
      </section>

      {/* ── Section 2: Weighted score ranked bar ─────────────────────────── */}
      <section aria-labelledby="weighted-heading">
        <TiltCard glowColor="#8b5cf6" tiltMax={3} scale={1.008}>
          <div className="card-body">
            <SectionHeading id="weighted-heading">
              Barrier Weighted Scores (Rank 1 = 2 pts · Rank 2 = 1 pt)
            </SectionHeading>
            <p className="text-xs text-zinc-400 mb-4">
              Barriers ranked by combined weighted score. Duplicate Rank 2 votes are excluded.
            </p>
            <BarrierRankedBar data={sortedBarrierData} height={260} />
          </div>
        </TiltCard>
      </section>

      {/* ── Section 3: Stacked bar Rank1 vs Rank2 ────────────────────────── */}
      <section aria-labelledby="stacked-heading">
        <TiltCard glowColor="#0ea5e9" tiltMax={3} scale={1.008}>
          <div className="card-body">
            <SectionHeading id="stacked-heading">Rank 1 vs Rank 2 — Raw Counts</SectionHeading>
            <p className="text-xs text-zinc-400 mb-4">
              Number of respondents who selected each barrier as their first vs second most
              important barrier to volunteering.
            </p>
            <BarrierStackedBar data={sortedBarrierData} height={260} />
          </div>
        </TiltCard>
      </section>

      {/* ── Section 4: % selected in either rank ─────────────────────────── */}
      <section aria-labelledby="pct-heading">
        <div className="card">
          <SectionHeading id="pct-heading">% of Respondents Selecting Each Barrier</SectionHeading>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Percentage who chose each barrier as either Rank 1 or Rank 2, sorted highest first.
          </p>
          <div className="space-y-2.5" role="list" aria-label="Barrier percentage bars">
            {sortedByPct.map(b => (
              <div key={b.id} className="flex items-center gap-3" role="listitem">
                <span className="w-36 shrink-0 text-xs text-slate-600 dark:text-slate-300 leading-tight">
                  {b.shortLabel}
                </span>
                <div
                  className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-4 overflow-hidden"
                  aria-hidden="true"
                >
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${Math.min(100, b.pct).toFixed(1)}%` }}
                  />
                </div>
                <span className="w-14 text-right text-xs font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                  {b.pct.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 5: Cross-analysis — function means by Rank1 barrier ───── */}
      <section aria-labelledby="cross-heading">
        <div className="card">
          <SectionHeading id="cross-heading">
            Mean Function Scores by Rank 1 Barrier Group
          </SectionHeading>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Average motivation composite (1–6) for respondents in each Rank 1 barrier group.
            Cells marked{' '}
            <span className="italic">n &lt; {MIN_N_DISPLAY}</span> are suppressed to protect
            small groups.
          </p>
          <div className="overflow-x-auto">
            <table
              className="w-full min-w-[580px] text-xs border-collapse"
              aria-label="Mean function scores by Rank 1 barrier"
            >
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-1.5 pr-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    Barrier (Rank 1 group)
                  </th>
                  <th className="text-center py-1.5 px-2 font-semibold text-slate-600 dark:text-slate-300">
                    n
                  </th>
                  {FUNCTIONS.map(fn => (
                    <th
                      key={fn}
                      className="text-right py-1.5 px-2 font-semibold whitespace-nowrap"
                      style={{ color: FUNCTION_COLORS[fn] }}
                    >
                      {FUNCTION_LABELS[fn]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {crossTable.map(({ barrier, n, fnMeans }) => (
                  <tr
                    key={barrier.id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750"
                  >
                    <td className="py-1.5 pr-3 font-medium text-slate-700 dark:text-slate-300">
                      {barrier.shortLabel}
                    </td>
                    <td className="text-center py-1.5 px-2 tabular-nums text-slate-500">
                      {n}
                    </td>
                    {FUNCTIONS.map(fn => {
                      const val = fnMeans[fn];
                      return (
                        <td
                          key={fn}
                          className={`text-right py-1.5 px-2 tabular-nums ${
                            val === null
                              ? 'text-slate-400 italic'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {val === null
                            ? `< ${MIN_N_DISPLAY}`
                            : isNaN(val)
                              ? '—'
                              : val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            Means computed from respondents who ranked that barrier first (Rank 1).
          </p>
        </div>
      </section>

      {/* ── Section 6: Top barrier by history group ───────────────────────── */}
      <section aria-labelledby="history-barrier-heading">
        <div className="card">
          <SectionHeading id="history-barrier-heading">
            Top-Weighted Barrier by Volunteering History
          </SectionHeading>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            The barrier with the most Rank 1 nominations within each volunteering history group.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {topBarrierByHistory.map(hg => (
              <div
                key={hg.key}
                className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-2"
              >
                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: hg.color }}
                >
                  {hg.key}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">n = {hg.groupN}</span>
                {hg.groupN < MIN_N_DISPLAY ? (
                  <p className="text-sm text-slate-400 italic">n too small to display</p>
                ) : hg.topBarrier ? (
                  <>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                      {hg.topBarrier.shortLabel}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {hg.topBarrier.text}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Rank 1 votes: <strong>{hg.count}</strong>
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-400 italic">No barrier data</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}

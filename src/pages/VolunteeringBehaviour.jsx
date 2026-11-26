// VolunteeringBehaviour.jsx — Volunteering status & behaviour analysis
import React, { useMemo } from 'react';
import { useAnalytics } from '../hooks/useAnalytics.js';
import { FUNCTIONS, FUNCTION_LABELS, FUNCTION_COLORS, MIN_N_DISPLAY } from '../config.js';
import { GroupedBar } from '../components/ChartComponents.jsx';
import { formatP } from '../utils/stats.js';
import TiltCard from '../components/TiltCard.jsx';

// ── History group keys and colours ───────────────────────────────────────────
const HISTORY_KEYS   = ['Currently volunteers', 'Volunteered in past', 'Never volunteered'];
const HISTORY_COLORS = ['#6366f1', '#0ea5e9', '#10b981'];

// ── Helpers ───────────────────────────────────────────────────────────────────
function interpR(r) {
  if (isNaN(r)) return '—';
  const abs = Math.abs(r);
  const dir = r >= 0 ? 'positive' : 'negative';
  const str = abs >= 0.5 ? 'strong' : abs >= 0.3 ? 'moderate' : abs >= 0.1 ? 'weak' : 'negligible';
  return `${str} ${dir}`;
}

function SectionHeading({ children }) {
  return (
    <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-3">
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
export default function VolunteeringBehaviour() {
  const analytics = useAnalytics();

  // Build grouped-bar data: each row = one function; cols = 3 history groups
  const historyChartData = useMemo(() => {
    if (!analytics) return [];
    return FUNCTIONS.map(fn => {
      const row = { label: FUNCTION_LABELS[fn] };
      analytics.fnByHistory[fn].forEach(({ label, mean, n }) => {
        row[label] = n >= MIN_N_DISPLAY && !isNaN(mean) ? parseFloat(mean.toFixed(2)) : null;
      });
      return row;
    });
  }, [analytics]);

  if (!analytics) {
    return <EmptyState message="No data available yet. Apply a broader filter or connect a data source." />;
  }

  const { fnByHistory, fnHistoryAnova, fnFreqCorr, consistencyIssues, rows } = analytics;

  // Consistency breakdown
  const neverButFreq = rows.filter(
    r => r._ever === 'No, I have never volunteered' && r._freqNum !== 1,
  ).length;
  const currentButNever = rows.filter(
    r => r._ever === 'Yes, I currently volunteer' && r._freqNum === 1,
  ).length;

  // Check all history groups for minimum n
  const allGroupsTooSmall = FUNCTIONS.every(fn =>
    fnByHistory[fn].every(g => g.n < MIN_N_DISPLAY),
  );

  return (
    <article className="space-y-6" aria-label="Volunteering behaviour analysis">

      {/* ── Section 1: Function means by history ─────────────────────────── */}
      <section aria-labelledby="history-heading">
        <TiltCard glowColor="#6366f1" tiltMax={3} scale={1.008}>
          <div className="card-body">
            <SectionHeading>
              <span id="history-heading">
                Function Mean Scores by Volunteering History
              </span>
            </SectionHeading>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Mean composite score (1–6) per motivational function, split by volunteering
            history. Groups with n &lt; {MIN_N_DISPLAY} are suppressed.
          </p>

          {allGroupsTooSmall ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic py-6 text-center">
              All subgroups have n &lt; {MIN_N_DISPLAY} — chart suppressed.
            </p>
          ) : (
            <GroupedBar
              data={historyChartData}
              keys={HISTORY_KEYS}
              colors={HISTORY_COLORS}
              height={300}
            />
          )}

          {/* ANOVA summary table */}
          <div className="mt-5 overflow-x-auto">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              One-way ANOVA — volunteering history groups
            </h3>
            <table className="w-full min-w-[360px] text-xs border-collapse" aria-label="ANOVA results by function">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-1.5 pr-4 text-slate-600 dark:text-slate-300 font-semibold">Function</th>
                  <th className="text-right py-1.5 pr-4 text-slate-600 dark:text-slate-300 font-semibold">F</th>
                  <th className="text-right py-1.5 pr-4 text-slate-600 dark:text-slate-300 font-semibold">p</th>
                  <th className="text-right py-1.5 text-slate-600 dark:text-slate-300 font-semibold">η²</th>
                </tr>
              </thead>
              <tbody>
                {FUNCTIONS.map(fn => {
                  const a = fnHistoryAnova[fn];
                  const fVal = a && !isNaN(a.F) ? a.F.toFixed(2) : '—';
                  const pVal = a && !isNaN(a.p) ? formatP(a.p) : '—';
                  const eta  = a && !isNaN(a.etaSq) ? a.etaSq.toFixed(3) : '—';
                  const sig  = a && !isNaN(a.p) && a.p < 0.05;
                  return (
                    <tr
                      key={fn}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750"
                    >
                      <td className="py-1.5 pr-4 font-medium" style={{ color: FUNCTION_COLORS[fn] }}>
                        {FUNCTION_LABELS[fn]}
                      </td>
                      <td className="text-right py-1.5 pr-4 tabular-nums">{fVal}</td>
                      <td className={`text-right py-1.5 pr-4 tabular-nums font-${sig ? 'semibold' : 'normal'} ${sig ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
                        {pVal}
                      </td>
                      <td className="text-right py-1.5 tabular-nums">{eta}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="text-xs text-zinc-400 mt-2">
              η² = eta-squared (effect size). Bold p indicates p &lt; .05.
            </p>
          </div>
        </div>
        </TiltCard>
      </section>

      {/* ── Section 2: Spearman r — frequency × function ─────────────────── */}
      <section aria-labelledby="freq-corr-heading">
        <div className="card">
          <SectionHeading>
            <span id="freq-corr-heading">
              Spearman r — Volunteering Frequency × Function Composite
            </span>
          </SectionHeading>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Spearman rank correlation between self-reported volunteering frequency
            (1 = Never … 5 = Very Frequently) and each function composite score.
            A positive r means more frequent volunteers score higher on that function.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] text-xs border-collapse" aria-label="Spearman r: frequency vs function">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-1.5 pr-4 text-slate-600 dark:text-slate-300 font-semibold">Function</th>
                  <th className="text-right py-1.5 pr-4 text-slate-600 dark:text-slate-300 font-semibold">Spearman r</th>
                  <th className="text-left py-1.5 text-slate-600 dark:text-slate-300 font-semibold">Interpretation</th>
                </tr>
              </thead>
              <tbody>
                {FUNCTIONS.map(fn => {
                  const r = fnFreqCorr[fn];
                  const rStr = isNaN(r) ? '—' : r.toFixed(3);
                  const interp = isNaN(r) ? '—' : interpR(r);
                  return (
                    <tr
                      key={fn}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750"
                    >
                      <td className="py-1.5 pr-4 font-medium" style={{ color: FUNCTION_COLORS[fn] }}>
                        {FUNCTION_LABELS[fn]}
                      </td>
                      <td className={`text-right py-1.5 pr-4 tabular-nums font-semibold ${
                        !isNaN(r) && r > 0 ? 'text-indigo-600 dark:text-indigo-400' :
                        !isNaN(r) && r < 0 ? 'text-red-500 dark:text-red-400' : ''
                      }`}>
                        {rStr}
                      </td>
                      <td className="py-1.5 text-slate-600 dark:text-slate-400 capitalize">{interp}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Section 3: Consistency flags ─────────────────────────────────── */}
      <section aria-labelledby="consistency-heading">
        <div className="card">
          <SectionHeading>
            <span id="consistency-heading">Data Consistency Flags</span>
          </SectionHeading>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Respondents whose volunteering history answer contradicts their reported
            frequency. These rows are still included in analyses but should be
            interpreted with caution.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Flag 1 */}
            <div className={`rounded-lg border p-4 ${
              neverButFreq > 0
                ? 'border-amber-300 bg-amber-50 dark:bg-amber-950 dark:border-amber-700'
                : 'border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-700'
            }`}>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1">
                Said "Never volunteered" — non-Never frequency
              </p>
              <p className={`text-3xl font-bold ${neverButFreq > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                {neverButFreq}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {neverButFreq > 0
                  ? 'respondents reported never having volunteered but selected a frequency other than "Never".'
                  : 'No contradictions detected for this flag.'}
              </p>
            </div>

            {/* Flag 2 */}
            <div className={`rounded-lg border p-4 ${
              currentButNever > 0
                ? 'border-amber-300 bg-amber-50 dark:bg-amber-950 dark:border-amber-700'
                : 'border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-700'
            }`}>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1">
                Currently volunteers — frequency "Never"
              </p>
              <p className={`text-3xl font-bold ${currentButNever > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                {currentButNever}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {currentButNever > 0
                  ? 'respondents say they currently volunteer but selected "Never" as their frequency.'
                  : 'No contradictions detected for this flag.'}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
            Total consistency issues:{' '}
            <span className="font-semibold">{consistencyIssues}</span> respondent
            {consistencyIssues !== 1 ? 's' : ''} (either flag above).
          </p>
        </div>
      </section>
    </article>
  );
}

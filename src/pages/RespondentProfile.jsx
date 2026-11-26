// RespondentProfile.jsx — Detailed demographics page
import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useData } from '../data/DataContext.jsx';
import { useAnalytics } from '../hooks/useAnalytics.js';
import {
  GENDER_OPTIONS,
  STATUS_OPTIONS,
  FREQ_OPTIONS,
  MIN_N_DISPLAY,
} from '../config.js';
import { DonutChart } from '../components/ChartComponents.jsx';
import BlurFade from '../components/magicui/BlurFade.jsx';
import TiltCard from '../components/TiltCard.jsx';

// ── Helpers ───────────────────────────────────────────────────────────────────

function countBy(rows, keyFn) {
  const counts = {};
  rows.forEach(r => {
    const k = keyFn(r) ?? 'Unknown';
    if (k) counts[k] = (counts[k] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

/**
 * Merge categories with count < threshold into an "Other / merged" group.
 */
function mergeSmall(data, threshold) {
  const large = data.filter(d => d.value >= threshold);
  const small = data.filter(d => d.value < threshold);
  if (small.length === 0) return data;
  const otherCount = small.reduce((s, d) => s + d.value, 0);
  return [...large, { name: 'Other / merged', value: otherCount }];
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return (
    <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
      {children}
    </h2>
  );
}

function CrossTabTable({ rows, rowLabels, colLabels, threshold }) {
  // Build counts[rowLabel][colLabel]
  const counts = useMemo(() => {
    const table = {};
    rowLabels.forEach(rl => {
      table[rl] = {};
      colLabels.forEach(cl => { table[rl][cl] = 0; });
    });
    rows.forEach(r => {
      const rl = r._status ?? 'Unknown';
      const cl = r._gender ?? 'Unknown';
      if (table[rl] !== undefined && table[rl][cl] !== undefined) {
        table[rl][cl]++;
      }
    });
    return table;
  }, [rows, rowLabels, colLabels]);

  const rowTotals = rowLabels.map(rl =>
    colLabels.reduce((s, cl) => s + (counts[rl]?.[cl] ?? 0), 0)
  );
  const colTotals = colLabels.map(cl =>
    rowLabels.reduce((s, rl) => s + (counts[rl]?.[cl] ?? 0), 0)
  );
  const grandTotal = rowTotals.reduce((s, v) => s + v, 0);

  return (
    <div className="overflow-x-auto">
      <table
        className="w-full min-w-[460px] text-xs border-collapse"
        aria-label="Status by Gender cross-tabulation"
      >
        <thead>
          <tr>
            <th className="text-left px-3 py-2 bg-zinc-800 text-zinc-300 font-semibold rounded-tl-xl border-b border-zinc-700">
              Status \ Gender
            </th>
            {colLabels.map(cl => (
              <th
                key={cl}
                className="px-3 py-2 bg-zinc-800 text-zinc-300 font-semibold text-center border-b border-zinc-700"
              >
                {cl}
              </th>
            ))}
            <th className="px-3 py-2 bg-zinc-800 text-zinc-300 font-semibold text-center rounded-tr-xl border-b border-zinc-700">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {rowLabels.map((rl, ri) => (
            <tr
              key={rl}
              className={ri % 2 === 0
                ? 'bg-zinc-900/80 hover:bg-zinc-800/50'
                : 'bg-zinc-800/30 hover:bg-zinc-800/50'}
            >
              <td className="px-3 py-2 text-zinc-300 font-medium border-b border-zinc-800">
                {rl}
              </td>
              {colLabels.map(cl => {
                const val = counts[rl]?.[cl] ?? 0;
                return (
                  <td
                    key={cl}
                    className="px-3 py-2 text-center border-b border-zinc-800 text-zinc-300 font-mono"
                  >
                    {val < threshold && val > 0 ? (
                      <span className="text-zinc-500 italic">{'< 5'}</span>
                    ) : val}
                  </td>
                );
              })}
              <td className="px-3 py-2 text-center border-b border-zinc-800 font-semibold text-zinc-100 font-mono">
                {rowTotals[ri]}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-slate-100 dark:bg-slate-700">
            <td className="px-2 py-1.5 font-semibold text-slate-700 dark:text-slate-300">
              Total
            </td>
            {colTotals.map((ct, ci) => (
              <td
                key={ci}
                className="px-2 py-1.5 text-center font-semibold text-slate-700 dark:text-slate-300"
              >
                {ct}
              </td>
            ))}
            <td className="px-2 py-1.5 text-center font-bold text-slate-800 dark:text-slate-200">
              {grandTotal}
            </td>
          </tr>
        </tfoot>
      </table>
      <p className="text-xs text-slate-400 mt-2 italic">
        Groups with n &lt; 5 are suppressed to protect anonymity.
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function RespondentProfile() {
  const { filteredRows, mergeSparse, setMergeSparse } = useData();
  const analytics = useAnalytics();

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!analytics) {
    return (
      <div className="card text-center py-16 text-slate-400">
        No data available.
      </div>
    );
  }

  const { n } = analytics;

  // Build raw demographic data
  const rawAge    = countBy(filteredRows, r => r._age);
  const rawGender = countBy(filteredRows, r => r._gender);
  const rawStatus = countBy(filteredRows, r => r._status);
  const rawEver   = countBy(filteredRows, r => r._ever);

  // Optionally merge small categories
  const ageData    = mergeSparse ? mergeSmall(rawAge,    MIN_N_DISPLAY) : rawAge;
  const genderData = mergeSparse ? mergeSmall(rawGender, MIN_N_DISPLAY) : rawGender;
  const statusData = mergeSparse ? mergeSmall(rawStatus, MIN_N_DISPLAY) : rawStatus;
  const everData   = mergeSparse ? mergeSmall(rawEver,   MIN_N_DISPLAY) : rawEver;

  // Volunteering frequency bar data
  const freqBarData = FREQ_OPTIONS.map(opt => ({
    label: opt.label,
    value: opt.value,
    count: filteredRows.filter(r => r._freqNum === opt.value).length,
  }));

  return (
    <div className="space-y-6">

      {/* ── Intro ── */}
      <BlurFade delay={0.05} duration={0.4}>
        <section className="card" aria-label="Sample description">
          <SectionTitle>Sample Overview</SectionTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            This page describes the demographic composition of the {n} respondents
            currently visible under your filter settings. No individual-level data
            is shown; all breakdowns use aggregated counts. Categories with fewer
            than {MIN_N_DISPLAY} respondents are suppressed or optionally merged.
          </p>
          {/* Merge toggle */}
          <label className="inline-flex items-center gap-2 mt-4 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              checked={mergeSparse}
              onChange={e => setMergeSparse(e.target.checked)}
              aria-label="Merge small categories into Other"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Merge small categories (n &lt; {MIN_N_DISPLAY}) into &ldquo;Other / merged&rdquo;
            </span>
          </label>
        </section>
      </BlurFade>

      {/* ── Donut charts ── */}
      <BlurFade delay={0.15} duration={0.4}>
        <section aria-label="Demographic donut charts">
          <SectionTitle>Demographic Breakdown</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <TiltCard glowColor="#6366f1" tiltMax={6} scale={1.02}>
              <div className="card-body"><DonutChart data={ageData} title="Age" height={240} /></div>
            </TiltCard>
            <TiltCard glowColor="#0ea5e9" tiltMax={6} scale={1.02}>
              <div className="card-body"><DonutChart data={genderData} title="Gender" height={240} /></div>
            </TiltCard>
            <TiltCard glowColor="#10b981" tiltMax={6} scale={1.02}>
              <div className="card-body"><DonutChart data={statusData} title="Status" height={240} /></div>
            </TiltCard>
            <TiltCard glowColor="#a855f7" tiltMax={6} scale={1.02}>
              <div className="card-body"><DonutChart data={everData} title="Volunteering history" height={240} /></div>
            </TiltCard>
          </div>
        </section>
      </BlurFade>

      {/* ── Volunteering frequency bar chart ── */}
      <BlurFade delay={0.25} duration={0.4}>
        <section className="card" aria-label="Volunteering frequency distribution">
          <SectionTitle>Volunteering Frequency Distribution</SectionTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            How often respondents say they participate in volunteering activities.
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={freqBarData}
              margin={{ top: 4, right: 16, left: -8, bottom: 32 }}
              aria-label="Volunteering frequency bar chart"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748b' }}
                angle={-20}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                allowDecimals={false}
                label={{ value: 'Count', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#94a3b8' }}
              />
              <Tooltip
                formatter={(val, name, props) => [
                  `${val} respondent${val !== 1 ? 's' : ''}`,
                  props.payload.label,
                ]}
                labelFormatter={label => `Frequency: ${label}`}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </BlurFade>

      {/* ── Status × Gender cross-tab ── */}
      <BlurFade delay={0.35} duration={0.4}>
        <section className="card" aria-label="Status by gender cross-tabulation">
          <SectionTitle>Status × Gender Cross-tabulation</SectionTitle>
          <CrossTabTable
            rows={filteredRows}
            rowLabels={STATUS_OPTIONS}
            colLabels={GENDER_OPTIONS}
            threshold={MIN_N_DISPLAY}
          />
        </section>
      </BlurFade>

    </div>
  );
}

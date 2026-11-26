// SubgroupComparison.jsx — Subgroup comparisons by gender, status, and age
import React, { useMemo } from 'react';
import { useData } from '../data/DataContext.jsx';
import { useAnalytics } from '../hooks/useAnalytics.js';
import {
  FUNCTIONS,
  FUNCTION_COLORS,
  FUNCTION_LABELS,
  BARRIERS,
  MIN_N_DISPLAY,
  AGE_OPTIONS,
} from '../config.js';
import { GroupedBar } from '../components/ChartComponents.jsx';
import { fmt, formatP } from '../utils/stats.js';
import TiltCard from '../components/TiltCard.jsx';

export default function SubgroupComparison() {
  const { filteredRows } = useData();
  const analytics = useAnalytics();

  const fnByGender = analytics?.fnByGender;
  const fnByStatusGroup = analytics?.fnByStatusGroup;
  const fnByAge = analytics?.fnByAge;

  // ── 1. Gender Chart Data ──
  const genderChartData = useMemo(() => {
    if (!fnByGender) return [];
    return FUNCTIONS.map(fn => {
      const male = fnByGender[fn]?.groups?.Male;
      const female = fnByGender[fn]?.groups?.Female;
      return {
        label: FUNCTION_LABELS[fn],
        Male: male && male.n >= MIN_N_DISPLAY && !isNaN(male.mean) ? parseFloat(male.mean.toFixed(2)) : null,
        Female: female && female.n >= MIN_N_DISPLAY && !isNaN(female.mean) ? parseFloat(female.mean.toFixed(2)) : null,
      };
    });
  }, [fnByGender]);

  // ── 2. Status (Students vs Professionals) Chart Data ──
  const statusChartData = useMemo(() => {
    if (!fnByStatusGroup) return [];
    return FUNCTIONS.map(fn => {
      const student = fnByStatusGroup[fn]?.student;
      const prof = fnByStatusGroup[fn]?.professional;
      return {
        label: FUNCTION_LABELS[fn],
        Students: student && student.n >= MIN_N_DISPLAY && !isNaN(student.mean) ? parseFloat(student.mean.toFixed(2)) : null,
        Professionals: prof && prof.n >= MIN_N_DISPLAY && !isNaN(prof.mean) ? parseFloat(prof.mean.toFixed(2)) : null,
      };
    });
  }, [fnByStatusGroup]);

  // ── 3. Age Band Chart Data ──
  const ageChartData = useMemo(() => {
    if (!fnByAge) return [];
    return FUNCTIONS.map(fn => {
      const row = { label: FUNCTION_LABELS[fn] };
      fnByAge[fn]?.groups?.forEach(g => {
        row[g.label] = g.n >= MIN_N_DISPLAY && !isNaN(g.mean) ? parseFloat(g.mean.toFixed(2)) : null;
      });
      return row;
    });
  }, [fnByAge]);

  // ── 4. Barrier Ranking by Subgroup ──
  const barrierRanking = useMemo(() => {
    function getTopBarrier(rows) {
      if (!rows || rows.length < MIN_N_DISPLAY) return { label: 'n < 5', n: rows ? rows.length : 0 };
      const counts = {};
      BARRIERS.forEach(b => { counts[b.id] = 0; });
      rows.forEach(r => {
        if (r._rank1Id && counts[r._rank1Id] !== undefined) {
          counts[r._rank1Id]++;
        }
      });
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      if (!sorted.length || sorted[0][1] === 0) return { label: 'None', n: rows.length };
      const topBarrierObj = BARRIERS.find(b => b.id === sorted[0][0]);
      return {
        label: topBarrierObj ? topBarrierObj.shortLabel : sorted[0][0],
        count: sorted[0][1],
        pct: ((sorted[0][1] / rows.length) * 100).toFixed(1),
        n: rows.length,
      };
    }

    const maleRows = (filteredRows || []).filter(r => r._gender === 'Male');
    const femaleRows = (filteredRows || []).filter(r => r._gender === 'Female');
    const studentRows = (filteredRows || []).filter(r => r._status && r._status.includes('Student'));
    const profRows = (filteredRows || []).filter(r => r._status && r._status.includes('Professional'));

    const byAge = {};
    AGE_OPTIONS.forEach(ag => {
      byAge[ag] = getTopBarrier((filteredRows || []).filter(r => r._age === ag));
    });

    return {
      male: getTopBarrier(maleRows),
      female: getTopBarrier(femaleRows),
      students: getTopBarrier(studentRows),
      professionals: getTopBarrier(profRows),
      byAge,
    };
  }, [filteredRows]);

  if (!analytics) {
    return (
      <div className="card text-center py-16 text-slate-400">
        No data available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Disclaimer Alert */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-200 flex items-start gap-3">
        <span className="text-xl shrink-0">⚠️</span>
        <div>
          <h3 className="font-semibold text-amber-900 dark:text-amber-100">Methodological Note on Subgroups</h3>
          <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            Differences are suggestive, not proof. Observed subgroup variations reflect associative trends in this sample and should not be interpreted as causal relationships. Statistical comparisons employ Welch’s t-test (for 2 unequal variance groups) and one-way ANOVA with η² effect sizes (for 3+ groups). Subgroups with n &lt; 5 are suppressed to preserve privacy and statistical validity.
          </p>
        </div>
      </div>

      {/* ── 1. GENDER COMPARISON ── */}
      <TiltCard glowColor="#0ea5e9" tiltMax={3} scale={1.008}>
      <section className="card-body" aria-label="Gender comparison">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              1. Motivation Functions by Gender
            </h2>
            <p className="text-xs text-zinc-400">
              Mean comparison between Male and Female respondents with Welch's t-test p-values
            </p>
          </div>
        </div>

        <GroupedBar
          data={genderChartData}
          keys={['Male', 'Female']}
          colors={['#0ea5e9', '#ec4899']}
          height={280}
          xKey="label"
        />

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[580px] text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <th className="py-2.5 px-3 text-left font-semibold">Motivation Function</th>
                <th className="py-2.5 px-3 text-center font-semibold">Male (M ± SD, n)</th>
                <th className="py-2.5 px-3 text-center font-semibold">Female (M ± SD, n)</th>
                <th className="py-2.5 px-3 text-center font-semibold">Welch t</th>
                <th className="py-2.5 px-3 text-center font-semibold">p-value</th>
                <th className="py-2.5 px-3 text-left font-semibold">Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {FUNCTIONS.map(fn => {
                const male = fnByGender[fn]?.groups?.Male;
                const female = fnByGender[fn]?.groups?.Female;
                const tRes = fnByGender[fn]?.tTest;
                const sig = tRes && tRes.p < 0.05;

                return (
                  <tr key={fn} className="hover:bg-slate-50/50 dark:hover:bg-slate-750">
                    <td className="py-2 px-3 font-medium flex items-center gap-2" style={{ color: FUNCTION_COLORS[fn] }}>
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: FUNCTION_COLORS[fn] }} />
                      {FUNCTION_LABELS[fn]}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-700 dark:text-slate-300">
                      {male && male.n >= MIN_N_DISPLAY ? `${fmt(male.mean)} (n=${male.n})` : '< 5 (suppressed)'}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-700 dark:text-slate-300">
                      {female && female.n >= MIN_N_DISPLAY ? `${fmt(female.mean)} (n=${female.n})` : '< 5 (suppressed)'}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-600 dark:text-slate-400">
                      {tRes && !isNaN(tRes.t) ? fmt(tRes.t) : '—'}
                    </td>
                    <td className="py-2 px-3 text-center font-mono">
                      {tRes ? (
                        <span className={`px-2 py-0.5 rounded text-xs ${sig ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold' : 'text-slate-500'}`}>
                          {formatP(tRes.p)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                      {sig ? (male.mean > female.mean ? 'Higher for Males' : 'Higher for Females') : 'No significant difference'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      </TiltCard>

      {/* ── 2. STATUS COMPARISON (Students vs Professionals) ── */}
      <TiltCard glowColor="#8b5cf6" tiltMax={3} scale={1.008}>
      <section className="card-body" aria-label="Status comparison">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              2. Students vs. Early-Career & Working Professionals
            </h2>
            <p className="text-xs text-zinc-400">
              Comparing Undergraduate/Postgraduate students with Early-Career and Working Professionals
            </p>
          </div>
        </div>

        <GroupedBar
          data={statusChartData}
          keys={['Students', 'Professionals']}
          colors={['#6366f1', '#f59e0b']}
          height={280}
          xKey="label"
        />

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[580px] text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <th className="py-2.5 px-3 text-left font-semibold">Motivation Function</th>
                <th className="py-2.5 px-3 text-center font-semibold">Students (M, n)</th>
                <th className="py-2.5 px-3 text-center font-semibold">Professionals (M, n)</th>
                <th className="py-2.5 px-3 text-center font-semibold">Welch t</th>
                <th className="py-2.5 px-3 text-center font-semibold">p-value</th>
                <th className="py-2.5 px-3 text-left font-semibold">Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {FUNCTIONS.map(fn => {
                const s = fnByStatusGroup[fn]?.student;
                const p = fnByStatusGroup[fn]?.professional;
                const tRes = fnByStatusGroup[fn]?.tTest;
                const sig = tRes && tRes.p < 0.05;

                return (
                  <tr key={fn} className="hover:bg-slate-50/50 dark:hover:bg-slate-750">
                    <td className="py-2 px-3 font-medium flex items-center gap-2" style={{ color: FUNCTION_COLORS[fn] }}>
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: FUNCTION_COLORS[fn] }} />
                      {FUNCTION_LABELS[fn]}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-700 dark:text-slate-300">
                      {s && s.n >= MIN_N_DISPLAY ? `${fmt(s.mean)} (n=${s.n})` : '< 5'}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-700 dark:text-slate-300">
                      {p && p.n >= MIN_N_DISPLAY ? `${fmt(p.mean)} (n=${p.n})` : '< 5'}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-600 dark:text-slate-400">
                      {tRes && !isNaN(tRes.t) ? fmt(tRes.t) : '—'}
                    </td>
                    <td className="py-2 px-3 text-center font-mono">
                      {tRes ? (
                        <span className={`px-2 py-0.5 rounded text-xs ${sig ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold' : 'text-slate-500'}`}>
                          {formatP(tRes.p)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                      {sig ? (s.mean > p.mean ? 'Higher for Students' : 'Higher for Professionals') : 'No significant difference'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      </TiltCard>

      {/* ── 3. AGE BAND COMPARISON (ANOVA) ── */}
      <TiltCard glowColor="#10b981" tiltMax={3} scale={1.008}>
      <section className="card-body" aria-label="Age band comparison">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              3. Motivation Functions by Age Cohort (One-way ANOVA)
            </h2>
            <p className="text-xs text-zinc-400">
              Evaluates whether motivation profiles systematically change across age brackets
            </p>
          </div>
        </div>

        <GroupedBar
          data={ageChartData}
          keys={AGE_OPTIONS}
          colors={['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#a855f7']}
          height={320}
          xKey="label"
        />

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[580px] text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <th className="py-2.5 px-3 text-left font-semibold">Function</th>
                <th className="py-2.5 px-3 text-center font-semibold">ANOVA F</th>
                <th className="py-2.5 px-3 text-center font-semibold">df (Between, Within)</th>
                <th className="py-2.5 px-3 text-center font-semibold">p-value</th>
                <th className="py-2.5 px-3 text-center font-semibold">Effect Size (η²)</th>
                <th className="py-2.5 px-3 text-left font-semibold">Effect Magnitude</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {FUNCTIONS.map(fn => {
                const anova = fnByAge[fn]?.anova;
                const sig = anova && anova.p < 0.05;
                const eta = anova?.etaSquared;
                let etaLabel = 'Negligible';
                if (eta >= 0.14) etaLabel = 'Large effect';
                else if (eta >= 0.06) etaLabel = 'Medium effect';
                else if (eta >= 0.01) etaLabel = 'Small effect';

                return (
                  <tr key={fn} className="hover:bg-slate-50/50 dark:hover:bg-slate-750">
                    <td className="py-2 px-3 font-medium flex items-center gap-2" style={{ color: FUNCTION_COLORS[fn] }}>
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: FUNCTION_COLORS[fn] }} />
                      {FUNCTION_LABELS[fn]}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-700 dark:text-slate-300 font-mono">
                      {anova && !isNaN(anova.F) ? fmt(anova.F) : '—'}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-500 font-mono">
                      {anova && anova.dfBetween !== undefined ? `(${anova.dfBetween}, ${anova.dfWithin})` : '—'}
                    </td>
                    <td className="py-2 px-3 text-center font-mono">
                      {anova ? (
                        <span className={`px-2 py-0.5 rounded text-xs ${sig ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold' : 'text-slate-500'}`}>
                          {formatP(anova.p)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-700 dark:text-slate-300 font-mono">
                      {anova && !isNaN(eta) ? fmt(eta, 3) : '—'}
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                      {anova && !isNaN(eta) ? etaLabel : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      </TiltCard>

      {/* ── 4. BARRIER RANKING BY SUBGROUP ── */}
      <section className="card" aria-label="Barrier ranking by subgroup">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
          4. Primary Barrier (Rank 1) by Demographic Subgroups
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Most frequently selected Rank 1 barrier within each demographic segment
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Gender */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-750">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">By Gender</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="font-medium text-slate-700 dark:text-slate-300">Male:</span>
                <span className="text-right text-slate-800 dark:text-slate-100 font-semibold">
                  {barrierRanking.male.label} <span className="text-slate-400 font-normal">({barrierRanking.male.pct}%)</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">Female:</span>
                <span className="text-right text-slate-800 dark:text-slate-100 font-semibold">
                  {barrierRanking.female.label} <span className="text-slate-400 font-normal">({barrierRanking.female.pct}%)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-750">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">By Current Status</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="font-medium text-slate-700 dark:text-slate-300">Students:</span>
                <span className="text-right text-slate-800 dark:text-slate-100 font-semibold">
                  {barrierRanking.students.label} <span className="text-slate-400 font-normal">({barrierRanking.students.pct}%)</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">Professionals:</span>
                <span className="text-right text-slate-800 dark:text-slate-100 font-semibold">
                  {barrierRanking.professionals.label} <span className="text-slate-400 font-normal">({barrierRanking.professionals.pct}%)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Age Cohorts (Top 2 groups) */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-750 lg:col-span-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">By Age Band</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs">
              {AGE_OPTIONS.map(ag => {
                const item = barrierRanking.byAge[ag];
                return (
                  <div key={ag} className="py-1 border-b border-slate-100 dark:border-slate-700/60">
                    <span className="text-slate-500 block text-[11px]">{ag}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {item.label} {item.pct ? <span className="text-slate-400 font-normal">({item.pct}%)</span> : null}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

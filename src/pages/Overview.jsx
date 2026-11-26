// Overview.jsx — Dashboard overview page
import React, { useMemo } from 'react';
import { useData } from '../data/DataContext.jsx';
import { useAnalytics } from '../hooks/useAnalytics.js';
import { FUNCTION_COLORS, FUNCTION_LABELS } from '../config.js';
import { DonutChart, FunctionRankedBar, ResponseTimeLine } from '../components/ChartComponents.jsx';
import { fmt } from '../utils/stats.js';
import NumberTicker from '../components/magicui/NumberTicker.jsx';
import BlurFade from '../components/magicui/BlurFade.jsx';
import { Lightbulb, Trophy, Users, TrendingUp } from 'lucide-react';
import TiltCard from '../components/TiltCard.jsx';

function countBy(rows, keyFn) {
  const counts = {};
  rows.forEach(r => {
    const k = keyFn(r) ?? 'Unknown';
    if (k) counts[k] = (counts[k] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

// ── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, numericValue, decimalPlaces = 0, sub, accentColor, icon: Icon }) {
  const isNumeric = typeof numericValue === 'number' && !isNaN(numericValue);
  const textVal = String(value ?? '');

  // Scale font size so long labels like "Understanding" or "Enhancement" never clip or hide
  let fontSizeClass = 'text-2xl sm:text-3xl';
  if (!isNumeric) {
    if (textVal.length > 10) {
      fontSizeClass = 'text-base sm:text-lg xl:text-xl 2xl:text-2xl';
    } else if (textVal.length > 7) {
      fontSizeClass = 'text-lg sm:text-xl xl:text-2xl';
    } else {
      fontSizeClass = 'text-xl sm:text-2xl xl:text-3xl';
    }
  }

  return (
    <TiltCard glowColor={accentColor || '#8b5cf6'} tiltMax={10} scale={1.03}>
      <div className="card-body p-4 sm:p-5 relative overflow-hidden" role="region" aria-label={label}>
        <div className="flex items-start justify-between gap-1 mb-2">
          <p className="card-label leading-tight">{label}</p>
          {Icon && (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ml-1"
              style={{ background: `${accentColor || '#8b5cf6'}18` }}>
              <Icon className="w-3.5 h-3.5" style={{ color: accentColor || '#8b5cf6' }} />
            </div>
          )}
        </div>
        <div
          className={`font-bold tracking-tight flex items-baseline gap-0.5 leading-tight ${fontSizeClass}`}
          style={{ color: accentColor }}
        >
          {isNumeric ? (
            <>
              <NumberTicker value={numericValue} decimalPlaces={decimalPlaces} />
              {typeof value === 'string' && value.endsWith('%') && <span>%</span>}
            </>
          ) : (
            <span className="leading-tight" title={textVal}>{value}</span>
          )}
        </div>
        {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
      </div>
    </TiltCard>
  );
}

// ── Insights panel ────────────────────────────────────────────────────────────
function InsightsPanel({ insights }) {
  return (
    <section className="card" aria-label="Auto-generated insights">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
          <Lightbulb className="w-3.5 h-3.5 text-violet-400" />
        </div>
        <h2 className="text-sm font-semibold text-zinc-100">Auto-generated Insights</h2>
        <span className="ml-auto text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
          Dynamic
        </span>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5" role="list">
        {insights.map((ins, i) => (
          <li
            key={i}
            className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed p-3 rounded-xl bg-zinc-800/60 border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-violet-500/15 flex items-center justify-center text-violet-400 text-[10px] font-bold">
              {i + 1}
            </span>
            {ins}
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Overview() {
  const { filteredRows, n } = useData();
  const analytics = useAnalytics();

  const timeSeries = useMemo(() => {
    const counts = {};
    filteredRows.forEach(r => {
      if (!r._timestamp) return;
      const d = r._timestamp.slice(0, 10);
      counts[d] = (counts[d] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }, [filteredRows]);

  if (!analytics) {
    return <div className="card text-center py-16 text-zinc-500">No data available.</div>;
  }

  const { rankedFns, pctCurrent, pctNever, insights } = analytics;

  const ageData    = countBy(filteredRows, r => r._age);
  const genderData = countBy(filteredRows, r => r._gender);
  const statusData = countBy(filteredRows, r => r._status);
  const everData   = countBy(filteredRows, r => r._ever);

  const fnRankedData = rankedFns.map(d => ({
    label: FUNCTION_LABELS[d.fn],
    mean:  d.mean,
    color: FUNCTION_COLORS[d.fn],
  }));

  const nCurrent = filteredRows.filter(r => r._ever === 'Yes, I currently volunteer').length;
  const nNever   = filteredRows.filter(r => r._ever === 'No, I have never volunteered').length;

  return (
    <div className="space-y-5">

      {/* KPI cards */}
      <BlurFade delay={0.05} duration={0.35}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" role="region" aria-label="Key metrics">
          <KpiCard
            label="Total Responses"
            value={n} numericValue={n}
            sub="in current filter"
            accentColor="#8b5cf6"
            icon={Users}
          />
          <KpiCard
            label="Strongest Motivation"
            value={rankedFns[0]?.label ?? '—'}
            sub={`Mean = ${fmt(rankedFns[0]?.mean)}`}
            accentColor={FUNCTION_COLORS[rankedFns[0]?.fn] ?? '#8b5cf6'}
            icon={Trophy}
          />
          <KpiCard
            label="Currently Volunteer"
            value={`${fmt(pctCurrent, 1)}%`}
            numericValue={pctCurrent} decimalPlaces={1}
            sub={`${nCurrent} respondent${nCurrent !== 1 ? 's' : ''}`}
            accentColor="#10b981"
            icon={TrendingUp}
          />
          <KpiCard
            label="Never Volunteered"
            value={`${fmt(pctNever, 1)}%`}
            numericValue={pctNever} decimalPlaces={1}
            sub={`${nNever} respondent${nNever !== 1 ? 's' : ''}`}
            accentColor="#f59e0b"
            icon={TrendingUp}
          />
        </div>
      </BlurFade>

      {/* Insights */}
      <BlurFade delay={0.12} duration={0.35}>
        <InsightsPanel insights={insights} />
      </BlurFade>

      {/* Demographics */}
      <BlurFade delay={0.2} duration={0.35}>
        <section aria-label="Demographic breakdown">
          <h2 className="section-heading">Sample Demographics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <TiltCard glowColor="#6366f1" tiltMax={6} scale={1.02}>
              <div className="card-body"><DonutChart data={ageData} title="Age distribution" height={200} /></div>
            </TiltCard>
            <TiltCard glowColor="#0ea5e9" tiltMax={6} scale={1.02}>
              <div className="card-body"><DonutChart data={genderData} title="Gender" height={200} /></div>
            </TiltCard>
            <TiltCard glowColor="#10b981" tiltMax={6} scale={1.02}>
              <div className="card-body"><DonutChart data={statusData} title="Status" height={200} /></div>
            </TiltCard>
            <TiltCard glowColor="#a855f7" tiltMax={6} scale={1.02}>
              <div className="card-body"><DonutChart data={everData} title="Volunteering history" height={200} /></div>
            </TiltCard>
          </div>
        </section>
      </BlurFade>

      {/* Ranked functions */}
      <BlurFade delay={0.28} duration={0.35}>
        <TiltCard glowColor="#8b5cf6" tiltMax={3} scale={1.008}>
          <section className="card-body" aria-label="Motivation functions ranked by mean score">
            <h2 className="section-heading">Motivation Functions — Ranked by Mean Score (1–6 scale)</h2>
            <FunctionRankedBar data={fnRankedData} height={260} />
          </section>
        </TiltCard>
      </BlurFade>

      {/* Timeline */}
      {timeSeries.length > 1 && (
        <BlurFade delay={0.36} duration={0.35}>
          <TiltCard glowColor="#06b6d4" tiltMax={3} scale={1.008}>
            <section className="card-body" aria-label="Response trend over time">
              <h2 className="section-heading">Response Trend Over Time</h2>
              <ResponseTimeLine data={timeSeries} height={160} />
            </section>
          </TiltCard>
        </BlurFade>
      )}
    </div>
  );
}

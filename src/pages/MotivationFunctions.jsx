// MotivationFunctions.jsx — Deep dive into the 6 VFI motivation functions
import React from 'react';
import { useAnalytics } from '../hooks/useAnalytics.js';
import {
  FUNCTIONS,
  FUNCTION_COLORS,
  FUNCTION_LABELS,
} from '../config.js';
import {
  FunctionRankedBar,
  FunctionRadar,
  LevelBandStackedBar,
  CorrelationHeatmap,
} from '../components/ChartComponents.jsx';
import { fmt } from '../utils/stats.js';
import TiltCard from '../components/TiltCard.jsx';
import { Star } from 'lucide-react';

// ── Cronbach α badge ──────────────────────────────────────────────────────────
function AlphaBadge({ alpha }) {
  if (isNaN(alpha) || alpha === null || alpha === undefined) {
    return <span className="text-xs text-zinc-500 italic">α = —</span>;
  }
  const good = alpha >= 0.70;
  return (
    <span
      className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border font-mono ${
        good
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-xs shadow-emerald-500/10'
          : 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-xs shadow-amber-500/10'
      }`}
      title={good ? 'Acceptable reliability (α ≥ 0.70)' : 'Marginal reliability — interpret with caution'}
    >
      α = {fmt(alpha)}
    </span>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function StatPill({ label, value, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center bg-zinc-800/80 hover:bg-zinc-800 rounded-xl px-2.5 py-1.5 border border-zinc-700/60 transition-colors ${className}`}>
      <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">{label}</span>
      <span className="text-xs sm:text-sm font-semibold text-zinc-100 font-mono mt-0.5">{value}</span>
    </div>
  );
}

// ── Function card ─────────────────────────────────────────────────────────────
function FunctionCard({ fnStat, color, isTop = false }) {
  const {
    label, activeItems,
    mean: m, sd: s, median: med, ci95,
    topBox: tb, alpha, sb, interItemR, is2Item, bandPct,
  } = fnStat;

  const levelBandData = [{
    label,
    Low:      parseFloat((bandPct?.Low ?? 0).toFixed(1)),
    Moderate: parseFloat((bandPct?.Moderate ?? 0).toFixed(1)),
    High:     parseFloat((bandPct?.High ?? 0).toFixed(1)),
  }];

  return (
    <TiltCard glowColor={color} tiltMax={8} scale={1.025}>
      <div className="card-body relative overflow-hidden pl-6" aria-label={`${label} function`}>
        {/* Left vertical colored accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl shadow-md"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 12px ${color}80`,
          }}
        />

        {/* Top subtle colored gradient line */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}40, transparent)` }}
        />

        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3.5">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base tracking-tight" style={{ color }}>{label}</h3>
              {isTop && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 shadow-xs">
                  <Star className="w-2.5 h-2.5 fill-current" /> Top Function
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {activeItems.length} item{activeItems.length !== 1 ? 's' : ''}
              {is2Item && (
                <span className="ml-2 text-amber-400 font-medium">· 2-item scale — interpret with caution</span>
              )}
            </p>
          </div>
          <AlphaBadge alpha={alpha} />
        </div>

        {/* Stats grid */}
        <div className="space-y-1.5 mb-3.5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <StatPill label="Mean"    value={fmt(m)} />
            <StatPill label="SD"      value={fmt(s)} />
            <StatPill label="Median"  value={fmt(med)} />
            <StatPill label="Top-box" value={`${fmt(tb, 1)}%`} />
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            <StatPill label="95% CI"  value={`[${fmt(ci95?.lower)} – ${fmt(ci95?.upper)}]`} className="text-center" />
          </div>
        </div>

        {/* 2-item reliability note */}
        {is2Item && interItemR !== null && sb !== null && (
          <div className="text-xs bg-amber-500/10 border border-amber-500/25 rounded-xl px-3.5 py-2.5 mb-3.5 space-y-1">
            <p className="text-amber-300 font-medium">
              <span className="font-bold">Inter-item r:</span> {fmt(interItemR)}
            </p>
            <p className="text-amber-300 font-medium">
              <span className="font-bold">Spearman-Brown reliability:</span> {fmt(sb)}
            </p>
          </div>
        )}

        {/* Level band distribution */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1 font-semibold">
            Level band distribution (Low / Moderate / High)
          </p>
          <LevelBandStackedBar data={levelBandData} height={110} />
        </div>
      </div>
    </TiltCard>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MotivationFunctions() {
  const analytics = useAnalytics();

  if (!analytics) {
    return <div className="card text-center py-16 text-zinc-500">No data available.</div>;
  }

  const { fnData, fnCorr, rankedFns } = analytics;

  const fnRankedData = rankedFns.map(d => ({
    label: FUNCTION_LABELS[d.fn],
    mean:  d.mean,
    color: FUNCTION_COLORS[d.fn],
  }));

  const radarData = FUNCTIONS.map(fn => ({
    fn,
    label: FUNCTION_LABELS[fn],
    mean:  fnData[fn]?.mean ?? 0,
  }));

  const corrLabels = FUNCTIONS.map(fn => FUNCTION_LABELS[fn]);
  const corrMatrix = FUNCTIONS.map(fn1 =>
    FUNCTIONS.map(fn2 => fnCorr[fn1]?.[fn2] ?? NaN)
  );

  return (
    <div className="space-y-6">

      {/* Function cards */}
      <section aria-label="Motivation function detail cards">
        <h2 className="section-heading text-base">Function-Level Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {FUNCTIONS.map(fn => (
            <FunctionCard
              key={fn}
              fnStat={fnData[fn]}
              color={FUNCTION_COLORS[fn]}
              isTop={rankedFns[0]?.fn === fn}
            />
          ))}
        </div>
      </section>

      {/* Ranked bar */}
      <TiltCard glowColor="#8b5cf6" tiltMax={3} scale={1.005}>
        <section className="card-body" aria-label="Functions ranked by mean score">
          <h2 className="section-heading text-base">Functions Ranked by Mean Score (1–6 scale)</h2>
          <FunctionRankedBar data={fnRankedData} height={280} />
        </section>
      </TiltCard>

      {/* Radar */}
      <TiltCard glowColor="#06b6d4" tiltMax={3} scale={1.005}>
        <section className="card-body" aria-label="Radar chart of all six motivation functions">
          <h2 className="section-heading text-base">Motivational Profile — Radar View</h2>
          <p className="text-xs text-zinc-400 mb-3">
            Each axis represents the mean composite score (1–6) for that function.
          </p>
          <FunctionRadar data={radarData} height={300} />
        </section>
      </TiltCard>

      {/* Correlation Heatmap */}
      <TiltCard glowColor="#a855f7" tiltMax={3} scale={1.005}>
        <section className="card-body" aria-label="Function correlation heatmap">
          <h2 className="section-heading text-base">Inter-function Pearson Correlation Matrix</h2>
          <p className="text-xs text-zinc-400 mb-4">
            Violet = positive correlation · Red = negative · Darker = stronger relationship
          </p>
          <div className="overflow-x-auto">
            <CorrelationHeatmap labels={corrLabels} matrix={corrMatrix} />
          </div>
        </section>
      </TiltCard>

    </div>
  );
}

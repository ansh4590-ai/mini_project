// QuestionWise.jsx — Question-level (item) analysis
import React, { useState, useMemo } from 'react';
import { useAnalytics } from '../hooks/useAnalytics.js';
import {
  ITEMS,
  FUNCTIONS,
  FUNCTION_COLORS,
  FUNCTION_LABELS,
  MIN_N_DISPLAY,
} from '../config.js';
import { ScaleDistBar } from '../components/ChartComponents.jsx';
import { fmt } from '../utils/stats.js';
import TiltCard from '../components/TiltCard.jsx';
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupByFunction() {
  const groups = {};
  FUNCTIONS.forEach(fn => {
    groups[fn] = ITEMS.filter(i => i.fn === fn && i.active);
  });
  return groups;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return (
    <h2 className="section-heading text-base">
      {children}
    </h2>
  );
}

/** Horizontal ranked list of all items by mean */
function RankedItemList({ itemStats }) {
  const sorted = useMemo(() => {
    return ITEMS.filter(i => i.active)
      .map(i => ({ ...i, mean: itemStats[i.id]?.mean ?? NaN }))
      .filter(i => !isNaN(i.mean))
      .sort((a, b) => b.mean - a.mean);
  }, [itemStats]);

  const max = sorted[0]?.mean ?? 6;

  return (
    <ol className="space-y-2" aria-label="Items ranked by mean score">
      {sorted.map((item, rank) => {
        const pct = max > 0 ? (item.mean / 6) * 100 : 0;
        const color = FUNCTION_COLORS[item.fn];
        return (
          <li
            key={item.id}
            className="flex items-center gap-3 p-2 rounded-xl bg-zinc-800/40 hover:bg-zinc-800/70 border border-zinc-800 transition-colors"
          >
            <span className="text-xs font-mono font-bold text-zinc-500 w-6 text-right shrink-0">
              {rank + 1}.
            </span>
            <span
              className="text-xs text-zinc-300 truncate flex-1 min-w-0"
              title={item.text}
            >
              {item.text}
            </span>
            <div className="w-28 shrink-0 bg-zinc-700/60 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${pct}%`, backgroundColor: color }}
                aria-hidden="true"
              />
            </div>
            <span className="text-xs font-mono font-bold text-zinc-200 w-10 text-right shrink-0">
              {fmt(item.mean)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Warning box for redundant item pairs within a function */
function RedundancyWarning({ pairs }) {
  if (!pairs || pairs.length === 0) return null;
  return (
    <div
      className="mb-3.5 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2.5"
      role="alert"
      aria-live="polite"
    >
      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold mb-1">Possibly redundant item pairs (r &gt; 0.80):</p>
        <ul className="list-disc list-inside space-y-0.5 text-amber-200/90 font-mono text-[11px]">
          {pairs.map(([id1, id2, r]) => (
            <li key={`${id1}-${id2}`}>
              <span>{id1}</span> × <span>{id2}</span> — r = {fmt(r)}
            </li>
          ))}
        </ul>
        <p className="mt-1 text-amber-400/80 italic text-[11px]">
          Review whether these items measure the same construct.
        </p>
      </div>
    </div>
  );
}

/** Expandable item card with 3D tilt & hover glow */
function ItemCard({ item, stats, expanded, onToggle }) {
  const { n, mean: m, sd: s, median: med, mode: mo, topBox: tb, dist, distPct } = stats;
  const suppressed = n < MIN_N_DISPLAY;
  const color = FUNCTION_COLORS[item.fn] || '#8b5cf6';

  return (
    <div
      className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/90 hover:border-zinc-700 transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5"
      style={{
        boxShadow: expanded ? `0 8px 30px -8px ${color}25` : undefined,
      }}
    >
      {/* Toggle header */}
      <button
        className="w-full flex items-start justify-between gap-3 px-4 py-3.5 text-left bg-zinc-900/90 hover:bg-zinc-800/60 transition-colors cursor-pointer"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`item-body-${item.id}`}
      >
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="w-1.5 h-6 rounded-full shrink-0 mt-0.5"
            style={{ backgroundColor: color }}
          />
          <span className="font-mono text-xs font-bold text-zinc-400 shrink-0 mt-0.5">
            {item.id}
          </span>
          <span className="text-sm text-zinc-200 font-medium leading-snug">
            {item.text}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {!suppressed && (
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700/60">
              M = {fmt(m)}
            </span>
          )}
          <span className="text-zinc-400 text-xs">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>
      </button>

      {/* Expandable body */}
      {expanded && (
        <div
          id={`item-body-${item.id}`}
          className="px-5 pb-5 pt-3 bg-zinc-950/60 border-t border-zinc-800/80 space-y-4"
        >
          {suppressed ? (
            <p className="text-sm text-zinc-500 italic py-4 text-center">
              n too small to display (n = {n} &lt; {MIN_N_DISPLAY})
            </p>
          ) : (
            <>
              {/* Stats pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'n',       value: n },
                  { label: 'Mean',    value: fmt(m) },
                  { label: 'SD',      value: fmt(s) },
                  { label: 'Median',  value: fmt(med) },
                  { label: 'Mode',    value: Array.isArray(mo) ? mo.join(', ') : fmt(mo) },
                  { label: 'Top-box', value: `${fmt(tb, 1)}%` },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center bg-zinc-800/70 border border-zinc-700/50 rounded-xl px-3 py-1.5 min-w-[70px]"
                  >
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">{label}</span>
                    <span className="text-xs font-bold text-zinc-100 font-mono mt-0.5">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Scale distribution bar */}
              <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <ScaleDistBar dist={dist} distPct={distPct} n={n} height={160} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/** All items under one function heading */
function FunctionSection({ fn, items, itemStats, itemCorr, expanded, onToggle }) {
  const color = FUNCTION_COLORS[fn];
  const label = FUNCTION_LABELS[fn];

  const redundantPairs = useMemo(() => {
    const pairs = [];
    const fnItems = items.map(i => i.id);
    for (let a = 0; a < fnItems.length; a++) {
      for (let b = a + 1; b < fnItems.length; b++) {
        const id1 = fnItems[a];
        const id2 = fnItems[b];
        const r = itemCorr[id1]?.[id2];
        if (typeof r === 'number' && !isNaN(r) && r > 0.80) {
          pairs.push([id1, id2, r]);
        }
      }
    }
    return pairs;
  }, [items, itemCorr]);

  return (
    <section aria-labelledby={`fn-heading-${fn}`} className="space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-3 h-5 rounded-md shrink-0 shadow-sm" style={{ backgroundColor: color }} aria-hidden="true" />
        <h2
          id={`fn-heading-${fn}`}
          className="text-base font-bold tracking-tight"
          style={{ color }}
        >
          {label}
        </h2>
        <span className="text-xs text-zinc-500 font-medium">
          ({items.length} item{items.length !== 1 ? 's' : ''})
        </span>
      </div>

      <RedundancyWarning pairs={redundantPairs} />

      <div className="space-y-2.5">
        {items.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            stats={itemStats[item.id] ?? { n: 0, mean: NaN, sd: NaN, median: NaN, mode: [], topBox: NaN, dist: {}, distPct: {} }}
            expanded={!!expanded[item.id]}
            onToggle={() => onToggle(item.id)}
          />
        ))}
      </div>
    </section>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function QuestionWise() {
  const analytics = useAnalytics();
  const [expanded, setExpanded] = useState({});

  const toggleItem = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all = {};
    ITEMS.filter(i => i.active).forEach(i => { all[i.id] = true; });
    setExpanded(all);
  };

  const collapseAll = () => setExpanded({});

  if (!analytics) {
    return (
      <div className="card text-center py-16 text-zinc-500">
        No data available.
      </div>
    );
  }

  const { itemStats, itemCorr } = analytics;
  const fnGroups = groupByFunction();

  return (
    <div className="space-y-8">

      {/* ── Ranked item list ── */}
      <TiltCard glowColor="#8b5cf6" tiltMax={3} scale={1.008}>
        <section className="card-body" aria-label="All items ranked by mean score">
          <SectionTitle>All Items Ranked by Mean Score (Highest → Lowest)</SectionTitle>
          <RankedItemList itemStats={itemStats} />
        </section>
      </TiltCard>

      {/* ── Expand / Collapse controls ── */}
      <div className="flex gap-2 justify-end">
        <button
          onClick={expandAll}
          className="text-xs px-3.5 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all cursor-pointer font-medium"
        >
          Expand all
        </button>
        <button
          onClick={collapseAll}
          className="text-xs px-3.5 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all cursor-pointer font-medium"
        >
          Collapse all
        </button>
      </div>

      {/* ── Per-function sections ── */}
      <div className="space-y-8">
        {FUNCTIONS.map(fn => (
          <FunctionSection
            key={fn}
            fn={fn}
            items={fnGroups[fn]}
            itemStats={itemStats}
            itemCorr={itemCorr}
            expanded={expanded}
            onToggle={toggleItem}
          />
        ))}
      </div>

      {/* ── Anonymity footnote ── */}
      <p className="text-xs text-zinc-500 italic text-center pb-2">
        Item cards with n &lt; {MIN_N_DISPLAY} are suppressed to protect respondent anonymity.
      </p>

    </div>
  );
}

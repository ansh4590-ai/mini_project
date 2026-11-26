// FilterBar.jsx — Dark theme filter panel
import React from 'react';
import { useData } from '../data/DataContext.jsx';
import {
  AGE_OPTIONS, GENDER_OPTIONS, STATUS_OPTIONS,
  EVER_OPTIONS, FREQ_OPTIONS,
} from '../config.js';
import { RotateCcw, Filter } from 'lucide-react';

function MultiSelect({ label, options, selected, onChange }) {
  return (
    <div className="flex flex-col gap-2 min-w-[140px]">
      <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => {
          const val = typeof opt === 'object' ? opt.label : opt;
          const active = selected.includes(val);
          return (
            <button
              key={val}
              type="button"
              onClick={() =>
                onChange(active ? selected.filter(v => v !== val) : [...selected, val])
              }
              className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-all duration-150 cursor-pointer ${
                active
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-violet-500/50 hover:text-zinc-200'
              }`}
            >
              {val}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FilterBar() {
  const { filters, setFilters, resetFilters, n, mergeSparse, setMergeSparse } = useData();
  const update = (key, val) => setFilters(f => ({ ...f, [key]: val }));
  const hasFilters = Object.values(filters).some(v =>
    Array.isArray(v) ? v.length > 0 : v !== ''
  );

  return (
    <div className="p-4 md:p-5 bg-zinc-900/80 backdrop-blur-md space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wide">
            Filter Cohort
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium">
            n = {n}
          </span>
        </div>
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Filter groups */}
      <div className="flex flex-wrap gap-x-6 gap-y-4">
        <MultiSelect
          label="Age Band"
          options={AGE_OPTIONS}
          selected={filters.age}
          onChange={v => update('age', v)}
        />
        <MultiSelect
          label="Gender"
          options={GENDER_OPTIONS}
          selected={filters.gender}
          onChange={v => update('gender', v)}
        />
        <MultiSelect
          label="Status"
          options={STATUS_OPTIONS}
          selected={filters.status}
          onChange={v => update('status', v)}
        />
        <MultiSelect
          label="Volunteering History"
          options={EVER_OPTIONS}
          selected={filters.ever}
          onChange={v => update('ever', v)}
        />
        <MultiSelect
          label="Frequency"
          options={FREQ_OPTIONS.map(f => f.label)}
          selected={filters.freq}
          onChange={v => update('freq', v)}
        />

        {/* Date range */}
        <div className="flex flex-col gap-2 min-w-[220px]">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Date Range
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={e => update('dateFrom', e.target.value)}
              className="text-xs border border-zinc-700 rounded-md px-2.5 py-1.5 bg-zinc-800 text-zinc-200 focus:outline-none focus:border-violet-500/60"
            />
            <span className="text-zinc-600 text-xs">–</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={e => update('dateTo', e.target.value)}
              className="text-xs border border-zinc-700 rounded-md px-2.5 py-1.5 bg-zinc-800 text-zinc-200 focus:outline-none focus:border-violet-500/60"
            />
          </div>
        </div>
      </div>

      {/* Merge sparse toggle */}
      <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={mergeSparse}
          onChange={e => setMergeSparse(e.target.checked)}
          className="w-3.5 h-3.5 rounded accent-violet-500 border-zinc-600"
        />
        <span>Auto-merge sparse categories into "Other / merged" (n &lt; 5)</span>
      </label>
    </div>
  );
}

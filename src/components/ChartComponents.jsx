// ChartComponents.jsx — Reusable chart wrappers (dark theme)
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { SCALE_LABELS } from '../config.js';

// ── Token colours ──────────────────────────────────────────────────────────────
const GRID   = '#27272a';   // zinc-800
const TICK   = '#71717a';   // zinc-500
const ACCENT = '#8b5cf6';   // violet-500

const BAND_COLORS = { Low: '#52525b', Moderate: '#60a5fa', High: '#34d399' };
const DONUT_COLORS = ['#8b5cf6','#06b6d4','#10b981','#f59e0b','#f43f5e','#a855f7','#ec4899','#14b8a6'];

// ── Tooltip ───────────────────────────────────────────────────────────────────
export function ChartTooltip({ active, payload, label, extraRows = [] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-3 text-xs max-w-xs">
      {label && <p className="font-semibold text-zinc-100 mb-1.5 pb-1 border-b border-zinc-800">{label}</p>}
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-3 text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
              {p.name}
            </span>
            <span className="font-bold font-mono text-zinc-100">
              {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
            </span>
          </div>
        ))}
      </div>
      {extraRows.map((r, i) => (
        <p key={`ex${i}`} className="text-[11px] text-zinc-500 mt-1.5 pt-1 border-t border-zinc-800">{r}</p>
      ))}
    </div>
  );
}

// ── Shared tooltip style object (passed to Recharts Tooltip) ──────────────────
const tooltipStyle = {
  contentStyle: { background: '#18181b', border: '1px solid #3f3f46', borderRadius: 10, fontSize: 11, color: '#e4e4e7' },
  itemStyle:    { color: '#a1a1aa' },
  labelStyle:   { color: '#e4e4e7', fontWeight: 600, marginBottom: 4 },
};

// ── Donut chart ───────────────────────────────────────────────────────────────
export function DonutChart({ data, title, height = 220 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div>
      {title && <p className="card-label">{title}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data} dataKey="value" nameKey="name"
            cx="50%" cy="50%" innerRadius="52%" outerRadius="78%"
            paddingAngle={2}
          >
            {data.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
          </Pie>
          <Tooltip
            formatter={(val, name) => [`${val} (${total > 0 ? (val/total*100).toFixed(1) : 0}%)`, name]}
            {...tooltipStyle}
          />
          <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10, color: '#71717a' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Scale distribution bar ────────────────────────────────────────────────────
export function ScaleDistBar({ dist, distPct, height = 160 }) {
  const data = [1,2,3,4,5,6].map(k => ({
    label: SCALE_LABELS[k], point: k,
    count: dist[k] || 0, pct: distPct?.[k] ?? 0,
  }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 32 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis
          dataKey="point"
          tick={({ x, y, payload }) => (
            <g transform={`translate(${x},${y})`}>
              <text x={0} y={0} dy={10} textAnchor="middle" fill={TICK} fontSize={11}>{payload.value}</text>
            </g>
          )}
          label={{ value: '1 = Not Important  →  6 = Extremely Important', position: 'insideBottom', offset: -20, fontSize: 10, fill: '#52525b' }}
        />
        <YAxis tick={{ fontSize: 10, fill: TICK }} />
        <Tooltip
          formatter={(val, name, props) => [
            `${val} (${props.payload.pct.toFixed(1)}%)`,
            props.payload.label
          ]}
          labelFormatter={(l) => `Point ${l}: ${SCALE_LABELS[l]}`}
          {...tooltipStyle}
        />
        <Bar dataKey="count" fill={ACCENT} radius={[3,3,0,0]} name="Count" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Function ranked bar ───────────────────────────────────────────────────────
export function FunctionRankedBar({ data, height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 60, left: 100, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
        <XAxis type="number" domain={[0, 6]} tick={{ fontSize: 10, fill: TICK }} />
        <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: TICK }} width={96} />
        <Tooltip formatter={(val) => [val.toFixed(2), 'Mean score']} {...tooltipStyle} />
        <Bar dataKey="mean" radius={[0,4,4,0]}>
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Radar chart ───────────────────────────────────────────────────────────────
export function FunctionRadar({ data, height = 300 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="75%">
        <PolarGrid stroke={GRID} />
        <PolarAngleAxis dataKey="label" tick={{ fontSize: 10, fill: TICK }} />
        <PolarRadiusAxis angle={30} domain={[0, 6]} tick={{ fontSize: 9, fill: TICK }} tickCount={4} />
        <Radar name="Mean" dataKey="mean" stroke={ACCENT} fill={ACCENT} fillOpacity={0.2} dot />
        <Tooltip formatter={(v) => [v.toFixed(2), 'Mean']} {...tooltipStyle} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── Stacked level-band bar ────────────────────────────────────────────────────
export function LevelBandStackedBar({ data, height = 200 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: TICK }} />
        <YAxis tickFormatter={v => `${v.toFixed(0)}%`} tick={{ fontSize: 10, fill: TICK }} />
        <Tooltip formatter={(v, name) => [`${v.toFixed(1)}%`, name]} {...tooltipStyle} />
        <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#71717a' }} />
        <Bar dataKey="Low"      stackId="a" fill={BAND_COLORS.Low}      name="Low (1–2.99)" />
        <Bar dataKey="Moderate" stackId="a" fill={BAND_COLORS.Moderate} name="Moderate (3–4.49)" />
        <Bar dataKey="High"     stackId="a" fill={BAND_COLORS.High}     name="High (4.5–6)" radius={[3,3,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Correlation heatmap (SVG) ─────────────────────────────────────────────────
export function CorrelationHeatmap({ labels, matrix }) {
  const n = labels.length;
  const cellSize = Math.min(64, Math.floor(320 / n));
  const margin = { top: 42, left: 86, right: 16, bottom: 16 };
  const w = n * cellSize + margin.left + margin.right;
  const h = n * cellSize + margin.top + margin.bottom;

  function cellColor(r) {
    if (isNaN(r)) return '#27272a';
    const v = Math.max(-1, Math.min(1, r));
    if (v >= 0) {
      const a = v;
      return `rgba(139,92,246,${(0.1 + 0.9 * a).toFixed(2)})`;
    } else {
      const a = -v;
      return `rgba(239,68,68,${(0.1 + 0.9 * a).toFixed(2)})`;
    }
  }

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="overflow-visible min-w-[340px] max-w-[500px] mx-auto block" role="img" aria-label="Correlation heatmap">
      {labels.map((lb, i) => (
        <text key={`rl${i}`} x={margin.left - 4} y={margin.top + i * cellSize + cellSize / 2 + 4}
          textAnchor="end" fontSize={10} fill={TICK}>{lb}</text>
      ))}
      {labels.map((lb, j) => (
        <text key={`cl${j}`} x={margin.left + j * cellSize + cellSize / 2}
          y={margin.top - 4}
          textAnchor="middle" fontSize={10} fill={TICK}
          transform={`rotate(-35, ${margin.left + j * cellSize + cellSize / 2}, ${margin.top - 4})`}
        >{lb}</text>
      ))}
      {matrix.map((row, i) =>
        row.map((val, j) => {
          const x = margin.left + j * cellSize;
          const y = margin.top  + i * cellSize;
          const r = typeof val === 'number' ? val : NaN;
          return (
            <g key={`${i}-${j}`}>
              <rect x={x} y={y} width={cellSize - 1} height={cellSize - 1}
                fill={cellColor(r)} rx={3} />
              <title>{`${labels[i]} × ${labels[j]}: r = ${isNaN(r) ? 'N/A' : r.toFixed(2)}`}</title>
              <text x={x + cellSize / 2} y={y + cellSize / 2 + 4}
                textAnchor="middle" fontSize={9} fill={Math.abs(r) > 0.5 ? '#fff' : '#a1a1aa'}>
                {isNaN(r) ? '—' : r.toFixed(2)}
              </text>
            </g>
          );
        })
      )}
    </svg>
  );
}

// ── Grouped bar (generic) ─────────────────────────────────────────────────────
export function GroupedBar({ data, keys, colors, height = 280, xKey = 'label', pValue }) {
  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 32 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
          <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: TICK }}
            angle={-25} textAnchor="end" interval={0} />
          <YAxis domain={[0, 6]} tick={{ fontSize: 10, fill: TICK }} />
          <Tooltip formatter={(v) => [v.toFixed(2), '']} {...tooltipStyle} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#71717a' }} />
          {keys.map((k, i) => (
            <Bar key={k} dataKey={k} fill={colors?.[i] ?? DONUT_COLORS[i]} radius={[3,3,0,0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
      {pValue !== undefined && (
        <p className="text-xs text-zinc-500 mt-1 text-right">{pValue}</p>
      )}
    </div>
  );
}

// ── Barrier ranked bar ────────────────────────────────────────────────────────
export function BarrierRankedBar({ data, height = 240 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 60, left: 130, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 10, fill: TICK }} />
        <YAxis type="category" dataKey="shortLabel" tick={{ fontSize: 11, fill: TICK }} width={124} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0]?.payload;
            return (
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs max-w-xs shadow-2xl">
                <p className="font-semibold text-zinc-100 mb-1">{d?.shortLabel}</p>
                <p className="text-zinc-500 mb-1 italic">{d?.text}</p>
                <p className="text-zinc-300">Weighted score: <strong>{d?.weighted}</strong></p>
                <p className="text-zinc-400">Rank 1: {d?.rank1} · Rank 2: {d?.rank2}</p>
              </div>
            );
          }}
        />
        <Bar dataKey="weighted" fill={ACCENT} radius={[0,4,4,0]} name="Weighted score" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Stacked barrier bar (R1 vs R2) ────────────────────────────────────────────
export function BarrierStackedBar({ data, height = 240 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, left: 130, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 10, fill: TICK }} />
        <YAxis type="category" dataKey="shortLabel" tick={{ fontSize: 11, fill: TICK }} width={124} />
        <Tooltip formatter={(v, n) => [v, n]} {...tooltipStyle} />
        <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#71717a' }} />
        <Bar dataKey="rank1" stackId="a" fill={ACCENT}    name="Rank 1" />
        <Bar dataKey="rank2" stackId="a" fill="#c4b5fd"   name="Rank 2" radius={[0,4,4,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Line chart: responses over time ──────────────────────────────────────────
export function ResponseTimeLine({ data, height = 180 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: TICK }} />
        <YAxis tick={{ fontSize: 10, fill: TICK }} allowDecimals={false} />
        <Tooltip {...tooltipStyle} />
        <Line type="monotone" dataKey="count" stroke={ACCENT} strokeWidth={2} dot={{ r: 3, fill: ACCENT }} name="Responses" />
      </LineChart>
    </ResponsiveContainer>
  );
}

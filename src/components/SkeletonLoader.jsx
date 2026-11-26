// SkeletonLoader.jsx
import React from 'react';

export function SkeletonRect({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export default function SkeletonPage() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading…" role="status">
      {/* Headline cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0,1,2,3].map(i => (
          <div key={i} className="card">
            <SkeletonRect className="h-3 w-20 mb-3" />
            <SkeletonRect className="h-8 w-16 mb-1" />
            <SkeletonRect className="h-3 w-24" />
          </div>
        ))}
      </div>
      {/* Two large chart areas */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card"><SkeletonRect className="h-48 w-full" /></div>
        <div className="card"><SkeletonRect className="h-48 w-full" /></div>
      </div>
      {/* Wide chart */}
      <div className="card"><SkeletonRect className="h-64 w-full" /></div>
    </div>
  );
}


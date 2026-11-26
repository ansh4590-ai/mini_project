// Sidebar.jsx — Clean dark sidebar
import React from 'react';
import {
  BarChart3, Users, Brain, ClipboardList,
  TrendingUp, ShieldAlert, Scale, BookOpen,
  HeartHandshake,
} from 'lucide-react';

const PAGE_ICONS = {
  overview:    BarChart3,
  profile:     Users,
  functions:   Brain,
  questions:   ClipboardList,
  behaviour:   TrendingUp,
  barriers:    ShieldAlert,
  subgroup:    Scale,
  methodology: BookOpen,
};

const GROUPS = [
  {
    label: 'Analysis',
    ids: ['overview', 'profile', 'functions', 'questions'],
  },
  {
    label: 'Deep Dives',
    ids: ['behaviour', 'barriers', 'subgroup'],
  },
  {
    label: 'Reference',
    ids: ['methodology'],
  },
];

export default function Sidebar({ pages, activePage, onNavigate, open, onClose }) {
  const pageMap = Object.fromEntries(pages.map(p => [p.id, p]));

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-64 sm:w-60 max-w-[85vw]
        bg-zinc-950 border-r border-zinc-800/60
        flex flex-col
        transform transition-transform duration-250 ease-in-out
        lg:relative lg:translate-x-0 lg:z-auto
        ${open ? 'translate-x-0 shadow-2xl shadow-black/80' : '-translate-x-full'}
      `}
      aria-label="Main navigation"
    >
      {/* Brand */}
      <div className="px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-zinc-50 leading-tight">VFI Analytics</div>
            <div className="text-[10px] text-zinc-500 leading-tight mt-0.5">Volunteer Study</div>
          </div>
        </div>
        <button
          className="lg:hidden icon-btn"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <span className="text-sm">✕</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
        {GROUPS.map(group => {
          const groupPages = group.ids
            .map(id => pageMap[id])
            .filter(Boolean);
          return (
            <div key={group.label}>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 px-3 mb-1.5">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {groupPages.map(p => {
                  const Icon = PAGE_ICONS[p.id] || BarChart3;
                  const isActive = activePage === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => onNavigate(p.id)}
                      className={`nav-link ${isActive ? 'active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-violet-400' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                      <span className="truncate">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer hint */}
      <div className="px-4 py-4 border-t border-zinc-800/60">
        <p className="text-[10px] text-zinc-600 leading-relaxed">
          VFI · Clary et al., 1998<br />
          17 items · 6 functions
        </p>
      </div>
    </aside>
  );
}

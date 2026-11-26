// App.jsx — root layout
import React, { useState, useEffect } from 'react';
import { DataProvider, useData } from './data/DataContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import FilterBar from './components/FilterBar.jsx';
import SkeletonPage from './components/SkeletonLoader.jsx';
import { useAnalytics } from './hooks/useAnalytics.js';
import { exportAggregatedSummaryCsv } from './utils/exportCsv.js';
import AnimatedGridPattern from './components/magicui/AnimatedGridPattern.jsx';
import BlurFade from './components/magicui/BlurFade.jsx';
import {
  Menu, RefreshCw, SlidersHorizontal,
  Sun, Moon, Download,
} from 'lucide-react';

// Pages
import Overview           from './pages/Overview.jsx';
import RespondentProfile  from './pages/RespondentProfile.jsx';
import MotivationFunctions from './pages/MotivationFunctions.jsx';
import QuestionWise       from './pages/QuestionWise.jsx';
import VolunteeringBehaviour from './pages/VolunteeringBehaviour.jsx';
import Barriers           from './pages/Barriers.jsx';
import SubgroupComparison from './pages/SubgroupComparison.jsx';
import Methodology        from './pages/Methodology.jsx';

const PAGES = [
  { id: 'overview',    label: 'Overview',                       Component: Overview },
  { id: 'profile',     label: 'Respondent Profile',             Component: RespondentProfile },
  { id: 'functions',   label: 'Motivation Functions',           Component: MotivationFunctions },
  { id: 'questions',   label: 'Question-wise Analysis',         Component: QuestionWise },
  { id: 'behaviour',   label: 'Volunteering Status & Behaviour',Component: VolunteeringBehaviour },
  { id: 'barriers',    label: 'Barriers',                       Component: Barriers },
  { id: 'subgroup',    label: 'Subgroup Comparison',            Component: SubgroupComparison },
  { id: 'methodology', label: 'Methodology',                    Component: Methodology },
];

function AppInner() {
  const { source, loading, refresh, n } = useData();
  const analytics = useAnalytics();
  const [page, setPage] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(true); // default dark
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    // Always keep dark class; we're dark-first
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const current = PAGES.find(p => p.id === page) ?? PAGES[0];
  const PageComponent = current.Component;

  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        pages={PAGES}
        activePage={page}
        onNavigate={(id) => { setPage(id); setSidebarOpen(false); }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Top bar ── */}
        <header className="sticky top-0 z-20 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 no-print shrink-0">
          {/* Mobile menu */}
          <button
            className="lg:hidden icon-btn shrink-0"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Page title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-zinc-100 truncate">
              {current.label}
            </h1>
            <p className="text-[11px] text-zinc-500 truncate hidden md:block">
              Why Do We Volunteer? — Motivations & Barriers Study
            </p>
          </div>

          {/* Source badge */}
          {source === 'demo' ? (
            <span className="badge-demo shrink-0 hidden xs:inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              Demo
            </span>
          ) : (
            <span className="badge-live shrink-0 hidden xs:inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              Live · n={n}
            </span>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              className="icon-btn"
              onClick={refresh}
              disabled={loading}
              aria-label="Refresh data"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-violet-400' : ''}`} />
            </button>

            <button
              className={`icon-btn ${filterOpen ? 'text-violet-400 bg-violet-500/10' : ''}`}
              onClick={() => setFilterOpen(v => !v)}
              aria-label="Toggle filters"
              title="Filter respondents"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            <button
              className="icon-btn"
              onClick={() => setDark(d => !d)}
              aria-label="Toggle dark mode"
              title={dark ? 'Light mode' : 'Dark mode'}
            >
              {dark
                ? <Sun className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4" />}
            </button>

            <button
              className="hidden sm:flex icon-btn"
              onClick={() => exportAggregatedSummaryCsv(analytics)}
              aria-label="Export CSV"
              title="Export aggregated summary CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Filter bar */}
        {filterOpen && (
          <div className="border-b border-zinc-800/60 no-print shrink-0">
            <FilterBar />
          </div>
        )}

        {/* Page content */}
        <main className="relative flex-1 overflow-auto" id="main-content">
          <AnimatedGridPattern
            numSquares={25}
            maxOpacity={0.04}
            duration={4}
            repeatDelay={1.5}
            className="text-violet-500 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,white,transparent)]"
          />
          <div className="relative z-10 p-3 sm:p-5 md:p-7">
            {loading ? (
              <SkeletonPage />
            ) : (
              <BlurFade key={page} duration={0.3} delay={0.04}>
                <PageComponent />
              </BlurFade>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppInner />
    </DataProvider>
  );
}

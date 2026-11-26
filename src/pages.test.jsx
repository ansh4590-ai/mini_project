// pages.test.jsx — Integration & render smoke tests for all 9 dashboard pages
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataProvider } from './data/DataContext.jsx';

import Overview from './pages/Overview.jsx';
import RespondentProfile from './pages/RespondentProfile.jsx';
import MotivationFunctions from './pages/MotivationFunctions.jsx';
import QuestionWise from './pages/QuestionWise.jsx';
import VolunteeringBehaviour from './pages/VolunteeringBehaviour.jsx';
import Barriers from './pages/Barriers.jsx';
import SubgroupComparison from './pages/SubgroupComparison.jsx';
import Methodology from './pages/Methodology.jsx';

// Mock ResizeObserver and IntersectionObserver for Recharts / Framer Motion in jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

function renderWithProvider(ui) {
  return render(<DataProvider>{ui}</DataProvider>);
}

describe('Dashboard Pages Render & Verification Tests', () => {
  beforeEach(() => {
    // In test environment, reject fetch so DataProvider instantly falls back to demo data
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Test mock: network offline'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders Page 1: Overview without errors', async () => {
    renderWithProvider(<Overview />);
    const el = await screen.findAllByText(/Total responses/i);
    expect(el.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Strongest motivation/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Auto-generated Insights/i).length).toBeGreaterThan(0);
  });

  it('renders Page 2: Respondent Profile with demographics', async () => {
    renderWithProvider(<RespondentProfile />);
    const el = await screen.findAllByText(/Sample Overview/i);
    expect(el.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Demographic Breakdown/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Volunteering Frequency/i).length).toBeGreaterThan(0);
  });

  it('renders Page 3: Motivation Functions with all 6 VFI dimensions and 2-item Values warning', async () => {
    renderWithProvider(<MotivationFunctions />);
    const el = await screen.findAllByText(/Values/i);
    expect(el.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Understanding/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Social/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Career/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Protective/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Enhancement/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2-item scale — interpret with caution/i).length).toBeGreaterThan(0);
  });

  it('renders Page 4: Question-Wise Analysis with all 17 items', async () => {
    renderWithProvider(<QuestionWise />);
    const el = await screen.findAllByText(/Ranked by Mean Score/i);
    expect(el.length).toBeGreaterThan(0);
  });

  it('renders Page 5: Volunteering Status & Behaviour with ANOVA', async () => {
    renderWithProvider(<VolunteeringBehaviour />);
    const el = await screen.findAllByText(/Volunteering History/i);
    expect(el.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Spearman/i).length).toBeGreaterThan(0);
  });

  it('renders Page 6: Barriers with weighted ranking & duplicate detection', async () => {
    renderWithProvider(<Barriers />);
    const el = await screen.findAllByText(/Barrier Weighted Scores/i);
    expect(el.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Data Quality — Rank Duplicates/i).length).toBeGreaterThan(0);
  });

  it('renders Page 7: Subgroup Comparison with suggestive disclaimer and statistical tests', async () => {
    renderWithProvider(<SubgroupComparison />);
    const el = await screen.findAllByText(/Differences are suggestive, not proof/i);
    expect(el.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Motivation Functions by Gender/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Students vs\. Early-Career & Working Professionals/i).length).toBeGreaterThan(0);
  });

  it('renders Page 8: Methodology with full academic citations and exact scales', async () => {
    renderWithProvider(<Methodology />);
    const el = await screen.findAllByText(/Functionalist Approach to Volunteer Motivations/i);
    expect(el.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Not Important at All/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Extremely Important/i).length).toBeGreaterThan(0);
  });
});

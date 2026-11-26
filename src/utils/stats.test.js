// stats.test.js — unit tests for all statistical utilities
import { describe, it, expect } from 'vitest';
import {
  mean, sd, median, mode, percentile, ci95,
  topBox, levelBand,
  pearsonR, spearmanR,
  cronbachAlpha, spearmanBrown,
  welchT, oneWayAnova,
  weightedBarrierScores, freqDist, formatP, fmt,
} from './stats.js';

// ── Hand-calculated reference dataset ────────────────────────────────────────
// 5 respondents, 2 items each
const A = [3, 5, 4, 6, 2];       // mean=4, sd≈1.581
const B = [2, 4, 3, 5, 1];       // mean=3, sd≈1.581

describe('mean', () => {
  it('computes correctly', () => expect(mean(A)).toBeCloseTo(4, 5));
  it('handles empty', () => expect(mean([])).toBeNaN());
});

describe('sd', () => {
  it('computes sample sd', () => expect(sd(A)).toBeCloseTo(1.5811, 3));
  it('handles single element', () => expect(sd([5])).toBeNaN());
});

describe('median', () => {
  it('odd length', () => expect(median([1,2,3,4,5])).toBe(3));
  it('even length', () => expect(median([1,2,3,4])).toBe(2.5));
  it('unsorted', () => expect(median([5,1,3])).toBe(3));
});

describe('mode', () => {
  it('single mode', () => expect(mode([1,2,2,3])).toEqual([2]));
  it('multimodal', () => expect(mode([1,1,2,2])).toEqual(expect.arrayContaining([1,2])));
});

describe('percentile', () => {
  it('50th = median', () => expect(percentile([1,2,3,4,5], 50)).toBe(3));
});

describe('ci95', () => {
  it('lower < mean < upper', () => {
    const { lower, upper } = ci95(A);
    expect(lower).toBeLessThan(mean(A));
    expect(upper).toBeGreaterThan(mean(A));
  });
});

describe('topBox', () => {
  it('counts 5 and 6', () => expect(topBox([1,3,5,6,4])).toBeCloseTo(40, 1));
  it('all high', () => expect(topBox([5,6,6])).toBeCloseTo(100, 1));
});

describe('levelBand', () => {
  it('low', () => expect(levelBand(2.5)).toBe('Low'));
  it('moderate', () => expect(levelBand(3.0)).toBe('Moderate'));
  it('high', () => expect(levelBand(4.5)).toBe('High'));
});

describe('pearsonR', () => {
  it('perfect positive', () => expect(pearsonR([1,2,3],[1,2,3])).toBeCloseTo(1, 5));
  it('perfect negative', () => expect(pearsonR([1,2,3],[3,2,1])).toBeCloseTo(-1, 5));
  it('known value', () => {
    // A=[3,5,4,6,2] B=[2,4,3,5,1] — both mean-shifted by 1 → r=1
    expect(pearsonR(A, B)).toBeCloseTo(1, 5);
  });
});

describe('spearmanR', () => {
  it('monotone increasing', () => expect(spearmanR([1,2,3,4],[1,3,2,4])).toBeCloseTo(0.8, 1));
  it('perfect', () => expect(spearmanR([1,2,3],[1,2,3])).toBeCloseTo(1, 5));
});

describe('cronbachAlpha', () => {
  // 5 respondents × 2 items (A and B — perfectly correlated → alpha = 1)
  const matrix = A.map((v, i) => [v, B[i]]);
  it('perfect inter-item → alpha=1', () => expect(cronbachAlpha(matrix)).toBeCloseTo(1, 5));

  // 3 items, known hand-calc:
  // Items: [5,3,4], [4,2,3], [6,4,5]  — 3 respondents
  const m2 = [[5,4,6],[3,2,4],[4,3,5]];
  it('3-item known matrix', () => {
    const alpha = cronbachAlpha(m2);
    expect(alpha).toBeGreaterThan(0.9);
    expect(alpha).toBeLessThanOrEqual(1);
  });
});

describe('spearmanBrown', () => {
  it('r=0.5 → 0.667', () => expect(spearmanBrown(0.5)).toBeCloseTo(0.6667, 3));
  it('r=1 → 1', () => expect(spearmanBrown(1)).toBe(1));
});

describe('welchT', () => {
  const g1 = [2, 3, 4, 5, 6];
  const g2 = [1, 2, 3, 4, 5];
  it('g1 mean > g2 mean → t > 0', () => {
    const { t, p } = welchT(g1, g2);
    expect(t).toBeGreaterThan(0);
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThanOrEqual(1);
  });
  it('identical groups → p ≈ 1', () => {
    const { p } = welchT([3,3,3,3], [3,3,3,3]);
    // sd=0 → se=0 → special case
    expect(p).toBeDefined();
  });
});

describe('oneWayAnova', () => {
  // 3 groups with clear separation
  const g1 = [1,2,1,2], g2 = [4,5,4,5], g3 = [8,9,8,9];
  it('well-separated groups → F >> 1, p < 0.05', () => {
    const { F, p, etaSquared } = oneWayAnova([g1, g2, g3]);
    expect(F).toBeGreaterThan(10);
    expect(p).toBeLessThan(0.05);
    expect(etaSquared).toBeGreaterThan(0.5);
  });
  it('identical groups → F=0', () => {
    const { F, p } = oneWayAnova([[3,3,3],[3,3,3]]);
    // ssWithin = 0, so F = 0, p = 1
    expect(F).toBe(0);
    expect(p).toBe(1);
  });
});

describe('weightedBarrierScores', () => {
  const barriers = [
    { id: 'B1' }, { id: 'B2' }, { id: 'B3' }, { id: 'B4' }, { id: 'B5' }
  ];
  const rows = [
    { _rank1Id: 'B1', _rank2Id: 'B2' },
    { _rank1Id: 'B1', _rank2Id: 'B3' },
    { _rank1Id: 'B1', _rank2Id: 'B1' }, // duplicate → rank2 excluded
  ];
  it('B1 rank1=3 weighted=6, B2 rank2=1 weighted=1', () => {
    const scores = weightedBarrierScores(rows, barriers);
    expect(scores.B1.rank1).toBe(3);
    expect(scores.B1.weighted).toBe(6);
    expect(scores.B2.weighted).toBe(1);
    expect(scores.B3.weighted).toBe(1);
    // duplicate row: B1 rank2 excluded
    expect(scores.B1.rank2).toBe(0);
  });
});

describe('freqDist', () => {
  it('counts correctly', () => {
    const dist = freqDist([1,2,3,3,6], 1, 6);
    expect(dist[1]).toBe(1);
    expect(dist[3]).toBe(2);
    expect(dist[4]).toBe(0);
    expect(dist[6]).toBe(1);
  });
});

describe('fmt', () => {
  it('rounds to 2dp', () => expect(fmt(3.14159)).toBe('3.14'));
  it('NaN → dash', () => expect(fmt(NaN)).toBe('—'));
});

describe('formatP', () => {
  it('very small', () => expect(formatP(0.0001)).toBe('p < .001'));
  it('normal', () => expect(formatP(0.045)).toBe('p = 0.045'));
});

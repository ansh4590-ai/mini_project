// demoData.js — 150 realistic generated respondents
// Natural variation, some messy rows, some Rank1=Rank2 duplicates
import {
  AGE_OPTIONS, GENDER_OPTIONS, STATUS_OPTIONS, EVER_OPTIONS,
  FREQ_OPTIONS, BARRIERS, ITEMS,
} from '../config.js';

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function pickWeighted(rng, options, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < options.length; i++) {
    r -= weights[i];
    if (r <= 0) return options[i];
  }
  return options[options.length - 1];
}

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

function normalSample(rng, mu, sigma) {
  // Box-Muller
  const u1 = rng(), u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1 + 1e-9)) * Math.cos(2 * Math.PI * u2);
  return mu + sigma * z;
}

// Function-level mean profiles (mu, sigma on 1-6 scale)
const FN_PROFILE = {
  VALUES:        { mu: 4.9, sigma: 0.8 },
  UNDERSTANDING: { mu: 4.5, sigma: 0.9 },
  SOCIAL:        { mu: 3.8, sigma: 1.0 },
  CAREER:        { mu: 4.2, sigma: 1.0 },
  PROTECTIVE:    { mu: 3.2, sigma: 1.1 },
  ENHANCEMENT:   { mu: 4.6, sigma: 0.8 },
};

// Generate timestamps spread over last 14 days
function makeTimestamp(rng, daysAgo) {
  const now = new Date('2026-11-06T18:00:00+05:30');
  const ms = now.getTime() - rng() * daysAgo * 24 * 60 * 60 * 1000;
  return new Date(ms).toISOString();
}

export function generateDemoData(n = 150) {
  const rows = [];

  for (let i = 0; i < n; i++) {
    const rng2 = seededRandom(i * 997 + 1);

    // Demographics
    const age    = pickWeighted(rng2, AGE_OPTIONS, [3, 35, 45, 25, 15, 5]);
    const gender = pickWeighted(rng2, GENDER_OPTIONS, [45, 48, 7]);
    const status = pickWeighted(rng2, STATUS_OPTIONS,
      [30, 25, 20, 20, 5]);

    const isStudent = status.includes('Student');

    const ever = pickWeighted(rng2, EVER_OPTIONS,
      isStudent ? [30, 45, 25] : [45, 40, 15]);

    const neverVol = ever === EVER_OPTIONS[2];
    const freqOpts = FREQ_OPTIONS.map(f => f.label);
    const freq = neverVol
      ? 'Never'
      : pickWeighted(rng2, freqOpts.slice(0, 4), [15, 30, 35, 20]);

    // VFI item scores
    const itemScores = {};
    ITEMS.forEach(item => {
      const { mu, sigma } = FN_PROFILE[item.fn];
      // Career items lower for students; Protective lower for professionals
      let adjMu = mu;
      if (item.fn === 'CAREER' && isStudent) adjMu += 0.4;
      if (item.fn === 'PROTECTIVE' && neverVol) adjMu -= 0.5;
      if (item.fn === 'SOCIAL' && neverVol) adjMu -= 0.6;
      const raw = normalSample(rng2, adjMu, sigma);
      itemScores[item.id] = clamp(Math.round(raw), 1, 6);
    });

    // Barriers
    const barrierIds = BARRIERS.map(b => b.id);
    // Weights shift based on status
    const bWeights = isStudent
      ? [40, 15, 20, 15, 10]
      : [30, 15, 15, 20, 20];

    const rank1Idx = barrierIds.indexOf(pickWeighted(rng2, barrierIds, bWeights));
    let rank2Weights = [...bWeights];

    // Introduce ~8% Rank1=Rank2 duplicates deliberately
    const makeDup = rng2() < 0.08;
    let rank2Idx;
    if (makeDup) {
      rank2Idx = rank1Idx;
    } else {
      rank2Weights[rank1Idx] = 0;
      rank2Idx = barrierIds.indexOf(pickWeighted(rng2, barrierIds, rank2Weights));
    }

    const barrier1 = BARRIERS[rank1Idx];
    const barrier2 = BARRIERS[rank2Idx];

    // Introduce a few messy rows (missing items)
    const isMessy = rng2() < 0.04;
    if (isMessy) {
      // drop one random item score
      const dropId = ITEMS[Math.floor(rng2() * ITEMS.length)].id;
      delete itemScores[dropId];
    }

    rows.push({
      _timestamp: makeTimestamp(rng2, 14),
      _age: age,
      _gender: gender,
      _status: status,
      _ever: ever,
      _freq: freq,
      ...itemScores,
      _rank1Id: barrier1.id,
      _rank1Label: `${barrier1.prefix}. ${barrier1.text}`,
      _rank2Id: barrier2.id,
      _rank2Label: `${barrier2.prefix}. ${barrier2.text}`,
    });
  }

  return rows;
}

export const DEMO_DATA = generateDemoData(150);


// useAnalytics.js — derives all statistics from filtered rows
import { useMemo } from 'react';
import { useData } from '../data/DataContext.jsx';
import {
  ITEMS, FUNCTIONS, FUNCTION_COLORS, FUNCTION_LABELS, BARRIERS,
} from '../config.js';
import {
  mean, sd, median, mode, ci95, topBox, levelBandCounts,
  pearsonR, spearmanR, cronbachAlpha, spearmanBrown,
  welchT, oneWayAnova, weightedBarrierScores, freqDist, formatP, fmt,
} from '../utils/stats.js';

function getActiveItems(fn) {
  return ITEMS.filter(i => i.fn === fn && i.active);
}

function compositeScore(row, fn) {
  const items = getActiveItems(fn);
  const vals = items.map(i => row[i.id]).filter(v => !isNaN(v) && v !== null && v !== undefined);
  return vals.length >= Math.ceil(items.length / 2) ? mean(vals) : NaN;
}

export function useAnalytics() {
  const { filteredRows } = useData();

  return useMemo(() => {
    const rows = filteredRows;
    const n = rows.length;
    if (n === 0) return null;

    // ── Function composites ───────────────────────────────────────────────────
    const fnData = {};
    FUNCTIONS.forEach(fn => {
      const activeItems = getActiveItems(fn);
      const composites = rows.map(r => compositeScore(r, fn)).filter(v => !isNaN(v));
      const matrix      = rows
        .map(r => activeItems.map(i => r[i.id]))
        .filter(row => row.every(v => !isNaN(v)));

      const alpha = cronbachAlpha(matrix);
      const sb    = fn === 'VALUES' && activeItems.length === 2
        ? spearmanBrown(pearsonR(
            rows.map(r => r[activeItems[0].id]).filter(v => !isNaN(v)),
            rows.map(r => r[activeItems[1].id]).filter(v => !isNaN(v))
          ))
        : null;

      const interItemR = fn === 'VALUES' && activeItems.length === 2
        ? pearsonR(
            rows.map(r => r[activeItems[0].id]).filter(v => !isNaN(v)),
            rows.map(r => r[activeItems[1].id]).filter(v => !isNaN(v))
          )
        : null;

      const m  = mean(composites);
      const { lower: ciLo, upper: ciHi } = ci95(composites);

      fnData[fn] = {
        fn,
        label: FUNCTION_LABELS[fn],
        color: FUNCTION_COLORS[fn],
        activeItems,
        composites,
        mean: m,
        sd: sd(composites),
        median: median(composites),
        ci95: { lower: ciLo, upper: ciHi },
        topBox: topBox(composites),
        bands: levelBandCounts(composites),
        bandPct: (() => {
          const lbc = levelBandCounts(composites);
          const total = composites.length;
          return total > 0
            ? { Low: lbc.Low/total*100, Moderate: lbc.Moderate/total*100, High: lbc.High/total*100 }
            : { Low: 0, Moderate: 0, High: 0 };
        })(),
        alpha,
        sb,
        interItemR,
        is2Item: fn === 'VALUES' && activeItems.length === 2,
      };
    });

    // ── Item-level stats ──────────────────────────────────────────────────────
    const itemStats = {};
    ITEMS.filter(i => i.active).forEach(item => {
      const vals = rows.map(r => r[item.id]).filter(v => !isNaN(v) && v >= 1 && v <= 6);
      const dist = freqDist(vals, 1, 6);
      const total = vals.length;
      itemStats[item.id] = {
        item,
        vals,
        n: total,
        mean: mean(vals),
        sd: sd(vals),
        median: median(vals),
        mode: mode(vals),
        topBox: topBox(vals),
        dist,
        distPct: Object.fromEntries(
          Object.entries(dist).map(([k, v]) => [k, total > 0 ? v / total * 100 : 0])
        ),
      };
    });

    // ── Cross-item Pearson r matrix ───────────────────────────────────────────
    const activeItemIds = ITEMS.filter(i => i.active).map(i => i.id);
    const itemCorr = {};
    activeItemIds.forEach(id1 => {
      itemCorr[id1] = {};
      activeItemIds.forEach(id2 => {
        // Align pairs
        const pairs = rows.reduce((acc, r) => {
          if (!isNaN(r[id1]) && !isNaN(r[id2])) acc.push([r[id1], r[id2]]);
          return acc;
        }, []);
        itemCorr[id1][id2] = pairs.length >= 3 ? pearsonR(pairs.map(p => p[0]), pairs.map(p => p[1])) : NaN;
      });
    });

    // ── Function × function Pearson r ─────────────────────────────────────────
    const fnCorr = {};
    FUNCTIONS.forEach(fn1 => {
      fnCorr[fn1] = {};
      FUNCTIONS.forEach(fn2 => {
        const pairs = rows.reduce((acc, r) => {
          const a = compositeScore(r, fn1), b = compositeScore(r, fn2);
          if (!isNaN(a) && !isNaN(b)) acc.push([a, b]);
          return acc;
        }, []);
        fnCorr[fn1][fn2] = pairs.length >= 3
          ? pearsonR(pairs.map(p=>p[0]), pairs.map(p=>p[1]))
          : NaN;
      });
    });

    // ── Barriers ──────────────────────────────────────────────────────────────
    const barrierScores = weightedBarrierScores(rows, BARRIERS);
    const totalRespondents = rows.length;
    const barrierPct = {};
    BARRIERS.forEach(b => {
      const inEither = rows.filter(r => r._rank1Id === b.id || r._rank2Id === b.id).length;
      barrierPct[b.id] = totalRespondents > 0 ? inEither / totalRespondents * 100 : 0;
    });
    const rankDups = rows.filter(r => r._rank1Id && r._rank2Id && r._rank1Id === r._rank2Id).length;

    // ── Volunteering history groups ───────────────────────────────────────────
    const historyGroups = {
      'Currently volunteers': rows.filter(r => r._ever === 'Yes, I currently volunteer'),
      'Volunteered in past':  rows.filter(r => r._ever === 'Yes, I have volunteered in the past'),
      'Never volunteered':    rows.filter(r => r._ever === 'No, I have never volunteered'),
    };

    const fnByHistory = {};
    FUNCTIONS.forEach(fn => {
      fnByHistory[fn] = Object.entries(historyGroups).map(([label, grp]) => {
        const scores = grp.map(r => compositeScore(r, fn)).filter(v => !isNaN(v));
        return { label, mean: mean(scores), n: scores.length, scores };
      });
    });

    // ANOVA per function across the 3 history groups
    const fnHistoryAnova = {};
    FUNCTIONS.forEach(fn => {
      const groups = Object.values(historyGroups).map(grp =>
        grp.map(r => compositeScore(r, fn)).filter(v => !isNaN(v))
      );
      fnHistoryAnova[fn] = oneWayAnova(groups);
    });

    // Spearman r: freq × each function
    const fnFreqCorr = {};
    FUNCTIONS.forEach(fn => {
      const pairs = rows.reduce((acc, r) => {
        const freq = r._freqNum;
        const comp = compositeScore(r, fn);
        if (freq && !isNaN(comp)) acc.push([freq, comp]);
        return acc;
      }, []);
      fnFreqCorr[fn] = pairs.length >= 3
        ? spearmanR(pairs.map(p=>p[0]), pairs.map(p=>p[1]))
        : NaN;
    });

    // ── Subgroup: gender ───────────────────────────────────────────────────────
    const genderGroups = {
      Male:   rows.filter(r => r._gender === 'Male'),
      Female: rows.filter(r => r._gender === 'Female'),
      Other:  rows.filter(r => r._gender === 'Other'),
    };
    const fnByGender = {};
    FUNCTIONS.forEach(fn => {
      const mScores = genderGroups.Male.map(r => compositeScore(r, fn)).filter(v => !isNaN(v));
      const fScores = genderGroups.Female.map(r => compositeScore(r, fn)).filter(v => !isNaN(v));
      const tTest = welchT(mScores, fScores);
      fnByGender[fn] = {
        groups: { Male: { mean: mean(mScores), n: mScores.length }, Female: { mean: mean(fScores), n: fScores.length } },
        tTest,
      };
    });

    // ── Subgroup: students vs professionals ───────────────────────────────────
    const studentRows = rows.filter(r => r._status?.includes('Student'));
    const profRows    = rows.filter(r => r._status?.includes('Professional'));
    const fnByStatusGroup = {};
    FUNCTIONS.forEach(fn => {
      const sScores = studentRows.map(r => compositeScore(r, fn)).filter(v => !isNaN(v));
      const pScores = profRows.map(r => compositeScore(r, fn)).filter(v => !isNaN(v));
      fnByStatusGroup[fn] = {
        student: { mean: mean(sScores), n: sScores.length },
        professional: { mean: mean(pScores), n: pScores.length },
        tTest: welchT(sScores, pScores),
      };
    });

    // ── Subgroup: age ─────────────────────────────────────────────────────────
    const AGE_OPTS = ['Below 18','18–20','21–23','24–26','27–30','Above 30'];
    const fnByAge = {};
    FUNCTIONS.forEach(fn => {
      const groups = AGE_OPTS.map(ag => ({
        label: ag,
        scores: rows.filter(r => r._age === ag).map(r => compositeScore(r, fn)).filter(v => !isNaN(v)),
      }));
      const anovaGroups = groups.map(g => g.scores).filter(g => g.length > 0);
      fnByAge[fn] = {
        groups: groups.map(g => ({ label: g.label, mean: mean(g.scores), n: g.scores.length })),
        anova: oneWayAnova(anovaGroups),
      };
    });

    // ── Consistency flags ─────────────────────────────────────────────────────
    const consistencyIssues = rows.filter(r => {
      const neverVol = r._ever === 'No, I have never volunteered';
      const freqNever = r._freqNum === 1;
      const currentVol = r._ever === 'Yes, I currently volunteer';
      return (neverVol && !freqNever) || (currentVol && freqNever);
    }).length;

    // ── Auto insights ─────────────────────────────────────────────────────────
    const rankedFns = FUNCTIONS.map(fn => ({ fn, label: FUNCTION_LABELS[fn], mean: fnData[fn].mean }))
      .sort((a, b) => b.mean - a.mean);

    const topBarrier = BARRIERS
      .map(b => ({ b, w: barrierScores[b.id]?.weighted ?? 0 }))
      .sort((a, b) => b.w - a.w)[0]?.b;

    const pctCurrent = n > 0 ? rows.filter(r => r._ever === 'Yes, I currently volunteer').length / n * 100 : 0;
    const pctNever   = n > 0 ? rows.filter(r => r._ever === 'No, I have never volunteered').length / n * 100 : 0;

    const insights = [
      `${rankedFns[0]?.label} is the strongest motivation (M = ${fmt(rankedFns[0]?.mean)}); ${rankedFns[1]?.label} ranks second (M = ${fmt(rankedFns[1]?.mean)}).`,
      `${rankedFns[5]?.label} is the weakest function overall (M = ${fmt(rankedFns[5]?.mean)}).`,
      topBarrier ? `The most common top barrier is "${topBarrier.shortLabel}" (weighted score: ${barrierScores[topBarrier.id]?.weighted}).` : '',
      `${fmt(pctCurrent, 1)}% of respondents currently volunteer; ${fmt(pctNever, 1)}% have never volunteered.`,
      (() => {
        const bestFn = rankedFns[0]?.fn;
        const anova  = fnHistoryAnova[bestFn];
        return anova && !isNaN(anova.p)
          ? `Respondents who currently volunteer score highest on ${rankedFns[0]?.label} (${formatP(anova.p)}).`
          : '';
      })(),
      `Values function has the highest mean (${fmt(fnData.VALUES.mean)}) and ${fnData.VALUES.alpha >= 0.7 ? 'acceptable' : 'marginal'} reliability (α = ${fmt(fnData.VALUES.alpha)}).`,
      rankDups > 0 ? `${rankDups} respondents selected the same barrier for Rank 1 and Rank 2 — their duplicate Rank 2 responses are excluded from weighted scoring.` : 'No Rank 1 = Rank 2 duplicates detected in the current data.',
    ].filter(Boolean);

    return {
      n, rows, fnData, itemStats, itemCorr, fnCorr,
      barrierScores, barrierPct, rankDups,
      historyGroups, fnByHistory, fnHistoryAnova, fnFreqCorr,
      fnByGender, fnByStatusGroup, fnByAge,
      consistencyIssues, pctCurrent, pctNever, rankedFns,
      topBarrier, insights,
    };
  }, [filteredRows]);
}


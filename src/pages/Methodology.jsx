// Methodology.jsx — Methodology, psychometric properties, scoring and citation guide
import React from 'react';
import { SCALE_LABELS } from '../config.js';
import BorderBeam from '../components/magicui/BorderBeam.jsx';
import { BookOpen } from 'lucide-react';

export default function Methodology() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="card relative overflow-hidden border-l-4 border-indigo-600 bg-white/95 dark:bg-slate-900/90 shadow-sm">
        <BorderBeam
          size={180}
          duration={12}
          borderWidth={1.5}
          colorFrom="#6366f1"
          colorTo="#a855f7"
        />
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Research Methodology &amp; Psychometric Framework
          </h1>
        </div>
        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">
          Functionalist Approach to Volunteer Motivations (Clary et al., 1998)
        </p>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          This study investigates the motivational drivers and structural barriers affecting volunteering decisions among Indian undergraduate students, postgraduate students, and early-career working professionals. It adapts the Volunteer Functions Inventory (VFI) to contextual realities while retaining core functionalist dimensions.
        </p>
      </div>

      {/* ── 1. THE 6 MOTIVATION FUNCTIONS ── */}
      <section className="card" aria-label="Volunteer Functions Inventory">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3">
          1. The 6 Motivation Functions (Volunteer Functions Inventory)
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
          According to functionalist theory, individuals can perform the same volunteering activities in pursuit of distinctly different psychological goals. The adapted instrument evaluates 17 items across 6 core functions:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                <th className="py-2.5 px-3 text-left font-semibold w-36">Function</th>
                <th className="py-2.5 px-3 text-left font-semibold">Psychological Purpose</th>
                <th className="py-2.5 px-3 text-center font-semibold w-16">Items</th>
                <th className="py-2.5 px-3 text-left font-semibold">Representative Items in this Study</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-3 font-semibold text-indigo-600 dark:text-indigo-400">Values</td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-300 leading-relaxed">
                  Altruistic, humanitarian, and community-centred concerns for others. Expressing personal convictions and civic duty.
                </td>
                <td className="py-3 px-3 text-center font-mono font-medium">2</td>
                <td className="py-3 px-3 text-slate-500 italic">
                  V1: "I feel it is important to help people or causes I care about, regardless of what I get in return."
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-sky-600 dark:text-sky-400">Understanding</td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-300 leading-relaxed">
                  Opportunities for cognitive growth, learning new perspectives, and understanding diverse social problems firsthand.
                </td>
                <td className="py-3 px-3 text-center font-mono font-medium">3</td>
                <td className="py-3 px-3 text-slate-500 italic">
                  U1: "Volunteering helps me understand people and situations different from my own."
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-emerald-600 dark:text-emerald-400">Social</td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-300 leading-relaxed">
                  Conforming to normative pressures from friends, family, or colleagues; expanding interpersonal networks and group cohesion.
                </td>
                <td className="py-3 px-3 text-center font-mono font-medium">3</td>
                <td className="py-3 px-3 text-slate-500 italic">
                  S2: "Volunteering provides an opportunity to meet new people."
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-amber-600 dark:text-amber-400">Career</td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-300 leading-relaxed">
                  Enhancing professional prospects, acquiring resume-building experience, and developing market-relevant contacts and competencies.
                </td>
                <td className="py-3 px-3 text-center font-mono font-medium">3</td>
                <td className="py-3 px-3 text-slate-500 italic">
                  C2: "I would volunteer if it strengthened my résumé or job applications."
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-rose-600 dark:text-rose-400">Protective</td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-300 leading-relaxed">
                  Ego-defensive motives: shielding the self from guilt about personal privilege, or escaping from personal anxieties and stressors.
                </td>
                <td className="py-3 px-3 text-center font-mono font-medium">3</td>
                <td className="py-3 px-3 text-slate-500 italic">
                  P1: "Volunteering helps me feel less guilty about being more fortunate than others."
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-purple-600 dark:text-purple-400">Enhancement</td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-300 leading-relaxed">
                  Ego-growth motives: cultivating self-worth, feeling needed and valued, and deriving emotional satisfaction and personal accomplishment.
                </td>
                <td className="py-3 px-3 text-center font-mono font-medium">3</td>
                <td className="py-3 px-3 text-slate-500 italic">
                  E1: "Volunteering makes me feel good about myself."
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 2. SCALE LABELS & BENCHMARKS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="card" aria-label="Measurement scale">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
            2. The 6-Point Response Scale
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
            Administered with the exact prompt: <em>"Please rate each statement according to how important it is to you."</em>
          </p>
          <ul className="space-y-1.5 text-xs">
            {Object.entries(SCALE_LABELS).map(([val, label]) => (
              <li key={val} className="flex items-center gap-3 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <span className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0">
                  {val}
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card" aria-label="Score bands">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
            3. Composite Level Bands
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
            Composite motivation scores (mean of active items per function) are segmented into three normative bands:
          </p>
          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
              <div className="flex justify-between font-bold text-emerald-800 dark:text-emerald-300">
                <span>High Importance</span>
                <span>4.50 – 6.00</span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                Dominant psychological priority that actively influences participation choices.
              </p>
            </div>
            <div className="p-2.5 rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/20">
              <div className="flex justify-between font-bold text-sky-800 dark:text-sky-300">
                <span>Moderate Importance</span>
                <span>3.00 – 4.49</span>
              </div>
              <p className="text-[11px] text-sky-700 dark:text-sky-400 mt-1">
                Secondary consideration that contributes conditionally to volunteering decisions.
              </p>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>Low Importance</span>
                <span>1.00 – 2.99</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Minimal motivational pull or psychological relevance for the individual.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ── 4. STATISTICAL PROCEDURES ── */}
      <section className="card" aria-label="Statistical methods">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3">
          4. Statistical Metrics &amp; Computational Formulas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl space-y-1">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Cronbach’s Alpha (α)</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Measures internal consistency reliability: <code className="text-indigo-600 dark:text-indigo-400">α = [k / (k - 1)] * [1 - Σσ²ᵢ / σ²ₜ]</code>. Values ≥ 0.70 represent acceptable psychometric reliability.
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl space-y-1">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Spearman-Brown Correction</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Reliability estimation specifically formulated for 2-item scales (Values): <code className="text-indigo-600 dark:text-indigo-400">r_sb = (2r) / (1 + r)</code>, where r is the inter-item Pearson correlation.
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl space-y-1">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Welch's Two-Sample t-Test</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Compares means between two independent groups without assuming equal variances (e.g., Male vs. Female, Students vs. Professionals). Uses Satterthwaite approximation for degrees of freedom.
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl space-y-1">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">One-Way ANOVA &amp; Eta-Squared (η²)</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Assesses differences across 3+ groups (e.g., volunteering history, age brackets). Effect size: <code className="text-indigo-600 dark:text-indigo-400">η² = SS_between / SS_total</code> (small: 0.01, medium: 0.06, large: 0.14).
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl space-y-1">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Weighted Barrier Scoring</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Rank 1 selections receive 2 points; Rank 2 selections receive 1 point. In cases where Rank 1 = Rank 2 duplicate selections occur, the Rank 2 entry is excluded from weighted aggregation to prevent double-counting.
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl space-y-1">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Spearman Rank Correlation (ρ)</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Non-parametric correlation testing the association between ordinal volunteering frequency (1 = Never to 5 = Very Frequently) and continuous VFI function composites.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. LIMITATIONS & THREATS TO VALIDITY ── */}
      <section className="card border-l-4 border-amber-500" aria-label="Methodological limitations">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
          5. Methodological Limitations &amp; Threats to Validity
        </h2>
        <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <li>
            <strong>Cultural Adaptation of a Western Instrument:</strong> The original VFI was standardized in North American contexts. While functional motives translate across borders, collectivistic cultural norms, filial responsibilities, and specific social capital dynamics in India may modulate how "Social" or "Values" items are interpreted.
          </li>
          <li>
            <strong>Self-Report &amp; Social Desirability Bias:</strong> Highly normative motives such as "Values" and "Understanding" may be inflated due to social desirability biases (participants reporting what sounds socially commendable).
          </li>
          <li>
            <strong>Shortened 2-Item Scale for Values:</strong> The Values subscale uses 2 items. While convenient for survey completion rates, 2-item scales exhibit lower stability than 3+ item subscales, warranting interpretation alongside Spearman-Brown reliability.
          </li>
          <li>
            <strong>Cross-Sectional Convenience Sampling:</strong> Data collected via digital Google Forms reflects non-probabilistic convenience sampling, predominantly reaching digitally connected students and professionals. Causal inferences cannot be drawn.
          </li>
          <li>
            <strong>Subgroup Sparsity:</strong> Specific demographic cells (e.g., participants &lt; 18 or &gt; 30 years old) may have small sample sizes (n &lt; 5). The dashboard automatically flags and suppresses these cells to preserve statistical validity and participant anonymity.
          </li>
        </ul>
      </section>

      {/* ── 6. CITATION GUIDE ── */}
      <section className="card bg-slate-50 dark:bg-slate-800/80" aria-label="Citation guidelines">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
          6. How to Report and Cite These Results
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
          When reporting findings from this dashboard in empirical manuscripts or organizational reports, report descriptive statistics and reliability metrics using standard APA conventions:
        </p>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-800 dark:text-slate-200">
          "Participants reported high altruistic motivations (Values: M = 4.92, SD = 0.81, 95% CI [4.79, 5.05], Spearman-Brown r = .74), followed by learning motives (Understanding: M = 4.54, SD = 0.88, α = .81). Career motives were significantly stronger among current students than working professionals, t(148) = 3.12, p = .002."
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Primary Reference: Clary, E. G., Snyder, M., Ridge, R. D., Copeland, J., Stukas, A. A., Haugen, J., &amp; Miene, P. (1998). Understanding and assessing the motivations of volunteers: A functional approach. <em>Journal of Personality and Social Psychology</em>, 74(6), 1516–1530.
        </p>
      </section>
    </div>
  );
}

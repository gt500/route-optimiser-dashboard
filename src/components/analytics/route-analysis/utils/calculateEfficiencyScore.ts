
import { EfficiencyScore } from '../components/EfficiencyScoreCard';

export function calculateEfficiencyScore(
  value: number,
  average: number,
  best: number,
  higherIsBetter: boolean
): EfficiencyScore {
  let score: number;
  let label: string;
  let recommendation: string;

  if (isNaN(value) || isNaN(average) || isNaN(best)) {
    console.warn("Received NaN values in efficiency calculation", { value, average, best });
    return {
      score: 50,
      label: "Unknown",
      recommendation: "Insufficient data to provide accurate recommendations."
    };
  }

  if (!higherIsBetter) {
    if (value <= best * 1.05) {
      score = 95;
      label = "Excellent";
      recommendation = "This route is performing at optimal efficiency. Maintain current strategy.";
    } else if (value <= average) {
      const ratio = (average - value) / (average - best);
      score = 75 + 20 * (ratio > 0 ? ratio : 0);
      label = "Good";
      recommendation = "This route performs well, but could be further optimized by adjusting stop order or delivery timing.";
    } else if (value <= average * 1.25) {
      const ratio = (average * 1.25 - value) / (average * 0.25);
      score = 50 + 25 * (ratio > 0 ? ratio : 0);
      label = "Average";
      recommendation = "Consider route adjustments to reduce distance/time/cost. Try consolidating nearby stops or reordering the sequence.";
    } else {
      score = Math.max(30, 50 - 20 * ((value - average * 1.25) / average));
      label = "Below Average";
      recommendation = "This route needs significant optimization. Consider complete redesign, different sequencing, or merging with another route.";
    }
  } else {
    if (value >= best * 0.95) {
      score = 95;
      label = "Excellent";
      recommendation = "This route delivers optimal cylinder volume. Maintain current strategy and customer relationships.";
    } else if (value >= average) {
      const ratio = (value - average) / (best - average);
      score = 75 + 20 * (ratio > 0 ? ratio : 0);
      label = "Good";
      recommendation = "This route delivers good volume, but could be further optimized by adjusting delivery schedules or adding strategic customers.";
    } else if (value >= average * 0.75) {
      const ratio = (value - average * 0.75) / (average * 0.25);
      score = 50 + 25 * (ratio > 0 ? ratio : 0);
      label = "Average";
      recommendation = "Consider adding more delivery points or increasing volumes at existing stops to improve efficiency.";
    } else {
      score = Math.max(30, 50 - 20 * ((average * 0.75 - value) / average));
      label = "Below Average";
      recommendation = "This route has low delivery volume. Consider merging with another route or expanding customer base in this area.";
    }
  }

  score = Math.max(0, Math.min(100, score));

  return { score, label, recommendation };
}

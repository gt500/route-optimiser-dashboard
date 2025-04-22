
import { EfficiencyScore } from '../components/EfficiencyScoreCard';
import { RouteAnalysisMetrics } from '../types';
import { RouteData } from '@/hooks/fleet/useRouteData';
import { format, subDays, subWeeks, subMonths } from 'date-fns';

export const calculateEfficiencyScore = (
  value: number, 
  average: number, 
  best: number, 
  higherIsBetter: boolean
): EfficiencyScore => {
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
};

export const generateRouteAnalytics = (
  routeName: string,
  routeId: string,
  period: 'day' | 'week' | 'month',
  routesForAnalysis: RouteData[],
  allRoutes: RouteData[]
): RouteAnalysisMetrics => {
  console.log("Generating analytics for routes:", routesForAnalysis);
  console.log("All routes for comparison:", allRoutes);
  
  const now = new Date();
  let startDate;
  
  switch(period) {
    case 'day':
      startDate = subDays(now, 1);
      break;
    case 'week':
      startDate = subWeeks(now, 1);
      break;
    case 'month':
      startDate = subMonths(now, 1);
      break;
  }
  
  const periodAllRoutes = allRoutes.filter(
    route => {
      const routeDate = new Date(route.date);
      return routeDate >= startDate && routeDate <= now;
    }
  );
  
  const routeDistances = routesForAnalysis.map(r => r.total_distance || 0);
  
  // Calculate more realistic durations based on distance
  // Using an average speed of 40 km/h = 2/3 km per minute
  // So time in minutes = distance / (2/3) = distance * 1.5
  // Minimum 15 minutes per route
  const routeDurations = routesForAnalysis.map(r => {
    const distance = r.total_distance || 0;
    const calculatedTime = Math.max(15, Math.round(distance * 1.5));
    return calculatedTime;
  });
  
  const routeCosts = routesForAnalysis.map(r => r.estimated_cost || 0);
  const routeCylinders = routesForAnalysis.map(r => r.total_cylinders || 0);
  
  const avgDistance = routeDistances.reduce((a, b) => a + b, 0) / routeDistances.length || 0;
  const avgDuration = routeDurations.reduce((a, b) => a + b, 0) / routeDurations.length || 0;
  const avgCost = routeCosts.reduce((a, b) => a + b, 0) / routeCosts.length || 0;
  const avgCylinders = routeCylinders.reduce((a, b) => a + b, 0) / routeCylinders.length || 0;
  
  const allDistances = periodAllRoutes.length > 0 
    ? periodAllRoutes.map(r => r.total_distance || 0).filter(Boolean)
    : [10, 12, 15, 18, 20];
  
  // Calculate realistic durations for all routes
  const allDurations = periodAllRoutes.length > 0
    ? periodAllRoutes.map(r => {
        const distance = r.total_distance || 0;
        return Math.max(15, Math.round(distance * 1.5));
      }).filter(Boolean)
    : [30, 45, 60, 75, 90];
    
  const allCosts = periodAllRoutes.length > 0
    ? periodAllRoutes.map(r => r.estimated_cost || 0).filter(Boolean)
    : [150, 200, 250, 300, 350];
    
  const allCylinders = periodAllRoutes.length > 0
    ? periodAllRoutes.map(r => r.total_cylinders || 0).filter(Boolean)
    : [10, 15, 20, 25, 30];
  
  const allAvgDistance = allDistances.reduce((a, b) => a + b, 0) / allDistances.length || 0;
  const allAvgDuration = allDurations.reduce((a, b) => a + b, 0) / allDurations.length || 0;
  const allAvgCost = allCosts.reduce((a, b) => a + b, 0) / allCosts.length || 0;
  const allAvgCylinders = allCylinders.reduce((a, b) => a + b, 0) / allCylinders.length || 0;
  
  console.log("Route averages:", { avgDistance, avgDuration, avgCost, avgCylinders });
  console.log("Fleet averages:", { allAvgDistance, allAvgDuration, allAvgCost, allAvgCylinders });
  
  const bestDistance = Math.min(...allDistances.filter(v => v > 0)) || 1;
  const bestDuration = Math.min(...allDurations.filter(v => v > 0)) || 15; // Minimum realistic duration
  const bestCost = Math.min(...allCosts.filter(v => v > 0)) || 1;
  const bestCylinders = Math.max(...allCylinders) || 1;
  
  const distanceScore = calculateEfficiencyScore(avgDistance, allAvgDistance, bestDistance, false);
  const durationScore = calculateEfficiencyScore(avgDuration, allAvgDuration, bestDuration, false);
  const costScore = calculateEfficiencyScore(avgCost, allAvgCost, bestCost, false);
  const cylindersScore = calculateEfficiencyScore(avgCylinders, allAvgCylinders, bestCylinders, true);
  
  const overallScore = (
    distanceScore.score * 0.25 +
    durationScore.score * 0.25 +
    costScore.score * 0.25 +
    cylindersScore.score * 0.25
  );
  
  return {
    distance: {
      value: avgDistance,
      average: allAvgDistance,
      best: bestDistance,
      efficiency: distanceScore
    },
    duration: {
      value: avgDuration,
      average: allAvgDuration,
      best: bestDuration,
      efficiency: durationScore
    },
    cost: {
      value: avgCost,
      average: allAvgCost,
      best: bestCost,
      efficiency: costScore
    },
    cylinders: {
      value: avgCylinders,
      average: allAvgCylinders,
      best: bestCylinders,
      efficiency: cylindersScore
    },
    overallScore
  };
};

export const prepareExportData = (analysis: RouteAnalysisMetrics, routeName: string, period: string) => {
  return [
    {
      siteName: 'Distance Efficiency',
      cylinders: 0,
      kms: analysis.distance.value,
      fuelCost: 0,
      score: Math.round(analysis.distance.efficiency.score),
      fleetAverage: analysis.distance.average.toFixed(1),
      recommendation: analysis.distance.efficiency.recommendation
    },
    {
      siteName: 'Time Efficiency',
      cylinders: 0,
      kms: 0,
      fuelCost: 0,
      score: Math.round(analysis.duration.efficiency.score),
      fleetAverage: `${Math.round(analysis.duration.average)} minutes`,
      recommendation: analysis.duration.efficiency.recommendation
    },
    {
      siteName: 'Cost Efficiency',
      cylinders: 0,
      kms: 0,
      fuelCost: analysis.cost.value,
      score: Math.round(analysis.cost.efficiency.score),
      fleetAverage: `R${analysis.cost.average.toFixed(2)}`,
      recommendation: analysis.cost.efficiency.recommendation
    },
    {
      siteName: 'Delivery Volume',
      cylinders: analysis.cylinders.value,
      kms: 0,
      fuelCost: 0,
      score: Math.round(analysis.cylinders.efficiency.score),
      fleetAverage: `${Math.round(analysis.cylinders.average)} cylinders`,
      recommendation: analysis.cylinders.efficiency.recommendation
    }
  ];
};

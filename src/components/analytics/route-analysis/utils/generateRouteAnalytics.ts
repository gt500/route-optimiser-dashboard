
import { subDays, subWeeks, subMonths } from 'date-fns';
import { RouteData } from '@/hooks/fleet/useRouteData';
import { RouteAnalysisMetrics } from '../types';
import { calculateEfficiencyScore } from './calculateEfficiencyScore';

export function generateRouteAnalytics(
  routeName: string,
  routeId: string,
  period: 'day' | 'week' | 'month',
  routesForAnalysis: RouteData[],
  allRoutes: RouteData[]
): RouteAnalysisMetrics {
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
  const bestDuration = Math.min(...allDurations.filter(v => v > 0)) || 15;
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
}

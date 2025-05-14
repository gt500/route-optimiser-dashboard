
import { calculatePercentChange } from '../analyticsDateUtils';
import { formatPeriodKey, sortByPeriod } from '../analyticsChartUtils';
import type { AnalyticsData, TimePeriod } from '../analyticsTypes';

/**
 * Process analytics data to calculate metrics and prepare chart data
 */
export function processAnalyticsData(
  routesData: any[],
  prevRoutesData: any[],
  deliveriesData: any[],
  locationsData: any[],
  timePeriod: TimePeriod
): AnalyticsData {
  // Summary metrics
  const totalDeliveries = routesData.length || 0;
  const totalCylinders = routesData.reduce((sum, route) => sum + (route.total_cylinders || 0), 0) || 0;
  const totalDistance = routesData.reduce((sum, route) => sum + (route.total_distance || 0), 0) || 0;
  const totalFuelCost = routesData.reduce((sum, route) => sum + (route.estimated_cost || 0), 0) || 0;
  const avgRouteLength = totalDeliveries ? totalDistance / totalDeliveries : 0;

  // Previous metrics for comparison
  const prevTotalDeliveries = prevRoutesData.length || 0;
  const prevTotalCylinders = prevRoutesData.reduce((sum, route) => sum + (route.total_cylinders || 0), 0) || 0;
  const prevTotalDistance = prevRoutesData.reduce((sum, route) => sum + (route.total_distance || 0), 0) || 0;
  const prevTotalFuelCost = prevRoutesData.reduce((sum, route) => sum + (route.estimated_cost || 0), 0) || 0;
  const prevAvgRouteLength = prevTotalDeliveries ? prevTotalDistance / prevTotalDeliveries : 0;

  // Calculate percent changes
  const deliveriesChange = calculatePercentChange(totalDeliveries, prevTotalDeliveries);
  const cylindersChange = calculatePercentChange(totalCylinders, prevTotalCylinders);
  const fuelCostChange = calculatePercentChange(totalFuelCost, prevTotalFuelCost);
  const routeLengthChange = calculatePercentChange(avgRouteLength, prevAvgRouteLength);

  // Process period data for charts
  const deliveriesByPeriod: Record<string, number> = {};
  const fuelByPeriod: Record<string, number> = {};
  
  // Process data for charts in a single pass
  routesData.forEach(route => {
    if (!route.date) return;
    const periodKey = formatPeriodKey(route.date, timePeriod);
    deliveriesByPeriod[periodKey] = (deliveriesByPeriod[periodKey] || 0) + 1;
    fuelByPeriod[periodKey] = (fuelByPeriod[periodKey] || 0) + (route.estimated_cost || 0);
  });

  // Process delivery data
  const periodRouteIds = routesData.map(route => route.id) || [];
  const periodDeliveries = deliveriesData.filter(delivery => 
    periodRouteIds.includes(delivery.route_id || '')
  ) || [];

  // Map locations to deliveries
  const deliveriesByLocation: Record<string, number> = {};
  periodDeliveries.forEach(delivery => {
    if (!delivery.location_id) return;
    const location = locationsData.find(loc => loc.id === delivery.location_id);
    if (location) {
      const locationName = location.name;
      deliveriesByLocation[locationName] = (deliveriesByLocation[locationName] || 0) + (delivery.cylinders || 0);
    }
  });

  // Sort and format chart data
  const sortedDeliveriesByPeriod = sortByPeriod(Object.entries(deliveriesByPeriod), timePeriod);
  const sortedFuelByPeriod = sortByPeriod(Object.entries(fuelByPeriod), timePeriod);

  const monthlyDeliveriesData = sortedDeliveriesByPeriod.map(([name, value]) => ({ name, value }));
  const fuelConsumptionData = sortedFuelByPeriod.map(([name, value]) => ({ name, value }));

  const routeDistributionData = Object.entries(deliveriesByLocation)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Cost breakdown
  const totalCost = totalFuelCost;
  const fuelPercentage = 45; // 45% of total cost
  const maintenancePercentage = 20;
  const laborPercentage = 25;
  const otherPercentage = 10;

  const costBreakdownData = [
    { name: 'Fuel', value: Math.round((fuelPercentage / 100) * totalCost) },
    { name: 'Maintenance', value: Math.round((maintenancePercentage / 100) * totalCost) },
    { name: 'Labor', value: Math.round((laborPercentage / 100) * totalCost) },
    { name: 'Other', value: Math.round((otherPercentage / 100) * totalCost) }
  ];

  return {
    deliveries: totalDeliveries,
    deliveriesChange: Math.round(deliveriesChange),
    cylinders: totalCylinders,
    cylindersChange: Math.round(cylindersChange),
    distance: totalDistance,
    fuelCost: totalFuelCost,
    fuelCostChange: Math.round(fuelCostChange),
    routeLength: avgRouteLength,
    routeLengthChange: Math.round(routeLengthChange),
    monthlyDeliveries: monthlyDeliveriesData,
    fuelConsumption: fuelConsumptionData,
    routeDistribution: routeDistributionData,
    costBreakdown: costBreakdownData
  };
}

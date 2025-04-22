
import { RouteAnalysisMetrics } from '../types';

export function prepareExportData(analysis: RouteAnalysisMetrics, routeName: string, period: string) {
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
}


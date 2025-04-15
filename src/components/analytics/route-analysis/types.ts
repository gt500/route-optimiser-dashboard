
import { EfficiencyScore } from './components/EfficiencyScoreCard';

export type AnalysisPeriod = 'day' | 'week' | 'month';

export interface RouteAnalysisMetrics {
  distance: {
    value: number;
    average: number;
    best: number;
    efficiency: EfficiencyScore;
  };
  duration: {
    value: number;
    average: number;
    best: number;
    efficiency: EfficiencyScore;
  };
  cost: {
    value: number;
    average: number;
    best: number;
    efficiency: EfficiencyScore;
  };
  cylinders: {
    value: number;
    average: number;
    best: number;
    efficiency: EfficiencyScore;
  };
  overallScore: number;
}

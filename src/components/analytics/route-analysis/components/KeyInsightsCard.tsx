
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { RouteAnalysisMetrics } from '../types';

interface KeyInsightsCardProps {
  analysis: RouteAnalysisMetrics;
  routeName: string;
  period: 'day' | 'week' | 'month';
}

const KeyInsightsCard: React.FC<KeyInsightsCardProps> = ({ 
  analysis, 
  routeName, 
  period 
}) => {
  const getPerformanceSummary = () => {
    const { distance, cost, cylinders, overallScore } = analysis;
    
    return (
      <p className="text-sm text-muted-foreground">
        {routeName} {period === 'day' ? 'today' : period === 'week' ? 'this week' : 'this month'} is 
        {overallScore >= 70 ? ' outperforming ' : ' underperforming compared to '}
        the fleet average. 
        {distance.value < distance.average ? 
          ` The route's distance is ${((distance.average - distance.value) / distance.average * 100).toFixed(0)}% shorter than average, ` : 
          ` The route's distance is ${((distance.value - distance.average) / distance.average * 100).toFixed(0)}% longer than average, `}
        {cost.value < cost.average ? 
          `costs are ${((cost.average - cost.value) / cost.average * 100).toFixed(0)}% lower, ` : 
          `costs are ${((cost.value - cost.average) / cost.average * 100).toFixed(0)}% higher, `}
        and 
        {cylinders.value > cylinders.average ? 
          ` delivers ${((cylinders.value - cylinders.average) / cylinders.average * 100).toFixed(0)}% more cylinders than the average route.` : 
          ` delivers ${((cylinders.average - cylinders.value) / cylinders.average * 100).toFixed(0)}% fewer cylinders than the average route.`}
      </p>
    );
  };

  const getRecommendations = () => {
    const { distance, duration, cost, cylinders, overallScore } = analysis;
    
    return (
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
        {distance.efficiency.score < 70 && (
          <li>Optimize route sequence to reduce total distance traveled</li>
        )}
        {duration.efficiency.score < 70 && (
          <li>Reduce delivery time windows and improve loading procedures</li>
        )}
        {cost.efficiency.score < 70 && (
          <li>Review fuel consumption and consider more economical routing</li>
        )}
        {cylinders.efficiency.score < 70 && (
          <li>Consider consolidating deliveries or adding more stops to this route</li>
        )}
        {overallScore >= 70 && (
          <li>Maintain current route structure as it's performing well</li>
        )}
        {overallScore >= 90 && (
          <li>Document this route's logistics as a best practice model</li>
        )}
      </ul>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Key Insights & Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            {analysis.overallScore >= 70 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-amber-500" />
            )}
            Performance Summary
          </h4>
          {getPerformanceSummary()}
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Primary Recommendations</h4>
          {getRecommendations()}
        </div>
      </CardContent>
    </Card>
  );
};

export default KeyInsightsCard;

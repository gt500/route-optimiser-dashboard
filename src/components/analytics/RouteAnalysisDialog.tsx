
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Info, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { useRouteData } from '@/hooks/fleet/useRouteData';
import { toast } from 'sonner';
import { format, subDays, subWeeks, subMonths } from 'date-fns';

interface RouteAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routeId: string;
  routeName: string;
  routeColor: string;
}

type AnalysisPeriod = 'day' | 'week' | 'month';

interface EfficiencyScore {
  score: number;
  label: string;
  recommendation: string;
}

interface RouteAnalysisMetrics {
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

const RouteAnalysisDialog: React.FC<RouteAnalysisDialogProps> = ({
  open,
  onOpenChange,
  routeId,
  routeName,
  routeColor
}) => {
  const [period, setPeriod] = useState<AnalysisPeriod>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<RouteAnalysisMetrics | null>(null);
  const { fetchRouteData, fetchRouteDataByName } = useRouteData();

  useEffect(() => {
    if (open) {
      generateRouteAnalysis();
    }
  }, [open, routeId, routeName, period]);

  const generateRouteAnalysis = async () => {
    setIsLoading(true);
    
    try {
      // Fetch route data
      const allRoutes = await fetchRouteData();
      const specificRoutes = await fetchRouteDataByName(routeName);
      
      if (!specificRoutes.length) {
        toast.error(`No data available for route: ${routeName}`);
        setIsLoading(false);
        return;
      }

      // Get date ranges based on period
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
      
      // Filter routes by period
      const periodSpecificRoutes = specificRoutes.filter(
        route => new Date(route.date) >= startDate && new Date(route.date) <= now
      );
      
      const periodAllRoutes = allRoutes.filter(
        route => new Date(route.date) >= startDate && new Date(route.date) <= now
      );
      
      if (!periodSpecificRoutes.length) {
        // If no routes in period, use the most recent route
        specificRoutes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        periodSpecificRoutes.push(specificRoutes[0]);
      }
      
      if (!periodAllRoutes.length) {
        toast.error('No data available for analysis in the selected time period');
        setIsLoading(false);
        return;
      }
      
      // Calculate metrics
      const routeDistances = periodSpecificRoutes.map(r => r.total_distance || 0);
      const routeDurations = periodSpecificRoutes.map(r => (r.total_duration || 0) / 60); // Convert to minutes
      const routeCosts = periodSpecificRoutes.map(r => r.estimated_cost || 0);
      const routeCylinders = periodSpecificRoutes.map(r => r.total_cylinders || 0);
      
      const avgDistance = routeDistances.reduce((a, b) => a + b, 0) / routeDistances.length;
      const avgDuration = routeDurations.reduce((a, b) => a + b, 0) / routeDurations.length;
      const avgCost = routeCosts.reduce((a, b) => a + b, 0) / routeCosts.length;
      const avgCylinders = routeCylinders.reduce((a, b) => a + b, 0) / routeCylinders.length;
      
      // Calculate averages across all routes
      const allDistances = periodAllRoutes.map(r => r.total_distance || 0);
      const allDurations = periodAllRoutes.map(r => (r.total_duration || 0) / 60);
      const allCosts = periodAllRoutes.map(r => r.estimated_cost || 0);
      const allCylinders = periodAllRoutes.map(r => r.total_cylinders || 0);
      
      const allAvgDistance = allDistances.reduce((a, b) => a + b, 0) / allDistances.length;
      const allAvgDuration = allDurations.reduce((a, b) => a + b, 0) / allDurations.length;
      const allAvgCost = allCosts.reduce((a, b) => a + b, 0) / allCosts.length;
      const allAvgCylinders = allCylinders.reduce((a, b) => a + b, 0) / allCylinders.length;
      
      // Find best values
      const bestDistance = Math.min(...allDistances.filter(v => v > 0));
      const bestDuration = Math.min(...allDurations.filter(v => v > 0));
      const bestCost = Math.min(...allCosts.filter(v => v > 0));
      const bestCylinders = Math.max(...allCylinders);
      
      // Calculate efficiency scores based on comparison with average and best
      const distanceScore = calculateEfficiencyScore(avgDistance, allAvgDistance, bestDistance, false);
      const durationScore = calculateEfficiencyScore(avgDuration, allAvgDuration, bestDuration, false);
      const costScore = calculateEfficiencyScore(avgCost, allAvgCost, bestCost, false);
      const cylindersScore = calculateEfficiencyScore(avgCylinders, allAvgCylinders, bestCylinders, true);
      
      // Overall score (weighted average)
      const overallScore = (
        distanceScore.score * 0.25 +
        durationScore.score * 0.25 +
        costScore.score * 0.25 +
        cylindersScore.score * 0.25
      );
      
      setAnalysis({
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
      });
      
    } catch (error) {
      console.error('Error generating route analysis:', error);
      toast.error('Failed to generate route analysis');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate efficiency score and recommendations
  const calculateEfficiencyScore = (
    value: number, 
    average: number, 
    best: number, 
    higherIsBetter: boolean
  ): EfficiencyScore => {
    let score: number;
    let label: string;
    let recommendation: string;
    
    // For metrics where lower is better (distance, duration, cost)
    if (!higherIsBetter) {
      if (value <= best * 1.05) {
        // Within 5% of best value
        score = 95;
        label = "Excellent";
        recommendation = "This route is performing at optimal efficiency. Maintain current strategy.";
      } else if (value <= average) {
        // Better than average but not excellent
        score = 75 + 20 * ((average - value) / (average - best));
        label = "Good";
        recommendation = "This route performs well, but could be further optimized.";
      } else if (value <= average * 1.25) {
        // Worse than average but within 25%
        score = 50 + 25 * ((average * 1.25 - value) / (average * 0.25));
        label = "Average";
        recommendation = "Consider route adjustments to reduce distance/time/cost.";
      } else {
        // Significantly worse than average
        score = Math.max(30, 50 - 20 * ((value - average * 1.25) / average));
        label = "Below Average";
        recommendation = "This route needs significant optimization. Consider complete redesign.";
      }
    } 
    // For metrics where higher is better (cylinders)
    else {
      if (value >= best * 0.95) {
        // Within 5% of best value
        score = 95;
        label = "Excellent";
        recommendation = "This route delivers optimal cylinder volume. Maintain current strategy.";
      } else if (value >= average) {
        // Better than average but not excellent
        score = 75 + 20 * ((value - average) / (best - average));
        label = "Good";
        recommendation = "This route delivers good volume, but could be further optimized.";
      } else if (value >= average * 0.75) {
        // Worse than average but within 25%
        score = 50 + 25 * ((value - average * 0.75) / (average * 0.25));
        label = "Average";
        recommendation = "Consider adding more delivery points or increasing volumes.";
      } else {
        // Significantly worse than average
        score = Math.max(30, 50 - 20 * ((average * 0.75 - value) / average));
        label = "Below Average";
        recommendation = "This route has low delivery volume. Consider merging with another route.";
      }
    }
    
    return { score, label, recommendation };
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 75) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (score >= 50) return <Info className="h-5 w-5 text-amber-500" />;
    return <AlertTriangle className="h-5 w-5 text-red-500" />;
  };

  const getProgressColor = (score: number): string => {
    if (score >= 90) return 'bg-green-600';
    if (score >= 75) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${routeColor}`}></div>
            <span>AI Analysis: {routeName}</span>
          </DialogTitle>
          <DialogDescription>
            AI-powered efficiency analysis and recommendations
          </DialogDescription>
        </DialogHeader>

        <Tabs 
          defaultValue="week" 
          className="w-full"
          onValueChange={(value) => setPeriod(value as AnalysisPeriod)}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="day">Daily Analysis</TabsTrigger>
            <TabsTrigger value="week">Weekly Analysis</TabsTrigger>
            <TabsTrigger value="month">Monthly Analysis</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Analyzing route performance...</span>
          </div>
        ) : analysis ? (
          <div className="space-y-6">
            <Card className="border-t-4 border-primary">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Overall Efficiency Score</span>
                  <span className={`text-2xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                    {Math.round(analysis.overallScore)}%
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress 
                  value={analysis.overallScore} 
                  className="h-3"
                  indicatorClassName={getProgressColor(analysis.overallScore)}
                />
                <p className="mt-4 text-sm text-muted-foreground">
                  {analysis.overallScore >= 80 ? (
                    'This route is performing excellently compared to others. Maintain current operations.'
                  ) : analysis.overallScore >= 65 ? (
                    'This route is performing well but has room for improvement in specific areas.'
                  ) : analysis.overallScore >= 50 ? (
                    'This route has average performance. Consider implementing the recommendations below.'
                  ) : (
                    'This route is performing below average and needs significant optimization.'
                  )}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Distance Efficiency</span>
                    <span className={getScoreColor(analysis.distance.efficiency.score)}>
                      {Math.round(analysis.distance.efficiency.score)}%
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Route Average:</span>
                    <span className="font-medium">{analysis.distance.value.toFixed(1)} km</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fleet Average:</span>
                    <span className="font-medium">{analysis.distance.average.toFixed(1)} km</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Best Performance:</span>
                    <span className="font-medium">{analysis.distance.best.toFixed(1)} km</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex gap-2 items-start">
                    {getScoreIcon(analysis.distance.efficiency.score)}
                    <p className="text-sm">{analysis.distance.efficiency.recommendation}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Time Efficiency</span>
                    <span className={getScoreColor(analysis.duration.efficiency.score)}>
                      {Math.round(analysis.duration.efficiency.score)}%
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Route Average:</span>
                    <span className="font-medium">{Math.round(analysis.duration.value)} min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fleet Average:</span>
                    <span className="font-medium">{Math.round(analysis.duration.average)} min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Best Performance:</span>
                    <span className="font-medium">{Math.round(analysis.duration.best)} min</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex gap-2 items-start">
                    {getScoreIcon(analysis.duration.efficiency.score)}
                    <p className="text-sm">{analysis.duration.efficiency.recommendation}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Cost Efficiency</span>
                    <span className={getScoreColor(analysis.cost.efficiency.score)}>
                      {Math.round(analysis.cost.efficiency.score)}%
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Route Average:</span>
                    <span className="font-medium">R{analysis.cost.value.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fleet Average:</span>
                    <span className="font-medium">R{analysis.cost.average.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Best Performance:</span>
                    <span className="font-medium">R{analysis.cost.best.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex gap-2 items-start">
                    {getScoreIcon(analysis.cost.efficiency.score)}
                    <p className="text-sm">{analysis.cost.efficiency.recommendation}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Delivery Volume</span>
                    <span className={getScoreColor(analysis.cylinders.efficiency.score)}>
                      {Math.round(analysis.cylinders.efficiency.score)}%
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Route Average:</span>
                    <span className="font-medium">{Math.round(analysis.cylinders.value)} cylinders</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fleet Average:</span>
                    <span className="font-medium">{Math.round(analysis.cylinders.average)} cylinders</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Best Performance:</span>
                    <span className="font-medium">{Math.round(analysis.cylinders.best)} cylinders</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex gap-2 items-start">
                    {getScoreIcon(analysis.cylinders.efficiency.score)}
                    <p className="text-sm">{analysis.cylinders.efficiency.recommendation}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

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
                  <p className="text-sm text-muted-foreground">
                    {routeName} {period === 'day' ? 'today' : period === 'week' ? 'this week' : 'this month'} is 
                    {analysis.overallScore >= analysis.distance.average ? ' outperforming ' : ' underperforming compared to '}
                    the fleet average. 
                    {analysis.distance.value < analysis.distance.average ? 
                      ` The route's distance is ${(((analysis.distance.average - analysis.distance.value) / analysis.distance.average) * 100).toFixed(0)}% shorter than average, ` : 
                      ` The route's distance is ${(((analysis.distance.value - analysis.distance.average) / analysis.distance.average) * 100).toFixed(0)}% longer than average, `}
                    {analysis.cost.value < analysis.cost.average ? 
                      `costs are ${(((analysis.cost.average - analysis.cost.value) / analysis.cost.average) * 100).toFixed(0)}% lower, ` : 
                      `costs are ${(((analysis.cost.value - analysis.cost.average) / analysis.cost.average) * 100).toFixed(0)}% higher, `}
                    and 
                    {analysis.cylinders.value > analysis.cylinders.average ? 
                      ` delivers ${(((analysis.cylinders.value - analysis.cylinders.average) / analysis.cylinders.average) * 100).toFixed(0)}% more cylinders than the average route.` : 
                      ` delivers ${(((analysis.cylinders.average - analysis.cylinders.value) / analysis.cylinders.average) * 100).toFixed(0)}% fewer cylinders than the average route.`}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Primary Recommendations</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {analysis.distance.efficiency.score < 70 && (
                      <li>Optimize route sequence to reduce total distance traveled</li>
                    )}
                    {analysis.duration.efficiency.score < 70 && (
                      <li>Reduce delivery time windows and improve loading procedures</li>
                    )}
                    {analysis.cost.efficiency.score < 70 && (
                      <li>Review fuel consumption and consider more economical routing</li>
                    )}
                    {analysis.cylinders.efficiency.score < 70 && (
                      <li>Consider consolidating deliveries or adding more stops to this route</li>
                    )}
                    {analysis.overallScore >= 70 && (
                      <li>Maintain current route structure as it's performing well</li>
                    )}
                    {analysis.overallScore >= 90 && (
                      <li>Document this route's logistics as a best practice model</li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex justify-center items-center py-12">
            <p>No data available for analysis.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RouteAnalysisDialog;

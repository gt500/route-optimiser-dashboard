
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { RefreshCw } from 'lucide-react';
import { useRouteData } from '@/hooks/fleet/useRouteData';
import { toast } from 'sonner';
import { printData, emailData } from '@/utils/exportUtils';
import { format } from 'date-fns';

import EfficiencyScoreCard from './components/EfficiencyScoreCard';
import OverallScoreCard from './components/OverallScoreCard';
import AnalysisPeriodSelector from './components/AnalysisPeriodSelector';
import KeyInsightsCard from './components/KeyInsightsCard';
import { AnalysisPeriod, RouteAnalysisMetrics } from './types';
import { generateRouteAnalytics, prepareExportData } from './utils/AnalysisUtils';

interface RouteAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routeId: string;
  routeName: string;
  routeColor: string;
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
  const routeDataHook = useRouteData();
  
  useEffect(() => {
    if (open) {
      generateRouteAnalysis();
    }
  }, [open, routeId, routeName, period]);

  const generateRouteAnalysis = async () => {
    setIsLoading(true);
    
    try {
      console.log(`Analyzing route: ${routeName} (${routeId})`);
      const allRoutes = await routeDataHook.fetchRouteData();
      
      if (!allRoutes || allRoutes.length === 0) {
        toast.error('No route data available for analysis');
        setIsLoading(false);
        return;
      }
      
      let specificRoutes = [];
      
      // First try: Exact name match
      specificRoutes = allRoutes.filter(route => 
        (route.name || '').toLowerCase() === routeName.toLowerCase()
      );
      
      // Second try: Partial name match
      if (!specificRoutes.length) {
        console.log(`No exact route data for "${routeName}", trying to find similar routes`);
        specificRoutes = allRoutes.filter(route => 
          (route.name || '').toLowerCase().includes(routeName.toLowerCase())
        );
      }
      
      // Third try: Check historical routes
      if (!specificRoutes.length) {
        const historyRoutes = await routeDataHook.fetchRouteHistory();
        
        const routeKeywords = routeName.toLowerCase().split(/\s+/).filter(word => word.length > 3);
        specificRoutes = historyRoutes.filter(route => {
          const name = (route.name || '').toLowerCase();
          return routeKeywords.some(keyword => name.includes(keyword));
        });
      }
      
      if (!specificRoutes.length) {
        toast.warning(`No matching routes found for "${routeName}"`);
        setIsLoading(false);
        return;
      }

      console.log(`Found ${specificRoutes.length} routes for analysis of "${routeName}"`);

      // Generate analytics metrics using real data
      const analyticsData = generateRouteAnalytics(
        routeName,
        routeId,
        period,
        specificRoutes,
        allRoutes
      );
      
      setAnalysis(analyticsData);
      toast.success(`Analysis complete for ${routeName}`);
    } catch (error) {
      console.error('Error generating route analysis:', error);
      toast.error('Failed to generate route analysis');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePrintAnalysis = () => {
    if (!analysis) return;
    
    try {
      const analyticsData = prepareExportData(analysis, routeName, period);
      
      printData(
        analyticsData,
        `Route Analysis: ${routeName} (${period === 'day' ? 'Daily' : period === 'week' ? 'Weekly' : 'Monthly'})`,
        new Date()
      );
      
      toast.success("Print view opened in new window");
    } catch (error) {
      toast.error("Failed to generate print view");
      console.error(error);
    }
  };
  
  const handleEmailAnalysis = () => {
    if (!analysis) return;
    
    try {
      const formattedDate = format(new Date(), 'yyyy-MM-dd');
      const analyticsData = prepareExportData(analysis, routeName, period);
      
      emailData(
        analyticsData,
        `Route Analysis: ${routeName} (${period === 'day' ? 'Daily' : period === 'week' ? 'Weekly' : 'Monthly'})`,
        `Route Efficiency Analysis - ${routeName} - ${formattedDate}`,
        new Date()
      );
      
      toast.success("Email client opened");
    } catch (error) {
      toast.error("Failed to open email client");
      console.error(error);
    }
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

        <AnalysisPeriodSelector 
          period={period} 
          onPeriodChange={setPeriod} 
        />

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Analyzing route performance...</span>
          </div>
        ) : analysis ? (
          <div className="space-y-6">
            <OverallScoreCard 
              score={analysis.overallScore} 
              onPrint={handlePrintAnalysis}
              onEmail={handleEmailAnalysis}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EfficiencyScoreCard
                title="Distance Efficiency"
                value={analysis.distance.value}
                average={analysis.distance.average}
                best={analysis.distance.best}
                efficiency={analysis.distance.efficiency}
              />
              
              <EfficiencyScoreCard
                title="Time Efficiency"
                value={analysis.duration.value}
                average={analysis.duration.average}
                best={analysis.duration.best}
                efficiency={analysis.duration.efficiency}
              />
              
              <EfficiencyScoreCard
                title="Cost Efficiency"
                value={analysis.cost.value}
                average={analysis.cost.average}
                best={analysis.cost.best}
                efficiency={analysis.cost.efficiency}
              />
              
              <EfficiencyScoreCard
                title="Delivery Volume"
                value={analysis.cylinders.value}
                average={analysis.cylinders.average}
                best={analysis.cylinders.best}
                efficiency={analysis.cylinders.efficiency}
              />
            </div>

            <KeyInsightsCard 
              analysis={analysis} 
              routeName={routeName} 
              period={period} 
            />
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

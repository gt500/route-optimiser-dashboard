
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useRouteData } from '@/hooks/fleet/useRouteData';
import { toast } from 'sonner';
import { printData, emailData } from '@/utils/exportUtils';
import { format } from 'date-fns';

import HeaderSection from './components/HeaderSection';
import AnalysisPeriodSelector from './components/AnalysisPeriodSelector';
import ScoreCardsGrid from './components/ScoreCardsGrid';
import KeyInsightsCard from './components/KeyInsightsCard';
import AnalysisLoadingState from './components/AnalysisLoadingState';
import { AnalysisPeriod, RouteAnalysisMetrics } from './types';
import { generateRouteAnalytics } from './utils/generateRouteAnalytics';
import { prepareExportData } from './utils/prepareExportData';

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
      console.log(`Analyzing route: ${routeName} (${routeId}) for period: ${period}`);
      const allRoutes = await routeDataHook.fetchRouteData();

      if (!allRoutes || allRoutes.length === 0) {
        toast.error('No route data available for analysis');
        setIsLoading(false);
        return;
      }

      let specificRoutes = await routeDataHook.fetchRouteDataByName(routeName);

      if (specificRoutes.length === 0) {
        console.log(`No exact route data for "${routeName}", trying to find similar routes`);
        specificRoutes = allRoutes.filter(route =>
          (route.name || '').toLowerCase().includes(routeName.toLowerCase())
        );
        if (specificRoutes.length === 0) {
          const routeKeywords = routeName.toLowerCase().split(/\s+/).filter(word => word.length > 3);
          specificRoutes = allRoutes.filter(route => {
            const name = (route.name || '').toLowerCase();
            return routeKeywords.some(keyword => name.includes(keyword));
          });
        }
      }

      if (specificRoutes.length === 0) {
        toast.warning(`No matching routes found for "${routeName}". Using sample data.`);
        const sampleDistance = 20; // km
        // Use realistic time calculation but not less than 15 minutes per route
        const sampleDuration = Math.max(15, Math.round((sampleDistance / 40)* 60)); // minutes
        specificRoutes = [
          {
            id: routeId,
            name: routeName,
            date: new Date().toISOString(),
            total_distance: sampleDistance,
            total_duration: sampleDuration * 60, // Convert to seconds (supabase stores as seconds)
            estimated_cost: 200,
            total_cylinders: 25,
            status: 'completed' as const
          }
        ];
      } else {
        toast.success(`Found ${specificRoutes.length} routes for analysis`);
      }

      const fleetData = allRoutes.length > 0 ? allRoutes : [
        {
          id: 'sample-1',
          name: 'Sample Route 1',
          date: new Date().toISOString(),
          total_distance: 18,
          total_duration: Math.max(15, Math.round((18 / 40)* 60)) * 60,
          estimated_cost: 180,
          total_cylinders: 22,
          status: 'completed' as const
        },
        {
          id: 'sample-2',
          name: 'Sample Route 2',
          date: new Date().toISOString(),
          total_distance: 25,
          total_duration: Math.max(15, Math.round((25 / 40)* 60)) * 60,
          estimated_cost: 230,
          total_cylinders: 30,
          status: 'completed' as const
        }
      ];

      // Use only real recorded duration if present, fall back to calculated (but minimum 15 mins)
      specificRoutes = specificRoutes.map(route => ({
        ...route,
        total_duration: route.total_duration
          ? Math.max(15 * 60, +route.total_duration) // seconds
          : Math.max(15 * 60, Math.round((route.total_distance || 0) / 40 * 60) * 60)
      }));

      // Likewise for fleetData
      const normalizedFleet = fleetData.map(route => ({
        ...route,
        total_duration: route.total_duration
          ? Math.max(15 * 60, +route.total_duration)
          : Math.max(15 * 60, Math.round((route.total_distance || 0) / 40 * 60) * 60)
      }));

      const analyticsData = generateRouteAnalytics(
        routeName,
        routeId,
        period,
        specificRoutes,
        normalizedFleet
      );

      setAnalysis(analyticsData);

      if (specificRoutes.length > 0) {
        toast.success(`Analysis complete for ${routeName} using ${specificRoutes.length} routes`);
      }
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
        <HeaderSection routeName={routeName} routeColor={routeColor} />
        <AnalysisPeriodSelector
          period={period}
          onPeriodChange={setPeriod}
        />
        {isLoading || !analysis ? (
          <AnalysisLoadingState isLoading={isLoading} />
        ) : (
          <>
            <ScoreCardsGrid
              analysis={analysis}
              onPrint={handlePrintAnalysis}
              onEmail={handleEmailAnalysis}
            />
            <KeyInsightsCard
              analysis={analysis}
              routeName={routeName}
              period={period}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RouteAnalysisDialog;

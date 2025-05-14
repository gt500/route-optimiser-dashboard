
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DownloadIcon, RefreshCw } from 'lucide-react';
import { TimePeriod } from '@/hooks/analyticsTypes';
import { toast } from '@/components/ui/use-toast';

interface AnalyticsHeaderProps {
  timePeriod: TimePeriod;
  isLoading: boolean;
  onPeriodChange: (value: string) => void;
  onRefreshData: () => void;
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  timePeriod,
  isLoading,
  onPeriodChange,
  onRefreshData
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Delivery performance and insights</p>
      </div>
      <div className="flex items-center gap-2">
        <Select defaultValue={timePeriod} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={onRefreshData}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
        <Button variant="outline" size="icon">
          <DownloadIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsHeader;

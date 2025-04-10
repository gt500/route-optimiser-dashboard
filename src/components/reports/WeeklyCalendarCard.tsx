import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { RefreshCw, FileSpreadsheet, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { toast } from 'sonner';
import { WeeklyDataSummary } from '@/hooks/useWeeklyData';

interface WeeklyCalendarCardProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  isLoading: boolean;
  onRefresh: () => void;
  dailySummary?: WeeklyDataSummary[];
}

const WeeklyCalendarCard: React.FC<WeeklyCalendarCardProps> = ({
  date,
  setDate,
  isLoading,
  onRefresh,
  dailySummary = []
}) => {
  const handleExportToExcel = () => {
    try {
      if (!dailySummary || dailySummary.length === 0) {
        toast.warning('No data to export');
        return;
      }
      
      const formattedData = dailySummary.map(day => ({
        siteName: day.formattedDate,
        cylinders: day.totalCylinders,
        kms: day.totalKms,
        fuelCost: day.totalFuelCost
      }));
      
      const weekStart = date ? new Date(date) : new Date();
      const filename = `weekly-deliveries-${weekStart.toISOString().split('T')[0]}`;
      
      exportToExcel(formattedData, filename);
      toast.success('Data exported to Excel successfully');
    } catch (error) {
      console.error('Export to Excel failed:', error);
      toast.error('Failed to export data to Excel');
    }
  };

  const handleExportToPDF = () => {
    try {
      if (!dailySummary || dailySummary.length === 0) {
        toast.warning('No data to export');
        return;
      }
      
      const formattedData = dailySummary.map(day => ({
        siteName: day.formattedDate,
        cylinders: day.totalCylinders,
        kms: day.totalKms,
        fuelCost: day.totalFuelCost
      }));
      
      const weekStart = date ? new Date(date) : new Date();
      const filename = `weekly-deliveries-${weekStart.toISOString().split('T')[0]}`;
      
      exportToPDF(formattedData, filename, 'Weekly Deliveries Report', date);
      toast.success('Data exported to PDF successfully');
    } catch (error) {
      console.error('Export to PDF failed:', error);
      toast.error('Failed to export data to PDF');
    }
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Select Week</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
        <div className="mt-4 flex flex-col gap-2">
          <Button onClick={onRefresh} className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Loading
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh Data
              </>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full">
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportToExcel}>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Export to Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportToPDF}>
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyCalendarCard;

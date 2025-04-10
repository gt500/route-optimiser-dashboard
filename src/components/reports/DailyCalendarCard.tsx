import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { RefreshCw, FileSpreadsheet, Download, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { toast } from 'sonner';
import { DeliveryData } from '@/hooks/delivery/types';

interface DailyCalendarCardProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  isLoading: boolean;
  onRefresh: () => void;
  onToggleView: () => void;
  viewMode: 'table' | 'map';
  deliveries?: DeliveryData[];
}

const DailyCalendarCard: React.FC<DailyCalendarCardProps> = ({
  date,
  setDate,
  isLoading,
  onRefresh,
  onToggleView,
  viewMode,
  deliveries = []
}) => {
  const handleExportToExcel = () => {
    try {
      if (!deliveries || deliveries.length === 0) {
        toast.warning('No data to export');
        return;
      }
      
      const formattedDate = date ? new Date(date).toISOString().split('T')[0] : 'delivery-data';
      const filename = `daily-deliveries-${formattedDate}`;
      
      exportToExcel(deliveries, filename);
      toast.success('Data exported to Excel successfully');
    } catch (error) {
      console.error('Export to Excel failed:', error);
      toast.error('Failed to export data to Excel');
    }
  };

  const handleExportToPDF = () => {
    try {
      if (!deliveries || deliveries.length === 0) {
        toast.warning('No data to export');
        return;
      }
      
      const formattedDate = date ? new Date(date).toISOString().split('T')[0] : 'delivery-data';
      const filename = `daily-deliveries-${formattedDate}`;
      
      exportToPDF(deliveries, filename, 'Daily Deliveries Report', date);
      toast.success('Data exported to PDF successfully');
    } catch (error) {
      console.error('Export to PDF failed:', error);
      toast.error('Failed to export data to PDF');
    }
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Select Date</CardTitle>
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
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onToggleView}>
              <MapPin className="mr-2 h-4 w-4" /> {viewMode === 'table' ? 'View Map' : 'View Table'}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-1">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyCalendarCard;

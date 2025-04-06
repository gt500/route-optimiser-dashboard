
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

interface MonthlyCalendarCardProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

const MonthlyCalendarCard: React.FC<MonthlyCalendarCardProps> = ({
  date,
  setDate,
  isLoading,
  onRefresh
}) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Select Month</CardTitle>
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
              <DropdownMenuItem>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Export to Excel
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyCalendarCard;

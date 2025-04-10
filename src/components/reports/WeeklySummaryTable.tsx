
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { WeeklyDataSummary, WeeklyTotals } from '@/hooks/useWeeklyData';
import { MonthlyDataSummary, MonthlyTotals } from '@/hooks/useMonthlyData';

interface WeeklySummaryTableProps {
  dailySummary: WeeklyDataSummary[];
  weeklyTotals: WeeklyTotals;
}

interface MonthlySummaryTableProps {
  weeklySummary: MonthlyDataSummary[];
  monthlyTotals: MonthlyTotals;
}

// Combined props union type
type SummaryTableProps = WeeklySummaryTableProps | MonthlySummaryTableProps;

// Type guard to check if props are for weekly or monthly summary
const isWeeklyProps = (props: SummaryTableProps): props is WeeklySummaryTableProps => {
  return 'dailySummary' in props;
};

const WeeklySummaryTable: React.FC<SummaryTableProps> = (props) => {
  if (isWeeklyProps(props)) {
    // Weekly summary table
    const { dailySummary, weeklyTotals } = props;
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Day</TableHead>
            <TableHead>Deliveries</TableHead>
            <TableHead>Cylinders</TableHead>
            <TableHead>Distance (km)</TableHead>
            <TableHead>Fuel Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dailySummary.map((day) => (
            <TableRow key={day.formattedDate}>
              <TableCell>{day.formattedDate}</TableCell>
              <TableCell>{day.deliveries}</TableCell>
              <TableCell>{day.totalCylinders}</TableCell>
              <TableCell>{day.totalKms.toFixed(1)}</TableCell>
              <TableCell>R{day.totalFuelCost.toFixed(2)}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-bold">
            <TableCell>WEEKLY TOTALS</TableCell>
            <TableCell>{weeklyTotals.deliveries}</TableCell>
            <TableCell>{weeklyTotals.cylinders}</TableCell>
            <TableCell>{weeklyTotals.kms.toFixed(1)}</TableCell>
            <TableCell>R{weeklyTotals.fuelCost.toFixed(2)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  } else {
    // Monthly summary table
    const { weeklySummary, monthlyTotals } = props;
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Week</TableHead>
            <TableHead>Date Range</TableHead>
            <TableHead>Deliveries</TableHead>
            <TableHead>Cylinders</TableHead>
            <TableHead>Distance (km)</TableHead>
            <TableHead>Fuel Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {weeklySummary.map((week) => (
            <TableRow key={week.weekNumber}>
              <TableCell>Week {week.weekNumber}</TableCell>
              <TableCell>{week.dateRange}</TableCell>
              <TableCell>{week.deliveries}</TableCell>
              <TableCell>{week.cylinders}</TableCell>
              <TableCell>{week.kms.toFixed(1)}</TableCell>
              <TableCell>R{week.fuelCost.toFixed(2)}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-bold">
            <TableCell colSpan={2}>MONTHLY TOTALS</TableCell>
            <TableCell>{monthlyTotals.deliveries}</TableCell>
            <TableCell>{monthlyTotals.cylinders}</TableCell>
            <TableCell>{monthlyTotals.kms.toFixed(1)}</TableCell>
            <TableCell>R{monthlyTotals.fuelCost.toFixed(2)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }
};

export default WeeklySummaryTable;

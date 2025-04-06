
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { WeeklyDataSummary, WeeklyTotals } from '@/hooks/useWeeklyData';

interface WeeklySummaryTableProps {
  dailySummary: WeeklyDataSummary[];
  weeklyTotals: WeeklyTotals;
}

const WeeklySummaryTable: React.FC<WeeklySummaryTableProps> = ({
  dailySummary,
  weeklyTotals
}) => {
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
};

export default WeeklySummaryTable;

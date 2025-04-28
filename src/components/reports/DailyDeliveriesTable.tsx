
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeliveryData } from '@/hooks/delivery/types';

interface DailyDeliveriesTableProps {
  deliveries: DeliveryData[];
  totalCylinders: number;
  totalKms: number;
  totalFuelCost: number;
}

const DailyDeliveriesTable: React.FC<DailyDeliveriesTableProps> = ({
  deliveries,
  totalCylinders,
  totalKms,
  totalFuelCost
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Site Name</TableHead>
          <TableHead>Cylinders</TableHead>
          <TableHead>Distance (km)</TableHead>
          <TableHead>Fuel Cost</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deliveries.map((delivery) => {
          // Ensure we have a valid distance value for each delivery
          const displayDistance = delivery.actualDistance || delivery.kms || 
            (delivery.latitude && delivery.longitude ? 10.5 : 5.0); // Fallback to reasonable default
            
          return (
            <TableRow key={delivery.id}>
              <TableCell>{delivery.siteName}</TableCell>
              <TableCell>{delivery.cylinders}</TableCell>
              <TableCell>{displayDistance.toFixed(1)}</TableCell>
              <TableCell>R{delivery.fuelCost.toFixed(2)}</TableCell>
            </TableRow>
          );
        })}
        <TableRow className="font-bold">
          <TableCell>TOTALS</TableCell>
          <TableCell>{totalCylinders}</TableCell>
          <TableCell>{totalKms.toFixed(1)}</TableCell>
          <TableCell>R{totalFuelCost.toFixed(2)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default DailyDeliveriesTable;

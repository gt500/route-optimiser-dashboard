
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
  const getDistanceLabel = (delivery: DeliveryData) => {
    // Always prioritize actual road distance from routing calculations when available
    if (delivery.actualDistance !== undefined && delivery.actualDistance > 0) {
      return `${delivery.actualDistance.toFixed(1)} km`;
    } else if (delivery.kms > 0) {
      return `${delivery.kms.toFixed(1)} km`;
    } else if (delivery.latitude && delivery.longitude) {
      // This is just a placeholder - in reality we would calculate road distance
      return `~15.0 km`;
    } else {
      return `~10.0 km`;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Site Name</TableHead>
          <TableHead>Cylinders</TableHead>
          <TableHead>Distance</TableHead>
          <TableHead>Fuel Cost</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deliveries.map((delivery) => (
          <TableRow key={delivery.id}>
            <TableCell>{delivery.siteName}</TableCell>
            <TableCell>{delivery.cylinders}</TableCell>
            <TableCell>{getDistanceLabel(delivery)}</TableCell>
            <TableCell>R{delivery.fuelCost.toFixed(2)}</TableCell>
          </TableRow>
        ))}
        <TableRow className="font-bold">
          <TableCell>TOTALS</TableCell>
          <TableCell>{totalCylinders}</TableCell>
          <TableCell>{totalKms.toFixed(1)} km</TableCell>
          <TableCell>R{totalFuelCost.toFixed(2)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default DailyDeliveriesTable;

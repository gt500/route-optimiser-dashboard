import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeliveryData } from '@/hooks/delivery/types';
import { Clock } from 'lucide-react';

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

  // Calculate an estimated duration for each delivery stop when actual duration is not available
  const getDurationLabel = (delivery: DeliveryData, index: number) => {
    // Return actual duration if available
    if (delivery.actualDuration !== undefined && delivery.actualDuration > 0) {
      const duration = delivery.actualDuration;
      if (duration < 60) {
        return `${Math.round(duration)} min`;
      } else {
        const hours = Math.floor(duration / 60);
        const mins = Math.round(duration % 60);
        return hours > 0 ? 
          (mins > 0 ? `${hours}h ${mins}m` : `${hours}h`) : 
          `${mins} min`;
      }
    }
    
    // Otherwise estimate based on distance and some fixed factors
    const distance = delivery.actualDistance || delivery.kms || 15.0;
    // Assume average speed of 35km/h for urban areas in South Africa
    const avgSpeed = 35;
    // Add 8 minutes per stop for loading/unloading
    const stopTime = 8;
    // Estimated travel time in minutes
    const travelTime = (distance / avgSpeed) * 60;
    const totalTime = Math.round(travelTime + stopTime);
    
    return `~${totalTime} min`;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Site Name</TableHead>
          <TableHead>Cylinders</TableHead>
          <TableHead>Distance</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Fuel Cost</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deliveries.map((delivery, index) => (
          <TableRow key={delivery.id}>
            <TableCell>{delivery.siteName}</TableCell>
            <TableCell>{delivery.cylinders}</TableCell>
            <TableCell>{getDistanceLabel(delivery)}</TableCell>
            <TableCell className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {getDurationLabel(delivery, index)}
            </TableCell>
            <TableCell>R{delivery.fuelCost.toFixed(2)}</TableCell>
          </TableRow>
        ))}
        <TableRow className="font-bold">
          <TableCell>TOTALS</TableCell>
          <TableCell>{totalCylinders}</TableCell>
          <TableCell>{totalKms.toFixed(1)} km</TableCell>
          <TableCell>-</TableCell>
          <TableCell>R{totalFuelCost.toFixed(2)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default DailyDeliveriesTable;

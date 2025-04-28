
import React from 'react';
import { Package, MapPin, TruckIcon, Fuel } from 'lucide-react';
import ReportMetricsCard from './ReportMetricsCard';

interface ReportMetricsGridProps {
  totalCylinders: number;
  totalDistance: number;
  totalLocations: number;
  totalFuelCost: number;
}

const ReportMetricsGrid: React.FC<ReportMetricsGridProps> = ({
  totalCylinders,
  totalDistance,
  totalLocations,
  totalFuelCost
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <ReportMetricsCard
        title="Total Cylinders"
        value={totalCylinders}
        icon={<Package />}
        color="bg-gradient-to-br from-orange-500 to-orange-600"
        tooltip="Total number of gas cylinders delivered"
      />
      
      <ReportMetricsCard
        title="Total Distance"
        value={`${totalDistance.toFixed(1)} km`}
        icon={<TruckIcon />}
        color="bg-gradient-to-br from-blue-500 to-blue-600"
        tooltip="Total distance traveled by delivery vehicles"
      />
      
      <ReportMetricsCard
        title="Number of Deliveries"
        value={totalLocations}
        icon={<MapPin />}
        color="bg-gradient-to-br from-purple-500 to-purple-600"
        tooltip="Total number of deliveries completed"
      />
      
      <ReportMetricsCard
        title="Fuel Cost"
        value={`R${totalFuelCost.toFixed(2)}`}
        icon={<Fuel />}
        color="bg-gradient-to-br from-green-500 to-green-600"
        tooltip="Total estimated fuel cost for all deliveries"
      />
    </div>
  );
};

export default ReportMetricsGrid;

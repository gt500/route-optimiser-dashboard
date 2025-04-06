
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Weight, AlertTriangle } from 'lucide-react';
import { ReportMetricsCard } from '@/components/reports/ReportMetricsCard';

interface TruckWeightIndicatorProps {
  totalCylinders: number;
  maxCylinders?: number;
  cylinderWeight?: number;
}

const TruckWeightIndicator: React.FC<TruckWeightIndicatorProps> = ({
  totalCylinders,
  maxCylinders = 80, // Default maximum of 80 cylinders
  cylinderWeight = 22 // Default weight of 22kg per cylinder
}) => {
  const currentWeight = totalCylinders * cylinderWeight;
  const maxWeight = maxCylinders * cylinderWeight;
  const weightPercentage = (currentWeight / maxWeight) * 100;
  const isOverweight = totalCylinders > maxCylinders;

  const getWeightStatusColor = () => {
    if (isOverweight) return "bg-gradient-to-br from-red-500 to-red-600";
    if (weightPercentage > 90) return "bg-gradient-to-br from-amber-500 to-amber-600";
    if (weightPercentage > 70) return "bg-gradient-to-br from-yellow-500 to-yellow-600";
    return "bg-gradient-to-br from-green-500 to-green-600";
  };

  return (
    <div className="space-y-2">
      <ReportMetricsCard
        title="Truck Weight"
        value={`${currentWeight} kg`}
        icon={<Weight />}
        color={getWeightStatusColor()}
        tooltip={`Maximum load: ${maxWeight} kg (${maxCylinders} cylinders)`}
      />

      {isOverweight && (
        <Alert variant="destructive" className="mt-2 py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Weight limit exceeded!</AlertTitle>
          <AlertDescription>
            Current load ({totalCylinders} cylinders, {currentWeight} kg) exceeds the maximum capacity 
            ({maxCylinders} cylinders, {maxWeight} kg). Please remove some locations.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TruckWeightIndicator;

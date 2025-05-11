
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FuelCostEditor from '@/components/fleet/costs/FuelCostEditor';

interface OperationalParametersCardProps {
  fuelCost: number;
  onFuelCostUpdate: (newCost: number) => void;
}

const OperationalParametersCard: React.FC<OperationalParametersCardProps> = ({ 
  fuelCost, 
  onFuelCostUpdate 
}) => {
  return (
    <Card className="bg-black/70 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Operational Parameters</CardTitle>
        <CardDescription className="text-white/60">Update vehicle operational costs</CardDescription>
      </CardHeader>
      <CardContent>
        <FuelCostEditor value={fuelCost} onUpdate={onFuelCostUpdate} />
      </CardContent>
    </Card>
  );
};

export default OperationalParametersCard;

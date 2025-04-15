
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TruckIcon, MapPin, Wrench } from 'lucide-react';

interface VehicleStatusCardsProps {
  statusCounts: {
    available: number;
    onRoute: number;
    maintenance: number;
  };
}

const VehicleStatusCard = ({ status, count, icon: Icon, color }) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-300 bg-black/70 border-white/10">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-white/90">{status}</CardTitle>
        <div className={`text-${color}-400`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{count}</div>
        <p className="text-xs text-white/60">vehicles</p>
      </CardContent>
    </Card>
  );
};

const VehicleStatusCards: React.FC<VehicleStatusCardsProps> = ({ statusCounts }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <VehicleStatusCard status="Available" count={statusCounts.available} icon={TruckIcon} color="green" />
      <VehicleStatusCard status="On Route" count={statusCounts.onRoute} icon={MapPin} color="blue" />
      <VehicleStatusCard status="In Maintenance" count={statusCounts.maintenance} icon={Wrench} color="amber" />
    </div>
  );
};

export default VehicleStatusCards;

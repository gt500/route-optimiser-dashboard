
import React from 'react';
import { MachineData } from './types';
import MachineCard from './MachineCard';
import EmptyMachinesState from './EmptyMachinesState';

interface MachineListProps {
  machines: MachineData[];
  acknowledgedAlerts: Record<string, { time: string, user: string }>;
}

const MachineList: React.FC<MachineListProps> = ({ machines, acknowledgedAlerts }) => {
  if (machines.length === 0) {
    return <EmptyMachinesState />;
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {machines.map((machine, idx) => (
        <MachineCard 
          key={`${machine.site_name}-${machine.terminal_id}-${idx}`}
          machine={machine} 
          acknowledgedAlerts={acknowledgedAlerts} 
        />
      ))}
    </div>
  );
};

export default MachineList;

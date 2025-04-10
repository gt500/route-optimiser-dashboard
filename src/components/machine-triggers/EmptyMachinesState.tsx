
import React from 'react';

const EmptyMachinesState: React.FC = () => {
  return (
    <div className="col-span-full text-center py-8">
      <p className="text-muted-foreground">No machines match the current filter</p>
    </div>
  );
};

export default EmptyMachinesState;

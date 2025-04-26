
import { useState } from 'react';
import { toast } from 'sonner';
import { RouteState } from './types';

export const useSaveRoute = (
  route: RouteState,
  setIsLoadConfirmed: React.Dispatch<React.SetStateAction<boolean>>,
  selectedVehicle: string | null
) => {
  const handleConfirmLoad = async () => {
    if (!selectedVehicle) {
      toast.error('Please select a vehicle before confirming the load');
      return;
    }
    setIsLoadConfirmed(true);
    toast.success('Load confirmed successfully');
  };

  return { handleConfirmLoad };
};


import { useState } from 'react';

export const useFleetVehicleEditor = (saveVehicle: any) => {
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsDialogOpen(true);
  };

  const handleSaveVehicle = (updatedVehicle) => {
    return saveVehicle(updatedVehicle).then(() => {
      setIsDialogOpen(false);
      setEditingVehicle(null);
    });
  };

  const handleAddVehicle = () => {
    setEditingVehicle({
      id: '',
      name: 'Leyland Ashok Phoenix',
      licensePlate: '',
      status: 'Available',
      capacity: 80,
      load: 0,
      fuelLevel: 100,
      location: '',
      lastService: new Date().toISOString().split('T')[0],
      country: 'South Africa',
      region: '',
      startDate: '2025-04-16'
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingVehicle(null);
  };

  return {
    editingVehicle,
    isDialogOpen,
    handleEditVehicle,
    handleSaveVehicle,
    handleAddVehicle,
    closeDialog
  };
};

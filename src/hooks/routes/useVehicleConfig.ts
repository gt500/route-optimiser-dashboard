
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VehicleConfigProps, defaultVehicleConfig } from './types';

export const useVehicleConfig = () => {
  const [vehicleConfig, setVehicleConfig] = useState<VehicleConfigProps>(defaultVehicleConfig);

  useEffect(() => {
    const fetchFuelCost = async () => {
      const { data, error } = await supabase
        .from('cost_factors')
        .select('value, id')
        .eq('name', 'fuel_cost_per_liter')
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Error fetching fuel cost:', error);
        }
        
        const newRecordId = crypto.randomUUID();
        
        const { error: insertError } = await supabase
          .from('cost_factors')
          .insert({ 
            id: newRecordId,
            name: 'fuel_cost_per_liter', 
            value: 21.95, 
            description: 'Cost per liter of fuel in Rand' 
          });
          
        if (insertError) {
          console.error('Error creating fuel cost record:', insertError);
        }
        return;
      }
      
      if (data) {
        setVehicleConfig(prev => ({
          ...prev,
          fuelPrice: data.value
        }));
      }
    };

    const fetchVehicleConfig = async () => {
      try {
        const { data: consumptionData } = await supabase
          .from('cost_factors')
          .select('value, id')
          .eq('name', 'base_fuel_consumption')
          .single();

        const { data: maintenanceData } = await supabase
          .from('cost_factors')
          .select('value, id')
          .eq('name', 'maintenance_cost_per_km')
          .single();

        setVehicleConfig(prev => ({
          ...prev,
          baseConsumption: consumptionData?.value ?? prev.baseConsumption,
          maintenanceCostPerKm: maintenanceData?.value ?? prev.maintenanceCostPerKm
        }));
      } catch (err) {
        console.error("Error fetching vehicle config:", err);
      }
    };
    
    fetchFuelCost();
    fetchVehicleConfig();
  }, []);

  const updateVehicleConfig = async (config: Partial<VehicleConfigProps>, updateCosts?: (distance: number, fuelPrice?: number) => void, distance?: number) => {
    setVehicleConfig(prev => {
      const updatedConfig = { ...prev, ...config };
      updateVehicleConfigInDatabase(updatedConfig);
      
      if (updateCosts && distance && distance > 1 && config.fuelPrice !== undefined) {
        updateCosts(distance, config.fuelPrice);
      }
      
      return updatedConfig;
    });
  };

  const updateVehicleConfigInDatabase = async (config: VehicleConfigProps) => {
    try {
      const { data: existingRecords, error: fetchError } = await supabase
        .from('cost_factors')
        .select('id, name')
        .in('name', ['fuel_cost_per_liter', 'base_fuel_consumption', 'maintenance_cost_per_km']);
      
      if (fetchError) {
        console.error('Error fetching cost factors:', fetchError);
        return;
      }
      
      const recordMap = new Map();
      existingRecords?.forEach(record => {
        recordMap.set(record.name, record.id);
      });
      
      const fuelCostId = recordMap.get('fuel_cost_per_liter') || crypto.randomUUID();
      const { error: fuelError } = await supabase
        .from('cost_factors')
        .upsert({ 
          id: fuelCostId,
          name: 'fuel_cost_per_liter', 
          value: config.fuelPrice, 
          description: 'Cost per liter of fuel in Rand' 
        });
        
      if (fuelError) console.error('Error updating fuel cost:', fuelError);
      
      const consumptionId = recordMap.get('base_fuel_consumption') || crypto.randomUUID();
      const { error: consumptionError } = await supabase
        .from('cost_factors')
        .upsert({ 
          id: consumptionId,
          name: 'base_fuel_consumption', 
          value: config.baseConsumption, 
          description: 'Base fuel consumption in L/100km' 
        });
        
      if (consumptionError) console.error('Error updating fuel consumption:', consumptionError);
      
      const maintenanceId = recordMap.get('maintenance_cost_per_km') || crypto.randomUUID();
      const { error: maintenanceError } = await supabase
        .from('cost_factors')
        .upsert({ 
          id: maintenanceId,
          name: 'maintenance_cost_per_km', 
          value: config.maintenanceCostPerKm, 
          description: 'Vehicle maintenance cost per kilometer' 
        });
        
      if (maintenanceError) console.error('Error updating maintenance cost:', maintenanceError);
      
    } catch (error) {
      console.error('Error updating vehicle configuration:', error);
    }
  };

  return {
    vehicleConfig,
    updateVehicleConfig
  };
};

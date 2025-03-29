
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Fuel, PencilIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface FuelCostEditorProps {
  currentFuelCost: number;
  onFuelCostChange: (newCost: number) => void;
}

const FuelCostEditor = ({ currentFuelCost, onFuelCostChange }: FuelCostEditorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fuelCost, setFuelCost] = useState(currentFuelCost.toString());
  
  useEffect(() => {
    setFuelCost(currentFuelCost.toString());
  }, [currentFuelCost]);
  
  const fetchCurrentFuelCost = async () => {
    const { data, error } = await supabase
      .from('cost_factors')
      .select('value')
      .eq('name', 'fuel_cost_per_liter')
      .single();
    
    if (error) {
      console.error('Error fetching fuel cost:', error);
      return;
    }
    
    if (data) {
      setFuelCost(data.value.toString());
      onFuelCostChange(data.value);
    }
  };
  
  const saveFuelCost = async () => {
    const numericCost = parseFloat(fuelCost);
    
    if (isNaN(numericCost) || numericCost <= 0) {
      toast.error('Please enter a valid fuel cost');
      return;
    }
    
    // Save to database
    const { error } = await supabase
      .from('cost_factors')
      .upsert({ 
        name: 'fuel_cost_per_liter', 
        value: numericCost, 
        description: 'Cost per liter of fuel in Rand',
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'name' 
      });
    
    if (error) {
      console.error('Error saving fuel cost:', error);
      toast.error('Failed to save fuel cost');
      return;
    }
    
    onFuelCostChange(numericCost);
    toast.success('Fuel cost updated successfully');
    setIsOpen(false);
  };
  
  useEffect(() => {
    fetchCurrentFuelCost();
  }, []);
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-1 border-dashed"
        >
          <Fuel className="h-3.5 w-3.5" />
          R{currentFuelCost.toFixed(2)}/L
          <PencilIcon className="h-3 w-3 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Update Fuel Cost</h4>
            <p className="text-sm text-muted-foreground">
              Update the current cost per liter of fuel.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fuelCost">Cost per liter (R)</Label>
            <Input 
              id="fuelCost" 
              type="number" 
              min="0.01" 
              step="0.01" 
              value={fuelCost} 
              onChange={(e) => setFuelCost(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              This will be used to calculate route costs.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={saveFuelCost}>
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FuelCostEditor;


import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AddButtonProps {
  handleAdd: () => void;
  disabled: boolean;
}

const AddButton = ({ handleAdd, disabled }: AddButtonProps) => {
  return (
    <div className="pt-2">
      <Button 
        onClick={handleAdd} 
        className="w-full gap-2" 
        disabled={disabled}
      >
        <Plus className="h-4 w-4" />
        Add to Route
      </Button>
    </div>
  );
};

export default AddButton;

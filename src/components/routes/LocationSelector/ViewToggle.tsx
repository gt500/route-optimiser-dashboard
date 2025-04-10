
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ViewToggleProps {
  viewMode: 'list' | 'dropdown';
  setViewMode: (mode: 'list' | 'dropdown') => void;
  disabled?: boolean;
}

const ViewToggle = ({ viewMode, setViewMode, disabled = false }: ViewToggleProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          View as {viewMode === 'list' ? 'Dropdown' : 'List'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover">
        <DropdownMenuItem onClick={() => setViewMode('list')}>
          List View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setViewMode('dropdown')}>
          Dropdown View
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ViewToggle;

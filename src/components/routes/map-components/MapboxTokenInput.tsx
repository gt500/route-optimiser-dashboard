
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { setMapboxToken, hasValidMapboxToken } from '@/utils/route/mapboxUtils';
import { toast } from 'sonner';

interface MapboxTokenInputProps {
  onTokenSet: () => void;
}

const MapboxTokenInput: React.FC<MapboxTokenInputProps> = ({ onTokenSet }) => {
  const [token, setToken] = useState('');
  
  const handleSaveToken = () => {
    if (!token || token.length < 10) {
      toast.error("Please enter a valid Mapbox token");
      return;
    }
    
    setMapboxToken(token);
    toast.success("Mapbox token saved successfully");
    onTokenSet();
  };
  
  return (
    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
      <h3 className="text-sm font-medium mb-2">Enter Mapbox Access Token</h3>
      <p className="text-xs text-muted-foreground mb-3">
        For accurate route calculations, please enter your Mapbox public access token.
        <a 
          href="https://account.mapbox.com/access-tokens/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="ml-1 text-blue-600 hover:underline"
        >
          Get token
        </a>
      </p>
      <div className="flex gap-2">
        <Input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="pk.eyJ1Ijo..."
          className="text-xs"
        />
        <Button size="sm" onClick={handleSaveToken}>Save</Button>
      </div>
    </div>
  );
};

export default MapboxTokenInput;

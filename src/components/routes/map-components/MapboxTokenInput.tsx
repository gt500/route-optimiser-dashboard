
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { setMapboxAccessToken, getMapboxAccessToken, hasValidMapboxToken } from '@/utils/route/mapboxUtils';
import { toast } from 'sonner';

interface MapboxTokenInputProps {
  onTokenSet?: (token: string) => void;
}

const MapboxTokenInput: React.FC<MapboxTokenInputProps> = ({ onTokenSet }) => {
  const [token, setToken] = useState('');
  const [isTokenSet, setIsTokenSet] = useState(false);
  
  // Load token if available
  useEffect(() => {
    const savedToken = getMapboxAccessToken();
    if (savedToken && savedToken !== 'pk.placeholder') {
      setToken(savedToken);
      setIsTokenSet(true);
    }
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token.trim() || token.length < 20) {
      toast.error('Please enter a valid Mapbox access token');
      return;
    }
    
    setMapboxAccessToken(token.trim());
    setIsTokenSet(true);
    toast.success('Mapbox token successfully saved');
    
    if (onTokenSet) {
      onTokenSet(token.trim());
    }
  };
  
  const handleClear = () => {
    setToken('');
    setIsTokenSet(false);
    setMapboxAccessToken('pk.placeholder');
    toast.info('Mapbox token cleared');
  };
  
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Mapbox Configuration</CardTitle>
        <CardDescription>
          Enter your Mapbox access token to enable routing functionality
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isTokenSet ? (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription>
              Mapbox token is set and routing is enabled
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="mapbox-token" className="text-sm font-medium">
                Mapbox Access Token
              </label>
              <Input
                id="mapbox-token"
                placeholder="Enter your Mapbox access token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="flex-1"
              />
              <p className="text-xs text-gray-500">
                Get your token from <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noreferrer" className="text-primary underline">mapbox.com</a>
              </p>
            </div>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {isTokenSet ? (
          <Button variant="outline" onClick={handleClear}>
            Clear Token
          </Button>
        ) : (
          <Button type="submit" onClick={handleSubmit}>
            Save Token
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default MapboxTokenInput;

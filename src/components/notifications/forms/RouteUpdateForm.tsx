
import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin } from "lucide-react";

interface RouteUpdateFormProps {
  routeData: {
    routeId: string;
    routeName: string;
    updateType: string;
    details: string;
  };
  setRouteData: (data: any) => void;
  onSubmit: () => Promise<void>;
  loading: boolean;
  disabled: boolean;
}

const RouteUpdateForm = ({
  routeData,
  setRouteData,
  onSubmit,
  loading,
  disabled
}: RouteUpdateFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="routeName">Route Name</Label>
        <Input
          id="routeName"
          value={routeData.routeName}
          onChange={(e) => setRouteData({...routeData, routeName: e.target.value})}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="updateType">Update Type</Label>
        <select
          id="updateType"
          value={routeData.updateType}
          onChange={(e) => setRouteData({...routeData, updateType: e.target.value})}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="created">Created</option>
          <option value="updated">Updated</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="optimized">Optimized</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="routeDetails">Details</Label>
        <Textarea
          id="routeDetails"
          value={routeData.details}
          onChange={(e) => setRouteData({...routeData, details: e.target.value})}
          rows={2}
        />
      </div>
      <Button 
        onClick={onSubmit} 
        disabled={loading || disabled}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <MapPin className="mr-2 h-4 w-4" />
            Send Test Route Notification
          </>
        )}
      </Button>
    </div>
  );
};

export default RouteUpdateForm;

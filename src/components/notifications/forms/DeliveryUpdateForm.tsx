
import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Truck } from "lucide-react";

interface DeliveryUpdateFormProps {
  deliveryData: {
    deliveryId: string;
    locationName: string;
    status: string;
    details: string;
  };
  setDeliveryData: (data: any) => void;
  onSubmit: () => Promise<void>;
  loading: boolean;
  disabled: boolean;
}

const DeliveryUpdateForm = ({
  deliveryData,
  setDeliveryData,
  onSubmit,
  loading,
  disabled
}: DeliveryUpdateFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="locationName">Location Name</Label>
        <Input
          id="locationName"
          value={deliveryData.locationName}
          onChange={(e) => setDeliveryData({...deliveryData, locationName: e.target.value})}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          value={deliveryData.status}
          onChange={(e) => setDeliveryData({...deliveryData, status: e.target.value as any})}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="deliveryDetails">Details</Label>
        <Textarea
          id="deliveryDetails"
          value={deliveryData.details}
          onChange={(e) => setDeliveryData({...deliveryData, details: e.target.value})}
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
            <Truck className="mr-2 h-4 w-4" />
            Send Test Delivery Update
          </>
        )}
      </Button>
    </div>
  );
};

export default DeliveryUpdateForm;

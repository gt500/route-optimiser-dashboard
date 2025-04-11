
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, FileBarChart } from "lucide-react";

interface WeeklyReportFormProps {
  reportData: {
    deliveries: number;
    cylinders: number;
    kms: number;
    fuelCost: number;
  };
  setReportData: (data: any) => void;
  onSubmit: () => Promise<void>;
  loading: boolean;
  disabled: boolean;
}

const WeeklyReportForm = ({
  reportData,
  setReportData,
  onSubmit,
  loading,
  disabled
}: WeeklyReportFormProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="deliveries">Deliveries</Label>
          <Input
            id="deliveries"
            type="number"
            value={reportData.deliveries}
            onChange={(e) => setReportData({...reportData, deliveries: parseInt(e.target.value) || 0})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cylinders">Cylinders</Label>
          <Input
            id="cylinders"
            type="number"
            value={reportData.cylinders}
            onChange={(e) => setReportData({...reportData, cylinders: parseInt(e.target.value) || 0})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kms">Distance (km)</Label>
          <Input
            id="kms"
            type="number"
            step="0.1"
            value={reportData.kms}
            onChange={(e) => setReportData({...reportData, kms: parseFloat(e.target.value) || 0})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fuelCost">Fuel Cost (R)</Label>
          <Input
            id="fuelCost"
            type="number"
            step="0.01"
            value={reportData.fuelCost}
            onChange={(e) => setReportData({...reportData, fuelCost: parseFloat(e.target.value) || 0})}
          />
        </div>
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
            <FileBarChart className="mr-2 h-4 w-4" />
            Send Test Weekly Report
          </>
        )}
      </Button>
    </div>
  );
};

export default WeeklyReportForm;

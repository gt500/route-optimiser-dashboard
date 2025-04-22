
import React from "react";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";

interface AnalysisActionsProps {
  onPrint: () => void;
  onEmail: () => void;
}

const AnalysisActions: React.FC<AnalysisActionsProps> = ({ onPrint, onEmail }) => (
  <div className="flex gap-2 mb-4">
    <Button variant="outline" size="sm" onClick={onPrint}>
      Print
    </Button>
    <Button variant="outline" size="sm" onClick={onEmail}>
      <DownloadIcon className="h-4 w-4 mr-1" />
      Email
    </Button>
  </div>
);

export default AnalysisActions;

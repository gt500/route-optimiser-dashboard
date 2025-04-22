
import React from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface HeaderSectionProps {
  routeName: string;
  routeColor: string;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({ routeName, routeColor }) => (
  <DialogHeader>
    <DialogTitle className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded-full ${routeColor}`}></div>
      <span>AI Analysis: {routeName}</span>
    </DialogTitle>
    <DialogDescription>
      AI-powered efficiency analysis and recommendations
    </DialogDescription>
  </DialogHeader>
);

export default HeaderSection;

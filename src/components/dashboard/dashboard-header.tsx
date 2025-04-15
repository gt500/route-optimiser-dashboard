
import React from 'react';

interface DashboardHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
  logo?: string;
}

export function DashboardHeader({ 
  heading, 
  text, 
  children, 
  logo 
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="grid gap-1 flex items-center">
        {logo && (
          <img 
            src={logo} 
            alt="GAZ2GO Logo" 
            className="h-10 w-auto mr-3" 
          />
        )}
        <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
        {text && <p className="text-muted-foreground">{text}</p>}
      </div>
      {children}
    </div>
  );
}

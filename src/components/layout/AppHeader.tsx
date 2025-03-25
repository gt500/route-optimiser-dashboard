
import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function AppHeader() {
  const location = useLocation();
  
  // Get page title based on route
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/routes':
        return 'Routes';
      case '/locations':
        return 'Locations';
      case '/fleet':
        return 'Fleet Management';
      case '/analytics':
        return 'Analytics';
      case '/settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur-sm flex items-center px-4 sticky top-0 z-30">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="font-medium text-xl pl-3">{getPageTitle()}</div>
      <div className="flex-1" />
      <div className="hidden md:flex items-center max-w-sm w-full mr-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            className="pl-9 w-full bg-secondary/50 border-0"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          size="icon" 
          variant="ghost" 
          className="rounded-full text-muted-foreground"
        >
          <Bell className="h-5 w-5" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          className="rounded-full text-muted-foreground"
        >
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}

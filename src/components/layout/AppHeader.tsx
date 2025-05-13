
import React from 'react';
import { Bell, LogOut, Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertIndicator } from '@/components/notifications/AlertIndicator';

export function AppHeader() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toggleSidebar } = useSidebar();
  
  // Get page title based on route
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/routes':
        return 'Route Optimiser';
      case '/locations':
        return 'Locations';
      case '/fleet':
        return 'Fleet Management';
      case '/analytics':
        return 'Analytics';
      case '/settings':
        return 'Settings';
      case '/machine-triggers':
        return 'Machine Triggers';
      default:
        if (location.pathname.includes('/reports')) {
          return 'Reports';
        }
        return 'Dashboard';
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return 'U';
    const fullName = user.user_metadata?.full_name || '';
    if (!fullName) return user.email?.charAt(0).toUpperCase() || 'U';
    
    const names = fullName.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Show the logo only on the routes page
  const showLogo = location.pathname === '/routes';

  // Handle sidebar toggle with debugging
  const handleSidebarToggle = () => {
    console.log("Attempting to toggle sidebar");
    toggleSidebar();
  };

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur-sm flex items-center px-4 sticky top-0 z-30">
      <div className="md:hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7" 
          onClick={handleSidebarToggle}
        >
          <SidebarTrigger />
        </Button>
      </div>
      {showLogo && (
        <img 
          src="/lovable-uploads/0b09ba82-e3f0-4fa1-ab8d-87f06fd9f31b.png" 
          alt="GAZ2GO" 
          className="h-8 w-auto mr-3" 
        />
      )}
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
        {/* Alert Indicator */}
        <AlertIndicator />
      
        <Button 
          size="icon" 
          variant="ghost" 
          className="rounded-full text-muted-foreground"
        >
          <Bell className="h-5 w-5" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative rounded-full h-10 w-10 p-0">
              <Avatar>
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {user?.user_metadata?.full_name || user?.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

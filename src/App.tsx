
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import RoutesList from "./pages/routes"; // Updated import path
import Locations from "./pages/Locations";
import Fleet from "./pages/Fleet";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import ReportsLayout from "./pages/reports/ReportsLayout";
import DailyReports from "./pages/reports/delivery/DailyReports";
import WeeklyReports from "./pages/reports/delivery/WeeklyReports";
import MonthlyReports from "./pages/reports/delivery/MonthlyReports";
import MachineTriggers from "./pages/MachineTriggers";
import Index from "./pages/Index";

// Configure React Query with error handling to prevent loops
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Don't retry failed queries to prevent potential loops
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      staleTime: 5 * 60 * 1000, // 5 minutes - reduce refetch frequency
    },
  },
});

const App = () => {
  console.log("Rendering App component");
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/auth" element={<Auth />} />
              
              {/* Route component to handle initial redirection logic */}
              <Route path="/" element={<Index />} />
              <Route path="/index" element={<Navigate to="/" replace />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  {/* Dashboard as separate route */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Ensure routes paths are properly configured */}
                  <Route path="/routes/*" element={<RoutesList />} />
                  <Route path="/routes" element={<RoutesList />} />
                  
                  <Route path="/machine-triggers" element={<MachineTriggers />} />
                  <Route path="/locations" element={<Locations />} />
                  <Route path="/fleet" element={<Fleet />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                  
                  {/* Reports routes */}
                  <Route path="/reports" element={<ReportsLayout />}>
                    <Route index element={<Navigate to="/reports/delivery/daily" replace />} />
                    <Route path="delivery">
                      <Route path="daily" element={<DailyReports />} />
                      <Route path="weekly" element={<WeeklyReports />} />
                      <Route path="monthly" element={<MonthlyReports />} />
                    </Route>
                  </Route>
                </Route>
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;

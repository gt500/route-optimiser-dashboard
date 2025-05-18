
import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('Index component mounted, redirection flow starting', location);
    
    // Check if we were trying to access routes but got redirected
    const wasAttemptingRoutes = sessionStorage.getItem('attempting_routes');
    const fromRegionSelection = sessionStorage.getItem('from_region_selection');
    
    if (wasAttemptingRoutes || fromRegionSelection) {
      console.log('Detected attempted routes access, redirecting back to routes');
      // Clean up flags
      sessionStorage.removeItem('attempting_routes');
      sessionStorage.removeItem('from_region_selection');
      // Redirect with replace to avoid navigation history issues
      navigate('/routes', { replace: true });
      return;
    }
    
    // Default redirect to dashboard if not coming from routes
    if (location.pathname === '/' && !wasAttemptingRoutes && !fromRegionSelection) {
      console.log('Default redirect to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [location, navigate]);

  // Make sure we're not in an infinite redirect loop
  if (location.pathname === '/index') {
    return <Navigate to="/" replace />;
  }

  return null;
};

export default Index;

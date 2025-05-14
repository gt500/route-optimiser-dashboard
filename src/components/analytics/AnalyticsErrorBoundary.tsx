
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Error boundary component to catch errors in child components
class AnalyticsErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Analytics component error:', error);
    toast({
      title: 'Error Loading Analytics',
      description: 'There was a problem loading this section. Try refreshing the page.',
      variant: 'destructive',
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const ErrorFallback: React.FC = () => (
  <Alert variant="destructive" className="my-4">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>
      There was an error loading this content. Please try refreshing the page.
      <Button 
        variant="outline" 
        size="sm" 
        className="ml-2" 
        onClick={() => window.location.reload()}
      >
        Refresh
      </Button>
    </AlertDescription>
  </Alert>
);

export default AnalyticsErrorBoundary;

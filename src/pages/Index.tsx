
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-md px-6">
        <h1 className="text-4xl font-bold mb-4">Welcome to RouteOptima</h1>
        <p className="text-xl text-gray-600 mb-8">
          Optimize your delivery routes and manage your logistics efficiently
        </p>
        <Button asChild size="lg" className="gap-2">
          <Link to="/routes">
            Go to Route Optimizer <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Index;


import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export const MetricsCardsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array(4).fill(0).map((_, i) => (
      <Skeleton key={i} className="h-24 rounded-lg" />
    ))}
  </div>
);

export const TabsFallback: React.FC = () => (
  <div className="space-y-4">
    <div className="bg-muted h-10 rounded-md animate-pulse" />
    <div className="space-y-4">
      <div className="bg-muted h-64 rounded-md animate-pulse" />
    </div>
  </div>
);

export const TabContentLoader: React.FC = () => (
  <div className="h-60 w-full flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);

export default {
  MetricsCardsSkeleton,
  TabsFallback,
  TabContentLoader
};

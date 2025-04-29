
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Play, Clock } from 'lucide-react';

interface RouteStatusBadgeProps {
  status: string;
}

const RouteStatusBadge = ({ status }: RouteStatusBadgeProps) => {
  if (status === 'scheduled') {
    return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Scheduled</Badge>;
  } else if (status === 'in_progress') {
    return (
      <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 flex items-center gap-1">
        <Play className="h-3 w-3" />
        In Progress
      </Badge>
    );
  } else if (status === 'completed') {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Done
      </Badge>
    );
  }
  return <Badge variant="outline">{status}</Badge>;
};

export default RouteStatusBadge;

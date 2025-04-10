
export const routeLegendData = [
  { id: 'Route 1', name: 'Cape Town CBD', color: '#0088FE', description: 'Atlantic Seaboard deliveries' },
  { id: 'Route 2', name: 'Gas Depot - Southern Suburbs', color: '#00C49F', description: 'Suburban delivery route' },
  { id: 'Route 3', name: 'Northern Distribution Line', color: '#FFBB28', description: 'Industrial area route' },
  { id: 'Route 4', name: 'Atlantic Seaboard', color: '#FF8042', description: 'Coastal delivery route' },
  { id: 'Route 5', name: 'Stellenbosch Distribution', color: '#8884d8', description: 'Wine region route' },
  { id: 'Route 6', name: 'West Coast', color: '#82ca9d', description: 'Milnerton to Saldanha route' },
];

export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const getColorClass = (colorHex: string): string => {
  switch (colorHex) {
    case '#0088FE': return 'bg-blue-500';
    case '#00C49F': return 'bg-emerald-500';
    case '#FFBB28': return 'bg-amber-500';
    case '#FF8042': return 'bg-orange-500';
    case '#8884d8': return 'bg-purple-500';
    case '#82ca9d': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

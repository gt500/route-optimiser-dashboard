
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, TruckIcon, GasPump, MapPin, Wrench, Activity } from 'lucide-react';

// Sample vehicle data
const vehicles = [
  { id: 'TRK-001', name: 'Truck 1', status: 'On Route', capacity: 80, load: 65, fuelLevel: 78, location: 'Cape Town CBD', lastService: '2023-10-15' },
  { id: 'TRK-002', name: 'Truck 2', status: 'Available', capacity: 80, load: 0, fuelLevel: 92, location: 'Warehouse A', lastService: '2023-11-02' },
  { id: 'TRK-003', name: 'Truck 3', status: 'Maintenance', capacity: 80, load: 0, fuelLevel: 45, location: 'Service Center', lastService: '2023-12-05' },
  { id: 'TRK-004', name: 'Truck 4', status: 'Available', capacity: 80, load: 0, fuelLevel: 85, location: 'Warehouse B', lastService: '2023-10-30' },
];

// Sample maintenance schedule
const maintenanceSchedule = [
  { vehicle: 'Truck 3', type: 'Engine Service', date: '2023-12-05', status: 'In Progress' },
  { vehicle: 'Truck 1', type: 'Tire Replacement', date: '2023-12-12', status: 'Scheduled' },
  { vehicle: 'Truck 2', type: 'Brake Inspection', date: '2023-12-15', status: 'Scheduled' },
  { vehicle: 'Truck 4', type: 'Oil Change', date: '2023-12-18', status: 'Scheduled' },
];

const VehicleStatusCard = ({ status, count, icon: Icon, color }) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">{status}</CardTitle>
        <div className={`text-${color}-500`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
        <p className="text-xs text-muted-foreground">vehicles</p>
      </CardContent>
    </Card>
  );
};

const Fleet = () => {
  // Counts for status cards
  const statusCounts = {
    available: vehicles.filter(v => v.status === 'Available').length,
    onRoute: vehicles.filter(v => v.status === 'On Route').length,
    maintenance: vehicles.filter(v => v.status === 'Maintenance').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fleet Management</h1>
          <p className="text-muted-foreground">Monitor and manage delivery vehicles</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <VehicleStatusCard status="Available" count={statusCounts.available} icon={TruckIcon} color="green" />
        <VehicleStatusCard status="On Route" count={statusCounts.onRoute} icon={MapPin} color="blue" />
        <VehicleStatusCard status="In Maintenance" count={statusCounts.maintenance} icon={Wrench} color="amber" />
      </div>

      <Card className="hover:shadow-md transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Vehicle Fleet</CardTitle>
          <CardDescription>Status and details of all vehicles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Load</TableHead>
                  <TableHead>Fuel</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Last Service</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id} className="transition-colors hover:bg-secondary/30">
                    <TableCell className="font-medium">{vehicle.id}</TableCell>
                    <TableCell>{vehicle.name}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          vehicle.status === 'Available' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : vehicle.status === 'On Route'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                        }
                      >
                        {vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={(vehicle.load / vehicle.capacity) * 100} className="h-2 w-16" />
                        <span className="text-xs">{vehicle.load}/{vehicle.capacity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <GasPump className="h-4 w-4 text-muted-foreground" />
                        <Progress 
                          value={vehicle.fuelLevel} 
                          className="h-2 w-16"
                          style={{
                            background: vehicle.fuelLevel < 30 ? 'rgba(239, 68, 68, 0.2)' : undefined,
                          }}
                        />
                        <span className="text-xs">{vehicle.fuelLevel}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{vehicle.location}</TableCell>
                    <TableCell>{vehicle.lastService}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Maintenance Schedule</CardTitle>
              <CardDescription>Upcoming service and maintenance</CardDescription>
            </div>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {maintenanceSchedule.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <div className="font-medium">{item.vehicle}</div>
                    <div className="text-sm text-muted-foreground">{item.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{item.date}</div>
                    <Badge 
                      variant="outline" 
                      className={
                        item.status === 'In Progress' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Fleet Performance</CardTitle>
              <CardDescription>Efficiency and utilization metrics</CardDescription>
            </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium">Average Fuel Efficiency</div>
                  <div className="text-sm font-medium">8.3 km/L</div>
                </div>
                <Progress value={83} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">8.3 km/L (target: 10 km/L)</div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium">Fleet Utilization</div>
                  <div className="text-sm font-medium">75%</div>
                </div>
                <Progress value={75} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">75% (target: 80%)</div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium">Maintenance Compliance</div>
                  <div className="text-sm font-medium">92%</div>
                </div>
                <Progress value={92} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">92% (target: 95%)</div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium">On-Time Deliveries</div>
                  <div className="text-sm font-medium">88%</div>
                </div>
                <Progress value={88} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">88% (target: 90%)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Fleet;

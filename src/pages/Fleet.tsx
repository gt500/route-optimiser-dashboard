
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, TruckIcon, MapPin, Wrench, Activity, Clipboard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Updated vehicle data for South Africa
const vehicles = [
  { id: 'TRK-001', name: 'Isuzu NQR', status: 'On Route', capacity: 80, load: 65, fuelLevel: 78, location: 'Cape Town CBD', lastService: '2023-10-15' },
  { id: 'TRK-002', name: 'Isuzu FVZ', status: 'Available', capacity: 80, load: 0, fuelLevel: 92, location: 'Afrox Epping Depot', lastService: '2023-11-02' },
  { id: 'TRK-003', name: 'Hino 500', status: 'Maintenance', capacity: 80, load: 0, fuelLevel: 45, location: 'Service Center', lastService: '2023-12-05' },
  { id: 'TRK-004', name: 'Isuzu NPR', status: 'Available', capacity: 80, load: 0, fuelLevel: 85, location: 'Storage Facility B', lastService: '2023-10-30' },
];

// Updated maintenance schedule
const maintenanceSchedule = [
  { vehicle: 'Hino 500', type: 'Engine Service', date: '2023-12-05', status: 'In Progress' },
  { vehicle: 'Isuzu NQR', type: 'Tire Replacement', date: '2023-12-12', status: 'Scheduled' },
  { vehicle: 'Isuzu FVZ', type: 'Brake Inspection', date: '2023-12-15', status: 'Scheduled' },
  { vehicle: 'Isuzu NPR', type: 'Oil Change', date: '2023-12-18', status: 'Scheduled' },
];

// Variable costs data
const variableCosts = [
  { type: '15inch Tyres', description: '4 Tyres', cost: 2115, notes: 'lasts 4-5 months' },
  { type: 'Minor Services', description: 'Every 15 000km @ R5000', cost: 1667 },
  { type: 'Major Service', description: 'Every 45 000km', cost: 1250 },
  { type: 'Diesel per month', description: '320km x 22 days x R2,20', cost: 15488, notes: '7040 per month' },
  { type: 'Miscellaneous', description: 'Car wash etc.', cost: 800 },
];

// Fixed costs data
const fixedCosts = [
  { type: 'Tracker', description: 'Vehicle', cost: 200 },
  { type: 'Insurance', description: 'Vehicle', cost: 2000 },
  { type: 'Insurance', description: 'Goods in Transit', cost: 400 },
  { type: 'Insurance', description: 'Chemical Clean Up', cost: 1000 },
  { type: 'Driver', description: '', cost: 10000 },
  { type: 'Manager', description: '', cost: 14000 },
  { type: 'Uniform', description: '', cost: 219 },
  { type: 'Meals', description: '', cost: 1500 },
  { type: 'MobiClock Pro', description: '', cost: 1500 },
  { type: 'SIM Card', description: '', cost: 300 },
  { type: 'Registration', description: 'Vehicle', cost: 125 },
];

// Cost summaries
const costSummary = {
  variableTotal: 21320,
  fixedTotal: 31244,
  monthlyTotal: 52564,
  twoVehiclesTotal: 105127.33,
  costPerKm: 7.46,
  costPerKgLPG: 0.83
};

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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
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
                            <MapPin className="h-4 w-4 text-muted-foreground" />
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
        </TabsContent>
        
        <TabsContent value="costs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Variable Costs Card */}
            <Card>
              <CardHeader className="bg-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <Clipboard className="h-5 w-5" />
                  Variable Vehicle Costs
                </CardTitle>
                <CardDescription>Costs that vary with distance traveled</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cost Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Cost (R)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {variableCosts.map((cost, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{cost.type}</TableCell>
                          <TableCell>{cost.description}</TableCell>
                          <TableCell className="text-right">
                            {cost.cost.toLocaleString()}
                            {cost.notes && <div className="text-xs text-muted-foreground">{cost.notes}</div>}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2 font-bold">
                        <TableCell colSpan={2}>Total</TableCell>
                        <TableCell className="text-right">{costSummary.variableTotal.toLocaleString()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            
            {/* Fixed Costs Card */}
            <Card>
              <CardHeader className="bg-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <Clipboard className="h-5 w-5" />
                  Fixed Vehicle Costs
                </CardTitle>
                <CardDescription>Monthly fixed costs regardless of distance</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cost Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Cost (R)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fixedCosts.map((cost, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{cost.type}</TableCell>
                          <TableCell>{cost.description}</TableCell>
                          <TableCell className="text-right">{cost.cost.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2 font-bold">
                        <TableCell colSpan={2}>Total</TableCell>
                        <TableCell className="text-right">{costSummary.fixedTotal.toLocaleString()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Cost Summary */}
          <Card>
            <CardHeader className="bg-black text-white">
              <CardTitle>Cost Summary</CardTitle>
              <CardDescription className="text-gray-300">Key operational cost metrics</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-100 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-1">Total Cost per Month</h3>
                  <div className="text-2xl font-bold">R {costSummary.monthlyTotal.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Single vehicle</p>
                </div>
                
                <div className="bg-slate-100 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-1">Total for Fleet</h3>
                  <div className="text-2xl font-bold">R {costSummary.twoVehiclesTotal.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Cost for 2 vehicles</p>
                </div>
                
                <div className="bg-slate-100 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-1">Cost per KM</h3>
                  <div className="text-2xl font-bold">R {costSummary.costPerKm.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Using 10,000km average</p>
                </div>
              </div>
              
              <div className="mt-4 bg-slate-100 p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-1">Cost per KG of LPG</h3>
                <div className="text-2xl font-bold">R {costSummary.costPerKgLPG.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Variable and fixed costs included</p>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-lg">
                <h3 className="font-medium">Cost Calculation Formula:</h3>
                <p className="text-sm mt-1">
                  Cost per Km = (Variable cost / Total Distance) + (Fixed cost / Total Distance)
                </p>
                <p className="text-sm mt-1">
                  = (R57,930 / 10,000) + (R5,100 / 10,000) ≈ R7.47 per km
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Fleet;

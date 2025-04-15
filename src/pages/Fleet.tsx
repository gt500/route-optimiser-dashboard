import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, TruckIcon, MapPin, Wrench, Activity, Clipboard, Edit, RefreshCw, CalendarDays } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VehicleEditDialog } from '@/components/fleet/VehicleEditDialog';
import { useFleetData } from '@/hooks/useFleetData';
import MaintenanceScheduleTable from '@/components/fleet/MaintenanceScheduleTable';
import { format, differenceInDays, parseISO } from 'date-fns';

const variableCosts = [
  { type: '15inch Tyres', description: '4 Tyres', cost: 2115, notes: 'lasts 4-5 months' },
  { type: 'Minor Services', description: 'Every 15 000km @ R5000', cost: 1667 },
  { type: 'Major Service', description: 'Every 45 000km', cost: 1250 },
  { type: 'Diesel per month', description: '320km x 22 days x R2,20', cost: 15488, notes: '7040 per month' },
  { type: 'Miscellaneous', description: 'Car wash etc.', cost: 800 },
];

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
    <Card className="hover:shadow-md transition-shadow duration-300 bg-black/70 border-white/10">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-white/90">{status}</CardTitle>
        <div className={`text-${color}-400`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{count}</div>
        <p className="text-xs text-white/60">vehicles</p>
      </CardContent>
    </Card>
  );
};

const Fleet = () => {
  const { 
    vehicles, 
    maintenanceItems, 
    performanceMetrics, 
    isLoading, 
    saveVehicle, 
    refreshData 
  } = useFleetData();
  
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const statusCounts = {
    available: vehicles.filter(v => v.status === 'Available').length,
    onRoute: vehicles.filter(v => v.status === 'On Route').length,
    maintenance: vehicles.filter(v => v.status === 'Maintenance').length,
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsDialogOpen(true);
  };

  const handleSaveVehicle = (updatedVehicle) => {
    saveVehicle(updatedVehicle).then(() => {
      setIsDialogOpen(false);
      setEditingVehicle(null);
    });
  };

  const handleAddVehicle = () => {
    setEditingVehicle({
      id: '',
      name: 'Leyland Phoenix',
      licensePlate: '',
      status: 'Available',
      capacity: 80,
      load: 0,
      fuelLevel: 100,
      location: '',
      lastService: new Date().toISOString().split('T')[0],
      country: 'South Africa',
      region: ''
    });
    setIsDialogOpen(true);
  };

  const calculateDaysInService = (startDate) => {
    if (!startDate) return 0;
    return differenceInDays(new Date(), parseISO(startDate));
  };

  return (
    <div className="space-y-6 animate-fade-in bg-black text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fleet Management</h1>
          <p className="text-muted-foreground">Monitor and manage delivery vehicles</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshData} size="icon" variant="outline">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleAddVehicle} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-black/50 border-white/10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Schedule</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <VehicleStatusCard status="Available" count={statusCounts.available} icon={TruckIcon} color="green" />
            <VehicleStatusCard status="On Route" count={statusCounts.onRoute} icon={MapPin} color="blue" />
            <VehicleStatusCard status="In Maintenance" count={statusCounts.maintenance} icon={Wrench} color="amber" />
          </div>

          <Card className="hover:shadow-md transition-shadow duration-300 bg-black/70 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Vehicle Fleet</CardTitle>
              <CardDescription className="text-white/60">Status and details of all vehicles</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="py-4 text-center text-white/60">Loading vehicle data...</div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table className="text-white">
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead className="text-white/80">ID</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>License Plate</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Days in Service</TableHead>
                        <TableHead>Load</TableHead>
                        <TableHead>Fuel</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Last Service</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicles.map((vehicle) => (
                        <TableRow key={vehicle.id} className="transition-colors hover:bg-secondary/30">
                          <TableCell className="font-medium">{vehicle.id}</TableCell>
                          <TableCell>{vehicle.name}</TableCell>
                          <TableCell>{vehicle.licensePlate}</TableCell>
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
                          <TableCell>{vehicle.country}</TableCell>
                          <TableCell>{vehicle.region}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-muted-foreground" />
                              {vehicle.startDate || 'Not set'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {vehicle.startDate ? calculateDaysInService(vehicle.startDate) : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={(vehicle.load / vehicle.capacity) * 100} className="h-2 w-16" />
                              <span className="text-xs">{vehicle.load}/{vehicle.capacity}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
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
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEditVehicle(vehicle)}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="hover:shadow-md transition-shadow duration-300 bg-black/70 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-white">Upcoming Maintenance</CardTitle>
                  <CardDescription className="text-white/60">Next scheduled services</CardDescription>
                </div>
                <Wrench className="h-4 w-4 text-white/60" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {maintenanceItems.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div>
                        <div className="font-medium">{item.vehicle}</div>
                        <div className="text-sm text-white/60">{item.type}</div>
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
                  {maintenanceItems.length === 0 && (
                    <div className="p-3 text-center text-white/60">
                      No upcoming maintenance scheduled
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow duration-300 bg-black/70 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-white">Fleet Performance</CardTitle>
                  <CardDescription className="text-white/60">Efficiency and utilization metrics</CardDescription>
                </div>
                <Activity className="h-4 w-4 text-white/60" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Average Fuel Efficiency</div>
                      <div className="text-sm font-medium">{performanceMetrics.fuelEfficiency.value} km/L</div>
                    </div>
                    <Progress 
                      value={(performanceMetrics.fuelEfficiency.value / performanceMetrics.fuelEfficiency.target) * 100}
                      className="h-2" 
                    />
                    <div className="text-xs text-white/60 mt-1">
                      {performanceMetrics.fuelEfficiency.value} km/L (target: {performanceMetrics.fuelEfficiency.target} km/L)
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Fleet Utilization</div>
                      <div className="text-sm font-medium">{performanceMetrics.fleetUtilization.value}%</div>
                    </div>
                    <Progress 
                      value={performanceMetrics.fleetUtilization.value} 
                      className="h-2" 
                    />
                    <div className="text-xs text-white/60 mt-1">
                      {performanceMetrics.fleetUtilization.value}% (target: {performanceMetrics.fleetUtilization.target}%)
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Maintenance Compliance</div>
                      <div className="text-sm font-medium">{performanceMetrics.maintenanceCompliance.value}%</div>
                    </div>
                    <Progress 
                      value={performanceMetrics.maintenanceCompliance.value} 
                      className="h-2" 
                    />
                    <div className="text-xs text-white/60 mt-1">
                      {performanceMetrics.maintenanceCompliance.value}% (target: {performanceMetrics.maintenanceCompliance.target}%)
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">On-Time Deliveries</div>
                      <div className="text-sm font-medium">{performanceMetrics.onTimeDeliveries.value}%</div>
                    </div>
                    <Progress 
                      value={performanceMetrics.onTimeDeliveries.value} 
                      className="h-2" 
                    />
                    <div className="text-xs text-white/60 mt-1">
                      {performanceMetrics.onTimeDeliveries.value}% (target: {performanceMetrics.onTimeDeliveries.target}%)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="maintenance" className="space-y-6">
          <MaintenanceScheduleTable 
            maintenanceItems={maintenanceItems}
            monthlyTasks={useFleetData().monthlyTasks}
            quarterlyTasks={useFleetData().quarterlyTasks}
            fixedCosts={useFleetData().fixedCosts}
            budgetSummary={useFleetData().budgetSummary}
            sampleTimeline={useFleetData().sampleTimeline}
          />
        </TabsContent>
        
        <TabsContent value="costs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      
      <VehicleEditDialog 
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingVehicle(null);
        }}
        vehicle={editingVehicle}
        onSave={handleSaveVehicle}
      />
    </div>
  );
};

export default Fleet;

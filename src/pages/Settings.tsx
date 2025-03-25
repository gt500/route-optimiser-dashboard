
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Settings = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage system preferences and configuration</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="routing">Routing</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card className="hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your company details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" defaultValue="LogisticsPro Ltd." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input id="contactEmail" defaultValue="info@logisticspro.example" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input id="contactPhone" defaultValue="+27 21 555 1234" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" defaultValue="123 Business Park, Cape Town" />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Interface Preferences</CardTitle>
              <CardDescription>Customize your dashboard experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <div className="text-sm text-muted-foreground">
                      Switch between light and dark themes
                    </div>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatic Refresh</Label>
                    <div className="text-sm text-muted-foreground">
                      Automatically refresh data every 5 minutes
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Notifications</Label>
                    <div className="text-sm text-muted-foreground">
                      Display system notifications in the dashboard
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button>Save Preferences</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="routing" className="space-y-4">
          <Card className="hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Routing Configuration</CardTitle>
              <CardDescription>Configure route optimization parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fuelPrice">Current Fuel Price (R/L)</Label>
                  <Input id="fuelPrice" type="number" defaultValue="21.95" step="0.01" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuelConsumption">Average Fuel Consumption (L/100km)</Label>
                  <Input id="fuelConsumption" type="number" defaultValue="12" step="0.1" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cylinderWeight">Full Cylinder Weight (kg)</Label>
                  <Input id="cylinderWeight" type="number" defaultValue="22" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoad">Maximum Truck Load (cylinders)</Label>
                  <Input id="maxLoad" type="number" defaultValue="80" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="routingStrategy">Routing Optimization Strategy</Label>
                <Select defaultValue="balanced">
                  <SelectTrigger id="routingStrategy">
                    <SelectValue placeholder="Select strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">Minimize Distance</SelectItem>
                    <SelectItem value="time">Minimize Time</SelectItem>
                    <SelectItem value="fuel">Minimize Fuel Consumption</SelectItem>
                    <SelectItem value="balanced">Balanced Approach</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Route Recalculation</Label>
                  <div className="text-sm text-muted-foreground">
                    Automatically recalculate routes if conditions change
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button>Update Routing Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="vehicles" className="space-y-4">
          <Card className="hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Vehicle Settings</CardTitle>
              <CardDescription>Configure fleet parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maintenanceInterval">Maintenance Interval (km)</Label>
                  <Input id="maintenanceInterval" type="number" defaultValue="5000" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="serviceReminder">Service Reminder (days before)</Label>
                  <Input id="serviceReminder" type="number" defaultValue="7" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Fleet Tracking</Label>
                    <div className="text-sm text-muted-foreground">
                      Track vehicle location in real-time
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Low Fuel Alerts</Label>
                    <div className="text-sm text-muted-foreground">
                      Send notifications when fuel level is below 20%
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button>Save Vehicle Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card className="hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <div className="text-sm text-muted-foreground">
                      Send notifications to email
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Daily Reports</Label>
                    <div className="text-sm text-muted-foreground">
                      Send daily activity summary
                    </div>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Route Completion Alerts</Label>
                    <div className="text-sm text-muted-foreground">
                      Notification when a route is completed
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Reminders</Label>
                    <div className="text-sm text-muted-foreground">
                      Alert for scheduled vehicle maintenance
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button>Update Notification Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

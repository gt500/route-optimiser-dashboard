
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, AlertTriangle, Clock, DollarSign, Car, CheckCircle, Wrench, ClipboardList } from 'lucide-react';
import { MaintenanceItem, MaintenanceTask, FixedCost, MaintenanceBudget, MaintenanceTimeline } from '@/types/fleet';

interface MaintenanceScheduleTableProps {
  maintenanceItems: MaintenanceItem[];
  monthlyTasks: MaintenanceTask[];
  quarterlyTasks: MaintenanceTask[];
  fixedCosts: FixedCost[];
  budgetSummary: MaintenanceBudget[];
  sampleTimeline: MaintenanceTimeline[];
}

const MaintenanceScheduleTable: React.FC<MaintenanceScheduleTableProps> = ({
  maintenanceItems,
  monthlyTasks,
  quarterlyTasks,
  fixedCosts,
  budgetSummary,
  sampleTimeline
}) => {
  const [activeTab, setActiveTab] = useState('upcoming');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Scheduled</Badge>;
      case 'In Progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case 'Completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <div className="flex justify-between items-center">
        <TabsList>
          <TabsTrigger value="upcoming" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Upcoming</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-1">
            <ClipboardList className="h-4 w-4" />
            <span>Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="costs" className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span>Costs</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Timeline</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="upcoming" className="mt-0">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Upcoming Maintenance</CardTitle>
            <CardDescription>Vehicle maintenance schedule for the fleet</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Cost (R)</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.vehicle}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          item.category === 'Monthly' 
                            ? 'bg-blue-50 text-blue-700' 
                            : item.category === 'Quarterly'
                              ? 'bg-purple-50 text-purple-700'
                              : 'bg-green-50 text-green-700'
                        }>
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">{item.cost.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.notes || item.triggerPoint || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {maintenanceItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                        No upcoming maintenance scheduled
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tasks" className="mt-0 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Monthly Tasks
            </CardTitle>
            <CardDescription>Regular monthly maintenance tasks</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead className="text-right">Cost (R)</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyTasks.map((task, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{task.task}</TableCell>
                      <TableCell>{task.frequency}</TableCell>
                      <TableCell className="text-right">{task.cost.toLocaleString()}</TableCell>
                      <TableCell>{task.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="h-5 w-5 text-purple-600" />
              Quarterly/Distance-Based Tasks
            </CardTitle>
            <CardDescription>Tasks triggered by time or distance</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead className="text-right">Cost (R)</TableHead>
                    <TableHead>Trigger Point</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quarterlyTasks.map((task, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{task.task}</TableCell>
                      <TableCell>{task.frequency}</TableCell>
                      <TableCell className="text-right">{task.cost.toLocaleString()}</TableCell>
                      <TableCell>{task.triggerPoint || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="costs" className="mt-0 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Fixed Monthly Costs
            </CardTitle>
            <CardDescription>Recurring monthly fixed costs</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
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
                      <TableCell>{cost.description || '-'}</TableCell>
                      <TableCell className="text-right">{cost.cost.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-bold" colSpan={2}>Total Fixed</TableCell>
                    <TableCell className="text-right font-bold">
                      {fixedCosts.reduce((sum, item) => sum + item.cost, 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Budget Summary
            </CardTitle>
            <CardDescription>Monthly and annual cost breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {budgetSummary.map((item, index) => (
                <div key={index} className={`p-4 rounded-lg ${
                  item.category === 'Total' 
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-slate-50 border border-slate-200'
                }`}>
                  <div className="text-sm font-medium mb-1">{item.category}</div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-2xl font-bold">R {item.monthlyCost.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">per month</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">R {item.annualCost.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">per year</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-2">💰 Implementation Tips</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span><strong>Track Odometer:</strong> Use apps like Fuelio or Drivvo to log mileage and auto-alert for services.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span><strong>Service Alignments:</strong> Pair tyre replacements with major services (~every 6 months) to reduce downtime.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span><strong>Cost Buffer:</strong> Add a 10% contingency (~R5,256/month) for unexpected repairs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span><strong>Supplier Contracts:</strong> Negotiate bulk discounts for tyres/services with local garages.</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="timeline" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              6-Month Maintenance Timeline
            </CardTitle>
            <CardDescription>Projected maintenance schedule and costs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sampleTimeline.map((item, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <div className="bg-slate-100 p-3 border-b">
                    <h3 className="font-medium">Month {item.month}</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2 mb-3">
                      {item.tasks.map((task, taskIndex) => (
                        <div key={taskIndex} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{task}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-lg font-bold mt-2">
                      R {item.estimatedCost.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Estimated total cost
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default MaintenanceScheduleTable;

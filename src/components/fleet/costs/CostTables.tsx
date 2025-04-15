
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clipboard } from 'lucide-react';

interface CostItem {
  type: string;
  description: string;
  cost: number;
  notes?: string;
}

interface CostTablesProps {
  variableCosts: CostItem[];
  fixedCosts: CostItem[];
  costSummary: {
    variableTotal: number;
    fixedTotal: number;
    monthlyTotal: number;
    twoVehiclesTotal: number;
    costPerKm: number;
    costPerKgLPG: number;
  };
}

const CostTable: React.FC<{ title: string; description: string; costs: CostItem[]; total: number }> = ({
  title,
  description,
  costs,
  total
}) => {
  return (
    <Card>
      <CardHeader className="bg-slate-100">
        <CardTitle className="flex items-center gap-2">
          <Clipboard className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
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
              {costs.map((cost, index) => (
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
                <TableCell className="text-right">{total.toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

const CostTables: React.FC<CostTablesProps> = ({ variableCosts, fixedCosts, costSummary }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CostTable 
        title="Variable Vehicle Costs" 
        description="Costs that vary with distance traveled"
        costs={variableCosts}
        total={costSummary.variableTotal}
      />
      <CostTable 
        title="Fixed Vehicle Costs" 
        description="Monthly fixed costs regardless of distance"
        costs={fixedCosts}
        total={costSummary.fixedTotal}
      />
    </div>
  );
};

export default CostTables;

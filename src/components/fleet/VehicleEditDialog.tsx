
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const vehicleStatusOptions = ['Available', 'On Route', 'Maintenance'];

const countriesWithRegions = {
  'South Africa': [
    'Western Cape', 'Eastern Cape', 'Northern Cape', 'North West', 
    'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga'
  ],
  'Namibia': [
    'Erongo', 'Hardap', 'Karas', 'Kavango East', 'Kavango West', 
    'Khomas', 'Kunene', 'Ohangwena', 'Omaheke', 'Omusati', 
    'Oshana', 'Oshikoto', 'Otjozondjupa', 'Zambezi'
  ],
  'Botswana': [
    'Central', 'Ghanzi', 'Kgalagadi', 'Kgatleng', 
    'Kweneng', 'North-East', 'North-West', 'South-East', 'Southern'
  ],
  'Zimbabwe': [
    'Bulawayo', 'Harare', 'Manicaland', 'Mashonaland Central', 
    'Mashonaland East', 'Mashonaland West', 'Masvingo', 
    'Matabeleland North', 'Matabeleland South', 'Midlands'
  ],
  'Mozambique': [
    'Cabo Delgado', 'Gaza', 'Inhambane', 'Manica', 'Maputo', 
    'Nampula', 'Niassa', 'Sofala', 'Tete', 'Zambezia'
  ]
};

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "Vehicle name must be at least 2 characters." }),
  licensePlate: z.string().min(2, { message: "License plate is required." }),
  status: z.enum(vehicleStatusOptions as [string, ...string[]]),
  capacity: z.coerce.number().min(1, { message: "Capacity must be greater than 0." }),
  load: z.coerce.number().min(0, { message: "Load must be non-negative." }),
  fuelLevel: z.coerce.number().min(0, { message: "Fuel level must be between 0 and 100." }).max(100),
  location: z.string(),
  lastService: z.string(),
  country: z.string().min(1, { message: "Country is required." }),
  region: z.string().min(1, { message: "Region is required." }),
});

type VehicleFormValues = z.infer<typeof formSchema>;

interface VehicleEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: any; // The vehicle to edit or null for a new vehicle
  onSave: (vehicle: any) => void;
}

export function VehicleEditDialog({ isOpen, onClose, vehicle, onSave }: VehicleEditDialogProps) {
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: vehicle || {
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
    },
  });

  React.useEffect(() => {
    if (vehicle) {
      form.reset(vehicle);
    }
  }, [vehicle, form]);

  const onSubmit = (data: VehicleFormValues) => {
    onSave(data);
  };

  const watchedCountry = form.watch('country');
  const regions = countriesWithRegions[watchedCountry] || [];

  // Reset region when country changes
  React.useEffect(() => {
    if (!regions.includes(form.getValues('region'))) {
      form.setValue('region', '');
    }
  }, [watchedCountry, form, regions]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{vehicle?.id ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Leyland Phoenix" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="licensePlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Plate</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="CA 123-456" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicleStatusOptions.map(status => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Cape Town CBD" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.keys(countriesWithRegions).map(country => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={!watchedCountry}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {regions.map(region => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="load"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Load</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fuelLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuel Level (%)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" max="100" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="lastService"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Service Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {vehicle?.id ? 'Save Changes' : 'Add Vehicle'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


export interface MachineData {
  site_name: string;
  machine_name: string;
  terminal_id: string;
  merchant_id: string;
  cylinder_stock: number;
  last_update: string;
  country?: string;
  region?: string;
}

export interface CountryRegion {
  country: string;
  regions: string[];
}

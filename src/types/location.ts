
import { Icon, DivIcon } from 'leaflet';

export interface LocationType {
  id: string;
  name: string;
  type: string;
  address: string;
  lat: number;
  long: number;
  fullCylinders?: number;
  emptyCylinders?: number;
  isWarehouse?: boolean;
  open_time?: string;
  close_time?: string;
}

export interface LocationInfo {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type?: string;
  fullCylinders?: number;
  emptyCylinders?: number;
  open_time?: string;
  close_time?: string;
}

export interface SupabaseLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type?: string;
  open_time?: string;
  close_time?: string;
}

// Define Leaflet component specific types to help with type checking
export interface LeafletComponentProps {
  position: [number, number];
  children?: React.ReactNode;
  icon?: Icon | DivIcon;
  eventHandlers?: {
    click?: () => void;
    [key: string]: (() => void) | undefined;
  };
}

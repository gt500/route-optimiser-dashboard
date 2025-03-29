
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

// Define prop interfaces for react-leaflet components
export interface LeafletMarkerProps {
  position: [number, number];
  children?: React.ReactNode;
}

export interface LeafletMapProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export interface LeafletTileLayerProps {
  url: string;
  children?: React.ReactNode;
}

// Add proper type definitions for default Leaflet props
export interface LeafletEventHandlerProps {
  eventHandlers?: {
    [key: string]: (() => void) | undefined;
  };
}

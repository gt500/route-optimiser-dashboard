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
  region?: string;
  country?: string;
  distance?: number;
  fuel_cost?: number;
  cylinders?: number;
  segmentDistance?: number;
  segmentDuration?: number;
  segmentCost?: number;
}

export interface LocationInfo {
  id: string;
  name: string;
  address: string;  // Required field for consistent type handling
  latitude: number;
  longitude: number;
  type?: string;
  fullCylinders?: number;
  emptyCylinders?: number;
  open_time?: string;
  close_time?: string;
  status?: string;
  region?: string;
  country?: string;
  cylinders?: number;  // Added this property
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
  region?: string;
  country?: string;
}

export interface LocationPoint {
  id: string;
  name: string;
  address: string;  // Changed from optional to required for consistency
  latitude: number;
  longitude: number;
  cylinders?: number;  // Added this property
}

export interface NamedCoords {
  name: string;
  coords: [number, number];
}

// Adding more specific interfaces for Leaflet components to help with TypeScript errors
export interface LeafletMapContainerProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  center?: [number, number]; // Changed from required to optional
  zoom?: number; // Changed from required to optional
  whenReady?: (map: any) => void; 
}

// Updated to properly include attribution and other TileLayer props
export interface LeafletTileLayerProps {
  url: string;
  attribution?: string;
  zIndex?: number;
  // Adding any to allow for all Leaflet TileLayer options
  [key: string]: any;
}

export interface LeafletMarkerProps {
  position: [number, number];
  icon?: any;  // Add icon property
  children?: React.ReactNode;
}

export interface LeafletPolylineProps {
  positions: [number, number][];
  color?: string;  // Add color property
  [key: string]: any;
}

export interface LeafletMapProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export interface LeafletEventHandlerProps {
  eventHandlers?: {
    [key: string]: (() => void) | undefined;
  };
}

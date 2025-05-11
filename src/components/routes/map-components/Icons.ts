
import L from 'leaflet';

interface DepotIconOptions {
  label?: string;
  isStart?: boolean;
  isEnd?: boolean;
  customSize?: number;
}

interface LocationIconOptions {
  label?: string | number;
  color?: string;
  customSize?: number;
  type?: string;
}

// Create depot marker HTML content
export const createDepotIconHtml = (options: DepotIconOptions = {}): string => {
  const { label, isStart = false, isEnd = false, customSize = 34 } = options;
  
  const bgColor = isStart ? '#22c55e' : isEnd ? '#ef4444' : '#3b82f6'; // Changed default to blue
  
  return `
    <div class="flex items-center justify-center rounded-full bg-white p-1 shadow-md" style="width: ${customSize}px; height: ${customSize}px;">
      <div class="flex items-center justify-center rounded-full text-white text-xs font-bold" 
           style="width: ${customSize - 6}px; height: ${customSize - 6}px; background-color: ${bgColor};">
        ${label || (isStart ? 'S' : isEnd ? 'E' : 'D')}
      </div>
    </div>
  `;
};

// Create location marker HTML content
export const createLocationIconHtml = (options: LocationIconOptions = {}): string => {
  const { label, type, color = '#3b82f6', customSize = 28 } = options; // Changed default to blue
  
  // Determine color based on location type, but default to blue
  let iconColor = color;
  if (type === 'Customer') {
    iconColor = '#3b82f6'; // Blue for customers
  } else if (type === 'Storage') {
    iconColor = '#3b82f6'; // Changed to blue for storage locations
  } else if (type === 'end') {
    iconColor = '#ef4444'; // Red for end locations
  } else if (type === 'depot') {
    iconColor = '#22c55e'; // Green for depot locations
  }
  
  return `
    <div class="flex items-center justify-center rounded-full bg-white p-1 shadow-md" style="width: ${customSize}px; height: ${customSize}px;">
      <div class="flex items-center justify-center rounded-full text-white text-xs font-bold" 
           style="width: ${customSize - 6}px; height: ${customSize - 6}px; background-color: ${iconColor};">
        ${label !== undefined ? label : ''}
      </div>
    </div>
  `;
};

// Create a depot icon with proper typing
export const createDepotIcon = (options: DepotIconOptions = {}): L.DivIcon => {
  const html = createDepotIconHtml(options);
  const { customSize = 34 } = options;
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: html,
    iconSize: [customSize, customSize],
    iconAnchor: [customSize/2, customSize/2]
  });
};

// Create a location icon with proper typing
export const createLocationIcon = (options: LocationIconOptions = {}): L.DivIcon => {
  const html = createLocationIconHtml(options);
  const { customSize = 28 } = options;
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: html,
    iconSize: [customSize, customSize],
    iconAnchor: [customSize/2, customSize/2]
  });
};

// Export specific Leaflet icons for direct use
export const startIcon = createDepotIcon({ isStart: true });
export const endIcon = createDepotIcon({ isEnd: true });
export const locationIcon = createLocationIcon({});

// Export the markerIcons object that LocationMarker.tsx is trying to import
export const markerIcons = {
  default: createLocationIcon({}),
  customer: createLocationIcon({ type: 'Customer' }),
  storage: createLocationIcon({ type: 'Storage' }),
  start: createDepotIcon({ isStart: true }),
  end: createDepotIcon({ isEnd: true })
};

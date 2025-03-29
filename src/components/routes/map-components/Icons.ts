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
  
  const bgColor = isStart ? '#22c55e' : isEnd ? '#ef4444' : '#6366F1';
  
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
  const { label, type, color = '#6366F1', customSize = 28 } = options;
  
  // Determine color based on location type
  let iconColor = color;
  if (type === 'Customer') {
    iconColor = '#3b82f6'; // Blue for customers
  } else if (type === 'Storage') {
    iconColor = '#f59e0b'; // Amber for storage locations
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

// Create a depot icon
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

// Create a location icon
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

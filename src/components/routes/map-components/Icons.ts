
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

// Create depot marker icon
export const createDepotIcon = (options: DepotIconOptions = {}): string => {
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

// Create location marker icon
export const createLocationIcon = (options: LocationIconOptions = {}): string => {
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

// Create a Leaflet icon from HTML
export const createIcon = (html: string, size: [number, number] = [28, 28]): string => {
  return html;
};

// Export specific Leaflet icons for direct use
export const startIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: createDepotIcon({ isStart: true }),
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

export const endIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: createDepotIcon({ isEnd: true }),
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

export const locationIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: createLocationIcon({}),
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

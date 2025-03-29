
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
export const createDepotIcon = (options: DepotIconOptions) => {
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
export const createLocationIcon = (options: LocationIconOptions) => {
  const { label, type, color = '#6366F1', customSize = 28 } = options;
  
  // Determine color based on location type
  let iconColor = color;
  if (type === 'Customer') {
    iconColor = '#3b82f6'; // Blue for customers
  } else if (type === 'Storage') {
    iconColor = '#f59e0b'; // Amber for storage locations
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

export const createIcon = (html: string, size: [number, number] = [28, 28]) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: html,
    iconSize: size,
    iconAnchor: [size[0]/2, size[1]/2]
  });
};

// Export specific icons
export const startIcon = createIcon(createDepotIcon({ isStart: true }), [34, 34]);
export const endIcon = createIcon(createDepotIcon({ isEnd: true }), [34, 34]);
export const locationIcon = createIcon(createLocationIcon(), [28, 28]);

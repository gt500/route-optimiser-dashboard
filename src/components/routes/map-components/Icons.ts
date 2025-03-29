
import L from 'leaflet';

// Create depot marker icon
export const createDepotIcon = (options: { 
  label?: string; 
  isStart?: boolean; 
  isEnd?: boolean;
  customSize?: number;
}) => {
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
export const createLocationIcon = (options: { 
  label?: string | number; 
  color?: string;
  customSize?: number;
}) => {
  const { label, color = '#6366F1', customSize = 28 } = options;
  
  return `
    <div class="flex items-center justify-center rounded-full bg-white p-1 shadow-md" style="width: ${customSize}px; height: ${customSize}px;">
      <div class="flex items-center justify-center rounded-full text-white text-xs font-bold" 
           style="width: ${customSize - 6}px; height: ${customSize - 6}px; background-color: ${color};">
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

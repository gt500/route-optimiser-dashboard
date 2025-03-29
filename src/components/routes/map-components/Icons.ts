
import L from 'leaflet';

// Custom icons
export const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3774/3774278.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

export const homeIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/25/25694.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

export const locationIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1483/1483336.png',
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25],
});

// Customer location icon
export const CustomerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/484/484167.png',
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25],
});

// Warehouse/depot icon
export const WarehouseIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1479/1479733.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

// Function to create a custom location icon with a text label
interface CreateLocationIconOptions {
  text: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  size?: number;
}

export const createLocationIcon = (options: CreateLocationIconOptions): L.DivIcon => {
  const { 
    text, 
    backgroundColor = '#6366F1', 
    textColor = 'white', 
    borderColor = '#4F46E5',
    size = 26
  } = options;
  
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size/2, size],
    html: `
      <div style="
        background-color: ${backgroundColor}; 
        color: ${textColor}; 
        border: 2px solid ${borderColor};
        width: ${size}px; 
        height: ${size}px; 
        display: flex; 
        justify-content: center; 
        align-items: center; 
        border-radius: 50%; 
        font-weight: bold;
        font-size: ${size * 0.6}px;
      ">
        ${text}
      </div>
    `
  });
};

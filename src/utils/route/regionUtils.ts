
// Default coordinates for different regions
export const REGION_COORDINATES: Record<string, { center: [number, number], zoom: number }> = {
  // United States
  "Texas": { center: [31.9686, -99.9018], zoom: 6 },
  "California": { center: [36.7783, -119.4179], zoom: 6 },
  "Florida": { center: [27.6648, -81.5158], zoom: 6 },
  // South Africa
  "Western Cape": { center: [-33.9249, 18.4241], zoom: 9 },
  "Gauteng": { center: [-26.2041, 28.0473], zoom: 9 },
  "KwaZulu-Natal": { center: [-29.0852, 31.0566], zoom: 8 }
};

export const getRegionCoordinates = (country?: string, region?: string): { center: [number, number], zoom: number } => {
  if (region && REGION_COORDINATES[region]) {
    return REGION_COORDINATES[region];
  }
  
  // Default coordinates based on country
  switch (country) {
    case "United States":
      return { center: [39.8283, -98.5795], zoom: 4 };
    case "South Africa":
      return { center: [-30.5595, 22.9375], zoom: 6 };
    default:
      // Default to South Africa - Western Cape
      return { center: [-33.9249, 18.4241], zoom: 9 };
  }
};

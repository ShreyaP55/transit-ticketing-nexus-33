
interface DistanceResult {
  distance: number; // in kilometers
  duration: number; // in minutes
  status: 'OK' | 'ZERO_RESULTS' | 'MAX_ROUTE_LENGTH_EXCEEDED' | 'INVALID_REQUEST' | 'OVER_DAILY_LIMIT' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'UNKNOWN_ERROR';
  realWorldDistance: boolean;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Haversine formula fallback
const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const calculateRealDistance = async (
  startLat: number, 
  startLng: number, 
  endLat: number, 
  endLng: number
): Promise<DistanceResult> => {
  // Try Google Maps Distance Matrix API first
  if (GOOGLE_MAPS_API_KEY) {
    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${startLat},${startLng}&destinations=${endLat},${endLng}&units=metric&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
          const element = data.rows[0].elements[0];
          return {
            distance: element.distance.value / 1000, // Convert meters to km
            duration: element.duration.value / 60, // Convert seconds to minutes
            status: 'OK',
            realWorldDistance: true
          };
        }
      }
    } catch (error) {
      console.warn('Google Maps API failed, falling back to Haversine:', error);
    }
  }

  // Fallback to Haversine formula
  const distance = calculateHaversineDistance(startLat, startLng, endLat, endLng);
  const estimatedDuration = (distance / 40) * 60; // Assume 40 km/h average speed
  
  return {
    distance: Math.round(distance * 100) / 100,
    duration: Math.round(estimatedDuration),
    status: 'OK',
    realWorldDistance: false
  };
};

export const calculateFareWithConcession = (
  distance: number, 
  concessionType: string = 'general'
): { originalFare: number; discountAmount: number; finalFare: number; discountPercentage: number } => {
  const baseFare = 20;
  const perKmCharge = 8;
  const originalFare = baseFare + (distance * perKmCharge);
  
  // Concession discounts
  const discounts: Record<string, number> = {
    general: 0,
    student: 30,
    child: 50,
    women: 20,
    elderly: 40,
    disabled: 50
  };
  
  const discountPercentage = discounts[concessionType] || 0;
  const discountAmount = (originalFare * discountPercentage) / 100;
  const finalFare = Math.round(originalFare - discountAmount);
  
  return {
    originalFare: Math.round(originalFare),
    discountAmount: Math.round(discountAmount),
    finalFare,
    discountPercentage
  };
};

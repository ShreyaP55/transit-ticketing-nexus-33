
interface DistanceResult {
  distance: number; // in kilometers
  duration: number; // in minutes
  status: 'OK' | 'ZERO_RESULTS' | 'MAX_ROUTE_LENGTH_EXCEEDED' | 'INVALID_REQUEST' | 'OVER_DAILY_LIMIT' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'UNKNOWN_ERROR';
  realWorldDistance: boolean;
}

// DistanceMatrix.ai API configuration
const DISTANCE_MATRIX_API_KEY = 'gTjz3x0YNfNW9hnEqh2Km4YjtMKPJuxkUTehdpvOYYUuwTqx0z0CQetvQgwhXymS';
const DISTANCE_MATRIX_BASE_URL = 'https://api.distancematrix.ai/maps/api/distancematrix/json';

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
  // Try DistanceMatrix.ai API first
  try {
    console.log('🚀 Using DistanceMatrix.ai API for accurate distance calculation');
    const url = `${DISTANCE_MATRIX_BASE_URL}?origins=${startLat},${startLng}&destinations=${endLat},${endLng}&key=${DISTANCE_MATRIX_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ DistanceMatrix.ai API response:', data);
      
      if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]?.status === 'OK') {
        const element = data.rows[0].elements[0];
        const distanceInKm = element.distance.value / 1000; // Convert meters to km
        const durationInMinutes = element.duration.value / 60; // Convert seconds to minutes
        
        console.log(`📏 Real distance: ${distanceInKm.toFixed(2)}km, Duration: ${durationInMinutes.toFixed(0)}min`);
        
        return {
          distance: Math.round(distanceInKm * 100) / 100, // Round to 2 decimal places
          duration: Math.round(durationInMinutes),
          status: 'OK',
          realWorldDistance: true
        };
      } else {
        console.warn('⚠️ DistanceMatrix.ai API returned non-OK status:', data.status);
      }
    } else {
      console.warn('⚠️ DistanceMatrix.ai API request failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.warn('⚠️ DistanceMatrix.ai API failed, falling back to Haversine:', error);
  }

  // Fallback to Haversine formula
  console.log('🔄 Using Haversine formula as fallback');
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


export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export class LocationService {
  private static instance: LocationService;
  private watchId: number | null = null;
  private callbacks: ((location: LocationData) => void)[] = [];

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  getCurrentPosition(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          resolve(locationData);
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  startWatching(callback: (location: LocationData) => void): void {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }

    this.callbacks.push(callback);

    if (!this.watchId) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          
          this.callbacks.forEach(cb => cb(locationData));
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 30000,
        }
      );
    }
  }

  stopWatching(callback?: (location: LocationData) => void): void {
    if (callback) {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    } else {
      this.callbacks = [];
    }

    if (this.callbacks.length === 0 && this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  async sendLocationToServer(location: LocationData): Promise<void> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userId') || 'guest'}`,
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: location.timestamp,
          accuracy: location.accuracy,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send location to server');
      }
    } catch (error) {
      console.error('Error sending location to server:', error);
    }
  }
}

export const locationService = LocationService.getInstance();

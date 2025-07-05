
import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { BusLocations } from '@/types/tracking';

interface UseSocketTrackingReturn {
  busLocations: BusLocations;
  isConnected: boolean;
  error: string | null;
}

export const useSocketTracking = (): UseSocketTrackingReturn => {
  const [busLocations, setBusLocations] = useState<BusLocations>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Try multiple socket URLs with fallback
    const socketUrls = [
      import.meta.env.VITE_SOCKET_URL,
      import.meta.env.VITE_API_URL?.replace('/api', ''),
      'https://businn.onrender.com',
      'http://localhost:3001'
    ].filter(Boolean);
    
    const socketUrl = socketUrls[0] || 'http://localhost:3001';
    
    console.log('🔌 Attempting socket connection to:', socketUrl);
    
    try {
      socketRef.current = io(socketUrl, {
        transports: ['polling', 'websocket'], // Try polling first
        timeout: 10000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
        upgrade: true,
        rememberUpgrade: false
      });

      const socket = socketRef.current;

      // Connection event handlers
      socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id);
        setIsConnected(true);
        setError(null);
      });

      socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        setIsConnected(false);
      });

      socket.on('connect_error', (err) => {
        console.log('🚫 Socket connection failed, server may be offline:', err.message);
        setError('Bus tracking server is offline');
        setIsConnected(false);
      });

      socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
        setIsConnected(true);
        setError(null);
      });

      // Bus location updates
      socket.on('busLocationUpdate', (data: { busId: string; location: any }) => {
        console.log('📍 Bus location update:', data);
        setBusLocations(prev => ({
          ...prev,
          [data.busId]: {
            ...data.location,
            latitude: data.location.latitude || data.location.lat,
            longitude: data.location.longitude || data.location.lng,
            lat: data.location.latitude || data.location.lat,
            lng: data.location.longitude || data.location.lng,
            updatedAt: new Date().toISOString()
          }
        }));
      });

      socket.on('bulkLocationUpdate', (locations: BusLocations) => {
        console.log('📍📍 Bulk location update:', locations);
        setBusLocations(locations);
      });

      // Request initial data after connection
      socket.on('connect', () => {
        console.log('📤 Requesting initial bus locations...');
        socket.emit('requestBusLocations');
      });

    } catch (err) {
      console.error('Failed to initialize socket:', err);
      setError('Failed to connect to tracking service');
    }

    return () => {
      console.log('🧹 Cleaning up socket connection');
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    busLocations,
    isConnected,
    error
  };
};

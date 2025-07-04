
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
    // Initialize socket connection
    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://businn.onrender.com';
    
    console.log('Connecting to socket server:', socketUrl);
    
    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError(`Connection failed: ${err.message}`);
      setIsConnected(false);
    });

    // Bus location updates
    socket.on('busLocationUpdate', (data: { busId: string; location: any }) => {
      console.log('Bus location update received:', data);
      setBusLocations(prev => ({
        ...prev,
        [data.busId]: {
          ...data.location,
          updatedAt: new Date().toISOString()
        }
      }));
    });

    // Bulk location updates
    socket.on('bulkLocationUpdate', (locations: BusLocations) => {
      console.log('Bulk location update received:', locations);
      setBusLocations(locations);
    });

    // Request initial bus locations
    socket.emit('requestBusLocations');

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up socket connection');
      socket.disconnect();
    };
  }, []);

  return {
    busLocations,
    isConnected,
    error
  };
};

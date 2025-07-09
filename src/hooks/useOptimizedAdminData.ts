
import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/services/api/admin';

interface AdminData {
  stats: any;
  activeUsers: any[];
  completedRides: any;
  passVerification: any;
}

export const useOptimizedAdminData = () => {
  const [data, setData] = useState<AdminData>({
    stats: null,
    activeUsers: [],
    completedRides: null,
    passVerification: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const CACHE_DURATION = 30000; // 30 seconds cache
  const POLLING_INTERVAL = 60000; // Poll every minute instead of every 2 seconds

  const fetchAdminData = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Use cache if data is fresh and not forcing refresh
    if (!forceRefresh && now - lastFetch < CACHE_DURATION && data.stats) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [stats, activeUsers, completedRides, passVerification] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getActiveUsers(),
        adminAPI.getCompletedRides({ page: 1, limit: 10 }),
        adminAPI.getPassVerification()
      ]);

      setData({
        stats,
        activeUsers,
        completedRides,
        passVerification
      });
      
      setLastFetch(now);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch admin data');
    } finally {
      setIsLoading(false);
    }
  }, [data.stats, lastFetch]);

  // Initial fetch
  useEffect(() => {
    fetchAdminData(true);
  }, []);

  // Set up polling with longer interval
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAdminData(false);
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchAdminData]);

  const refresh = useCallback(() => {
    fetchAdminData(true);
  }, [fetchAdminData]);

  return {
    data,
    isLoading,
    error,
    refresh,
    lastFetch: new Date(lastFetch)
  };
};

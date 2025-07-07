
import { fetchAPI } from "./base";

// Admin API
export const adminAPI = {
  checkAdminStatus: (): Promise<{ isAdmin: boolean }> => fetchAPI("/admin/check-status"),
  
  getSystemStats: (): Promise<{ 
    userCount: number, 
    activePassCount: number, 
    routeCount: number,
    totalRevenue: number 
  }> => fetchAPI("/admin/stats"),

  // New comprehensive admin endpoints
  getDashboardStats: (): Promise<{
    totalUsers: number;
    activeTrips: number;
    completedRides: number;
    totalPasses: number;
    pendingVerifications: number;
    todayRevenue: number;
  }> => fetchAPI("/admin/dashboard/stats"),

  getActiveUsers: (): Promise<Array<{
    _id: string;
    userId: string;
    startLocation: string;
    createdAt: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      concessionType: string;
    };
  }>> => fetchAPI("/admin/users/active"),

  getCompletedRides: (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    rides: Array<{
      _id: string;
      userId: string;
      startLocation: string;
      endLocation: string;
      fare: number;
      createdAt: string;
      updatedAt: string;
      user: {
        firstName: string;
        lastName: string;
        email: string;
        concessionType: string;
      };
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const queryString = queryParams.toString();
    return fetchAPI(`/admin/rides/completed${queryString ? `?${queryString}` : ''}`);
  },

  getPassVerification: (): Promise<{
    verificationStats: Array<{
      _id: string;
      count: number;
      concessionTypes: string[];
    }>;
    recentVerifications: Array<{
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      concessionType: string;
      verificationStatus: string;
      verificationDate: string;
    }>;
    passUsageStats: Array<{
      passId: string;
      usageCount: number;
      lastUsed: string;
      pass: {
        routeId: string;
        userId: string;
        active: boolean;
      };
    }>;
  }> => fetchAPI("/admin/passes/verification"),
};


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface NotificationResult {
  message: string;
  count: number;
  totalExpiring?: number;
}

// Helper function for API calls
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  return response.json();
}

export const notificationService = {
  // Manually trigger pass expiry check
  checkExpiringPasses: async (): Promise<NotificationResult> => {
    return fetchAPI('/notifications/check-expiring');
  },
};

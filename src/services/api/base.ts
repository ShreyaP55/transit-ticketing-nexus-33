
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Get auth token for API calls
export const getAuthToken = () => {
  // Try to get Clerk user token first, then fallback to localStorage
  if (typeof window !== 'undefined') {
    try {
      // Check if we're in a Clerk context
      const clerkToken = localStorage.getItem('__clerk_db_jwt');
      if (clerkToken) {
        return clerkToken;
      }
    } catch (error) {
      console.log('No Clerk token found, using fallback');
    }
  }
  
  return localStorage.getItem("userId") || localStorage.getItem("authToken");
};

// Helper function for API calls with better error handling and rate limiting
export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const authToken = getAuthToken();
  
  const headers = {
    "Content-Type": "application/json",
    ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {}),
    ...(options.headers || {})
  };

  try {
    console.log(`Making API call to: ${API_URL}${endpoint}`);
    
    // Add a small delay to prevent rate limiting
    if (endpoint.includes('/trips/active/')) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error response: ${errorText}`);
      
      if (response.status === 404) {
        throw new Error(`Resource not found: ${endpoint}`);
      }
      
      if (response.status === 429) {
        console.warn('Rate limit exceeded, retrying after delay...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        throw new Error('Too many requests, please try again later');
      }
      
      let error;
      try {
        error = JSON.parse(errorText);
      } catch (e) {
        error = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error - server may not be running');
      throw new Error("Server is not running. Please start the backend server on port 3001.");
    }
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

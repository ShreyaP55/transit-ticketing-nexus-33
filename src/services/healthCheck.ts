
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const healthCheck = {
  checkBackendConnection: async (): Promise<{ status: string; message: string }> => {
    try {
      const response = await fetch(`${API_URL.replace('/api', '')}/`);
      if (response.ok) {
        return { status: 'connected', message: 'Backend server is running' };
      } else {
        return { status: 'error', message: `Backend responded with status ${response.status}` };
      }
    } catch (error) {
      return { 
        status: 'error', 
        message: 'Cannot connect to backend server. Please ensure the server is running on http://localhost:3000' 
      };
    }
  }
};

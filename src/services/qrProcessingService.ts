
export const extractUserIdFromQR = (qrData: string): string | null => {
  try {
    // Try to extract user ID from QR code data
    const parsedData = JSON.parse(qrData);
    
    if (parsedData.type === 'user' && parsedData.userId) {
      return parsedData.userId;
    }
    
    if (parsedData.type === 'pass' && parsedData.userId) {
      return parsedData.userId;
    }
    
    // If it's a simple user ID string
    if (typeof qrData === 'string' && qrData.startsWith('user_')) {
      return qrData.replace('user_', '');
    }
    
    return qrData;
  } catch (error) {
    // If JSON parsing fails, treat as simple user ID
    return qrData;
  }
};

export const extractPassDataFromQR = (qrData: string): any | null => {
  try {
    const parsedData = JSON.parse(qrData);
    
    if (parsedData.type === 'pass') {
      return parsedData;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

export const validateQRCode = (qrData: string): { isValid: boolean; error?: string } => {
  try {
    const parsedData = JSON.parse(qrData);
    
    if (parsedData.type === 'user') {
      if (!parsedData.userId) {
        return { isValid: false, error: 'Invalid user QR code: missing user ID' };
      }
      return { isValid: true };
    }
    
    if (parsedData.type === 'pass') {
      if (!parsedData.passId || !parsedData.userId || !parsedData.expiryDate) {
        return { isValid: false, error: 'Invalid pass QR code: missing required fields' };
      }
      
      // Check if pass is expired
      const expiryDate = new Date(parsedData.expiryDate);
      if (expiryDate < new Date()) {
        return { isValid: false, error: 'Pass has expired' };
      }
      
      return { isValid: true };
    }
    
    return { isValid: false, error: 'Unknown QR code type' };
  } catch (error) {
    // If not JSON, assume it's a simple user ID
    if (typeof qrData === 'string' && qrData.length > 0) {
      return { isValid: true };
    }
    return { isValid: false, error: 'Invalid QR code format' };
  }
};

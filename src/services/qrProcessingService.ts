
export const extractUserIdFromQR = (qrData: string): string | null => {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(qrData);
    if (parsed.userId) {
      return parsed.userId;
    }
  } catch (e) {
    // If not JSON, treat as plain string
    console.log("QR data is not JSON, treating as plain string");
  }
  
  // If it's just a string that looks like a user ID, return it
  if (typeof qrData === 'string' && qrData.trim().length > 0) {
    return qrData.trim();
  }
  
  return null;
};

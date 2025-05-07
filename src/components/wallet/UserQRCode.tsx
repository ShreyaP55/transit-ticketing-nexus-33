
import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { QrCode } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface UserQRCodeProps {
  size?: number;
  showLabel?: boolean;
}

const UserQRCode: React.FC<UserQRCodeProps> = ({ 
  size = 200, 
  showLabel = true 
}) => {
  const { userId, userDetails } = useUser();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) return;
    
    const generateQR = async () => {
      try {
        setIsLoading(true);
        
        // Use Google Charts API to generate QR code
        // The QR code will contain a URL to our app with the userId as parameter
        const qrData = `${window.location.origin}/qr-scan/${userId}`;
        const encodedData = encodeURIComponent(qrData);
        const url = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodedData}&chco=F97316`;
        
        setQrCodeUrl(url);
      } catch (error) {
        console.error("Error generating QR code:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    generateQR();
  }, [userId, size]);
  
  if (!userId) {
    return (
      <Card className="w-full bg-gradient-to-br from-white to-blue-50 shadow-md">
        <CardContent className="p-4 text-center">
          <p className="text-muted-foreground">Please login to view your QR code</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full bg-white border-transit-orange shadow-md">
      <CardContent className="p-4 flex flex-col items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <QrCode className="h-12 w-12 text-muted-foreground animate-pulse" />
            <p className="mt-2 text-sm text-muted-foreground">Generating QR code...</p>
          </div>
        ) : (
          <>
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <img 
                src={qrCodeUrl} 
                alt="User QR Code" 
                className="w-full h-auto rounded"
              />
            </div>
            
            {showLabel && (
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">Scan to check-in/out</p>
                <p className="text-xs text-muted-foreground mt-1">ID: {userId.substring(0, 8)}...</p>
                {userDetails?.firstName && (
                  <p className="text-sm font-medium text-transit-orange mt-1">
                    {userDetails.firstName} {userDetails.lastName}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UserQRCode;

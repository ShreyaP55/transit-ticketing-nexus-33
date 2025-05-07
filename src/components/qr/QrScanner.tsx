
import React, { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerProps {
  onScan: (data: string | null) => void;
  onError: (error: any) => void;
}

export const QrScanner: React.FC<QrScannerProps> = ({ onScan, onError }) => {
  const [isScanning, setIsScanning] = useState(false);
  
  useEffect(() => {
    const qrId = 'qr-reader';
    const html5QrCode = new Html5Qrcode(qrId);
    let cameraId = '';
    
    // Get available cameras
    Html5Qrcode.getCameras()
      .then(devices => {
        if (devices && devices.length) {
          cameraId = devices[0].id;
          startScanner(html5QrCode, cameraId);
        } else {
          onError("No camera found");
        }
      })
      .catch(err => {
        onError(`Error getting cameras: ${err}`);
      });
      
    function startScanner(scanner: Html5Qrcode, deviceId: string) {
      const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1
      };

      setIsScanning(true);
      scanner.start(
        deviceId, 
        config,
        (decodedText) => {
          onScan(decodedText);
          scanner.stop().catch(err => console.error("Failed to stop scanner:", err));
          setIsScanning(false);
        },
        (errorMessage) => {
          // QR code not found is expected, so don't call onError
          if (!errorMessage.includes('QR code not found')) {
            onError(errorMessage);
          }
        }
      )
      .catch(err => {
        onError(`Scanner start error: ${err}`);
      });
    }
    
    return () => {
      if (isScanning) {
        html5QrCode.stop().catch(err => console.error("Failed to stop scanner on unmount:", err));
      }
    };
  }, [onScan, onError]);

  return (
    <div className="flex flex-col items-center w-full">
      <div id="qr-reader" className="w-full h-64 overflow-hidden rounded-lg border border-muted"></div>
    </div>
  );
};

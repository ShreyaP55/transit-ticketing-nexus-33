
import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';

interface QrScannerProps {
  onScan: (data: string | null) => void;
  onError: (error: any) => void;
  width?: string;
  height?: string;
}

export const QrScanner: React.FC<QrScannerProps> = ({ 
  onScan, 
  onError,
  width = '100%',
  height = '300px'
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader';
  
  const safeStopScanner = async () => {
    try {
      if (scannerRef.current && isScanning) {
        await scannerRef.current.stop();
        setIsScanning(false);
      }
    } catch (err) {
      console.log("Scanner already stopped or not running", err);
    }
  };
  
  useEffect(() => {
    const initializeScanner = async () => {
      try {
        // Clean up any existing scanner
        if (scannerRef.current) {
          await safeStopScanner();
        }

        // Create new scanner
        const html5QrCode = new Html5Qrcode(scannerContainerId);
        scannerRef.current = html5QrCode;
        
        // Get available cameras
        const devices = await Html5Qrcode.getCameras();
        
        if (devices && devices.length) {
          const cameraId = devices[0].id;
          startScanner(html5QrCode, cameraId);
        } else {
          toast.error("No camera found");
          onError("No camera found");
        }
      } catch (err) {
        console.error("Error initializing scanner:", err);
        toast.error("Failed to access camera");
        onError(`Error getting cameras: ${err}`);
      }
    };

    // Function to start scanner with a specific camera
    const startScanner = (scanner: Html5Qrcode, deviceId: string) => {
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
          safeStopScanner();
        },
        (errorMessage) => {
          // QR code not found is expected, so don't call onError
          if (!errorMessage.includes('QR code not found')) {
            console.error("QR Scanner error:", errorMessage);
          }
        }
      )
      .catch(err => {
        console.error("Scanner start error:", err);
        onError(`Scanner start error: ${err}`);
        setIsScanning(false);
      });
    };

    // Initialize the scanner when component mounts
    const scannerDiv = document.getElementById(scannerContainerId);
    if (scannerDiv) {
      initializeScanner();
    }
    
    // Cleanup function
    return () => {
      safeStopScanner();
    };
  }, [onScan, onError]);

  return (
    <div className="flex flex-col items-center w-full">
      <div 
        id={scannerContainerId} 
        style={{ width, height }} 
        className="overflow-hidden rounded-lg border border-muted"
      ></div>
      <p className="text-sm text-muted-foreground mt-2">
        {isScanning ? "Scanning for QR code..." : "Scanner initializing..."}
      </p>
    </div>
  );
};

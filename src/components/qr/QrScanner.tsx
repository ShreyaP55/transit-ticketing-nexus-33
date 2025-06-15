
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader';
  const initTimeoutRef = useRef<NodeJS.Timeout>();
  
  const safeStopScanner = async () => {
    try {
      if (scannerRef.current && isScanning) {
        await scannerRef.current.stop();
        console.log("Scanner stopped successfully");
      }
    } catch (err) {
      console.log("Scanner already stopped:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const clearScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (err) {
        console.log("Scanner clear error:", err);
      }
      scannerRef.current = null;
    }
  };
  
  useEffect(() => {
    const initializeScanner = async () => {
      try {
        setError(null);
        console.log("Initializing QR scanner...");
        
        // Wait for DOM element to be ready
        const scannerElement = document.getElementById(scannerContainerId);
        if (!scannerElement) {
          console.log("Scanner element not found, retrying...");
          initTimeoutRef.current = setTimeout(initializeScanner, 100);
          return;
        }

        // Clean up any existing scanner
        await safeStopScanner();
        clearScanner();

        // Create new scanner instance
        const html5QrCode = new Html5Qrcode(scannerContainerId);
        scannerRef.current = html5QrCode;
        
        console.log("Getting camera devices...");
        const devices = await Html5Qrcode.getCameras();
        console.log("Available cameras:", devices.length);
        
        if (devices && devices.length > 0) {
          // Prefer back camera for mobile devices
          const backCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear')
          );
          const cameraId = backCamera ? backCamera.id : devices[0].id;
          
          console.log("Starting scanner with camera:", cameraId);
          await startScanner(html5QrCode, cameraId);
          setIsInitialized(true);
        } else {
          throw new Error("No cameras found on this device");
        }
      } catch (err) {
        console.error("Error initializing scanner:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to initialize camera";
        setError(errorMessage);
        toast.error(`Camera Error: ${errorMessage}`);
        onError(errorMessage);
      }
    };

    const startScanner = async (scanner: Html5Qrcode, deviceId: string) => {
      try {
        const config = { 
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
        };

        setIsScanning(true);
        
        await scanner.start(
          deviceId, 
          config,
          (decodedText) => {
            console.log("QR Code scanned:", decodedText);
            onScan(decodedText);
            toast.success("QR Code scanned successfully!");
          },
          (errorMessage) => {
            // Only log actual errors, not "no QR code found" messages
            if (!errorMessage.includes('QR code not found') && 
                !errorMessage.includes('No MultiFormat Readers')) {
              console.warn("QR Scanner warning:", errorMessage);
            }
          }
        );
        
        console.log("QR Scanner started successfully");
      } catch (err) {
        console.error("Scanner start error:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to start camera";
        setError(errorMessage);
        setIsScanning(false);
        throw err;
      }
    };

    // Initialize with a small delay to ensure DOM is ready
    initTimeoutRef.current = setTimeout(initializeScanner, 100);
    
    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      safeStopScanner().then(() => {
        clearScanner();
      });
    };
  }, [onScan, onError]);

  if (error) {
    return (
      <div className="flex flex-col items-center w-full">
        <div 
          className="w-full bg-red-50 border border-red-200 rounded-lg flex items-center justify-center p-8"
          style={{ width, height }}
        >
          <div className="text-center">
            <p className="text-red-600 font-medium">Camera Error</p>
            <p className="text-sm text-red-500 mt-1">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div 
        id={scannerContainerId} 
        style={{ width, height }} 
        className="overflow-hidden rounded-lg border border-muted bg-black"
      />
      <div className="mt-2 flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-500' : 'bg-gray-400'}`} />
        <p className="text-sm text-muted-foreground">
          {!isInitialized ? "Initializing camera..." : 
           isScanning ? "Scanning for QR code..." : "Camera not active"}
        </p>
      </div>
    </div>
  );
};

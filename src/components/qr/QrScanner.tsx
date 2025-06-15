
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
  const scannerContainerId = `qr-reader-${Math.random().toString(36).substr(2, 9)}`;
  const initTimeoutRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);
  
  const safeStopScanner = async () => {
    try {
      if (scannerRef.current && isScanning) {
        console.log("Stopping scanner...");
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        console.log("Scanner stopped and cleared successfully");
      }
    } catch (err) {
      console.log("Scanner stop/clear error (this is normal):", err);
    } finally {
      if (mountedRef.current) {
        setIsScanning(false);
      }
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
    mountedRef.current = true;
    
    const initializeScanner = async () => {
      if (!mountedRef.current) return;
      
      try {
        setError(null);
        console.log("Initializing QR scanner...");
        
        // Wait for DOM element to be ready
        const scannerElement = document.getElementById(scannerContainerId);
        if (!scannerElement) {
          console.log("Scanner element not found, retrying...");
          initTimeoutRef.current = setTimeout(initializeScanner, 200);
          return;
        }

        // Clean up any existing scanner first
        await safeStopScanner();
        clearScanner();

        // Small delay to ensure camera is released
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!mountedRef.current) return;

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
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
          );
          const cameraId = backCamera ? backCamera.id : devices[0].id;
          
          console.log("Starting scanner with camera:", cameraId);
          await startScanner(html5QrCode, cameraId);
          
          if (mountedRef.current) {
            setIsInitialized(true);
          }
        } else {
          throw new Error("No cameras found on this device");
        }
      } catch (err) {
        console.error("Error initializing scanner:", err);
        if (mountedRef.current) {
          const errorMessage = err instanceof Error ? err.message : "Failed to initialize camera";
          setError(errorMessage);
          toast.error(`Camera Error: ${errorMessage}`);
          onError(errorMessage);
        }
      }
    };

    const startScanner = async (scanner: Html5Qrcode, deviceId: string) => {
      try {
        if (!mountedRef.current) return;
        
        const config = { 
          fps: 5, // Reduced fps to avoid performance issues
          qrbox: { width: 200, height: 200 },
          aspectRatio: 1.0,
          disableFlip: false,
          videoConstraints: {
            facingMode: "environment" // Prefer back camera
          }
        };

        if (mountedRef.current) {
          setIsScanning(true);
        }
        
        await scanner.start(
          deviceId, 
          config,
          (decodedText) => {
            console.log("QR Code scanned:", decodedText);
            if (mountedRef.current) {
              onScan(decodedText);
              toast.success("QR Code scanned successfully!");
            }
          },
          (errorMessage) => {
            // Only log actual errors, not "no QR code found" messages
            if (!errorMessage.includes('QR code not found') && 
                !errorMessage.includes('No MultiFormat Readers') &&
                !errorMessage.includes('NotFoundException')) {
              console.warn("QR Scanner warning:", errorMessage);
            }
          }
        );
        
        console.log("QR Scanner started successfully");
      } catch (err) {
        console.error("Scanner start error:", err);
        if (mountedRef.current) {
          const errorMessage = err instanceof Error ? err.message : "Failed to start camera";
          setError(errorMessage);
          setIsScanning(false);
        }
        throw err;
      }
    };

    // Initialize with a delay to ensure DOM is ready
    initTimeoutRef.current = setTimeout(initializeScanner, 100);
    
    return () => {
      mountedRef.current = false;
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      
      // Cleanup scanner
      const cleanup = async () => {
        await safeStopScanner();
        clearScanner();
      };
      cleanup();
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
              Reload Page
            </button>
            <p className="text-xs text-gray-500 mt-2">
              If error persists, try closing other camera apps
            </p>
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
        <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
        <p className="text-sm text-muted-foreground">
          {!isInitialized ? "Initializing camera..." : 
           isScanning ? "Scanning for QR code..." : "Camera not active"}
        </p>
      </div>
      {isScanning && (
        <p className="text-xs text-green-600 mt-1">
          Point camera at QR code to scan
        </p>
      )}
    </div>
  );
};


import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';

interface UseCameraScannerProps {
  onScan: (data: string | null) => void;
  onError: (error: any) => void;
  containerId: string;
}

interface CameraDevice {
  id: string;
  label: string;
}

export const useCameraScanner = ({ onScan, onError, containerId }: UseCameraScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);
  
  const safeStopScanner = async () => {
    try {
      if (scannerRef.current && isScanning) {
        console.log("Stopping scanner...");
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        console.log("Scanner stopped successfully");
      }
    } catch (err) {
      console.log("Scanner stop error (expected):", err);
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

  const startScanner = async (scanner: Html5Qrcode, deviceId: string) => {
    try {
      if (!mountedRef.current) return;
      
      // Wait for container to be properly sized
      const container = document.getElementById(containerId);
      if (!container || container.offsetWidth === 0 || container.offsetHeight === 0) {
        console.log("Container not ready, retrying...");
        setTimeout(() => startScanner(scanner, deviceId), 200);
        return;
      }
      
      const config = { 
        fps: 5,
        qrbox: { width: 200, height: 200 },
        aspectRatio: 1.0,
        disableFlip: false,
        videoConstraints: {
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 480 }
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
            toast.success("QR Code scanned!");
          }
        },
        (errorMessage) => {
          // Filter out common non-critical errors
          if (!errorMessage.includes('QR code not found') && 
              !errorMessage.includes('No MultiFormat Readers') &&
              !errorMessage.includes('NotFoundException') &&
              !errorMessage.includes('IndexSizeError')) {
            console.warn("QR Scanner error:", errorMessage);
          }
        }
      );
      
      console.log("QR Scanner initialized successfully");
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

  const getCameras = async (): Promise<CameraDevice[]> => {
    try {
      const devices = await Html5Qrcode.getCameras();
      console.log("Available cameras:", devices);
      
      const cameras = devices.map(device => ({
        id: device.id,
        label: device.label
      }));
      
      // Sort cameras to prioritize back camera first
      cameras.sort((a, b) => {
        const aIsBack = a.label.toLowerCase().includes('back') || 
                       a.label.toLowerCase().includes('rear') || 
                       a.label.toLowerCase().includes('environment');
        const bIsBack = b.label.toLowerCase().includes('back') || 
                       b.label.toLowerCase().includes('rear') || 
                       b.label.toLowerCase().includes('environment');
        
        if (aIsBack && !bIsBack) return -1;
        if (!aIsBack && bIsBack) return 1;
        return 0;
      });
      
      return cameras;
    } catch (err) {
      console.error("Error getting cameras:", err);
      return [];
    }
  };

  const initializeScanner = async (cameraIndex: number = currentCameraIndex) => {
    if (!mountedRef.current) return;
    
    try {
      setError(null);
      console.log("Initializing QR scanner...");
      
      // Wait for DOM element
      let attempts = 0;
      while (attempts < 10) {
        const scannerElement = document.getElementById(containerId);
        if (scannerElement && scannerElement.offsetWidth > 0) {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      const scannerElement = document.getElementById(containerId);
      if (!scannerElement) {
        throw new Error("Scanner container not found");
      }

      await safeStopScanner();
      clearScanner();
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!mountedRef.current) return;

      const html5QrCode = new Html5Qrcode(containerId);
      scannerRef.current = html5QrCode;
      
      console.log("Getting camera devices...");
      const cameras = await getCameras();
      
      if (cameras && cameras.length > 0) {
        setAvailableCameras(cameras);
        const cameraId = cameras[cameraIndex]?.id || cameras[0].id;
        
        console.log("Starting scanner with camera:", cameras[cameraIndex]?.label || cameras[0].label);
        await startScanner(html5QrCode, cameraId);
        
        if (mountedRef.current) {
          setIsInitialized(true);
          setCurrentCameraIndex(cameraIndex);
        }
      } else {
        throw new Error("No cameras found");
      }
    } catch (err) {
      console.error("Scanner initialization error:", err);
      if (mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : "Failed to initialize camera";
        setError(errorMessage);
        toast.error(`Camera Error: ${errorMessage}`);
        onError(errorMessage);
      }
    }
  };

  const flipCamera = async () => {
    if (availableCameras.length <= 1 || isSwitchingCamera) return;
    
    setIsSwitchingCamera(true);
    try {
      const nextIndex = (currentCameraIndex + 1) % availableCameras.length;
      console.log("Switching to camera:", availableCameras[nextIndex]?.label);
      
      await initializeScanner(nextIndex);
      
      const cameraType = availableCameras[nextIndex]?.label.toLowerCase().includes('front') || 
                        availableCameras[nextIndex]?.label.toLowerCase().includes('user') 
                        ? 'Front' : 'Back';
      toast.success(`Switched to ${cameraType} camera`);
    } catch (err) {
      console.error("Error flipping camera:", err);
      toast.error("Failed to switch camera");
    } finally {
      setIsSwitchingCamera(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    initTimeoutRef.current = setTimeout(() => initializeScanner(), 100);
    
    return () => {
      mountedRef.current = false;
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      
      const cleanup = async () => {
        await safeStopScanner();
        clearScanner();
      };
      cleanup();
    };
  }, [onScan, onError]);

  return {
    isScanning,
    isInitialized,
    error,
    availableCameras,
    currentCameraIndex,
    isSwitchingCamera,
    flipCamera,
    initializeScanner
  };
};

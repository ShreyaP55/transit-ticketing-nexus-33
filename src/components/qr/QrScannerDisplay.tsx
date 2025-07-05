
import React from 'react';
import { SwitchCamera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraDevice {
  id: string;
  label: string;
}

interface QrScannerDisplayProps {
  containerId: string;
  width: string;
  height: string;
  error: string | null;
  isScanning: boolean;
  isInitialized: boolean;
  availableCameras: CameraDevice[];
  isSwitchingCamera: boolean;
  onFlipCamera: () => void;
}

export const QrScannerDisplay: React.FC<QrScannerDisplayProps> = ({
  containerId,
  width,
  height,
  error,
  isScanning,
  isInitialized,
  availableCameras,
  isSwitchingCamera,
  onFlipCamera
}) => {
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
      <div className="relative">
        <div 
          id={containerId} 
          style={{ width, height }} 
          className="overflow-hidden rounded-lg border border-muted bg-black"
        />
        
        {/* Camera Flip Button */}
        {availableCameras.length > 1 && isInitialized && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white shadow-md"
            onClick={onFlipCamera}
            disabled={isSwitchingCamera}
          >
            <SwitchCamera 
              className={`h-4 w-4 ${isSwitchingCamera ? 'animate-spin' : ''}`} 
            />
          </Button>
        )}
        
        {/* Camera switching indicator */}
        {isSwitchingCamera && (
          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center z-5">
            <div className="bg-white/90 px-3 py-2 rounded-md flex items-center gap-2">
              <SwitchCamera className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Switching camera...</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-2 flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
        <p className="text-sm text-muted-foreground">
          {!isInitialized ? "Initializing camera..." : 
           isScanning ? "Scanning for QR code..." : "Camera not active"}
        </p>
      </div>
      
      {isScanning && (
        <div className="text-center mt-1">
          <p className="text-xs text-green-600">
            Point camera at QR code to scan
          </p>
          {availableCameras.length > 1 && (
            <p className="text-xs text-muted-foreground mt-1">
              Tap the flip button to switch cameras
            </p>
          )}
        </div>
      )}
    </div>
  );
};

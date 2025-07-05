
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
              Try enabling camera permissions and reloading
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full space-y-4">
      <div className="relative flex items-center gap-3 w-full max-w-sm">
        {/* Camera Container */}
        <div className="relative flex-1">
          <div 
            id={containerId} 
            style={{ width, height: height }} 
            className="overflow-hidden rounded-lg border-2 border-orange-400 bg-black relative"
          />
          
          {/* Scanning Overlay */}
          {isScanning && (
            <div className="absolute inset-2 border-2 border-dashed border-green-400 rounded-lg animate-pulse pointer-events-none">
              <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-green-400"></div>
              <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-green-400"></div>
              <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-green-400"></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-green-400"></div>
            </div>
          )}
          
          {/* Camera switching indicator */}
          {isSwitchingCamera && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center z-10">
              <div className="bg-white/90 px-3 py-2 rounded-md flex items-center gap-2">
                <SwitchCamera className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Switching...</span>
              </div>
            </div>
          )}
        </div>

        {/* Camera Flip Button - Positioned to the side */}
        {availableCameras.length > 1 && (
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 bg-white/90 hover:bg-white shadow-md border-2 border-orange-400"
            onClick={onFlipCamera}
            disabled={isSwitchingCamera || !isInitialized}
          >
            <SwitchCamera 
              className={`h-5 w-5 ${isSwitchingCamera ? 'animate-spin' : ''}`} 
            />
          </Button>
        )}
      </div>
      
      {/* Status Indicator */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
        <p className="text-sm text-muted-foreground">
          {!isInitialized ? "Starting camera..." : 
           isScanning ? "Ready to scan QR code" : "Camera initializing..."}
        </p>
      </div>
      
      {isScanning && (
        <div className="text-center space-y-1">
          <p className="text-sm text-green-600 font-medium">
            📱 Point camera at QR code
          </p>
          {availableCameras.length > 1 && (
            <p className="text-xs text-muted-foreground">
              Use the flip button to switch cameras
            </p>
          )}
        </div>
      )}
    </div>
  );
};

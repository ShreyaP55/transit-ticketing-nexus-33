
import React, { useState, useEffect } from 'react';
import { healthCheck } from '@/services/healthCheck';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const ServerStatus = () => {
  const [status, setStatus] = useState<{ status: string; message: string } | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      setIsChecking(true);
      const result = await healthCheck.checkBackendConnection();
      setStatus(result);
      setIsChecking(false);
    };

    checkStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (isChecking) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
        Checking...
      </Badge>
    );
  }

  if (status?.status === 'connected') {
    return (
      <Badge variant="outline" className="text-green-600 border-green-600/30 bg-green-600/10">
        <CheckCircle className="mr-1 h-3 w-3" />
        Server Online
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-red-600 border-red-600/30 bg-red-600/10">
      <XCircle className="mr-1 h-3 w-3" />
      Server Offline
    </Badge>
  );
};

export default ServerStatus;

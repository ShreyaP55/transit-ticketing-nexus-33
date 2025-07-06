
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface ConcessionStatusBadgeProps {
  concessionType: string;
  verificationStatus: string;
  className?: string;
}

export const ConcessionStatusBadge: React.FC<ConcessionStatusBadgeProps> = ({
  concessionType,
  verificationStatus,
  className = ""
}) => {
  const getConcessionLabel = (type: string) => {
    const labels: Record<string, string> = {
      general: 'General',
      student: 'Student',
      child: 'Child',
      women: 'Women',
      elderly: 'Senior Citizen',
      disabled: 'Disabled'
    };
    return labels[type] || 'General';
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'verified':
        return {
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800 border-green-200',
          text: 'Verified'
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          text: 'Pending'
        };
      case 'rejected':
        return {
          icon: AlertTriangle,
          color: 'bg-red-100 text-red-800 border-red-200',
          text: 'Rejected'
        };
      default:
        return {
          icon: Shield,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          text: 'Not Verified'
        };
    }
  };

  const { icon: StatusIcon, color, text } = getStatusConfig(verificationStatus);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Badge className={`${color} flex items-center space-x-1`}>
        <StatusIcon className="h-3 w-3" />
        <span>{getConcessionLabel(concessionType)}</span>
      </Badge>
      <Badge variant="outline" className="text-xs">
        {text}
      </Badge>
    </div>
  );
};


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Tag, TrendingDown } from 'lucide-react';

interface FareBreakdownDisplayProps {
  originalFare: number;
  discountAmount: number;
  finalFare: number;
  concessionType: string;
  discountPercentage: number;
  isEligible: boolean;
}

export const FareBreakdownDisplay: React.FC<FareBreakdownDisplayProps> = ({
  originalFare,
  discountAmount,
  finalFare,
  concessionType,
  discountPercentage,
  isEligible
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

  const getConcessionColor = (type: string) => {
    const colors: Record<string, string> = {
      general: 'bg-gray-100 text-gray-800',
      student: 'bg-blue-100 text-blue-800',
      child: 'bg-green-100 text-green-800',
      women: 'bg-pink-100 text-pink-800',
      elderly: 'bg-purple-100 text-purple-800',
      disabled: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (!isEligible && concessionType !== 'general') {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Tag className="h-5 w-5 text-yellow-600" />
            <span>Verification Required</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-800 mb-3">
            Your concession benefits are pending verification. You'll pay the general fare until verification is complete.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Current Fare:</span>
              <span className="font-semibold text-lg">₹{originalFare}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>After verification:</span>
              <span>₹{finalFare} ({discountPercentage}% off)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-green-600" />
            <span>Fare Breakdown</span>
          </div>
          <Badge className={getConcessionColor(concessionType)}>
            {getConcessionLabel(concessionType)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Original Fare:</span>
          <span className="text-gray-800">₹{originalFare}</span>
        </div>
        
        {discountAmount > 0 && (
          <div className="flex justify-between items-center text-green-600">
            <div className="flex items-center space-x-1">
              <TrendingDown className="h-4 w-4" />
              <span>Concession Discount ({discountPercentage}%):</span>
            </div>
            <span>-₹{discountAmount}</span>
          </div>
        )}
        
        <hr className="border-gray-200" />
        
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Final Fare:</span>
          <span className="text-green-600">₹{finalFare}</span>
        </div>
        
        {discountAmount > 0 && (
          <div className="text-center mt-3 p-2 bg-green-100 rounded-lg">
            <span className="text-green-800 text-sm font-medium">
              You save ₹{discountAmount} with your {getConcessionLabel(concessionType).toLowerCase()} concession!
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

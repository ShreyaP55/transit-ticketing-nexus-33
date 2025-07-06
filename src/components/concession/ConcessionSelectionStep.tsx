
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Users, GraduationCap, Baby, Heart, UserCheck } from 'lucide-react';

interface ConcessionOption {
  id: string;
  name: string;
  description: string;
  discount: string;
  requirements: string[];
  icon: React.ElementType;
  color: string;
}

const concessionOptions: ConcessionOption[] = [
  {
    id: 'general',
    name: 'General',
    description: 'Standard fare with no discount',
    discount: '0%',
    requirements: ['No special requirements'],
    icon: Users,
    color: 'bg-gray-100 text-gray-800'
  },
  {
    id: 'student',
    name: 'Student',
    description: 'Valid student ID required',
    discount: '30%',
    requirements: ['Valid student ID', 'Age 16-25 years'],
    icon: GraduationCap,
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'child',
    name: 'Children',
    description: 'For children under 12 years',
    discount: '50%',
    requirements: ['Age 0-12 years', 'Birth certificate or Aadhaar'],
    icon: Baby,
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'women',
    name: 'Women',
    description: 'Special discount for women',
    discount: '20%',
    requirements: ['Valid government ID'],
    icon: Heart,
    color: 'bg-pink-100 text-pink-800'
  },
  {
    id: 'elderly',
    name: 'Senior Citizens',
    description: 'For citizens 60 years and above',
    discount: '40%',
    requirements: ['Age 60+ years', 'Valid government ID'],
    icon: UserCheck,
    color: 'bg-purple-100 text-purple-800'
  }
];

interface ConcessionSelectionStepProps {
  selectedConcession: string;
  onSelectConcession: (concessionId: string) => void;
  onNext: () => void;
}

export const ConcessionSelectionStep: React.FC<ConcessionSelectionStepProps> = ({
  selectedConcession,
  onSelectConcession,
  onNext
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Select Your Concession Category</h2>
        <p className="text-gray-600 mt-2">Choose the category that applies to you for discounted fares</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {concessionOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedConcession === option.id;
          
          return (
            <Card 
              key={option.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected ? 'ring-2 ring-orange-500 shadow-lg' : ''
              }`}
              onClick={() => onSelectConcession(option.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-6 w-6 text-orange-600" />
                    <CardTitle className="text-lg">{option.name}</CardTitle>
                  </div>
                  {isSelected && (
                    <Check className="h-5 w-5 text-orange-600" />
                  )}
                </div>
                <Badge className={option.color}>
                  {option.discount} OFF
                </Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-3">
                  {option.description}
                </CardDescription>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">Requirements:</p>
                  {option.requirements.map((req, index) => (
                    <p key={index} className="text-xs text-gray-600">• {req}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="flex justify-center">
        <Button 
          onClick={onNext}
          disabled={!selectedConcession}
          className="px-8 py-2 bg-orange-600 hover:bg-orange-700"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

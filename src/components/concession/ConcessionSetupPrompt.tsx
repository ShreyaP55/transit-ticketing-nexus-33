
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConcessionRegistrationModal } from './ConcessionRegistrationModal';
import { Gift, ArrowRight, Percent } from 'lucide-react';
import { useUser } from '@/context/UserContext';

export const ConcessionSetupPrompt: React.FC = () => {
  const { userId } = useUser();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      checkConcessionStatus();
    }
  }, [userId]);

  const checkConcessionStatus = async () => {
    try {
      const response = await fetch(`/api/verification/status/${userId}`);
      if (response.ok) {
        const data = await response.json();
        // Show prompt if user is on general concession (no benefits set up)
        setShowPrompt(data.concessionType === 'general' || !data.concessionType);
      }
    } catch (error) {
      console.error('Error checking concession status:', error);
    }
  };

  const handleComplete = () => {
    setIsModalOpen(false);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <>
      <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-orange-800">
            <Gift className="h-5 w-5" />
            <span>Unlock Fare Discounts!</span>
          </CardTitle>
          <CardDescription className="text-orange-700">
            Get up to 50% off on tickets with verified concession benefits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-green-100 text-green-800">
              <Percent className="h-3 w-3 mr-1" />
              Students: 30% OFF
            </Badge>
            <Badge className="bg-blue-100 text-blue-800">
              <Percent className="h-3 w-3 mr-1" />
              Children: 50% OFF
            </Badge>
            <Badge className="bg-pink-100 text-pink-800">
              <Percent className="h-3 w-3 mr-1" />
              Women: 20% OFF
            </Badge>
            <Badge className="bg-purple-100 text-purple-800">
              <Percent className="h-3 w-3 mr-1" />
              Elderly: 40% OFF
            </Badge>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            <span>Set Up Concession Benefits</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      <ConcessionRegistrationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onComplete={handleComplete}
      />
    </>
  );
};


import { useState } from 'react';
import { toast } from 'sonner';

interface ConcessionData {
  concessionType: string;
  documentData?: any;
}

export const useConcessionRegistration = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConcessionComplete = async (concessionData: ConcessionData) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/verification/update-concession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
          concessionData
        }),
      });

      if (response.ok) {
        toast.success('Concession registration completed successfully!');
        setIsModalOpen(false);
        // Refresh user data
        window.location.reload();
      } else {
        toast.error('Failed to register concession. Please try again.');
      }
    } catch (error) {
      console.error('Concession registration error:', error);
      toast.error('An error occurred during registration.');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isModalOpen,
    setIsModalOpen,
    isProcessing,
    handleConcessionComplete
  };
};

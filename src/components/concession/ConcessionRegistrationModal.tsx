
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConcessionSelectionStep } from './ConcessionSelectionStep';
import { DocumentUploadStep } from './DocumentUploadStep';

interface ConcessionRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (concessionData: any) => void;
}

export const ConcessionRegistrationModal: React.FC<ConcessionRegistrationModalProps> = ({
  open,
  onOpenChange,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedConcession, setSelectedConcession] = useState('general');
  const [documentData, setDocumentData] = useState<any>(null);

  const handleConcessionSelect = (concessionId: string) => {
    setSelectedConcession(concessionId);
  };

  const handleDocumentUploaded = (data: any) => {
    setDocumentData(data);
  };

  const handleComplete = () => {
    const concessionData = {
      concessionType: selectedConcession,
      documentData: selectedConcession !== 'general' ? documentData : null
    };
    
    onComplete(concessionData);
    onOpenChange(false);
  };

  const handleNext = () => {
    if (currentStep === 1 && selectedConcession === 'general') {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Set Up Your Concession Benefits</DialogTitle>
        </DialogHeader>
        
        <div className="mt-6">
          {currentStep === 1 && (
            <ConcessionSelectionStep
              selectedConcession={selectedConcession}
              onSelectConcession={handleConcessionSelect}
              onNext={handleNext}
            />
          )}
          
          {currentStep === 2 && (
            <DocumentUploadStep
              concessionType={selectedConcession}
              onDocumentUploaded={handleDocumentUploaded}
              onNext={handleComplete}
              onBack={handleBack}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

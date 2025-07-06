
export interface ConcessionType {
  id: 'general' | 'student' | 'child' | 'women' | 'elderly' | 'disabled';
  name: string;
  description: string;
  discount: number;
  requirements: string[];
  ageRequirement?: { min?: number; max?: number };
  genderRequirement?: 'male' | 'female';
  documentRequired: boolean;
}

export interface VerificationDocument {
  _id: string;
  userId: string;
  documentType: 'aadhaar' | 'pan' | 'student_id' | 'driving_license' | 'voter_id';
  documentUrl: string;
  extractedData: {
    dateOfBirth?: string;
    gender?: string;
    name?: string;
    documentNumber?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface FareBreakdown {
  originalFare: number;
  discountAmount: number;
  discountPercentage: number;
  finalFare: number;
  concessionType: string;
  isEligible: boolean;
}

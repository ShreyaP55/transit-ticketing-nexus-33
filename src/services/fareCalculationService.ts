
import { IUser } from '@/types';

interface ConcessionRates {
  [key: string]: number;
}

const CONCESSION_RATES: ConcessionRates = {
  child: 0.5,      // 50% discount (0-12 years)
  student: 0.3,    // 30% discount (valid student ID)
  women: 0.2,      // 20% discount (all women)
  elderly: 0.4,    // 40% discount (60+ years)
  disabled: 0.5,   // 50% discount (disability certificate)
  general: 0       // No discount
};

export const calculateAge = (dateOfBirth: Date | string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export const validateConcessionEligibility = (
  concessionType: string, 
  dateOfBirth: Date | string | undefined,
  gender: string | undefined
): boolean => {
  if (!dateOfBirth) return concessionType === 'general';
  
  const age = calculateAge(dateOfBirth);
  
  switch (concessionType) {
    case 'child':
      return age <= 12;
    case 'student':
      return age >= 16 && age <= 25;
    case 'elderly':
      return age >= 60;
    case 'women':
      return gender === 'female';
    case 'disabled':
      return true; // Requires document verification
    default:
      return true;
  }
};

export const calculateDiscountedFare = (baseFare: number, user: any) => {
  if (!user) {
    return {
      originalFare: baseFare,
      discountAmount: 0,
      discountPercentage: 0,
      finalFare: baseFare,
      concessionType: 'general',
      isEligible: false
    };
  }

  // Validate age-based concessions
  const age = user.dateOfBirth ? calculateAge(user.dateOfBirth) : 0;
  let validConcessionType = user.concessionType || 'general';
  
  // Age validation
  if (user.concessionType === 'child' && age > 12) {
    validConcessionType = 'general';
  }
  if (user.concessionType === 'elderly' && age < 60) {
    validConcessionType = 'general';
  }
  if (user.concessionType === 'student' && (age < 16 || age > 25)) {
    validConcessionType = 'general';
  }
  
  // Gender validation
  if (user.concessionType === 'women' && user.gender !== 'female') {
    validConcessionType = 'general';
  }
  
  const discount = CONCESSION_RATES[validConcessionType] || 0;
  const isEligible = user.verificationStatus === 'verified' || validConcessionType === 'general';
  
  return {
    originalFare: baseFare,
    discountAmount: baseFare * discount,
    discountPercentage: discount * 100,
    finalFare: baseFare * (1 - discount),
    concessionType: validConcessionType,
    isEligible
  };
};


export interface IRide {
  _id: string;
  userId: string;
  userName: string;
  busId: string;
  busName: string;
  startLocation: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  endLocation?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  active: boolean;
  distance?: number;
  fare?: number;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IWalletTransaction {
  _id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  rideId?: string;
  createdAt: string;
}

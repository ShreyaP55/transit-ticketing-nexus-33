
export interface IRoute {
  _id: string;
  start: string;
  end: string;
  fare: number;
}

export interface IBus {
  _id: string;
  name: string;
  route: IRoute;
  capacity: number;
}

export interface IStation {
  _id: string;
  routeId: IRoute;
  busId: IBus;
  name: string;
  latitude: number;
  longitude: number;
  fare: number;
  location?: string; // Added location property as optional
}

export interface ITicket {
  _id: string;
  userId: string;
  routeId: IRoute;
  busId: IBus;
  startStation: string;
  endStation: string;
  price: number;
  paymentIntentId: string;
  expiryDate: string;
  createdAt: string;
}

export interface IPass {
  _id: string;
  userId: string;
  routeId: IRoute;
  fare: number;
  purchaseDate: string;
  expiryDate: string;
}

export interface IPassUsage {
  _id: string;
  userId: string;
  passId: IPass;
  location: string;
  scannedAt: string;
}

export interface IPayment {
  _id: string;
  userId: string;
  type: 'pass' | 'ticket';
  routeId: string;
  fare: number;
  stripeSessionId: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface IWallet {
  _id: string;
  userId: string;
  balance: number;
  updatedAt: string;
}

export interface ITrip {
  _id: string;
  userId: string;
  startLocation: {
    lat: number;
    lng: number;
    timestamp: string;
  };
  endLocation?: {
    lat: number;
    lng: number;
    timestamp: string;
  };
  distance?: number;  // in kilometers
  fare?: number;      // calculated fare
  status: 'started' | 'completed' | 'cancelled';
  createdAt: string;
}

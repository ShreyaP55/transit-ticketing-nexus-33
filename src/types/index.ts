
export interface IRoute {
  _id: string;
  start: string;
  end: string;
  fare: number;
}

export interface IBus {
  _id: string;
  name: string;
  route: string | IRoute;
  capacity: number;
}

export interface IStation {
  _id: string;
  routeId: string | IRoute;
  busId: string | IBus;
  name: string;
  latitude: number;
  longitude: number;
  fare: number;
  location?: string;
}

export interface ITicket {
  _id: string;
  userId: string;
  routeId: string | IRoute;
  busId: string | IBus;
  startStation: string;
  endStation: string;
  price: number;
  paymentIntentId: string;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPass {
  _id: string;
  userId: string;
  routeId: string | IRoute;
  startDate: string;
  endDate: string;
  expiryDate: string;
  purchaseDate: string;
  active: boolean;
  price: number;
  fare: number;
  createdAt: string;
  updatedAt: string;
}

export interface IPassUsage {
  _id: string;
  userId: string;
  passId: string | IPass;
  scannedAt: string;
  location?: string;
}

export interface IPayment {
  _id: string;
  userId: string;
  type: 'pass' | 'ticket';
  routeId: string | IRoute | null;
  start: string | null;
  end: string | null;
  fare: number;
  stripeSessionId: string;
  status: 'pending' | 'completed';
}

export interface IUser {
  _id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

export interface ILocation {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface ITrip {
  _id: string;
  userId: string;
  startLocation: ILocation;
  endLocation?: ILocation;
  active: boolean;
  distance?: number;
  fare?: number;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IWallet {
  _id: string;
  userId: string;
  balance: number;
  transactions: ITransaction[];
  createdAt: string;
  updatedAt: string;
}

export interface ITransaction {
  _id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  createdAt: string;
}

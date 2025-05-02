
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

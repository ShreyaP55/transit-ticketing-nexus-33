
import { IRoute, IBus, IPass } from '@/types';

export const getRouteDisplay = (route: string | IRoute | null): string => {
  if (!route) return 'No route assigned';
  if (typeof route === 'string') return route;
  return `${route.start} → ${route.end}`;
};

export const getBusName = (bus: string | IBus): string => {
  if (typeof bus === 'string') return bus;
  return bus.name;
};

export const getRouteId = (route: string | IRoute | null): string => {
  if (!route) return '';
  if (typeof route === 'string') return route;
  return route._id;
};

export const getBusId = (bus: string | IBus): string => {
  if (typeof bus === 'string') return bus;
  return bus._id;
};

export const getPassId = (pass: string | IPass): string => {
  if (typeof pass === 'string') return pass;
  return pass._id;
};

export const isRoute = (route: string | IRoute | null): route is IRoute => {
  return typeof route === 'object' && route !== null && '_id' in route;
};

export const isBus = (bus: string | IBus): bus is IBus => {
  return typeof bus === 'object' && bus !== null && '_id' in bus;
};

export const isPass = (pass: string | IPass): pass is IPass => {
  return typeof pass === 'object' && pass !== null && '_id' in pass;
};

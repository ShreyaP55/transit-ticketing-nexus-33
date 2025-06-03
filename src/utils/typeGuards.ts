
import { IRoute, IBus, IPass } from '@/types';

export const getRouteDisplay = (route: string | IRoute): string => {
  if (typeof route === 'string') return route;
  return `${route.start} → ${route.end}`;
};

export const getBusName = (bus: string | IBus): string => {
  if (typeof bus === 'string') return bus;
  return bus.name;
};

export const getRouteId = (route: string | IRoute): string => {
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

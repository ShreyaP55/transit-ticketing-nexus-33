
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, Clock, MapPin, Users } from 'lucide-react';
import { IBus, IRoute } from '@/types';

interface BusInfoPanelProps {
  bus: IBus;
  location: {
    lat: number;
    lng: number;
    updatedAt: Date;
  };
  route?: IRoute;
}

const BusInfoPanel: React.FC<BusInfoPanelProps> = ({ bus, location, route }) => {
  // Calculate minutes since last update
  const minutesSinceUpdate = Math.floor((new Date().getTime() - new Date(location.updatedAt).getTime()) / 60000);
  
  // Status based on time since update
  const getStatusBadge = () => {
    if (minutesSinceUpdate < 2) {
      return <Badge variant="success">Live</Badge>;
    } else if (minutesSinceUpdate < 5) {
      return <Badge variant="warning">Active</Badge>;
    } else {
      return <Badge variant="outline">Delayed</Badge>;
    }
  };
  
  // Simulated ETA calculation
  const getRandomETA = () => {
    return Math.floor(Math.random() * 30) + 5; // Random ETA between 5-35 minutes
  };

  return (
    <Card className="bg-gradient-to-br from-white to-blue-50 shadow-lg">
      <CardHeader className="pb-3 bg-gradient-to-r from-transit-green to-transit-blue text-white">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <div className="flex items-center">
            <Navigation className="mr-2 h-5 w-5" />
            {bus.name}
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="space-y-3">
          <li className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
            <div className="flex items-center text-sm">
              <MapPin className="mr-2 h-4 w-4 text-transit-blue" />
              <span>Current Location</span>
            </div>
            <span className="text-xs font-mono bg-gray-100 p-1 rounded">
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </span>
          </li>
          
          <li className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
            <div className="flex items-center text-sm">
              <Clock className="mr-2 h-4 w-4 text-transit-blue" />
              <span>Last Updated</span>
            </div>
            <span className="text-xs">
              {minutesSinceUpdate < 1 
                ? 'Just now' 
                : `${minutesSinceUpdate} min ago`}
            </span>
          </li>

          <li className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
            <div className="flex items-center text-sm">
              <Users className="mr-2 h-4 w-4 text-transit-blue" />
              <span>Capacity</span>
            </div>
            <div className="flex items-center">
              <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                <div 
                  className="h-2 bg-transit-blue rounded-full" 
                  style={{ width: `${Math.floor(Math.random() * 80) + 10}%` }}
                ></div>
              </div>
              <span className="text-xs">{bus.capacity} seats</span>
            </div>
          </li>

          {route && (
            <>
              <li className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
                <div className="flex items-center text-sm">
                  <MapPin className="mr-2 h-4 w-4 text-transit-green" />
                  <span>Start</span>
                </div>
                <span className="text-xs font-medium">{route.start}</span>
              </li>
              
              <li className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
                <div className="flex items-center text-sm">
                  <MapPin className="mr-2 h-4 w-4 text-transit-red" />
                  <span>End</span>
                </div>
                <span className="text-xs font-medium">{route.end}</span>
              </li>

              <li className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
                <div className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4 text-transit-yellow" />
                  <span>ETA</span>
                </div>
                <span className="text-xs font-bold">{getRandomETA()} min</span>
              </li>
            </>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};

export default BusInfoPanel;

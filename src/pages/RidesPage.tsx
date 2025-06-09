
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, Clock } from 'lucide-react';
import UserQRCode from '@/components/wallet/UserQRCode';
import RideComponent from '@/components/rides/RideComponent';

const RidesPage = () => {
  return (
    <MainLayout title="My Rides">
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="qr" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="qr" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              My QR Code
            </TabsTrigger>
            <TabsTrigger value="rides" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Ride History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="qr" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-transit-orange">
                  <QrCode className="h-5 w-5" />
                  Your Transit QR Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Present this QR code to the driver when boarding and exiting the bus
                  </p>
                  <UserQRCode />
                  <div className="bg-transit-orange/10 p-4 rounded-lg">
                    <p className="text-sm text-transit-orange">
                      💡 Tip: Keep your phone screen bright for better scanning
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rides" className="mt-6">
            <RideComponent />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default RidesPage;


import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Bus as BusIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import BusTableRow from "./BusTableRow";
import { IBus, IStation, IRoute, isRoute } from "@/types";

interface BusTableProps {
  buses: IBus[] | undefined;
  isLoading: boolean;
  selectedRouteId: string;
  isAdmin: boolean;
  onAddBus: () => void;
  onEditBus: (bus: IBus) => void;
  onDeleteBus: (id: string) => void;
  onGenerateQR: (bus: IBus) => void;
  stations?: IStation[];
  isLoadingStations?: boolean;
  routes?: IRoute[];
}

const BusTable: React.FC<BusTableProps> = ({
  buses,
  isLoading,
  selectedRouteId,
  isAdmin,
  onAddBus,
  onEditBus,
  onDeleteBus,
  onGenerateQR,
  stations,
  isLoadingStations,
  routes
}) => {
  return (
    <div className="w-full flex flex-col">
      <Card className="h-fit border-transit-orange/20 bg-card">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between pb-2 border-b border-border gap-2">
          <div>
            <CardTitle className="text-xl font-bold text-white">Buses</CardTitle>
            <CardDescription>
              {selectedRouteId ? 
                "Buses for the selected route" : 
                "All buses in the system"
              }
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
            </div>
          ) : !buses || buses.length === 0 ? (
            <div className="text-center p-8 border rounded-lg border-dashed border-border bg-background/20">
              <BusIcon className="mx-auto h-12 w-12 mb-2 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                {isLoading
                  ? "Loading buses..."
                  : "No buses found"}
              </p>
              {isAdmin && (
                <Button 
                  variant="outline" 
                  className="mt-4 border-transit-orange/40 hover:border-transit-orange hover:bg-transit-orange/10 text-transit-orange-light hover:text-transit-orange-light" 
                  onClick={onAddBus}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add First Bus
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Fare</TableHead>
                    <TableHead>Station</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buses?.map(bus => {
                    // Get related route
                    let route: IRoute | undefined;
                    if (isRoute(bus.route)) {
                      route = bus.route;
                    } else if (routes && typeof bus.route === 'string') {
                      // Fallback for non-populated route
                      route = routes.find(r => r._id === bus.route);
                    }
                    // Get first related station
                    const station = stations?.find(stn => {
                      return (String(stn.busId) === String(bus._id));
                    });
                    return (
                      <BusTableRow
                        key={bus._id}
                        bus={bus}
                        isAdmin={isAdmin}
                        onEdit={onEditBus}
                        onDelete={onDeleteBus}
                        onGenerateQR={onGenerateQR}
                        route={route}
                        stationName={station?.name}
                      />
                    );
                  })}
                </TableBody>
              </Table>
              {isLoadingStations && (
                <div className="text-center p-2 text-sm text-muted-foreground">
                  Loading stations...
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BusTable;

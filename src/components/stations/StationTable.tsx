
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import StationTableRow from "./StationTableRow";
import { IStation, IBus } from "@/types";

interface StationTableProps {
  stations: IStation[] | undefined;
  buses: IBus[] | undefined;
  isLoading: boolean;
  onAddStation: () => void;
  onEditStation: (station: IStation) => void;
  onDeleteStation: (id: string) => void;
  isAdmin: boolean;
}

const StationTable: React.FC<StationTableProps> = ({
  stations,
  buses,
  isLoading,
  onAddStation,
  onEditStation,
  onDeleteStation,
  isAdmin
}) => {
  return (
    <Card className="border-orange-500/20 bg-gray-900">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-yellow-300">Stations</CardTitle>
        <CardDescription className="text-gray-400">
          Manage bus stations and their locations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-gray-800" />
              ))}
          </div>
        ) : !stations || stations.length === 0 ? (
          <div className="text-center p-8 border rounded-lg border-dashed border-gray-600 bg-gray-800/20">
            <MapPin className="mx-auto h-12 w-12 mb-2 text-gray-500" />
            <p className="text-gray-400">No stations found</p>
            {isAdmin && (
              <Button 
                variant="outline" 
                className="mt-4 border-orange-500/40 hover:border-orange-500 hover:bg-orange-900/10 text-orange-400" 
                onClick={onAddStation}
              >
                <Plus className="mr-2 h-4 w-4" /> Add First Station
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-md border border-gray-700 overflow-x-auto bg-gray-900">
            <Table>
              <TableHeader className="bg-gray-800">
                <TableRow className="border-b border-gray-700">
                  <TableHead className="text-yellow-300 font-semibold bg-gray-800">Station Name</TableHead>
                  <TableHead className="text-yellow-300 font-semibold bg-gray-800">Bus</TableHead>
                  <TableHead className="text-yellow-300 font-semibold bg-gray-800">Coordinates</TableHead>
                  <TableHead className="text-yellow-300 font-semibold bg-gray-800">Fare</TableHead>
                  <TableHead className="text-yellow-300 font-semibold bg-gray-800 w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stations?.map(station => {
                  const bus = buses?.find(b => String(b._id) === String(station.busId));
                  return (
                    <StationTableRow
                      key={station._id}
                      station={station}
                      bus={bus}
                      onEdit={onEditStation}
                      onDelete={onDeleteStation}
                      isAdmin={isAdmin}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StationTable;

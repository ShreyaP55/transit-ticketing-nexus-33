
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, Route, QrCode } from "lucide-react";
import { IBus, IRoute } from "@/types";

interface BusTableRowProps {
  bus: IBus;
  isAdmin: boolean;
  onEdit: (bus: IBus) => void;
  onDelete: (id: string) => void;
  onGenerateQR: (bus: IBus) => void;
  route?: IRoute;
  stationName?: string;
}

const BusTableRow: React.FC<BusTableRowProps> = ({
  bus,
  isAdmin,
  onEdit,
  onDelete,
  onGenerateQR,
  route,
  stationName
}) => {
  return (
    <TableRow className="hover:bg-gray-800/50 border-b border-gray-700">
      <TableCell className="font-medium text-yellow-300 bg-gray-900">{bus.name}</TableCell>
      <TableCell className="bg-gray-800">
        <div className="flex items-center text-blue-300">
          <Route className="h-4 w-4 mr-1 text-orange-500" />
          <span>{route ? `${route.start} - ${route.end}` : "—"}</span>
        </div>
      </TableCell>
      <TableCell className="bg-gray-900">
        <Badge variant="outline" className="bg-green-900/30 text-green-300 border-green-500/30">
          {bus.capacity} seats
        </Badge>
      </TableCell>
      <TableCell className="bg-gray-800">
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 p-2 text-orange-400 border-orange-500/30 hover:bg-orange-900/20" 
            onClick={() => onGenerateQR(bus)}
          >
            <QrCode className="h-4 w-4 mr-1" /> QR: {bus._id.slice(-6)}
          </Button>
          
          {isAdmin && (
            <>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-400 hover:bg-blue-900/20" onClick={() => onEdit(bus)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:bg-red-900/20" onClick={() => onDelete(bus._id)}>
                <Trash className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default BusTableRow;

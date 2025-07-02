
import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { IBus } from "@/types";
import { getRouteDisplay } from "@/utils/typeGuards";
import { BusDeleteDialog } from "./BusDeleteDialog";

interface BusTableRowProps {
  bus: IBus;
  onEdit: (bus: IBus) => void;
  onDeleted: () => void;
}

export const BusTableRow: React.FC<BusTableRowProps> = ({ bus, onEdit, onDeleted }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const routeDisplay = getRouteDisplay(bus.route);

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{bus.name}</TableCell>
        <TableCell>
          <Badge variant="outline">{routeDisplay}</Badge>
        </TableCell>
        <TableCell>{bus.capacity}</TableCell>
        <TableCell>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(bus)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      
      <BusDeleteDialog
        bus={bus}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onDeleted={onDeleted}
      />
    </>
  );
};

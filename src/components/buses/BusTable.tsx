
import React from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IBus } from "@/types";
import { BusTableRow } from "./BusTableRow";

interface BusTableProps {
  buses: IBus[];
  onEdit: (bus: IBus) => void;
  onRefresh: () => void;
}

export const BusTable: React.FC<BusTableProps> = ({ buses, onEdit, onRefresh }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {buses.map((bus) => (
            <BusTableRow
              key={bus._id}
              bus={bus}
              onEdit={onEdit}
              onDeleted={onRefresh}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash, ArrowUpDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ConfirmDialog from "../common/confirmation-dialog";

interface Invitation {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string | null;
}

interface InvitationTableProps {
  data: Invitation[];
  onRemove: (id: string) => void;
  onEdit: (id: string) => void;
}

const InvitationTable: React.FC<InvitationTableProps> = ({
  data,
  onRemove,
}) => {
  const [sorting, setSorting] = useState<any>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [invitationForAction, setInvitationForAction] =
    useState<Invitation | null>(null);

  const columns = useMemo<ColumnDef<Invitation>[]>(
    () => [
      {
        accessorKey: "email",
        header: () => <span>Email</span>,
        cell: ({ row }) => (
          <span className="font-medium">{row.original.email}</span>
        ),
      },
      {
        accessorKey: "role",
        header: () => <span>Role</span>,
        cell: ({ row }) => (
          <Badge className="capitalize">{row.original.role}</Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created
            <ArrowUpDown className="w-4 h-4" />
          </button>
        ),
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString(),
      },
      {
        accessorKey: "expiresAt",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Expires
            <ArrowUpDown className="w-4 h-4" />
          </button>
        ),
        cell: ({ row }) =>
          new Date(row.original.expiresAt).toLocaleDateString(),
      },
      {
        accessorKey: "acceptedAt",
        header: () => <span>Status</span>,
        cell: ({ row }) =>
          row.original.acceptedAt ? (
            <span className="text-green-600 font-semibold">Accepted</span>
          ) : (
            <span className="text-yellow-600 font-semibold">Pending</span>
          ),
      },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setInvitationForAction(row.original);
              setConfirmationDialogOpen(true);
            }}
          >
            <Trash className="w-4 h-4" />
          </Button>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative w-64">
        <Search className="absolute left-2 top-2.5 h-4 w-4 opacity-70" />
        <Input
          placeholder="Search by email..."
          className="pl-8 rounded-xl border-2"
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmationDialogOpen}
        setOpen={setConfirmationDialogOpen}
        title="Delete Invitation?"
        description="Are you sure you want to remove this invitation? This action cannot be undone."
        onConfirm={() => {
          if (invitationForAction?.id) onRemove(invitationForAction.id);
          setConfirmationDialogOpen(false);
        }}
      />

      {/* TABLE VIEW */}
      <div className="border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-semibold"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-t hover:bg-gray-50 dark:hover:bg-gray-900 transition"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvitationTable;

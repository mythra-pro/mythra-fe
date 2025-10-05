"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TicketData, TicketStatus } from "@/app/types/event";
import { Download, QrCode, CheckCircle2 } from "lucide-react";

interface AttendeeDataTableProps {
  tickets: TicketData[];
  onViewQR?: (ticketId: string) => void;
  onCheckIn?: (ticketId: string) => void;
}

export function AttendeeDataTable({
  tickets,
  onViewQR,
  onCheckIn,
}: AttendeeDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getStatusBadge = (status: TicketStatus) => {
    const variants: Record<
      TicketStatus,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      [TicketStatus.AVAILABLE]: { variant: "outline", label: "Available" },
      [TicketStatus.SOLD]: { variant: "secondary", label: "Sold" },
      [TicketStatus.CHECKED_IN]: { variant: "default", label: "Checked In" },
      [TicketStatus.CANCELLED]: { variant: "destructive", label: "Cancelled" },
    };

    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const columns: ColumnDef<TicketData>[] = [
    {
      accessorKey: "ticketNumber",
      header: "#",
      cell: ({ row }) => (
        <div className="font-medium">#{row.getValue("ticketNumber")}</div>
      ),
    },
    {
      accessorKey: "ownerName",
      header: "Attendee",
      cell: ({ row }) => {
        const name = row.getValue("ownerName") as string;
        const email = row.original.ownerEmail;
        return (
          <div>
            <div className="font-medium">{name || "Anonymous"}</div>
            <div className="text-xs text-muted-foreground">
              {email || "No email"}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "ownerWallet",
      header: "Wallet",
      cell: ({ row }) => {
        const wallet = row.getValue("ownerWallet") as string;
        return (
          <div className="font-mono text-xs">
            {wallet.substring(0, 8)}...{wallet.substring(wallet.length - 6)}
          </div>
        );
      },
    },
    {
      accessorKey: "purchaseDate",
      header: "Purchase Date",
      cell: ({ row }) => {
        const date = row.getValue("purchaseDate") as Date;
        return <div className="text-sm">{date.toLocaleDateString()}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
    {
      accessorKey: "checkInDate",
      header: "Check-in Time",
      cell: ({ row }) => {
        const date = row.getValue("checkInDate") as Date | undefined;
        return (
          <div className="text-sm">{date ? date.toLocaleString() : "-"}</div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const ticket = row.original;
        return (
          <div className="flex gap-2">
            {ticket.status === TicketStatus.SOLD && onCheckIn && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCheckIn(ticket.id)}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Check In
              </Button>
            )}
            {onViewQR && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onViewQR(ticket.id)}
              >
                <QrCode className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const filteredData = tickets.filter((ticket) => {
    if (statusFilter !== "all" && ticket.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  });

  const exportToCSV = () => {
    const headers = [
      "Ticket #",
      "Name",
      "Email",
      "Wallet",
      "Purchase Date",
      "Status",
      "Check-in Date",
    ];
    const rows = tickets.map((t) => [
      t.ticketNumber,
      t.ownerName || "",
      t.ownerEmail || "",
      t.ownerWallet,
      t.purchaseDate.toISOString(),
      t.status,
      t.checkInDate ? t.checkInDate.toISOString() : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendees-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = {
    total: tickets.length,
    checkedIn: tickets.filter((t) => t.status === TicketStatus.CHECKED_IN)
      .length,
    pending: tickets.filter((t) => t.status === TicketStatus.SOLD).length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Attendee Management</CardTitle>
            <CardDescription className="mt-1">
              {stats.total} total • {stats.checkedIn} checked in •{" "}
              {stats.pending} pending
            </CardDescription>
          </div>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center">
          <Input
            placeholder="Search attendees..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={TicketStatus.CHECKED_IN}>
                Checked In
              </SelectItem>
              <SelectItem value={TicketStatus.SOLD}>Pending</SelectItem>
              <SelectItem value={TicketStatus.CANCELLED}>Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No attendees found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

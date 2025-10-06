"use client";

import { useState } from "react";
import { TicketData, TicketStatus } from "@/app/types/event";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  QrCode,
} from "lucide-react";

interface AttendeeListProps {
  tickets: TicketData[];
  eventName: string;
  onCheckIn?: (ticketId: string) => void;
  onViewQR?: (ticketId: string) => void;
}

export default function AttendeeList({
  tickets,
  eventName,
  onCheckIn,
  onViewQR,
}: AttendeeListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"name" | "date" | "status">("name");

  // Filter and sort tickets
  const filteredTickets = tickets
    .filter((ticket) => {
      const matchesSearch =
        ticket.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ownerWallet.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "all" || ticket.status === filterStatus;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return (a.ownerName || "").localeCompare(b.ownerName || "");
      } else if (sortBy === "date") {
        return b.purchaseDate.getTime() - a.purchaseDate.getTime();
      } else {
        return a.status.localeCompare(b.status);
      }
    });

  const stats = {
    total: tickets.length,
    checkedIn: tickets.filter((t) => t.status === TicketStatus.CHECKED_IN)
      .length,
    pending: tickets.filter((t) => t.status === TicketStatus.SOLD).length,
    cancelled: tickets.filter((t) => t.status === TicketStatus.CANCELLED)
      .length,
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.CHECKED_IN:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="mr-1" />
            Checked In
          </span>
        );
      case TicketStatus.SOLD:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="mr-1" />
            Pending
          </span>
        );
      case TicketStatus.CANCELLED:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="mr-1" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Ticket Number",
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
    a.download = `${eventName}-attendees.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Attendee Management
            </h2>
            <p className="text-gray-600 mt-1">{eventName}</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-green-500 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Download />
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
            <p className="text-3xl font-bold text-purple-700">{stats.total}</p>
            <p className="text-sm text-purple-600 mt-1">Total Tickets</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <p className="text-3xl font-bold text-green-700">
              {stats.checkedIn}
            </p>
            <p className="text-sm text-green-600 mt-1">Checked In</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <p className="text-3xl font-bold text-blue-700">{stats.pending}</p>
            <p className="text-sm text-blue-600 mt-1">Pending</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
            <p className="text-3xl font-bold text-red-700">{stats.cancelled}</p>
            <p className="text-sm text-red-600 mt-1">Cancelled</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or wallet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as TicketStatus | "all")
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value={TicketStatus.CHECKED_IN}>Checked In</option>
              <option value={TicketStatus.SOLD}>Pending</option>
              <option value={TicketStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "name" | "date" | "status")
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Purchase Date</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>

        <p className="text-sm text-gray-600 mt-4">
          Showing {filteredTickets.length} of {tickets.length} attendees
        </p>
      </div>

      {/* Attendee List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-600 to-green-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">#</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Attendee
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Wallet
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Purchase Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Check-in Time
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    #{ticket.ticketNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {ticket.ownerName || "Anonymous"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {ticket.ownerEmail || "No email"}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-mono text-gray-600">
                      {ticket.ownerWallet.substring(0, 8)}...
                      {ticket.ownerWallet.substring(
                        ticket.ownerWallet.length - 6
                      )}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {ticket.purchaseDate.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(ticket.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {ticket.checkInDate
                      ? ticket.checkInDate.toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {ticket.status === TicketStatus.SOLD && onCheckIn && (
                        <button
                          onClick={() => onCheckIn(ticket.id)}
                          className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Check In
                        </button>
                      )}
                      {onViewQR && (
                        <button
                          onClick={() => onViewQR(ticket.id)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View QR Code"
                        >
                          <QrCode />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No attendees found</p>
          </div>
        )}
      </div>
    </div>
  );
}

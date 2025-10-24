"use client";

import { useState } from "react";
import { CheckInData, TicketData } from "@/app/types/event";
import { QrCode, CheckCircle, XCircle, Camera, Keyboard } from "lucide-react";

interface CheckInScannerProps {
  eventId: string;
  eventName: string;
  onCheckIn: (data: CheckInData) => Promise<boolean>;
  onLookupTicket?: (ticketId: string) => Promise<TicketData | null>;
}

export default function CheckInScanner({
  eventId,
  eventName,
  onCheckIn,
  onLookupTicket,
}: CheckInScannerProps) {
  const [scanMode, setScanMode] = useState<"qr" | "manual">("qr");
  const [ticketInput, setTicketInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<{
    success: boolean;
    message: string;
    ticket?: TicketData;
  } | null>(null);
  const [scanHistory, setScanHistory] = useState<
    Array<{
      ticketId: string;
      success: boolean;
      timestamp: Date;
      name?: string;
    }>
  >([]);

  const handleManualCheckIn = async () => {
    if (!ticketInput.trim()) return;

    setIsScanning(true);
    try {
      // Lookup ticket if function provided
      let ticket: TicketData | null = null;
      if (onLookupTicket) {
        ticket = await onLookupTicket(ticketInput);
      }

      // Simulate wallet signature verification
      const walletSignature = `sig_${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}`;

      const checkInData: CheckInData = {
        ticketId: ticketInput,
        eventId,
        checkInDate: new Date(),
        walletSignature,
      };

      const success = await onCheckIn(checkInData);

      setLastScanResult({
        success,
        message: success
          ? "Check-in successful!"
          : "Check-in failed. Ticket may be invalid or already used.",
        ticket: ticket || undefined,
      });

      setScanHistory([
        {
          ticketId: ticketInput,
          success,
          timestamp: new Date(),
          name: ticket?.ownerName,
        },
        ...scanHistory.slice(0, 9), // Keep last 10 entries
      ]);

      setTicketInput("");
    } catch (error) {
      setLastScanResult({
        success: false,
        message: "Error processing check-in. Please try again.",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleQRScan = async () => {
    // Simulate QR scan - in production, use a QR scanner library
    setIsScanning(true);
    setTimeout(async () => {
      const mockTicketId = `tkt_${Math.floor(Math.random() * 1000)}`;
      setTicketInput(mockTicketId);
      setIsScanning(false);

      // Auto-submit after scanning
      const walletSignature = `sig_${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}`;

      const checkInData: CheckInData = {
        ticketId: mockTicketId,
        eventId,
        checkInDate: new Date(),
        walletSignature,
      };

      const success = await onCheckIn(checkInData);

      setLastScanResult({
        success,
        message: success
          ? "Check-in successful!"
          : "Invalid ticket or already checked in.",
      });

      setScanHistory([
        {
          ticketId: mockTicketId,
          success,
          timestamp: new Date(),
        },
        ...scanHistory.slice(0, 9),
      ]);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Check-in Scanner</h2>
        <p className="text-blue-100">{eventName}</p>
      </div>

      {/* Mode Selector */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex gap-4">
          <button
            onClick={() => setScanMode("qr")}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-medium transition-all ${
              scanMode === "qr"
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Camera className="text-2xl" />
            QR Scanner
          </button>
          <button
            onClick={() => setScanMode("manual")}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-medium transition-all ${
              scanMode === "manual"
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Keyboard className="text-2xl" />
            Manual Entry
          </button>
        </div>
      </div>

      {/* Scanner Area */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        {scanMode === "qr" ? (
          <div className="space-y-6">
            <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl border-4 border-dashed border-blue-300 flex items-center justify-center">
              {isScanning ? (
                <div className="text-center">
                  <div className="animate-pulse">
                    <QrCode className="text-8xl text-blue-500 mx-auto mb-4" />
                  </div>
                  <p className="text-lg font-medium text-gray-700">
                    Scanning...
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <QrCode className="text-8xl text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Ready to Scan
                  </p>
                  <p className="text-sm text-gray-500">
                    Position QR code within frame
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleQRScan}
              disabled={isScanning}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScanning ? "Scanning..." : "Start Scanning"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Ticket ID or NFT Mint Address
              </label>
              <input
                type="text"
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleManualCheckIn()}
                placeholder="e.g., tkt_001 or wallet address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                disabled={isScanning}
              />
            </div>

            <button
              onClick={handleManualCheckIn}
              disabled={isScanning || !ticketInput.trim()}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScanning ? "Processing..." : "Check In"}
            </button>
          </div>
        )}
      </div>

      {/* Last Scan Result */}
      {lastScanResult && (
        <div
          className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
            lastScanResult.success ? "border-green-500" : "border-red-500"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                lastScanResult.success ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {lastScanResult.success ? (
                <CheckCircle className="text-2xl text-green-600" />
              ) : (
                <XCircle className="text-2xl text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <h3
                className={`text-lg font-bold mb-2 ${
                  lastScanResult.success ? "text-green-800" : "text-red-800"
                }`}
              >
                {lastScanResult.message}
              </h3>
              {lastScanResult.ticket && (
                <div className="bg-gray-50 rounded-lg p-4 mt-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Ticket #</p>
                      <p className="font-medium text-gray-900">
                        {lastScanResult.ticket.ticketNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Owner</p>
                      <p className="font-medium text-gray-900">
                        {lastScanResult.ticket.ownerName || "Anonymous"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">
                        {lastScanResult.ticket.ownerEmail || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Purchase Date</p>
                      <p className="font-medium text-gray-900">
                        {lastScanResult.ticket.purchaseDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Recent Check-ins
          </h3>
          <div className="space-y-2">
            {scanHistory.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {entry.success ? (
                    <CheckCircle className="text-green-500" />
                  ) : (
                    <XCircle className="text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {entry.name || entry.ticketId}
                    </p>
                    <p className="text-xs text-gray-500">
                      {entry.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    entry.success
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {entry.success ? "Success" : "Failed"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

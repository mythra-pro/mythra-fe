"use client";

import { TicketData } from "@/app/types/event";
import { FaDownload, FaTimes, FaQrcode } from "react-icons/fa";

interface QRCodeDisplayProps {
  ticket: TicketData;
  eventName: string;
  onClose: () => void;
}

export default function QRCodeDisplay({
  ticket,
  eventName,
  onClose,
}: QRCodeDisplayProps) {
  // Generate QR code data URL (in production, use a proper QR code library like qrcode.react)
  // For now, we'll create a placeholder that shows the concept
  const qrData = JSON.stringify({
    ticketId: ticket.id,
    eventId: ticket.eventId,
    ownerWallet: ticket.ownerWallet,
    nftMintAddress: ticket.nftMintAddress,
    ticketNumber: ticket.ticketNumber,
  });

  const downloadQRCode = () => {
    // In production, use a canvas to generate actual QR code image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 500;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = "#000000";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(eventName, 200, 40);

    // Ticket info
    ctx.font = "14px Arial";
    ctx.fillText(`Ticket #${ticket.ticketNumber}`, 200, 70);
    ctx.fillText(ticket.ownerName || "Anonymous", 200, 90);

    // QR Code placeholder (in production, use actual QR generation)
    ctx.fillStyle = "#9945FF";
    ctx.fillRect(50, 120, 300, 300);
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px Arial";
    ctx.fillText("QR CODE", 200, 270);

    // Footer
    ctx.fillStyle = "#666666";
    ctx.font = "12px Arial";
    ctx.fillText("Powered by Mythra", 200, 460);

    // Download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ticket-${ticket.ticketNumber}-qr.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes className="text-2xl" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-green-500 rounded-full mb-4">
            <FaQrcode className="text-3xl text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{eventName}</h2>
          <p className="text-gray-600 mt-1">Ticket #{ticket.ticketNumber}</p>
        </div>

        {/* Ticket Info */}
        <div className="bg-gradient-to-br from-purple-50 to-green-50 rounded-xl p-4 mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Owner:</span>
              <span className="font-medium text-gray-900">
                {ticket.ownerName || "Anonymous"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-gray-900">
                {ticket.ownerEmail || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Wallet:</span>
              <span className="font-mono text-xs text-gray-900">
                {ticket.ownerWallet.substring(0, 8)}...
                {ticket.ownerWallet.substring(ticket.ownerWallet.length - 6)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price:</span>
              <span className="font-medium text-gray-900">
                {ticket.priceInSOL} SOL
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Purchase Date:</span>
              <span className="font-medium text-gray-900">
                {ticket.purchaseDate.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* QR Code Display */}
        <div className="bg-white border-4 border-gray-200 rounded-xl p-6 mb-6">
          <div className="aspect-square bg-gradient-to-br from-purple-100 via-white to-green-100 rounded-lg flex items-center justify-center">
            {/* Placeholder for actual QR code - in production, use qrcode.react or similar */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <FaQrcode className="text-8xl text-purple-500 mx-auto mb-4" />
                <p className="text-sm text-gray-600">
                  QR Code for Ticket #{ticket.ticketNumber}
                </p>
                <p className="text-xs text-gray-500 mt-2 font-mono break-all px-4">
                  {ticket.nftMintAddress.substring(0, 20)}...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* NFT Info */}
        <div className="bg-gray-50 rounded-lg p-3 mb-6">
          <p className="text-xs text-gray-600 mb-1">NFT Mint Address:</p>
          <p className="text-xs font-mono text-gray-900 break-all">
            {ticket.nftMintAddress}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={downloadQRCode}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-green-500 text-white rounded-lg hover:shadow-lg transition-all font-medium"
          >
            <FaDownload />
            Download QR Code
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            Present this QR code at the event entrance for check-in
          </p>
        </div>
      </div>
    </div>
  );
}

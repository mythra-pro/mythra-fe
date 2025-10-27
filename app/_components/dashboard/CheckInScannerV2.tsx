"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckInData, TicketData } from "@/app/types/event";
import {
  QrCode,
  CheckCircle,
  XCircle,
  Camera,
  Keyboard,
  AlertCircle,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CheckInScannerProps {
  eventId: string;
  eventName: string;
  onCheckIn: (data: CheckInData) => Promise<boolean>;
  onLookupTicket?: (ticketId: string) => Promise<TicketData | null>;
}

export default function CheckInScannerV2({
  eventId,
  eventName,
  onCheckIn,
  onLookupTicket,
}: CheckInScannerProps) {
  const [scanMode, setScanMode] = useState<"qr" | "manual">("qr");
  const [ticketInput, setTicketInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "prompt">("prompt");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
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
  const [offlineQueue, setOfflineQueue] = useState<CheckInData[]>([]);
  const [lastScannedTicket, setLastScannedTicket] = useState<string>("");
  const [lastScanTime, setLastScanTime] = useState<number>(0);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = "qr-reader";

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load offline queue from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`checkin-queue-${eventId}`);
    if (stored) {
      try {
        setOfflineQueue(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse offline queue:", e);
      }
    }
  }, [eventId]);

  // Save offline queue
  useEffect(() => {
    if (offlineQueue.length > 0) {
      localStorage.setItem(`checkin-queue-${eventId}`, JSON.stringify(offlineQueue));
    } else {
      localStorage.removeItem(`checkin-queue-${eventId}`);
    }
  }, [offlineQueue, eventId]);

  // Process offline queue when online
  useEffect(() => {
    const processQueue = async () => {
      if (isOnline && offlineQueue.length > 0) {
        console.log(`📤 Processing ${offlineQueue.length} queued check-ins...`);
        const item = offlineQueue[0];
        try {
          const success = await onCheckIn(item);
          if (success) {
            setOfflineQueue((prev) => prev.slice(1));
            console.log("✅ Processed queued check-in");
          }
        } catch (e) {
          console.error("❌ Failed to process offline queue item:", e);
        }
      }
    };

    if (isOnline) {
      processQueue();
    }
  }, [isOnline, offlineQueue, onCheckIn]);

  // Play sound
  const playSound = (success: boolean) => {
    if (!soundEnabled) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (success) {
      // Success sound: two ascending beeps
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      oscillator.start(audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1);
      oscillator.stop(audioContext.currentTime + 0.2);
    } else {
      // Error sound: descending beep
      oscillator.frequency.value = 400;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      oscillator.start(audioContext.currentTime);
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.1);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  };

  // Start QR scanner
  const startQRScanner = async () => {
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerDivId);
      }

      const qrCodeSuccessCallback = async (decodedText: string) => {
        // Prevent duplicate scans within 2 seconds
        const now = Date.now();
        if (decodedText === lastScannedTicket && now - lastScanTime < 2000) {
          return;
        }

        setLastScannedTicket(decodedText);
        setLastScanTime(now);

        // Parse QR data
        let ticketId = decodedText;
        try {
          const qrData = JSON.parse(decodedText);
          ticketId = qrData.ticketId || qrData.mintPubkey || decodedText;
        } catch (e) {
          // Not JSON, use raw string
        }

        await processCheckIn(ticketId);
      };

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        qrCodeSuccessCallback,
        undefined
      );

      setCameraActive(true);
      setCameraPermission("granted");
      setIsScanning(true);
    } catch (err: any) {
      console.error("Failed to start scanner:", err);
      if (err.name === "NotAllowedError") {
        setCameraPermission("denied");
      }
      setLastScanResult({
        success: false,
        message: "Failed to access camera. Please grant permission and try again.",
      });
    }
  };

  // Stop QR scanner
  const stopQRScanner = async () => {
    try {
      if (html5QrCodeRef.current && cameraActive) {
        await html5QrCodeRef.current.stop();
        setCameraActive(false);
        setIsScanning(false);
      }
    } catch (err) {
      console.error("Failed to stop scanner:", err);
    }
  };

  // Process check-in
  const processCheckIn = async (ticketId: string) => {
    try {
      // Lookup ticket if function provided
      let ticket: TicketData | null = null;
      if (onLookupTicket) {
        ticket = await onLookupTicket(ticketId);
      }

      const checkInData: CheckInData = {
        ticketId,
        eventId,
        checkInDate: new Date(),
        walletSignature: `sig_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      };

      let success = false;

      if (isOnline) {
        success = await onCheckIn(checkInData);
      } else {
        // Offline: add to queue
        setOfflineQueue((prev) => [...prev, checkInData]);
        success = true; // Assume success for offline
        setLastScanResult({
          success: true,
          message: "✅ Queued for check-in (Offline mode)",
        });
      }

      playSound(success);

      setLastScanResult({
        success,
        message: success
          ? isOnline
            ? "✅ Check-in successful!"
            : "✅ Queued for check-in"
          : "❌ Check-in failed. Ticket invalid or already used.",
        ticket: ticket || undefined,
      });

      setScanHistory([
        {
          ticketId,
          success,
          timestamp: new Date(),
          name: ticket?.ownerName,
        },
        ...scanHistory.slice(0, 19), // Keep last 20
      ]);

      return success;
    } catch (error) {
      playSound(false);
      setLastScanResult({
        success: false,
        message: "❌ Error processing check-in. Please try again.",
      });
      return false;
    }
  };

  // Manual check-in
  const handleManualCheckIn = async () => {
    if (!ticketInput.trim()) return;

    setIsScanning(true);
    const success = await processCheckIn(ticketInput.trim());
    setTicketInput("");
    setIsScanning(false);

    return success;
  };

  // Toggle camera
  const toggleCamera = () => {
    if (cameraActive) {
      stopQRScanner();
    } else {
      startQRScanner();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && cameraActive) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, [cameraActive]);

  // Switch modes
  useEffect(() => {
    if (scanMode === "manual" && cameraActive) {
      stopQRScanner();
    }
  }, [scanMode, cameraActive]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Online Status Banner */}
      {!isOnline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
          <div className="flex items-center gap-3">
            <WifiOff className="h-5 w-5 text-yellow-700" />
            <div>
              <p className="font-semibold text-yellow-800">Offline Mode</p>
              <p className="text-sm text-yellow-700">
                Check-ins will be queued and processed when connection is restored
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Offline Queue Status */}
      {offlineQueue.length > 0 && (
        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-blue-700" />
              <p className="font-semibold text-blue-800">
                {offlineQueue.length} check-in(s) queued
              </p>
            </div>
            {isOnline && <p className="text-sm text-blue-700">Processing...</p>}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Button
              onClick={() => setScanMode("qr")}
              variant={scanMode === "qr" ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              QR Scanner
            </Button>
            <Button
              onClick={() => setScanMode("manual")}
              variant={scanMode === "manual" ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              <Keyboard className="h-4 w-4" />
              Manual Entry
            </Button>
          </div>
          <Button
            onClick={() => setSoundEnabled(!soundEnabled)}
            variant="outline"
            size="icon"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Scanner/Input Area */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        {scanMode === "qr" ? (
          <div className="space-y-6">
            {cameraPermission === "denied" && (
              <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded mb-4">
                <p className="text-red-800 font-semibold">Camera Access Denied</p>
                <p className="text-sm text-red-700">
                  Please enable camera permissions in your browser settings
                </p>
              </div>
            )}

            <div
              id={scannerDivId}
              className="mx-auto max-w-md"
              style={{ minHeight: cameraActive ? "300px" : "0" }}
            />

            {!cameraActive && (
              <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl border-4 border-dashed border-blue-300 flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">Ready to Scan</p>
                  <p className="text-sm text-gray-500">Click start to begin scanning</p>
                </div>
              </div>
            )}

            <Button
              onClick={toggleCamera}
              disabled={cameraPermission === "denied"}
              className="w-full py-4 text-lg"
            >
              {cameraActive ? "Stop Camera" : "Start Camera"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Ticket ID or Mint Address
              </label>
              <input
                type="text"
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleManualCheckIn()}
                placeholder="e.g., ticket-uuid or MINT_..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                disabled={isScanning}
              />
            </div>

            <Button
              onClick={handleManualCheckIn}
              disabled={isScanning || !ticketInput.trim()}
              className="w-full py-4 text-lg"
            >
              {isScanning ? "Processing..." : "Check In"}
            </Button>
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
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
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
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Check-ins</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {scanHistory.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  {entry.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {entry.name || entry.ticketId.substring(0, 20)}...
                    </p>
                    <p className="text-xs text-gray-500">{entry.timestamp.toLocaleTimeString()}</p>
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

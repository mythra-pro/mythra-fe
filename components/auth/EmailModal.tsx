"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, User, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    email: string;
    displayName: string;
    role: string;
  }) => void;
  walletAddress: string;
  isLoading?: boolean;
  error?: string | null;
}

const roleOptions = [
  {
    value: "organizer",
    label: "Organizer",
    description: "Create and manage events",
    icon: "🎭",
  },
  {
    value: "customer",
    label: "Customer",
    description: "Buy tickets and attend events",
    icon: "🎫",
  },
  {
    value: "investor",
    label: "Investor",
    description: "Fund campaigns and earn rewards",
    icon: "💎",
  },
  {
    value: "staff",
    label: "Staff",
    description: "Check-in and manage operations",
    icon: "👔",
  },
];

export function EmailModal({
  isOpen,
  onClose,
  onSubmit,
  walletAddress,
  isLoading = false,
  error = null,
}: EmailModalProps) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("customer");
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validateName = (name: string) => {
    if (!name || name.trim().length < 2) {
      setNameError("Display name must be at least 2 characters");
      return false;
    }
    if (name.trim().length > 50) {
      setNameError("Display name must be less than 50 characters");
      return false;
    }
    setNameError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isEmailValid = validateEmail(email);
    const isNameValid = validateName(displayName);

    if (isEmailValid && isNameValid) {
      onSubmit({
        email: email.trim().toLowerCase(),
        displayName: displayName.trim(),
        role,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-[#0077B6] to-[#0096C7] p-6 text-white relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Complete Registration</h2>
                    <p className="text-blue-100 text-sm">
                      Just a few more details...
                    </p>
                  </div>
                </div>
              </div>

              {/* Connected Wallet Info */}
              <div className="px-6 pt-4 pb-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center">
                    <span className="text-lg">🔗</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 mb-1">Connected Wallet</p>
                    <p className="text-sm font-mono text-gray-900 truncate">
                      {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Email Field */}
                <div>
                  <Label htmlFor="email" className="text-gray-700 mb-2 block font-semibold">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) validateEmail(e.target.value);
                      }}
                      onBlur={(e) => validateEmail(e.target.value)}
                      className={`pl-10 ${
                        emailError ? "border-red-500 focus:ring-red-500" : ""
                      }`}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  {emailError && (
                    <p className="text-red-500 text-sm mt-1">{emailError}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Required for account recovery and notifications
                  </p>
                </div>

                {/* Display Name Field */}
                <div>
                  <Label htmlFor="displayName" className="text-gray-700 mb-2 block font-semibold">
                    Display Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="John Doe"
                      value={displayName}
                      onChange={(e) => {
                        setDisplayName(e.target.value);
                        if (nameError) validateName(e.target.value);
                      }}
                      onBlur={(e) => validateName(e.target.value)}
                      className={`pl-10 ${
                        nameError ? "border-red-500 focus:ring-red-500" : ""
                      }`}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  {nameError && (
                    <p className="text-red-500 text-sm mt-1">{nameError}</p>
                  )}
                </div>

                {/* Role Selection */}
                <div>
                  <Label htmlFor="role" className="text-gray-700 mb-2 block font-semibold">
                    Select Your Role *
                  </Label>
                  <Select value={role} onValueChange={setRole} disabled={isLoading}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{option.icon}</span>
                            <div>
                              <p className="font-semibold">{option.label}</p>
                              <p className="text-xs text-gray-500">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !!emailError || !!nameError}
                  className="w-full bg-gradient-to-r from-[#0077B6] to-[#0096C7] hover:from-[#005f8f] hover:to-[#007ba8] text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Account...
                    </span>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By registering, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

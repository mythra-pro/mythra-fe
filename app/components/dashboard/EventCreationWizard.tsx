"use client";

import { useState } from "react";
import { CreateEventFormData } from "@/app/types/event";
import {
  Calendar,
  Ticket,
  DollarSign,
  Info,
  MapPin,
  Image,
} from "lucide-react";

interface EventCreationWizardProps {
  onSubmit: (data: CreateEventFormData) => void;
  onCancel: () => void;
}

export default function EventCreationWizard({
  onSubmit,
  onCancel,
}: EventCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreateEventFormData>({
    name: "",
    description: "",
    date: "",
    endDate: "",
    location: "",
    priceInSOL: 0,
    maxTickets: 0,
    category: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateEventFormData, string>>
  >({});

  const categories = [
    "Conference",
    "Workshop",
    "Concert",
    "Art",
    "Music",
    "Sports",
    "Networking",
    "Other",
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof CreateEventFormData, string>> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Event name is required";
      if (!formData.description.trim())
        newErrors.description = "Description is required";
      if (!formData.category) newErrors.category = "Category is required";
    }

    if (step === 2) {
      if (!formData.date) newErrors.date = "Event date is required";
      if (!formData.location.trim())
        newErrors.location = "Location is required";
    }

    if (step === 3) {
      if (formData.priceInSOL <= 0)
        newErrors.priceInSOL = "Price must be greater than 0";
      if (formData.maxTickets <= 0)
        newErrors.maxTickets = "Max tickets must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    if (validateStep(3)) {
      onSubmit(formData);
    }
  };

  const updateFormData = (field: keyof CreateEventFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const steps = [
    { number: 1, title: "Basic Info", icon: Info },
    { number: 2, title: "Date & Location", icon: Calendar },
    { number: 3, title: "Pricing & Tickets", icon: Ticket },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    currentStep >= step.number
                      ? "bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white"
                      : "bg-gray-200 text-gray-500"
                  } transition-all duration-300`}
                >
                  <step.icon className="text-xl" />
                </div>
                <span
                  className={`mt-2 text-sm font-medium ${
                    currentStep >= step.number
                      ? "text-gray-900"
                      : "text-gray-500"
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    currentStep > step.number
                      ? "bg-gradient-to-r from-[#9945FF] to-[#14F195]"
                      : "bg-gray-200"
                  } transition-all duration-300`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Basic Info */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Basic Information
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateFormData("name", e.target.value)}
              className={`w-full px-4 py-3 border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              placeholder="e.g., Web3 Summit 2025"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              rows={4}
              className={`w-full px-4 py-3 border ${
                errors.description ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              placeholder="Describe your event..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => updateFormData("category", e.target.value)}
              className={`w-full px-4 py-3 border ${
                errors.category ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Date & Location */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Date & Location
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline mr-2" />
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => updateFormData("date", e.target.value)}
              className={`w-full px-4 py-3 border ${
                errors.date ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline mr-2" />
              End Date & Time (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.endDate || ""}
              onChange={(e) => updateFormData("endDate", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline mr-2" />
              Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => updateFormData("location", e.target.value)}
              className={`w-full px-4 py-3 border ${
                errors.location ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              placeholder="e.g., Jakarta Convention Center or Online Event"
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Pricing & Tickets */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Pricing & Tickets
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline mr-2" />
              Price per Ticket (SOL) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.priceInSOL}
              onChange={(e) =>
                updateFormData("priceInSOL", parseFloat(e.target.value))
              }
              className={`w-full px-4 py-3 border ${
                errors.priceInSOL ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              placeholder="0.5"
            />
            {errors.priceInSOL && (
              <p className="text-red-500 text-sm mt-1">{errors.priceInSOL}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Ticket className="inline mr-2" />
              Maximum Tickets *
            </label>
            <input
              type="number"
              min="1"
              value={formData.maxTickets}
              onChange={(e) =>
                updateFormData("maxTickets", parseInt(e.target.value))
              }
              className={`w-full px-4 py-3 border ${
                errors.maxTickets ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              placeholder="100"
            />
            {errors.maxTickets && (
              <p className="text-red-500 text-sm mt-1">{errors.maxTickets}</p>
            )}
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-purple-50 to-green-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-4">Event Summary</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Name:</span> {formData.name}
              </p>
              <p>
                <span className="font-medium">Date:</span>{" "}
                {formData.date
                  ? new Date(formData.date).toLocaleString()
                  : "Not set"}
              </p>
              <p>
                <span className="font-medium">Location:</span>{" "}
                {formData.location || "Not set"}
              </p>
              <p>
                <span className="font-medium">Price:</span>{" "}
                {formData.priceInSOL} SOL
              </p>
              <p>
                <span className="font-medium">Max Tickets:</span>{" "}
                {formData.maxTickets}
              </p>
              <p className="pt-2 border-t border-gray-300">
                <span className="font-medium">Potential Revenue:</span>{" "}
                {(formData.priceInSOL * formData.maxTickets).toFixed(2)} SOL
              </p>
              <p className="text-xs text-gray-600">
                (Your payout:{" "}
                {(formData.priceInSOL * formData.maxTickets * 0.95).toFixed(2)}{" "}
                SOL after 5% platform fee)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={currentStep === 1 ? onCancel : handleBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {currentStep === 1 ? "Cancel" : "Back"}
        </button>

        {currentStep < 3 ? (
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white rounded-lg hover:shadow-lg transition-all"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white rounded-lg hover:shadow-lg transition-all font-bold"
          >
            Create Event & Mint NFT Tickets
          </button>
        )}
      </div>
    </div>
  );
}

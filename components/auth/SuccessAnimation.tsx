/**
 * Success Animation Component
 * Shows a celebratory animation on successful authentication
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface SuccessAnimationProps {
  isVisible: boolean;
  message?: string;
  onComplete?: () => void;
}

export function SuccessAnimation({
  isVisible,
  message = "Authentication Successful!",
  onComplete,
}: SuccessAnimationProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);

  useEffect(() => {
    if (isVisible) {
      // Generate confetti
      const newConfetti = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        color: ['#0077B6', '#0096C7', '#00B4D8', '#48CAE4', '#90E0EF'][
          Math.floor(Math.random() * 5)
        ],
      }));
      setConfetti(newConfetti);

      // Auto-complete after animation
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          {/* Confetti */}
          {confetti.map((piece) => (
            <motion.div
              key={piece.id}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: piece.color,
                left: `${piece.x}%`,
              }}
              initial={{ y: piece.y, opacity: 1, scale: 1 }}
              animate={{
                y: 120,
                opacity: 0,
                scale: 0,
                rotate: 360,
              }}
              transition={{
                duration: 2,
                delay: Math.random() * 0.5,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Success Card */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4"
          >
            {/* Checkmark Animation */}
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 10,
                  delay: 0.2,
                }}
                className="relative"
              >
                {/* Outer Circle */}
                <motion.div
                  className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(34, 197, 94, 0.4)",
                      "0 0 0 20px rgba(34, 197, 94, 0)",
                    ],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                >
                  {/* Checkmark */}
                  <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <Check className="h-12 w-12 text-green-600" strokeWidth={3} />
                  </motion.div>
                </motion.div>

                {/* Sparkles */}
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                </motion.div>
              </motion.div>
            </div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {message}
              </h2>
              <p className="text-gray-600">Redirecting to your dashboard...</p>
            </motion.div>

            {/* Loading Bar */}
            <motion.div
              className="mt-6 h-2 bg-gray-200 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-[#0077B6] to-[#0096C7]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, delay: 0.7 }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

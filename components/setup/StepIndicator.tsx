"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export default function StepIndicator({
  currentStep,
  totalSteps,
  stepTitles,
}: StepIndicatorProps) {
  const progressPercent =
    totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 0;

  const CIRCLE_HALF = 20; // w-10 = 40px, half = 20px

  return (
    <div className="w-full">
      {/* ================= Desktop ================= */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative flex items-start justify-between">

            {/* Base Line — circle center se circle center tak */}
            <div
              className="absolute h-[2px] bg-gradient-to-r from-[#F3F0FD] to-[#E8F5E0] rounded-full z-0"
              style={{
                top: `${CIRCLE_HALF}px`,
                left: `${CIRCLE_HALF}px`,
                right: `${CIRCLE_HALF}px`,
                transform: "translateY(-50%)",
              }}
            />

            {/* Active Line — exact proportional width between first & last circle */}
            <motion.div
              className="absolute h-[3px] bg-[#7dab4f] rounded-full z-0 shadow-md"
              style={{
                top: `${CIRCLE_HALF}px`,
                left: `${CIRCLE_HALF}px`,
                transform: "translateY(-50%)",
              }}
              initial={{ width: 0 }}
              animate={{
                width:
                  progressPercent === 0
                    ? "0%"
                    : `calc((100% - ${CIRCLE_HALF * 2}px) * ${progressPercent} / 100)`,
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />

            {/* Steps */}
            {stepTitles.map((title, index) => {
              const step = index + 1;
              const isCompleted = step < currentStep;
              const isCurrent = step === currentStep;

              return (
                <div
                  key={step}
                  className="relative z-10 flex flex-col items-center flex-1"
                >
                  <motion.div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      text-sm font-bold transition-all duration-300 shadow-lg
                      ${isCompleted
                        ? "bg-[#7dab4f] text-white shadow-[#7dab4f]/30"
                        : isCurrent
                          ? "bg-[#3d326d] text-white ring-4 ring-[#3d326d]/20 shadow-[#3d326d]/40"
                          : "bg-white border border-gray-300 text-gray-400"
                      }
                    `}
                    animate={{ scale: isCurrent ? 1.15 : 1 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : step}
                  </motion.div>

                  <motion.p
                    className={`mt-3 text-base text-center leading-tight
                      ${isCurrent
                        ? "text-[#3d326d] font-bold"
                        : isCompleted
                          ? "text-[#7dab4f] font-semibold"
                          : "text-gray-400 font-medium"
                      }
                    `}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {title}
                  </motion.p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= Mobile ================= */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <p className="font-bold text-[#3d326d] text-sm leading-tight">
              {stepTitles[currentStep - 1]}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
          <div className="flex items-center gap-1 ml-3">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${i + 1 <= currentStep
                    ? "bg-gradient-to-r from-[#3d326d] to-[#7dab4f] w-6"
                    : "bg-gray-300 w-2"   // ← w-2 explicitly add kiya
                  }`}
              />
            ))}
          </div>
        </div>

        <div className="w-full h-2.5 bg-gradient-to-r from-[#F3F0FD] to-[#E8F5E0] rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-[#3d326d] to-[#7dab4f] shadow-lg rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
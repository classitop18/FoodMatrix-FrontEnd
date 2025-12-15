"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
    stepTitles: string[];
}

export default function StepIndicator({ currentStep, totalSteps, stepTitles }: StepIndicatorProps) {
    return (
        <div className="w-full mb-6 sm:mb-8">
            {/* Desktop Step Indicator */}
            <div className="hidden md:flex items-center justify-between relative px-4">
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gradient-to-r from-[#F3F0FD] to-[#E8F5E0] mx-4">
                    <motion.div
                        className="h-full bg-gradient-to-r from-[#7661d3] to-[#7dab4f] shadow-lg"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                </div>

                {/* Step Circles */}
                {stepTitles.map((title, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;

                    return (
                        <div key={stepNumber} className="flex flex-col items-center relative z-10">
                            <motion.div
                                className={`
                                    w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm
                                    transition-all duration-300 shadow-lg
                                    ${isCompleted
                                        ? "bg-gradient-to-br from-[#7661d3] to-[#7dab4f] text-white shadow-[5px_5px_10px_rgba(118,97,211,0.3)]"
                                        : isCurrent
                                            ? "bg-gradient-to-br from-[#7661d3] to-[#3d326d] text-white ring-4 ring-[#7661d3]/20 shadow-[5px_5px_15px_rgba(118,97,211,0.4)]"
                                            : "bg-white border-2 border-gray-300 text-gray-400 shadow-sm"
                                    }
                                `}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: isCurrent ? 1.15 : 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <span>{stepNumber}</span>
                                )}
                            </motion.div>
                            <motion.p
                                className={`
                                    mt-3 text-xs font-semibold text-center max-w-[110px] leading-tight
                                    ${isCurrent
                                        ? "text-[#3d326d] font-bold"
                                        : isCompleted
                                            ? "text-[#7dab4f] font-semibold"
                                            : "text-gray-400"
                                    }
                                `}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                {title}
                            </motion.p>
                        </div>
                    );
                })}
            </div>

            {/* Mobile Step Indicator */}
            <div className="md:hidden">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base sm:text-lg font-bold text-[#3d326d]">{stepTitles[currentStep - 1]}</h3>
                    <span className="text-xs sm:text-sm px-3 py-1 rounded-full bg-gradient-to-r from-[#7661d3] to-[#7dab4f] text-white font-bold shadow-md">
                        {currentStep}/{totalSteps}
                    </span>
                </div>
                <div className="w-full h-2.5 bg-[#F3F0FD] rounded-full overflow-hidden shadow-inner">
                    <motion.div
                        className="h-full bg-gradient-to-r from-[#7661d3] to-[#7dab4f] rounded-full shadow-lg"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>
        </div>
    );
}

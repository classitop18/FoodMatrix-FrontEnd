import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StepIndicatorProps {
    step: number;
    active: boolean;
    isCompleted: boolean;
    label: string;
}

export const StepIndicator = ({ step, active, isCompleted, label }: StepIndicatorProps) => (
    <div className={cn(
        "flex items-center gap-3 transition-all duration-300 relative",
        active ? "text-[#313131]" : isCompleted ? "text-[var(--primary)]" : "text-gray-400"
    )}>
        <motion.div
            initial={false}
            animate={{
                scale: active ? 1.1 : 1,
                boxShadow: active ? "0 0 0 4px rgba(61, 50, 109, 0.15)" : "none"
            }}
            className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 relative z-10",
                active
                    ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg"
                    : isCompleted
                        ? "bg-[var(--primary-light)] text-white border-[var(--primary-light)] shadow-md"
                        : "bg-white text-gray-400 border-gray-200"
            )}
        >
            <motion.div
                initial={false}
                animate={{ scale: isCompleted ? 1 : 0, opacity: isCompleted ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center"
            >
                <Check className="w-5 h-5 text-white" strokeWidth={3} />
            </motion.div>

            <motion.span
                animate={{ scale: isCompleted ? 0 : 1, opacity: isCompleted ? 0 : 1 }}
                transition={{ duration: 0.2 }}
            >
                {step}
            </motion.span>
        </motion.div>

        <div className="flex flex-col">
            <span className={cn(
                "text-sm font-bold tracking-tight hidden sm:block",
                active ? "text-[#313131]" : isCompleted ? "text-[var(--primary)]" : "text-gray-500"
            )}>
                {label}
            </span>
            {active && (
                <motion.span
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-semibold text-[var(--primary-light)] uppercase tracking-widest hidden sm:block"
                >
                    In Progress
                </motion.span>
            )}
            {isCompleted && (
                <span className="text-[10px] font-semibold text-[var(--primary-light)] uppercase tracking-widest hidden sm:block">
                    Completed
                </span>
            )}
        </div>
    </div>
);

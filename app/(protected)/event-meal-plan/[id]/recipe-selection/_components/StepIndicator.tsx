"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
    step: number;
    active: boolean;
    isCompleted: boolean;
    label: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
    step,
    active,
    isCompleted,
    label
}) => {
    return (
        <div className="flex items-center gap-2">
            <div
                className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                    active
                        ? "bg-[var(--primary)] text-white shadow-lg shadow-indigo-200"
                        : isCompleted
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-500"
                )}
            >
                {isCompleted ? (
                    <Check className="w-4 h-4" />
                ) : (
                    step
                )}
            </div>
            <span
                className={cn(
                    "text-sm font-medium transition-colors",
                    active ? "text-gray-900" : "text-gray-500"
                )}
            >
                {label}
            </span>
        </div>
    );
};

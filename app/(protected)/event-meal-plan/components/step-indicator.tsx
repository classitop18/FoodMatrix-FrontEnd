"use client";

import React, { memo } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepIndicatorProps } from "../types/event.types";

const StepIndicatorComponent: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
    return (
        <div className="flex flex-col gap-0.5">
            {steps.map((step, index) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;

                return (
                    <React.Fragment key={step.id}>
                        <div className={cn(
                            "flex items-center gap-4 rounded-xl p-3 px-4 transition-all duration-300",
                            isCurrent ? "bg-indigo-50/50" : "hover:bg-gray-50"
                        )}>
                            {/* Step Circle */}
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 shadow-sm border",
                                    isCompleted
                                        ? "bg-emerald-500 border-emerald-500 text-white"
                                        : isCurrent
                                            ? "bg-indigo-600 border-indigo-600 text-white scale-110 shadow-indigo-200"
                                            : "bg-white border-gray-200 text-gray-400"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5 font-bold" />
                                ) : (
                                    <step.icon className="w-4 h-4" />
                                )}
                            </div>

                            {/* Step Info */}
                            <div className="flex-1 min-w-0">
                                <span
                                    className={cn(
                                        "text-sm font-bold block transition-colors",
                                        isCurrent
                                            ? "text-indigo-900"
                                            : isCompleted
                                                ? "text-gray-900"
                                                : "text-gray-500"
                                    )}
                                >
                                    {step.title}
                                </span>
                                {step.description && (
                                    <span className={cn(
                                        "text-[10px] font-medium uppercase tracking-wider block mt-0.5",
                                        isCurrent ? "text-indigo-500" : "text-gray-400"
                                    )}>
                                        {step.description}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div className="ml-9 h-6 w-px bg-gray-100 relative">
                                <div
                                    className={cn(
                                        "absolute top-0 left-0 w-full bg-emerald-500 transition-all duration-500",
                                        isCompleted ? "h-full" : "h-0"
                                    )}
                                />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export const StepIndicator = memo(StepIndicatorComponent);

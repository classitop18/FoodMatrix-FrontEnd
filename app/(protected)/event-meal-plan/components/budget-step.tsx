"use client";

import React, { memo, useCallback } from "react";
import { Wallet, Check, TrendingUp, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { BudgetStepProps } from "../types/event.types";

const BudgetStepComponent: React.FC<BudgetStepProps> = ({ formData, onUpdate }) => {
    const handleBudgetAmountChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onUpdate("budgetAmount", e.target.value);
        },
        [onUpdate]
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">Budget Setup</h2>
                <p className="text-gray-500 font-medium">Choose how you wish to allocate funds for this event.</p>
            </div>

            {/* Budget Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Separate Budget Option */}
                <button
                    type="button"
                    onClick={() => onUpdate("budgetType", "separate")}
                    className={cn(
                        "relative p-6 rounded-2xl border-2 text-left transition-all duration-200 group overflow-hidden",
                        formData.budgetType === "separate"
                            ? "border-indigo-600 bg-indigo-50 shadow-xl shadow-indigo-100"
                            : "border-gray-100 bg-white hover:border-indigo-200 hover:shadow-lg hover:-translate-y-1"
                    )}
                >
                    <div className="relative z-10 flex items-start gap-4">
                        <div
                            className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-inner",
                                formData.budgetType === "separate"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-50 text-indigo-600 group-hover:bg-indigo-50"
                            )}
                        >
                            <Wallet className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <h3 className={cn(
                                "text-lg font-bold mb-1 transition-colors",
                                formData.budgetType === "separate" ? "text-indigo-900" : "text-gray-900"
                            )}>Separate Budget</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Set a specific budget strictly for this event. Perfect for improved tracking.
                            </p>
                        </div>
                        {formData.budgetType === "separate" && (
                            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg transform scale-110">
                                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                            </div>
                        )}
                    </div>
                </button>

                {/* Weekly Budget Option */}
                <button
                    type="button"
                    onClick={() => onUpdate("budgetType", "weekly")}
                    className={cn(
                        "relative p-6 rounded-2xl border-2 text-left transition-all duration-200 group overflow-hidden",
                        formData.budgetType === "weekly"
                            ? "border-indigo-600 bg-indigo-50 shadow-xl shadow-indigo-100"
                            : "border-gray-100 bg-white hover:border-indigo-200 hover:shadow-lg hover:-translate-y-1"
                    )}
                >
                    <div className="relative z-10 flex items-start gap-4">
                        <div
                            className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-inner",
                                formData.budgetType === "weekly"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-50 text-indigo-600 group-hover:bg-indigo-50"
                            )}
                        >
                            <TrendingUp className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <h3 className={cn(
                                "text-lg font-bold mb-1 transition-colors",
                                formData.budgetType === "weekly" ? "text-indigo-900" : "text-gray-900"
                            )}>Weekly Allowance</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Use your existing weekly food budget. Expenses will be deducted automatically.
                            </p>
                        </div>
                        {formData.budgetType === "weekly" && (
                            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg transform scale-110">
                                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                            </div>
                        )}
                    </div>
                </button>
            </div>

            {/* Budget Amount (for separate budget) */}
            {formData.budgetType === "separate" && (
                <div className="space-y-3 pt-4 animate-in fade-in slide-in-from-top-2">
                    <Label htmlFor="budgetAmount" className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <DollarSign className="w-3 h-3" />
                        Event Budget Amount <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                        <Input
                            id="budgetAmount"
                            type="number"
                            placeholder="e.g. 5000"
                            value={formData.budgetAmount}
                            onChange={handleBudgetAmountChange}
                            className="h-16 pl-12 text-xl font-bold rounded-xl border-2 border-gray-200 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-300"
                        />
                    </div>
                    <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                        <span>This helps us recommend recipes that fit your spending limit.</span>
                    </p>
                </div>
            )}

            {formData.budgetType === "weekly" && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mt-6 animate-in fade-in slide-in-from-top-2">
                    <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <DollarSign className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-amber-900 mb-1">Weekly Budget Impact</h4>
                            <p className="text-sm text-amber-700 leading-relaxed">
                                Expenses for this event will be categorized under your general grocery/food spending.
                                Be mindful that larger events might offset your weekly tracking stats.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const BudgetStep = memo(BudgetStepComponent);

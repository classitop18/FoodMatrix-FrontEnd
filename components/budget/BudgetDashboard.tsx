"use client";

import {
    Wallet,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Plus,
    Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TodayBudgetSummary } from "@/services/budget/types/budget.types";

interface BudgetDashboardProps {
    todayBudget: TodayBudgetSummary | null;
    isLoading: boolean;
    onSetupClick: () => void;
    onLogExpenseClick: () => void;
    hasPendingUpdates?: boolean;
}

export function BudgetDashboard({
    todayBudget,
    isLoading,
    onSetupClick,
    onLogExpenseClick,
    hasPendingUpdates = false,
}: BudgetDashboardProps) {
    const hasConfig = todayBudget?.configId;
    const hasBudget = todayBudget && todayBudget.allocatedAmount > 0;
    const usagePercent =
        todayBudget && todayBudget.allocatedAmount > 0
            ? Math.min(
                (todayBudget.amountSpent / todayBudget.allocatedAmount) * 100,
                150,
            )
            : 0;
    const isOverBudget = (todayBudget?.balance ?? 0) < 0;

    // Progress ring
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const displayPercent = Math.min(usagePercent, 100);
    const strokeDashoffset =
        circumference - (displayPercent / 100) * circumference;

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
                <div className="h-20 bg-gray-100 rounded-xl mb-4" />
                <div className="h-10 bg-gray-100 rounded-xl" />
            </div>
        );
    }

    // No budget configured yet
    if (!hasConfig && !hasBudget) {
        return (
            <div className="bg-gradient-to-br from-[#3d326d] to-[#7661d3] rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8" />

                <div className="relative z-10 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
                        <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Set Up Your Budget</h2>
                    <p className="text-white/60 text-sm mb-6 max-w-xs mx-auto">
                        Configure your daily budget or set a total amount for the upcoming week.
                        If you miss a day, the previous day's budget carries forward automatically.
                    </p>
                    <Button
                        onClick={onSetupClick}
                        className={`font-bold px-6 h-11 rounded-xl bg-white text-[#3d326d] hover:bg-white/90`}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Set Daily/Weekly Budget
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-lg font-bold text-[#313131] flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-[#7661d3]" />
                        Today's Budget
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}
                    </p>
                </div>
                <button
                    onClick={onSetupClick}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors bg-[#F3F0FD] text-[#7661d3] hover:bg-[#e6e0f9] cursor-pointer`}
                >
                    + Daily/Weekly Budget
                </button>
            </div>

            {/* Fallback Indicator */}
            {todayBudget?.isFallback && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl mb-4">
                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <p className="text-xs font-medium text-blue-600">
                        No budget set for today. Using budget from{" "}
                        <span className="font-bold">
                            {todayBudget.fallbackFromDate
                                ? new Date(
                                    todayBudget.fallbackFromDate,
                                ).toLocaleDateString("en-US", {
                                    day: "numeric",
                                    month: "short",
                                })
                                : "previous date"}
                        </span>
                    </p>
                </div>
            )}

            {/* Main Stats with Progress Ring */}
            <div className="flex items-center gap-6 mb-5">
                <div className="relative flex-shrink-0">
                    <svg
                        width="120"
                        height="120"
                        viewBox="0 0 120 120"
                        className="transform -rotate-90"
                    >
                        <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke="#f3f0fd"
                            strokeWidth="8"
                        />
                        <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke={isOverBudget ? "#ef4444" : "#7661d3"}
                            strokeWidth="8"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-700 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span
                            className={`text-2xl font-extrabold ${isOverBudget ? "text-red-500" : "text-[#313131]"}`}
                        >
                            {usagePercent.toFixed(0)}%
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                            used
                        </span>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Groceries Section */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-gradient-to-br from-[#F3F0FD] to-white rounded-xl p-3 border border-[#7661d3]/20">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                                Groceries Budget
                            </p>
                            <p className="text-xl font-extrabold text-[#7661d3]">
                                ${(todayBudget?.allocatedAmount ?? 0).toFixed(2)}
                            </p>
                        </div>
                        <div className={`rounded-xl p-3 border ${isOverBudget ? "bg-gradient-to-br from-red-50 to-white border-red-100" : "bg-gradient-to-br from-[#e8f5e0] to-white border-[#7dab4f]/20"}`}>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                                Groceries Spent
                            </p>
                            <div className="flex items-center gap-1.5">
                                <p className={`text-xl font-extrabold ${isOverBudget ? "text-red-500" : "text-[#7dab4f]"}`}>
                                    ${(todayBudget?.amountSpent ?? 0).toFixed(2)}
                                </p>
                                {isOverBudget ? (
                                    <TrendingUp className="w-4 h-4 text-red-500" />
                                ) : (
                                    <TrendingDown className="w-4 h-4 text-[#7dab4f]" />
                                )}
                            </div>
                        </div>
                        <div className={`rounded-xl p-3 ${isOverBudget ? "bg-gradient-to-br from-red-600 to-red-700 shadow-md shadow-red-500/20" : "bg-gradient-to-br from-[#3d326d] to-[#2d2454] shadow-md shadow-[#3d326d]/20"}`}>
                            <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider mb-1">
                                {isOverBudget ? "Groceries Over" : "Groceries Remaining"}
                            </p>
                            <p className="text-xl font-extrabold text-white">
                                {isOverBudget ? "-" : ""}$
                                {Math.abs(todayBudget?.balance ?? 0).toFixed(2)}
                            </p>
                        </div>
                    </div>

                    {/* Secondary Budgets Section */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white rounded-xl p-3 border border-orange-200/50 shadow-sm flex-1 flex flex-col justify-center hover:border-orange-300 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                    Dining Budget
                                </p>
                                <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                                    {todayBudget?.diningPercentage ?? 0}%
                                </span>
                            </div>
                            <p className="text-xl font-extrabold text-orange-500">
                                ${(todayBudget?.diningBudgetOffset ?? 0).toFixed(2)}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1 font-medium">
                                of ${(todayBudget?.totalBudgetAmount ?? 0).toFixed(2)} Total
                            </p>
                        </div>
                        
                        <div className="bg-white rounded-xl p-3 border border-yellow-200/50 shadow-sm flex-1 flex flex-col justify-center hover:border-yellow-300 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                    Emergency Budget
                                </p>
                                <span className="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                                    {todayBudget?.emergencyPercentage ?? 0}%
                                </span>
                            </div>
                            <p className="text-xl font-extrabold text-yellow-600">
                                ${(todayBudget?.emergencyBudgetOffset ?? 0).toFixed(2)}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1 font-medium">
                                of ${(todayBudget?.totalBudgetAmount ?? 0).toFixed(2)} Total
                            </p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 flex items-center justify-between mt-auto">
                            <p className="text-[10px] text-gray-400 font-medium">
                                All spending is tracked against the Groceries Budget.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Action */}
            <Button
                onClick={onLogExpenseClick}
                disabled={hasPendingUpdates}
                className={`w-full h-11 font-bold rounded-xl text-sm flex items-center gap-2 ${hasPendingUpdates
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed opacity-70"
                    : "bg-[#313131] hover:bg-black text-white"
                    }`}
            >
                <DollarSign className="w-4 h-4" />
                {hasPendingUpdates
                    ? "Pending Updates Block Access"
                    : todayBudget?.hasExpenseLogged
                        ? "Update Today's Spending"
                        : "Log Today's Spending"}
            </Button>
        </div>
    );
}

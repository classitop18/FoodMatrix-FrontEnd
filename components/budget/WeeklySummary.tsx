"use client";

import { CalendarDays, IndianRupee, Info } from "lucide-react";
import type { WeeklySummary as WeeklySummaryType } from "@/services/budget/types/budget.types";

interface WeeklySummaryProps {
    data: WeeklySummaryType | null;
    isLoading: boolean;
}

export function WeeklySummary({ data, isLoading }: WeeklySummaryProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse" />
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-28 bg-gray-50 rounded-xl animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.days.every((d) => !d.hasBudget && !d.isFallback)) {
        return null;
    }

    const isOverBudgetWeek = data.totalBalance < 0;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-lg font-bold text-[#313131] flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-[#7661d3]" />
                        This Week
                    </h2>
                    <p className="text-xs text-gray-400">
                        {new Date(data.weekStart).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                        })}{" "}
                        –{" "}
                        {new Date(data.weekEnd).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                        })}
                    </p>
                </div>

                {/* Week Totals */}
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                            Budget
                        </p>
                        <p className="text-sm font-extrabold text-[#7661d3]">
                            ₹{data.totalBudget.toFixed(0)}
                        </p>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                            Spent
                        </p>
                        <p className="text-sm font-extrabold text-[#7dab4f]">
                            ₹{data.totalSpent.toFixed(0)}
                        </p>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                            {isOverBudgetWeek ? "Over" : "Left"}
                        </p>
                        <p
                            className={`text-sm font-extrabold ${isOverBudgetWeek ? "text-red-500" : "text-[#313131]"}`}
                        >
                            {isOverBudgetWeek ? "-" : ""}₹
                            {Math.abs(data.totalBalance).toFixed(0)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
                {data.days.map((day) => {
                    const isToday =
                        new Date(day.date).toDateString() ===
                        new Date().toDateString();
                    const isFuture = new Date(day.date) > new Date();
                    const dayOverBudget = day.balance < 0 && day.hasExpense;
                    const hasBudgetData = day.hasBudget || day.isFallback;

                    return (
                        <div
                            key={day.date}
                            className={`rounded-xl p-3 text-center transition-all ${isToday
                                    ? "bg-[#F3F0FD] border-2 border-[#7661d3]/30 ring-2 ring-[#7661d3]/10"
                                    : isFuture
                                        ? "bg-gray-50/50 border border-dashed border-gray-200"
                                        : "bg-gray-50 border border-gray-100"
                                }`}
                        >
                            {/* Day Name */}
                            <p
                                className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isToday ? "text-[#7661d3]" : "text-gray-400"
                                    }`}
                            >
                                {day.dayName}
                            </p>

                            {/* Date */}
                            <p
                                className={`text-xs font-bold mb-2 ${isToday ? "text-[#7661d3]" : "text-gray-500"
                                    }`}
                            >
                                {new Date(day.date).getDate()}
                            </p>

                            {hasBudgetData && !isFuture ? (
                                <>
                                    {/* Budget */}
                                    <p className="text-[10px] text-gray-400 font-medium">
                                        Budget
                                    </p>
                                    <p
                                        className={`text-xs font-bold mb-1 ${day.isFallback ? "text-blue-500" : "text-[#7661d3]"}`}
                                    >
                                        ₹{day.allocatedAmount.toFixed(0)}
                                    </p>

                                    {/* Spent */}
                                    <p className="text-[10px] text-gray-400 font-medium">
                                        Spent
                                    </p>
                                    <p
                                        className={`text-xs font-bold ${day.hasExpense
                                                ? dayOverBudget
                                                    ? "text-red-500"
                                                    : "text-[#7dab4f]"
                                                : "text-gray-300"
                                            }`}
                                    >
                                        {day.hasExpense
                                            ? `₹${day.amountSpent.toFixed(0)}`
                                            : "—"}
                                    </p>

                                    {/* Fallback indicator */}
                                    {day.isFallback && (
                                        <div className="mt-1" title="Using previous day's budget">
                                            <Info className="w-3 h-3 text-blue-400 mx-auto" />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-[10px] text-gray-300 mt-2">
                                    {isFuture ? "Future" : "No data"}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

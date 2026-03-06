"use client";

import { CalendarDays, IndianRupee, FileText } from "lucide-react";
import type { DailyBudgetWithExpense } from "@/services/budget/types/budget.types";

interface BudgetHistoryProps {
    data: DailyBudgetWithExpense[];
    total: number;
    isLoading: boolean;
    page: number;
    limit: number;
    onPageChange: (page: number) => void;
}

export function BudgetHistory({
    data,
    total,
    isLoading,
    page,
    limit,
    onPageChange,
}: BudgetHistoryProps) {
    const totalPages = Math.ceil(total / limit);

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse" />
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-14 bg-gray-50 rounded-xl mb-2 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-lg font-bold text-[#313131] flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-[#7661d3]" />
                        Spending History
                    </h2>
                    <p className="text-xs text-gray-400">
                        {total} entries total
                    </p>
                </div>
            </div>

            {/* Table */}
            {data.length === 0 ? (
                <div className="py-12 text-center">
                    <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-400">
                        No budget history yet
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                        Start logging expenses to build your history
                    </p>
                </div>
            ) : (
                <>
                    {/* Table Header */}
                    <div className="grid grid-cols-4 gap-3 px-3 py-2 border-b border-gray-100 mb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Date
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">
                            Budget
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">
                            Spent
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">
                            Balance
                        </span>
                    </div>

                    {/* Table Rows */}
                    <div className="space-y-1">
                        {data.map((entry) => {
                            const isOverBudget = entry.balance < 0;
                            const hasExpense = entry.amountSpent !== null;
                            const isToday =
                                new Date(entry.date).toDateString() ===
                                new Date().toDateString();

                            return (
                                <div
                                    key={entry.id}
                                    className={`grid grid-cols-4 gap-3 px-3 py-3 rounded-xl transition-colors ${isToday
                                            ? "bg-[#F3F0FD] border border-[#7661d3]/20"
                                            : "bg-gray-50 hover:bg-gray-100"
                                        }`}
                                >
                                    {/* Date */}
                                    <div>
                                        <p className="text-sm font-bold text-[#313131]">
                                            {new Date(entry.date).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                            })}
                                        </p>
                                        <p className="text-[10px] text-gray-400">
                                            {new Date(entry.date).toLocaleDateString("en-IN", {
                                                weekday: "short",
                                            })}
                                            {isToday && (
                                                <span className="ml-1 text-[#7661d3] font-bold">
                                                    Today
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Budget */}
                                    <p className="text-sm font-bold text-[#7661d3] text-right self-center">
                                        ₹{parseFloat(entry.allocatedAmount).toFixed(0)}
                                    </p>

                                    {/* Spent */}
                                    <p
                                        className={`text-sm font-bold text-right self-center ${hasExpense
                                                ? isOverBudget
                                                    ? "text-red-500"
                                                    : "text-[#7dab4f]"
                                                : "text-gray-300"
                                            }`}
                                    >
                                        {hasExpense
                                            ? `₹${parseFloat(entry.amountSpent!).toFixed(0)}`
                                            : "—"}
                                    </p>

                                    {/* Balance */}
                                    <div className="text-right self-center">
                                        {hasExpense ? (
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${isOverBudget
                                                        ? "bg-red-100 text-red-600"
                                                        : "bg-green-100 text-green-600"
                                                    }`}
                                            >
                                                {isOverBudget ? "-" : "+"}₹
                                                {Math.abs(entry.balance).toFixed(0)}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-300">—</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => onPageChange(page - 1)}
                                disabled={page <= 1}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 disabled:opacity-30 hover:bg-gray-200 transition-colors disabled:cursor-not-allowed cursor-pointer"
                            >
                                Previous
                            </button>
                            <span className="text-xs font-semibold text-gray-500">
                                {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => onPageChange(page + 1)}
                                disabled={page >= totalPages}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 disabled:opacity-30 hover:bg-gray-200 transition-colors disabled:cursor-not-allowed cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

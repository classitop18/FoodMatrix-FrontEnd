"use client";

import { useState } from "react";
import { CalendarDays, DollarSign, FileText, Eye } from "lucide-react";
import type { DailyBudgetWithExpense } from "@/services/budget/types/budget.types";
import { SpentDetailSheet } from "./SpentDetailSheet";

interface BudgetHistoryProps {
    data: DailyBudgetWithExpense[];
    total: number;
    isLoading: boolean;
    page: number;
    limit: number;
    onPageChange: (page: number) => void;
    accountId: string;
}

export function BudgetHistory({
    data,
    total,
    isLoading,
    page,
    limit,
    onPageChange,
    accountId,
}: BudgetHistoryProps) {
    const totalPages = Math.ceil(total / limit);
    const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

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
                    <div className="grid grid-cols-5 gap-3 px-3 py-2 border-b border-gray-100 mb-2">
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
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
                            Details
                        </span>
                    </div>

                    {/* Table Rows */}
                    <div className="space-y-1">
                        {data.map((entry) => {
                            const isOverBudget = entry.balance < 0;
                            const hasExpense = entry.amountSpent !== null;
                            const dateObj = new Date(entry.date);
                            const isToday =
                                dateObj.toLocaleDateString("en-US", { timeZone: "UTC" }) ===
                                new Date().toLocaleDateString("en-US", { timeZone: "UTC" }); // Or local? Today is relative to local, but budget dates are midnight UTC.
                            // To be absolutely safe, we extract the YYYY-MM-DD string
                            const dateString = typeof entry.date === 'string' && entry.date.includes('T') ? entry.date.split('T')[0] : entry.date;
                            const localDateObj = new Date(dateString + "T00:00:00");
                            const isTodaySafe = localDateObj.toDateString() === new Date().toDateString();

                            return (
                                <div
                                    key={entry.id}
                                    className={`grid grid-cols-5 gap-3 px-3 py-3 rounded-xl transition-colors ${isTodaySafe
                                        ? "bg-[#F3F0FD] border border-[#7661d3]/20"
                                        : "bg-gray-50 hover:bg-gray-100"
                                        }`}
                                >
                                    {/* Date */}
                                    <div>
                                        <p className="text-sm font-bold text-[#313131]">
                                            {localDateObj.toLocaleDateString("en-US", {
                                                day: "numeric",
                                                month: "short",
                                            })}
                                        </p>
                                        <p className="text-[10px] text-gray-400">
                                            {localDateObj.toLocaleDateString("en-US", {
                                                weekday: "short",
                                            })}
                                            {isTodaySafe && (
                                                <span className="ml-1 text-[#7661d3] font-bold">
                                                    Today
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Budget */}
                                    <p className="text-sm font-bold text-[#7661d3] text-right self-center">
                                        ${parseFloat(entry.allocatedAmount).toFixed(0)}
                                    </p>

                                    {/* Spent — clickable */}
                                    <button
                                        onClick={() => {
                                            if (hasExpense) {
                                                setSelectedBudgetId(entry.id);
                                                setSheetOpen(true);
                                            }
                                        }}
                                        className={`text-sm font-bold text-right self-center transition-colors ${hasExpense
                                            ? isOverBudget
                                                ? "text-red-500 hover:underline cursor-pointer"
                                                : "text-[#7dab4f] hover:underline cursor-pointer"
                                            : "text-gray-300 cursor-default"
                                            }`}
                                        disabled={!hasExpense}
                                    >
                                        {hasExpense
                                            ? `$${parseFloat(entry.amountSpent!).toFixed(0)}`
                                            : "—"}
                                    </button>

                                    {/* Balance */}
                                    <div className="text-right self-center">
                                        {hasExpense ? (
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${isOverBudget
                                                    ? "bg-red-100 text-red-600"
                                                    : "bg-green-100 text-green-600"
                                                    }`}
                                            >
                                                {isOverBudget ? "-" : "+"}$
                                                {Math.abs(entry.balance).toFixed(0)}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-300">—</span>
                                        )}
                                    </div>

                                    {/* View Details Button */}
                                    <div className="flex justify-center self-center">
                                        {hasExpense ? (
                                            <button
                                                onClick={() => {
                                                    setSelectedBudgetId(entry.id);
                                                    setSheetOpen(true);
                                                }}
                                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#F3F0FD] text-[#7661d3] hover:bg-[#e6e0f9] transition-colors"
                                                title="View spending details"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
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

            {/* Spent Detail Sheet */}
            <SpentDetailSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                accountId={accountId}
                dailyBudgetId={selectedBudgetId}
            />
        </div>
    );
}

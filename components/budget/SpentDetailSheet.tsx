"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Store,
    Receipt,
    Calendar,
    FileText,
    Loader2,
    ShoppingBag,
    Tag,
} from "lucide-react";
import { useExpenseDetailsQuery } from "@/services/budget/budget.query";

interface SpentDetailSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accountId: string;
    dailyBudgetId: string | null;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    food: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
    snacks: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    beverages: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
    dairy: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    produce: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
    meat: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
    bakery: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
    spices: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    frozen: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
};

function getCategoryStyle(category: string) {
    return CATEGORY_COLORS[category] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
}

export function SpentDetailSheet({
    open,
    onOpenChange,
    accountId,
    dailyBudgetId,
}: SpentDetailSheetProps) {
    const { data, isLoading } = useExpenseDetailsQuery(accountId, open ? dailyBudgetId : null);

    const dateStr = data?.date
        ? format(new Date(data.date), "EEEE, dd MMM yyyy")
        : "";

    const allocatedAmount = parseFloat(data?.allocatedAmount || "0");
    const amountSpent = parseFloat(data?.amountSpent || "0");
    const balance = data?.balance ?? 0;
    const isOverBudget = balance < 0;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-[520px] p-0 bg-[#fafafa] border-l border-gray-100 overflow-y-auto"
            >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-br from-[#3d326d] to-[#7661d3] px-6 pt-8 pb-6 text-white">
                    <SheetHeader className="mb-4">
                        <SheetTitle className="text-white text-xl font-extrabold flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                                <Receipt className="w-5 h-5" />
                            </div>
                            Spending Details
                        </SheetTitle>
                    </SheetHeader>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-6 h-6 animate-spin text-white/60" />
                        </div>
                    ) : data ? (
                        <>
                            <p className="text-white/60 text-sm font-medium flex items-center gap-1.5 mb-4">
                                <Calendar className="w-3.5 h-3.5" />
                                {dateStr}
                            </p>

                            {/* Summary stats */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Budget</p>
                                    <p className="text-lg font-extrabold">${allocatedAmount.toFixed(2)}</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Spent</p>
                                    <p className={`text-lg font-extrabold ${isOverBudget ? "text-red-300" : "text-emerald-300"}`}>
                                        ${amountSpent.toFixed(2)}
                                    </p>
                                </div>
                                <div className={`rounded-xl p-3 ${isOverBudget ? "bg-red-500/20" : "bg-emerald-500/20"}`}>
                                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
                                        {isOverBudget ? "Over" : "Left"}
                                    </p>
                                    <p className="text-lg font-extrabold">
                                        {isOverBudget ? "-" : ""}${Math.abs(balance).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="w-8 h-8 animate-spin text-[#7661d3]/40 mb-3" />
                            <p className="text-sm text-gray-400 font-medium">Loading details...</p>
                        </div>
                    ) : !data || data.receiptExpenses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-sm font-bold text-gray-400 mb-1">No receipt expenses linked</p>
                            <p className="text-xs text-gray-300 text-center max-w-[260px]">
                                Use the "Update Budget" button on a receipt card to link spending to this day.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-[#313131]">
                                    Linked Receipts ({data.receiptExpenses.length})
                                </h3>
                            </div>

                            {data.receiptExpenses.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] overflow-hidden"
                                >
                                    {/* Receipt header */}
                                    <div className="flex items-center justify-between p-4 border-b border-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F3F0FD] to-[#e6e0f9] flex items-center justify-center">
                                                <Store className="w-5 h-5 text-[#7661d3]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[#313131]">
                                                    {entry.storeName || "Unknown Store"}
                                                </p>
                                                <p className="text-[11px] text-gray-400 font-medium">
                                                    {entry.linkedAt
                                                        ? format(new Date(entry.linkedAt), "dd MMM yyyy, hh:mm a")
                                                        : "—"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-extrabold text-[#313131]">
                                                ${parseFloat(entry.amount).toFixed(2)}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">
                                                {entry.itemsSnapshot.length} items
                                            </p>
                                        </div>
                                    </div>

                                    {/* Note */}
                                    {entry.note && (
                                        <div className="px-4 py-2.5 bg-[#F3F0FD]/30 border-b border-gray-50">
                                            <p className="text-xs text-[#7661d3] font-medium italic">
                                                "{entry.note}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Items table */}
                                    {entry.itemsSnapshot.length > 0 && (
                                        <div className="p-4">
                                            {/* Table header */}
                                            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-2 pb-2 border-b border-gray-100 mb-1">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                                                    Item
                                                </span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider text-center">
                                                    Qty
                                                </span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider text-center">
                                                    Category
                                                </span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider text-right">
                                                    Price
                                                </span>
                                            </div>

                                            {/* Table rows */}
                                            <div className="space-y-0.5">
                                                {entry.itemsSnapshot.map((item, idx) => {
                                                    const catStyle = getCategoryStyle(item.category);
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors items-center"
                                                        >
                                                            <div className="min-w-0">
                                                                <p className="text-[13px] font-semibold text-[#313131] truncate">
                                                                    {item.name}
                                                                </p>
                                                                {item.brand && (
                                                                    <p className="text-[10px] text-gray-400 truncate">
                                                                        {item.brand}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <span className="text-[12px] font-semibold text-gray-500 text-center min-w-[36px]">
                                                                {item.quantity} {item.unit}
                                                            </span>
                                                            <span
                                                                className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${catStyle.bg} ${catStyle.text} ${catStyle.border} text-center min-w-[50px]`}
                                                            >
                                                                {item.category}
                                                            </span>
                                                            <span className="text-[13px] font-bold text-[#313131] text-right min-w-[50px]">
                                                                ${Number(item.price).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

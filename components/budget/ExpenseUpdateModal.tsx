"use client";

import { useState, useEffect } from "react";
import { X, IndianRupee, CalendarDays, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogExpenseMutation } from "@/services/budget/budget.mutation";
import { useToast } from "@/hooks/use-toast";

interface ExpenseUpdateModalProps {
    open: boolean;
    onClose: () => void;
    accountId: string;
    prefillDate?: string;
    prefillBudget?: number;
}

export function ExpenseUpdateModal({
    open,
    onClose,
    accountId,
    prefillDate,
    prefillBudget,
}: ExpenseUpdateModalProps) {
    const today = new Date().toISOString().split("T")[0];
    const [date, setDate] = useState(prefillDate || today);
    const [amountSpent, setAmountSpent] = useState("");
    const [notes, setNotes] = useState("");

    const logExpenseMutation = useLogExpenseMutation();
    const { toast } = useToast();

    useEffect(() => {
        if (prefillDate) setDate(prefillDate);
    }, [prefillDate]);

    const handleSubmit = async () => {
        const parsedAmount = parseFloat(amountSpent);
        if (isNaN(parsedAmount) || parsedAmount < 0) {
            toast({
                title: "Invalid Amount",
                description: "Please enter a valid amount",
                variant: "destructive",
            });
            return;
        }

        try {
            const result = await logExpenseMutation.mutateAsync({
                accountId,
                payload: {
                    date: new Date(date).toISOString(),
                    amountSpent: parsedAmount,
                    notes: notes || undefined,
                },
            });

            toast({
                title: result.isOverBudget
                    ? "⚠ Over Budget!"
                    : "✅ Expense Logged",
                description: result.isOverBudget
                    ? `You overspent by ₹${Math.abs(result.balance).toFixed(2)}`
                    : `₹${result.balance.toFixed(2)} remaining for this day`,
                variant: result.isOverBudget ? "destructive" : "default",
            });

            setAmountSpent("");
            setNotes("");
            onClose();
        } catch (error: any) {
            toast({
                title: "Error",
                description:
                    error?.response?.data?.message || "Failed to log expense",
                variant: "destructive",
            });
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-scale-in overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#7dab4f] to-[#5a8636] p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <IndianRupee className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">
                                    Log Daily Spending
                                </h2>
                                <p className="text-xs text-white/60">
                                    Record today's expenses
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                    {/* Date Picker */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                            <CalendarDays className="w-3.5 h-3.5 inline mr-1.5" />
                            Date
                        </label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            max={today}
                            className="rounded-xl border-gray-200 h-11"
                        />
                    </div>

                    {/* Budget Reference */}
                    {prefillBudget !== undefined && prefillBudget > 0 && (
                        <div className="bg-[#F3F0FD] rounded-xl px-4 py-3 flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500">
                                Day's Budget
                            </span>
                            <span className="text-sm font-bold text-[#7661d3]">
                                ₹{prefillBudget.toFixed(2)}
                            </span>
                        </div>
                    )}

                    {/* Amount Input */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                            Amount Spent
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-[#7dab4f]">
                                ₹
                            </span>
                            <Input
                                type="number"
                                placeholder="400"
                                value={amountSpent}
                                onChange={(e) => setAmountSpent(e.target.value)}
                                className="pl-8 h-12 text-lg font-bold border-gray-200 focus:border-[#7dab4f] focus:ring-[#7dab4f]/20 rounded-xl"
                            />
                        </div>

                        {/* Quick Balance Preview */}
                        {amountSpent && prefillBudget !== undefined && prefillBudget > 0 && (
                            <div className="mt-2">
                                {parseFloat(amountSpent) > prefillBudget ? (
                                    <p className="text-xs font-bold text-red-500">
                                        ⚠ Over budget by ₹
                                        {(parseFloat(amountSpent) - prefillBudget).toFixed(2)}
                                    </p>
                                ) : (
                                    <p className="text-xs font-bold text-[#7dab4f]">
                                        ✓ ₹
                                        {(prefillBudget - parseFloat(amountSpent)).toFixed(2)}{" "}
                                        will remain
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                            <FileText className="w-3.5 h-3.5 inline mr-1.5" />
                            Notes (optional)
                        </label>
                        <Input
                            placeholder="e.g., Grocery shopping + snacks"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="rounded-xl border-gray-200"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                    <Button
                        onClick={handleSubmit}
                        disabled={!amountSpent || logExpenseMutation.isPending}
                        className="w-full h-12 bg-[#313131] hover:bg-black text-white font-bold rounded-xl text-sm"
                    >
                        {logExpenseMutation.isPending
                            ? "Saving..."
                            : "Log Expense"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

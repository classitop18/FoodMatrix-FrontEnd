"use client";

import { useState } from "react";
import { CalendarDays, Info, ChevronLeft, ChevronRight, X, ArrowRight } from "lucide-react";
import type { WeeklySummary as WeeklySummaryType } from "@/services/budget/types/budget.types";
import { useSetDailyBudgetMutation } from "@/services/budget/budget.mutation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store.redux";

const getISTDateString = (dateStr: string): string => {
    const istMs = new Date(dateStr).getTime() + 5.5 * 60 * 60 * 1000;
    return new Date(istMs).toISOString().split('T')[0];
};

interface WeeklySummaryProps {
    data: WeeklySummaryType | null;
    isLoading: boolean;
    onPrevWeek?: () => void;
    onNextWeek?: () => void;
    onCurrentWeek?: () => void;
    currentDate?: string;
}

export function WeeklySummary({ data, isLoading, onPrevWeek, onNextWeek, onCurrentWeek, currentDate }: WeeklySummaryProps) {
    const [selectedDateToUpdate, setSelectedDateToUpdate] = useState<{ date: string; currentAmount: number } | null>(null);
    const [updateAmount, setUpdateAmount] = useState("");
    const { toast } = useToast();
    const activeAccountId = useSelector((state: RootState) => state.account.activeAccountId);
    const setDailyBudgetMutation = useSetDailyBudgetMutation();

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse" />
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="h-28 bg-gray-50 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!data) return null;

    const isOverBudgetWeek = data.totalBalance < 0;
    const todayIST = getISTDateString(new Date().toISOString());

    const handleUpdateBudget = async () => {
        if (!selectedDateToUpdate || !activeAccountId) return;
        const parsedAmount = parseFloat(updateAmount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            toast({ title: "Invalid Amount", description: "Please enter a valid positive amount", variant: "destructive" });
            return;
        }

        try {
            const safeDateString = selectedDateToUpdate.date.includes('T')
                ? getISTDateString(selectedDateToUpdate.date)
                : selectedDateToUpdate.date;

            await setDailyBudgetMutation.mutateAsync({
                accountId: activeAccountId,
                payload: { date: safeDateString, amount: parsedAmount },
            });

            toast({
                title: "✅ Budget Updated",
                description: `Successfully updated budget for ${safeDateString}`,
            });

            setSelectedDateToUpdate(null);
            setUpdateAmount("");
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.response?.data?.message || "Failed to update budget",
                variant: "destructive",
            });
        }
    };

    const isCurrentWeek = currentDate ? (() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const _currentDate = new Date(currentDate);
        _currentDate.setHours(0, 0, 0, 0);
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        return _currentDate >= weekStart && _currentDate <= weekEnd;
    })() : true;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-lg font-bold text-[#313131] flex items-center gap-2">
                            <CalendarDays className="w-5 h-5 text-[#7661d3]" />
                            {isCurrentWeek ? "This Week" : "Week of"}
                        </h2>
                        <div className="flex items-center gap-2">
                            {onPrevWeek && onNextWeek && (
                                <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-100">
                                    <button onClick={onPrevWeek} className="p-1 rounded hover:bg-white hover:shadow-sm text-gray-500 transition-all">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button onClick={onNextWeek} className="p-1 rounded hover:bg-white hover:shadow-sm text-gray-500 transition-all">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            {!isCurrentWeek && onCurrentWeek && (
                                <button
                                    onClick={onCurrentWeek}
                                    className="text-[10px] font-bold uppercase tracking-wider text-[#7661d3] bg-[#7661d3]/10 hover:bg-[#7661d3]/20 px-2 py-1.5 rounded-lg transition-colors"
                                >
                                    Current Week
                                </button>
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-gray-400">
                        {(() => {
                            const ws = data.weekStart.includes('T') ? getISTDateString(data.weekStart) : data.weekStart;
                            const we = data.weekEnd.includes('T') ? getISTDateString(data.weekEnd) : data.weekEnd;
                            return `${new Date(ws + "T00:00:00").toLocaleDateString("en-US", { day: "numeric", month: "short" })} – ${new Date(we + "T00:00:00").toLocaleDateString("en-US", { day: "numeric", month: "short" })}`;
                        })()}
                    </p>
                </div>

                {/* Week Totals */}
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Budget</p>
                        <p className="text-sm font-extrabold text-[#7661d3]">${(data.totalBudget || 0).toFixed(0)}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Spent</p>
                        <p className="text-sm font-extrabold text-[#7dab4f]">${(data.totalSpent || 0).toFixed(0)}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{isOverBudgetWeek ? "Over" : "Left"}</p>
                        <p className={`text-sm font-extrabold ${isOverBudgetWeek ? "text-red-500" : "text-[#313131]"}`}>
                            {isOverBudgetWeek ? "-" : ""}${Math.abs(data.totalBalance || 0).toFixed(0)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
                {data.days.map((day) => {
                    const safeDateString = getISTDateString(day.date);
                    const displayDate = new Date(safeDateString + "T00:00:00").getDate();
                    const isToday = safeDateString === todayIST;
                    const isFuture = safeDateString > todayIST;
                    const dayOverBudget = day.balance < 0 && day.hasExpense;
                    const hasBudgetData = day.hasBudget || day.isFallback;
                    const isPast = safeDateString < todayIST;

                    return (
                        <div
                            key={day.date}
                            onClick={() => {
                                if (safeDateString >= todayIST) {
                                    setSelectedDateToUpdate({ date: day.date, currentAmount: day.allocatedAmount || 0 });
                                    setUpdateAmount((day.allocatedAmount || 0).toString());
                                }
                            }}
                            className={`rounded-xl p-3 text-center transition-all shadow-sm hover:shadow-md ${isPast && !isToday ? '' : 'cursor-pointer hover:-translate-y-0.5'
                                } ${isToday
                                    ? "bg-[#F3F0FD] border-2 border-[#7661d3]/30 ring-2 ring-[#7661d3]/10"
                                    : isFuture
                                        ? "bg-gray-50/50 border border-dashed border-gray-200"
                                        : "bg-gray-50 border border-gray-100 hover:bg-white"
                                }`}
                        >
                            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isToday ? "text-[#7661d3]" : "text-gray-400"}`}>
                                {day.dayName}
                            </p>

                            <p className={`text-xs font-bold mb-2 ${isToday ? "text-[#7661d3]" : "text-gray-500"}`}>
                                {displayDate}
                            </p>

                            {hasBudgetData ? (
                                <>
                                    <p className="text-[10px] text-gray-400 font-medium">Budget</p>
                                    <p className={`text-xs font-bold mb-1 ${day.isFallback ? "text-blue-500" : "text-[#7661d3]"}`}>
                                        ${(day.allocatedAmount || 0).toFixed(0)}
                                    </p>

                                    {!isFuture && (
                                        <>
                                            <p className="text-[10px] text-gray-400 font-medium">Spent</p>
                                            <p className={`text-xs font-bold ${day.hasExpense
                                                ? dayOverBudget ? "text-red-500" : "text-[#7dab4f]"
                                                : "text-gray-300"
                                                }`}>
                                                {day.hasExpense ? `$${(day.amountSpent || 0).toFixed(0)}` : "—"}
                                            </p>
                                        </>
                                    )}

                                    {day.isFallback && !isFuture && (
                                        <div className="mt-1" title="Using previous day's budget">
                                            <Info className="w-3 h-3 text-blue-400 mx-auto" />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-[10px] text-gray-300 mt-2">No data</p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Update Daily Budget Modal */}
            {selectedDateToUpdate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedDateToUpdate(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 animate-scale-in overflow-hidden">
                        <div className="bg-gradient-to-r from-[#3d326d] to-[#7661d3] p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                        <CalendarDays className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Update Budget</h2>
                                        <p className="text-xs text-white/60">
                                            {(() => {
                                                const sDateStr = selectedDateToUpdate.date.includes('T')
                                                    ? getISTDateString(selectedDateToUpdate.date)
                                                    : selectedDateToUpdate.date;
                                                return new Date(sDateStr + "T00:00:00").toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' });
                                            })()}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedDateToUpdate(null)}
                                    className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="p-5 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                                    New Daily Budget
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-[#7661d3]">$</span>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={updateAmount}
                                        onChange={(e) => setUpdateAmount(e.target.value)}
                                        className="pl-8 h-12 text-lg font-bold border-gray-200 focus:border-[#7661d3] focus:ring-[#7661d3]/20 rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="px-5 pb-5 mt-1">
                            <Button
                                onClick={handleUpdateBudget}
                                disabled={!updateAmount || setDailyBudgetMutation.isPending}
                                className="w-full h-12 bg-[#313131] hover:bg-black text-white font-bold rounded-xl text-sm flex items-center gap-2"
                            >
                                {setDailyBudgetMutation.isPending ? "Updating..." : "Update Budget"}
                                {!setDailyBudgetMutation.isPending && <ArrowRight className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
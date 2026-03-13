"use client";

import { useEffect, useState } from "react";
import { X, Wallet, ChevronLeft, ChevronRight, ArrowRight, CalendarDays, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSetDailyBudgetMutation, useUpdateBudgetMutation } from "@/services/budget/budget.mutation";
import { useBudgetVersionsQuery } from "@/services/budget/budget.query";
import { useToast } from "@/hooks/use-toast";

interface BudgetSetupModalProps {
    open: boolean;
    onClose: () => void;
    accountId: string;
}

export function BudgetSetupModal({
    open,
    onClose,
    accountId,
}: BudgetSetupModalProps) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [budgetMode, setBudgetMode] = useState<"daily" | "weekly">("daily");
    const [selectedDate, setSelectedDate] = useState<Date>(today);
    const [amount, setAmount] = useState("");
    const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
    const [calendarYear, setCalendarYear] = useState(today.getFullYear());
    const [nextWeekRange, setNextWeekRange] = useState<{ start: Date; end: Date }>(null as any);
    const setDailyBudgetMutation = useSetDailyBudgetMutation();
    const updateBudgetMutation = useUpdateBudgetMutation();
    const versionsQuery = useBudgetVersionsQuery(accountId);
    const { toast } = useToast();

    // Calendar helpers
    const getDaysInMonth = (month: number, year: number) =>
        new Date(year, month + 1, 0).getDate();

    const getFirstDayOfMonth = (month: number, year: number) =>
        new Date(year, month, 1).getDay();

    const isSelectedDate = (date: Date) =>
        date.toDateString() === selectedDate.toDateString();

    const isToday = (date: Date) =>
        date.toDateString() === today.toDateString();

    const handleDateClick = (day: number) => {
        const date = new Date(calendarYear, calendarMonth, day);
        setSelectedDate(date);
    };

    const handlePrevMonth = () => {
        if (calendarMonth === 0) {
            setCalendarMonth(11);
            setCalendarYear(calendarYear - 1);
        } else {
            setCalendarMonth(calendarMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (calendarMonth === 11) {
            setCalendarMonth(0);
            setCalendarYear(calendarYear + 1);
        } else {
            setCalendarMonth(calendarMonth + 1);
        }
    };

    const handleSubmit = async () => {
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            toast({
                title: "Invalid Amount",
                description: "Please enter a valid positive amount",
                variant: "destructive",
            });
            return;
        }

        try {
            if (budgetMode === "daily") {
                const result = await setDailyBudgetMutation.mutateAsync({
                    accountId,
                    payload: {
                        date: selectedDate.toISOString(),
                        amount: parsedAmount,
                    },
                });

                toast({
                    title: "✅ Budget Set",
                    description: result.message,
                });
            } else {
                const result = await updateBudgetMutation.mutateAsync({
                    accountId,
                    payload: {
                        mode: "weekly",
                        weeklyAmount: parsedAmount,
                    },
                });

                toast({
                    title: "✅ Weekly Budget Set",
                    description: "Your weekly budget is set and will apply starting from the upcoming week.",
                });
            }

            setAmount("");
            onClose();
        } catch (error: any) {
            toast({
                title: "Error",
                description:
                    error?.response?.data?.message || "Failed to set budget",
                variant: "destructive",
            });
        }
    };

    const getNextWeekDate = (currentDate: Date) => {
        const dayOfWeek = currentDate.getDay();
        const curentDate = currentDate.getDate();
        const daysUntilNextWeek = (7 - dayOfWeek) % 7 || 7;

        const nextWeekSunday = new Date(currentDate);
        const nextWeekSaturday = new Date(currentDate);

        nextWeekSunday.setDate(curentDate + daysUntilNextWeek);
        nextWeekSaturday.setDate(nextWeekSunday.getDate() + 6);

        return {
            start: nextWeekSunday,
            end: nextWeekSaturday,
        }
    }

    useEffect(() => {
        setNextWeekRange(getNextWeekDate(today));
    }, []);

    if (!open) return null;

    const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
    const firstDay = getFirstDayOfMonth(calendarMonth, calendarYear);
    const monthName = new Date(calendarYear, calendarMonth).toLocaleString(
        "en-US",
        { month: "long", year: "numeric" },
    );
    const isPending = setDailyBudgetMutation.isPending || updateBudgetMutation.isPending;


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-scale-in overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#3d326d] to-[#7661d3] p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">
                                    Set Your Budget
                                </h2>
                                <p className="text-xs text-white/60">
                                    Configure daily or upcoming weekly budgets
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

                <div className="p-6 space-y-5">
                    {/* Mode Toggle */}
                    <div className="flex p-1 bg-gray-100 rounded-xl gap-1">
                        <button
                            onClick={() => setBudgetMode("daily")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${budgetMode === "daily"
                                ? "bg-white text-[#7661d3] shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <CalendarDays className="w-4 h-4" />
                            Daily
                        </button>
                        <button
                            onClick={() => setBudgetMode("weekly")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${budgetMode === "weekly"
                                ? "bg-white text-[#7661d3] shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <CalendarClock className="w-4 h-4" />
                            Next Week's Weekly
                        </button>
                    </div>

                    {budgetMode === "daily" ? (
                        <>
                            {/* Calendar */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
                                    Select Date (Today or Future)
                                </label>

                                {/* Month Navigation */}
                                <div className="flex items-center justify-between mb-3">
                                    <button
                                        onClick={handlePrevMonth}
                                        className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-sm font-bold text-[#313131]">
                                        {monthName}
                                    </span>
                                    <button
                                        onClick={handleNextMonth}
                                        className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Day Headers */}
                                <div className="grid grid-cols-7 gap-1 mb-1">
                                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                                        <div
                                            key={d}
                                            className="text-center text-[10px] font-bold text-gray-400 uppercase py-1"
                                        >
                                            {d}
                                        </div>
                                    ))}
                                </div>

                                {/* Day Grid */}
                                <div className="grid grid-cols-7 gap-1">
                                    {/* Empty cells for days before first day */}
                                    {Array.from({ length: firstDay }).map((_, i) => (
                                        <div key={`empty-${i}`} className="h-9" />
                                    ))}

                                    {/* Actual days */}
                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const day = i + 1;
                                        const date = new Date(calendarYear, calendarMonth, day);
                                        const selected = isSelectedDate(date);
                                        const todayDay = isToday(date);
                                        const isPastDate = date < today;

                                        return (
                                            <button
                                                key={day}
                                                onClick={() => {
                                                    if (!isPastDate) handleDateClick(day);
                                                }}
                                                disabled={isPastDate}
                                                className={`h-9 rounded-lg text-xs font-semibold transition-all ${isPastDate
                                                    ? "text-gray-300 cursor-not-allowed"
                                                    : "cursor-pointer hover:bg-gray-100"
                                                    } ${selected && !isPastDate
                                                        ? "bg-[#7661d3] hover:bg-[#7661d3] text-white shadow-md shadow-[#7661d3]/30"
                                                        : todayDay
                                                            ? "bg-[#F3F0FD] hover:bg-[#e6e0f9] text-[#7661d3] border border-[#7661d3]/30"
                                                            : !isPastDate
                                                                ? "text-gray-600"
                                                                : ""
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Selected Date Display */}
                            <div className="bg-[#F3F0FD] rounded-xl px-4 py-3 flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-500">
                                    Selected Date
                                </span>
                                <span className="text-sm font-bold text-[#7661d3]">
                                    {selectedDate.toLocaleDateString("en-US", {
                                        weekday: "short",
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="bg-[#F3F0FD] rounded-xl p-4 text-center border border-[#7661d3]/20">
                            <CalendarClock className="w-8 h-8 text-[#7661d3] mx-auto mb-2" />
                            <h3 className="text-sm font-bold text-[#3d326d] mb-1">
                                Upcoming Week Configuration <span className="text-xs text-gray-500 font-normal">(Next Sunday  - Saturday)</span>
                            </h3>
                            <h4 className="text-xs text-gray-600 mb-2 font-medium">
                                {
                                    nextWeekRange
                                        ? `This will set a total budget for the week of ${nextWeekRange.start.toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })} - ${nextWeekRange.end.toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })}.`
                                        : "Calculating next week's date range..."
                                }
                            </h4>
                            {versionsQuery.data && versionsQuery.data.length > 0 && versionsQuery.data[0].mode === "weekly" && (
                                <div className="mt-2 mb-3 bg-white p-2.5 rounded-xl border border-[#7661d3]/10 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-500">Current Next Week's Budget:</span>
                                    <span className="text-sm font-bold text-[#7661d3]">${parseFloat(versionsQuery.data[0].weeklyAmount || "0").toFixed(0)}</span>
                                </div>
                            )}
                            <p className="text-[10px] text-gray-500 text-left bg-white/50 p-2 rounded-lg">
                                Setting a weekly budget assigns a total expected spend for the week, divided over 7 days.
                                It will take effect starting next Sunday so that your current week's tracker remains accurate.
                            </p>
                        </div>
                    )}

                    {/* Amount Input */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                            {budgetMode === "daily" ? "Daily Budget Amount" : "Weekly Budget Amount (Total)"}
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-[#7661d3]">
                                $
                            </span>
                            <Input
                                type="number"
                                placeholder={budgetMode === "daily" ? "50" : "350"}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pl-8 h-12 text-lg font-bold border-gray-200 focus:border-[#7661d3] focus:ring-[#7661d3]/20 rounded-xl"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 mt-2">
                    <Button
                        onClick={handleSubmit}
                        disabled={!amount || isPending}
                        className="w-full h-12 bg-[#313131] hover:bg-black text-white font-bold rounded-xl text-sm flex items-center gap-2"
                    >
                        {isPending
                            ? "Setting..."
                            : "Set Budget"}
                        {!isPending && (
                            <ArrowRight className="w-4 h-4" />
                        )}
                    </Button>

                    <p className="text-[10px] text-gray-400 text-center mt-3">
                        {budgetMode === "daily"
                            ? "If no budget is set for a date, the previous date's budget will be used automatically."
                            : "Your weekly budget defines the baseline for how much you aim to spend."}
                    </p>
                </div>
            </div>
        </div>
    );
}

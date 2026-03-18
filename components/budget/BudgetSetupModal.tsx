"use client";

import { useEffect, useState } from "react";
import { 
    X, 
    Wallet, 
    ChevronLeft, 
    ChevronRight, 
    ArrowRight, 
    CalendarDays, 
    CalendarClock,
    History,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSetDailyBudgetMutation, useUpdateBudgetMutation } from "@/services/budget/budget.mutation";
import { useBudgetVersionsQuery, useCurrentWeekStatusQuery } from "@/services/budget/budget.query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

    const [budgetMode, setBudgetMode] = useState<"daily" | "weekly_current" | "weekly_next">("daily");
    const [selectedDate, setSelectedDate] = useState<Date>(today);
    const [amount, setAmount] = useState("");
    const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
    const [calendarYear, setCalendarYear] = useState(today.getFullYear());
    const [nextWeekRange, setNextWeekRange] = useState<{ start: Date; end: Date }>(null as any);
    
    const setDailyBudgetMutation = useSetDailyBudgetMutation();
    const updateBudgetMutation = useUpdateBudgetMutation();
    const versionsQuery = useBudgetVersionsQuery(accountId);
    
    // New query for current week status
    const { data: currentWeekStatus, refetch: refetchWeekStatus } = useCurrentWeekStatusQuery(accountId);
    
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
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const safeDateString = `${year}-${month}-${day}`;

                const result = await setDailyBudgetMutation.mutateAsync({
                    accountId,
                    payload: {
                        date: safeDateString,
                        amount: parsedAmount,
                    },
                });

                toast({
                    title: "✅ Budget Set",
                    description: result.message,
                });
            } else {
                const isCurrentWeek = budgetMode === "weekly_current";
                
                if (isCurrentWeek && currentWeekStatus && currentWeekStatus.attemptsLeft <= 0) {
                    toast({
                        title: "Limit Reached",
                        description: "You have used all 3 attempts to update the current week budget.",
                        variant: "destructive",
                    });
                    return;
                }

                await updateBudgetMutation.mutateAsync({
                    accountId,
                    payload: {
                        mode: "weekly",
                        weeklyAmount: parsedAmount,
                        overrideCurrentWeek: isCurrentWeek,
                    },
                });

                toast({
                    title: `✅ Weekly Budget Set`,
                    description: isCurrentWeek
                        ? `Your current week's budget has been updated to $${parsedAmount}`
                        : "Your weekly budget is set and will apply starting from the upcoming week.",
                });
                
                if (isCurrentWeek) {
                    refetchWeekStatus();
                }
            }

            setAmount("");
            if (budgetMode !== "weekly_current") {
                onClose();
            } else {
                 // optionally keep it open to show updated history, or just close
                setTimeout(onClose, 800);
            }
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

    const getCurrentWeekDate = (currentDate: Date) => {
        const dayOfWeek = currentDate.getDay(); // 0 = Sunday
        const curentDate = currentDate.getDate();

        const currentWeekSunday = new Date(currentDate);
        const currentWeekSaturday = new Date(currentDate);

        currentWeekSunday.setDate(curentDate - dayOfWeek);
        currentWeekSaturday.setDate(currentWeekSunday.getDate() + 6);

        return {
            start: currentWeekSunday,
            end: currentWeekSaturday,
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

    const attemptsLeft = currentWeekStatus?.attemptsLeft ?? 3;
    const maxAttempts = currentWeekStatus?.maxAttempts ?? 3;
    const isOutOfAttempts = budgetMode === "weekly_current" && attemptsLeft <= 0;
    
    const renderHistoryTracker = () => {
        if (!currentWeekStatus || currentWeekStatus.history.length === 0) return null;
        
        // Ensure chronological order
        const historySorted = [...currentWeekStatus.history].sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());
             return (
            <div className="mt-4 p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                    <History className="w-4 h-4 text-gray-400" />
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Update History</h4>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    {historySorted.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <span className={cn(
                                "px-2.5 py-1 rounded-md",
                                index === historySorted.length - 1 
                                  ? "bg-green-100 text-green-700" 
                                  : "bg-gray-200 text-gray-600"
                            )}>
                                ${item.amount}
                            </span>
                            {index < historySorted.length - 1 && (
                                <ArrowRight className="w-3 h-3 text-gray-400" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-hidden border border-white/20">
                {/* Header - Premium Gradient */}
                <div className="bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-600 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl mix-blend-overlay"></div>
                    
                    <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-inner">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">
                                    Set Your Budget
                                </h2>
                                <p className="text-sm text-indigo-100/80 mt-0.5 font-medium">
                                    Configure daily or weekly targets
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:rotate-90"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto no-scrollbar flex-1 space-y-6">
                    {/* Modern Pill Mode Toggle */}
                    <div className="flex p-1.5 bg-gray-100/80 backdrop-blur rounded-2xl gap-1">
                        <button
                            onClick={() => setBudgetMode("daily")}
                            className={cn(
                                "flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all duration-300",
                                budgetMode === "daily"
                                ? "bg-white text-indigo-600 shadow-sm font-semibold"
                                : "text-gray-500 hover:text-gray-800 font-medium hover:bg-gray-200/50"
                            )}
                        >
                            <CalendarDays className="w-4 h-4" />
                            <span className="text-xs">Daily</span>
                        </button>
                        <button
                            onClick={() => setBudgetMode("weekly_current")}
                            className={cn(
                                "flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all duration-300 relative",
                                budgetMode === "weekly_current"
                                ? "bg-white text-indigo-600 shadow-sm font-semibold"
                                : "text-gray-500 hover:text-gray-800 font-medium hover:bg-gray-200/50"
                            )}
                        >
                            <CalendarClock className="w-4 h-4" />
                            <span className="text-xs">Current Wk</span>
                            {budgetMode !== "weekly_current" && attemptsLeft <= 1 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                            )}
                        </button>
                        <button
                            onClick={() => setBudgetMode("weekly_next")}
                            className={cn(
                                "flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all duration-300",
                                budgetMode === "weekly_next"
                                ? "bg-white text-indigo-600 shadow-sm font-semibold"
                                : "text-gray-500 hover:text-gray-800 font-medium hover:bg-gray-200/50"
                            )}
                        >
                            <CalendarClock className="w-4 h-4 opacity-70" />
                            <span className="text-xs">Next Wk</span>
                        </button>
                    </div>

                    {/* Mode Specific Content */}
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {budgetMode === "daily" ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <h3 className="text-sm font-bold text-gray-700">Select Date</h3>
                                    <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                                        <button
                                            onClick={handlePrevMonth}
                                            className="w-7 h-7 rounded-md bg-white flex items-center justify-center shadow-sm text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <span className="text-xs font-bold text-gray-700 w-24 text-center">
                                            {monthName}
                                        </span>
                                        <button
                                            onClick={handleNextMonth}
                                            className="w-7 h-7 rounded-md bg-white flex items-center justify-center shadow-sm text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4">
                                    <div className="grid grid-cols-7 gap-y-2 gap-x-1 mb-2">
                                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                                            <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase">
                                                {d}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7 gap-y-1 gap-x-1">
                                        {Array.from({ length: firstDay }).map((_, i) => (
                                            <div key={`empty-${i}`} className="h-9" />
                                        ))}
                                        {Array.from({ length: daysInMonth }).map((_, i) => {
                                            const day = i + 1;
                                            const date = new Date(calendarYear, calendarMonth, day);
                                            const selected = isSelectedDate(date);
                                            const todayDay = isToday(date);
                                            const isPastDate = date < today;

                                            return (
                                                <button
                                                    key={day}
                                                    onClick={() => !isPastDate && handleDateClick(day)}
                                                    disabled={isPastDate}
                                                    className={cn(
                                                        "h-9 rounded-xl text-xs font-semibold transition-all flex items-center justify-center relative",
                                                        isPastDate ? "text-gray-300 cursor-not-allowed bg-gray-50/50" : "cursor-pointer",
                                                        !isPastDate && !selected && !todayDay && "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600",
                                                        selected && !isPastDate && "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105 z-10 font-bold",
                                                        todayDay && !selected && !isPastDate && "bg-indigo-50 text-indigo-600 border border-indigo-200"
                                                    )}
                                                >
                                                    {day}
                                                    {todayDay && !selected && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-600"></span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="bg-indigo-50/50 rounded-xl px-4 py-3 flex items-center justify-between border border-indigo-100/50">
                                    <span className="text-xs font-semibold text-gray-500">Selected</span>
                                    <span className="text-sm font-bold text-indigo-700">
                                        {selectedDate.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "long" })}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className={cn(
                                    "rounded-2xl p-5 border relative overflow-hidden transition-colors",
                                    budgetMode === "weekly_current" ? (
                                        attemptsLeft > 1 ? "bg-indigo-50/80 border-indigo-100" : 
                                        attemptsLeft === 1 ? "bg-amber-50/80 border-amber-200" : 
                                        "bg-red-50/80 border-red-200"
                                    ) : "bg-purple-50/80 border-purple-100"
                                )}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className={cn(
                                                "text-sm font-bold mb-1",
                                                budgetMode === "weekly_current" ? "text-indigo-900" : "text-purple-900"
                                            )}>
                                                {budgetMode === "weekly_current" ? "Current Week Overview" : "Next Week Configuration"}
                                            </h3>
                                            <h4 className={cn(
                                                "text-xs font-medium",
                                                budgetMode === "weekly_current" ? "text-indigo-600/80" : "text-purple-600/80"
                                            )}>
                                                {(() => {
                                                    const range = budgetMode === "weekly_current" ? getCurrentWeekDate(today) : nextWeekRange;
                                                    return range
                                                        ? `${range.start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${range.end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                                                        : "Calculating date range...";
                                                })()}
                                            </h4>
                                        </div>
                                        
                                        {budgetMode === "weekly_current" && (
                                            <div className={cn(
                                                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border",
                                                attemptsLeft > 1 ? "bg-indigo-100 text-indigo-700 border-indigo-200" : 
                                                attemptsLeft === 1 ? "bg-amber-100 text-amber-700 border-amber-300" : 
                                                "bg-red-100 text-red-700 border-red-200"
                                            )}>
                                                {attemptsLeft > 0 ? (
                                                    <><CheckCircle2 className="w-3.5 h-3.5" /> {attemptsLeft}/{maxAttempts} Attempts</>
                                                ) : (
                                                    <><AlertCircle className="w-3.5 h-3.5" /> No Attempts Left</>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {versionsQuery.data && versionsQuery.data.length > 0 && versionsQuery.data[0].mode === "weekly" && budgetMode === "weekly_next" && (
                                        <div className="mt-4 bg-white/70 p-3 rounded-xl border border-white flex items-center justify-between shadow-sm">
                                            <span className="text-xs font-semibold text-gray-600">Current Next Week Setting:</span>
                                            <span className="text-sm font-bold text-purple-700">${parseFloat(versionsQuery.data[0].weeklyAmount || "0").toFixed(0)}</span>
                                        </div>
                                    )}

                                    <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                                        {budgetMode === "weekly_current"
                                            ? "Update your budget for the entire current week. The amount will be distributed equally across all 7 days."
                                            : "Define a baseline expected spend for next week. Will be distributed equally across 7 days."}
                                    </p>
                                </div>

                                {budgetMode === "weekly_current" && renderHistoryTracker()}
                            </div>
                        )}
                    </div>

                    {/* Amount Input Component */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                            {budgetMode === "daily" ? "Daily Budget Amount" : "Total Weekly Amount"}
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg text-gray-500 font-bold group-focus-within:bg-indigo-100 group-focus-within:text-indigo-600 transition-colors">
                                $
                            </div>
                            <Input
                                type="number"
                                placeholder={budgetMode === "daily" ? "50" : "350"}
                                value={amount}
                                disabled={isOutOfAttempts}
                                onChange={(e) => setAmount(e.target.value)}
                                className={cn(
                                    "pl-14 h-14 text-xl font-bold rounded-2xl border-gray-200 transition-all bg-white",
                                    !isOutOfAttempts && "focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm",
                                    isOutOfAttempts && "opacity-60 cursor-not-allowed bg-gray-50"
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-2 bg-white border-t border-gray-50">
                    <Button
                        onClick={handleSubmit}
                        disabled={!amount || isPending || isOutOfAttempts}
                        className={cn(
                            "w-full h-14 rounded-2xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all duration-300",
                            isOutOfAttempts 
                                ? "bg-gray-200 text-gray-500 shadow-none hover:bg-gray-200 cursor-not-allowed" 
                                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:shadow-xl hover:-translate-y-0.5"
                        )}
                    >
                        {isPending ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                Processing...
                            </div>
                        ) : isOutOfAttempts ? (
                            "Limit Reached for This Week"
                        ) : (
                            <>
                                Set Budget <ArrowRight className="w-5 h-5 ml-1" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}


"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store.redux";
import { Wallet, Loader2 } from "lucide-react";

import { BudgetDashboard } from "@/components/budget/BudgetDashboard";
import { WeeklySummary } from "@/components/budget/WeeklySummary";
import { BudgetHistory } from "@/components/budget/BudgetHistory";
import { BudgetAnalytics } from "@/components/budget/BudgetAnalytics";
import { BudgetSetupModal } from "@/components/budget/BudgetSetupModal";
import { ExpenseUpdateModal } from "@/components/budget/ExpenseUpdateModal";
import { PendingUpdateAlert } from "@/components/budget/PendingUpdateAlert";

import {
    useTodayBudgetQuery,
    useWeeklySummaryQuery,
    useBudgetHistoryQuery,
    useBudgetAnalyticsQuery,
    usePendingUpdatesQuery,
} from "@/services/budget/budget.query";

import type { PendingUpdate } from "@/services/budget/types/budget.types";

export default function BudgetPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const activeAccountId = useSelector(
        (state: RootState) => state.account.activeAccountId,
    );

    // Modals
    const [setupModalOpen, setSetupModalOpen] = useState(false);
    const [expenseModalOpen, setExpenseModalOpen] = useState(false);
    const [expensePrefillDate, setExpensePrefillDate] = useState<string>();
    const [expensePrefillBudget, setExpensePrefillBudget] = useState<number>();

    // Analytics period
    const [analyticsPeriod, setAnalyticsPeriod] = useState<
        "weekly" | "monthly" | "yearly" | "custom"
    >("weekly");

    // Analytics filters (Custom Year/Month)
    const [analyticsFilters, setAnalyticsFilters] = useState<{ year?: string; month?: string; weekDate?: string }>({
        year: new Date().getFullYear().toString(),
        month: (new Date().getMonth() + 1).toString()
    });

    // Weekly Summary navigation
    const [currentWeeklySummaryDate, setCurrentWeeklySummaryDate] = useState<string>(
        new Date().toISOString()
    );

    // History pagination
    const [historyPage, setHistoryPage] = useState(1);
    const historyLimit = 15;

    // Queries
    const todayQuery = useTodayBudgetQuery(activeAccountId || "");
    const weeklyQuery = useWeeklySummaryQuery(activeAccountId || "", currentWeeklySummaryDate);
    const historyQuery = useBudgetHistoryQuery(activeAccountId || "", {
        page: historyPage,
        limit: historyLimit,
        endDate: new Date().toISOString().split("T")[0],
    });
    const analyticsQuery = useBudgetAnalyticsQuery(
        activeAccountId || "",
        analyticsPeriod,
        analyticsFilters
    );
    const pendingQuery = usePendingUpdatesQuery(activeAccountId || "");

    // Handlers
    const handleSetupClick = () => setSetupModalOpen(true);

    const handleLogExpenseClick = () => {
        setExpensePrefillDate(undefined);
        setExpensePrefillBudget(todayQuery.data?.allocatedAmount);
        setExpenseModalOpen(true);
    };

    const handlePendingUpdateClick = (update: PendingUpdate) => {
        setExpensePrefillDate(
            new Date(update.date).toISOString().split("T")[0],
        );
        setExpensePrefillBudget(update.allocatedAmount);
        setExpenseModalOpen(true);
    };

    const handlePrevWeek = () => {
        const date = new Date(currentWeeklySummaryDate);
        date.setDate(date.getDate() - 7);
        setCurrentWeeklySummaryDate(date.toISOString());
    };

    const handleNextWeek = () => {
        const date = new Date(currentWeeklySummaryDate);
        date.setDate(date.getDate() + 7);
        setCurrentWeeklySummaryDate(date.toISOString());
    };

    const handleCurrentWeek = () => {
        setCurrentWeeklySummaryDate(new Date().toISOString());
    };

    if (!mounted || !activeAccountId) {
        return (
            <div className="min-h-screen bg-[#f8f7fc] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-[#7661d3] mx-auto mb-3 animate-spin" />
                    <p className="text-sm font-semibold text-gray-500">
                        Loading account...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f7fc]">
            {/* ─── Hero Header ─── */}
            <div className="bg-gradient-to-r from-[#3d326d] via-[#5a468a] to-[#7661d3] px-4 sm:px-6 pt-6 pb-16">
                <div className="max-w-8xl mx-auto">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                                    <Wallet className="w-4 h-4 text-white" />
                                </div>
                                {/* <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">
                                      Module
                                </span> */}
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                Budget Tracker
                            </h1>
                            <p className="text-white/60 text-sm mt-1">
                                Set daily budgets, track spending & monitor weekly trends
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Main Content (overlaps hero) ─── */}
            <div className="max-w-8xl mx-auto px-4 sm:px-6 -mt-10 pb-8 space-y-5">
                <PendingUpdateAlert
                    pendingUpdates={pendingQuery.data || []}
                    onUpdateClick={handlePendingUpdateClick}
                />

                {/* Two-column layout: Dashboard + Weekly */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Left column - Today's Dashboard */}
                    <div className="lg:col-span-1">
                        <BudgetDashboard
                            todayBudget={todayQuery.data || null}
                            isLoading={todayQuery.isLoading}
                            onSetupClick={handleSetupClick}
                            onLogExpenseClick={handleLogExpenseClick}
                            hasPendingUpdates={(pendingQuery.data || []).length > 0}
                        />
                    </div>

                    {/* Right column - Weekly Summary */}
                    <div className="lg:col-span-2">
                        <WeeklySummary
                            data={weeklyQuery.data || null}
                            isLoading={weeklyQuery.isLoading}
                            onPrevWeek={handlePrevWeek}
                            onNextWeek={handleNextWeek}
                            onCurrentWeek={handleCurrentWeek}
                            currentDate={currentWeeklySummaryDate}
                        />
                    </div>
                </div>

                {/* Analytics */}
                <BudgetAnalytics
                    analytics={analyticsQuery.data || null}
                    isLoading={analyticsQuery.isLoading}
                    period={analyticsPeriod}
                    onPeriodChange={setAnalyticsPeriod}
                    filters={analyticsFilters}
                    onFilterChange={setAnalyticsFilters}
                />

                {/* History (full width) */}
                <BudgetHistory
                    data={historyQuery.data?.data || []}
                    total={historyQuery.data?.total || 0}
                    isLoading={historyQuery.isLoading}
                    page={historyPage}
                    limit={historyLimit}
                    onPageChange={setHistoryPage}
                    accountId={activeAccountId}
                />
            </div>

            {/* ─── Modals ─── */}
            <BudgetSetupModal
                open={setupModalOpen}
                onClose={() => setSetupModalOpen(false)}
                accountId={activeAccountId}
            />

            <ExpenseUpdateModal
                open={expenseModalOpen}
                onClose={() => setExpenseModalOpen(false)}
                accountId={activeAccountId}
                prefillDate={expensePrefillDate}
                prefillBudget={expensePrefillBudget}
            />
        </div>
    );
}

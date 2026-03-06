import { useQuery } from "@tanstack/react-query";
import { BudgetService } from "./budget.service";
import type { BudgetHistoryParams } from "./types/budget.types";

const budgetService = new BudgetService();

export const useTodayBudgetQuery = (accountId: string) => {
    return useQuery({
        queryKey: ["budget", "today", accountId],
        queryFn: () => budgetService.getTodayBudget(accountId),
        staleTime: 30 * 1000,
        refetchOnWindowFocus: true,
        enabled: !!accountId,
    });
};

export const useWeeklySummaryQuery = (accountId: string) => {
    return useQuery({
        queryKey: ["budget", "weekly", accountId],
        queryFn: () => budgetService.getWeeklySummary(accountId),
        staleTime: 60 * 1000,
        refetchOnWindowFocus: true,
        enabled: !!accountId,
    });
};

export const useBudgetHistoryQuery = (
    accountId: string,
    params: BudgetHistoryParams = {},
) => {
    return useQuery({
        queryKey: ["budget", "history", accountId, params],
        queryFn: () => budgetService.getBudgetHistory(accountId, params),
        staleTime: 60 * 1000,
        enabled: !!accountId,
    });
};

export const useBudgetAnalyticsQuery = (
    accountId: string,
    period: "weekly" | "monthly" = "weekly",
) => {
    return useQuery({
        queryKey: ["budget", "analytics", accountId, period],
        queryFn: () => budgetService.getAnalytics(accountId, period),
        staleTime: 60 * 1000,
        enabled: !!accountId,
    });
};

export const usePendingUpdatesQuery = (accountId: string) => {
    return useQuery({
        queryKey: ["budget", "pending", accountId],
        queryFn: () => budgetService.getPendingUpdates(accountId),
        staleTime: 30 * 1000,
        refetchOnWindowFocus: true,
        enabled: !!accountId,
    });
};

export const useBudgetVersionsQuery = (accountId: string) => {
    return useQuery({
        queryKey: ["budget", "versions", accountId],
        queryFn: () => budgetService.getConfigVersions(accountId),
        staleTime: 120 * 1000,
        enabled: !!accountId,
    });
};

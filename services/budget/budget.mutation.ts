import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BudgetService } from "./budget.service";
import type {
    SetDailyBudgetPayload,
    UpdateBudgetPayload,
    LogExpensePayload,
} from "./types/budget.types";

const budgetService = new BudgetService();

export const useSetDailyBudgetMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            accountId,
            payload,
        }: {
            accountId: string;
            payload: SetDailyBudgetPayload;
        }) => budgetService.setDailyBudget(accountId, payload),
        onSuccess: (_, { accountId }) => {
            queryClient.invalidateQueries({ queryKey: ["budget", "today", accountId] });
            queryClient.invalidateQueries({ queryKey: ["budget", "weekly", accountId] });
            queryClient.invalidateQueries({ queryKey: ["budget", "history", accountId] });
            queryClient.invalidateQueries({ queryKey: ["budget", "analytics", accountId] });
            queryClient.invalidateQueries({ queryKey: ["budget", "pending", accountId] });
            queryClient.invalidateQueries({ queryKey: ["budget", "versions", accountId] });
        },
    });
};

export const useUpdateBudgetMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            accountId,
            payload,
        }: {
            accountId: string;
            payload: UpdateBudgetPayload;
        }) => budgetService.updateBudget(accountId, payload),
        onSuccess: (_, { accountId }) => {
            queryClient.invalidateQueries({ queryKey: ["budget", "today", accountId] });
            queryClient.invalidateQueries({ queryKey: ["budget", "weekly", accountId] });
            queryClient.invalidateQueries({ queryKey: ["budget", "history", accountId] });
            queryClient.invalidateQueries({ queryKey: ["budget", "analytics", accountId] });
            queryClient.invalidateQueries({ queryKey: ["budget", "versions", accountId] });
        },
    });
};

export const useLogExpenseMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            accountId,
            payload,
        }: {
            accountId: string;
            payload: LogExpensePayload;
        }) => budgetService.logExpense(accountId, payload),
        onSuccess: (_, { accountId }) => {
            queryClient.invalidateQueries({ queryKey: ["budget", "today", accountId] });
            queryClient.invalidateQueries({ queryKey: ["budget", "weekly", accountId] });
            queryClient.invalidateQueries({ queryKey: ["budget", "history", accountId] });
            queryClient.invalidateQueries({ queryKey: ["budget", "analytics", accountId] });
            queryClient.invalidateQueries({ queryKey: ["budget", "pending", accountId] });
        },
    });
};

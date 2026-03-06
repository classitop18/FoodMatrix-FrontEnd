import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
    TodayBudgetSummary,
    BudgetHistoryParams,
    BudgetHistoryResponse,
    BudgetAnalytics,
    PendingUpdate,
    BudgetConfigVersion,
    ExpenseLogResult,
    SetDailyBudgetPayload,
    SetDailyBudgetResult,
    UpdateBudgetPayload,
    LogExpensePayload,
    WeeklySummary,
    BudgetConfig,
} from "./types/budget.types";

export class BudgetService {
    async setDailyBudget(
        accountId: string,
        payload: SetDailyBudgetPayload,
    ): Promise<SetDailyBudgetResult> {
        const response = await apiClient.post(
            API_ENDPOINTS.BUDGET.SET_DAILY(accountId),
            payload,
        );
        return response.data.data;
    }

    async updateBudget(
        accountId: string,
        payload: UpdateBudgetPayload,
    ): Promise<BudgetConfig> {
        const response = await apiClient.put(
            API_ENDPOINTS.BUDGET.UPDATE_CONFIG(accountId),
            payload,
        );
        return response.data.data;
    }

    async logExpense(
        accountId: string,
        payload: LogExpensePayload,
    ): Promise<ExpenseLogResult> {
        const response = await apiClient.post(
            API_ENDPOINTS.BUDGET.LOG_EXPENSE(accountId),
            payload,
        );
        return response.data.data;
    }

    async getTodayBudget(accountId: string): Promise<TodayBudgetSummary> {
        const response = await apiClient.get(
            API_ENDPOINTS.BUDGET.TODAY(accountId),
        );
        return response.data.data;
    }

    async getWeeklySummary(accountId: string): Promise<WeeklySummary> {
        const response = await apiClient.get(
            API_ENDPOINTS.BUDGET.WEEKLY(accountId),
        );
        return response.data.data;
    }

    async getBudgetHistory(
        accountId: string,
        params: BudgetHistoryParams = {},
    ): Promise<BudgetHistoryResponse> {
        const queryParams = new URLSearchParams();
        if (params.startDate) queryParams.set("startDate", params.startDate);
        if (params.endDate) queryParams.set("endDate", params.endDate);
        if (params.page) queryParams.set("page", params.page.toString());
        if (params.limit) queryParams.set("limit", params.limit.toString());

        const url = `${API_ENDPOINTS.BUDGET.HISTORY(accountId)}?${queryParams.toString()}`;
        const response = await apiClient.get(url);
        return response.data.data;
    }

    async getAnalytics(
        accountId: string,
        period: "weekly" | "monthly" = "weekly",
    ): Promise<BudgetAnalytics> {
        const response = await apiClient.get(
            `${API_ENDPOINTS.BUDGET.ANALYTICS(accountId)}?period=${period}`,
        );
        return response.data.data;
    }

    async getPendingUpdates(accountId: string): Promise<PendingUpdate[]> {
        const response = await apiClient.get(
            API_ENDPOINTS.BUDGET.PENDING(accountId),
        );
        return response.data.data;
    }

    async getConfigVersions(
        accountId: string,
    ): Promise<BudgetConfigVersion[]> {
        const response = await apiClient.get(
            API_ENDPOINTS.BUDGET.VERSIONS(accountId),
        );
        return response.data.data;
    }
}

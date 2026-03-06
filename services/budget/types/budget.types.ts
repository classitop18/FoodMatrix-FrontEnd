// ================== Budget Config Types ==================

export interface BudgetConfig {
    id: string;
    accountId: string;
    mode: "daily" | "weekly";
    dailyAmount: string | null;
    weeklyAmount: string | null;
    isActive: boolean;
    effectiveFrom: string;
    createdAt: string;
    updatedAt: string;
}

// ================== Budget Config Version ==================

export interface BudgetConfigVersion {
    id: string;
    budgetConfigId: string;
    version: number;
    mode: "daily" | "weekly";
    dailyAmount: string | null;
    weeklyAmount: string | null;
    changedBy: string;
    changeReason: string | null;
    createdAt: string;
}

// ================== Daily Budget With Expense ==================

export interface DailyBudgetWithExpense {
    id: string;
    date: string;
    allocatedAmount: string;
    amountSpent: string | null;
    balance: number;
    notes: string | null;
    expenseId: string | null;
}

// ================== Today's Budget Summary ==================

export interface TodayBudgetSummary {
    date: string;
    allocatedAmount: number;
    amountSpent: number;
    balance: number;
    hasExpenseLogged: boolean;
    isFallback: boolean;
    fallbackFromDate: string | null;
    configId: string | null;
}

// ================== Weekly Summary ==================

export interface WeeklySummary {
    weekStart: string;
    weekEnd: string;
    totalBudget: number;
    totalSpent: number;
    totalBalance: number;
    days: {
        date: string;
        dayName: string;
        allocatedAmount: number;
        amountSpent: number;
        balance: number;
        hasBudget: boolean;
        hasExpense: boolean;
        isFallback: boolean;
    }[];
}

// ================== Analytics ==================

export interface BudgetAnalytics {
    period: "weekly" | "monthly";
    totalBudget: number;
    totalSpent: number;
    totalBalance: number;
    daysOverBudget: number;
    daysUnderBudget: number;
    averageDailySpending: number;
    dailyData: {
        date: string;
        budget: number;
        spent: number;
        balance: number;
    }[];
}

// ================== Pending Updates ==================

export interface PendingUpdate {
    date: string;
    allocatedAmount: number;
    dailyBudgetId: string;
}

// ================== Expense Log Result ==================

export interface ExpenseLogResult {
    expense: any;
    allocatedAmount: number;
    amountSpent: number;
    balance: number;
    isOverBudget: boolean;
}

// ================== Set Daily Budget Result ==================

export interface SetDailyBudgetResult {
    dailyBudget: any;
    date: string;
    allocatedAmount: number;
    message: string;
}

// ================== Request Payloads ==================

export interface SetDailyBudgetPayload {
    date: string; // ISO date string
    amount: number;
}

export interface UpdateBudgetPayload {
    mode?: "daily" | "weekly";
    dailyAmount?: number;
    weeklyAmount?: number;
    changeReason?: string;
}

export interface LogExpensePayload {
    date: string;
    amountSpent: number;
    notes?: string;
}

export interface BudgetHistoryParams {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

export interface BudgetHistoryResponse {
    data: DailyBudgetWithExpense[];
    total: number;
}

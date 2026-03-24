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
    totalBudgetAmount: number;
    diningBudgetOffset: number;
    emergencyBudgetOffset: number;
    groceriesPercentage: number;
    diningPercentage: number;
    emergencyPercentage: number;
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
        totalBudgetAmount: number;
        diningBudgetOffset: number;
        emergencyBudgetOffset: number;
    }[];
}

// ================== Current Week Status ==================

export interface CurrentWeekStatusHistoryItem {
    version: number;
    amount: number;
    changeReason: string | null;
    changedAt: string;
}

export interface CurrentWeekStatusResponse {
    attemptsUsed: number;
    attemptsLeft: number;
    maxAttempts: number;
    history: CurrentWeekStatusHistoryItem[];
}

// ================== Analytics ==================

export interface BudgetAnalytics {
    period: "weekly" | "monthly" | "yearly" | "custom";
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
    categoriesBreakdown?: Record<string, number>;
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
    overrideCurrentWeek?: boolean;
}

export interface LogExpensePayload {
    date: string;
    amountSpent: number;
    notes?: string;
    categoriesBreakdown?: Record<string, number>;
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

// ================== Receipt-Budget Linking ==================

export interface LogExpenseFromReceiptPayload {
    receiptId: string;
    date: string;
    note?: string;
}

export interface ReceiptExpenseDetail {
    id: string;
    receiptId: string;
    amount: string;
    itemsSnapshot: {
        name: string;
        quantity: number;
        unit: string;
        price: number;
        category: string;
        brand?: string;
    }[];
    note: string | null;
    linkedAt: string;
    storeName?: string | null;
}

export interface ExpenseDetailsResponse {
    dailyBudgetId: string;
    date: string;
    allocatedAmount: string;
    amountSpent: string;
    balance: number;
    receiptExpenses: ReceiptExpenseDetail[];
}

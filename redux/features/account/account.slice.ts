import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import { AccountService } from "@/services/account/account.service";

export type BudgetType = "daily" | "weekly" | "monthly" | "annual";

interface ActiveBudget {
  type: BudgetType;
  label: string;
  amount: number;
}

interface AccountState {
  accountsList: any[];
  activeAccountId: string | null;
  account: any | null;
  activeBudget: ActiveBudget | null;
  spent: number;
  usagePercent: number;
  resetInDays: number;
  location: string;
  loading: boolean;
  error: string | null;
}

const initialState: AccountState = {
  accountsList: [],
  activeAccountId: null,
  account: null,
  activeBudget: null,
  spent: 0,
  usagePercent: 0,
  resetInDays: 0,
  location: "",
  loading: false,
  error: null,
};

/* -------------------------------- */
const calculateResetInDays = (lastReset?: string) => {
  if (!lastReset) return 0;
  const diff = Date.now() - new Date(lastReset).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return Math.max(7 - days, 0);
};

const getActiveBudget = (account: any): ActiveBudget | null => {
  if (!account) return null;
  const budgets = [
    { type: "daily", label: "Daily Budget", value: account?.dailyBudget },
    { type: "weekly", label: "Weekly Budget", value: account?.weeklyBudget },
    { type: "monthly", label: "Monthly Budget", value: account?.monthlyBudget },
    { type: "annual", label: "Annual Budget", value: account?.annualBudget },
  ];
  const active = budgets.find((b) => b.value !== null);
  return active
    ? {
        type: active.type as BudgetType,
        label: active.label,
        amount: Number(active.value),
      }
    : null;
};

const calculateSpent = (account: any, budget: ActiveBudget | null) => {
  if (!budget || !account) return 0;
  switch (budget.type) {
    case "daily":
      return Number(account?.currentDayFoodSpending ?? 0);
    case "weekly":
      return Number(account?.currentWeekFoodSpending ?? 0);
    case "monthly":
      return Number(account?.currentMonthFoodSpending ?? 0);
    case "annual":
      return Number(account?.currentYearFoodSpending ?? 0);
    default:
      return 0;
  }
};

const calculateAccountDerived = (account: any) => {
  const activeBudget = getActiveBudget(account);
  const spent = calculateSpent(account, activeBudget);
  return {
    account,
    activeBudget,
    spent,
    usagePercent:
      activeBudget && activeBudget.amount > 0
        ? Math.min((spent / activeBudget.amount) * 100, 100)
        : 0,
    resetInDays: calculateResetInDays(account?.lastFoodBudgetReset),
    location:
      [account?.city, account?.state, account?.country]
        .filter(Boolean)
        .join(", ") || "Not provided",
  };
};

/* -------------------------------- */
/* Async thunk to fetch account detail */
export const fetchAccountDetail = createAsyncThunk(
  "account/fetchAccountDetail",
  async (accountId: string) => {
    const res = await new AccountService().getAccountById(accountId);
    return res.data;
  },
);

/* -------------------------------- */
export const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    setAccounts(state, action: PayloadAction<any[]>) {
      state.accountsList = action.payload;
      if (!state.activeAccountId && action.payload.length > 0) {
        state.activeAccountId = action.payload[0].id;
      }
    },
    setActiveAccountId(state, action: PayloadAction<string>) {
      state.activeAccountId = action.payload;
    },
    clearAccount(state) {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccountDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountDetail.fulfilled, (state, action) => {
        const derived = calculateAccountDerived(action.payload);
        state.account = derived.account;
        state.activeBudget = derived.activeBudget;
        state.spent = derived.spent;
        state.usagePercent = derived.usagePercent;
        state.resetInDays = derived.resetInDays;
        state.location = derived.location;
        state.loading = false;
      })
      .addCase(fetchAccountDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch account";
      });
  },
});

export const { setAccounts, setActiveAccountId, clearAccount } =
  accountSlice.actions;
export default accountSlice.reducer;

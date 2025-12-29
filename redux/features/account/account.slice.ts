import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import { AccountService } from "@/services/account/account.service";
import { MemberService } from "@/services/member/member.service";
import { Role } from "@/lib/permissions";

export type BudgetType = "daily" | "weekly" | "monthly" | "annual";

interface ActiveBudget {
  type: BudgetType;
  label: string;
  amount: number;
}

// Membership info for current user in active account
export interface MyMembership {
  id: string;
  role: Role;
  accountId: string;
}

interface AccountState {
  accountsList: any[];
  activeAccountId: string | null;
  account: any | null;
  myMembership: MyMembership | null; // Current user's membership in active account
  activeBudget: ActiveBudget | null;
  spent: number;
  usagePercent: number;
  resetInDays: number;
  location: string;
  loading: boolean;
  error: string | null;
}

// LocalStorage key for persisting active account
const ACTIVE_ACCOUNT_KEY = "foodmatrix_active_account_id";

// Helper to get active account from localStorage
const getPersistedAccountId = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACTIVE_ACCOUNT_KEY);
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return null;
  }
};

// Helper to save active account to localStorage
const persistAccountId = (accountId: string | null) => {
  if (typeof window === "undefined") return;
  try {
    if (accountId) {
      localStorage.setItem(ACTIVE_ACCOUNT_KEY, accountId);
    } else {
      localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
    }
  } catch (error) {
    console.error("Error writing to localStorage:", error);
  }
};

const initialState: AccountState = {
  accountsList: [],
  activeAccountId: getPersistedAccountId(), // Load from localStorage on init
  account: null,
  myMembership: null, // Current user's membership info
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

  // 1. Try to get budget based on currentAllocation
  if (account?.currentAllocation) {
    const alloc = account.currentAllocation;
    let val = null;
    let label = "";

    switch (alloc) {
      case "daily":
        val = account.dailyBudget;
        label = "Daily Budget";
        break;
      case "weekly":
        val = account.weeklyBudget;
        label = "Weekly Budget";
        break;
      case "monthly":
        val = account.monthlyBudget;
        label = "Monthly Budget";
        break;
      case "annual":
        val = account.annualBudget;
        label = "Annual Budget";
        break;
    }

    if (val !== null && val !== undefined) {
      return {
        type: alloc as BudgetType,
        label,
        amount: Number(val),
      };
    }
  }

  // 2. Fallback: Find first available budget (precedence: weekly > daily > monthly > annual)
  // Reordered to prioritize weekly as it's the default required field

  const budgets = [
    { type: "weekly", label: "Weekly Budget", value: account?.weeklyBudget },
    { type: "daily", label: "Daily Budget", value: account?.dailyBudget },
    { type: "monthly", label: "Monthly Budget", value: account?.monthlyBudget },
    { type: "annual", label: "Annual Budget", value: account?.annualBudget },
  ];

  const active = budgets.find((b) => b.value !== null && b.value !== undefined);
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
  console.log({ activeBudget }, "acive");
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
    console.log(res.data, "res.data")
    return res.data;
  },
);

/* Async thunk to fetch current user's membership in an account */
export const fetchMyMembership = createAsyncThunk(
  "account/fetchMyMembership",
  async (
    { accountId, userId }: { accountId: string; userId: string },
    { rejectWithValue },
  ) => {
    try {
      const memberService = new MemberService();
      const response = await memberService.getMembers({
        accountId,
        limit: 100, // Get all members to find current user
      });

      // Find the current user's membership
      const myMember = response.data?.find(
        (member: any) => member.userId === userId,
      );

      if (!myMember) {
        return rejectWithValue("User is not a member of this account");
      }

      return {
        id: myMember.id,
        role: myMember.role as Role,
        accountId: myMember.accountId,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to fetch membership info",
      );
    }
  },
);

/* -------------------------------- */
export const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    setAccounts(state, action: PayloadAction<any[]>) {
      state.accountsList = action.payload;
      // If no active account is set and we have accounts, set the first one
      if (!state.activeAccountId && action.payload.length > 0) {
        const firstAccountId = action.payload[0].id;
        state.activeAccountId = firstAccountId;
        persistAccountId(firstAccountId); // Persist to localStorage
      }
    },
    setActiveAccountId(state, action: PayloadAction<string>) {
      state.activeAccountId = action.payload;
      state.myMembership = null; // Clear membership when switching accounts
      persistAccountId(action.payload); // Persist to localStorage
    },
    setMyMembership(state, action: PayloadAction<MyMembership | null>) {
      state.myMembership = action.payload;
    },
    clearAccount(state) {
      persistAccountId(null); // Clear from localStorage on logout
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
        state.myMembership = {
          id: action.payload.id,
          role: action.payload.role,
          accountId: action.payload.id,
        };
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
      })
    // // Membership thunk handlers
    // .addCase(fetchMyMembership.pending, (state) => {
    //   // Don't set loading to prevent UI flicker
    // })
    // .addCase(fetchMyMembership.fulfilled, (state, action) => {
    //   state.myMembership = action.payload;
    // })
    // .addCase(fetchMyMembership.rejected, (state, action) => {
    //   console.error("Failed to fetch membership:", action.payload);
    //   state.myMembership = null;
    // });
  },
});

export const {
  setAccounts,
  setActiveAccountId,
  setMyMembership,
  clearAccount,
} = accountSlice.actions;
export default accountSlice.reducer;

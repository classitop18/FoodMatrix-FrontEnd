import React, { useState } from "react";
import { Wallet, RefreshCw } from "lucide-react";

interface BudgetOverviewTabProps {
  account: any;
  activeBudget: any;
  spent: number;
  usagePercent: number;
  resetInDays: number;
  activeAccountId: string;
  loading: boolean;
  onRefetch: () => void;
}

export const BudgetOverviewTab: React.FC<BudgetOverviewTabProps> = ({
  account,
  activeBudget,
  spent,
  usagePercent,
  resetInDays,
  activeAccountId,
  loading,
  onRefetch,
}) => {
  const [isRefetching, setIsRefetching] = useState(false);

  const handleRefetch = async () => {
    if (isRefetching || loading) return;
    setIsRefetching(true);
    await onRefetch();
    // Keep the button disabled for a minimum duration to prevent spam
    setTimeout(() => setIsRefetching(false), 1000);
  };

  const isLoading = loading || isRefetching;

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Budget & Finance Card with Blue Header */}
      <div className="border-0 shadow-xl bg-white rounded-xl overflow-hidden">
        {/* Blue Gradient Header */}
        <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white p-4 flex justify-between items-center">
          <h3 className="flex items-center gap-3 text-xl font-extrabold">
            <Wallet className="h-6 w-6" />
            Budget Overview
          </h3>
          <button
            onClick={handleRefetch}
            disabled={isLoading}
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refetch Budget Stats"
          >
            <RefreshCw
              size={16}
              className={`${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* Card Content */}
        <div className="p-6 space-y-6 bg-white">
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h3 className="text-xl font-extrabold text-[#313131]">
              Budget Overview
            </h3>
          </div>

          {/* ACTIVE BUDGET CARD */}
          {activeBudget && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-gray-500 font-bold text-xs uppercase">
                    {activeBudget.label}
                  </p>
                  <p className="text-3xl font-extrabold text-[#313131]">
                    ${activeBudget.amount.toLocaleString("en-IN")}
                  </p>
                </div>

                <span className="text-xs font-bold bg-[#F3F0FD] text-[#3d326d] px-3 py-1 rounded-full">
                  Active · {account.currentAllocation}
                </span>
              </div>

              {/* PROGRESS */}
              <div className="mt-4">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-gray-500">
                    Spent ${spent.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[#7dab4f]">
                    {usagePercent.toFixed(0)}%
                  </span>
                </div>

                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#7dab4f] transition-all"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>

                {resetInDays !== null && (
                  <p className="text-[11px] text-gray-400 mt-2">
                    Resets in {resetInDays} days
                  </p>
                )}
              </div>
            </div>
          )}

          {/* CATEGORY SPLIT */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                label: "Groceries",
                value: account.groceriesPercentage,
                color: "bg-[#7dab4f]",
                icon: "🥦",
              },
              {
                label: "Dining",
                value: account.diningPercentage,
                color: "bg-[#f59e0b]",
                icon: "🍽️",
              },
              {
                label: "Emergency",
                value: account.emergencyPercentage,
                color: "bg-[#ef4444]",
                icon: "🚨",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-[#F8F7FC] rounded-xl p-5 text-center relative overflow-hidden"
              >
                <div
                  className={`absolute top-0 left-0 w-full h-1 ${item.color}`}
                />
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="text-sm font-bold text-gray-700">{item.label}</p>
                <p className="text-2xl font-extrabold text-[#313131]">
                  {item.value}%
                </p>
              </div>
            ))}
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Current Streak",
                value: account.weeklyFoodStreak,
              },
              { label: "Best Streak", value: account.bestFoodStreak },
              { label: "Overrides", value: account.totalFoodOverrides },
            ].map((stat) => (
              <div
                key={stat.label}
                className="border border-dashed border-gray-300 rounded-xl p-5 text-center"
              >
                <p className="text-gray-400 text-[10px] font-bold uppercase">
                  {stat.label}
                </p>
                <p className="text-2xl font-extrabold text-[#313131] mt-1">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

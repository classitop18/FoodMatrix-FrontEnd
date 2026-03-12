"use client";

import { useState } from "react";
import { TrendingUp, BarChart3, AlertTriangle } from "lucide-react";
import type { BudgetAnalytics as BudgetAnalyticsType } from "@/services/budget/types/budget.types";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

const COLORS = [
    "#7661d3", "#7dab4f", "#f59e0b", "#ef4444",
    "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6"
];

interface BudgetAnalyticsProps {
    analytics: BudgetAnalyticsType | null;
    isLoading: boolean;
    period: "weekly" | "monthly";
    onPeriodChange: (period: "weekly" | "monthly") => void;
}

export function BudgetAnalytics({
    analytics,
    isLoading,
    period,
    onPeriodChange,
}: BudgetAnalyticsProps) {
    const [chartType, setChartType] = useState<"bar" | "line">("bar");

    if (isLoading || !analytics) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse" />
                <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
            </div>
        );
    }

    const chartData = analytics.dailyData.map((d) => ({
        date: new Date(d.date).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
        }),
        budget: d.budget,
        spent: d.spent,
    }));

    const categoryData = analytics.categoriesBreakdown
        ? Object.entries(analytics.categoriesBreakdown)
            .map(([name, value]) => ({ name, value }))
            .filter((item) => item.value > 0)
            .sort((a, b) => b.value - a.value)
        : [];

    return (
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-lg font-bold text-[#313131] flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#7661d3]" />
                        Budget Analytics
                    </h2>
                    <p className="text-xs text-gray-400">
                        Performance overview
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Period Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-0.5">
                        <button
                            onClick={() => onPeriodChange("weekly")}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${period === "weekly"
                                ? "bg-white text-[#7661d3] shadow-sm"
                                : "text-gray-500"
                                }`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => onPeriodChange("monthly")}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${period === "monthly"
                                ? "bg-white text-[#7661d3] shadow-sm"
                                : "text-gray-500"
                                }`}
                        >
                            Month
                        </button>
                    </div>

                    {/* Chart Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-0.5">
                        <button
                            onClick={() => setChartType("bar")}
                            className={`px-2 py-1.5 rounded-md text-xs transition-all cursor-pointer ${chartType === "bar"
                                ? "bg-white text-[#7661d3] shadow-sm"
                                : "text-gray-500"
                                }`}
                        >
                            <BarChart3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setChartType("line")}
                            className={`px-2 py-1.5 rounded-md text-xs transition-all cursor-pointer ${chartType === "line"
                                ? "bg-white text-[#7661d3] shadow-sm"
                                : "text-gray-500"
                                }`}
                        >
                            <TrendingUp className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                <div className="bg-gradient-to-br from-[#F3F0FD] to-white rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        Total Budget
                    </p>
                    <p className="text-lg font-extrabold text-[#7661d3]">
                        ${analytics.totalBudget.toFixed(0)}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-[#e8f5e0] to-white rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        Total Spent
                    </p>
                    <p className="text-lg font-extrabold text-[#7dab4f]">
                        ${analytics.totalSpent.toFixed(0)}
                    </p>
                </div>
                <div
                    className={`rounded-xl p-3 ${analytics.totalBalance >= 0 ? "bg-gradient-to-br from-[#3d326d] to-[#2d2454]" : "bg-gradient-to-br from-red-600 to-red-700"}`}
                >
                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">
                        {analytics.totalBalance >= 0 ? "Saved" : "Over Budget"}
                    </p>
                    <p className="text-lg font-extrabold text-white">
                        ${Math.abs(analytics.totalBalance).toFixed(0)}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        Avg/Day
                    </p>
                    <p className="text-lg font-extrabold text-[#313131]">
                        ${analytics.averageDailySpending.toFixed(0)}
                    </p>
                </div>
            </div>

            {/* Over-spending indicator */}
            {analytics.daysOverBudget > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-xl mb-4">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-xs font-semibold text-red-600">
                        Over budget on {analytics.daysOverBudget} day
                        {analytics.daysOverBudget > 1 ? "s" : ""} this {period === "weekly" ? "week" : "month"}
                    </p>
                </div>
            )}

            {/* Chart */}
            <div className="h-[240px]">
                {chartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-sm text-gray-300 font-medium">
                            No data for this period
                        </p>
                    </div>
                ) : chartType === "bar" ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f0f0f0"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: "12px",
                                    border: "1px solid #e5e7eb",
                                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                    fontSize: "12px",
                                }}
                                formatter={(value: number, name: string) => [
                                    `$${value}`,
                                    name === "budget" ? "Budget" : "Spent",
                                ]}
                            />
                            <Bar
                                dataKey="budget"
                                fill="#7661d3"
                                radius={[4, 4, 0, 0]}
                                opacity={0.5}
                            />
                            <Bar
                                dataKey="spent"
                                fill="#7dab4f"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f0f0f0"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: "12px",
                                    border: "1px solid #e5e7eb",
                                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                    fontSize: "12px",
                                }}
                                formatter={(value: number, name: string) => [
                                    `$${value}`,
                                    name === "budget" ? "Budget" : "Spent",
                                ]}
                            />
                            <Line
                                type="monotone"
                                dataKey="budget"
                                stroke="#7661d3"
                                strokeWidth={2}
                                dot={{ fill: "#7661d3", r: 3 }}
                                strokeDasharray="5 5"
                            />
                            <Line
                                type="monotone"
                                dataKey="spent"
                                stroke="#7dab4f"
                                strokeWidth={2}
                                dot={{ fill: "#7dab4f", r: 3 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Legend for Spending Trend */}
            <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#7661d3] opacity-50" />
                    <span className="text-xs font-medium text-gray-500">Budget</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#7dab4f]" />
                    <span className="text-xs font-medium text-gray-500">Spent</span>
                </div>
            </div>

            {/* Spending by Category Section */}
            {categoryData.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-[#313131] mb-5 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-[#7661d3]" />
                        Spending by Category
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "1px solid #e5e7eb",
                                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                            fontSize: "12px",
                                        }}
                                        formatter={(value: number) => `$${value.toFixed(2)}`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col gap-3 justify-center">
                            {categoryData.map((cat, idx) => (
                                <div key={cat.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                        />
                                        <span className="text-sm font-semibold capitalize text-gray-700">
                                            {cat.name.replace(/_/g, " ")}
                                        </span>
                                    </div>
                                    <div className="text-sm font-bold text-[#313131]">
                                        ${cat.value.toFixed(2)}
                                        <span className="ml-2 text-xs font-medium text-gray-400">
                                            ({Math.round((cat.value / analytics.totalSpent) * 100)}%)
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

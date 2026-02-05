"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Heart,
  ChefHat,
  ShoppingCart,
  Calendar,
  Wallet,
  Crown,
  Package,
  Bell,
  Activity,
  Target,
  Flame,
  Apple,
  Droplets,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Star,
  Zap,
  BookOpen,
  Utensils,
  RefreshCw,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store.redux";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  Legend,
  Tooltip,
} from "recharts";

// ============= STATIC DATA FOR DASHBOARD =============

// Budget Analytics Data
const budgetData = [
  { month: "Jan", budget: 1200, spent: 980 },
  { month: "Feb", budget: 1200, spent: 1050 },
  { month: "Mar", budget: 1300, spent: 1180 },
  { month: "Apr", budget: 1250, spent: 890 },
  { month: "May", budget: 1400, spent: 1320 },
  { month: "Jun", budget: 1350, spent: 1100 },
];

const categorySpending = [
  { name: "Groceries", value: 45, amount: 540, color: "#7661d3" },
  { name: "Dining Out", value: 20, amount: 240, color: "#7dab4f" },
  { name: "Snacks", value: 15, amount: 180, color: "#f59e0b" },
  { name: "Beverages", value: 12, amount: 144, color: "#06b6d4" },
  { name: "Others", value: 8, amount: 96, color: "#ec4899" },
];

// Health Metrics Data
const healthTrends = [
  { day: "Mon", calories: 2100, protein: 85, carbs: 220, fat: 70 },
  { day: "Tue", calories: 1950, protein: 92, carbs: 200, fat: 65 },
  { day: "Wed", calories: 2300, protein: 78, carbs: 250, fat: 80 },
  { day: "Thu", calories: 1800, protein: 95, carbs: 180, fat: 60 },
  { day: "Fri", calories: 2200, protein: 88, carbs: 230, fat: 75 },
  { day: "Sat", calories: 2400, protein: 82, carbs: 260, fat: 85 },
  { day: "Sun", calories: 2000, protein: 90, carbs: 210, fat: 68 },
];

const nutritionProgress = [
  { name: "Calories", current: 1850, target: 2200, percent: 84, color: "#7661d3" },
  { name: "Protein", current: 92, target: 120, percent: 77, color: "#7dab4f" },
  { name: "Carbs", current: 195, target: 250, percent: 78, color: "#f59e0b" },
  { name: "Fat", current: 58, target: 70, percent: 83, color: "#06b6d4" },
];

// Meal Planning Data
const weeklyMeals = [
  { day: "Mon", breakfast: true, lunch: true, dinner: true, snacks: true },
  { day: "Tue", breakfast: true, lunch: true, dinner: false, snacks: true },
  { day: "Wed", breakfast: true, lunch: true, dinner: true, snacks: false },
  { day: "Thu", breakfast: true, lunch: false, dinner: true, snacks: true },
  { day: "Fri", breakfast: false, lunch: true, dinner: true, snacks: true },
  { day: "Sat", breakfast: true, lunch: true, dinner: true, snacks: true },
  { day: "Sun", breakfast: true, lunch: true, dinner: true, snacks: true },
];

// Pantry Data
const pantryStats = {
  totalItems: 47,
  expiringItems: 5,
  lowStock: 3,
  totalValue: 385,
};

const expiringItems = [
  { name: "Milk", expiresIn: "2 days", location: "Refrigerator" },
  { name: "Yogurt", expiresIn: "3 days", location: "Refrigerator" },
  { name: "Bread", expiresIn: "4 days", location: "Pantry" },
];

// Recent Activity
const recentActivity = [
  { type: "recipe", action: "Added new recipe", item: "Grilled Salmon Bowl", time: "2 hours ago", icon: ChefHat },
  { type: "pantry", action: "Added to pantry", item: "Fresh Vegetables", time: "5 hours ago", icon: Package },
  { type: "shopping", action: "Completed shopping", item: "Weekly Groceries", time: "Yesterday", icon: ShoppingCart },
  { type: "meal", action: "Planned meal", item: "Family Dinner", time: "Yesterday", icon: Utensils },
  { type: "health", action: "Updated health profile", item: "Weight logged", time: "2 days ago", icon: Heart },
];

// Family Members Health Overview
const familyHealth = [
  { name: "John", avatar: "J", healthScore: 92, trend: "up", status: "Excellent" },
  { name: "Sarah", avatar: "S", healthScore: 88, trend: "up", status: "Very Good" },
  { name: "Emma", avatar: "E", healthScore: 78, trend: "down", status: "Good" },
  { name: "Mike", avatar: "M", healthScore: 85, trend: "stable", status: "Very Good" },
];

// Upcoming Events
const upcomingEvents = [
  { name: "Birthday Party", date: "Feb 15", guests: 12, meals: 3, status: "Planning" },
  { name: "Family Reunion", date: "Feb 22", guests: 25, meals: 4, status: "In Progress" },
  { name: "Weekend BBQ", date: "Mar 1", guests: 8, meals: 2, status: "Draft" },
];

// Quick Stats
const quickStats = [
  { label: "Recipes Saved", value: "124", icon: BookOpen, change: "+12", trend: "up", color: "#7661d3" },
  { label: "Meals Planned", value: "28", icon: Calendar, change: "+5", trend: "up", color: "#7dab4f" },
  { label: "Shopping Trips", value: "8", icon: ShoppingCart, change: "-2", trend: "down", color: "#f59e0b" },
  { label: "Health Score", value: "86", icon: Heart, change: "+3", trend: "up", color: "#06b6d4" },
];

// Chart Configs
const budgetChartConfig = {
  budget: { label: "Budget", color: "#7661d3" },
  spent: { label: "Spent", color: "#7dab4f" },
};

const healthChartConfig = {
  calories: { label: "Calories", color: "#7661d3" },
  protein: { label: "Protein", color: "#7dab4f" },
};

export default function DashboardPage() {
  const { account, activeBudget, spent, usagePercent, resetInDays } = useSelector(
    (state: RootState) => state.account
  );
  const user = useSelector((state: RootState) => state.auth.user);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  // Calculate greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="h-[calc(100vh-57px)] bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00] relative overflow-auto">
      <div className="max-w-8xl mx-auto px-4 md:px-6 relative z-10 py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-8 gap-6 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#7dab4f] font-bold text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1">
                <Crown size={12} className="fill-white" />
                {account?.isPremium ? "Premium Plan" : "Basic Plan"}
              </span>
              <span className="bg-[#7661d3]/10 font-bold text-[#7661d3] text-[10px] uppercase tracking-wider px-2 py-1 rounded-md">
                Dashboard
              </span>
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-[#313131] tracking-tight">
                {getGreeting()}, {user?.firstName || "User"}! 👋
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-1">
                Here's what's happening with your food management today
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="bg-white hover:bg-gray-50 text-[#313131] font-bold py-2.5 px-4 rounded-lg shadow-none border border-gray-200 transition-all flex items-center gap-2 text-sm h-auto"
            >
              <RefreshCw
                size={18}
                className={`text-[#7661d3] ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Link href="/meal-planning">
              <Button className="bg-[#313131] hover:bg-black text-white font-bold py-2.5 px-4 rounded-lg shadow-none transition-all flex items-center gap-2 text-sm h-auto">
                <ChefHat size={18} />
                Plan Meal
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 animate-slide-up">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl lg:p-6 p-4 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] relative overflow-hidden group border border-gray-200 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:border-[#7661d3]/20 transition-all"
              >
                <div
                  className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-125"
                  style={{ background: `linear-gradient(135deg, ${stat.color}15 0%, transparent 100%)` }}
                />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-wide mb-1">
                      {stat.label}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl font-extrabold text-[#313131]">
                        {stat.value}
                      </h3>
                      <span
                        className={`text-xs font-bold flex items-center gap-0.5 ${stat.trend === "up" ? "text-green-500" : "text-red-500"
                          }`}
                      >
                        {stat.trend === "up" ? (
                          <TrendingUp size={12} />
                        ) : (
                          <TrendingDown size={12} />
                        )}
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                  >
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Budget Overview - 8 columns */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-md border border-gray-200 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#313131] flex items-center gap-2">
                  <Wallet size={20} className="text-[#7661d3]" />
                  Budget Analytics
                </h2>
                <p className="text-sm text-gray-500">Monthly spending overview</p>
              </div>
              <Link href="/account">
                <Button variant="ghost" size="sm" className="text-[#7661d3] hover:bg-[#F3F0FD]">
                  View Details
                  <ArrowRight size={16} className="ml-1" />
                </Button>
              </Link>
            </div>

            {/* Budget Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-[#F3F0FD] to-white rounded-xl p-4">
                <p className="text-xs text-gray-500 font-medium mb-1">Monthly Budget</p>
                <p className="text-2xl font-extrabold text-[#7661d3]">
                  ${activeBudget?.amount?.toLocaleString() || "1,350"}
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#e8f5e0] to-white rounded-xl p-4">
                <p className="text-xs text-gray-500 font-medium mb-1">Total Spent</p>
                <p className="text-2xl font-extrabold text-[#7dab4f]">
                  ${spent?.toLocaleString() || "1,100"}
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#3d326d] to-[#2d2454] rounded-xl p-4">
                <p className="text-xs text-white/70 font-medium mb-1">Remaining</p>
                <p className="text-2xl font-extrabold text-white">
                  ${Math.max((activeBudget?.amount || 1350) - (spent || 1100), 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Budget Chart */}
            <div className="h-[220px]">
              <ChartContainer config={budgetChartConfig} className="h-full w-full">
                <AreaChart data={budgetData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7661d3" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7661d3" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="spentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7dab4f" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7dab4f" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="budget" stroke="#7661d3" fill="url(#budgetGradient)" strokeWidth={2} />
                  <Area type="monotone" dataKey="spent" stroke="#7dab4f" fill="url(#spentGradient)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </div>
          </div>

          {/* Spending by Category - 4 columns */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-md border border-gray-200 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#313131] flex items-center gap-2">
                  <Target size={20} className="text-[#7661d3]" />
                  Spending Categories
                </h2>
                <p className="text-sm text-gray-500">Where your money goes</p>
              </div>
            </div>

            <div className="h-[180px] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySpending}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categorySpending.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value}%`, name]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {categorySpending.slice(0, 4).map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  </div>
                  <span className="text-sm font-bold text-[#313131]">${category.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Health & Nutrition Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Health Trends - 7 columns */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-md border border-gray-200 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#313131] flex items-center gap-2">
                  <Activity size={20} className="text-[#7dab4f]" />
                  Weekly Health Trends
                </h2>
                <p className="text-sm text-gray-500">Calorie and protein intake</p>
              </div>
              <Link href="/health">
                <Button variant="ghost" size="sm" className="text-[#7661d3] hover:bg-[#F3F0FD]">
                  View All
                  <ArrowRight size={16} className="ml-1" />
                </Button>
              </Link>
            </div>

            <div className="h-[220px]">
              <ChartContainer config={healthChartConfig} className="h-full w-full">
                <BarChart data={healthTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar yAxisId="left" dataKey="calories" fill="#7661d3" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="protein" fill="#7dab4f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>

          {/* Nutrition Progress - 5 columns */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-md border border-gray-200 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#313131] flex items-center gap-2">
                  <Flame size={20} className="text-orange-500" />
                  Today's Nutrition
                </h2>
                <p className="text-sm text-gray-500">Daily goals progress</p>
              </div>
            </div>

            <div className="space-y-5">
              {nutritionProgress.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {item.name === "Calories" && <Flame size={16} className="text-[#7661d3]" />}
                      {item.name === "Protein" && <Zap size={16} className="text-[#7dab4f]" />}
                      {item.name === "Carbs" && <Apple size={16} className="text-[#f59e0b]" />}
                      {item.name === "Fat" && <Droplets size={16} className="text-[#06b6d4]" />}
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-[#313131]">
                      {item.current} / {item.target}
                      {item.name === "Calories" ? "" : "g"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percent}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-br from-[#F3F0FD] to-[#e8f5e0] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <Star size={20} className="text-[#f59e0b]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#313131]">Great Progress!</p>
                  <p className="text-xs text-gray-500">You're 82% towards your daily goals</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Family Health & Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Family Health Overview - 5 columns */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-md border border-gray-200 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#313131] flex items-center gap-2">
                  <Users size={20} className="text-[#7661d3]" />
                  Family Health
                </h2>
                <p className="text-sm text-gray-500">Member health scores</p>
              </div>
              <Link href="/health">
                <Button variant="ghost" size="sm" className="text-[#7661d3] hover:bg-[#F3F0FD]">
                  Details
                  <ArrowRight size={16} className="ml-1" />
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {familyHealth.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-[#F3F0FD]/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7661d3] to-[#3d326d] flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {member.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-[#313131] text-sm">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="font-extrabold text-lg text-[#313131]">{member.healthScore}</p>
                    </div>
                    <div
                      className={`p-1 rounded ${member.trend === "up"
                          ? "bg-green-100 text-green-500"
                          : member.trend === "down"
                            ? "bg-red-100 text-red-500"
                            : "bg-gray-100 text-gray-500"
                        }`}
                    >
                      {member.trend === "up" ? (
                        <TrendingUp size={14} />
                      ) : member.trend === "down" ? (
                        <TrendingDown size={14} />
                      ) : (
                        <Activity size={14} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity - 4 columns */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-md border border-gray-200 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#313131] flex items-center gap-2">
                  <Clock size={20} className="text-[#7dab4f]" />
                  Recent Activity
                </h2>
                <p className="text-sm text-gray-500">Latest updates</p>
              </div>
            </div>

            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[#F3F0FD] flex items-center justify-center text-[#7661d3] shrink-0 mt-0.5">
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[#313131] truncate">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{activity.item}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pantry Alerts - 3 columns */}
          <div className="lg:col-span-3 bg-gradient-to-br from-[#3d326d] to-[#2d2454] rounded-2xl p-6 shadow-md text-white animate-scale-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#7dab4f]/10 rounded-full -ml-8 -mb-8" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Bell size={20} />
                    Pantry Alerts
                  </h2>
                  <p className="text-sm text-white/70">{pantryStats.expiringItems} items need attention</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {expiringItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className="text-orange-400" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="text-xs text-white/70">{item.expiresIn}</span>
                  </div>
                ))}
              </div>

              <Link href="/pantry">
                <Button
                  variant="outline"
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white font-bold"
                >
                  View Pantry
                  <ArrowRight size={16} className="ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Upcoming Events & Meal Planning */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Weekly Meal Plan - 7 columns */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-md border border-gray-200 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#313131] flex items-center gap-2">
                  <Calendar size={20} className="text-[#7661d3]" />
                  Weekly Meal Plan
                </h2>
                <p className="text-sm text-gray-500">Your planned meals at a glance</p>
              </div>
              <Link href="/meal-planning">
                <Button variant="ghost" size="sm" className="text-[#7661d3] hover:bg-[#F3F0FD]">
                  Plan More
                  <ArrowRight size={16} className="ml-1" />
                </Button>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <div className="grid grid-cols-7 gap-2 min-w-[600px]">
                {weeklyMeals.map((day, index) => (
                  <div key={index} className="text-center">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-3">{day.day}</p>
                    <div className="space-y-2">
                      <div
                        className={`p-2 rounded-lg ${day.breakfast
                            ? "bg-[#7661d3]/10 text-[#7661d3]"
                            : "bg-gray-100 text-gray-300"
                          }`}
                      >
                        <Utensils size={16} className="mx-auto" />
                        <span className="text-[10px] font-medium block mt-1">Breakfast</span>
                      </div>
                      <div
                        className={`p-2 rounded-lg ${day.lunch
                            ? "bg-[#7dab4f]/10 text-[#7dab4f]"
                            : "bg-gray-100 text-gray-300"
                          }`}
                      >
                        <Utensils size={16} className="mx-auto" />
                        <span className="text-[10px] font-medium block mt-1">Lunch</span>
                      </div>
                      <div
                        className={`p-2 rounded-lg ${day.dinner
                            ? "bg-[#f59e0b]/10 text-[#f59e0b]"
                            : "bg-gray-100 text-gray-300"
                          }`}
                      >
                        <Utensils size={16} className="mx-auto" />
                        <span className="text-[10px] font-medium block mt-1">Dinner</span>
                      </div>
                      <div
                        className={`p-2 rounded-lg ${day.snacks
                            ? "bg-[#06b6d4]/10 text-[#06b6d4]"
                            : "bg-gray-100 text-gray-300"
                          }`}
                      >
                        <Apple size={16} className="mx-auto" />
                        <span className="text-[10px] font-medium block mt-1">Snacks</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#7dab4f]" />
                  <span className="text-sm text-gray-600">
                    <span className="font-bold text-[#313131]">24</span> meals planned
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    <span className="font-bold text-[#313131]">4</span> pending
                  </span>
                </div>
              </div>
              <Badge className="bg-[#7dab4f]/10 text-[#7dab4f] border-0 font-bold">
                86% Complete
              </Badge>
            </div>
          </div>

          {/* Upcoming Events - 5 columns */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-md border border-gray-200 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#313131] flex items-center gap-2">
                  <BookOpen size={20} className="text-[#7661d3]" />
                  Upcoming Events
                </h2>
                <p className="text-sm text-gray-500">Your event meal plans</p>
              </div>
              <Link href="/event-meal-plan/list">
                <Button variant="ghost" size="sm" className="text-[#7661d3] hover:bg-[#F3F0FD]">
                  View All
                  <ArrowRight size={16} className="ml-1" />
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-gray-200 hover:border-[#7661d3]/30 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-[#313131] text-sm group-hover:text-[#7661d3] transition-colors">
                        {event.name}
                      </h3>
                      <p className="text-xs text-gray-500">{event.date}</p>
                    </div>
                    <Badge
                      className={`font-medium text-[10px] ${event.status === "Planning"
                          ? "bg-blue-100 text-blue-600 border-0"
                          : event.status === "In Progress"
                            ? "bg-[#7dab4f]/10 text-[#7dab4f] border-0"
                            : "bg-gray-100 text-gray-600 border-0"
                        }`}
                    >
                      {event.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {event.guests} guests
                    </span>
                    <span className="flex items-center gap-1">
                      <Utensils size={12} />
                      {event.meals} meals
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/event-meal-plan/create">
              <Button className="w-full mt-4 bg-[#F3F0FD] text-[#7661d3] hover:bg-[#7661d3] hover:text-white font-bold transition-all">
                Create New Event
              </Button>
            </Link>
          </div>
        </div>

        {/* Bottom Quick Actions */}
        <div className="bg-gradient-to-r from-[#3d326d] to-[#7661d3] rounded-2xl p-8 shadow-lg relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-[#7dab4f]/10 rounded-full -mb-24" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-extrabold text-white mb-2">
                Ready to optimize your meals?
              </h2>
              <p className="text-white/70 text-sm max-w-md">
                Use our AI-powered meal intelligence to get personalized recommendations based on your health goals and budget.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/recipes">
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white font-bold px-6"
                >
                  <BookOpen size={18} className="mr-2" />
                  Browse Recipes
                </Button>
              </Link>
              <Link href="/meal-intelligence">
                <Button className="bg-[#7dab4f] hover:bg-[#6a9642] text-white font-bold px-6 shadow-lg">
                  <Zap size={18} className="mr-2" />
                  Get AI Recommendations
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

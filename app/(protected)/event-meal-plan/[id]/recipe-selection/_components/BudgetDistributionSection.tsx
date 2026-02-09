"use client";

import React from "react";
import { Brain, Edit3, DollarSign, Wand2, Loader2, ArrowLeft, MoveRight, Lightbulb, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MealBudgetAllocation } from "./types";
import { MEAL_TYPE_CONFIG } from "./constants";
import { MealType } from "@/services/event/event.types";

interface BudgetDistributionSectionProps {
    budgetStrategy: "manual" | "ai";
    setBudgetStrategy: (value: "manual" | "ai") => void;
    totalBudget: number;
    setTotalBudget: (value: number) => void;
    mealBudgets: MealBudgetAllocation[];
    handleManualBudgetChange: (mealType: MealType, value: string) => void;
    handleAIDistributeBudget: () => void;
    isAIDistributing: boolean;
    onBack: () => void;
    onContinue: () => void;
}

export const BudgetDistributionSection: React.FC<BudgetDistributionSectionProps> = ({
    budgetStrategy,
    setBudgetStrategy,
    totalBudget,
    setTotalBudget,
    mealBudgets,
    handleManualBudgetChange,
    handleAIDistributeBudget,
    isAIDistributing,
    onBack,
    onContinue
}) => {
    const totalAllocated = mealBudgets.reduce((sum, mb) => sum + mb.budget, 0);
    const remainingBudget = totalBudget - totalAllocated;
    const allocationPercentage = Math.round((totalAllocated / totalBudget) * 100);

    console.log({ mealBudgets })

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 m-1"
        >
            {/* Budget Strategy Selection */}
            <Card className="rounded-2xl border border-gray-200 shadow-sm bg-white overflow-hidden ">
                <CardHeader className="pb-4 border-b border-gray-50 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                            <DollarSign className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-gray-900">
                                Budget Distribution
                            </CardTitle>
                            <CardDescription>
                                Allocate your budget across selected meals for optimal planning
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-8 px-6">
                    <div className="space-y-8">
                        {/* Budget Strategy Selection */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-gray-500" />
                                Choose Your Strategy
                            </h4>
                            <RadioGroup
                                value={budgetStrategy}
                                onValueChange={(value: "manual" | "ai") => setBudgetStrategy(value)}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                {/* AI Strategy */}
                                <div
                                    className={cn(
                                        "flex items-start gap-4 p-5 rounded-xl border cursor-pointer transition-all hover:shadow-md relative overflow-hidden",
                                        budgetStrategy === "ai"
                                            ? "border-[var(--primary)] bg-gradient-to-br from-indigo-50/50 to-purple-50/50"
                                            : "border-gray-100 bg-white hover:border-gray-200"
                                    )}
                                    onClick={() => setBudgetStrategy("ai")}
                                >
                                    {budgetStrategy === "ai" && (
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-indigo-100 to-transparent rounded-bl-full" />
                                    )}
                                    <RadioGroupItem
                                        value="ai"
                                        id="ai-strategy"
                                        className="text-indigo-600 border-[var(--primary)] mt-1"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Brain className={cn(
                                                "w-5 h-5",
                                                budgetStrategy === "ai" ? "text-indigo-600" : "text-gray-400"
                                            )} />
                                            <Label
                                                htmlFor="ai-strategy"
                                                className="text-base font-bold text-gray-900 cursor-pointer"
                                            >
                                                AI Optimized
                                            </Label>
                                            <Badge
                                                variant="secondary"
                                                className="bg-indigo-100 text-indigo-700 text-xs"
                                            >
                                                Recommended
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Smart distribution based on meal importance, health profiles, and event type
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <Badge variant="outline" className="text-xs">
                                                <Sparkles className="w-3 h-3 mr-1" />
                                                Health-aware
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                                Event-optimized
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Manual Strategy */}
                                <div
                                    className={cn(
                                        "flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md",
                                        budgetStrategy === "manual"
                                            ? "border-[var(--primary)] bg-indigo-50/50"
                                            : "border-gray-100 bg-white hover:border-gray-200"
                                    )}
                                    onClick={() => setBudgetStrategy("manual")}
                                >
                                    <RadioGroupItem
                                        value="manual"
                                        id="manual-strategy"
                                        className="text-indigo-600 border-[var(--primary)] mt-1"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Edit3 className={cn(
                                                "w-5 h-5",
                                                budgetStrategy === "manual" ? "text-indigo-600" : "text-gray-400"
                                            )} />
                                            <Label
                                                htmlFor="manual-strategy"
                                                className="text-base font-bold text-gray-900 cursor-pointer"
                                            >
                                                Manual Allocation
                                            </Label>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Full control to distribute budget exactly as you want
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <Badge variant="outline" className="text-xs">
                                                Full control
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                                Custom split
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Total Budget Display */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-6 rounded-xl border border-gray-100">
                            <Label
                                htmlFor="total-budget"
                                className="text-sm font-bold text-gray-900 mb-2 block"
                            >
                                Total Event Budget
                            </Label>
                            <div className="relative max-w-md">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg font-medium text-gray-500">
                                    ₹
                                </span>
                                <Input
                                    id="total-budget"
                                    type="number"
                                    readOnly
                                    value={totalBudget}
                                    className="pl-8 h-14 text-2xl font-bold border-gray-200 bg-white focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="Enter total budget"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Budget set during event creation
                            </p>
                        </div>

                        {/* AI Distribution Button */}
                        {budgetStrategy === "ai" && (
                            <Button
                                onClick={handleAIDistributeBudget}
                                disabled={isAIDistributing}
                                className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-[1.01]"
                            >
                                {isAIDistributing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2.5 animate-spin" />
                                        AI is analyzing your event...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-5 h-5 mr-2.5" />
                                        Optimize Budget with AI
                                    </>
                                )}
                            </Button>
                        )}

                        {/* Manual Budget Allocation */}
                        {budgetStrategy === "manual" && (
                            <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                    Allocation Breakdown
                                </h4>
                                <div className="space-y-3">
                                    {mealBudgets.map((mb) => {
                                        const config = MEAL_TYPE_CONFIG[mb.mealType];
                                        return (
                                            <div
                                                key={mb.mealType}
                                                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-gray-300 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 w-36">
                                                    <div className={`p-2.5 rounded-lg bg-gray-50 ${config.color}`}>
                                                        <config.icon className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-700">
                                                        {config.label}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                                                            ₹
                                                        </span>
                                                        <Input
                                                            type="number"
                                                            value={mb.budget}
                                                            onChange={(e) => handleManualBudgetChange(mb.mealType, e.target.value)}
                                                            className="w-full pl-8 font-medium"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="text-sm font-semibold text-gray-500 w-16 text-right tabular-nums">
                                                    {mb.percentage}%
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* AI Distribution Result - Show allocation with reasoning */}
                        {budgetStrategy === "ai" && mealBudgets.length > 0 && mealBudgets.some(mb => mb.reasoning) && (
                            <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                                <div className="flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4 text-amber-500" />
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                        AI Allocation & Reasoning
                                    </h4>
                                </div>
                                <div className="space-y-3">
                                    {mealBudgets.map((mb) => {
                                        const config = MEAL_TYPE_CONFIG[mb.mealType];
                                        return (
                                            <div
                                                key={mb.mealType}
                                                className="p-4 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-xl border border-indigo-100"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg bg-white shadow-sm ${config.color}`}>
                                                            <config.icon className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-bold text-gray-900">
                                                            {config.label}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-white text-indigo-700 font-bold"
                                                        >
                                                            ₹{mb.budget}
                                                        </Badge>
                                                        <span className="text-sm font-semibold text-indigo-600 tabular-nums">
                                                            {mb.percentage}%
                                                        </span>
                                                    </div>
                                                </div>
                                                {mb.reasoning && (
                                                    <p className="text-xs text-gray-600 mt-2 pl-11">
                                                        {mb.reasoning}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* AI Distribution Result - Without reasoning (simple view) */}
                        {budgetStrategy === "ai" && mealBudgets.length > 0 && !mealBudgets.some(mb => mb.reasoning) && (
                            <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                    Budget Allocation Preview
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {mealBudgets.map((mb) => {
                                        const config = MEAL_TYPE_CONFIG[mb.mealType];
                                        return (
                                            <div
                                                key={mb.mealType}
                                                className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm text-center"
                                            >
                                                <div className={`p-2.5 rounded-lg bg-gray-50 ${config.color} w-fit mx-auto mb-2`}>
                                                    <config.icon className="w-5 h-5" />
                                                </div>
                                                <p className="text-sm font-bold text-gray-700">
                                                    {config.label}
                                                </p>
                                                <p className="text-xl font-bold text-indigo-600 mt-1">
                                                    ₹{mb.budget}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {mb.percentage}%
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}


                        {/* Budget Progress Visualization */}
                        {mealBudgets.length > 0 && (
                            <div className="p-6 bg-gray-900 rounded-2xl text-white shadow-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <span className="text-sm font-medium text-gray-300 block">
                                            Total Allocated
                                        </span>
                                        <span className="text-2xl font-bold">
                                            ${totalAllocated.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-medium text-gray-300 block">
                                            Remaining
                                        </span>
                                        <span
                                            className={cn(
                                                "text-lg font-bold",
                                                remainingBudget < 0 ? "text-red-400" : "text-[#7dab4f]"
                                            )}
                                        >
                                            ${remainingBudget.toLocaleString()}
                                        </span>

                                    </div>
                                </div>
                                <div className="w-full bg-gray-700/50 rounded-full h-4 overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-500 ease-out",
                                            allocationPercentage > 100
                                                ? "bg-gradient-to-r from-red-500 to-red-400"
                                                : allocationPercentage > 90
                                                    ? "bg-gradient-to-r from-amber-500 to-amber-400"
                                                    : "bg-gradient-to-r from-indigo-500 to-purple-500"
                                        )}
                                        style={{
                                            width: `${Math.min(allocationPercentage, 100)}%`
                                        }}
                                    />
                                </div>
                                <div className="mt-2 flex justify-between text-xs">
                                    <span className="text-gray-400">
                                        {allocationPercentage}% of total budget
                                    </span>
                                    {allocationPercentage > 100 && (
                                        <span className="text-red-400 font-medium">
                                            Over budget!
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
                <Button
                    onClick={onBack}
                    variant="ghost"
                    className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-6 h-12 rounded-xl font-bold"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Button
                    onClick={onContinue}
                    disabled={mealBudgets.length === 0}
                    className="bg-[var(--primary)] hover:bg-indigo-700 text-white px-8 h-12 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02]"
                >
                    Continue to Recipes
                    <MoveRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </motion.div>
    );
};

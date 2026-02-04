"use client";

import React from "react";
import { Brain, Edit3, DollarSign, Wand2, Loader2, ArrowLeft, MoveRight, Sparkles, AlertTriangle, Percent, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MealBudgetAllocation, MIN_BUDGET_PERCENTAGES } from "./types";
import { MEAL_TYPE_CONFIG } from "./constants";
import { MealType } from "@/services/event/event.types";

interface BudgetDistributionSectionProps {
    budgetStrategy: "manual" | "ai";
    setBudgetStrategy: (value: "manual" | "ai") => void;
    totalBudget: number;
    setTotalBudget: (value: number) => void;
    mealBudgets: MealBudgetAllocation[];
    handleManualBudgetChange: (mealType: MealType, value: string) => void;
    handleManualPercentageChange: (mealType: MealType, value: string) => void;
    handleAIDistributeBudget: () => void;
    isAIDistributing: boolean;
    validationErrors: Partial<Record<MealType, string>>;
    aiRecommendations: string[];
    onBack: () => void;
    onContinue: () => void;
    canContinue: boolean;
}

export const BudgetDistributionSection: React.FC<BudgetDistributionSectionProps> = ({
    budgetStrategy,
    setBudgetStrategy,
    totalBudget,
    setTotalBudget,
    mealBudgets,
    handleManualBudgetChange,
    handleManualPercentageChange,
    handleAIDistributeBudget,
    isAIDistributing,
    validationErrors,
    aiRecommendations,
    onBack,
    onContinue,
    canContinue
}) => {
    const totalAllocated = mealBudgets.reduce((sum, mb) => sum + mb.budget, 0);
    const totalPercentage = mealBudgets.reduce((sum, mb) => sum + mb.percentage, 0);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 m-1"
        >
            {/* Budget Strategy */}
            <Card className="rounded-2xl border border-gray-200 shadow-sm bg-white overflow-hidden">
                <CardHeader className="pb-4 border-b border-gray-50 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 px-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm">
                            <DollarSign className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-gray-900">Budget Distribution</CardTitle>
                            <CardDescription>
                                Allocate your budget across selected meals
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-8 px-6">
                    <div className="space-y-8">
                        {/* Budget Strategy Selection */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Strategy</h4>
                            <RadioGroup
                                value={budgetStrategy}
                                onValueChange={(value: "manual" | "ai") => setBudgetStrategy(value)}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                <div
                                    className={cn(
                                        "flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md",
                                        budgetStrategy === "ai"
                                            ? "border-indigo-600 bg-indigo-50/50"
                                            : "border-gray-100 bg-white hover:border-gray-200"
                                    )}
                                    onClick={() => setBudgetStrategy("ai")}
                                >
                                    <RadioGroupItem value="ai" id="ai-strategy" className="text-indigo-600 border-indigo-600" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Brain className={cn("w-5 h-5", budgetStrategy === "ai" ? "text-indigo-600" : "text-gray-400")} />
                                            <Label htmlFor="ai-strategy" className="text-base font-bold text-gray-900 cursor-pointer">
                                                AI Optimized
                                            </Label>
                                            <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                                                <Sparkles className="w-3 h-3 mr-1" />
                                                Recommended
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1 pl-7">
                                            Smart distribution based on meal importance and dietary needs
                                        </p>
                                    </div>
                                </div>

                                <div
                                    className={cn(
                                        "flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md",
                                        budgetStrategy === "manual"
                                            ? "border-indigo-600 bg-indigo-50/50"
                                            : "border-gray-100 bg-white hover:border-gray-200"
                                    )}
                                    onClick={() => setBudgetStrategy("manual")}
                                >
                                    <RadioGroupItem value="manual" id="manual-strategy" className="text-indigo-600 border-indigo-600" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Edit3 className={cn("w-5 h-5", budgetStrategy === "manual" ? "text-indigo-600" : "text-gray-400")} />
                                            <Label htmlFor="manual-strategy" className="text-base font-bold text-gray-900 cursor-pointer">
                                                Manual Allocation
                                            </Label>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1 pl-7">
                                            Full control to distribute budget exactly as you want
                                        </p>
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Total Budget Input */}
                        {/* Total Budget Input */}
                        <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 p-6 rounded-xl border border-indigo-100/50 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <DollarSign className="w-16 h-16 text-indigo-600" />
                            </div>
                            <Label htmlFor="total-budget" className="text-sm font-bold text-gray-900 mb-2 block">
                                Total Event Budget ($)
                            </Label>
                            <div className="relative max-w-md">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    id="total-budget"
                                    type="number"
                                    readOnly
                                    value={totalBudget}
                                    onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 0)}
                                    className="pl-10 h-12 text-lg font-medium border-gray-200 bg-white focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                    placeholder="Enter total budget"
                                />
                            </div>
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
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Analyzing Event & Optimizing Budget...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-5 h-5 mr-2" />
                                        Distribute Budget with AI
                                    </>
                                )}
                            </Button>
                        )}

                        {/* AI Recommendations Display */}
                        {budgetStrategy === "ai" && aiRecommendations.length > 0 && (
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-5 text-white">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-2">AI Recommendations</h4>
                                        <ul className="space-y-1">
                                            {aiRecommendations.map((recommendation, idx) => (
                                                <li key={idx} className="text-sm text-white/90 flex items-start gap-2">
                                                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                    {recommendation}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Manual Budget Allocation with Percentage Input */}
                        {budgetStrategy === "manual" && (
                            <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Allocation Breakdown</h4>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Info className="w-4 h-4" />
                                        Set percentage for each meal (minimum limits apply)
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {mealBudgets.map((mb) => {
                                        const config = MEAL_TYPE_CONFIG[mb.mealType];
                                        const minPercentage = MIN_BUDGET_PERCENTAGES[mb.mealType];
                                        const hasError = validationErrors[mb.mealType];

                                        return (
                                            <div
                                                key={mb.mealType}
                                                className={cn(
                                                    "p-4 bg-white rounded-xl border-2 transition-all",
                                                    hasError
                                                        ? "border-red-300 bg-red-50/30"
                                                        : "border-gray-100 hover:border-gray-200"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-3 w-36">
                                                        <div className={`p-2.5 rounded-lg bg-gray-50 ${config.color}`}>
                                                            <config.icon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-bold text-gray-700 block">{config.label}</span>
                                                            <span className="text-xs text-gray-400">Min {minPercentage}%</span>
                                                        </div>
                                                    </div>

                                                    {/* Percentage Input */}
                                                    <div className="flex-1">
                                                        <Label className="text-xs text-gray-500 mb-1 block">Percentage</Label>
                                                        <div className="relative">
                                                            <Input
                                                                type="number"
                                                                min={minPercentage}
                                                                max={100}
                                                                value={mb.percentage}
                                                                onChange={(e) => handleManualPercentageChange(mb.mealType, e.target.value)}
                                                                className={cn(
                                                                    "w-full pr-8 font-semibold",
                                                                    hasError && "border-red-400 focus:border-red-500 focus:ring-red-500"
                                                                )}
                                                                placeholder="0"
                                                            />
                                                            <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        </div>
                                                    </div>

                                                    {/* Budget (Auto-calculated) */}
                                                    <div className="w-32">
                                                        <Label className="text-xs text-gray-500 mb-1 block">Amount</Label>
                                                        <div className="relative">
                                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                                            <Input
                                                                type="number"
                                                                value={mb.budget}
                                                                readOnly
                                                                className="w-full pl-8 font-semibold bg-gray-50 text-gray-700"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Error Message */}
                                                {hasError && (
                                                    <div className="flex items-center gap-2 mt-2 text-red-600 text-xs">
                                                        <AlertTriangle className="w-4 h-4" />
                                                        {hasError}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Total Percentage Validation */}
                                {totalPercentage !== 100 && mealBudgets.length > 0 && (
                                    <div className={cn(
                                        "flex items-center gap-2 p-3 rounded-lg text-sm",
                                        totalPercentage > 100
                                            ? "bg-red-50 text-red-700 border border-red-200"
                                            : "bg-amber-50 text-amber-700 border border-amber-200"
                                    )}>
                                        <AlertTriangle className="w-4 h-4" />
                                        Total allocation is {totalPercentage}%. {totalPercentage > 100 ? "Exceeds 100%!" : `${100 - totalPercentage}% remaining.`}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* AI Budget Allocation Display (Read-only for AI mode) */}
                        {budgetStrategy === "ai" && mealBudgets.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">AI-Optimized Allocation</h4>
                                <div className="space-y-3">
                                    {mealBudgets.map((mb) => {
                                        const config = MEAL_TYPE_CONFIG[mb.mealType];
                                        return (
                                            <div key={mb.mealType} className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-3 w-32">
                                                        <div className={`p-2 rounded-lg bg-white shadow-sm ${config.color}`}>
                                                            <config.icon className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-700">{config.label}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                                                style={{ width: `${mb.percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="text-sm font-bold text-indigo-700 w-16 text-right tabular-nums">
                                                        {mb.percentage}%
                                                    </div>
                                                    <div className="text-sm font-bold text-gray-900 w-20 text-right tabular-nums">
                                                        ${mb.budget}
                                                    </div>
                                                </div>
                                                {/* AI Reasoning */}
                                                {mb.reasoning && (
                                                    <div className="mt-2 pt-2 border-t border-indigo-100 text-xs text-gray-600">
                                                        <span className="font-semibold text-indigo-700">AI Insight:</span> {mb.reasoning}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Visualization */}
                        {mealBudgets.length > 0 && (
                            <div className="p-6 bg-gradient-to-br from-gray-900 to-indigo-950 rounded-xl text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-medium text-gray-300">Total Allocated</span>
                                        <span className="text-xl font-bold font-mono tracking-tight">
                                            ${totalAllocated.toLocaleString()}
                                            <span className="text-sm font-normal text-gray-400 ml-2 font-sans">
                                                of ${totalBudget.toLocaleString()}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700/50 rounded-full h-4 overflow-hidden shadow-inner">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-500 ease-out shadow-lg",
                                                totalAllocated > totalBudget
                                                    ? "bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/50"
                                                    : totalAllocated === totalBudget
                                                        ? "bg-gradient-to-r from-emerald-500 to-green-400 shadow-emerald-500/50"
                                                        : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-indigo-500/50"
                                            )}
                                            style={{
                                                width: `${Math.min((totalAllocated / totalBudget) * 100, 100)}%`
                                            }}
                                        />
                                    </div>
                                    <div className="mt-3 flex justify-between text-xs font-medium text-gray-400">
                                        <span>{Math.round((totalAllocated / totalBudget) * 100)}% Used</span>
                                        {totalAllocated < totalBudget && (
                                            <span className="text-emerald-400 flex items-center gap-1">
                                                <DollarSign className="w-3 h-3" />
                                                {(totalBudget - totalAllocated).toLocaleString()} available
                                            </span>
                                        )}
                                    </div>
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
                    disabled={!canContinue}
                    className={cn(
                        "px-8 h-12 rounded-xl font-bold shadow-lg transition-all",
                        canContinue
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-200 hover:scale-[1.02]"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    )}
                >
                    Continue to Recipes
                    <MoveRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </motion.div>
    );
};

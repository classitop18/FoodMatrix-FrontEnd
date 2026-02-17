"use client";

import React, { useMemo } from "react";
import { Brain, Edit3, DollarSign, Wand2, Loader2, ArrowLeft, MoveRight, Sparkles, AlertTriangle, Percent, CheckCircle2, Info, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CategoryBudgetAllocation, BudgetCategory, MIN_CATEGORY_PERCENTAGES } from "./types";
import { BUDGET_CATEGORIES } from "./constants";

interface BudgetDistributionSectionProps {
    budgetStrategy: "manual" | "ai";
    setBudgetStrategy: (value: "manual" | "ai") => void;
    totalBudget: number;
    setTotalBudget: (value: number) => void;
    categoryBudgets: CategoryBudgetAllocation[];
    handleCategoryBudgetChange: (category: BudgetCategory, value: string) => void;
    handleCategoryPercentageChange: (category: BudgetCategory, value: string) => void;
    handleAIDistributeBudget: () => void;
    isAIDistributing: boolean;
    validationErrors: Partial<Record<BudgetCategory, string>>;
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
    categoryBudgets,
    handleCategoryBudgetChange,
    handleCategoryPercentageChange,
    handleAIDistributeBudget,
    isAIDistributing,
    validationErrors,
    aiRecommendations,
    onBack,
    onContinue,
    canContinue
}) => {

    const totalAllocated = categoryBudgets.reduce((sum, cb) => sum + cb.budget, 0);
    const totalPercentage = categoryBudgets.reduce((sum, cb) => sum + cb.percentage, 0);
    const totalSpent = categoryBudgets.reduce((sum, cb) => sum + cb.spent, 0);

    // Check if budget is properly distributed (required validation)
    const isBudgetDistributed = useMemo(() => {
        if (categoryBudgets.length === 0) return false;
        if (budgetStrategy === "ai") {
            return categoryBudgets.every(cb => cb.budget > 0 && cb.percentage > 0);
        }
        if (budgetStrategy === "manual") {
            const hasValidationErrors = Object.keys(validationErrors).length > 0;
            return totalPercentage === 100 && !hasValidationErrors;
        }
    }, [categoryBudgets, budgetStrategy, totalPercentage, validationErrors]);

    // Get validation message for continue button
    const getValidationMessage = () => {
        if (categoryBudgets.length === 0) {
            return "No budget categories found";
        }
        if (budgetStrategy === "ai" && !categoryBudgets.every(cb => cb.budget > 0)) {
            return "Please click 'Distribute Budget with AI' to allocate budget";
        }
        if (budgetStrategy === "manual") {
            if (Object.keys(validationErrors).length > 0) {
                return "Please fix the validation errors above";
            }
            if (totalPercentage !== 100) {
                return `Total allocation must be 100% (currently ${totalPercentage}%)`;
            }
        }
        return null;
    };

    const validationMessage = getValidationMessage();
    const canProceed = canContinue && isBudgetDistributed;

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
                <CardHeader className="pb-4 border-b border-gray-100 bg-[var(--primary-bg)] px-6 pt-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100">
                            <DollarSign className="w-5 h-5 text-[var(--primary)]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-xl font-bold text-[#313131]">Budget Distribution</CardTitle>
                                <Badge className="bg-red-100 text-red-700 text-[10px] font-bold uppercase">Required</Badge>
                            </div>
                            <CardDescription className="text-gray-500">
                                Allocate your budget across menu categories — starters, main course, snacks, desserts, beverages
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 px-6 pb-8">
                    <div className="space-y-8">
                        {/* Budget Strategy Selection */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <h4 className="text-sm font-bold text-[#313131] uppercase tracking-wider">Distribution Strategy</h4>
                                <span className="text-red-500 text-sm">*</span>
                            </div>
                            <RadioGroup
                                value={budgetStrategy}
                                onValueChange={(value: "manual" | "ai") => setBudgetStrategy(value)}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                <div
                                    className={cn(
                                        "flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md",
                                        budgetStrategy === "ai"
                                            ? "border-[var(--primary)] bg-[var(--primary-bg)]"
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                    )}
                                    onClick={() => setBudgetStrategy("ai")}
                                >
                                    <RadioGroupItem value="ai" id="ai-strategy" className="text-[var(--primary)] border-[var(--primary)]" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Brain className={cn("w-5 h-5", budgetStrategy === "ai" ? "text-[var(--primary)]" : "text-gray-400")} />
                                            <Label htmlFor="ai-strategy" className="text-base font-bold text-[#313131] cursor-pointer">
                                                AI Optimized
                                            </Label>
                                            <Badge className="bg-[var(--primary-bg)] text-[var(--primary)] text-xs border border-[var(--primary-light)]/30">
                                                <Sparkles className="w-3 h-3 mr-1" />
                                                Recommended
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1 pl-7">
                                            Smart distribution based on menu importance and event type
                                        </p>
                                    </div>
                                </div>

                                <div
                                    className={cn(
                                        "flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md",
                                        budgetStrategy === "manual"
                                            ? "border-[var(--primary)] bg-[var(--primary-bg)]"
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                    )}
                                    onClick={() => setBudgetStrategy("manual")}
                                >
                                    <RadioGroupItem value="manual" id="manual-strategy" className="text-[var(--primary)] border-[var(--primary)]" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Edit3 className={cn("w-5 h-5", budgetStrategy === "manual" ? "text-[var(--primary)]" : "text-gray-400")} />
                                            <Label htmlFor="manual-strategy" className="text-base font-bold text-[#313131] cursor-pointer">
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
                        <div className="flex items-center gap-2 mb-2">
                            <Label htmlFor="total-budget" className="text-sm font-bold text-[#313131]">
                                Total Event Budget ($) {totalBudget}
                            </Label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">This is set from your event configuration</p>

                        {/* AI Distribution Button */}
                        {budgetStrategy === "ai" && (
                            <div className="space-y-3">
                                <Button
                                    onClick={handleAIDistributeBudget}
                                    disabled={isAIDistributing}
                                    className="w-full h-14 bg-[var(--primary)] hover:bg-[#2d2454] text-white rounded-xl font-bold shadow-lg transition-all hover:scale-[1.01]"
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
                            </div>
                        )}

                        {/* AI Recommendations Display */}
                        {budgetStrategy === "ai" && aiRecommendations.length > 0 && (
                            <div className="bg-[var(--primary)] rounded-xl p-5 text-white">
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

                        {/* Manual Budget Allocation — Course Categories */}
                        {budgetStrategy === "manual" && (
                            <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-bold text-[#313131] uppercase tracking-wider">Category Breakdown</h4>
                                        <span className="text-red-500 text-sm">*</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                                        <Info className="w-3.5 h-3.5" />
                                        Total must equal 100%
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {categoryBudgets.map((cb) => {
                                        const catConfig = BUDGET_CATEGORIES.find(bc => bc.value === cb.category);
                                        if (!catConfig) return null;
                                        const minPercentage = MIN_CATEGORY_PERCENTAGES[cb.category] || 0;
                                        const hasError = validationErrors[cb.category];
                                        const spentPercent = cb.budget > 0 ? Math.round((cb.spent / cb.budget) * 100) : 0;
                                        const isOverBudget = cb.spent > cb.budget && cb.budget > 0;

                                        return (
                                            <div
                                                key={cb.category}
                                                className={cn(
                                                    "p-4 bg-white rounded-xl border-2 transition-all",
                                                    hasError
                                                        ? "border-red-300 bg-red-50/30"
                                                        : isOverBudget
                                                            ? "border-amber-300 bg-amber-50/20"
                                                            : "border-gray-200 hover:border-gray-300"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-3 w-44">
                                                        <div className={`p-2.5 rounded-lg bg-[var(--primary-bg)] ${catConfig.color}`}>
                                                            <catConfig.icon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-bold text-[#313131] block">{catConfig.label}</span>
                                                            <span className="text-[10px] text-gray-400">{catConfig.description}</span>
                                                            <span className="text-[10px] text-gray-400 block">Min {minPercentage}%</span>
                                                        </div>
                                                    </div>

                                                    {/* Percentage Input */}
                                                    <div className="flex-1">
                                                        <Label className="text-xs text-gray-500 mb-1 block font-medium">Percentage <span className="text-red-500">*</span></Label>
                                                        <div className="relative">
                                                            <Input
                                                                type="number"
                                                                min={minPercentage}
                                                                max={100}
                                                                value={cb.percentage}
                                                                onChange={(e) => handleCategoryPercentageChange(cb.category, e.target.value)}
                                                                className={cn(
                                                                    "w-full pr-8 font-semibold border-gray-200 focus:border-[var(--primary)] focus:ring-[var(--primary)]",
                                                                    hasError && "border-red-400 focus:border-red-500 focus:ring-red-500"
                                                                )}
                                                                placeholder="0"
                                                            />
                                                            <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        </div>
                                                    </div>

                                                    {/* Budget (Auto-calculated) */}
                                                    <div className="w-28">
                                                        <Label className="text-xs text-gray-500 mb-1 block font-medium">Amount</Label>
                                                        <div className="relative">
                                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                                            <Input
                                                                type="number"
                                                                value={cb.budget}
                                                                readOnly
                                                                className="w-full pl-8 font-semibold bg-gray-50 text-[#313131] border-gray-200"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Spent Tracker */}
                                                    <div className="w-28">
                                                        <Label className="text-xs text-gray-500 mb-1 block font-medium">Spent</Label>
                                                        <div className={cn(
                                                            "px-3 py-2 rounded-lg text-sm font-bold text-center border",
                                                            isOverBudget
                                                                ? "bg-red-50 text-red-600 border-red-200"
                                                                : spentPercent >= 80
                                                                    ? "bg-amber-50 text-amber-600 border-amber-200"
                                                                    : "bg-green-50 text-green-600 border-green-200"
                                                        )}>
                                                            ${cb.spent.toFixed(0)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Over-budget warning */}
                                                {isOverBudget && (
                                                    <div className="flex items-center gap-2 mt-3 p-2 bg-amber-50 rounded-lg text-amber-700 text-xs border border-amber-200">
                                                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                                        <span>Over budget by ${(cb.spent - cb.budget).toFixed(2)} — you can still continue, this is just a warning</span>
                                                    </div>
                                                )}

                                                {/* Error Message */}
                                                {hasError && (
                                                    <div className="flex items-center gap-2 mt-3 p-2 bg-red-50 rounded-lg text-red-600 text-xs border border-red-100">
                                                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                                        <span>{hasError}</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Total Percentage Validation */}
                                {categoryBudgets.length > 0 && (
                                    <div className={cn(
                                        "flex items-center gap-2 p-4 rounded-xl text-sm font-medium",
                                        totalPercentage === 100
                                            ? "bg-green-50 text-green-700 border border-green-200"
                                            : totalPercentage > 100
                                                ? "bg-red-50 text-red-700 border border-red-200"
                                                : "bg-amber-50 text-amber-700 border border-amber-200"
                                    )}>
                                        {totalPercentage === 100 ? (
                                            <>
                                                <CheckCircle2 className="w-5 h-5" />
                                                <span>Perfect! Budget is fully allocated (100%)</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertTriangle className="w-5 h-5" />
                                                <span>
                                                    Total allocation is {totalPercentage}%.
                                                    {totalPercentage > 100
                                                        ? " Exceeds 100% - please reduce allocations."
                                                        : ` Allocate remaining ${100 - totalPercentage}% to continue.`
                                                    }
                                                </span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* AI Budget Allocation Display (Read-only for AI mode) */}
                        {budgetStrategy === "ai" && categoryBudgets.length > 0 && categoryBudgets.some(cb => cb.budget > 0) && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-[#313131] uppercase tracking-wider">AI-Optimized Allocation</h4>
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                </div>
                                <div className="space-y-3">
                                    {categoryBudgets.map((cb) => {
                                        const catConfig = BUDGET_CATEGORIES.find(bc => bc.value === cb.category);
                                        if (!catConfig) return null;
                                        const isOverBudget = cb.spent > cb.budget && cb.budget > 0;
                                        const spentPercent = cb.budget > 0 ? Math.round((cb.spent / cb.budget) * 100) : 0;

                                        return (
                                            <div key={cb.category} className="p-4 bg-[var(--primary-bg)] rounded-xl border border-[var(--primary-light)]/20">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-3 w-36">
                                                        <div className={`p-2 rounded-lg bg-white shadow-sm border border-gray-100 ${catConfig.color}`}>
                                                            <catConfig.icon className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-sm font-bold text-[#313131]">{catConfig.label}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                                            <div
                                                                className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
                                                                style={{ width: `${cb.percentage}%` }}
                                                            />
                                                        </div>
                                                        {/* Spent overlay bar */}
                                                        {cb.spent > 0 && (
                                                            <div className="w-full bg-transparent rounded-full h-1.5 mt-1 overflow-hidden">
                                                                <div
                                                                    className={cn(
                                                                        "h-full rounded-full transition-all duration-500",
                                                                        isOverBudget ? "bg-red-400" : spentPercent >= 80 ? "bg-amber-400" : "bg-green-400"
                                                                    )}
                                                                    style={{ width: `${Math.min(spentPercent, 100)}%` }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-sm font-bold text-[var(--primary)] w-16 text-right tabular-nums">
                                                        {cb.percentage}%
                                                    </div>
                                                    <div className="text-sm font-bold text-[#313131] w-20 text-right tabular-nums">
                                                        ${cb.budget}
                                                    </div>
                                                    <div className={cn(
                                                        "text-xs font-bold w-24 text-right tabular-nums",
                                                        isOverBudget ? "text-red-600" : "text-green-600"
                                                    )}>
                                                        Spent: ${cb.spent.toFixed(0)}
                                                    </div>
                                                </div>
                                                {/* AI Reasoning */}
                                                {cb.reasoning && (
                                                    <div className="mt-3 pt-3 border-t border-[var(--primary-light)]/20 text-xs text-gray-600">
                                                        <span className="font-semibold text-[var(--primary)]">AI Insight:</span> {cb.reasoning}
                                                    </div>
                                                )}
                                                {/* Over-budget warning */}
                                                {isOverBudget && (
                                                    <div className="flex items-center gap-2 mt-2 p-2 bg-amber-50 rounded-lg text-amber-700 text-xs border border-amber-200">
                                                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                                        <span>Over budget by ${(cb.spent - cb.budget).toFixed(2)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Visualization — Overall Budget */}
                        {categoryBudgets.length > 0 && categoryBudgets.some(cb => cb.budget > 0) && (
                            <div className="p-6 bg-[var(--primary)] rounded-xl text-white shadow-xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-medium text-white/80">Total Allocated</span>
                                        <span className="text-xl font-bold font-mono tracking-tight">
                                            ${totalAllocated.toLocaleString()}
                                            <span className="text-sm font-normal text-white/60 ml-2 font-sans">
                                                of ${totalBudget.toLocaleString()}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden shadow-inner">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-500 ease-out shadow-lg",
                                                totalAllocated > totalBudget
                                                    ? "bg-gradient-to-r from-red-400 to-red-500"
                                                    : totalAllocated === totalBudget
                                                        ? "bg-gradient-to-r from-green-400 to-emerald-400"
                                                        : "bg-gradient-to-r from-[var(--primary-light)] to-white/80"
                                            )}
                                            style={{
                                                width: `${Math.min((totalAllocated / totalBudget) * 100, 100)}%`
                                            }}
                                        />
                                    </div>
                                    {/* Spent bar underneath */}
                                    {totalSpent > 0 && (
                                        <div className="w-full bg-white/10 rounded-full h-2 mt-2 overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-500",
                                                    totalSpent > totalBudget ? "bg-red-400" : "bg-green-400"
                                                )}
                                                style={{
                                                    width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%`
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div className="mt-3 flex justify-between text-xs font-medium text-white/70">
                                        <span>{Math.round((totalAllocated / totalBudget) * 100)}% Allocated</span>
                                        {totalSpent > 0 && (
                                            <span className={totalSpent > totalBudget ? "text-red-300" : "text-green-300"}>
                                                ${totalSpent.toFixed(0)} spent
                                            </span>
                                        )}
                                        {totalAllocated < totalBudget && (
                                            <span className="text-green-300 flex items-center gap-1">
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
                    className="text-gray-600 hover:bg-gray-100 hover:text-[#313131] px-6 h-12 rounded-xl font-bold border border-gray-200"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Button
                    onClick={onContinue}
                    disabled={!canProceed}
                    className={cn(
                        "px-8 h-12 rounded-xl font-bold shadow-lg transition-all",
                        canProceed
                            ? "bg-[var(--primary)] hover:bg-[#2d2454] text-white hover:scale-[1.02]"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                    )}
                >
                    {validationMessage && (
                        <span className="mr-2 text-xs opacity-70">{validationMessage}</span>
                    )}
                    Continue to Recipes
                    <MoveRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </motion.div >
    );
};

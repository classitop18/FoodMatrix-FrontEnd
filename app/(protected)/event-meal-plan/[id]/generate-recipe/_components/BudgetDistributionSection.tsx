"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Brain, Edit3, DollarSign, Wand2, Loader2, ArrowLeft, MoveRight, Sparkles, AlertTriangle, Percent, CheckCircle2, AlertCircle, Trash2, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CategoryBudgetAllocation, BudgetCategory, MIN_CATEGORY_PERCENTAGES } from "./types";
import { BUDGET_CATEGORIES, MEAL_TYPE_CONFIG } from "./constants";
import { MealType } from "@/services/event/event.types";
import { toast } from "@/hooks/use-toast";

interface BudgetDistributionSectionProps {
    budgetStrategy: "manual" | "ai";
    setBudgetStrategy: (value: "manual" | "ai") => void;
    totalBudget: number;
    selectedMealTypes: MealType[];
    setTotalBudget: (value: number) => void;
    categoryBudgets: Record<MealType, CategoryBudgetAllocation[]>;
    handleCategoryBudgetChange: (mealType: MealType, category: BudgetCategory, value: string) => void;
    handleCategoryPercentageChange: (mealType: MealType, category: BudgetCategory, value: string) => void;
    handleAIDistributeBudget: () => void;
    isAIDistributing: boolean;
    validationErrors: Record<MealType, Partial<Record<BudgetCategory, string>>>;
    aiRecommendations: string[];
    onBack: () => void;
    onContinue: () => void;
    canContinue: boolean;
    isBudgetStale?: boolean; // New Prop
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
    canContinue,
    selectedMealTypes,
    isBudgetStale = false
}) => {
    const [activeTab, setActiveTab] = useState<MealType>(selectedMealTypes[0] || 'dinner');

    // Ensure active tab is valid if selectedMealTypes change
    useEffect(() => {
        if (selectedMealTypes.length > 0 && !selectedMealTypes.includes(activeTab)) {
            setActiveTab(selectedMealTypes[0]);
        }
    }, [selectedMealTypes, activeTab]);

    // Calculate totals for the ACTIVE Meal Tab
    const activeCategoryBudgets = categoryBudgets[activeTab] || [];
    const activeTotalAllocated = activeCategoryBudgets.reduce((sum, cb) => sum + cb.budget, 0);
    const activeTotalPercentage = activeCategoryBudgets.reduce((sum, cb) => sum + cb.percentage, 0);
    const activeTotalSpent = activeCategoryBudgets.reduce((sum, cb) => sum + cb.spent, 0);

    // Calculate Global Totals (sum of all meals' category allocations)
    const globalAllocated = useMemo(() => {
        let total = 0;
        Object.values(categoryBudgets).forEach(cats => {
            total += cats.reduce((sum, cb) => sum + cb.budget, 0);
        });
        return total;
    }, [categoryBudgets]);

    const activeMealErrors = validationErrors[activeTab] || {};

    // Get validation message for continue button
    const getValidationMessage = () => {
        if (!selectedMealTypes.length) return "No meals selected";

        if (budgetStrategy === "ai") {
            if (isBudgetStale) return "Budget changed! Please click 'Distribute Budget with AI' to update.";

            const hasZeroBudget = Object.values(categoryBudgets).some(cats => cats.every(cb => cb.budget === 0));
            if (hasZeroBudget) return "Please click 'Distribute Budget with AI' to allocate budget";
        }

        if (budgetStrategy === "manual") {
            // Check errors across ALL meals
            for (const mealType of selectedMealTypes) {
                const errors = validationErrors[mealType] || {};
                if (Object.keys(errors).length > 0) {
                    return `Fix errors in ${MEAL_TYPE_CONFIG[mealType]?.label || mealType}`;
                }
                const cats = categoryBudgets[mealType] || [];
                const totalPct = cats.reduce((s, c) => s + c.percentage, 0);
                if (totalPct !== 100 && cats.length > 0) { // Only check if cats exist
                    return `${MEAL_TYPE_CONFIG[mealType]?.label || mealType} allocation must be 100%`;
                }
            }
        }
        return null;
    };

    const validationMessage = getValidationMessage();

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 m-1"
        >
            {/* Header Card */}
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
                                Allocate your budget across menu categories for each meal.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-6 px-6 pb-8">
                    <div className="space-y-8">
                        {/* Strategy Selection */}
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
                                            Smart distribution based on meal types and preferences
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
                                            Full control over every category per meal
                                        </p>
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* AI Button */}
                        {budgetStrategy === "ai" && (
                            <div className="space-y-3">
                                <Button
                                    onClick={handleAIDistributeBudget}
                                    disabled={isAIDistributing}
                                    className={cn(
                                        "w-full h-14 text-white rounded-xl font-bold shadow-lg transition-all hover:scale-[1.01]",
                                        "bg-[var(--primary)] hover:bg-[#2d2454]"
                                    )}
                                >
                                    {isAIDistributing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Analyzing Event & Optimizing...
                                        </>
                                    ) : (
                                        <>
                                            {isBudgetStale ? <RotateCcw className="w-5 h-5 mr-2" /> : <Wand2 className="w-5 h-5 mr-2" />}
                                            {isBudgetStale ? "Recalculate Budget with AI" : "Distribute Budget with AI"}
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* Total Budget Display */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Event Budget</p>
                                <p className="text-2xl font-bold text-[#313131]">${totalBudget.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 font-medium">Allocated So Far</p>
                                <p className={cn(
                                    "text-xl font-bold",
                                    globalAllocated > totalBudget ? "text-red-600" : "text-green-600"
                                )}>
                                    ${globalAllocated.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* TABS for Meal Types */}
                        {selectedMealTypes.length > 0 && (
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MealType)} className="w-full">
                                <TabsList className="w-full grid" style={{ gridTemplateColumns: `repeat(${selectedMealTypes.length}, 1fr)` }}>
                                    {selectedMealTypes.map(mt => (
                                        <TabsTrigger
                                            key={mt}
                                            value={mt}
                                            className="data-[state=active]:!bg-[var(--primary)] data-[state=active]:!text-white font-semibold"
                                        >
                                            {MEAL_TYPE_CONFIG[mt]?.label || mt}
                                            {validationErrors[mt] && Object.keys(validationErrors[mt]!).length > 0 && (
                                                <div className="ml-2 w-2 h-2 rounded-full bg-red-500" />
                                            )}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {selectedMealTypes.map(mealType => {
                                    const cats = categoryBudgets[mealType] || [];
                                    const mealTotalPct = cats.reduce((s, c) => s + c.percentage, 0);
                                    const mealTotalAllocated = cats.reduce((s, c) => s + c.budget, 0);

                                    return (
                                        <TabsContent key={mealType} value={mealType} className="mt-6 space-y-6 animate-in fade-in-50 duration-300">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-gray-800">
                                                    {MEAL_TYPE_CONFIG[mealType]?.label} Breakdown
                                                    <span className="ml-2 text-sm font-normal text-gray-500">
                                                        (Total Allocated: ${mealTotalAllocated})
                                                    </span>
                                                </h4>

                                                {/* Meal Validation Badge */}
                                                <div className={cn(
                                                    "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold",
                                                    mealTotalPct === 100
                                                        ? "bg-green-100 text-green-700 border border-green-200"
                                                        : "bg-amber-100 text-amber-700 border border-amber-200"
                                                )}>
                                                    {mealTotalPct === 100 ? (
                                                        <>
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            <span>100% Allocated</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <AlertTriangle className="w-3.5 h-3.5" />
                                                            <span>{mealTotalPct}% Allocated ({100 - mealTotalPct}% remaining)</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {cats.map((cb) => {
                                                    const catConfig = BUDGET_CATEGORIES.find(bc => bc.value === cb.category);
                                                    if (!catConfig) return null;

                                                    const minPercentage = MIN_CATEGORY_PERCENTAGES[cb.category] || 0;
                                                    // Fix: Force spent to 0 if Strategy is AI
                                                    const currentSpent = budgetStrategy === "ai" ? 0 : cb.spent;

                                                    const hasError = validationErrors[mealType]?.[cb.category];
                                                    const spentPercent = cb.budget > 0 ? Math.round((currentSpent / cb.budget) * 100) : 0;
                                                    const isOverBudget = currentSpent > cb.budget && cb.budget > 0;
                                                    const isZero = cb.percentage === 0;

                                                    return (
                                                        <div
                                                            key={`${mealType}-${cb.category}`}
                                                            className={cn(
                                                                "group relative p-4 rounded-2xl border transition-all duration-300",
                                                                hasError
                                                                    ? "border-red-200 bg-red-50/50"
                                                                    : isOverBudget
                                                                        ? "border-amber-200 bg-amber-50/50"
                                                                        : isZero
                                                                            ? "border-gray-100 bg-gray-50/50 opacity-80"
                                                                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                {/* Icon & Label */}
                                                                <div className="flex items-center gap-4 w-1/4 min-w-[180px]">
                                                                    <div className={cn(
                                                                        "p-3 rounded-xl shadow-sm transition-colors",
                                                                        isZero ? "bg-gray-100 text-gray-400" : `bg-white border border-gray-100 ${catConfig.color}`
                                                                    )}>
                                                                        <catConfig.icon className="w-5 h-5" />
                                                                    </div>
                                                                    <div>
                                                                        <span className={cn(
                                                                            "text-sm font-bold block",
                                                                            isZero ? "text-gray-400" : "text-gray-800"
                                                                        )}>
                                                                            {catConfig.label}
                                                                        </span>
                                                                        <span className="text-[10px] text-gray-400 font-medium">
                                                                            {catConfig.description}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* Controls - Manual vs AI */}
                                                                <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                                                                    {budgetStrategy === "manual" ? (
                                                                        <>
                                                                            {/* Percentage Input */}
                                                                            <div className="col-span-5">
                                                                                <Label className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1.5 block">Allocation %</Label>
                                                                                <div className="relative group/input">
                                                                                    <Input
                                                                                        type="number"
                                                                                        min={0}
                                                                                        max={100}
                                                                                        value={cb.percentage}
                                                                                        disabled={isZero && cb.category !== "main_course"} // Disable input if "removed" unless re-enabled
                                                                                        onChange={(e) => handleCategoryPercentageChange(mealType, cb.category, e.target.value)}
                                                                                        className={cn(
                                                                                            "h-10 pr-8 font-bold border-gray-200 bg-gray-50/50 focus:bg-white transition-all",
                                                                                            isZero && "text-gray-400 bg-transparent border-dashed",
                                                                                            hasError && "border-red-300 ring-1 ring-red-100"
                                                                                        )}
                                                                                        placeholder="0"
                                                                                    />
                                                                                    <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                                                                </div>
                                                                            </div>

                                                                            {/* Budget Display */}
                                                                            <div className="col-span-4">
                                                                                <Label className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1.5 block">Budget</Label>
                                                                                <div className="relative">
                                                                                    <div className={cn(
                                                                                        "h-10 px-3 flex items-center rounded-lg border border-transparent bg-gray-100/50 font-bold text-gray-700",
                                                                                        isZero && "text-gray-400"
                                                                                    )}>
                                                                                        <span className="text-gray-400 mr-1">$</span>
                                                                                        {cb.budget}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        // AI / Read Only View
                                                                        <div className="col-span-9 flex items-center gap-4">
                                                                            <div className="flex-1">
                                                                                <div className="flex justify-between mb-1.5">
                                                                                    <span className="text-xs font-medium text-gray-500">AI Suggested</span>
                                                                                    <span className="text-xs font-bold text-[var(--primary)]">{cb.percentage}%</span>
                                                                                </div>
                                                                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                                                    <div
                                                                                        className={cn("h-full rounded-full transition-all duration-500", isZero ? "bg-gray-300" : "bg-[var(--primary)]")}
                                                                                        style={{ width: `${cb.percentage}%` }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div className="px-3 py-1.5 bg-[var(--primary-bg)] rounded-lg border border-[var(--primary-light)]/20">
                                                                                <span className="text-sm font-bold text-[var(--primary)]">${cb.budget}</span>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Spent Tracker */}
                                                                    <div className={cn("col-span-3", budgetStrategy === "ai" ? "" : "")}>
                                                                        <Label className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1.5 block">Spent</Label>
                                                                        <div className={cn(
                                                                            "h-10 flex items-center justify-center rounded-lg border text-sm font-bold transition-colors",
                                                                            isOverBudget
                                                                                ? "bg-red-50 text-red-600 border-red-200"
                                                                                : spentPercent >= 80
                                                                                    ? "bg-amber-50 text-amber-600 border-amber-200"
                                                                                    : "bg-green-50/50 text-green-600 border-green-200/50"
                                                                        )}>
                                                                            ${currentSpent.toFixed(0)}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Add/Remove Action - Outside the grid for cleaner alignment */}

                                                                <div className="w-14 flex justify-end">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className={cn(
                                                                            "h-10 w-10 rounded-xl transition-all duration-300",
                                                                            isZero
                                                                                ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:scale-105 shadow-sm border border-indigo-100"
                                                                                : "text-gray-300 hover:bg-red-50 hover:text-red-500 hover:border-red-100 border border-transparent"
                                                                        )}
                                                                        onClick={() => {
                                                                            if (cb.category === "main_course") {
                                                                                toast({
                                                                                    title: "Main Course Required",
                                                                                    description: "The Main Course category cannot be removed. Please allocate a percentage to it.",
                                                                                    variant: "destructive",
                                                                                })
                                                                            }
                                                                            else {
                                                                                handleCategoryPercentageChange(
                                                                                    mealType,
                                                                                    cb.category,
                                                                                    isZero ? (Math.max(MIN_CATEGORY_PERCENTAGES[cb.category] || 5, 10)).toString() : "0"
                                                                                )
                                                                            }
                                                                        }}
                                                                        title={isZero ? "Enable Category" : "Remove Category"}
                                                                    >
                                                                        {isZero ? <Plus className="w-5 h-5" /> : <Trash2 className="w-4 h-4" />}
                                                                    </Button>
                                                                </div>

                                                            </div>

                                                            {/* Error Message Footer */}
                                                            <AnimatePresence>
                                                                {hasError && (
                                                                    <motion.div
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: "auto", opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        className="flex items-center gap-2 mt-3 pt-3 border-t border-red-100 text-red-600 text-xs font-medium"
                                                                    >
                                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                                        <span>{hasError}</span>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </TabsContent>
                                    );
                                })}
                            </Tabs>
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
                    disabled={!canContinue || (budgetStrategy === "ai" && isBudgetStale)}
                    className={cn(
                        "px-8 h-12 rounded-xl font-bold shadow-lg transition-all",
                        canContinue
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
        </motion.div>
    );
};



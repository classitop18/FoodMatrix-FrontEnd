import React, { useState } from "react";
import { Sparkles, ArrowLeft, Loader2, CheckCircle, Search, Clock, DollarSign, ChefHat, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GeneratedRecipeForMeal, MealBudgetAllocation } from "./types";
import { MEAL_TYPE_CONFIG } from "./constants";
import { MealType } from "@/services/event/event.types";
import { cuisineOptions } from "@/lib/recipe-constants";

interface RecipeSelectionSectionProps {
    globalCuisine: string;
    setGlobalCuisine: (value: string) => void;
    selectedMealTypes: MealType[];
    handleGenerateRecipesForMeal: (mealType: MealType, customSearch?: string) => Promise<void>;
    activeMealTab: MealType;
    setActiveMealTab: (value: MealType) => void;
    mealRecipes: GeneratedRecipeForMeal[];
    mealBudgets: MealBudgetAllocation[];
    handleSelectRecipeForMeal: (mealType: MealType, recipeId: string) => void;
    onBack: () => void;
    handleSaveAllRecipes: () => Promise<void>;
    isSavingAll: boolean;
    getSelectedCount: () => number;
}

export const RecipeSelectionSection: React.FC<RecipeSelectionSectionProps> = ({
    globalCuisine,
    setGlobalCuisine,
    selectedMealTypes,
    handleGenerateRecipesForMeal,
    activeMealTab,
    setActiveMealTab,
    mealRecipes,
    mealBudgets,
    handleSelectRecipeForMeal,
    onBack,
    handleSaveAllRecipes,
    isSavingAll,
    getSelectedCount
}) => {
    // Local state for search inputs per tab is not strictly needed if we pass "customSearch" directly to generation
    // But for UI feedback (controlled input), we might want it. 
    // The original code passed `e.currentTarget.value` directly on Enter key. I will stick to that patterning.

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 m-1"
        >
            {/* Global Settings */}
            <Card className="rounded-2xl border border-gray-200 shadow-sm bg-white overflow-hidden p-5">
                <CardHeader className="pb-4 border-b border-gray-50 bg-gray-50/50">
                    <CardTitle className="text-xl font-bold text-gray-900">Recipe Generation Settings</CardTitle>
                    <CardDescription>
                        Configure global preferences for all recipes
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 pb-6">
                    <div className="flex flex-col md:flex-row gap-6 items-end">
                        {/* Cuisine Selection */}
                        <div className="flex-1 w-full">
                            <Label htmlFor="cuisine" className="text-sm font-bold text-gray-900 mb-2 block">
                                Preferred Cuisine
                            </Label>
                            <Select
                                value={globalCuisine}
                                onValueChange={setGlobalCuisine}
                            >
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select cuisine preference" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Cuisines</SelectItem>
                                    {cuisineOptions.map((cuisine) => (
                                        <SelectItem key={cuisine.value} value={cuisine.value}>
                                            {cuisine.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Generate All Button */}
                        <Button
                            onClick={() => Promise.all(
                                selectedMealTypes.map(mealType =>
                                    handleGenerateRecipesForMeal(mealType)
                                )
                            )}
                            className="bg-[var(--primary)] hover:bg-indigo-700 text-white h-11 px-6 rounded-lg font-bold shadow-md shadow-indigo-100 w-full md:w-auto"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate All Recipes
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Meal Type Tabs */}
            <Tabs value={activeMealTab} onValueChange={(value) => setActiveMealTab(value as MealType)}>
                <div className="overflow-x-auto pb-2 scrollbar-hide">
                    <TabsList className="w-[max-content] md:w-full flex md:grid md:grid-cols-4 lg:grid-cols-7 h-auto bg-transparent gap-2 p-0">
                        {selectedMealTypes.map((mealType) => {
                            const config = MEAL_TYPE_CONFIG[mealType];
                            const mealRecipesData = mealRecipes.find(mr => mr.mealType === mealType);
                            const hasSelected = mealRecipesData?.selectedRecipeId;
                            const isActive = activeMealTab === mealType;

                            return (
                                <TabsTrigger
                                    key={mealType}
                                    value={mealType}
                                    className={cn(
                                        "flex items-center gap-2 py-3 px-4 rounded-xl border transition-all min-w-[120px]",
                                        isActive
                                            ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-md shadow-indigo-200"
                                            : hasSelected
                                                ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                                                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                    )}
                                >
                                    <config.icon className={cn("w-4 h-4", isActive ? "text-white" : hasSelected ? "text-green-600" : "text-gray-500")} />
                                    <span className="text-sm font-bold">{config.label}</span>
                                    {hasSelected && !isActive && (
                                        <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                                    )}
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>
                </div>

                {/* Meal Type Content */}
                {selectedMealTypes.map((mealType) => (
                    <TabsContent key={mealType} value={mealType} className="mt-6 focus-visible:ring-0">
                        <Card className="rounded-2xl border border-gray-200 shadow-sm bg-white overflow-hidden">
                            <CardHeader className="pb-4 border-b border-gray-50 bg-gray-50/50">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                            {(() => {
                                                const config = MEAL_TYPE_CONFIG[mealType];
                                                const Icon = config.icon;
                                                return <Icon className="w-6 h-6 text-indigo-600" />;
                                            })()}
                                            {MEAL_TYPE_CONFIG[mealType].label} Selection
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            Select a recipe for this meal or generate new options
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Budget</span>
                                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 font-bold text-sm hover:bg-indigo-100">
                                            <Wallet className="w-3.5 h-3.5 mr-1.5" />
                                            ${mealBudgets.find(mb => mb.mealType === mealType)?.budget || 0}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-6">
                                    {/* Search and Generate */}
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1 relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                placeholder={`Search specific recipe for ${MEAL_TYPE_CONFIG[mealType].label}...`}
                                                className="pl-10 h-11"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleGenerateRecipesForMeal(mealType, e.currentTarget.value);
                                                    }
                                                }}
                                            />
                                        </div>
                                        <Button
                                            onClick={() => handleGenerateRecipesForMeal(mealType)}
                                            disabled={mealRecipes.find(mr => mr.mealType === mealType)?.isGenerating}
                                            className="bg-[var(--primary)] hover:bg-indigo-700 text-white h-11 px-6 font-semibold"
                                        >
                                            {mealRecipes.find(mr => mr.mealType === mealType)?.isGenerating ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-4 h-4 mr-2" />
                                                    Generate Suggestions
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    {/* Recipes Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {mealRecipes.find(mr => mr.mealType === mealType)?.recipes && mealRecipes.find(mr => mr.mealType === mealType)!.recipes.length > 0 ? (
                                            mealRecipes.find(mr => mr.mealType === mealType)!.recipes.map((recipe) => {
                                                const isSelected = mealRecipes.find(mr => mr.mealType === mealType)?.selectedRecipeId === recipe.id;

                                                return (
                                                    <Card
                                                        key={recipe.id}
                                                        className={cn(
                                                            "rounded-xl border-2 cursor-pointer transition-all hover:shadow-md duration-300 relative overflow-hidden group",
                                                            isSelected
                                                                ? "border-[var(--primary)] bg-indigo-50/30"
                                                                : "border-gray-200 hover:border-indigo-200"
                                                        )}
                                                        onClick={() => handleSelectRecipeForMeal(mealType, recipe.id)}
                                                    >
                                                        {isSelected && (
                                                            <div className="absolute top-3 right-3 z-10">
                                                                <div className="bg-[var(--primary)] text-white p-1 rounded-full shadow-lg">
                                                                    <CheckCircle className="w-4 h-4" />
                                                                </div>
                                                            </div>
                                                        )}
                                                        <CardHeader className="pb-3 pt-4 px-4">
                                                            <CardTitle className={cn("text-base font-bold line-clamp-1 transition-colors", isSelected ? "text-indigo-700" : "text-gray-900 group-hover:text-indigo-600")}>
                                                                {recipe.name}
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="px-4 pb-4 pt-0">
                                                            <div className="space-y-4">
                                                                <p className="text-xs text-gray-500 line-clamp-3 min-h-[3rem]">
                                                                    {recipe.description}
                                                                </p>
                                                                <div className="flex items-center justify-between text-xs font-medium pt-2 border-t border-gray-100">
                                                                    <div className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                                                        <Clock className="w-3.5 h-3.5" />
                                                                        <span>{recipe.cookingTime || '30 min'}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                                                        <DollarSign className="w-3.5 h-3.5" />
                                                                        <span>{recipe.price || 'Budget Friendly'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })
                                        ) : (
                                            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                                    <ChefHat className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">No recipes yet</h3>
                                                <p className="text-gray-500 max-w-sm mx-auto mb-6 text-sm">
                                                    Click “Generate Suggestions” to let AI create perfect recipes for your {MEAL_TYPE_CONFIG[mealType].label}.
                                                </p>
                                                <Button
                                                    onClick={() => handleGenerateRecipesForMeal(mealType)}
                                                    variant="outline"
                                                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-semibold"
                                                >
                                                    Start Generating
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>

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
                    onClick={handleSaveAllRecipes}
                    disabled={isSavingAll || getSelectedCount() === 0}
                    className="bg-[var(--primary)] hover:bg-indigo-700 text-white px-8 h-12 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02]"
                >
                    {isSavingAll ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Finalizing...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Save {getSelectedCount()} Recipe{getSelectedCount() !== 1 ? 's' : ''}
                        </>
                    )}
                </Button>
            </div>
        </motion.div>
    );
};


"use client";

import React, { useState } from "react";
import {
    Sparkles,
    ArrowLeft,
    Loader2,
    CheckCircle,
    Search,
    Clock,
    DollarSign,
    ChefHat,
    Wallet,
    Heart,
    Utensils,
    Users,
    AlertCircle,
    RefreshCw,
    Flame,
    Leaf,
    Star,
    Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { GeneratedRecipeForMeal, MealBudgetAllocation, GeneratedRecipe } from "./types";
import { MEAL_TYPE_CONFIG, CUISINE_OPTIONS } from "./constants";
import { MealType } from "@/services/event/event.types";

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

// Recipe Card Component
const RecipeCard: React.FC<{
    recipe: GeneratedRecipe;
    isSelected: boolean;
    onSelect: () => void;
}> = ({ recipe, isSelected, onSelect }) => {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <Card
            className={cn(
                "rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg duration-300 relative overflow-hidden group",
                isSelected
                    ? "border-indigo-600 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 shadow-md"
                    : "border-gray-200 hover:border-indigo-300"
            )}
            onClick={onSelect}
        >
            {/* Selection Indicator */}
            {isSelected && (
                <div className="absolute top-3 right-3 z-10">
                    <div className="bg-indigo-600 text-white p-1.5 rounded-full shadow-lg animate-in zoom-in duration-200">
                        <CheckCircle className="w-4 h-4" />
                    </div>
                </div>
            )}

            {/* Health Score Badge */}
            {recipe.healthScore && (
                <div className="absolute top-3 left-3 z-10">
                    <Badge
                        className={cn(
                            "text-xs font-semibold shadow-sm",
                            recipe.healthScore >= 80
                                ? "bg-green-100 text-green-700 border-green-200"
                                : recipe.healthScore >= 60
                                    ? "bg-amber-100 text-amber-700 border-amber-200"
                                    : "bg-gray-100 text-gray-700 border-gray-200"
                        )}
                    >
                        <Heart className="w-3 h-3 mr-1" />
                        {recipe.healthScore}
                    </Badge>
                </div>
            )}

            {/* Recipe Content */}
            <CardHeader className="pb-3 pt-10 px-4">
                <CardTitle
                    className={cn(
                        "text-base font-bold line-clamp-2 transition-colors min-h-[2.5rem]",
                        isSelected
                            ? "text-indigo-700"
                            : "text-gray-900 group-hover:text-indigo-600"
                    )}
                >
                    {recipe.name}
                </CardTitle>
                {recipe.cuisineType && (
                    <Badge variant="outline" className="w-fit text-xs mt-1">
                        {recipe.cuisineType}
                    </Badge>
                )}
            </CardHeader>

            <CardContent className="px-4 pb-4 pt-0">
                <div className="space-y-4">
                    {/* Description */}
                    <p className="text-xs text-gray-500 line-clamp-2 min-h-[2rem]">
                        {recipe.description || "Delicious recipe perfect for your event."}
                    </p>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>{recipe.cookingTime || recipe.totalTimeMinutes ? `${recipe.totalTimeMinutes} min` : '30 min'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                            <Users className="w-3.5 h-3.5 text-gray-400" />
                            <span>{recipe.servings} servings</span>
                        </div>
                    </div>

                    {/* Cost & Difficulty */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                        <div className={cn(
                            "flex items-center gap-1.5 font-medium px-2 py-1 rounded-md",
                            recipe.estimatedCost
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-50 text-gray-600"
                        )}>
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>
                                {recipe.estimatedCost
                                    ? `₹${recipe.estimatedCost}`
                                    : recipe.price || 'Budget Friendly'
                                }
                            </span>
                        </div>
                        {recipe.difficultyLevel && (
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "text-xs",
                                    recipe.difficultyLevel === "easy"
                                        ? "bg-green-100 text-green-700"
                                        : recipe.difficultyLevel === "medium"
                                            ? "bg-amber-100 text-amber-700"
                                            : "bg-red-100 text-red-700"
                                )}
                            >
                                {recipe.difficultyLevel}
                            </Badge>
                        )}
                    </div>

                    {/* Nutrition Preview */}
                    {recipe.nutrition && (
                        <div className="flex items-center gap-2 text-xs">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-md cursor-help">
                                            <Flame className="w-3 h-3" />
                                            <span>{recipe.nutrition.calories} cal</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Calories per serving</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md cursor-help">
                                            <span className="font-semibold">P</span>
                                            <span>{recipe.nutrition.protein_g}g</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Protein per serving</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            {recipe.nutritionalHighlights && recipe.nutritionalHighlights.length > 0 && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md cursor-help">
                                                <Leaf className="w-3 h-3" />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                            <ul className="text-xs space-y-1">
                                                {recipe.nutritionalHighlights.slice(0, 3).map((h, i) => (
                                                    <li key={i}>• {h}</li>
                                                ))}
                                            </ul>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    )}

                    {/* Health Considerations */}
                    {recipe.healthConsiderations && recipe.healthConsiderations.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {recipe.healthConsiderations.slice(0, 2).map((consideration, idx) => (
                                <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                                >
                                    {consideration}
                                </Badge>
                            ))}
                            {recipe.healthConsiderations.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                    +{recipe.healthConsiderations.length - 2} more
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* Event Recommendations */}
                    {recipe.eventRecommendations && recipe.eventRecommendations.length > 0 && (
                        <div className="bg-indigo-50/50 rounded-lg p-2 border border-indigo-100">
                            <div className="flex items-start gap-1.5 text-xs text-indigo-700">
                                <Star className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-2">
                                    {recipe.eventRecommendations[0]}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>

            {/* Selection Overlay Effect */}
            {isSelected && (
                <div className="absolute inset-0 bg-indigo-600/5 pointer-events-none" />
            )}
        </Card>
    );
};

// Empty State Component
const EmptyRecipeState: React.FC<{
    mealType: MealType;
    onGenerate: () => void;
    isGenerating: boolean;
    error?: string;
}> = ({ mealType, onGenerate, isGenerating, error }) => (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white">
        {error ? (
            <>
                <div className="bg-red-100 p-4 rounded-full shadow-sm mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Generation Failed</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-6 text-sm">
                    {error}
                </p>
                <Button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    <RefreshCw className={cn("w-4 h-4 mr-2", isGenerating && "animate-spin")} />
                    Try Again
                </Button>
            </>
        ) : (
            <>
                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-4 rounded-full shadow-sm mb-4">
                    <ChefHat className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No recipes yet</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-6 text-sm">
                    Click "Generate Suggestions" to let AI create perfect recipes for your{" "}
                    {MEAL_TYPE_CONFIG[mealType].label} based on your event&apos;s requirements.
                </p>
                <Button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Start Generating
                        </>
                    )}
                </Button>
            </>
        )}
    </div>
);

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
    const [searchInputs, setSearchInputs] = useState<Record<MealType, string>>({} as Record<MealType, string>);

    const handleSearchChange = (mealType: MealType, value: string) => {
        setSearchInputs(prev => ({ ...prev, [mealType]: value }));
    };

    const handleSearchSubmit = (mealType: MealType) => {
        handleGenerateRecipesForMeal(mealType, searchInputs[mealType]);
    };

    const totalMeals = selectedMealTypes.length;
    const completedMeals = mealRecipes.filter(mr => mr.selectedRecipeId).length;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Global Settings Card */}
            <Card className="rounded-2xl border border-gray-200 shadow-sm bg-white overflow-hidden">
                <CardHeader className="pb-4 border-b border-gray-50 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-gray-900">
                                AI Recipe Generation
                            </CardTitle>
                            <CardDescription>
                                Generate personalized recipes for each meal type
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 px-6">
                    <div className="flex flex-col md:flex-row gap-6 items-end">
                        {/* Cuisine Selection */}
                        <div className="flex-1 w-full">
                            <Label htmlFor="cuisine" className="text-sm font-bold text-gray-900 mb-2 block">
                                Preferred Cuisine
                            </Label>
                            <Select value={globalCuisine} onValueChange={setGlobalCuisine}>
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select cuisine preference" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">🌍 All Cuisines</SelectItem>
                                    {CUISINE_OPTIONS.map((cuisine) => (
                                        <SelectItem key={cuisine.value} value={cuisine.value}>
                                            {cuisine.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Progress Indicator */}
                        <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="text-sm">
                                    <span className="font-bold text-indigo-600">{completedMeals}</span>
                                    <span className="text-gray-500">/{totalMeals} meals selected</span>
                                </div>
                                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                                        style={{ width: `${(completedMeals / totalMeals) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Generate All Button */}
                        <Button
                            onClick={() => Promise.all(
                                selectedMealTypes.map(mealType =>
                                    handleGenerateRecipesForMeal(mealType)
                                )
                            )}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-11 px-6 rounded-lg font-bold shadow-md w-full md:w-auto"
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
                    <TabsList className="w-[max-content] md:w-full flex md:grid md:grid-cols-4 lg:grid-cols-7 h-auto bg-transparent gap-2 p-1">
                        {selectedMealTypes.map((mealType) => {
                            const config = MEAL_TYPE_CONFIG[mealType];
                            const mealRecipesData = mealRecipes.find(mr => mr.mealType === mealType);
                            const hasSelected = mealRecipesData?.selectedRecipeId;
                            const hasRecipes = mealRecipesData?.recipes && mealRecipesData.recipes.length > 0;
                            const isActive = activeMealTab === mealType;
                            const isGenerating = mealRecipesData?.isGenerating;

                            return (
                                <TabsTrigger
                                    key={mealType}
                                    value={mealType}
                                    className={cn(
                                        "flex items-center gap-2 py-3 px-4 rounded-xl border transition-all min-w-[130px] relative",
                                        isActive
                                            ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                            : hasSelected
                                                ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                                                : hasRecipes
                                                    ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                    )}
                                >
                                    {isGenerating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <config.icon className={cn(
                                            "w-4 h-4",
                                            isActive ? "text-white" : hasSelected ? "text-green-600" : "text-gray-500"
                                        )} />
                                    )}
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
                <AnimatePresence mode="wait">
                    {selectedMealTypes.map((mealType) => {
                        const mealRecipesData = mealRecipes.find(mr => mr.mealType === mealType);
                        const config = MEAL_TYPE_CONFIG[mealType];
                        const mealBudget = mealBudgets.find(mb => mb.mealType === mealType);

                        return (
                            <TabsContent key={mealType} value={mealType} className="mt-6 focus-visible:ring-0">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Card className="rounded-2xl border border-gray-200 shadow-sm bg-white overflow-hidden">
                                        <CardHeader className="pb-4 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-3 rounded-xl bg-white shadow-sm border ${config.color}`}>
                                                        <config.icon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-xl font-bold text-gray-900">
                                                            {config.label} Selection
                                                        </CardTitle>
                                                        <CardDescription className="mt-0.5">
                                                            {config.description}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {mealBudget && (
                                                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                                                            <Wallet className="w-4 h-4 text-indigo-600" />
                                                            <div>
                                                                <span className="text-xs text-gray-500 block">Budget</span>
                                                                <span className="font-bold text-indigo-700">
                                                                    ₹{mealBudget.budget}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-6 px-6">
                                            <div className="space-y-6">
                                                {/* Search and Generate */}
                                                <div className="flex flex-col md:flex-row gap-4">
                                                    <div className="flex-1 relative">
                                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <Input
                                                            value={searchInputs[mealType] || ''}
                                                            onChange={(e) => handleSearchChange(mealType, e.target.value)}
                                                            placeholder={`Search specific recipe for ${config.label}...`}
                                                            className="pl-10 h-11"
                                                            onKeyPress={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    handleSearchSubmit(mealType);
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <Button
                                                        onClick={() => handleGenerateRecipesForMeal(mealType, searchInputs[mealType])}
                                                        disabled={mealRecipesData?.isGenerating}
                                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-11 px-6 font-semibold"
                                                    >
                                                        {mealRecipesData?.isGenerating ? (
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
                                                    {mealRecipesData?.recipes && mealRecipesData.recipes.length > 0 ? (
                                                        mealRecipesData.recipes.map((recipe) => (
                                                            <RecipeCard
                                                                key={recipe.id}
                                                                recipe={recipe}
                                                                isSelected={mealRecipesData.selectedRecipeId === recipe.id}
                                                                onSelect={() => handleSelectRecipeForMeal(mealType, recipe.id)}
                                                            />
                                                        ))
                                                    ) : (
                                                        <EmptyRecipeState
                                                            mealType={mealType}
                                                            onGenerate={() => handleGenerateRecipesForMeal(mealType)}
                                                            isGenerating={mealRecipesData?.isGenerating || false}
                                                            error={mealRecipesData?.error}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </TabsContent>
                        );
                    })}
                </AnimatePresence>
            </Tabs>

            {/* Navigation & Save */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 pb-12">
                <Button
                    onClick={onBack}
                    variant="ghost"
                    className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-6 h-12 rounded-xl font-bold order-2 sm:order-1"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Budget
                </Button>

                <div className="flex flex-col sm:flex-row items-center gap-4 order-1 sm:order-2">
                    {getSelectedCount() > 0 && (
                        <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg hidden sm:block">
                            <span className="font-bold text-indigo-600">{getSelectedCount()}</span> recipes selected
                        </div>
                    )}

                    <Button
                        onClick={handleSaveAllRecipes}
                        disabled={isSavingAll || getSelectedCount() === 0}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 h-12 rounded-xl font-bold shadow-lg shadow-green-200 transition-all hover:scale-[1.02] w-full sm:w-auto"
                    >
                        {isSavingAll ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving to Event...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Save {getSelectedCount()} Recipe{getSelectedCount() !== 1 ? 's' : ''} to Event
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

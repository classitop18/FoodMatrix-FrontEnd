import React, { useState } from "react";
import { Sparkles, ArrowLeft, Loader2, CheckCircle, Search, Clock, DollarSign, ChefHat, Wallet, Eye, CheckCircle2, AlertCircle } from "lucide-react";
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
import { getRecipeImageUrl } from "@/lib/recipe-utils";
import { RecipeDetailsDialog } from "../../../../recipes/components/recipe-details-dialog";


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
    const [viewRecipe, setViewRecipe] = useState<any | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [searchInputs, setSearchInputs] = useState<Record<MealType, string>>({} as Record<MealType, string>);

    const handleViewDetails = (recipe: any) => {
        setViewRecipe(recipe);
        setIsViewDialogOpen(true);
    };

    const totalSelected = getSelectedCount();
    const hasRecipesGenerated = mealRecipes.some(mr => mr.recipes.length > 0);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 m-1"
        >
            {/* Global Settings */}
            <Card className="rounded-2xl border border-gray-200 shadow-sm bg-white overflow-hidden">
                <CardHeader className="pb-4 border-b border-gray-100 bg-[var(--primary-bg)] px-6 pt-6">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-xl font-bold text-[#313131]">Recipe Generation Settings</CardTitle>
                        <Badge className="bg-red-100 text-red-700 text-[10px] font-bold uppercase">Required</Badge>
                    </div>
                    <CardDescription className="text-gray-500">
                        Generate and select recipes for each meal type. You must select at least one recipe to save.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 pb-6 px-6">
                    <div className="flex flex-col md:flex-row gap-6 items-end">
                        {/* Cuisine Selection */}
                        <div className="flex-1 w-full">
                            <Label htmlFor="cuisine" className="text-sm font-bold text-[#313131] mb-2 block">
                                Preferred Cuisine
                            </Label>
                            <Select
                                value={globalCuisine}
                                onValueChange={setGlobalCuisine}
                            >
                                <SelectTrigger className="h-11 border-gray-200 focus:border-[var(--primary)] focus:ring-[var(--primary)]">
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
                            className="bg-[var(--primary)] hover:bg-[#2d2454] text-white h-11 px-6 rounded-lg font-bold shadow-md w-full md:w-auto"
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
                            const selectedCount = mealRecipesData?.selectedRecipeIds?.length || 0;
                            const hasRecipes = (mealRecipesData?.recipes?.length || 0) > 0;
                            const hasSelected = selectedCount > 0;
                            const isActive = activeMealTab === mealType;

                            return (
                                <TabsTrigger
                                    key={mealType}
                                    value={mealType}
                                    className={cn(
                                        "flex items-center gap-2 py-3 px-4 rounded-xl border-2 transition-all min-w-[120px]",
                                        isActive
                                            ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-md"
                                            : hasSelected
                                                ? "border-[var(--primary-light)] bg-[var(--primary-bg)] text-[var(--primary)] hover:bg-[#ebe6f9]"
                                                : hasRecipes
                                                    ? "border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100"
                                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                    )}
                                >
                                    <config.icon className={cn("w-4 h-4", isActive ? "text-white" : hasSelected ? "text-[var(--primary)]" : hasRecipes ? "text-gray-500" : "text-gray-500")} />
                                    <span className="text-sm font-bold">{config.label}</span>
                                    {hasSelected && !isActive && (
                                        <Badge variant="secondary" className="ml-auto bg-[var(--primary)] text-white text-xs font-bold px-1.5 py-0">
                                            {selectedCount}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>
                </div>

                {/* Meal Type Content */}
                {selectedMealTypes.map((mealType) => {
                    const mealRecipesData = mealRecipes.find(mr => mr.mealType === mealType);
                    const recipes = mealRecipesData?.recipes || [];
                    const selectedIds = mealRecipesData?.selectedRecipeIds || [];
                    const isGenerating = mealRecipesData?.isGenerating || false;
                    const budget = mealBudgets.find(mb => mb.mealType === mealType)?.budget || 0;

                    return (
                        <TabsContent key={mealType} value={mealType} className="mt-6 focus-visible:ring-0">
                            <Card className="rounded-2xl border border-gray-200 shadow-sm bg-white overflow-hidden">
                                <CardHeader className="pb-4 border-b border-gray-100 bg-gray-50 px-6 pt-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <CardTitle className="text-xl font-bold text-[#313131] flex items-center gap-2">
                                                {(() => {
                                                    const config = MEAL_TYPE_CONFIG[mealType];
                                                    const Icon = config.icon;
                                                    return <Icon className="w-6 h-6 text-[var(--primary)]" />;
                                                })()}
                                                {MEAL_TYPE_CONFIG[mealType].label} Selection
                                            </CardTitle>
                                            <CardDescription className="mt-1 text-gray-500">
                                                Generate recipes, then select the ones you want to include in your event
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Budget</span>
                                                <Badge variant="secondary" className="bg-[var(--primary-bg)] text-[var(--primary)] font-bold text-sm hover:bg-[var(--primary-bg)]">
                                                    <Wallet className="w-3.5 h-3.5 mr-1.5" />
                                                    ${budget}
                                                </Badge>
                                            </div>
                                            {selectedIds.length > 0 && (
                                                <Badge className="bg-[var(--primary-bg)] text-[var(--primary)] font-bold border border-[var(--primary-light)]/30">
                                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                                    {selectedIds.length} selected
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 px-6 pb-6">
                                    <div className="space-y-6">
                                        {/* Search and Generate */}
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="flex-1 relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    placeholder={`Search specific recipe for ${MEAL_TYPE_CONFIG[mealType].label}...`}
                                                    className="pl-10 h-11 border-gray-200 focus:border-[var(--primary)] focus:ring-[var(--primary)]"
                                                    value={searchInputs[mealType] || ''}
                                                    onChange={(e) => setSearchInputs(prev => ({ ...prev, [mealType]: e.target.value }))}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleGenerateRecipesForMeal(mealType, searchInputs[mealType]);
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <Button
                                                onClick={() => handleGenerateRecipesForMeal(mealType, searchInputs[mealType])}
                                                disabled={isGenerating}
                                                className="bg-[var(--primary)] hover:bg-[#2d2454] text-white h-11 px-6 font-semibold"
                                            >
                                                {isGenerating ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="w-4 h-4 mr-2" />
                                                        {recipes.length > 0 ? "Generate More" : "Generate Suggestions"}
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        {/* Info about append behavior */}
                                        {recipes.length > 0 && (
                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm">
                                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                <span>Generating again will add new recipes to your existing list. Click on a recipe card to select/deselect it.</span>
                                            </div>
                                        )}

                                        {/* Recipes Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {recipes.length > 0 ? (
                                                recipes.map((recipe) => {
                                                    const isSelected = selectedIds.includes(recipe.id);

                                                    return (
                                                        <div
                                                            key={recipe.id}
                                                            className={cn(
                                                                "relative rounded-xl border-2 overflow-hidden transition-all cursor-pointer group hover:shadow-lg",
                                                                isSelected
                                                                    ? "border-[var(--primary)] bg-[var(--primary-bg)] shadow-md"
                                                                    : "border-gray-200 bg-white hover:border-gray-300"
                                                            )}
                                                            onClick={() => handleSelectRecipeForMeal(mealType, recipe.id)}
                                                        >
                                                            {/* Selection Indicator */}
                                                            <div className={cn(
                                                                "absolute top-3 left-3 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all",
                                                                isSelected
                                                                    ? "bg-[var(--primary)] text-white"
                                                                    : "bg-white/90 border-2 border-gray-300"
                                                            )}>
                                                                {isSelected && <CheckCircle2 className="w-4 h-4" />}
                                                            </div>

                                                            {/* Recipe Image */}
                                                            <div className="h-40 overflow-hidden relative">
                                                                <img
                                                                    src={getRecipeImageUrl(recipe.imageUrl)}
                                                                    alt={recipe.name || recipe.title}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                />
                                                                {recipe.isAIGenerated && (
                                                                    <Badge className="absolute top-3 right-3 bg-[var(--primary)] text-white text-[10px]">
                                                                        <Sparkles className="w-3 h-3 mr-1" />
                                                                        AI
                                                                    </Badge>
                                                                )}
                                                                <Button
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-[#313131] font-semibold text-xs shadow-md"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleViewDetails(recipe);
                                                                    }}
                                                                >
                                                                    <Eye className="w-3.5 h-3.5 mr-1" />
                                                                    Details
                                                                </Button>
                                                            </div>

                                                            {/* Recipe Info */}
                                                            <div className="p-4">
                                                                <h4 className="font-bold text-[#313131] text-sm mb-2 line-clamp-2">
                                                                    {recipe.name || recipe.title}
                                                                </h4>
                                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="w-3.5 h-3.5" />
                                                                        {recipe.cookingTime || recipe.totalTimeMinutes ? `${recipe.totalTimeMinutes} min` : 'N/A'}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <DollarSign className="w-3.5 h-3.5" />
                                                                        {recipe.price || (recipe.costAnalysis?.costPerServing ? `$${recipe.costAnalysis.costPerServing.toFixed(2)}` : 'N/A')}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                                    <div className="bg-white p-4 rounded-full shadow-sm mb-4 border border-gray-100">
                                                        <ChefHat className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-[#313131] mb-2">No recipes yet</h3>
                                                    <p className="text-gray-500 max-w-sm mx-auto mb-6 text-sm">
                                                        Click "Generate Suggestions" to let AI create perfect recipes for your {MEAL_TYPE_CONFIG[mealType].label}.
                                                    </p>
                                                    <Button
                                                        onClick={() => handleGenerateRecipesForMeal(mealType)}
                                                        disabled={isGenerating}
                                                        variant="outline"
                                                        className="border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary-bg)] font-semibold"
                                                    >
                                                        {isGenerating ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                Generating...
                                                            </>
                                                        ) : (
                                                            "Start Generating"
                                                        )}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    );
                })}
            </Tabs>

            {/* Validation Warning */}
            {hasRecipesGenerated && totalSelected === 0 && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-sm">No recipes selected</p>
                        <p className="text-sm">Click on recipe cards to select them before saving</p>
                    </div>
                </div>
            )}

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
                    onClick={handleSaveAllRecipes}
                    disabled={isSavingAll || totalSelected === 0}
                    className={cn(
                        "px-8 h-12 rounded-xl font-bold shadow-lg transition-all",
                        totalSelected > 0
                            ? "bg-[var(--primary)] hover:bg-[#2d2454] text-white hover:scale-[1.02]"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                    )}
                >
                    {isSavingAll ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Save {totalSelected} Recipe{totalSelected !== 1 ? 's' : ''}
                        </>
                    )}
                </Button>
            </div>

            <RecipeDetailsDialog
                recipe={viewRecipe}
                open={isViewDialogOpen}
                onOpenChange={setIsViewDialogOpen}
            />
        </motion.div>
    );
};



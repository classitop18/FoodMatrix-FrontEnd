import React, { useState } from "react";
import { Sparkles, ArrowLeft, Loader2, CheckCircle, Search, ChefHat, Wallet, CheckCircle2, AlertCircle, Check, Trash2 } from "lucide-react";
import { getUnsplashImage } from "@/app/actions/unsplash";
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
import { STATIC_ITEMS } from "../../_components/StaticItems";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sweets, drinks } from "@/data/add-items";
import { RecipeCard } from "@/components/common/RecipeCard";
import { indianSnacks } from "@/data/indian-snacks";



interface StaticItemsGridProps {
    mealType: MealType;
    searchInputs: Record<MealType, string>;
    staticSelections: Record<MealType, string[]>;
    handleStaticItemToggle: (mealType: MealType, item: string) => void;
}

const StaticItemsGrid: React.FC<StaticItemsGridProps> = ({
    mealType,
    searchInputs,
    staticSelections,
    handleStaticItemToggle
}) => {
    const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";

    const itemsDetails = React.useMemo(() => {
        let details: any[] = [];
        if (mealType === 'snacks' || mealType === 'dessert') {
            details = [...indianSnacks.filter(i => i.category === 'snacks'), ...sweets];
        } else if (mealType === 'beverages') {
            details = [...indianSnacks.filter(i => i.category === 'beverages'), ...drinks];
        } else {
            const simpleItems = STATIC_ITEMS[mealType] || [];
            details = simpleItems.map((name: string) => ({
                name,
                image: FALLBACK_IMAGE,
                unit: "serving"
            }));
        }
        return details;
    }, [mealType]);

    const [dynamicItemImages, setDynamicItemImages] = useState<Record<string, string>>({});
    const fetchedItemImagesRef = React.useRef<Set<string>>(new Set());

    React.useEffect(() => {
        const fetchImages = async () => {
            const itemsToFetch = itemsDetails.filter((i: any) =>
                (!i.image || i.image === FALLBACK_IMAGE) &&
                !fetchedItemImagesRef.current.has(i.name)
            );

            for (const i of itemsToFetch) {
                fetchedItemImagesRef.current.add(i.name);
                if (dynamicItemImages[i.name]) continue;

                getUnsplashImage(i.name).then(url => {
                    if (url) {
                        setDynamicItemImages(prev => ({ ...prev, [i.name]: url }));
                    }
                });
            }
        };
        fetchImages();
    }, [itemsDetails, dynamicItemImages]);

    const searchTerm = (searchInputs[mealType] || '').toLowerCase();
    const filteredItems = itemsDetails.filter((item: any) =>
        item.name.toLowerCase().includes(searchTerm)
    );

    if (filteredItems.length === 0) {
        return (
            <div className="col-span-full py-8 text-center text-gray-500 text-sm italic">
                No items found.
            </div>
        );
    }

    return (
        <>
            {filteredItems.map((item: any, idx: number) => {
                const isSelected = (staticSelections[mealType] || []).includes(item.name);
                const displayImage = dynamicItemImages[item.name] || item.image || FALLBACK_IMAGE;

                return (
                    <div
                        key={`${idx}-${item.name}`}
                        className={cn(
                            "group relative rounded-lg border overflow-hidden cursor-pointer transition-all hover:shadow-md bg-white",
                            isSelected
                                ? "border-[var(--primary)] ring-1 ring-[var(--primary)]"
                                : "border-gray-200 hover:border-gray-300"
                        )}
                        onClick={() => handleStaticItemToggle(mealType, item.name)}
                    >
                        <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 relative">
                            <img
                                src={displayImage}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                            />
                            {isSelected && (
                                <div className="absolute inset-0 bg-[var(--primary)]/20 flex items-center justify-center">
                                    <div className="bg-white text-[var(--primary)] rounded-full p-1 shadow-sm">
                                        <Check className="w-4 h-4" />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-2">
                            <h4 className={cn(
                                "text-xs font-semibold line-clamp-1",
                                isSelected ? "text-[var(--primary)]" : "text-gray-700"
                            )}>
                                {item.name}
                            </h4>
                        </div>
                    </div>
                );
            })}
        </>
    );
};

interface RecipeSelectionSectionProps {
    globalCuisine: string;
    setGlobalCuisine: (value: string) => void;
    selectedMealTypes: MealType[];
    handleGenerateRecipesForMeal: (mealType: MealType, customSearch?: string, count?: number, cuisine?: string) => Promise<void>;
    activeMealTab: MealType;
    setActiveMealTab: (value: MealType) => void;
    mealRecipes: GeneratedRecipeForMeal[];
    mealBudgets: MealBudgetAllocation[];
    handleSelectRecipeForMeal: (mealType: MealType, recipeId: string) => void;
    onBack: () => void;
    handleSaveAllRecipes: () => Promise<void> | void;
    isSavingAll: boolean;
    getSelectedCount: () => number;
    actionLabel?: string;
    onAddEventItem?: (item: { name: string, quantity: number, unit: string, category: string }) => Promise<void>;
    onRemoveRecipe?: (mealType: string, recipeId: string) => void;
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
    getSelectedCount,
    actionLabel,
    onAddEventItem,
    onRemoveRecipe
}) => {
    const [viewRecipe, setViewRecipe] = useState<any | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [searchInputs, setSearchInputs] = useState<Record<MealType, string>>({} as Record<MealType, string>);
    const [recipeCounts, setRecipeCounts] = useState<Partial<Record<MealType, number>>>({});
    const [mealCuisines, setMealCuisines] = useState<Partial<Record<MealType, string>>>({});

    const handleViewDetails = (recipe: any) => {
        setViewRecipe(recipe);
        setIsViewDialogOpen(true);
    };

    const [staticSelections, setStaticSelections] = useState<Record<MealType, string[]>>({} as Record<MealType, string[]>);
    const [pendingAutoSelect, setPendingAutoSelect] = useState<MealType | null>(null);

    // Auto-select recipes when generation finishes for static items
    React.useEffect(() => {
        if (pendingAutoSelect) {
            const mealData = mealRecipes.find(mr => mr.mealType === pendingAutoSelect);
            if (mealData && !mealData.isGenerating && mealData.recipes.length > 0) {
                // Find recipes that are NOT selected yet
                const unselectedRecipes = mealData.recipes.filter(r => !mealData.selectedRecipeIds?.includes(r.id));

                // Select them
                unselectedRecipes.forEach(r => {
                    handleSelectRecipeForMeal(pendingAutoSelect, r.id);
                });

                // Clear pending state
                setPendingAutoSelect(null);
            }
        }
    }, [mealRecipes, pendingAutoSelect, handleSelectRecipeForMeal]);

    const handleStaticItemToggle = (mealType: MealType, item: string) => {
        setStaticSelections(prev => {
            const current = prev[mealType] || [];
            const updated = current.includes(item)
                ? current.filter(i => i !== item)
                : [...current, item];
            return { ...prev, [mealType]: updated };
        });
    };

    const handleStaticItemsAdd = async (mealType: MealType) => {
        const selectedNames = staticSelections[mealType];
        if (!selectedNames || selectedNames.length === 0) return;

        // If parent provided a direct add handler, use it to preserve metadata
        if (onAddEventItem) {
            // Re-construct the full items list to find metadata
            let allItems: any[] = [];
            if (mealType === 'snacks' || mealType === 'dessert') {
                allItems = [...indianSnacks.filter(i => i.category === 'snacks'), ...sweets];
            } else if (mealType === 'beverages') {
                allItems = [...indianSnacks.filter(i => i.category === 'beverages'), ...drinks];
            } else {
                allItems = (STATIC_ITEMS[mealType] || []).map(name => ({ name, unit: 'serving' }));
            }

            for (const name of selectedNames) {
                const itemData = allItems.find(i => i.name === name);
                await onAddEventItem({
                    name: name,
                    quantity: 1, // Default to 1
                    unit: itemData?.unit || 'serving',
                    category: mealType
                });
            }

            // Clear selections after adding
            setStaticSelections(prev => ({ ...prev, [mealType]: [] }));

        } else {
            // Fallback to old string-based method
            setPendingAutoSelect(mealType);
            await handleGenerateRecipesForMeal(mealType, selectedNames.join(", "));
        }
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
                                selectedMealTypes.map(mealType => {
                                    const effectiveCuisine = (mealCuisines[mealType] || 'GLOBAL') === 'GLOBAL' ? globalCuisine : mealCuisines[mealType];
                                    return handleGenerateRecipesForMeal(mealType, undefined, recipeCounts[mealType] || 3, effectiveCuisine);
                                })
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
                                        {/* Search and Generate / Static Selection */}
                                        {['breakfast', 'lunch', 'dinner'].includes(mealType) ? (
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
                                                                const effectiveCuisine = (mealCuisines[mealType] || 'GLOBAL') === 'GLOBAL' ? globalCuisine : mealCuisines[mealType];
                                                                handleGenerateRecipesForMeal(mealType, searchInputs[mealType], recipeCounts[mealType] || 3, effectiveCuisine);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <div className="w-[180px]">
                                                    <Select
                                                        value={mealCuisines[mealType] || "GLOBAL"}
                                                        onValueChange={(val) => setMealCuisines(prev => ({ ...prev, [mealType]: val }))}
                                                    >
                                                        <SelectTrigger className="h-11 border-gray-200 focus:border-[var(--primary)] focus:ring-[var(--primary)]">
                                                            <SelectValue placeholder="Cuisine" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="GLOBAL" className="font-semibold text-[var(--primary)]">
                                                                Global ({globalCuisine === 'ALL' || !globalCuisine ? 'All' : cuisineOptions.find(c => c.value === globalCuisine)?.label})
                                                            </SelectItem>
                                                            {cuisineOptions.map(cuisine => (
                                                                <SelectItem key={cuisine.value} value={cuisine.value}>
                                                                    {cuisine.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="w-[140px]">
                                                    <Select
                                                        value={(recipeCounts[mealType] || 3).toString()}
                                                        onValueChange={(val) => setRecipeCounts(prev => ({ ...prev, [mealType]: parseInt(val) }))}
                                                    >
                                                        <SelectTrigger className="h-11 border-gray-200 focus:border-[var(--primary)] focus:ring-[var(--primary)]">
                                                            <SelectValue placeholder="Count" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {[1, 2, 3, 4, 5, 6].map(num => (
                                                                <SelectItem key={num} value={num.toString()}>{num} Recipes</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Button
                                                    onClick={() => {
                                                        const effectiveCuisine = (mealCuisines[mealType] || 'GLOBAL') === 'GLOBAL' ? globalCuisine : mealCuisines[mealType];
                                                        handleGenerateRecipesForMeal(mealType, searchInputs[mealType], recipeCounts[mealType] || 3, effectiveCuisine);
                                                    }}
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
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                                                        <h3 className="text-sm font-bold text-gray-900 block">
                                                            Select items to add:
                                                        </h3>

                                                        {/* Search for static items */}
                                                        <div className="relative w-full md:w-64">
                                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                                            <Input
                                                                placeholder="Search items..."
                                                                className="pl-9 h-9 text-xs"
                                                                value={searchInputs[mealType] || ''}
                                                                onChange={(e) => setSearchInputs(prev => ({ ...prev, [mealType]: e.target.value }))}
                                                            />
                                                        </div>
                                                    </div>

                                                    <ScrollArea className="h-[400px] pr-4">
                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                                            <StaticItemsGrid
                                                                mealType={mealType}
                                                                searchInputs={searchInputs}
                                                                staticSelections={staticSelections}
                                                                handleStaticItemToggle={handleStaticItemToggle}
                                                            />
                                                        </div>
                                                    </ScrollArea>

                                                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                                                        <Button
                                                            onClick={() => handleStaticItemsAdd(mealType)}
                                                            disabled={isGenerating || !(staticSelections[mealType] && staticSelections[mealType]!.length > 0)}
                                                            className="bg-[var(--primary)] hover:bg-[#2d2454] text-white"
                                                            size="sm"
                                                        >
                                                            {isGenerating ? (
                                                                <>
                                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                    Adding...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                                    Add Items
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Info about append behavior - Only for Primary Meals */}
                                        {recipes.length > 0 && ['breakfast', 'lunch', 'dinner'].includes(mealType) && (
                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm">
                                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                <span>Generating again will add new recipes to your existing list. Click on a recipe card to select/deselect it.</span>
                                            </div>
                                        )}

                                        {/* Content Display Logic */}
                                        {['breakfast', 'lunch', 'dinner'].includes(mealType) ? (
                                            /* Standard Recipe Grid for Primary Meals */
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {recipes.length > 0 ? (
                                                    recipes.map((recipe) => {
                                                        const isSelected = selectedIds.includes(recipe.id);

                                                        // Adapt recipe for RecipeCard component
                                                        const recipeForCard = {
                                                            ...recipe,
                                                            // Ensure numeric fields for RecipeCard
                                                            totalTimeMinutes: recipe.totalTimeMinutes || parseInt(recipe.cookingTime) || 30,
                                                            calories: recipe.calories || recipe.nutrition?.calories || 0,
                                                            estimatedCostPerServing: recipe.costAnalysis?.costPerServing || (recipe.price ? parseFloat(recipe.price.replace(/[^0-9.]/g, '')) : 0),
                                                            averageRating: recipe.averageRating || 0,
                                                            mealType: recipe.mealType || mealType, // Fallback to current meal type
                                                            cuisineType: recipe.cuisineType || "General",
                                                            isFavorite: false
                                                        };

                                                        return (
                                                            <div
                                                                key={recipe.id}
                                                                className="h-full" // Use simple wrapper
                                                                onClick={() => handleSelectRecipeForMeal(mealType, recipe.id)}
                                                            >
                                                                <RecipeCard
                                                                    recipe={recipeForCard}
                                                                    onViewDetails={() => handleViewDetails(recipe)}
                                                                    className="cursor-pointer" // Add cursor pointer to card
                                                                    selectionMode={true}
                                                                    selected={isSelected}
                                                                    isCustom={recipe.isCustomSearch}
                                                                    showAiBadge={recipe.isAIGenerated}
                                                                />
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
                                        ) : (
                                            /* Selected Items List for Non-Primary Meals */
                                            <div className="space-y-4">
                                                {selectedIds.length > 0 ? (
                                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                                            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                                Added Items
                                                            </h3>
                                                            <Badge variant="secondary" className="bg-white border-gray-200">{selectedIds.length} items</Badge>
                                                        </div>
                                                        <div className="divide-y divide-gray-100">
                                                            {recipes
                                                                .filter(r => selectedIds.includes(r.id))
                                                                .map(recipe => (
                                                                    <div key={recipe.id} className="p-3 flex items-center justify-between group hover:bg-gray-50 transition-colors">
                                                                        <div className="flex items-center gap-3">
                                                                            <img
                                                                                src={getRecipeImageUrl(recipe.imageUrl)}
                                                                                alt={recipe.name}
                                                                                className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200"
                                                                            />
                                                                            <div>
                                                                                <p className="text-sm font-semibold text-gray-900">{recipe.name}</p>
                                                                                <p className="text-xs text-gray-500">
                                                                                    {recipe.cookingTime || 'Ready to serve'}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            onClick={() => {
                                                                                if (onRemoveRecipe) {
                                                                                    onRemoveRecipe(mealType, recipe.id);
                                                                                } else {
                                                                                    handleSelectRecipeForMeal(mealType, recipe.id);
                                                                                }
                                                                            }}
                                                                            className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                                        <span className="text-sm text-gray-500 block">No items added to menu yet.</span>
                                                        <span className="text-xs text-gray-400">Select items above and click "Add to Menu".</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
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
                            {actionLabel ? actionLabel : `Save ${totalSelected} Recipe${totalSelected !== 1 ? 's' : ''}`}
                        </>
                    )}
                </Button>
            </div>

            <RecipeDetailsDialog
                recipe={viewRecipe}
                open={isViewDialogOpen}
                onOpenChange={setIsViewDialogOpen}
            />
        </motion.div >
    );
};



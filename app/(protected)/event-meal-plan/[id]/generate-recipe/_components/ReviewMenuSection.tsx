import React, { useMemo } from "react";
import {
    CheckCircle,
    ArrowLeft,
    ChefHat,
    Clock,
    DollarSign,
    Sparkles,
    Trash2,
    Calendar,
    Users,
    Utensils,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { GeneratedRecipeForMeal } from "./types";
import { MEAL_TYPE_CONFIG } from "./constants";
import { getRecipeImageUrl } from "@/lib/recipe-utils";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ReviewMenuSectionProps {
    mealRecipes: GeneratedRecipeForMeal[];
    onBack: () => void;
    onSave: () => void;
    isSaving: boolean;
    onRemoveRecipe: (mealType: string, recipeId: string) => void;
    totalBudget: number;
}

export const ReviewMenuSection: React.FC<ReviewMenuSectionProps> = ({
    mealRecipes,
    onBack,
    onSave,
    isSaving,
    onRemoveRecipe,
    totalBudget
}) => {
    // Calculate Summary Stats
    const summary = useMemo(() => {
        let totalItems = 0;
        let totalCost = 0;
        let mealCounts: Record<string, number> = {};

        mealRecipes.forEach(meal => {
            const selected = meal.recipes.filter(r => meal.selectedRecipeIds?.includes(r.id));
            if (selected.length > 0) {
                totalItems += selected.length;
                mealCounts[meal.mealType] = selected.length;

                selected.forEach(r => {
                    const price = parseFloat(r.price?.replace('$', '') || '0');
                    totalCost += price * (r.servings || 1); // Rough estimate if price is per serving
                });
            }
        });

        return { totalItems, totalCost, mealCounts };
    }, [mealRecipes]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 max-w-5xl mx-auto pb-10"
        >
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
                    <CheckCircle className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Review Menu & Add-ons</h2>
                <p className="text-gray-500 mt-2 max-w-xl mx-auto">
                    Review your selections before finalizing the event menu. You can make last-minute adjustments here.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Menu Breakdown */}
                <div className="lg:col-span-2 space-y-6">
                    {mealRecipes.map((meal) => {
                        const selectedRecipes = meal.recipes.filter(r => meal.selectedRecipeIds?.includes(r.id));
                        if (selectedRecipes.length === 0) return null;

                        const config = MEAL_TYPE_CONFIG[meal.mealType as keyof typeof MEAL_TYPE_CONFIG] || { label: meal.mealType, icon: ChefHat };
                        const Icon = config.icon;

                        return (
                            <Card key={meal.mealType} className="border-gray-200 shadow-sm overflow-hidden">
                                <CardHeader className="bg-gray-50/50 py-3 px-4 border-b border-gray-100 flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Icon className="w-4 h-4 text-gray-500" />
                                        <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                                            {config.label}
                                        </CardTitle>
                                    </div>
                                    <Badge variant="secondary" className="bg-white border-gray-200 text-gray-600">
                                        {selectedRecipes.length} items
                                    </Badge>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-gray-100">
                                        {selectedRecipes.map((recipe) => (
                                            <div key={recipe.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors group">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 bg-gray-100">
                                                    <img
                                                        src={getRecipeImageUrl(recipe.imageUrl)}
                                                        alt={recipe.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-gray-900 truncate">{recipe.name}</h4>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {recipe.cookingTime || 'N/A'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Utensils className="w-3.5 h-3.5" />
                                                            {recipe.servings || '4'} servings
                                                        </span>
                                                        {recipe.isAIGenerated && (
                                                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-indigo-200 text-indigo-600 bg-indigo-50">
                                                                AI
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onRemoveRecipe(meal.mealType, recipe.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Right Col: Summary Widget */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-4">
                        <Card className="border-gray-200 shadow-md bg-white">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-bold text-gray-900">Event Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Total Items</span>
                                        <span className="font-bold text-gray-900">{summary.totalItems}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Meal Categories</span>
                                        <span className="font-bold text-gray-900">{Object.keys(summary.mealCounts).length}</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Budget</span>
                                        <span className="font-bold text-gray-900">${totalBudget}</span>
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-12 bg-[var(--primary)] hover:bg-[#2d2454] text-white font-bold text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                                    onClick={onSave}
                                    disabled={summary.totalItems === 0 || isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Saving Menu...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                            Confirm & Save Menu
                                        </>
                                    )}
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full text-gray-500 border-gray-200"
                                    onClick={onBack}
                                    disabled={isSaving}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Selections
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

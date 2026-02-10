"use client";

import { motion } from "framer-motion";
import { Plus, Trash2, Clock, ChefHat, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventMealResponse, MealType, EventRecipeResponse, EventItemResponse } from "@/services/event/event.types";
import { Recipe } from "@/services/recipe";
import { HorizontalRecipeCard } from "@/components/common/HorizontalRecipeCard";
import { cn } from "@/lib/utils";
import { getMealTypeOption, formatEventTime } from "../../constants/event.constants";

interface MealSectionProps {
    meal: EventMealResponse;
    eventItems: EventItemResponse[];
    onRemoveRecipe: (mealId: string, recipeId: string) => void;
    onDeleteMeal: (mealId: string) => void;
    onAddRecipe: (mealId: string) => void;
    onAddQuickItem: (mealId: string, type: MealType) => void;
    onRemoveItem: (itemId: string) => void;
    onViewRecipe: (recipe: Recipe) => void;
    adaptRecipe: (eventRecipe: EventRecipeResponse) => Recipe;
}

export function MealSection({
    meal,
    eventItems,
    onRemoveRecipe,
    onDeleteMeal,
    onAddRecipe,
    onAddQuickItem,
    onRemoveItem,
    onViewRecipe,
    adaptRecipe
}: MealSectionProps) {
    const mealOption = getMealTypeOption(meal.mealType as MealType);
    const MealIcon = mealOption?.icon || ChefHat;
    const extraItems = eventItems?.filter(i => i.category === meal.mealType) || [];

    // Check if it's a main meal type (Breakfast, Lunch, Dinner)
    const isMainMeal = ['breakfast', 'lunch', 'dinner'].includes(meal.mealType);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-[#3d326d]/20 hover:shadow-lg transition-all duration-300"
        >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-white">
                <div className="flex items-center gap-4">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm", mealOption?.color ? `bg-${mealOption.color.split('-')[1]}-50 text-${mealOption.color.split('-')[1]}-600` : "bg-gray-100 text-gray-600")}>
                        <MealIcon className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-xl font-extrabold text-[#313131] capitalize">{mealOption?.label || meal.mealType}</h3>
                        {meal.scheduledTime && (
                            <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5 mt-1">
                                <Clock className="w-3.5 h-3.5" />
                                {formatEventTime(meal.scheduledTime)}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAddRecipe(meal.id)}
                        className="text-[var(--primary)] border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white font-semibold transition-all shadow-sm h-9 px-4 gap-2 text-xs uppercase tracking-wider"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Recipe
                    </Button>
                    <div className="h-6 w-px bg-gray-200 mx-1"></div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors h-8 w-8"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteMeal(meal.id);
                        }}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6 bg-gray-50/30">
                {meal.recipes && meal.recipes.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {meal.recipes?.map((eventRecipe: EventRecipeResponse) => {
                            const recipe = adaptRecipe(eventRecipe);
                            return (
                                <HorizontalRecipeCard
                                    key={eventRecipe.id}
                                    recipe={recipe}
                                    onViewDetails={onViewRecipe}
                                    onRemove={() => onRemoveRecipe(meal.id, eventRecipe.recipeId || "")}
                                    showRemoveButton={true}
                                    className="h-full"
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-white border border-dashed border-gray-300 rounded-full flex items-center justify-center mb-4 group-hover:border-[var(--primary)]/50 transition-colors">
                            <Sparkles className="w-6 h-6 text-gray-300 group-hover:text-[var(--primary)] transition-colors" />
                        </div>
                        <h4 className="text-base font-bold text-[#313131] mb-2">No Recipes Added</h4>
                        <p className="text-sm text-gray-500 max-w-xs mb-6">
                            This {meal.mealType} slot is currently empty. Add some delicious recipes!
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAddRecipe(meal.id)}
                            className="mt-4 border-dashed border-gray-300 text-gray-500 hover:text-[var(--primary)] hover:border-[var(--primary)]"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Recipe
                        </Button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

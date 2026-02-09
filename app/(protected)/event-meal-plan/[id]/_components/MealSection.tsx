"use client";

import { motion } from "framer-motion";
import { Plus, Trash2, Clock, ChefHat, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventMealResponse, MealType, EventRecipeResponse, EventItemResponse } from "@/services/event/event.types";
import { Recipe } from "@/services/recipe";
import { RecipeCard } from "@/components/common/RecipeCard";
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
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteMeal(meal.id);
                        }}
                    >
                        <Trash2 className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6 bg-gray-50/30">
                {(meal.recipes && meal.recipes.length > 0) || (extraItems && extraItems.length > 0) ? (
                    <div className="space-y-6">
                        {isMainMeal ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                                {meal.recipes?.map((eventRecipe: EventRecipeResponse) => {
                                    const recipe = adaptRecipe(eventRecipe);
                                    return (
                                        <div key={eventRecipe.id} className="relative group/wrapper h-full">
                                            <RecipeCard
                                                recipe={recipe}
                                                onViewDetails={onViewRecipe}
                                                className="h-full border-gray-200 shadow-sm hover:shadow-xl"
                                            />
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-2 -right-3 h-5 w-5 rounded-full shadow-lg z-20 hover:scale-90 bg-red-500 hover:bg-red-400 text-white border-1 border-white"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onRemoveRecipe(meal.id, eventRecipe.recipeId || "");
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Compact List for Snacks/Beverages */
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {extraItems.map((item: EventItemResponse) => (
                                    <div key={item.id} className="relative group/compact-card bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all flex flex-col h-full shadow-sm">
                                        <div className="h-28 w-full bg-gray-100 relative overflow-hidden flex items-center justify-center">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random&color=fff`}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover/compact-card:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute top-2 right-2 z-20">
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-full shadow-md bg-red-500 hover:bg-red-600 text-white border-2 border-white"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onRemoveItem(item.id);
                                                    }}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="p-3 flex-1 flex flex-col justify-between">
                                            <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight" title={item.name}>
                                                {item.name}
                                            </h4>
                                            <p className="text-xs text-gray-500 font-medium mt-2 bg-gray-100 px-2 py-1 rounded-md w-fit">
                                                {item.quantity} {item.unit}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-8 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center mb-3">
                            <Sparkles className="w-5 h-5 text-[#3d326d]" />
                        </div>
                        <h4 className="text-sm font-bold text-[#313131] mb-1">It's empty here!</h4>
                        <p className="text-xs text-gray-500 max-w-xs mb-4">
                            {isMainMeal
                                ? 'Start building your menu by adding delicious recipes.'
                                : 'Add snacks, beverages, or other items to your list.'}
                        </p>
                    </div>
                )}

                {/* Add Button Area */}
                <div className="mt-6 flex justify-center">
                    <Button
                        variant="outline"
                        onClick={() => isMainMeal ? onAddRecipe(meal.id) : onAddQuickItem(meal.id, meal.mealType as MealType)}
                        className="group relative border-2 border-dashed border-gray-300 hover:border-[#3d326d] hover:bg-[#3d326d]/5 text-gray-600 hover:text-[#3d326d] font-semibold transition-all duration-300 h-12 w-full max-w-[240px] rounded-xl flex items-center justify-center gap-2 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3d326d]/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <div className="w-6 h-6 rounded-full bg-gray-100 group-hover:bg-[#3d326d]/10 flex items-center justify-center transition-colors">
                            <Plus className="w-4 h-4" />
                        </div>
                        {isMainMeal ? 'Add Recipe' : 'Add Item'}
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}

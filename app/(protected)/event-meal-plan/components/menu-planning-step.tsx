"use client";

import { motion } from "framer-motion";
import { Check, Clock, ChefHat, Utensils } from "lucide-react";
import { MenuPlanningStepProps, MealType } from "../types/event.types";
import { MEAL_TYPE_OPTIONS, getMealTypeOption } from "../constants/event.constants";
import { cn } from "@/lib/utils";

export function MenuPlanningStep({
    formData,
    onUpdate,
    totalServings,
}: MenuPlanningStepProps) {

    const toggleMealType = (mealType: MealType) => {
        const isSelected = formData.selectedMealTypes.includes(mealType);
        const newMealTypes = isSelected
            ? formData.selectedMealTypes.filter((type) => type !== mealType)
            : [...formData.selectedMealTypes, mealType];
        onUpdate("selectedMealTypes", newMealTypes);
    };

    const selectedCount = formData.selectedMealTypes.length;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 mb-4 shadow-sm border border-indigo-100">
                    <ChefHat className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Plan Your Menu</h2>
                <p className="text-gray-500 font-medium mt-1">
                    Which meals do you plan to serve at this event?
                </p>
            </div>

            {/* Stats Bar */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl shadow-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/10">
                            <Utensils className="w-6 h-6 text-indigo-300" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Servings</p>
                            <p className="font-extrabold text-white text-xl">{totalServings}</p>
                        </div>
                    </div>
                    <div className="w-px h-12 bg-white/10 hidden sm:block" />
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/10">
                            <Clock className="w-6 h-6 text-emerald-300" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Selections</p>
                            <p className="font-extrabold text-white text-xl">{selectedCount} Types</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Meal Type Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MEAL_TYPE_OPTIONS.map((option, index) => {
                    const isSelected = formData.selectedMealTypes.includes(option.value);
                    const Icon = option.icon;

                    return (
                        <motion.button
                            key={option.value}
                            type="button"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => toggleMealType(option.value)}
                            className={cn(
                                "group relative p-5 rounded-2xl border-2 text-left transition-all duration-300 flex items-start gap-4 overflow-hidden",
                                isSelected
                                    ? "border-indigo-600 bg-indigo-50 shadow-md ring-1 ring-indigo-500/10"
                                    : "border-gray-100 bg-white hover:border-indigo-200 hover:bg-gray-50 hover:shadow-sm"
                            )}
                        >
                            {/* Icon Box */}
                            <div
                                className={cn(
                                    "h-14 w-14 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm flex-shrink-0",
                                    isSelected
                                        ? "bg-indigo-600 text-white shadow-indigo-200 transform scale-105"
                                        : "bg-white border border-gray-100 group-hover:bg-white"
                                )}
                            >
                                <Icon className={cn("w-7 h-7", isSelected ? "text-white" : option.color)} />
                            </div>

                            <div className="flex-1 relative z-10">
                                <h3 className={cn(
                                    "font-bold text-lg mb-1 transition-colors",
                                    isSelected ? "text-indigo-900" : "text-gray-900"
                                )}>
                                    {option.label}
                                </h3>
                                <p className={cn(
                                    "text-sm",
                                    isSelected ? "text-indigo-700" : "text-gray-500"
                                )}>
                                    {option.description}
                                </p>
                            </div>

                            {/* Selection Check */}
                            <div className={cn(
                                "absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                isSelected
                                    ? "border-indigo-600 bg-indigo-600 scale-100"
                                    : "border-gray-200 bg-transparent scale-90 opacity-0 group-hover:opacity-100"
                            )}>
                                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Helper */}
            <div className="text-center mt-8">
                <p className="text-sm font-medium text-gray-500 bg-gray-50 inline-block px-4 py-2 rounded-full border border-gray-100 animate-pulse">
                    Select a meal type above to include it in the plan.
                </p>
            </div>
        </div>
    );
}

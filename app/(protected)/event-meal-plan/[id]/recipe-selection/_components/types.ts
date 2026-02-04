import { MealType } from "@/services/event/event.types";
import { Sun, Utensils, Coffee, Cookie, Moon, Cake, Wine, LucideIcon } from "lucide-react";

export interface HealthStats {
    dietaryRestrictions: Record<string, number>;
    allergies: Record<string, number>;
    healthConditions: Record<string, number>;
    totalMembers: number;
}

export interface MealBudgetAllocation {
    mealType: MealType;
    percentage: number;
    budget: number;
    reasoning?: string;
}

export interface GeneratedRecipe {
    id: string;
    name: string;
    description?: string;
    cuisineType?: string;
    mealType: string;
    servings: number;
    imageUrl?: string;
    cookingTime?: string;
    totalTimeMinutes?: number;
    prepTimeMinutes?: number;
    cookTimeMinutes?: number;
    difficultyLevel?: string;
    price?: string;
    estimatedCost?: number;
    costPerServing?: number;
    ingredients?: {
        name: string;
        quantity: string;
        unit: string;
        isOptional?: boolean;
        estimatedCost?: number;
        category?: string;
    }[];
    instructions?: string[];
    nutrition?: {
        calories: number;
        protein_g: number;
        carbs_g: number;
        fat_g: number;
        fiber_g?: number;
    };
    nutritionalHighlights?: string[];
    healthScore?: number;
    healthConsiderations?: string[];
    cookingTips?: string[];
    eventRecommendations?: string[];
    isAIGenerated?: boolean;
}

export interface GeneratedRecipeForMeal {
    mealType: MealType;
    recipes: GeneratedRecipe[];
    isGenerating: boolean;
    selectedRecipeId?: string;
    customSearch?: string;
    error?: string;
}

export interface MealTypeConfig {
    icon: LucideIcon;
    label: string;
    color: string;
    defaultTime: string;
    description: string;
    budgetWeight: number;
}

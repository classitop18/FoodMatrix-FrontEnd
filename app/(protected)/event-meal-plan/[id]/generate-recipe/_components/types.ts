import { MealType } from "@/services/event/event.types";

export interface HealthStats {
    dietaryRestrictions: Record<string, number>;
    allergies: Record<string, number>;
    healthConditions: Record<string, number>;
    totalMembers: number;
}

export interface MealBudgetAllocation {
    mealType: MealType;
    budget: number;
    percentage: number;
    reasoning?: string; // AI reasoning for this allocation
    minPercentage?: number; // Minimum allowed percentage for validation
}

export interface GeneratedRecipeForMeal {
    mealType: MealType;
    recipes: any[];
    selectedRecipeIds?: string[];  // Changed: Multiple recipes can be selected
    isGenerating: boolean;
    customSearch?: string;
    isAIGenerated?: boolean;
}

// AI Budget Suggestion Response
export interface AIBudgetSuggestionResponse {
    eventId: string;
    eventName: string;
    totalBudget: number;
    currency: string;
    mealTypes: MealType[];
    allocations: {
        mealType: MealType;
        suggestedBudget: number;
        percentage: number;
        reasoning: string;
    }[];
    aiRecommendations: string[];
    totalAllocated: number;
}

// Minimum percentage constraints per meal type
export const MIN_BUDGET_PERCENTAGES: Record<MealType, number> = {
    breakfast: 5,
    lunch: 10,
    snacks: 3,
    dinner: 15,
    dessert: 3,
    beverages: 2
};

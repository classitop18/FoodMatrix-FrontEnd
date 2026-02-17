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

// Budget categories for course-based distribution
export type BudgetCategory = 'starter' | 'main_course' | 'side_dish' | 'snacks' | 'desserts' | 'beverages';

export interface CategoryBudgetAllocation {
    category: BudgetCategory;
    budget: number;
    percentage: number;
    spent: number; // Real-time tracked spend
    reasoning?: string; // AI reasoning for this allocation
    minPercentage?: number;
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

// Minimum percentage constraints per meal type (legacy, kept for backward compat)
export const MIN_BUDGET_PERCENTAGES: Record<MealType, number> = {
    breakfast: 5,
    lunch: 10,
    snacks: 3,
    dinner: 15,
    dessert: 3,
    beverages: 2
};

// Minimum percentage constraints per budget category
export const MIN_CATEGORY_PERCENTAGES: Record<BudgetCategory, number> = {
    starter: 5,
    main_course: 20,
    side_dish: 5,
    snacks: 3,
    desserts: 3,
    beverages: 3,
};

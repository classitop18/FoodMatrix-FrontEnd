export interface Ingredient {
    name: string;
    quantity: string;
    unit: string;
    isOptional?: boolean;
    notes?: string;
    estimatedCost?: number;
    category?: string;
    isPantryItem?: boolean;
}

export interface Nutrition {
    calories: number;
    protein?: number;
    carbohydrates?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    [key: string]: any;
}

export interface CostAnalysis {
    totalCost: number;
    costPerServing: number;
    budgetEfficiency?: number;
}

export interface ComplementaryItem {
    name: string;
    cost: number;
    optional?: boolean;
}

export interface Recipe {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    cuisineType: string;
    mealType: string;
    servings: number;
    totalTimeMinutes: number;
    prepTimeMinutes: number;
    cookTimeMinutes: number;
    difficultyLevel: string;
    estimatedCostPerServing: string | number;
    calories: number;
    isPublic: boolean;
    createdAt: string;

    instructions: string[] | any;
    nutrition: Nutrition | null;
    costAnalysis: CostAnalysis | null;

    healthScore?: number;
    budgetEfficiency?: number;

    ingredients: Ingredient[];
    complementaryItems?: ComplementaryItem[];

    timesCooked: number;
    averageRating?: number;
    totalRatings: number;

    aiReasoningNotes?: string;
    cookingStatus?: "cooked" | "not_cooked" | "not_interested";

    // Interactions & Scoring
    score?: number;
    isLiked?: boolean;
    isDisliked?: boolean;
    isFavorite?: boolean;
}

export interface GenerateAIRecipePayload {
    mealType: string;
    memberCount: number;
    maxBudgetPerServing: number;
    usePantryFirst?: boolean;
    preferredCuisines: string[];
    targetMembers?: string[];
    isForAllMembers?: boolean;
    dietaryRestrictions?: string[];
    allergies?: string[];
    healthConditions?: string[];
    healthGoals?: string[];
    maxPrepTime?: number;
    usePantryItems?: boolean;
    pantryOnly?: boolean;
    recipeCount?: number;
    servings?: number;
}

export interface GenerateCustomRecipePayload {
    recipeName?: string;
    mealType: string;
    servings: number;
    dietaryRestrictions?: any[];
}

export interface RecipeFilters {
    cuisines?: string;
    mealTypes?: string;
    difficulty?: string;
    minPrepTime?: number;
    maxPrepTime?: number;
    minCalories?: number;
    maxCalories?: number;
    minBudget?: number;
    maxBudget?: number;
    dateFilter?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    viewScope?: "personal" | "global";
}

export interface RecipesResponse {
    recipes: Recipe[];
    pagination: {
        page: number;
        pageSize: number;
        totalRecipes: number;
        totalPages: number;
    };
}

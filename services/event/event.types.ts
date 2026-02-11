// Event Types for Frontend

// Occasion Types
export type OccasionType =
    | "birthday"
    | "anniversary"
    | "festival"
    | "gathering"
    | "housewarming"
    | "celebration"
    | "dinner_party"
    | "other";

// Budget Types
export type BudgetType = "separate" | "weekly";

// Event Status
export type EventStatus = "draft" | "planned" | "in_progress" | "completed" | "cancelled";

// Meal Types
export type MealType = "breakfast" | "lunch" | "snacks" | "dinner" | "dessert" | "beverages";

// Meal Status
export type MealStatus = "planned" | "prepared" | "served" | "cancelled";

// Shopping List Status
export type ShoppingListStatus = "draft" | "pending_approval" | "approved" | "purchased";

// Event Form Data (for creation wizard)
export interface EventFormData {
    name: string;
    description: string;
    occasionType: OccasionType | "";
    eventDate: Date | undefined;
    eventTime: string;
    budgetType: BudgetType;
    budgetAmount: string;
    selectedMemberIds: string[];
    adultGuests: number;
    kidGuests: number;
    guestNotes?: string;
}

// Create Event DTO
export interface CreateEventDto {
    name: string;
    occasionType: OccasionType;
    eventDate: string | Date;
    eventTime?: string;
    description?: string;
    budgetType: BudgetType;
    budgetAmount?: number;
    currency?: string;
    adultGuests: number;
    kidGuests: number;
    selectedMemberIds: string[];
    guestNotes?: string;
    selectedMealTypes?: MealType[];
}

// Update Event DTO
export interface UpdateEventDto {
    name?: string;
    occasionType?: OccasionType;
    eventDate?: string | Date;
    eventTime?: string;
    description?: string;
    status?: EventStatus;
    budgetType?: BudgetType;
    budgetAmount?: number;
    adultGuests?: number;
    kidGuests?: number;
    selectedMemberIds?: string[];
    guestNotes?: string;
    actualCost?: number;
}

// Event Meal DTO
export interface CreateEventMealDto {
    mealType: MealType;
    scheduledTime?: string;
    notes?: string;
}

export interface UpdateEventMealDto {
    mealType?: MealType;
    scheduledTime?: string;
    status?: MealStatus;
    estimatedCost?: number;
    actualCost?: number;
    notes?: string;
}

// Add Recipe to Meal DTO
export interface AddRecipeToMealDto {
    recipeId: string;
    servings?: number;
    notes?: string;
}

// Generate Menu DTO
export interface GenerateMenuDto {
    mealTypes: MealType[];
    preferences?: {
        cuisineType?: string;
        difficultyLevel?: "easy" | "medium" | "hard";
        maxPrepTime?: number;
        dietaryRestrictions?: string[];
    };
}

// Log Member Consumption DTO
export interface LogMemberConsumptionDto {
    memberId: string;
    consumedRecipeIds: string[];
    notes?: string;
}

// Response Types
export interface EventResponse {
    id: string;
    accountId: string;
    name: string;
    occasionType: string;
    eventDate: string;
    eventTime?: string;
    description?: string;
    status: EventStatus;
    budgetType: BudgetType;
    budgetAmount?: number;
    currency?: string;
    adultGuests: number;
    kidGuests: number;
    totalServings: number;
    actualCost?: number;
    guestNotes?: string;
    selectedMealTypes?: MealType[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    meals?: EventMealResponse[];
    participants?: EventParticipantResponse[];
    budget?: EventBudgetResponse;
    shoppingList?: EventShoppingListResponse;
    costAnalysis?: CostAnalysisResponse;
    extraItems?: EventItemResponse[];
}

export interface EventItemResponse {
    id: string;
    eventId: string;
    name: string;
    category?: string;
    quantity: number;
    unit: string;
    estimatedCost?: number;
    actualCost?: number;
    notes?: string;
    createdAt: string;
}

export interface CreateEventItemDto {
    name: string;
    category?: string;
    quantity: number;
    unit: string;
    estimatedCost?: number;
    actualCost?: number;
    notes?: string;
}

export interface UpdateEventItemDto {
    name?: string;
    category?: string;
    quantity?: number;
    unit?: string;
    estimatedCost?: number;
    actualCost?: number;
    notes?: string;
}

export interface EventMealResponse {
    id: string;
    eventId: string;
    mealType: MealType;
    scheduledTime?: string;
    estimatedCost?: number;
    actualCost?: number;
    status: MealStatus;
    createdAt: string;
    recipes?: EventRecipeResponse[];
}

export interface EventRecipeResponse {
    id: string;
    eventMealId: string;
    recipeId: string;
    servings: number;
    scalingFactor: number;
    estimatedCost?: number;
    notes?: string;
    recipe?: {
        id: string;
        name: string;
        description?: string;
        servings: number;
        prepTimeMinutes?: number;
        cookTimeMinutes?: number;
        difficultyLevel?: string;
        cuisineType?: string;
        imageUrl?: string;
        estimatedCostPerServing?: number;
        calories?: number;
    };
}

export interface EventParticipantResponse {
    id: string;
    eventId: string;
    memberId: string;
    member?: {
        id: string;
        name: string;
        age?: number;
        role: string;
    };
    createdAt: string;
}

export interface EventBudgetResponse {
    id: string;
    eventId: string;
    totalBudget: number;
    totalSpent: number;
    currency: string;
    createdAt: string;
}

export interface EventShoppingListResponse {
    id: string;
    eventId: string;
    status: ShoppingListStatus;
    approvedBy?: string;
    approvedAt?: string;
    totalEstimated?: number;
    totalActual?: number;
    receiptUrl?: string;
    createdAt: string;
    items?: EventShoppingItemResponse[];
}

export interface EventShoppingItemResponse {
    id: string;
    shoppingListId: string;
    ingredientId?: string;
    ingredientName: string;
    quantity: number;
    unit: string;
    estimatedPrice?: number;
    actualPrice?: number;
    isPurchased: boolean;
    category?: string;
}

export interface CostAnalysisResponse {
    totalEventCost: number;
    budgetAllocated?: number;
    budgetUtilized: number;
    remaining?: number;
    costPerAdult: number;
    costPerKid: number;
    costPerServing: number;
    status: "under_budget" | "on_track" | "over_budget";
}

export interface EventStatsResponse {
    totalEvents: number;
    upcomingEvents: number;
    completedEvents: number;
    cancelledEvents: number;
    totalSpent: number;
    averageCostPerEvent: number;
    averageCostPerGuest: number;
}

export interface PaginatedEventsResponse {
    data: EventResponse[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

// Events Query Params
export interface GetEventsParams {
    accountId?: string;
    page?: number;
    limit?: number;
    sortBy?: "eventDate" | "name" | "createdAt" | "status";
    sortOrder?: "asc" | "desc";
    status?: EventStatus;
    occasionType?: OccasionType;
    fromDate?: string;
    toDate?: string;
    search?: string;
}

// Serving Multipliers
export const SERVING_MULTIPLIERS = {
    member: 1,
    adult: 1,
    kid: 0.5,
} as const;

// Helper function to calculate total servings
export function calculateTotalServings(
    memberCount: number,
    adultGuests: number,
    kidGuests: number
): number {
    return (
        memberCount * SERVING_MULTIPLIERS.member +
        adultGuests * SERVING_MULTIPLIERS.adult +
        kidGuests * SERVING_MULTIPLIERS.kid
    );
}

// ===== AI-Powered Features Types =====

// Budget Suggestion Request (no body needed, uses eventId from URL)
export interface BudgetSuggestionRequest {
    eventId: string;
}

// Budget Allocation per Meal Type
export interface MealBudgetAllocation {
    mealType: MealType;
    suggestedBudget: number;
    percentage: number;
    reasoning: string;
}

// Budget Suggestion Response
export interface BudgetSuggestionResponse {
    eventId: string;
    eventName: string;
    totalBudget: number;
    currency: string;
    mealTypes: MealType[];
    allocations: MealBudgetAllocation[];
    aiRecommendations: string[];
    totalAllocated: number;
}

// Event Recipe Generation Request
export interface EventRecipeGenerationDto {
    mealType: MealType;
    recipeCount?: number;
    budget?: number;
    preferredCuisines?: string[];
    customSearch?: string;
    considerHealthProfiles?: boolean;
    targetMemberIds?: string[];
}

// AI Generated Recipe (from event)
export interface AIGeneratedEventRecipe {
    id?: string;
    name: string;
    description?: string;
    cuisineType?: string;
    mealType: string;
    servings: number;
    imageUrl?: string;
    totalTimeMinutes?: number;
    difficultyLevel?: string;
    ingredients: {
        name: string;
        quantity: string;
        unit: string;
        isOptional?: boolean;
        notes?: string;
        estimatedCost?: number;
        category?: string;
        isPantryItem?: boolean;
    }[];
    shoppingList?: {
        ingredientName: string;
        quantity: string;
        unit: string;
    }[];
    instructions: string[];
    costAnalysis?: {
        totalCost: number;
        costPerServing: number;
        budgetEfficiency?: number;
        pantryItemsSavings?: number;
    };
    nutrition?: {
        calories: number;
        protein_g: number;
        carbs_g: number;
        fat_g: number;
        fiber_g?: number;
        sugar_g?: number;
        sodium_mg?: number;
        cholesterol_mg?: number;
    };
    nutritionalHighlights?: string[];
    healthScore?: number;
    healthConsiderations?: string[];
    cookingTips?: string[];
    variations?: string[];
    eventRecommendations?: string[];
    aiReasoningNotes?: string;
}

// Event Generation State
export interface EventGenerationState {
    id: string;
    eventId: string;
    stateData: any; // JSON blob of wizard state
    lastStep?: string;
    createdAt: string;
    updatedAt: string;
}

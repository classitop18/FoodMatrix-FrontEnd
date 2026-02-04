// Event Types for Event Meal Planning Module

import { LucideIcon } from "lucide-react";

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
export type MealType = "breakfast" | "brunch" | "lunch" | "snacks" | "dinner" | "dessert" | "beverages";

// Meal Status
export type MealStatus = "planned" | "prepared" | "served" | "cancelled";

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
    // For menu planning step
    selectedMealTypes: MealType[];
    // For recipes
    selectedRecipes: SelectedRecipeForEvent[];
}

// Selected Recipe for Event
export interface SelectedRecipeForEvent {
    recipeId: string;
    mealType: MealType;
    servings: number;
    recipe?: {
        id: string;
        name: string;
        description?: string;
        imageUrl?: string;
        estimatedCostPerServing?: number;
        prepTimeMinutes?: number;
        cookTimeMinutes?: number;
        calories?: number;
    };
}

// Member Types
export interface Member {
    id: string;
    name: string;
    age?: number | null;
    sex?: string | null;
    role?: string;
    user?: {
        id: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        avatar?: string;
    } | null;
}

// Occasion Option with icon and color
export interface OccasionOption {
    value: OccasionType;
    label: string;
    icon: LucideIcon;
    color: string;
    bgGradient: string;
}

// Meal Type Option
export interface MealTypeOption {
    value: MealType;
    label: string;
    icon: LucideIcon;
    color: string;
    description: string;
}

// Form Step Configuration
export interface StepConfig {
    id: number;
    title: string;
    description?: string;
    icon: LucideIcon;
}

// Props for Step Components
export interface EventDetailsStepProps {
    formData: EventFormData;
    onUpdate: <K extends keyof EventFormData>(key: K, value: EventFormData[K]) => void;
}

export interface BudgetStepProps {
    formData: EventFormData;
    onUpdate: <K extends keyof EventFormData>(key: K, value: EventFormData[K]) => void;
}

export interface GuestStepProps {
    formData: EventFormData;
    onUpdate: <K extends keyof EventFormData>(key: K, value: EventFormData[K]) => void;
    members: Member[];
    onToggleMember: (memberId: string) => void;
    onSelectAllMembers: () => void;
}

export interface MenuPlanningStepProps {
    formData: EventFormData;
    onUpdate: <K extends keyof EventFormData>(key: K, value: EventFormData[K]) => void;
    totalServings: number;
}

export interface RecipeSelectionStepProps {
    formData: EventFormData;
    onUpdate: <K extends keyof EventFormData>(key: K, value: EventFormData[K]) => void;
    totalServings: number;
    toggleRecipe: (recipeId: string, mealType: MealType) => void;
}

export interface ShoppingListStepProps {
    formData: EventFormData;
    totalServings: number;
    generatedShoppingList: ShoppingListItem[];
}

// Used in the guest step as a quick summary card
export interface GuestSummaryProps {
    memberCount: number;
    guestCount: number;
    totalServings: number;
}

export interface EventSummaryProps {
    formData: EventFormData;
    members: Member[];
    totalServings: number;
    totalEstimatedCost: number;
    isSubmitting: boolean;
    onSubmit: () => void;
}

// Shopping List Item
export interface ShoppingListItem {
    ingredientId?: string;
    ingredientName: string;
    quantity: number;
    unit: string;
    estimatedPrice?: number;
    category?: string;
}

// Step indicator props
export interface StepIndicatorProps {
    currentStep: number;
    steps: StepConfig[];
}

// Guest Counter Props
export interface GuestCounterProps {
    label: string;
    subLabel?: string;
    value: number;
    onIncrement: () => void;
    onDecrement: () => void;
    icon?: LucideIcon;
    iconColor?: string;
    iconBgColor?: string;
}

// Validation Hook Return Type
export interface UseEventFormValidationReturn {
    isStep1Valid: boolean;
    isStep2Valid: boolean;
    isStep3Valid: boolean;
    isStep4Valid: boolean;
    isStep5Valid: boolean;
    canProceed: boolean;
    getStepErrors: (step: number) => string[];
}

// Actions Hook Return Type
export interface UseEventFormActionsReturn {
    updateFormData: <K extends keyof EventFormData>(key: K, value: EventFormData[K]) => void;
    toggleMember: (memberId: string) => void;
    selectAllMembers: () => void;
    toggleMealType: (mealType: MealType) => void;
    toggleRecipe: (recipeId: string, mealType: MealType) => void;
    calculateTotalServings: () => number;
    calculateTotalEstimatedCost: () => number;
}

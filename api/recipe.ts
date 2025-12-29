import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { Recipe } from "@/lib/recipe-constants";

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

// Hooks

export const useAddRecipeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (recipe: Partial<Recipe>) => {
            const response = await axios.post("/api/recipes", recipe);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recipes"] });
        },
    });
};

export const useGenerateAIRecipeMutation = () => {
    return useMutation({
        mutationFn: async (payload: GenerateAIRecipePayload) => {
            const response = await axios.post("/api/recipes/generate-ai", payload);
            return response.data;
        },
    });
};

export const useGenerateAICustomRecipeMutation = () => {
    return useMutation({
        mutationFn: async (payload: GenerateCustomRecipePayload) => {
            const response = await axios.post("/api/recipes/search-custom", payload);
            return response.data;
        },
    });
};

export const useUpdateRecipeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const response = await axios.patch(`/api/recipes/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recipes"] });
        },
    });
};

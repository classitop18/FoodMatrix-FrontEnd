import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RecipeService } from "./recipe.service";
import {
    GenerateAIRecipePayload,
    GenerateCustomRecipePayload,
    Recipe,
} from "./types/recipe.types";

const recipeService = new RecipeService();

export const useAddRecipeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (recipe: Partial<Recipe>) => recipeService.addRecipe(recipe),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recipes"] });
        },
    });
};

export const useGenerateAIRecipeMutation = () => {
    return useMutation({
        mutationFn: (payload: GenerateAIRecipePayload) =>
            recipeService.generateAIRecipe(payload),
    });
};

export const useGenerateAICustomRecipeMutation = () => {
    return useMutation({
        mutationFn: (payload: GenerateCustomRecipePayload) =>
            recipeService.generateCustomRecipe(payload),
    });
};

export const useUpdateRecipeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            recipeService.updateRecipe(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recipes"] });
        },
    });
};

export const useDeleteRecipeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => recipeService.deleteRecipe(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recipes"] });
        },
    });
};

export const useUpdateCookingStatusMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            status,
        }: {
            id: string;
            status: "cooked" | "not_cooked" | "not_interested";
        }) => recipeService.updateCookingStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recipes"] });
        },
    });
};

export const useInteractWithRecipeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            action,
        }: {
            id: string;
            action: "like" | "dislike" | "favorite";
        }) => recipeService.interactWithRecipe(id, action),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recipes"] });
        },
    });
};

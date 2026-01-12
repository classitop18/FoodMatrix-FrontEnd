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
    onMutate: async ({ id, action }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["recipes"] });

      // Snapshot the previous value
      const previousRecipes = queryClient.getQueriesData({
        queryKey: ["recipes"],
      });

      // Optimistically update to the new value
      queryClient.setQueriesData({ queryKey: ["recipes"] }, (old: any) => {
        if (!old) return old;

        // Handle InfiniteQuery structure
        if (old.pages) {
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              recipes: page.recipes.map((recipe: Recipe) => {
                if (recipe.id === id) {
                  // Create a new recipe object with updated fields
                  const updatedRecipe = { ...recipe };

                  if (action === "favorite") {
                    updatedRecipe.isFavorite = !recipe.isFavorite;
                  } else if (action === "like") {
                    // Assuming toggle behavior or simple set, usually mutual exclusion with dislike
                    updatedRecipe.isLiked = !recipe.isLiked;
                    if (updatedRecipe.isLiked) updatedRecipe.isDisliked = false;
                  } else if (action === "dislike") {
                    updatedRecipe.isDisliked = !recipe.isDisliked;
                    if (updatedRecipe.isDisliked) updatedRecipe.isLiked = false;
                  }
                  return updatedRecipe;
                }
                return recipe;
              }),
            })),
          };
        }
        return old;
      });

      // Return a context object with the snapshotted value
      return { previousRecipes };
    },
    onError: (err, newTodo, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousRecipes) {
        context.previousRecipes.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Intentionally NOT validating to prevent refetch logic as per user request
      // "sirf update ho dobara fetch na ho puri recipe"
      // queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
};

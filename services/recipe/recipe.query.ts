import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { RecipeService } from "./recipe.service";
import { RecipeFilters } from "./types/recipe.types";

const recipeService = new RecipeService();

export const useRecipesInfiniteQuery = (filters: RecipeFilters) => {
  return useInfiniteQuery({
    queryKey: ["recipes", filters],
    queryFn: async ({ pageParam = 1 }) => {
      console.log("Fetching recipes with params:", {
        ...filters,
        page: pageParam,
      });
      return recipeService.getRecipes({
        ...filters,
        page: pageParam as number,
      });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    placeholderData: keepPreviousData,
  });
};

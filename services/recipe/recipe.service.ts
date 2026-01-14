import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  GenerateAIRecipePayload,
  GenerateCustomRecipePayload,
  Recipe,
  RecipeFilters,
  RecipesResponse,
} from "./types/recipe.types";

export class RecipeService {
  // Get specific recipe by ID
  async getRecipeById(id: string): Promise<Recipe> {
    const response = await apiClient.get(
      API_ENDPOINTS.RECIPE.GET_RECIPE_BY_ID(id),
    );
    return response.data?.data;
  }

  // Get recipes with filtering and pagination
  async getRecipes(filters: RecipeFilters): Promise<RecipesResponse> {
    const params = new URLSearchParams();

    // Add page param
    if (filters.page) params.append("page", filters.page.toString());

    Object.entries(filters).forEach(([key, value]) => {
      if (
        key !== "page" &&
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(
      `${API_ENDPOINTS.RECIPE.GET_RECIPES}?${params.toString()}`,
    );
    return response.data?.data;
  }

  // Add a new recipe manually
  async addRecipe(recipe: Partial<Recipe>): Promise<Recipe> {
    const response = await apiClient.post(
      API_ENDPOINTS.RECIPE.CREATE_RECIPE,
      recipe,
    );
    return response.data;
  }

  // Generate recipe using AI
  async generateAIRecipe(payload: GenerateAIRecipePayload): Promise<any> {
    const response = await apiClient.post(
      API_ENDPOINTS.RECIPE.GENERATE_AI,
      payload,
    );
    return response.data;
  }

  // Generate custom recipe
  async generateCustomRecipe(
    payload: GenerateCustomRecipePayload,
  ): Promise<any> {
    const response = await apiClient.post(
      API_ENDPOINTS.RECIPE.SEARCH_CUSTOM,
      payload,
    );
    return response.data;
  }

  // Update an existing recipe
  async updateRecipe(id: string, data: any): Promise<Recipe> {
    const response = await apiClient.patch(
      API_ENDPOINTS.RECIPE.UPDATE_RECIPE(id),
      data,
    );
    return response.data;
  }

  // Delete a recipe
  async deleteRecipe(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.RECIPE.DELETE_RECIPE(id));
  }

  // Update cooking status
  async updateCookingStatus(
    id: string,
    status: "cooked" | "not_cooked" | "not_interested",
  ): Promise<any> {
    const response = await apiClient.patch(
      API_ENDPOINTS.RECIPE.UPDATE_STATUS(id),
      {
        status,
      },
    );
    return response.data;
  }

  // Interact with recipe (Like, Dislike, Favorite)
  async interactWithRecipe(
    id: string,
    action: "like" | "dislike" | "favorite",
  ): Promise<any> {
    const response = await apiClient.post(API_ENDPOINTS.RECIPE.INTERACT(id), {
      action,
    });
    return response.data;
  }
  // Get shopping list for a recipe
  async getShoppingList(id: string): Promise<any> {
    const response = await apiClient.get(
      API_ENDPOINTS.RECIPE.GET_SHOPPING_LIST(id),
    );
    return response.data?.data;
  }

  // Get merged shopping list
  async getMergedShoppingList(recipeIds: string[]): Promise<any> {
    const response = await apiClient.post(
      API_ENDPOINTS.RECIPE.GET_MERGED_SHOPPING_LIST,
      { recipeIds },
    );
    return response.data?.data;
  }
}

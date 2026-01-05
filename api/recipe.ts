import {
  useMutation,
  useQueryClient,
  useQuery,
  useInfiniteQuery,
  keepPreviousData,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
// Removed import { Recipe } from "@/lib/recipe-constants";

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

// Hooks

export const useRecipesInfiniteQuery = (filters: RecipeFilters) => {
  return useInfiniteQuery({
    queryKey: ["recipes", filters],
    queryFn: async ({ pageParam = 1 }) => {
      console.log("Fetching recipes with params:", {
        ...filters,
        page: pageParam,
      });
      const params = new URLSearchParams();
      // Add page param
      params.append("page", pageParam.toString());

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
      const response = await apiClient.get(`/recipes?${params.toString()}`);
      console.log(response?.data?.data, "reciperesponse");
      return response.data?.data as RecipesResponse;
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

export const useAddRecipeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (recipe: Partial<Recipe>) => {
      const response = await apiClient.post("/recipes", recipe);
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
      const response = await apiClient.post("/recipes/generate-ai", payload);
      return response.data;
    },
  });
};

export const useGenerateAICustomRecipeMutation = () => {
  return useMutation({
    mutationFn: async (payload: GenerateCustomRecipePayload) => {
      const response = await apiClient.post("/recipes/search-custom", payload);
      return response.data;
    },
  });
};

export const useUpdateRecipeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.patch(`/recipes/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
};

export const useDeleteRecipeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/recipes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
};

export const useUpdateCookingStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "cooked" | "not_cooked" | "not_interested";
    }) => {
      const response = await apiClient.patch(`/recipes/${id}/status`, {
        status,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
};

export interface MealPlan {
  id: string;
  accountId: string;
  createdBy: string;
  mealDate: string; // ISO string from JSON
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  servings: number;
  status: "planned" | "cooked" | "skipped";
  createdAt: string;
  // recipeId?: string; // TBD
  // Optional recipe metadata if joined (not yet implemented in backend)
}

export interface CreateMealPlanPayload {
  mealDate: Date | string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  servings?: number;
  status?: "planned" | "cooked" | "skipped";
}

export interface UpdateMealPlanPayload extends Partial<CreateMealPlanPayload> {}

export interface GetMealPlansQuery {
  page?: number;
  limit?: number;
  startDate?: string; // "YYYY-MM-DD"
  endDate?: string; // "YYYY-MM-DD"
}

export interface MealPlanPaginatedResponse {
  data: MealPlan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

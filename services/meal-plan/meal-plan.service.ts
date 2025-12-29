import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  CreateMealPlanPayload,
  GetMealPlansQuery,
  MealPlan,
  MealPlanPaginatedResponse,
  UpdateMealPlanPayload,
} from "./types/meal-plan.types";

export class MealPlanService {
  // Get meal plans
  async getMealPlans(
    params: GetMealPlansQuery & { accountId?: string },
  ): Promise<MealPlanPaginatedResponse> {
    const queryString = new URLSearchParams();

    if (params.page) queryString.append("page", params.page.toString());
    if (params.limit) queryString.append("limit", params.limit.toString());
    if (params.startDate) queryString.append("startDate", params.startDate);
    if (params.endDate) queryString.append("endDate", params.endDate);

    const config = params.accountId
      ? { headers: { "x-account-id": params.accountId } }
      : {};

    const response = await apiClient.get(
      `${API_ENDPOINTS.MEAL_PLAN.GET_MEAL_PLANS}?${queryString.toString()}`,
      config,
    );
    return response.data.data;
  }

  // Create meal plan
  async createMealPlan(
    payload: CreateMealPlanPayload & { accountId?: string },
  ): Promise<MealPlan> {
    const { accountId, ...data } = payload;
    const config = accountId ? { headers: { "x-account-id": accountId } } : {};

    const response = await apiClient.post(
      API_ENDPOINTS.MEAL_PLAN.CREATE_MEAL_PLAN,
      data,
      config,
    );
    return response.data.data;
  }

  // Update meal plan
  async updateMealPlan(
    id: string,
    payload: UpdateMealPlanPayload & { accountId?: string },
  ): Promise<MealPlan> {
    const { accountId, ...data } = payload;
    const config = accountId ? { headers: { "x-account-id": accountId } } : {};

    const response = await apiClient.patch(
      API_ENDPOINTS.MEAL_PLAN.UPDATE_MEAL_PLAN(id),
      data,
      config,
    );
    return response.data.data;
  }

  // Delete meal plan
  async deleteMealPlan(
    id: string,
    accountId?: string,
  ): Promise<{ success: boolean }> {
    const config = accountId ? { headers: { "x-account-id": accountId } } : {};

    const response = await apiClient.delete(
      API_ENDPOINTS.MEAL_PLAN.DELETE_MEAL_PLAN(id),
      config,
    );
    return response.data.data;
  }
}

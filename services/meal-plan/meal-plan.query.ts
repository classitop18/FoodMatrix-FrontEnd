import { useQuery } from "@tanstack/react-query";
import { MealPlanService } from "./meal-plan.service";
import type { GetMealPlansQuery } from "./types/meal-plan.types";

const mealPlanService = new MealPlanService();

export const useMealPlansQuery = (
  params: GetMealPlansQuery & { accountId?: string },
) => {
  return useQuery({
    queryKey: ["meal-plans", params],
    queryFn: () => mealPlanService.getMealPlans(params),
    staleTime: 30 * 1000,
    enabled: !!params.accountId,
  });
};

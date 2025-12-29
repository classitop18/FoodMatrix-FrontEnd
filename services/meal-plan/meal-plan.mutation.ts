import { useMutation } from "@tanstack/react-query";
import { MealPlanService } from "./meal-plan.service";
import { queryClient } from "@/lib/react-query";
import type {
  CreateMealPlanPayload,
  UpdateMealPlanPayload,
} from "./types/meal-plan.types";

const mealPlanService = new MealPlanService();

export const useCreateMealPlanMutation = () => {
  return useMutation({
    mutationFn: (payload: CreateMealPlanPayload & { accountId?: string }) =>
      mealPlanService.createMealPlan(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-plans"] });
    },
    onError: (error: any) => {
      console.error("Error creating meal plan:", error);
    },
  });
};

export const useUpdateMealPlanMutation = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateMealPlanPayload & { accountId?: string };
    }) => mealPlanService.updateMealPlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-plans"] });
    },
    onError: (error: any) => {
      console.error("Error updating meal plan:", error);
    },
  });
};

export const useDeleteMealPlanMutation = () => {
  return useMutation({
    mutationFn: ({ id, accountId }: { id: string; accountId?: string }) =>
      mealPlanService.deleteMealPlan(id, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-plans"] });
    },
    onError: (error: any) => {
      console.error("Error deleting meal plan:", error);
    },
  });
};

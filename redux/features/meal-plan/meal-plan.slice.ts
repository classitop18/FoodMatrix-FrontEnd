import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Recipe } from "@/lib/recipe-constants";

interface MealPlanState {
  plans: Record<string, Record<string, Recipe>>; // { date: { mealType: Recipe } }
  generatedRecipes: Record<string, Recipe[]>;
  generatedCustomRecipes: Record<string, Recipe[]>;
}

const initialState: MealPlanState = {
  plans: {},
  generatedRecipes: {},
  generatedCustomRecipes: {},
};

export const mealPlanSlice = createSlice({
  name: "mealPlan",
  initialState,
  reducers: {
    setMealPlan: (
      state,
      action: PayloadAction<{ date: string; mealType: string; recipe: Recipe }>,
    ) => {
      const { date, mealType, recipe } = action.payload;
      if (!state.plans[date]) {
        state.plans[date] = {};
      }
      state.plans[date][mealType] = recipe;
    },
    removeMealPlan: (
      state,
      action: PayloadAction<{ date: string; mealType: string }>,
    ) => {
      const { date, mealType } = action.payload;
      if (state.plans[date]) {
        delete state.plans[date][mealType];
        // Clean up date object if empty
        if (Object.keys(state.plans[date]).length === 0) {
          delete state.plans[date];
        }
      }
    },

    toggleMealPlan: (
      state,
      action: PayloadAction<{ date: string; mealType: string; recipe: Recipe }>,
    ) => {
      const { date, mealType, recipe } = action.payload;
      if (!state.plans[date]) {
        state.plans[date] = {};
      }

      const currentRecipe = state.plans[date][mealType];
      if (currentRecipe && currentRecipe.id === recipe.id) {
        // If same recipe selected, remove it
        delete state.plans[date][mealType];
        if (Object.keys(state.plans[date]).length === 0) {
          delete state.plans[date];
        }
      } else {
        // Otherwise set/overwrite
        state.plans[date][mealType] = recipe;
      }
    },
    setGeneratedRecipes: (
      state,
      action: PayloadAction<{ slotKey: string; recipes: Recipe[] }>,
    ) => {
      const { slotKey, recipes } = action.payload;
      state.generatedRecipes[slotKey] = recipes;
    },
    setGeneratedCustomRecipes: (
      state,
      action: PayloadAction<{ slotKey: string; recipes: Recipe[] }>,
    ) => {
      const { slotKey, recipes } = action.payload;
      state.generatedCustomRecipes[slotKey] = recipes;
    },
    clearGeneratedRecipes: (state) => {
      state.generatedRecipes = {};
      state.generatedCustomRecipes = {};
    },
  },
});

export const {
  setMealPlan,
  removeMealPlan,
  toggleMealPlan,
  setGeneratedRecipes,
  setGeneratedCustomRecipes,
  clearGeneratedRecipes,
} = mealPlanSlice.actions;

export default mealPlanSlice.reducer;

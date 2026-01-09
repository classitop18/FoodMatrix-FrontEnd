import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Recipe } from "@/lib/recipe-constants";

interface MealPlanState {
  plans: Record<string, Record<string, Recipe[]>>; // { date: { mealType: Recipe[] } }
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
      // If setting a plan directly, we can either append or replace.
      // Assuming 'set' implies replacing or starting fresh for that slot?
      // Or maybe we treat it as adding? "toggle" is safer for UI interaction.
      // Let's make setMealPlan create a single-item array, resetting previous selection if any.
      state.plans[date][mealType] = [recipe];
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

    hydrateMealPlans: (
      state,
      action: PayloadAction<Record<string, Record<string, Recipe[]>>>,
    ) => {
      state.plans = action.payload;
    },

    toggleMealPlan: (
      state,
      action: PayloadAction<{ date: string; mealType: string; recipe: Recipe }>,
    ) => {
      const { date, mealType, recipe } = action.payload;
      if (!state.plans[date]) {
        state.plans[date] = {};
      }

      const currentRecipes = state.plans[date][mealType] || [];
      const existingIndex = currentRecipes.findIndex((r) => r.id === recipe.id);

      if (existingIndex !== -1) {
        // Recipe exists, remove it
        currentRecipes.splice(existingIndex, 1);
        if (currentRecipes.length === 0) {
          delete state.plans[date][mealType];
        } else {
          state.plans[date][mealType] = currentRecipes;
        }
      } else {
        // Recipe doesn't exist, add it
        // Check if currentRecipes is undefined (handled by || [])
        // If the slot was empty, we need to create the array
        if (!state.plans[date][mealType]) {
          state.plans[date][mealType] = [recipe];
        } else {
          state.plans[date][mealType].push(recipe);
        }
      }

      if (state.plans[date] && Object.keys(state.plans[date]).length === 0) {
        delete state.plans[date];
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
  hydrateMealPlans,
} = mealPlanSlice.actions;

export default mealPlanSlice.reducer;

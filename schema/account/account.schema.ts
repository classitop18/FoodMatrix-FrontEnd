import z from "zod";

export const setupSchema = z.object({
  accountType: z.enum(["individual", "family", "group"]).default("family"),
  accountName: z.string(),
  description: z.string(),
  // Budget Periods
  dailyBudget: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce
      .number()
      .min(1, "Minimum daily budget is $1")
      .max(10000000, "Maximum daily budget is $10,000,000")
      .optional()
  ),
  weeklyBudget: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce
      .number()
      .min(10, "Minimum weekly budget is $10")
      .max(10000000, "Maximum weekly budget is $10,000,000")
      .optional()
      .default(300)
  ),
  currentAllocation: z
    .enum(["daily", "weekly"])
    .default("weekly"),
  // Food Category Percentages (User Configurable)
  groceriesPercentage: z.coerce.number().min(0).max(100).default(100),
  diningPercentage: z.coerce.number().min(0).max(100).default(0),
  emergencyPercentage: z.coerce.number().min(0).max(100).default(0),

  // All other fields are optional
  height: z.coerce
    .number()
    .max(120, "Height must be less than 120 inches")
    .optional(),
  weight: z.coerce
    .number()
    .max(1000, "Weight must be less than 1000 lbs")
    .optional(),
  activityLevel: z
    .enum(["sedentary", "moderate", "active", "very_active"])
    .optional(),
  sex: z.enum(["male", "female", "other"]).optional(),
  conditions: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  dietaryRestrictions: z.array(z.string()).default([]),
  organicPreference: z
    .enum(["standard_only", "prefer_when_budget_allows", "organic_only"])
    .default("standard_only"),
  goals: z.array(z.string()).default([]),
  targetWeight: z.coerce
    .number()
    .max(1000, "Target weight must be less than 1000 lbs")
    .optional(),
  cookingSkill: z.enum(["beginner", "moderate", "advanced"]).optional(),
  cookingFrequency: z
    .enum(["mostly_home", "mixed", "mostly_dining_out"])
    .optional(),
  preferredCuisines: z.array(z.string()).default([]),
  budgetFlexibility: z.enum(["strict", "moderate", "flexible"]).optional(),
  hasDeepFreezer: z.boolean().default(false),
  shopsDaily: z.boolean().default(false),
});

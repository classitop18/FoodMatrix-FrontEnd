import z from "zod";

export const memberSchema = z.object({
    name: z.string().min(1, "Name is required"),
    age: z.coerce.number().min(1, "Age must be at least 1").max(120, "Age must be less than 120"),
    sex: z.enum(['male', 'female', 'other']),
    isAdmin: z.boolean().default(false),
});

export const healthProfileSchema = z.object({
    height: z.coerce.number().min(36, "Height must be at least 36 inches").max(96, "Height must be less than 96 inches").optional(),
    weight: z.coerce.number().min(50, "Weight must be at least 50 pounds").max(500, "Weight must be less than 500 pounds").optional(),
    activityLevel: z.enum(['sedentary', 'moderate', 'active', 'very_active']).optional(),
    conditions: z.array(z.enum(['type1_diabetes', 'type2_diabetes', 'prediabetes', 'hypertension', 'high_cholesterol', 'heart_disease', 'ibs', 'gerd', 'celiac_disease', 'obesity', 'pcos', 'kidney_disease', 'gout'])).default([]),
    allergies: z.array(z.enum(['nuts', 'dairy', 'gluten', 'shellfish', 'soy', 'eggs'])).default([]),
    dietaryRestrictions: z.array(z.enum(['vegan', 'vegetarian', 'keto', 'paleo', 'mediterranean', 'low_carb', 'dash', 'halal', 'kosher'])).default([]),
    goals: z.array(z.enum(['lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle', 'control_blood_sugar', 'lower_cholesterol', 'reduce_sodium', 'general_wellness', 'healthy_family_eating'])).default([]),
    targetWeight: z.coerce.number().min(50, "Target weight must be at least 50 pounds").max(500, "Target weight must be less than 500 pounds").optional(),
    cookingSkill: z.enum(['beginner', 'moderate', 'advanced']).optional(),
    cookingFrequency: z.enum(['mostly_home', 'mixed', 'mostly_dining_out']).optional(),
    preferredCuisines: z.array(z.string()).default([]),
    budgetFlexibility: z.enum(['strict', 'moderate', 'flexible']).optional(),
    hasDeepFreezer: z.boolean().default(false),
    shopsDaily: z.boolean().default(false),
    privacyLevel: z.enum(['private', 'admin_only', 'shared']).default('private'),
    organicPreference: z.enum(['standard_only', 'prefer_when_budget_allows', 'organic_only']).default('standard_only'),
    excludedFoods: z.array(z.string()).default([]),
    includedFoods: z.array(z.string()).default([]),
    customExclusions: z.array(z.string()).default([]),
    customInclusions: z.array(z.string()).default([]),
    preferenceSets: z.array(z.string()).default([]),
    autoLearn: z.boolean().default(true),
    autoSwap: z.boolean().default(true),
});

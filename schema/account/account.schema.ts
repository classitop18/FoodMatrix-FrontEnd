import z from "zod";




export const setupSchema = z.object({
    accountType: z.enum(['individual', 'family', 'group']).default('family'),
    accountName: z.string(),
    description: z.string(),
    // Budget Periods (Only weekly is required)
    dailyBudget: z.coerce.number().optional(),
    weeklyBudget: z.coerce.number().min(10, "Minimum weekly budget is $10").default(300),
    monthlyBudget: z.coerce.number().optional(),
    annualBudget: z.coerce.number().optional(),
    currentAllocation: z.enum(['daily', 'weekly', 'monthly', 'annual']).default('weekly'),
    // Food Category Percentages (User Configurable)
    groceriesPercentage: z.coerce.number().min(0).max(100).default(70),
    diningPercentage: z.coerce.number().min(0).max(100).default(20),
    emergencyPercentage: z.coerce.number().min(0).max(100).default(10),

    // All other fields are optional
    height: z.coerce.number().optional(),
    weight: z.coerce.number().optional(),
    activityLevel: z.enum(['sedentary', 'moderate', 'active', 'very_active']).optional(),
    conditions: z.array(z.string()).default([]),
    allergies: z.array(z.string()).default([]),
    dietaryRestrictions: z.array(z.string()).default([]),
    organicPreference: z.enum(['standard_only', 'prefer_when_budget_allows', 'organic_only']).default('standard_only'),
    goals: z.array(z.string()).default([]),
    targetWeight: z.coerce.number().optional(),
    cookingSkill: z.enum(['beginner', 'moderate', 'advanced']).optional(),
    cookingFrequency: z.enum(['mostly_home', 'mixed', 'mostly_dining_out']).optional(),
    preferredCuisines: z.array(z.string()).default([]),
    budgetFlexibility: z.enum(['strict', 'moderate', 'flexible']).optional(),
    hasDeepFreezer: z.boolean().default(false),
    shopsDaily: z.boolean().default(false),
});
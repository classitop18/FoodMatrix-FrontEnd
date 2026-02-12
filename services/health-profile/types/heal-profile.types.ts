export interface HealthProfilePayload {
  height?: number;
  weight?: number;
  activityLevel?: string;
  sex?: string;

  conditions?: string[];
  allergies?: string[];
  dietaryRestrictions?: string[];
  organicPreference?: string;

  goals?: string[];
  targetWeight?: number;

  cookingSkill?: string;
  cookingFrequency?: string;
  preferredCuisines?: string[];

  budgetFlexibility?: string;

  hasDeepFreezer?: boolean;
  shopsDaily?: boolean;

  isPrivate?: boolean;
  healthScore?: number;
}

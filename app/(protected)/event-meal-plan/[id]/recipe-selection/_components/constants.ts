import { Sun, Utensils, Coffee, Cookie, Moon, Cake, Wine } from "lucide-react";
import { MealType } from "@/services/event/event.types";
import { MealTypeConfig } from "./types";

export const MEAL_TYPE_CONFIG: Record<MealType, MealTypeConfig> = {
    breakfast: {
        icon: Sun,
        label: "Breakfast",
        color: "text-amber-600",
        defaultTime: "08:00",
        description: "Start your day with a nutritious morning meal",
        budgetWeight: 15
    },
    lunch: {
        icon: Utensils,
        label: "Lunch",
        color: "text-green-600",
        defaultTime: "12:30",
        description: "Midday meal to fuel the afternoon",
        budgetWeight: 25
    },
    snacks: {
        icon: Cookie,
        label: "Snacks",
        color: "text-pink-600",
        defaultTime: "16:00",
        description: "Light bites between meals",
        budgetWeight: 10
    },
    dinner: {
        icon: Moon,
        label: "Dinner",
        color: "text-purple-600",
        defaultTime: "19:00",
        description: "Main evening meal - often the centerpiece",
        budgetWeight: 35
    },
    dessert: {
        icon: Cake,
        label: "Dessert",
        color: "text-rose-600",
        defaultTime: "20:30",
        description: "Sweet endings to celebrate",
        budgetWeight: 10
    },
    beverages: {
        icon: Wine,
        label: "Beverages",
        color: "text-blue-600",
        defaultTime: "18:00",
        description: "Drinks and refreshments",
        budgetWeight: 5
    }
};

export const DEFAULT_BUDGET_WEIGHTS: Record<MealType, number> = {
    breakfast: 15,
    lunch: 25,
    snacks: 10,
    dinner: 35,
    dessert: 10,
    beverages: 5
};

export const CUISINE_OPTIONS = [
    { value: "indian", label: "🇮🇳 Indian" },
    { value: "north_indian", label: "🍛 North Indian" },
    { value: "south_indian", label: "🥘 South Indian" },
    { value: "chinese", label: "🇨🇳 Chinese" },
    { value: "italian", label: "🇮🇹 Italian" },
    { value: "mexican", label: "🇲🇽 Mexican" },
    { value: "thai", label: "🇹🇭 Thai" },
    { value: "japanese", label: "🇯🇵 Japanese" },
    { value: "mediterranean", label: "🫒 Mediterranean" },
    { value: "middle_eastern", label: "🥙 Middle Eastern" },
    { value: "continental", label: "🍽️ Continental" },
    { value: "fusion", label: "✨ Fusion" }
];

export const DIFFICULTY_OPTIONS = [
    { value: "easy", label: "Easy", description: "Quick and simple recipes" },
    { value: "medium", label: "Medium", description: "Some cooking experience needed" },
    { value: "hard", label: "Advanced", description: "For experienced home cooks" }
];

export const RECIPE_COUNT_OPTIONS = [
    { value: 1, label: "1 Recipe" },
    { value: 2, label: "2 Recipes" },
    { value: 3, label: "3 Recipes (Recommended)" },
    { value: 5, label: "5 Recipes" }
];

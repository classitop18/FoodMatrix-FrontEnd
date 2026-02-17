import { Coffee, Sun, Cookie, Moon, GlassWater, UtensilsCrossed, Beef, Salad, Soup, Sandwich, Sparkles } from "lucide-react";
import { MealType } from "@/services/event/event.types";
import React from "react";

export const MEAL_TYPE_CONFIG: Record<MealType, { label: string; icon: React.ElementType; color: string; defaultTime: string }> = {
    breakfast: { label: "Breakfast", icon: Coffee, color: "text-[#7661d3]", defaultTime: "08:00" },
    lunch: { label: "Lunch", icon: Sun, color: "text-[#7661d3]", defaultTime: "13:00" },
    snacks: { label: "Snacks", icon: Cookie, color: "text-[#7661d3]", defaultTime: "16:00" },
    dinner: { label: "Dinner", icon: Moon, color: "text-[#7661d3]", defaultTime: "19:00" },
    dessert: { label: "Dessert", icon: Cookie, color: "text-[#7661d3]", defaultTime: "20:30" },
    beverages: { label: "Beverages", icon: GlassWater, color: "text-[#7661d3]", defaultTime: "All Day" }
};

export const DEFAULT_BUDGET_WEIGHTS: Record<MealType, number> = {
    breakfast: 15,
    lunch: 25,
    snacks: 5,
    dinner: 30,
    dessert: 3,
    beverages: 2
};

// Course type options for recipe generation (menu categories)
export const COURSE_TYPE_OPTIONS: { value: string; label: string; icon: React.ElementType; description: string }[] = [
    { value: "ALL", label: "All Courses", icon: Sparkles, description: "Mix of all course types" },
    { value: "starter", label: "Starters / Appetizers", icon: Sandwich, description: "Finger food, snacks, small plates" },
    { value: "main_course", label: "Main Course", icon: Beef, description: "Rice, breads, curries, pasta" },
    { value: "side_dish", label: "Side Dishes", icon: Salad, description: "Salad, raita, pickles, accompaniments" },
    { value: "appetizer", label: "Appetizers", icon: UtensilsCrossed, description: "Bite-sized, canapés" },
    { value: "soup", label: "Soups", icon: Soup, description: "Broths, chowders, consommés" },
    { value: "salad", label: "Salads", icon: Salad, description: "Fresh, seasonal, mixed greens" },
];

// Budget categories for course-based budget distribution
import { BudgetCategory } from "./types";

export const BUDGET_CATEGORIES: { value: BudgetCategory; label: string; icon: React.ElementType; description: string; color: string }[] = [
    { value: "starter", label: "Starters", icon: Sandwich, description: "Appetizers, finger food, small plates", color: "text-orange-500" },
    { value: "main_course", label: "Main Course", icon: Beef, description: "Rice, curries, pasta, breads", color: "text-red-500" },
    { value: "side_dish", label: "Side Dishes", icon: Salad, description: "Salad, raita, pickles", color: "text-green-500" },
    { value: "snacks", label: "Snacks", icon: Cookie, description: "Light bites, chips, nuts", color: "text-yellow-500" },
    { value: "desserts", label: "Desserts", icon: Cookie, description: "Sweets, cakes, ice cream", color: "text-pink-500" },
    { value: "beverages", label: "Beverages", icon: GlassWater, description: "Drinks, juice, tea/coffee", color: "text-blue-500" },
];

export const DEFAULT_CATEGORY_WEIGHTS: Record<BudgetCategory, number> = {
    starter: 15,
    main_course: 35,
    side_dish: 10,
    snacks: 10,
    desserts: 15,
    beverages: 15,
};

import { Coffee, Sun, Cookie, Moon, GlassWater } from "lucide-react";
import { MealType } from "@/services/event/event.types";
import React from "react";

export const MEAL_TYPE_CONFIG: Record<MealType, { label: string; icon: React.ElementType; color: string; defaultTime: string }> = {
    breakfast: { label: "Breakfast", icon: Coffee, color: "text-[#7661d3]", defaultTime: "08:00" },
    brunch: { label: "Brunch", icon: Sun, color: "text-[#7661d3]", defaultTime: "10:30" },
    lunch: { label: "Lunch", icon: Sun, color: "text-[#7661d3]", defaultTime: "13:00" },
    snacks: { label: "Snacks", icon: Cookie, color: "text-[#7661d3]", defaultTime: "16:00" },
    dinner: { label: "Dinner", icon: Moon, color: "text-[#7661d3]", defaultTime: "19:00" },
    dessert: { label: "Dessert", icon: Cookie, color: "text-[#7661d3]", defaultTime: "20:30" },
    beverages: { label: "Beverages", icon: GlassWater, color: "text-[#7661d3]", defaultTime: "All Day" }
};

export const DEFAULT_BUDGET_WEIGHTS: Record<MealType, number> = {
    breakfast: 15,
    brunch: 20,
    lunch: 25,
    snacks: 5,
    dinner: 30,
    dessert: 3,
    beverages: 2
};

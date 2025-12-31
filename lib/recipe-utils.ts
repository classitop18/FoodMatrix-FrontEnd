import { Recipe } from "@/api/recipe";
import { format, startOfWeek, endOfWeek, parseISO } from "date-fns";

export interface GroupedRecipes {
  [key: string]: Recipe[];
}

export const groupRecipesByWeek = (recipes: Recipe[]): GroupedRecipes => {
  const groups: GroupedRecipes = {};

  recipes.forEach((recipe) => {
    const date = parseISO(recipe.createdAt);
    const start = startOfWeek(date, { weekStartsOn: 0 }); // Sunday start
    const end = endOfWeek(date, { weekStartsOn: 0 });

    const key = `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(recipe);
  });

  return groups;
};

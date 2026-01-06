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

export function getRecipeImageUrl(imageUrl?: string): string | undefined {
  if (!imageUrl) return undefined;
  if (imageUrl.startsWith("http")) return imageUrl;

  // It's a relative path (e.g., /uploads/...)
  // Get base URL from env or default
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

  // Remove /api/v1 suffix to get root
  try {
    const url = new URL(apiBase);
    const finalUrl = `${url.origin}${imageUrl}`;
    return finalUrl;
  } catch (e) {
    // Fallback if env var is invalid
    return `http://localhost:4000${imageUrl}`;
  }
}

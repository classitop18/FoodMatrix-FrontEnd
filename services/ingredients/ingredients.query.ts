import { useQuery } from "@tanstack/react-query";
import { IngredientsService } from "./ingredients.service";

const ingredientsService = new IngredientsService();

// Get ingredients by category
export const useIngredients = (category?: string) => {
    return useQuery({
        queryKey: ["ingredients", "category", category],
        queryFn: () =>
            category
                ? ingredientsService.getByCategory(category.toLowerCase())
                : ingredientsService.getAllIngredients({ limit: 100 }),
        staleTime: 5 * 60 * 1000, // 5 minutes - ingredients don't change often
        enabled: true,
    });
};

// Search ingredients
export const useIngredientSearch = (query: string) => {
    return useQuery({
        queryKey: ["ingredients", "search", query],
        queryFn: () => ingredientsService.searchIngredients(query),
        enabled: query.length >= 2, // Only search when query is 2+ chars
        staleTime: 60 * 1000, // 1 minute
    });
};

// Get all categories
export const useIngredientCategories = () => {
    return useQuery({
        queryKey: ["ingredients", "categories"],
        queryFn: () => ingredientsService.getCategories(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Get ingredient by ID
export const useIngredient = (id: string) => {
    return useQuery({
        queryKey: ["ingredients", id],
        queryFn: () => ingredientsService.getById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
};

import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { Ingredient } from "../pantry/types/pantry.types";

export class IngredientsService {
    // Get all ingredients with optional filters
    async getAllIngredients(params?: {
        category?: string;
        search?: string;
        limit?: number;
    }): Promise<Ingredient[]> {
        const queryString = new URLSearchParams();

        if (params?.category) queryString.append("category", params.category);
        if (params?.search) queryString.append("search", params.search);
        if (params?.limit) queryString.append("limit", params.limit.toString());

        const response = await apiClient.get(
            `${API_ENDPOINTS.INGREDIENTS.GET_ALL}?${queryString.toString()}`
        );
        return response.data.data;
    }

    // Get ingredients by category
    async getByCategory(category: string): Promise<Ingredient[]> {
        const response = await apiClient.get(
            API_ENDPOINTS.INGREDIENTS.BY_CATEGORY(category)
        );
        return response.data.data;
    }

    // Search ingredients
    async searchIngredients(query: string, limit: number = 20): Promise<Ingredient[]> {
        const response = await apiClient.get(
            `${API_ENDPOINTS.INGREDIENTS.SEARCH}?q=${encodeURIComponent(query)}&limit=${limit}`
        );
        return response.data.data;
    }

    // Get all categories
    async getCategories(): Promise<string[]> {
        const response = await apiClient.get(API_ENDPOINTS.INGREDIENTS.CATEGORIES);
        return response.data.data;
    }

    // Get ingredient by ID
    async getById(id: string): Promise<Ingredient> {
        const response = await apiClient.get(API_ENDPOINTS.INGREDIENTS.GET_BY_ID(id));
        return response.data.data;
    }
}

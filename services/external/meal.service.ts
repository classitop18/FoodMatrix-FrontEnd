import axios from 'axios';

export interface Meal {
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
    strCategory: string;
    strArea: string;
    strInstructions: string;
}

export interface MealResponse {
    meals: Meal[] | null;
}

export interface MealIngredient {
    idIngredient: string;
    strIngredient: string;
    strDescription: string;
    strType: string | null;
}

export interface IngredientResponse {
    meals: MealIngredient[] | null;
}

let cachedIngredients: MealIngredient[] | null = null;

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export const MealService = {
    searchMeals: async (query: string): Promise<Meal[]> => {
        if (!query || query.trim().length < 3) return [];

        try {
            const response = await axios.get<MealResponse>(`${BASE_URL}/search.php`, {
                params: { s: query }
            });
            return response.data.meals || [];
        } catch (error) {
            console.error("Error searching meals:", error);
            return [];
        }
    },

    getMealById: async (id: string): Promise<Meal | null> => {
        if (!id) return null;
        try {
            const response = await axios.get<MealResponse>(`${BASE_URL}/lookup.php`, {
                params: { i: id }
            });
            return response.data.meals ? response.data.meals[0] : null;
        } catch (error) {
            console.error("Error fetching meal by ID:", error);
            return null;
        }
    },

    searchIngredients: async (query: string): Promise<MealIngredient[]> => {
        if (!query) return [];

        // Fetch and cache ingredients if not already done
        if (!cachedIngredients) {
            try {
                const response = await axios.get<IngredientResponse>(`${BASE_URL}/list.php`, {
                    params: { i: 'list' }
                });
                cachedIngredients = response.data.meals || [];
            } catch (error) {
                console.error("Error fetching ingredients list:", error);
                return [];
            }
        }

        const lowerQuery = query.toLowerCase();
        return cachedIngredients.filter(ingredient =>
            ingredient.strIngredient.toLowerCase().includes(lowerQuery)
        ).slice(0, 20); // Limit results for performance
    },

    getIngredientImageUrl: (ingredientName: string): string => {
        return `https://www.themealdb.com/images/ingredients/${encodeURIComponent(ingredientName)}.png`;
    }
};

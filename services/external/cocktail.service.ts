import axios from 'axios';

export interface Cocktail {
    idDrink: string;
    strDrink: string;
    strDrinkThumb: string;
    strCategory: string;
    strAlcoholic: string;
    strGlass: string;
    strInstructions: string;
}

export interface CocktailResponse {
    drinks: Cocktail[] | null;
}

const BASE_URL = 'https://www.thecocktaildb.com/api/json/v1/1';

export const CocktailService = {
    searchCocktails: async (query: string): Promise<Cocktail[]> => {
        if (!query || query.trim().length < 3) return [];

        try {
            const response = await axios.get<CocktailResponse>(`${BASE_URL}/search.php`, {
                params: { s: query }
            });
            return response.data.drinks || [];
        } catch (error) {
            console.error("Error searching cocktails:", error);
            return [];
        }
    },

    getCocktailById: async (id: string): Promise<Cocktail | null> => {
        try {
            const response = await axios.get<CocktailResponse>(`${BASE_URL}/lookup.php`, {
                params: { i: id }
            });
            return response.data.drinks ? response.data.drinks[0] : null;
        } catch (error) {
            console.error("Error fetching cocktail details:", error);
            return null;
        }
    }
};

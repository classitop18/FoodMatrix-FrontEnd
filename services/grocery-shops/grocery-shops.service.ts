import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { GroceryShop, NearbyGroceryShopsPayload } from "./grocery-shops.types";

export class GroceryShopsService {
    async searchNearby(
        payload: NearbyGroceryShopsPayload,
    ): Promise<GroceryShop[]> {
        const response = await apiClient.post(
            API_ENDPOINTS.PLACES.NEARBY_GROCERY_SHOPS,
            payload,
        );
        return response.data?.data ?? [];
    }
}

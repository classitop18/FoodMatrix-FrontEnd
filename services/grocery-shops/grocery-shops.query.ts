import { useQuery } from "@tanstack/react-query";
import { GroceryShopsService } from "./grocery-shops.service";

const groceryShopsService = new GroceryShopsService();

export const useNearbyGroceryShops = (
    latitude: number | undefined | null,
    longitude: number | undefined | null,
    radius: number = 15000,
) => {
    return useQuery({
        queryKey: ["nearbyGroceryShops", latitude, longitude, radius],
        queryFn: () =>
            groceryShopsService.searchNearby({
                latitude: Number(latitude),
                longitude: Number(longitude),
                radius,
            }),
        enabled: !!latitude && !!longitude,
        staleTime: 1000 * 60 * 10, // 10 minutes - shops don't change often
        retry: 2,
    });
};

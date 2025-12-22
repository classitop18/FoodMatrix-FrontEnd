import { useQuery } from "@tanstack/react-query";
import { PantryService } from "./pantry.service";
import type { PantryQueryParams } from "./types/pantry.types";

const pantryService = new PantryService();

// Query for pantry items with pagination
export const usePantryQuery = (params: PantryQueryParams & { accountId?: string }) => {
    return useQuery({
        queryKey: ["pantry", params],
        queryFn: () => pantryService.getPantryItems(params),
        staleTime: 30 * 1000, // 30 seconds
        refetchOnWindowFocus: true,
        enabled: !!params.accountId, // Only run if accountId is present
    });
};

// Query for expiring items
export const useExpiringItemsQuery = (days: number = 7, accountId?: string) => {
    return useQuery({
        queryKey: ["pantry", "expiring", days, accountId],
        queryFn: () => pantryService.getExpiringItems(days, accountId),
        staleTime: 60 * 1000, // 1 minute
        enabled: !!accountId,
    });
};

// Query for pantry alerts
export const usePantryAlertsQuery = (accountId?: string) => {
    return useQuery({
        queryKey: ["pantry", "alerts", accountId],
        queryFn: () => pantryService.getAlerts(accountId),
        staleTime: 30 * 1000,
        refetchInterval: 60 * 1000, // Refetch every minute
        enabled: !!accountId,
    });
};

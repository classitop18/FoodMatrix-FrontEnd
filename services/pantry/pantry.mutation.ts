import { useMutation } from "@tanstack/react-query";
import { PantryService } from "./pantry.service";
import { queryClient } from "@/lib/react-query";
import type { AddPantryItemPayload } from "./types/pantry.types";

const pantryService = new PantryService();

// Add pantry item mutation
export const useAddPantryMutation = () => {
    return useMutation({
        mutationFn: (payload: AddPantryItemPayload & { accountId?: string }) =>
            pantryService.addPantryItem(payload),
        onSuccess: () => {
            // Invalidate pantry queries to refetch data
            queryClient.invalidateQueries({ queryKey: ["pantry"] });
        },
        onError: (error: any) => {
            console.error("Error adding pantry item:", error);
        },
    });
};

// Update pantry item mutation
export const useUpdatePantryMutation = () => {
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<AddPantryItemPayload> & { accountId?: string } }) =>
            pantryService.updatePantryItem(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pantry"] });
        },
        onError: (error: any) => {
            console.error("Error updating pantry item:", error);
        },
    });
};

// Delete pantry item mutation
export const useDeletePantryMutation = () => {
    return useMutation({
        mutationFn: ({ id, accountId }: { id: string; accountId?: string }) => pantryService.deletePantryItem(id, accountId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pantry"] });
        },
        onError: (error: any) => {
            console.error("Error deleting pantry item:", error);
        },
    });
};

// Dismiss alert mutation
export const useDismissAlertMutation = () => {
    return useMutation({
        mutationFn: (alertId: string) => pantryService.dismissAlert(alertId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pantry", "alerts"] });
        },
        onError: (error: any) => {
            console.error("Error dismissing alert:", error);
        },
    });
};

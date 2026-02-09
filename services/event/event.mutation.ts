import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { EventService } from "./event.service";
import { eventQueryKeys } from "./event.query";
import {
    CreateEventDto,
    UpdateEventDto,
    CreateEventMealDto,
    UpdateEventMealDto,
    AddRecipeToMealDto,
    GenerateMenuDto,
    LogMemberConsumptionDto,
    EventRecipeGenerationDto,
    CreateEventItemDto,
    UpdateEventItemDto,
} from "./event.types";

/**
 * Hook to create a new event
 */
export function useCreateEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateEventDto) => EventService.createEvent(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.lists() });
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.stats() });
            toast.success("Event created successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to create event");
        },
    });
}

/**
 * Hook to update an event
 */
export function useUpdateEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateEventDto }) =>
            EventService.updateEvent(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.lists() });
            toast.success("Event updated successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to update event");
        },
    });
}

/**
 * Hook to delete an event
 */
export function useDeleteEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => EventService.deleteEvent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.lists() });
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.stats() });
            toast.success("Event deleted successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to delete event");
        },
    });
}

/**
 * Hook to add a meal to an event
 */
export function useAddMealToEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventId, data }: { eventId: string; data: CreateEventMealDto }) =>
            EventService.addMealToEvent(eventId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.detail(variables.eventId) });
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.meals(variables.eventId) });
            toast.success("Meal added to event!");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to add meal");
        },
    });
}

/**
 * Hook to update an event meal
 */
export function useUpdateEventMeal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            eventId,
            mealId,
            data,
        }: {
            eventId: string;
            mealId: string;
            data: UpdateEventMealDto;
        }) => EventService.updateEventMeal(eventId, mealId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.detail(variables.eventId) });
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.meals(variables.eventId) });
            toast.success("Meal updated!");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to update meal");
        },
    });
}

/**
 * Hook to delete an event meal
 */
export function useDeleteEventMeal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventId, mealId }: { eventId: string; mealId: string }) =>
            EventService.deleteEventMeal(eventId, mealId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.detail(variables.eventId) });
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.meals(variables.eventId) });
            toast.success("Meal removed from event!");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to delete meal");
        },
    });
}

/**
 * Hook to add a recipe to a meal
 */
export function useAddRecipeToMeal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            eventId,
            mealId,
            data,
        }: {
            eventId: string;
            mealId: string;
            data: AddRecipeToMealDto;
        }) => EventService.addRecipeToMeal(eventId, mealId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.detail(variables.eventId) });
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.meals(variables.eventId) });
            toast.success("Recipe added to meal!");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to add recipe");
        },
    });
}

/**
 * Hook to remove a recipe from a meal
 */
export function useRemoveRecipeFromMeal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            eventId,
            mealId,
            recipeId,
        }: {
            eventId: string;
            mealId: string;
            recipeId: string;
        }) => EventService.removeRecipeFromMeal(eventId, mealId, recipeId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.detail(variables.eventId) });
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.meals(variables.eventId) });
            toast.success("Recipe removed from meal!");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to remove recipe");
        },
    });
}

/**
 * Hook to generate menu for an event
 */
export function useGenerateMenu() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventId, data }: { eventId: string; data: GenerateMenuDto }) =>
            EventService.generateMenu(eventId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.detail(variables.eventId) });
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.meals(variables.eventId) });
            toast.success("Menu generated successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to generate menu");
        },
    });
}

/**
 * Hook to generate shopping list
 */
export function useGenerateShoppingList() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (eventId: string) => EventService.generateShoppingList(eventId),
        onSuccess: (_, eventId) => {
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.detail(eventId) });
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.shoppingList(eventId) });
            toast.success("Shopping list generated!");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to generate shopping list");
        },
    });
}

/**
 * Hook to approve shopping list
 */
export function useApproveShoppingList() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (eventId: string) => EventService.approveShoppingList(eventId),
        onSuccess: (_, eventId) => {
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.detail(eventId) });
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.shoppingList(eventId) });
            toast.success("Shopping list approved!");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to approve shopping list");
        },
    });
}

/**
 * Hook to upload receipt
 */
export function useUploadReceipt() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventId, receiptUrl }: { eventId: string; receiptUrl: string }) =>
            EventService.uploadReceipt(eventId, receiptUrl),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.detail(variables.eventId) });
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.shoppingList(variables.eventId) });
            toast.success("Receipt uploaded!");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to upload receipt");
        },
    });
}

/**
 * Hook to complete an event
 */
export function useCompleteEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (eventId: string) => EventService.completeEvent(eventId),
        onSuccess: (_, eventId) => {
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.detail(eventId) });
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.lists() });
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.stats() });
            toast.success("Event marked as complete!");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to complete event");
        },
    });
}

/**
 * Hook to log member consumption
 */
export function useLogMemberConsumption() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventId, data }: { eventId: string; data: LogMemberConsumptionDto }) =>
            EventService.logMemberConsumption(eventId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.detail(variables.eventId) });
            toast.success("Consumption logged!");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to log consumption");
        },
    });
}

// ===== AI-Powered Features =====

/**
 * Hook to get AI-suggested budget allocation
 */
export function useSuggestBudget() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventId, mealTypes }: { eventId: string; mealTypes?: string[] }) =>
            EventService.suggestBudget(eventId, mealTypes),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.detail(variables.eventId) });
            toast.success("Budget allocation suggested by AI!");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to get budget suggestions");
        },
    });
}

/**
 * Hook to generate event recipes using AI
 */
export function useGenerateEventRecipes() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventId, data }: { eventId: string; data: EventRecipeGenerationDto }) =>
            EventService.generateEventRecipes(eventId, data),
        onSuccess: (recipes, variables) => {
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.detail(variables.eventId) });
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.meals(variables.eventId) });
            toast.success(`Generated ${recipes.length} recipe${recipes.length !== 1 ? 's' : ''} for your event!`);
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to generate event recipes");
        },
    });
}

// ===== Event Items (Add-ons) =====

export function useAddEventItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventId, data }: { eventId: string; data: CreateEventItemDto }) =>
            EventService.addEventItem(eventId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.detail(variables.eventId) });
            queryClient.invalidateQueries({ queryKey: ['event-items', variables.eventId] });
            toast.success("Item added successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to add item");
        },
    });
}

export function useGetEventItems(eventId: string) {
    return useQuery({
        queryKey: ['event-items', eventId],
        queryFn: () => EventService.getEventItems(eventId),
        enabled: !!eventId,
    });
}

export function useUpdateEventItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventId, itemId, data }: { eventId: string; itemId: string; data: UpdateEventItemDto }) =>
            EventService.updateEventItem(eventId, itemId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.detail(variables.eventId) });
            queryClient.invalidateQueries({ queryKey: ['event-items', variables.eventId] });
            toast.success("Item updated!");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to update item");
        },
    });
}

export function useDeleteEventItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventId, itemId }: { eventId: string; itemId: string }) =>
            EventService.deleteEventItem(eventId, itemId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.detail(variables.eventId) });
            queryClient.invalidateQueries({ queryKey: ['event-items', variables.eventId] });
            toast.success("Item removed!");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to remove item");
        },
    });
}

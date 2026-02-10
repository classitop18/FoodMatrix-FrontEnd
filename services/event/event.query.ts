import { useQuery } from "@tanstack/react-query";
import { EventService } from "./event.service";
import { GetEventsParams } from "./event.types";

// Query Keys
export const eventQueryKeys = {
    all: ["events"] as const,
    lists: () => [...eventQueryKeys.all, "list"] as const,
    list: (params: GetEventsParams) => [...eventQueryKeys.lists(), params] as const,
    details: () => [...eventQueryKeys.all, "detail"] as const,
    detail: (id: string) => [...eventQueryKeys.details(), id] as const,
    stats: () => [...eventQueryKeys.all, "stats"] as const,
    meals: (eventId: string) => [...eventQueryKeys.all, eventId, "meals"] as const,
    shoppingList: (eventId: string) => [...eventQueryKeys.all, eventId, "shopping-list"] as const,
    analytics: (eventId: string) => [...eventQueryKeys.all, eventId, "analytics"] as const,
};

/**
 * Hook to fetch paginated events
 */
export function useEvents(params: GetEventsParams = {}) {
    return useQuery({
        queryKey: eventQueryKeys.list(params),
        queryFn: () => EventService.getEvents(params),
        enabled: !!params.accountId,
    });
}

/**
 * Hook to fetch a single event by ID
 */
export function useEvent(id: string | undefined | null) {
    return useQuery({
        queryKey: eventQueryKeys.detail(id || ""),
        queryFn: () => EventService.getEventById(id!),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook to fetch event stats
 */
export function useEventStats() {
    return useQuery({
        queryKey: eventQueryKeys.stats(),
        queryFn: () => EventService.getEventStats(),
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Hook to fetch meals for an event
 */
export function useEventMeals(eventId: string | undefined | null) {
    return useQuery({
        queryKey: eventQueryKeys.meals(eventId || ""),
        queryFn: () => EventService.getEventMeals(eventId!),
        enabled: !!eventId,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Hook to fetch shopping list for an event
 */
export function useEventShoppingList(eventId: string | undefined | null) {
    return useQuery({
        queryKey: eventQueryKeys.shoppingList(eventId || ""),
        queryFn: () => EventService.getEventShoppingList(eventId!),
        enabled: !!eventId,
    });
}

/**
 * Hook to fetch analytics for an event
 */
export function useEventAnalytics(eventId: string | undefined | null) {
    return useQuery({
        queryKey: eventQueryKeys.analytics(eventId || ""),
        queryFn: () => EventService.getEventAnalytics(eventId!),
        enabled: !!eventId,
    });
}

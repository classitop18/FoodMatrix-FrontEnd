import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
    CreateEventDto,
    UpdateEventDto,
    CreateEventMealDto,
    UpdateEventMealDto,
    AddRecipeToMealDto,
    GenerateMenuDto,
    LogMemberConsumptionDto,
    EventResponse,
    EventMealResponse,
    EventShoppingListResponse,
    CostAnalysisResponse,
    EventStatsResponse,
    PaginatedEventsResponse,
    GetEventsParams,
    BudgetSuggestionResponse,
    EventRecipeGenerationDto,
    AIGeneratedEventRecipe,
    EventItemResponse,
    CreateEventItemDto,
    UpdateEventItemDto,
} from "./event.types";

export const EventService = {
    // ===== Event CRUD =====

    /**
     * Create a new event
     */
    createEvent: async (data: CreateEventDto): Promise<EventResponse> => {
        const response = await apiClient.post(
            API_ENDPOINTS.EVENT.CREATE,
            data
        );
        return response.data.data;
    },

    /**
     * Get event by ID
     */
    getEventById: async (id: string): Promise<EventResponse> => {
        const response = await apiClient.get(
            API_ENDPOINTS.EVENT.GET_BY_ID(id)
        );
        return response.data.data;
    },

    /**
     * Update an event
     */
    updateEvent: async (id: string, data: UpdateEventDto): Promise<EventResponse> => {
        const response = await apiClient.put(
            API_ENDPOINTS.EVENT.UPDATE(id),
            data
        );
        return response.data.data;
    },

    /**
     * Delete an event
     */
    deleteEvent: async (id: string): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.EVENT.DELETE(id));
    },

    /**
     * Get events with pagination and filters
     */
    getEvents: async (params: GetEventsParams = {}): Promise<PaginatedEventsResponse> => {
        const queryParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, String(value));
            }
        });

        const response = await apiClient.get(
            `${API_ENDPOINTS.EVENT.GET_ALL}?${queryParams.toString()}`
        );
        return response.data.data;
    },

    /**
     * Get event stats for account
     */
    getEventStats: async (): Promise<EventStatsResponse> => {
        const response = await apiClient.get(
            API_ENDPOINTS.EVENT.GET_STATS
        );
        return response.data.data;
    },

    // ===== AI-Powered Features =====

    /**
     * Get AI-suggested budget allocation for event meals
     */
    suggestBudget: async (eventId: string, mealTypes?: string[]): Promise<BudgetSuggestionResponse> => {
        const response = await apiClient.post(
            API_ENDPOINTS.EVENT.SUGGEST_BUDGET(eventId),
            { mealTypes }
        );
        return response.data.data;
    },

    /**
     * Generate recipes for an event meal using AI
     */
    generateEventRecipes: async (
        eventId: string,
        data: EventRecipeGenerationDto
    ): Promise<AIGeneratedEventRecipe[]> => {
        const response = await apiClient.post(
            API_ENDPOINTS.EVENT.GENERATE_RECIPES(eventId),
            data
        );
        return response.data.data;
    },

    // ===== Event Meals =====

    /**
     * Add a meal to an event
     */
    addMealToEvent: async (eventId: string, data: CreateEventMealDto): Promise<EventMealResponse> => {
        const response = await apiClient.post(
            API_ENDPOINTS.EVENT.ADD_MEAL(eventId),
            data
        );
        return response.data.data;
    },

    /**
     * Get meals for an event
     */
    getEventMeals: async (eventId: string): Promise<EventMealResponse[]> => {
        const response = await apiClient.get(
            API_ENDPOINTS.EVENT.GET_MEALS(eventId)
        );
        return response.data.data;
    },

    /**
     * Update an event meal
     */
    updateEventMeal: async (
        eventId: string,
        mealId: string,
        data: UpdateEventMealDto
    ): Promise<EventMealResponse> => {
        const response = await apiClient.put(
            API_ENDPOINTS.EVENT.UPDATE_MEAL(eventId, mealId),
            data
        );
        return response.data.data;
    },

    /**
     * Delete an event meal
     */
    deleteEventMeal: async (eventId: string, mealId: string): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.EVENT.DELETE_MEAL(eventId, mealId));
    },

    // ===== Event Recipes =====

    /**
     * Add a recipe to a meal
     */
    addRecipeToMeal: async (
        eventId: string,
        mealId: string,
        data: AddRecipeToMealDto
    ): Promise<any> => {
        const response = await apiClient.post(
            API_ENDPOINTS.EVENT.ADD_RECIPE(eventId, mealId),
            data
        );
        return response.data.data;
    },

    /**
     * Remove a recipe from a meal
     */
    removeRecipeFromMeal: async (
        eventId: string,
        mealId: string,
        recipeId: string
    ): Promise<void> => {
        await apiClient.delete(
            API_ENDPOINTS.EVENT.REMOVE_RECIPE(eventId, mealId, recipeId)
        );
    },

    // ===== Menu Generation =====

    /**
     * Generate menu for an event
     */
    generateMenu: async (
        eventId: string,
        data: GenerateMenuDto
    ): Promise<EventMealResponse[]> => {
        const response = await apiClient.post(
            API_ENDPOINTS.EVENT.GENERATE_MENU(eventId),
            data
        );
        return response.data.data;
    },

    // ===== Shopping List =====

    /**
     * Generate shopping list for an event
     */
    generateShoppingList: async (eventId: string): Promise<EventShoppingListResponse> => {
        const response = await apiClient.post(
            API_ENDPOINTS.EVENT.GENERATE_SHOPPING_LIST(eventId)
        );
        return response.data.data;
    },

    /**
     * Get shopping list for an event
     */
    getEventShoppingList: async (eventId: string): Promise<EventShoppingListResponse | null> => {
        try {
            const response = await apiClient.get(
                API_ENDPOINTS.EVENT.GET_SHOPPING_LIST(eventId)
            );
            return response.data.data;
        } catch (error) {
            return null;
        }
    },

    /**
     * Approve shopping list
     */
    approveShoppingList: async (eventId: string): Promise<EventShoppingListResponse> => {
        const response = await apiClient.post(
            API_ENDPOINTS.EVENT.APPROVE_SHOPPING_LIST(eventId)
        );
        return response.data.data;
    },

    /**
     * Upload receipt
     */
    uploadReceipt: async (eventId: string, receiptUrl: string): Promise<EventShoppingListResponse> => {
        const response = await apiClient.post(
            API_ENDPOINTS.EVENT.UPLOAD_RECEIPT(eventId),
            { receiptUrl }
        );
        return response.data.data;
    },

    // ===== Event Completion =====

    /**
     * Mark event as complete
     */
    completeEvent: async (eventId: string): Promise<EventResponse> => {
        const response = await apiClient.post(
            API_ENDPOINTS.EVENT.COMPLETE(eventId)
        );
        return response.data.data;
    },

    /**
     * Log member consumption
     */
    logMemberConsumption: async (
        eventId: string,
        data: LogMemberConsumptionDto
    ): Promise<void> => {
        await apiClient.post(
            API_ENDPOINTS.EVENT.LOG_CONSUMPTION(eventId),
            data
        );
    },

    // ===== Analytics =====

    /**
     * Get event analytics
     */
    getEventAnalytics: async (eventId: string): Promise<CostAnalysisResponse> => {
        const response = await apiClient.get(
            API_ENDPOINTS.EVENT.GET_ANALYTICS(eventId)
        );
        return response.data.data;
    },

    // ===== Event Items (Add-ons) =====

    addEventItem: async (eventId: string, data: CreateEventItemDto): Promise<EventItemResponse> => {
        const response = await apiClient.post(
            API_ENDPOINTS.EVENT.ADD_ITEM(eventId),
            data
        );
        return response.data.data;
    },

    getEventItems: async (eventId: string): Promise<EventItemResponse[]> => {
        const response = await apiClient.get(
            API_ENDPOINTS.EVENT.GET_ITEMS(eventId)
        );
        return response.data.data;
    },

    updateEventItem: async (eventId: string, itemId: string, data: UpdateEventItemDto): Promise<EventItemResponse> => {
        const response = await apiClient.put(
            API_ENDPOINTS.EVENT.UPDATE_ITEM(eventId, itemId),
            data
        );
        return response.data.data;
    },

    deleteEventItem: async (eventId: string, itemId: string): Promise<void> => {
        await apiClient.delete(
            API_ENDPOINTS.EVENT.DELETE_ITEM(eventId, itemId)
        );
    },
};

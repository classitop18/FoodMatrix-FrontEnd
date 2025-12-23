import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  PantryResponse,
  PantryQueryParams,
  AddPantryItemPayload,
  PantryAlert,
  PantryItem,
} from "./types/pantry.types";

export class PantryService {
  // Get pantry items with pagination and filters
  async getPantryItems(
    params: PantryQueryParams & { accountId?: string },
  ): Promise<PantryResponse> {
    const queryString = new URLSearchParams();

    if (params.page) queryString.append("page", params.page.toString());
    if (params.limit) queryString.append("limit", params.limit.toString());
    if (params.search) queryString.append("search", params.search);
    if (params.location) queryString.append("location", params.location);
    if (params.sortBy) queryString.append("sortBy", params.sortBy);
    if (params.sortOrder) queryString.append("sortOrder", params.sortOrder);

    const config = params.accountId
      ? { headers: { "x-account-id": params.accountId } }
      : {};

    const response = await apiClient.get(
      `${API_ENDPOINTS.PANTRY.GET_ITEMS}?${queryString.toString()}`,
      config,
    );
    return response.data.data;
  }

  // Get items expiring soon
  async getExpiringItems(
    days: number = 7,
    accountId?: string,
  ): Promise<PantryItem[]> {
    const config = accountId ? { headers: { "x-account-id": accountId } } : {};
    const response = await apiClient.get(
      `${API_ENDPOINTS.PANTRY.GET_EXPIRING}?days=${days}`,
      config,
    );
    return response.data.data;
  }

  // Get pantry alerts
  async getAlerts(accountId?: string): Promise<PantryAlert[]> {
    const config = accountId ? { headers: { "x-account-id": accountId } } : {};
    const response = await apiClient.get(
      API_ENDPOINTS.PANTRY.GET_ALERTS,
      config,
    );
    return response.data.data;
  }

  // Add new pantry item
  async addPantryItem(
    payload: AddPantryItemPayload & { accountId?: string },
  ): Promise<PantryItem> {
    const { accountId, ...data } = payload;
    const config = accountId ? { headers: { "x-account-id": accountId } } : {};
    const response = await apiClient.post(
      API_ENDPOINTS.PANTRY.ADD_ITEM,
      data,
      config,
    );
    return response.data.data;
  }

  // Update pantry item
  async updatePantryItem(
    id: string,
    payload: Partial<AddPantryItemPayload> & { accountId?: string },
  ): Promise<PantryItem> {
    const { accountId, ...data } = payload;
    const config = accountId ? { headers: { "x-account-id": accountId } } : {};
    const response = await apiClient.put(
      API_ENDPOINTS.PANTRY.UPDATE_ITEM(id),
      data,
      config,
    );
    return response.data.data;
  }

  // Delete pantry item
  async deletePantryItem(
    id: string,
    accountId?: string,
  ): Promise<{ success: boolean }> {
    const config = accountId ? { headers: { "x-account-id": accountId } } : {};
    const response = await apiClient.delete(
      API_ENDPOINTS.PANTRY.DELETE_ITEM(id),
      config,
    );
    return response.data.data;
  }

  // Dismiss alert
  async dismissAlert(alertId: string): Promise<{ success: boolean }> {
    const response = await apiClient.put(
      API_ENDPOINTS.PANTRY.DISMISS_ALERT(alertId),
    );
    return response.data.data;
  }
}

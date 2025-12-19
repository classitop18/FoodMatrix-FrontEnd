import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export class HealProfileService {
  async getMemberHealthProfile(id: string) {
    const response = await apiClient.get(
      API_ENDPOINTS.HEALTH_PROFILE.GET_MEMBER_HEALTH_PROFILE(id),
    );
    return response?.data;
  }

  async updateHealthProfile(id: string, data: any) {
    const response = await apiClient.put(
      API_ENDPOINTS.HEALTH_PROFILE.UPDATE_HEALTH_PROFILE(id),
      data,
    );
    return response?.data;
  }
}

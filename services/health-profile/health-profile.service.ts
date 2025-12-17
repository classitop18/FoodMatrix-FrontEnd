import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";






export class HealProfileService {


    async getMemberHealthProfile(id: string) {
        const response = await apiClient.get(API_ENDPOINTS.HEALTH_PROFILE.GET_MEMBER_HEALTH_PROFILE(id));
        return response?.data;
    }


}
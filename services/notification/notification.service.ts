import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export class NotificationService {
    async registerToken(token: string, device: string) {
        const response = await apiClient.post(
            API_ENDPOINTS.NOTIFICATION.REGISTER_TOKEN,
            { token, device }
        );
        return response?.data;
    }

    async unregisterToken(token: string) {
        const response = await apiClient.post(
            API_ENDPOINTS.NOTIFICATION.UNREGISTER_TOKEN,
            { token }
        );
        return response?.data;
    }

    async getHistory(page = 1, limit = 20) {
        const response = await apiClient.get(API_ENDPOINTS.NOTIFICATION.HISTORY, {
            params: { page, limit },
        });
        return response?.data;
    }

    async getUnreadCount() {
        const response = await apiClient.get(
            API_ENDPOINTS.NOTIFICATION.UNREAD_COUNT
        );
        return response?.data;
    }

    async markAsRead(id: string) {
        const response = await apiClient.patch(
            API_ENDPOINTS.NOTIFICATION.MARK_READ(id)
        );
        return response?.data;
    }

    async markAllAsRead() {
        const response = await apiClient.patch(
            API_ENDPOINTS.NOTIFICATION.MARK_ALL_READ
        );
        return response?.data;
    }
}

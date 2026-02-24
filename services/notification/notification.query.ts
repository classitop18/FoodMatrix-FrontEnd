import { useQuery } from "@tanstack/react-query";
import { NotificationService } from "./notification.service";

const notificationService = new NotificationService();

export const useNotificationHistory = (
    page = 1,
    limit = 20,
    options?: { enabled?: boolean }
) => {
    return useQuery({
        queryKey: ["notifications", "history", page, limit],
        queryFn: () => notificationService.getHistory(page, limit),
        staleTime: 1000 * 60 * 2, // 2 minutes
        enabled: options?.enabled,
    });
};

export const useUnreadCount = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ["notifications", "unreadCount"],
        queryFn: () => notificationService.getUnreadCount(),
        staleTime: 1000 * 30, // 30 seconds — keep badge fresh
        refetchInterval: 1000 * 60, // poll every 60s
        enabled: options?.enabled,
    });
};

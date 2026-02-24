import { useMutation } from "@tanstack/react-query";
import { NotificationService } from "./notification.service";
import { queryClient } from "@/lib/react-query";

const notificationService = new NotificationService();

export const useRegisterFCMToken = () => {
    return useMutation({
        mutationFn: ({ token, device }: { token: string; device: string }) =>
            notificationService.registerToken(token, device),
        onError: (error: any) => {
            console.error("Error registering FCM token:", error);
        },
    });
};

export const useMarkAsRead = () => {
    return useMutation({
        mutationFn: (id: string) => notificationService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
        onError: (error: any) => {
            console.error("Error marking notification as read:", error);
        },
    });
};

export const useMarkAllAsRead = () => {
    return useMutation({
        mutationFn: () => notificationService.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
        onError: (error: any) => {
            console.error("Error marking all notifications as read:", error);
        },
    });
};

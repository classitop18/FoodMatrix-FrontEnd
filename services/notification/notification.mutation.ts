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
        onMutate: async (id: string) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["notifications"] });

            // Snapshot previous value
            const previousHistory = queryClient.getQueryData(["notifications", "history"]);
            const previousUnread = queryClient.getQueryData(["notifications", "unreadCount"]);

            // Optimistically update cache
            queryClient.setQueriesData(
                { queryKey: ["notifications", "history"] },
                (old: any) => {
                    if (!old?.data) return old;
                    return {
                        ...old,
                        data: old.data.map((n: any) =>
                            n.id === id ? { ...n, isRead: true } : n
                        ),
                        unreadCount: Math.max(0, (old.unreadCount ?? 1) - 1),
                    };
                }
            );

            queryClient.setQueryData(
                ["notifications", "unreadCount"],
                (old: any) => ({
                    ...old,
                    unreadCount: Math.max(0, (old?.unreadCount ?? 1) - 1),
                })
            );

            return { previousHistory, previousUnread };
        },
        onError: (_error, _id, context) => {
            // Rollback on failure
            if (context?.previousHistory) {
                queryClient.setQueriesData(
                    { queryKey: ["notifications", "history"] },
                    context.previousHistory
                );
            }
            if (context?.previousUnread) {
                queryClient.setQueryData(
                    ["notifications", "unreadCount"],
                    context.previousUnread
                );
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};

export const useMarkAllAsRead = () => {
    return useMutation({
        mutationFn: () => notificationService.markAllAsRead(),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["notifications"] });

            const previousHistory = queryClient.getQueryData(["notifications", "history"]);
            const previousUnread = queryClient.getQueryData(["notifications", "unreadCount"]);

            queryClient.setQueriesData(
                { queryKey: ["notifications", "history"] },
                (old: any) => {
                    if (!old?.data) return old;
                    return {
                        ...old,
                        data: old.data.map((n: any) => ({ ...n, isRead: true })),
                        unreadCount: 0,
                    };
                }
            );

            queryClient.setQueryData(
                ["notifications", "unreadCount"],
                (old: any) => ({ ...old, unreadCount: 0 })
            );

            return { previousHistory, previousUnread };
        },
        onError: (_error, _vars, context) => {
            if (context?.previousHistory) {
                queryClient.setQueriesData(
                    { queryKey: ["notifications", "history"] },
                    context.previousHistory
                );
            }
            if (context?.previousUnread) {
                queryClient.setQueryData(
                    ["notifications", "unreadCount"],
                    context.previousUnread
                );
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};

export const useClearAllNotifications = () => {
    return useMutation({
        mutationFn: () => notificationService.clearAllNotifications(),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["notifications"] });

            const previousHistory = queryClient.getQueryData(["notifications", "history"]);
            const previousUnread = queryClient.getQueryData(["notifications", "unreadCount"]);

            queryClient.setQueriesData(
                { queryKey: ["notifications", "history"] },
                (old: any) => {
                    if (!old?.data) return old;
                    return {
                        ...old,
                        data: [],
                        unreadCount: 0,
                    };
                }
            );

            queryClient.setQueryData(
                ["notifications", "unreadCount"],
                (old: any) => ({ ...old, unreadCount: 0 })
            );

            return { previousHistory, previousUnread };
        },
        onError: (_error, _vars, context) => {
            if (context?.previousHistory) {
                queryClient.setQueriesData(
                    { queryKey: ["notifications", "history"] },
                    context.previousHistory
                );
            }
            if (context?.previousUnread) {
                queryClient.setQueryData(
                    ["notifications", "unreadCount"],
                    context.previousUnread
                );
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};

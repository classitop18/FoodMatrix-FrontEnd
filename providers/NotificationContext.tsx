"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
    ReactNode,
} from "react";
import { NotificationService } from "../services/notification/notification.service";

const notificationService = new NotificationService();

export type AppNotification = {
    id: string;
    title: string;
    body: string;
    type?: string;
    data?: any;
    isRead: boolean;
    sentAt: string;
};

interface NotificationContextType {
    notifications: AppNotification[];
    unreadCount: number;
    toasts: AppNotification[];
    addNotification: (notification: AppNotification, showToast?: boolean) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeToast: (id: string) => void;
    refreshNotifications: () => Promise<void>;
    isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined
);

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (!context)
        throw new Error(
            "useNotificationContext must be used within NotificationProvider"
        );
    return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [toasts, setToasts] = useState<AppNotification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const toastTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

    // ─── Fetch notifications from server ───────────────────────────
    const fetchNotifications = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await notificationService.getHistory(1, 50);
            if (data) {
                setNotifications(data.data || []);
                setUnreadCount(data.unreadCount ?? 0);
            }
        } catch {
            // Silently fail — user may not be authenticated yet
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Poll for unread count every 30s — also refetch list if count changes
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const data = await notificationService.getUnreadCount();
                if (data) {
                    const newCount = data.unreadCount ?? 0;
                    setUnreadCount((prev) => {
                        // If unread count increased, refetch full list
                        if (newCount !== prev) {
                            fetchNotifications();
                        }
                        return newCount;
                    });
                }
            } catch {
                /* silent */
            }
        }, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // ─── Toast management ──────────────────────────────────────────
    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        const timer = toastTimers.current.get(id);
        if (timer) {
            clearTimeout(timer);
            toastTimers.current.delete(id);
        }
    }, []);

    const addToast = useCallback(
        (notification: AppNotification) => {
            setToasts((prev) => {
                // Limit to max 5 stacked toasts
                const next = [notification, ...prev];
                if (next.length > 5) {
                    const removed = next.pop();
                    if (removed) {
                        const timer = toastTimers.current.get(removed.id);
                        if (timer) {
                            clearTimeout(timer);
                            toastTimers.current.delete(removed.id);
                        }
                    }
                }
                return next;
            });

            // Auto-dismiss after 5 seconds
            const timer = setTimeout(() => {
                removeToast(notification.id);
            }, 5000);
            toastTimers.current.set(notification.id, timer);
        },
        [removeToast]
    );

    // Cleanup all toast timers on unmount
    useEffect(() => {
        const timers = toastTimers.current;
        return () => {
            timers.forEach((timer) => clearTimeout(timer));
            timers.clear();
        };
    }, []);

    // ─── Add notification (from FCM foreground) ────────────────────
    const addNotification = useCallback(
        (notification: AppNotification, showToast = false) => {
            setNotifications((prev) => {
                // Prevent duplicates
                if (prev.some((n) => n.id === notification.id)) return prev;
                return [notification, ...prev];
            });
            setUnreadCount((prev) => prev + 1);
            if (showToast) {
                addToast(notification);
            }
        },
        [addToast]
    );

    // ─── Optimistic mark as read ───────────────────────────────────
    const markAsRead = useCallback((id: string) => {
        // 1. Snapshot for rollback
        let previousNotifications: AppNotification[] = [];
        let previousUnreadCount = 0;

        setNotifications((prev) => {
            previousNotifications = prev;
            return prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
        });

        setUnreadCount((prev) => {
            previousUnreadCount = prev;
            return Math.max(0, prev - 1);
        });

        // 2. Fire API in background
        notificationService.markAsRead(id).catch((err) => {
            console.error("Failed to mark notification as read, rolling back:", err);
            // Rollback on failure
            setNotifications(previousNotifications);
            setUnreadCount(previousUnreadCount);
        });
    }, []);

    // ─── Optimistic mark all as read ───────────────────────────────
    const markAllAsRead = useCallback(() => {
        // 1. Snapshot
        let previousNotifications: AppNotification[] = [];
        let previousUnreadCount = 0;

        setNotifications((prev) => {
            previousNotifications = prev;
            return prev.map((n) => ({ ...n, isRead: true }));
        });

        setUnreadCount((prev) => {
            previousUnreadCount = prev;
            return 0;
        });

        // 2. Fire API in background
        notificationService.markAllAsRead().catch((err) => {
            console.error(
                "Failed to mark all notifications as read, rolling back:",
                err
            );
            setNotifications(previousNotifications);
            setUnreadCount(previousUnreadCount);
        });
    }, []);

    // ─── Refresh ───────────────────────────────────────────────────
    const refreshNotifications = useCallback(async () => {
        await fetchNotifications();
    }, [fetchNotifications]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                toasts,
                addNotification,
                markAsRead,
                markAllAsRead,
                removeToast,
                refreshNotifications,
                isLoading,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

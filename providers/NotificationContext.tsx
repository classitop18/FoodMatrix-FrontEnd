"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { NotificationService } from "../services/notification/notification.service";

const notificationService = new NotificationService();

type AppNotification = {
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
    activeToast: AppNotification | null;
    addNotification: (notification: AppNotification, showToast?: boolean) => void;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    dismissToast: () => void;
    refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotificationContext must be used within NotificationProvider");
    return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const data = await notificationService.getHistory(1, 50);
            if (data) {
                setNotifications(data.data || []);
                setUnreadCount(data.unreadCount ?? 0);
            }
        } catch (err) {
            // Silently fail — user may not be authenticated yet
        }
    }, []);

    // Initial Fetch
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Poll for unread count every 60s
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const data = await notificationService.getUnreadCount();
                if (data) {
                    setUnreadCount(data.unreadCount ?? 0);
                }
            } catch { }
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const addNotification = useCallback((notification: AppNotification, showToast = false) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        if (showToast) {
            setActiveToast(notification);
            setTimeout(() => setActiveToast(null), 5000);
        }
    }, []);

    const dismissToast = useCallback(() => setActiveToast(null), []);

    const markAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications((p) => p.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount((p) => Math.max(0, p - 1));
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications((p) => p.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all notifications as read:", err);
        }
    };

    const refreshNotifications = useCallback(async () => {
        await fetchNotifications();
    }, [fetchNotifications]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            activeToast,
            addNotification,
            markAsRead,
            markAllAsRead,
            dismissToast,
            refreshNotifications,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

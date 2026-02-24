"use client";

import { useState, useEffect, useCallback } from "react";
import { requestPermissionAndGetToken, onForegroundMessage } from "../firebase/messaging";
import { useNotificationContext } from "../providers/NotificationContext";
import { NotificationService } from "../services/notification/notification.service";

const notificationService = new NotificationService();

export const useFCM = () => {
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const { addNotification } = useNotificationContext();

    const syncTokenToBackend = useCallback(async (token: string) => {
        try {
            await notificationService.registerToken(token, navigator.userAgent);
        } catch (err) {
            console.error("Failed to sync FCM token to backend:", err);
        }
    }, []);

    useEffect(() => {
        if (typeof window === "undefined" || !("Notification" in window)) return;
        setPermission(Notification.permission);

        let unsubscribe: (() => void) | null = null;

        const setupFCM = async () => {
            try {
                if ("serviceWorker" in navigator) {
                    await navigator.serviceWorker.register("/firebase-messaging-sw.js");
                }

                // Only automatically request token if permission is already granted
                if (Notification.permission !== "granted") return;

                const token = await requestPermissionAndGetToken();
                if (token) {
                    setFcmToken(token);

                    // Sync token to backend
                    await syncTokenToBackend(token);

                    unsubscribe = onForegroundMessage((payload) => {
                        if (!payload.notification) return;
                        const { title = "", body = "" } = payload.notification;
                        const newNotif = {
                            id: Date.now().toString(),
                            title,
                            body,
                            data: payload.data,
                            isRead: false,
                            sentAt: new Date().toISOString()
                        };

                        addNotification(newNotif, true);
                    });
                }
            } catch (error) {
                console.error("FCM Setup Error:", error);
            }
        };

        setupFCM();

        return () => { if (unsubscribe) unsubscribe(); };
    }, [addNotification, syncTokenToBackend]);

    const requestPermission = async () => {
        const token = await requestPermissionAndGetToken();
        if (token) {
            setFcmToken(token);
            setPermission("granted");
            await syncTokenToBackend(token);
        } else {
            setPermission(Notification.permission);
        }
    };

    return { permission, requestPermission, fcmToken };
};

import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
import app from "./firebase";

let messaging: Messaging | null = null;

// Gracefully handle SSR or environments lacking Notification spec
if (typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator) {
    try {
        messaging = getMessaging(app);
    } catch (err) {
        console.error("Failed to initialize Firebase Messaging:", err);
    }
}

export const requestPermissionAndGetToken = async (): Promise<string | null> => {
    if (!messaging) return null;

    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
            if (!vapidKey) {
                console.warn("VAPID Key not found in environment variables.");
                return null;
            }
            const currentToken = await getToken(messaging, { vapidKey });
            if (currentToken) return currentToken;
            console.warn('Silent token creation aborted.');
            return null;
        }
        return null; // Denied by user
    } catch (err) {
        console.error('Retrieval Token Runtime Error: ', err);
        return null;
    }
};

export const onForegroundMessage = (callback: (payload: any) => void) => {
    if (!messaging) return () => { };
    return onMessage(messaging, (payload) => callback(payload));
};
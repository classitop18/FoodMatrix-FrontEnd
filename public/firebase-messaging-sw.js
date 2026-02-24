// Firebase Messaging Service Worker
// Fetches config dynamically from /api/firebase-config since service workers
// cannot access process.env or NEXT_PUBLIC_* variables directly.

importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

let messagingInitialized = false;

self.addEventListener('install', (event) => {
    event.waitUntil(
        fetch('/api/firebase-config')
            .then((res) => res.json())
            .then((config) => {
                if (!config.apiKey || !config.projectId) {
                    console.warn('Firebase config missing required fields, messaging will be disabled.');
                    return;
                }
                try {
                    firebase.initializeApp(config);
                    const messaging = firebase.messaging();

                    messaging.onBackgroundMessage((payload) => {
                        const notificationOptions = {
                            body: payload.notification?.body || 'Pending details.',
                            icon: '/favicon.ico',
                            data: payload.data || {},
                            image: payload.notification?.image || null,
                            actions: [
                                { action: 'open', title: 'Open View' },
                                { action: 'close', title: 'Dismiss' }
                            ]
                        };

                        self.registration.showNotification(
                            payload.notification?.title || 'System Alert',
                            notificationOptions
                        );
                    });

                    messagingInitialized = true;
                } catch (e) {
                    console.error("Firebase SW Init Error:", e);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch Firebase config:", err);
            })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.action === 'close') return;

    const urlToOpen = event.notification.data?.url || '/notifications';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (const client of windowClients) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow(urlToOpen);
        })
    );
});

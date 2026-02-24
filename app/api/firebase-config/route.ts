import { NextResponse } from "next/server";

/**
 * Public API route to expose Firebase config to the service worker.
 * Service workers can't access process.env/NEXT_PUBLIC_* vars directly,
 * so they fetch this endpoint on install.
 */
export async function GET() {
    return NextResponse.json({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    });
}

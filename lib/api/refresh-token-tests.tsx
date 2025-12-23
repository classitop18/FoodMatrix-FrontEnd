/**
 * Refresh Token Testing Guide
 * 
 * This file demonstrates how to test the refresh token functionality
 */

import React from "react";
import { apiClient } from "@/lib/api";

// ============================================
// TEST 1: Automatic Token Refresh
// ============================================
export async function testAutomaticRefresh() {
    console.log("🧪 Test 1: Automatic Token Refresh");

    try {
        // Make any API call - if token is expired, it will auto-refresh
        const response = await apiClient.get("/users/me");
        console.log("✅ Request successful:", response.data);
        // Toast will show: "Session refreshed successfully" (if token was expired)
    } catch (error) {
        console.error("❌ Request failed:", error);
        // Toast will show appropriate error message
    }
}

// ============================================
// TEST 2: Manual Token Refresh
// ============================================
export async function testManualRefresh() {
    console.log("🧪 Test 2: Manual Token Refresh");

    try {
        const newToken = await apiClient.manualRefreshToken();
        console.log("✅ Token refreshed manually:", newToken);
        // Toast: "Session refreshed successfully"
    } catch (error) {
        console.error("❌ Manual refresh failed:", error);
        // Toast: Error message + redirect to login
    }
}

// ============================================
// TEST 3: Multiple Concurrent Requests
// ============================================
export async function testConcurrentRequests() {
    console.log("🧪 Test 3: Multiple Concurrent Requests");

    try {
        // Make multiple requests simultaneously
        const promises = [
            apiClient.get("/users/me"),
            apiClient.get("/accounts"),
            apiClient.get("/members"),
            apiClient.get("/invitations"),
            apiClient.get("/health-profile"),
        ];

        const results = await Promise.all(promises);
        console.log("✅ All requests successful:", results.length);
        // Only one toast: "Session refreshed successfully"
    } catch (error) {
        console.error("❌ Some requests failed:", error);
    }
}

// ============================================
// TEST 4: Simulate Token Expiration
// ============================================
export async function testTokenExpiration() {
    console.log("🧪 Test 4: Simulate Token Expiration");

    // Manually expire the token by removing it
    if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
    }

    try {
        const response = await apiClient.get("/users/me");
        console.log("✅ Request successful after token refresh:", response.data);
    } catch (error) {
        console.error("❌ Request failed:", error);
    }
}

// ============================================
// TEST 5: Silent Refresh (No Toast)
// ============================================
export async function testSilentRefresh() {
    console.log("🧪 Test 5: Silent Refresh");

    try {
        const response = await apiClient.get("/users/me", {
            _silentRefresh: true,
        } as any);
        console.log("✅ Silent refresh successful:", response.data);
        // No success toast shown
    } catch (error) {
        console.error("❌ Silent refresh failed:", error);
        // Error toast still shown
    }
}

// ============================================
// TEST 6: Session Expiration Handling
// ============================================
export async function testSessionExpiration() {
    console.log("🧪 Test 6: Session Expiration");

    // This test requires the refresh token to be expired
    // Normally happens after 7 days of inactivity

    try {
        const response = await apiClient.get("/users/me");
        console.log("✅ Request successful:", response.data);
    } catch (error) {
        console.error("❌ Session expired:", error);
        // Toast: "Your session has expired. Please login again."
        // Redirects to /login after 1 second
    }
}

// ============================================
// USAGE IN COMPONENTS
// ============================================

/**
 * Example 1: In a React component
 */
export function ExampleComponent() {
    const fetchUserData = async () => {
        try {
            const response = await apiClient.get("/users/me");
            // Handle success
            console.log(response.data);
        } catch (error) {
            // Error already handled by interceptor
            // Toast already shown to user
            console.error(error);
        }
    };

    return (
        <button onClick={fetchUserData} >
            Fetch User Data
        </button>
    );
}

/**
 * Example 2: In a React Query hook
 */
export function useUserData() {
    return {
        queryKey: ["user"],
        queryFn: async () => {
            const response = await apiClient.get("/users/me");
            return response.data;
        },
        // Token refresh happens automatically
        // No need for special error handling
    };
}

/**
 * Example 3: Manual refresh button
 */
export function RefreshTokenButton() {
    const [loading, setLoading] = React.useState(false);

    const handleRefresh = async () => {
        setLoading(true);
        try {
            await apiClient.manualRefreshToken();
            // Toast: "Session refreshed successfully"
        } catch (error) {
            // Toast: Error message
        } finally {
            setLoading(false);
        }
    };

    return (
        <button onClick={handleRefresh} disabled={loading} >
            {loading ? "Refreshing..." : "Refresh Session"}
        </button>
    );
}

// ============================================
// EXPECTED TOAST MESSAGES
// ============================================

/**
 * Success Scenarios:
 * - "Session refreshed successfully" (2s duration)
 * 
 * Error Scenarios:
 * - "Session expired. Please login again." (4s duration)
 * - "Your session has expired. Please login again." (4s duration)
 * - "Invalid session. Please login again." (4s duration)
 * - "Failed to refresh session. Please login again." (4s duration)
 * 
 * Logout Scenario:
 * - "You have been logged out. Redirecting to login..." (3s duration)
 *   → Redirects to /login after 1 second
 */

// ============================================
// DEBUGGING TIPS
// ============================================

/**
 * 1. Check if refresh token cookie exists:
 *    - Open DevTools → Application → Cookies
 *    - Look for "refreshToken" cookie
 * 
 * 2. Check access token in localStorage:
 *    - Open DevTools → Application → Local Storage
 *    - Look for "accessToken" key
 * 
 * 3. Monitor network requests:
 *    - Open DevTools → Network
 *    - Filter by "refresh-token"
 *    - Check request/response
 * 
 * 4. Check console for logs:
 *    - Interceptor logs token refresh attempts
 *    - Error logs show failure reasons
 * 
 * 5. Test token expiration:
 *    - Manually delete accessToken from localStorage
 *    - Make any API request
 *    - Should trigger automatic refresh
 */

export default {
    testAutomaticRefresh,
    testManualRefresh,
    testConcurrentRequests,
    testTokenExpiration,
    testSilentRefresh,
    testSessionExpiration,
};

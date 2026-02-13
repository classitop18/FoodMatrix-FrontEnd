import { AxiosError } from "axios";

/**
 * Extracts a user-friendly error message from an API error object.
 * Handles Axios errors, standard Error objects, and unknown types.
 *
 * @param error - The error object caught in a try-catch block or promise rejection.
 * @param defaultMessage - Check if a specific default message is provided, otherwise generic fallback.
 * @returns A clean string message safe for display to the user.
 */
export function getErrorMessage(error: unknown, defaultMessage: string = "Something went wrong. Please try again."): string {
    if (!error) return defaultMessage;

    // Handle Axios Error
    if (isAxiosError(error)) {
        // 1. Check for explicit server-provided message
        const serverMessage = (error.response?.data as any)?.message;
        if (serverMessage && typeof serverMessage === "string") {
            return serverMessage;
        }

        // 2. Fallback to status code mapping if no specific message
        switch (error.response?.status) {
            case 400:
                return "Invalid request. Please check your inputs.";
            case 401:
                return "Invalid email/username or password."; // Start with credential error as it's most common 401
            case 403:
                return "You do not have permission to perform this action.";
            case 404:
                return "The requested resource was not found.";
            case 408:
                return "Request timed out. Please check your internet connection.";
            case 429:
                return "Too many requests. Please try again later.";
            case 500:
            case 502:
            case 503:
            case 504:
                return "Internal server error. Our team has been notified.";
            default:
                // Use the default message instead of raw "Request failed with status code X"
                return defaultMessage;
        }
    }

    // Handle Standard Error
    if (error instanceof Error) {
        return error.message;
    }

    // Handle String Error
    if (typeof error === "string") {
        return error;
    }

    return defaultMessage;
}

// Type guard for AxiosError
function isAxiosError(error: any): error is AxiosError {
    return error && typeof error === 'object' && 'isAxiosError' in error;
}

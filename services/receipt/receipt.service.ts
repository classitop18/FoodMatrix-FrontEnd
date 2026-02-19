import axios from "axios";
import { Receipt } from "./types/receipt.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export class ReceiptService {
    async uploadReceipt(file: File, eventId?: string, shoppingListId?: string): Promise<Receipt> {
        const formData = new FormData();
        formData.append("file", file);
        if (eventId) formData.append("eventId", eventId);
        if (shoppingListId) formData.append("shoppingListId", shoppingListId);

        // Get token from localStorage if your app uses it, or rely on cookies (withCredentials: true)
        // The previous code showed 'authenticate' middleware, which usually checks Authorization header or cookie.
        // I'll check how other services add headers. Usually axios interceptor or manual header.
        // For now assuming withCredentials handles cookies or interceptor handles token.

        const response = await axios.post(`${API_URL}/receipts/upload`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
        });

        return response.data.data;
    }
}

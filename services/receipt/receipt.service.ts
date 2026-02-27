import { Receipt, ReceiptListParams, PaginatedReceiptsResponse, UpdateReceiptPayload } from "./types/receipt.types";
import { apiClient } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1/";

export class ReceiptService {
    async uploadReceipt(file: File, eventId?: string, shoppingListId?: string, description?: string, tags?: string[]): Promise<Receipt> {
        const formData = new FormData();
        formData.append("file", file);
        if (eventId) formData.append("eventId", eventId);
        if (shoppingListId) formData.append("shoppingListId", shoppingListId);
        if (description) formData.append("description", description);
        if (tags && tags.length > 0) formData.append("tags", JSON.stringify(tags));

        const response = await apiClient.post(`${API_URL}/receipts/upload`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.data;
    }

    async getReceipts(params: ReceiptListParams = {}): Promise<PaginatedReceiptsResponse> {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.set("page", params.page.toString());
        if (params.limit) queryParams.set("limit", params.limit.toString());
        if (params.search) queryParams.set("search", params.search);
        if (params.dateFrom) queryParams.set("dateFrom", params.dateFrom);
        if (params.dateTo) queryParams.set("dateTo", params.dateTo);
        if (params.sortBy) queryParams.set("sortBy", params.sortBy);
        if (params.sortOrder) queryParams.set("sortOrder", params.sortOrder);

        const response = await apiClient.get(`${API_URL}/receipts?${queryParams.toString()}`);
        return response.data.data;
    }

    async getReceiptById(id: string): Promise<Receipt> {
        const response = await apiClient.get(`${API_URL}/receipts/${id}`);
        return response.data.data;
    }

    async updateReceipt(id: string, data: UpdateReceiptPayload): Promise<Receipt> {
        const response = await apiClient.patch(`${API_URL}/receipts/${id}`, data);
        return response.data.data;
    }
}

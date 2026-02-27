export interface ReceiptItem {
    name: string;
    quantity?: number;
    price?: number;
}

export interface Receipt {
    id: string;
    userId: string;
    eventId?: string | null;
    shoppingListId?: string | null;
    storeName?: string | null;
    totalAmount?: string | null;
    taxAmount?: string | null;
    purchaseDate?: string | null;
    items: ReceiptItem[];
    rawText?: string | null;
    imageUrl?: string | null;
    description?: string | null;
    tags?: string[] | null;
    createdAt: string;
    updatedAt?: string;
}

export interface ReceiptListParams {
    page?: number;
    limit?: number;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: "createdAt" | "purchaseDate" | "totalAmount";
    sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PaginatedReceiptsResponse {
    data: Receipt[];
    pagination: PaginationMeta;
}

export interface UpdateReceiptPayload {
    description?: string | null;
    tags?: string[];
    eventId?: string | null;
    shoppingListId?: string | null;
}

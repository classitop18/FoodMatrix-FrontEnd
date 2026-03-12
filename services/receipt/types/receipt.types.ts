export interface AuditedReceiptItem {
    name: string;
    quantity: number;
    unit: string;
    price: number;
    category:
    | "food"
    | "snacks"
    | "beverages"
    | "dairy"
    | "produce"
    | "meat"
    | "bakery"
    | "spices"
    | "frozen"
    | "household"
    | "other";
    brand?: string;
    confidence: number;
    taxable?: boolean;
    calculatedTax?: number;
}

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
    accountId?: string | null;
    storeName?: string | null;
    totalAmount?: string | null;
    taxAmount?: string | null;
    purchaseDate?: string | null;
    items: ReceiptItem[];
    aiAuditedItems: AuditedReceiptItem[];
    aiProcessingStatus?: "pending" | "processing" | "completed" | "failed" | null;
    currency?: string | null;
    addedToPantry: boolean;
    rawText?: string | null;
    imageUrl?: string | null;
    description?: string | null;
    tags?: string[] | null;
    createdAt: string;
    updatedAt?: string;
    submittedBy?: {
        firstName: string;
        lastName?: string | null;
        avatar?: string | null;
    } | null;
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

export interface PantryItemFromReceipt {
    name: string;
    quantity: number;
    unit: string;
    price?: number;
    category: string;
    location: string;
    expirationDate?: string | null;
}

export interface AddToPantryPayload {
    items: PantryItemFromReceipt[];
}

export interface ExpirySuggestion {
    name: string;
    suggestedExpiryDays: number;
    storageLocation: string;
}

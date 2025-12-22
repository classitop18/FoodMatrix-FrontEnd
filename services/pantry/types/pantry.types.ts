// Pantry Types

export interface Ingredient {
    id: string;
    name: string;
    category: string;
    averagePrice?: string;
    averageUnit?: string;
    defaultMeasurementUnit?: string;
    isPerishable?: boolean;
    shelfLifeDays?: number;
    createdAt: string;
}

export interface PantryItem {
    id: string;
    accountId: string;
    ingredientId: string;
    quantity: string;
    unit: string;
    location: string;
    expirationDate?: string;
    costPaid?: string;
    addedBy?: string;
    createdAt: string;
    updatedAt: string;
    ingredient: Ingredient;
}

export interface PantryPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PantryResponse {
    data: PantryItem[];
    pagination: PantryPagination;
}

export interface PantryQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    location?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface AddPantryItemPayload {
    ingredientId: string;
    quantity: number;
    unit: string;
    location: string;
    expirationDate?: string;
    costPaid?: number;
}

export interface UpdatePantryItemPayload {
    id: string;
    data: Partial<AddPantryItemPayload>;
}

export interface PantryAlert {
    id: string;
    accountId: string;
    pantryItemId?: string;
    alertType: 'expiring_soon' | 'expired' | 'low_stock';
    message: string;
    severity: 'info' | 'warning' | 'critical';
    isDismissed: boolean;
    dismissedAt?: string;
    createdAt: string;
}

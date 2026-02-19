export interface ReceiptItem {
    name: string;
    quantity?: number;
    price?: number;
}

export interface Receipt {
    id: string;
    userId: string;
    eventId?: string;
    shoppingListId?: string;
    storeName?: string;
    totalAmount?: string;
    taxAmount?: string;
    purchaseDate?: string;
    items: ReceiptItem[];
    rawText?: string;
    imageUrl?: string;
    createdAt: string;
}

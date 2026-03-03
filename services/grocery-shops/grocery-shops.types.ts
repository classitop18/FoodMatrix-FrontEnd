export interface GroceryShop {
    id: string;
    name: string;
    formattedAddress: string;
    rating?: number;
    userRatingCount?: number;
    isOpen?: boolean;
    openingHours?: string[];
    photoUrl?: string;
    websiteUri?: string;
    googleMapsUri?: string;
    latitude?: number;
    longitude?: number;
}

export interface NearbyGroceryShopsPayload {
    latitude: number;
    longitude: number;
    radius?: number;
    types?: string[];
}

"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { useNearbyGroceryShops } from "@/services/grocery-shops/grocery-shops.query";
import {
    AddressAutocomplete,
} from "@/components/profile/address-autocomplete";
import { PlaceDetails } from "@/hooks/use-google-places";
import GroceryShopCard from "./_components/GroceryShopCard";
import ShopListSkeleton from "./_components/ShopListSkeleton";
import {
    MapPin,
    Store,
    AlertCircle,
    RefreshCw,
    Navigation,
    LocateFixed,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SearchLocation {
    lat: number;
    lng: number;
    label: string;
}

export default function NearbyShopsPage() {
    const account = useSelector((state: any) => state.account.account);

    const accountLat = account?.latitude ? Number(account.latitude) : null;
    const accountLng = account?.longitude ? Number(account.longitude) : null;

    // Custom search state
    const [customLocation, setCustomLocation] = useState<SearchLocation | null>(
        null,
    );
    const [searchKey, setSearchKey] = useState(0); // to reset autocomplete input

    // Determine which coordinates to use: custom search or account
    const activeLat = customLocation?.lat ?? accountLat;
    const activeLng = customLocation?.lng ?? accountLng;

    const {
        data: shops,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useNearbyGroceryShops(activeLat, activeLng);

    const accountLocationDisplay = [
        account?.city,
        account?.state,
        account?.country,
    ]
        .filter(Boolean)
        .join(", ");

    const currentLocationLabel =
        customLocation?.label || accountLocationDisplay || "Your location";

    // Handle address selection from autocomplete
    const handleAddressSelect = (details: PlaceDetails) => {
        if (details.latitude && details.longitude) {
            setCustomLocation({
                lat: details.latitude, 
                lng: details.longitude,
                label:
                    details.formattedAddress ||
                    [details.city, details.state, details.country]
                        .filter(Boolean)
                        .join(", ") ||
                    "Selected location",
            });
        }
    };

    const handleClearSearch = () => {
        setCustomLocation(null);
        setSearchKey((k) => k + 1); // reset the autocomplete input
    };

    // No location available at all (no account location AND no custom search)
    if (!activeLat || !activeLng) {
        return (
            <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
                {/* Search bar even when no account location */}
                <div className="max-w-xl">
                    <AddressAutocomplete
                        key={`search-${searchKey}`}
                        onAddressSelect={handleAddressSelect}
                        label="Search Location"
                        placeholder="Search by zip code, city, or address..."
                    />
                </div>

                <div className="min-h-[50vh] flex items-center justify-center">
                    <div className="text-center max-w-md space-y-4">
                        <div className="mx-auto w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
                            <Navigation className="w-10 h-10 text-amber-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Location Not Set
                        </h2>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Search a location above, or set your account location to find
                            nearby grocery shops.
                        </p>
                        <Link href="/account">
                            <Button className="mt-2 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white hover:shadow-lg hover:shadow-[var(--primary)]/30 rounded-xl px-6">
                                <MapPin className="w-4 h-4 mr-2" />
                                Set Account Location
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-8xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
                            <Store className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                                Nearby Grocery Shops
                            </h1>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <MapPin className="w-3 h-3" />
                                <span className="max-w-[250px] truncate">
                                    {currentLocationLabel}
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className="text-[var(--primary)] font-medium">
                                    Within 15 km
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    {customLocation && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearSearch}
                            className="rounded-xl border-gray-200 hover:border-amber-400 hover:text-amber-600 transition-all text-xs"
                        >
                            <LocateFixed className="w-3.5 h-3.5 mr-1.5" />
                            Use My Location
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="rounded-xl border-gray-200 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all"
                    >
                        <RefreshCw
                            className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
                        />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Custom Location Search */}
            <div className="max-w-xl">
                <AddressAutocomplete
                    key={`search-${searchKey}`}
                    onAddressSelect={handleAddressSelect}
                    label="Search Location"
                    placeholder="Search by zip code, city, or address..."
                />
            </div>

            {/* Active custom search indicator */}
            {customLocation && (
                <div className="flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--primary-bg,#f5f0ff)] text-[var(--primary)] font-medium">
                        <MapPin className="w-3 h-3" />
                        Showing results for: {customLocation.label}
                        <button
                            onClick={handleClearSearch}
                            className="ml-1 hover:text-red-500 transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                </div>
            )}

            {/* Loading State */}
            {isLoading && <ShopListSkeleton />}

            {/* Error State */}
            {isError && (
                <div className="min-h-[40vh] flex items-center justify-center">
                    <div className="text-center max-w-md space-y-3">
                        <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700">
                            Could not load shops
                        </h3>
                        <p className="text-sm text-gray-500">
                            {(error as any)?.message ||
                                "Something went wrong while fetching nearby shops. Please try again."}
                        </p>
                        <Button
                            onClick={() => refetch()}
                            className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white rounded-xl"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && shops && shops.length === 0 && (
                <div className="min-h-[40vh] flex items-center justify-center">
                    <div className="text-center max-w-md space-y-3">
                        <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <Store className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700">
                            No shops found
                        </h3>
                        <p className="text-sm text-gray-500">
                            We couldn&apos;t find any grocery stores or supermarkets within 15
                            km of this location. Try searching a different area.
                        </p>
                    </div>
                </div>
            )}

            {/* Shop Grid */}
            {!isLoading && !isError && shops && shops.length > 0 && (
                <>
                    <p className="text-sm text-gray-500">
                        Found{" "}
                        <span className="font-semibold text-gray-700">{shops.length}</span>{" "}
                        grocery shops near{" "}
                        <span className="font-medium text-gray-600">
                            {currentLocationLabel}
                        </span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {shops.map((shop) => (
                            <GroceryShopCard key={shop.id} shop={shop} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

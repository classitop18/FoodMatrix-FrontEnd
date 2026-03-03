"use client";

import { useState, useEffect, useCallback } from "react";
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
    SlidersHorizontal,
    Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface SearchLocation {
    lat: number;
    lng: number;
    label: string;
}

// Google Places API max radius is 50,000 meters (~31 miles) bounds, but we allow UI to be 100 miles (backend will clamp it safely)
const MILES_TO_METERS = 1609.34;
const GOOGLE_MAX_RADIUS_METERS = 50000;
const MAX_MILES = 100;
const MIN_MILES = 1;
const DEFAULT_MILES = 15;

const SHOP_TYPE_OPTIONS = [
    { value: "grocery_store,supermarket", label: "All Groceries" },
    { value: "grocery_store", label: "Grocery Stores" },
    { value: "supermarket", label: "Supermarkets" },
    { value: "convenience_store", label: "Convenience Stores" },
    { value: "bakery", label: "Bakeries" },
    { value: "liquor_store", label: "Liquor Stores" },
    { value: "restaurant", label: "Restaurants" },
    { value: "cafe", label: "Cafés" },
    { value: "pharmacy", label: "Pharmacies" },
];

export default function NearbyShopsPage() {
    const account = useSelector((state: any) => state.account.account);

    const accountLat = account?.latitude ? Number(account.latitude) : null;
    const accountLng = account?.longitude ? Number(account.longitude) : null;

    // Custom search state
    const [customLocation, setCustomLocation] = useState<SearchLocation | null>(
        null,
    );
    const [searchKey, setSearchKey] = useState(0);
    const [sliderValue, setSliderValue] = useState(DEFAULT_MILES); // UI slider value
    const [searchRange, setSearchRange] = useState(DEFAULT_MILES); // debounced value used for API
    const [shopTypes, setShopTypes] = useState<string>("grocery_store,supermarket");

    // Debounce slider value → only update searchRange after user stops sliding
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchRange(sliderValue);
        }, 500);
        return () => clearTimeout(timer);
    }, [sliderValue]);

    // Determine which coordinates to use
    const activeLat = customLocation?.lat ?? accountLat;
    const activeLng = customLocation?.lng ?? accountLng;

    // Convert miles to meters, clamped to Google's max
    const radiusMeters = Math.min(
        Math.round(searchRange * MILES_TO_METERS),
        GOOGLE_MAX_RADIUS_METERS,
    );

    const shopTypeArray = shopTypes.split(",");

    const {
        data: shops,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useNearbyGroceryShops(activeLat, activeLng, radiusMeters, shopTypeArray);

    const accountLocationDisplay = [
        account?.city,
        account?.state,
        account?.country,
    ]
        .filter(Boolean)
        .join(", ");

    const currentLocationLabel =
        customLocation?.label || accountLocationDisplay || "Your location";

    const selectedTypeLabel =
        SHOP_TYPE_OPTIONS.find((o) => o.value === shopTypes)?.label ?? "All Groceries";

    // Handle address selection from autocomplete
    const handleAddressSelect = useCallback((details: PlaceDetails) => {
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
    }, []);

    const handleClearSearch = useCallback(() => {
        setCustomLocation(null);
        setSearchKey((k) => k + 1);
    }, []);

    // No location available at all
    if (!activeLat || !activeLng) {
        return (
            <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
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
        <div className="p-4 md:p-6 space-y-5 max-w-8xl mx-auto">
            {/* ── Header Row ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
                        <Store className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                            Nearby Shops
                        </h1>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span className="max-w-[250px] truncate">
                                {currentLocationLabel}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
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

            {/* ── Filter Controls Bar ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
                <div className="flex flex-col md:flex-row flex-wrap items-center gap-6">
                    {/* Distance Range */}
                    <div className="flex-1 min-w-[200px] w-full space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5 uppercase tracking-wide">
                                <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--primary)]" />
                                Distance Range
                            </label>
                            <span className="text-sm font-bold text-[var(--primary)] bg-[var(--primary-bg,#f5f0ff)] px-2.5 py-0.5 rounded-full">
                                {sliderValue} mi
                            </span>
                        </div>
                        <div className="pt-2 pb-1 px-1">
                            <div className="relative w-full">
                                <Slider
                                    value={[sliderValue]}
                                    min={MIN_MILES}
                                    max={MAX_MILES}
                                    step={1}
                                    onValueChange={(val) => setSliderValue(val[0])}
                                    className="w-full [&_[data-slot=slider-track]]:bg-gray-200 [&_[data-slot=slider-range]]:bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] [&_[data-slot=slider-thumb]]:bg-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400 font-medium px-1">
                            <span>{MIN_MILES} mi</span>
                            <span>{MAX_MILES} mi</span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-px h-12 bg-gray-200" />

                    {/* Shop Type */}
                    <div className="flex-1 min-w-[200px] w-full space-y-3">
                        <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5 uppercase tracking-wide">
                            <Store className="w-3.5 h-3.5 text-[var(--primary)]" />
                            Shop Type
                        </label>
                        <Select value={shopTypes} onValueChange={setShopTypes}>
                            <SelectTrigger className="w-full h-10 text-sm bg-gray-50 hover:bg-gray-100 transition-colors border-gray-200 rounded-xl">
                                <SelectValue placeholder="Select shop type" />
                            </SelectTrigger>
                            <SelectContent>
                                {SHOP_TYPE_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-px h-12 bg-gray-200" />

                    {/* Search Location */}
                    <div className="flex-1 min-w-[200px] w-full space-y-3">
                        <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5 uppercase tracking-wide">
                            <Search className="w-3.5 h-3.5 text-[var(--primary)]" />
                            Search Location
                        </label>
                        <AddressAutocomplete
                            key={`search-${searchKey}`}
                            onAddressSelect={handleAddressSelect}
                            placeholder="Zip code, city, or address..."
                        />
                    </div>
                </div>
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

            {/* Results summary badge */}
            {!isLoading && !isError && shops && shops.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    <span>
                        Found{" "}
                        <span className="font-semibold text-gray-700">{shops.length}</span>{" "}
                        <span className="font-medium text-gray-600">{selectedTypeLabel}</span>{" "}
                        within{" "}
                        <span className="font-semibold text-[var(--primary)]">{searchRange} miles</span>{" "}
                        of{" "}
                        <span className="font-medium text-gray-600">{currentLocationLabel}</span>
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
                            We couldn&apos;t find any {selectedTypeLabel.toLowerCase()} within{" "}
                            {searchRange} miles of this location. Try increasing the distance
                            or searching a different area.
                        </p>
                    </div>
                </div>
            )}

            {/* Shop Grid */}
            {!isLoading && !isError && shops && shops.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {shops.map((shop) => (
                        <GroceryShopCard key={shop.id} shop={shop} />
                    ))}
                </div>
            )}
        </div>
    );
}

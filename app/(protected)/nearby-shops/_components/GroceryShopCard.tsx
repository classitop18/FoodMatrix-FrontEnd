"use client";

import { GroceryShop } from "@/services/grocery-shops/grocery-shops.types";
import { Star, MapPin, ExternalLink, Clock, Globe } from "lucide-react";

interface GroceryShopCardProps {
    shop: GroceryShop;
}

export default function GroceryShopCard({ shop }: GroceryShopCardProps) {
    const handleVisitWebsite = () => {
        const url = shop.websiteUri || shop.googleMapsUri;
        if (url) {
            window.open(url, "_blank", "noopener,noreferrer");
        }
    };

    return (
        <div
            className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-100/50 hover:-translate-y-1 cursor-pointer"
            onClick={handleVisitWebsite}
        >
            {/* Photo / Gradient Header */}
            {shop.photoUrl ? (
                <div className="relative h-44 overflow-hidden">
                    <img
                        src={shop.photoUrl}
                        alt={shop.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Open/Closed Badge */}
                    {shop.isOpen !== undefined && (
                        <div className="absolute top-3 right-3">
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md ${shop.isOpen
                                        ? "bg-emerald-500/90 text-white"
                                        : "bg-red-500/90 text-white"
                                    }`}
                            >
                                {shop.isOpen ? "Open Now" : "Closed"}
                            </span>
                        </div>
                    )}

                    {/* Rating on image */}
                    {shop.rating && (
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-bold text-gray-800">
                                {shop.rating.toFixed(1)}
                            </span>
                            {shop.userRatingCount && (
                                <span className="text-xs text-gray-500">
                                    ({shop.userRatingCount.toLocaleString()})
                                </span>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="relative h-32 bg-gradient-to-br from-[var(--primary)] via-[var(--primary-light)] to-purple-300 flex items-center justify-center">
                    <MapPin className="w-10 h-10 text-white/60" />
                    {/* Open/Closed Badge */}
                    {shop.isOpen !== undefined && (
                        <div className="absolute top-3 right-3">
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${shop.isOpen
                                        ? "bg-emerald-500/90 text-white"
                                        : "bg-red-500/90 text-white"
                                    }`}
                            >
                                {shop.isOpen ? "Open Now" : "Closed"}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Name */}
                <h3 className="text-base font-bold text-gray-800 leading-tight line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                    {shop.name}
                </h3>

                {/* Address */}
                <div className="flex items-start gap-2 text-gray-500">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--primary)]" />
                    <p className="text-xs leading-relaxed line-clamp-2">
                        {shop.formattedAddress}
                    </p>
                </div>

                {/* Rating (if no photo) */}
                {!shop.photoUrl && shop.rating && (
                    <div className="flex items-center gap-1.5">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-3.5 h-3.5 ${star <= Math.round(shop.rating!)
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-gray-200"
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-xs font-semibold text-gray-600">
                            {shop.rating.toFixed(1)}
                        </span>
                        {shop.userRatingCount && (
                            <span className="text-xs text-gray-400">
                                ({shop.userRatingCount.toLocaleString()})
                            </span>
                        )}
                    </div>
                )}

                {/* Action Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleVisitWebsite();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
            bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white
            hover:shadow-lg hover:shadow-[var(--primary)]/30 active:scale-[0.98]"
                >
                    {shop.websiteUri ? (
                        <>
                            <Globe className="w-4 h-4" />
                            Visit Website
                        </>
                    ) : (
                        <>
                            <ExternalLink className="w-4 h-4" />
                            View on Maps
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

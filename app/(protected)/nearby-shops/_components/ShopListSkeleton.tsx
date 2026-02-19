"use client";

export default function ShopListSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse"
                >
                    {/* Photo skeleton */}
                    <div className="h-44 bg-gray-200" />

                    {/* Content skeleton */}
                    <div className="p-4 space-y-3">
                        <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
                        <div className="flex items-start gap-2">
                            <div className="w-3.5 h-3.5 bg-gray-200 rounded-full mt-0.5 shrink-0" />
                            <div className="space-y-1 flex-1">
                                <div className="h-3 bg-gray-200 rounded w-full" />
                                <div className="h-3 bg-gray-200 rounded w-2/3" />
                            </div>
                        </div>
                        <div className="h-10 bg-gray-200 rounded-xl w-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}

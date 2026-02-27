"use client";

import { useState, useCallback, useRef } from "react";
import { Search, CalendarDays, X, ChevronDown, ArrowDownUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ReceiptListParams } from "@/services/receipt/types/receipt.types";

interface ReceiptFiltersProps {
    params: ReceiptListParams;
    onChange: (params: Partial<ReceiptListParams>) => void;
    totalCount?: number;
}

const SORT_OPTIONS = [
    { value: "createdAt_desc", label: "Newest First" },
    { value: "createdAt_asc", label: "Oldest First" },
    { value: "purchaseDate_desc", label: "Latest Purchase" },
    { value: "purchaseDate_asc", label: "Earliest Purchase" },
    { value: "totalAmount_desc", label: "Highest Amount" },
    { value: "totalAmount_asc", label: "Lowest Amount" },
];

export function ReceiptFilters({ params, onChange, totalCount }: ReceiptFiltersProps) {
    const [searchValue, setSearchValue] = useState(params.search || "");
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSearchChange = useCallback(
        (val: string) => {
            setSearchValue(val);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                onChange({ search: val || undefined, page: 1 });
            }, 400);
        },
        [onChange]
    );

    const hasActiveFilters =
        params.search ||
        params.dateFrom ||
        params.dateTo ||
        params.sortBy !== "createdAt" ||
        params.sortOrder !== "desc";

    const clearAll = () => {
        setSearchValue("");
        onChange({
            search: undefined,
            dateFrom: undefined,
            dateTo: undefined,
            sortBy: "createdAt",
            sortOrder: "desc",
            page: 1,
        });
    };

    const currentSort = `${params.sortBy || "createdAt"}_${params.sortOrder || "desc"}`;
    const sortLabel = SORT_OPTIONS.find((o) => o.value === currentSort)?.label ?? "Newest First";

    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {/* Search Bar */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-50">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                        value={searchValue}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search by store name or description..."
                        className="pl-10 pr-10 border-gray-200 focus:border-[#7661d3] bg-gray-50/70 rounded-xl h-11 text-sm font-medium placeholder:text-gray-400"
                    />
                    {searchValue && (
                        <button
                            onClick={() => handleSearchChange("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                        >
                            <X className="w-3 h-3 text-gray-600" />
                        </button>
                    )}
                </div>
            </div>

            {/* Controls Row */}
            <div className="px-4 py-3 flex flex-wrap items-center gap-3">
                {/* Date range */}
                <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
                        <input
                            type="date"
                            value={params.dateFrom || ""}
                            onChange={(e) => onChange({ dateFrom: e.target.value || undefined, page: 1 })}
                            className="bg-transparent text-xs text-gray-600 outline-none w-32 font-medium"
                        />
                        <span className="text-gray-300 text-xs font-bold">—</span>
                        <input
                            type="date"
                            value={params.dateTo || ""}
                            onChange={(e) => onChange({ dateTo: e.target.value || undefined, page: 1 })}
                            className="bg-transparent text-xs text-gray-600 outline-none w-32 font-medium"
                        />
                    </div>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2 ml-auto">
                    <ArrowDownUp className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <Select
                        value={currentSort}
                        onValueChange={(v) => {
                            const [sortBy, sortOrder] = v.split("_");
                            onChange({ sortBy: sortBy as any, sortOrder: sortOrder as any, page: 1 });
                        }}
                    >
                        <SelectTrigger className="w-[160px] border-gray-200 rounded-xl text-xs h-9 font-semibold gap-1">
                            <SelectValue>{sortLabel}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {SORT_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value} className="text-xs">
                                    {o.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Active filter tags + count */}
            {(hasActiveFilters || totalCount !== undefined) && (
                <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
                    {totalCount !== undefined && (
                        <span className="text-[11px] text-gray-400 font-semibold">
                            {totalCount} result{totalCount !== 1 ? "s" : ""}
                        </span>
                    )}
                    {params.search && (
                        <span className="inline-flex items-center gap-1 bg-[#F3F0FD] text-[#7661d3] text-[11px] font-bold px-2.5 py-1 rounded-full border border-[#7661d3]/15">
                            Search: &quot;{params.search}&quot;
                            <button onClick={() => { setSearchValue(""); onChange({ search: undefined, page: 1 }); }} className="ml-0.5 hover:text-red-500">
                                <X className="w-2.5 h-2.5" />
                            </button>
                        </span>
                    )}
                    {(params.dateFrom || params.dateTo) && (
                        <span className="inline-flex items-center gap-1 bg-[#e8f5e0] text-[#7dab4f] text-[11px] font-bold px-2.5 py-1 rounded-full border border-[#7dab4f]/15">
                            Date filtered
                            <button onClick={() => onChange({ dateFrom: undefined, dateTo: undefined, page: 1 })} className="ml-0.5 hover:text-red-500">
                                <X className="w-2.5 h-2.5" />
                            </button>
                        </span>
                    )}
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAll}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 h-7 text-[11px] rounded-lg px-2 ml-auto"
                        >
                            <X className="w-2.5 h-2.5 mr-1" />
                            Clear all
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

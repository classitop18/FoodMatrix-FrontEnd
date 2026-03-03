"use client";

import { PaginationMeta } from "@/services/receipt/types/receipt.types";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ReceiptPaginationProps {
    pagination: PaginationMeta;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
}

export function ReceiptPagination({
    pagination,
    onPageChange,
    onLimitChange,
}: ReceiptPaginationProps) {
    const { page, limit, total, totalPages, hasNext, hasPrev } = pagination;

    const start = total === 0 ? 0 : (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | "...")[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (page > 3) pages.push("...");
            for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
                pages.push(i);
            }
            if (page < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    if (totalPages <= 1 && total <= limit) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
            {/* Left: Count + per page */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>
                    Showing <span className="font-semibold text-[#313131]">{start}–{end}</span> of{" "}
                    <span className="font-semibold text-[#313131]">{total}</span> receipts
                </span>
                <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">per page:</span>
                    <Select
                        value={limit.toString()}
                        onValueChange={(v) => {
                            onLimitChange(parseInt(v));
                            onPageChange(1);
                        }}
                    >
                        <SelectTrigger className="h-7 w-16 text-xs border-gray-200 rounded-lg">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[5, 10, 20, 50].map((n) => (
                                <SelectItem key={n} value={n.toString()}>
                                    {n}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Right: Page navigation */}
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 rounded-lg text-gray-400 hover:text-[#7661d3] hover:bg-[#F3F0FD] disabled:opacity-30"
                    onClick={() => onPageChange(1)}
                    disabled={!hasPrev}
                >
                    <ChevronsLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 rounded-lg text-gray-400 hover:text-[#7661d3] hover:bg-[#F3F0FD] disabled:opacity-30"
                    onClick={() => onPageChange(page - 1)}
                    disabled={!hasPrev}
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                </Button>

                {getPageNumbers().map((p, idx) =>
                    p === "..." ? (
                        <span key={`ellipsis-${idx}`} className="w-7 h-7 flex items-center justify-center text-xs text-gray-400">
                            ···
                        </span>
                    ) : (
                        <Button
                            key={p}
                            variant="ghost"
                            size="icon"
                            className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${page === p
                                ? "bg-[#7661d3] text-white hover:bg-[#6450c2] shadow-sm"
                                : "text-gray-500 hover:text-[#7661d3] hover:bg-[#F3F0FD]"
                                }`}
                            onClick={() => onPageChange(p as number)}
                        >
                            {p}
                        </Button>
                    )
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 rounded-lg text-gray-400 hover:text-[#7661d3] hover:bg-[#F3F0FD] disabled:opacity-30"
                    onClick={() => onPageChange(page + 1)}
                    disabled={!hasNext}
                >
                    <ChevronRight className="w-3.5 h-3.5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 rounded-lg text-gray-400 hover:text-[#7661d3] hover:bg-[#F3F0FD] disabled:opacity-30"
                    onClick={() => onPageChange(totalPages)}
                    disabled={!hasNext}
                >
                    <ChevronsRight className="w-3.5 h-3.5" />
                </Button>
            </div>
        </div>
    );
}

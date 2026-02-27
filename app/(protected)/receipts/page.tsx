"use client";

import { useState, useCallback } from "react";
import { useReceiptsQuery } from "@/services/receipt/receipt.query";
import { ReceiptListParams, Receipt } from "@/services/receipt/types/receipt.types";
import { ReceiptCard } from "@/components/receipts/ReceiptCard";
import { ReceiptFilters } from "@/components/receipts/ReceiptFilters";
import { ReceiptDetailSheet } from "@/components/receipts/ReceiptDetailSheet";
import { ReceiptTagDialog } from "@/components/receipts/ReceiptTagDialog";
import { ReceiptPagination } from "@/components/receipts/ReceiptPagination";
import { ReceiptUploadButton } from "@/components/receipts/ReceiptUploadButton";
import {
    ScanLine,
    ReceiptText,
    Loader2,
    FolderOpen,
    TrendingUp,
    IndianRupee,
    CalendarDays,
    FileStack,
} from "lucide-react";

const DEFAULT_PARAMS: ReceiptListParams = {
    page: 1,
    limit: 12,
    sortBy: "createdAt",
    sortOrder: "desc",
};

function StatCard({
    icon,
    label,
    value,
    gradient,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    gradient: string;
}) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${gradient}`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide truncate">{label}</p>
                <p className="text-lg font-extrabold text-[#313131] leading-tight">{value}</p>
            </div>
        </div>
    );
}

export default function ReceiptsPage() {
    const [params, setParams] = useState<ReceiptListParams>(DEFAULT_PARAMS);
    const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
    const [tagReceipt, setTagReceipt] = useState<Receipt | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [tagOpen, setTagOpen] = useState(false);

    const { data, isLoading, isError, isFetching } = useReceiptsQuery(params);

    const handleParamsChange = useCallback((changes: Partial<ReceiptListParams>) => {
        setParams((prev) => ({ ...prev, ...changes }));
    }, []);

    const handleOpenDetail = (receipt: Receipt) => {
        setSelectedReceipt(receipt);
        setDetailOpen(true);
    };

    const handleOpenTag = (receipt: Receipt) => {
        setTagReceipt(receipt);
        setTagOpen(true);
    };

    const receipts = data?.data ?? [];
    const pagination = data?.pagination;

    // Stats from paginated data
    const totalAmount = receipts.reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);
    const totalOnPage = receipts.length;

    return (
        <div className="min-h-screen bg-[#f8f7fc]">
            {/* ─── Hero Header ─── */}
            <div className="bg-gradient-to-r from-[#3d326d] via-[#5a468a] to-[#7661d3] px-4 sm:px-6 pt-6 pb-16">
                <div className="max-w-8xl mx-auto">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                                    <ReceiptText className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">Module</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                Scanned Receipts
                            </h1>
                            <p className="text-white/60 text-sm mt-1">
                                All OCR-scanned receipts with extracted data, items &amp; tags
                            </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            {isFetching && !isLoading && (
                                <Loader2 className="w-4 h-4 text-white/60 animate-spin" />
                            )}
                            <ReceiptUploadButton />
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Main Content (overlaps hero) ─── */}
            <div className="max-w-8xl mx-auto px-4 sm:px-6 -mt-10 pb-8 space-y-5">
                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard
                        icon={<FileStack className="w-4 h-4 text-[#7661d3]" />}
                        label="Total Receipts"
                        value={pagination?.total ?? "—"}
                        gradient="bg-[#F3F0FD]"
                    />
                    <StatCard
                        icon={<IndianRupee className="w-4 h-4 text-[#7dab4f]" />}
                        label="Amount (this page)"
                        value={totalAmount > 0 ? `₹${totalAmount.toFixed(0)}` : "—"}
                        gradient="bg-[#e8f5e0]"
                    />
                    <StatCard
                        icon={<TrendingUp className="w-4 h-4 text-[#7661d3]" />}
                        label="Current Page"
                        value={`${totalOnPage} receipts`}
                        gradient="bg-[#F3F0FD]"
                    />
                    <StatCard
                        icon={<CalendarDays className="w-4 h-4 text-[#7dab4f]" />}
                        label="Total Pages"
                        value={pagination ? `${pagination.page} / ${pagination.totalPages}` : "—"}
                        gradient="bg-[#e8f5e0]"
                    />
                </div>

                {/* Filters */}
                <ReceiptFilters
                    params={params}
                    onChange={handleParamsChange}
                    totalCount={pagination?.total}
                />

                {/* States */}
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center animate-pulse">
                            <ScanLine className="w-8 h-8 text-[#7661d3]" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-gray-600">Loading receipts...</p>
                            <p className="text-xs text-gray-400 mt-1">Fetching your scanned documents</p>
                        </div>
                    </div>
                ) : isError ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                            <ReceiptText className="w-8 h-8 text-red-300" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-gray-600">Failed to load receipts</p>
                            <p className="text-xs text-gray-400 mt-1">Try refreshing the page</p>
                        </div>
                    </div>
                ) : receipts.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-5">
                        <div className="w-24 h-24 rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                            <FolderOpen className="w-12 h-12 text-[#7661d3]/30" />
                        </div>
                        <div className="text-center max-w-xs">
                            <p className="text-base font-bold text-gray-700">No receipts found</p>
                            <p className="text-sm text-gray-400 mt-1.5">
                                {params.search || params.dateFrom || params.dateTo
                                    ? "Try clearing filters or adjusting your search"
                                    : "Scan your first receipt to get started"}
                            </p>
                        </div>
                        {!params.search && !params.dateFrom && !params.dateTo && (
                            <ReceiptUploadButton />
                        )}
                    </div>
                ) : (
                    <>
                        {/* Receipt Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                            {receipts.map((receipt) => (
                                <ReceiptCard
                                    key={receipt.id}
                                    receipt={receipt}
                                    onClick={handleOpenDetail}
                                    onTag={handleOpenTag}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 0 && (
                            <ReceiptPagination
                                pagination={pagination}
                                onPageChange={(page) => handleParamsChange({ page })}
                                onLimitChange={(limit) => handleParamsChange({ limit, page: 1 })}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Detail Sheet */}
            <ReceiptDetailSheet
                receipt={selectedReceipt}
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
            />

            {/* Tag Dialog */}
            <ReceiptTagDialog
                receipt={tagReceipt}
                open={tagOpen}
                onClose={() => setTagOpen(false)}
            />
        </div>
    );
}

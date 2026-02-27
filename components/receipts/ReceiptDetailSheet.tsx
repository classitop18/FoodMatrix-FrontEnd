"use client";

import { useState } from "react";
import { Receipt } from "@/services/receipt/types/receipt.types";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import {
    Store,
    FileText,
    AlignLeft,
    List,
    Info,
    Calendar,
    IndianRupee,
    Tag,
    Receipt as ReceiptIcon,
    ExternalLink,
    ImageIcon,
    Hash,
    User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReceiptDetailSheetProps {
    receipt: Receipt | null;
    open: boolean;
    onClose: () => void;
}

type Tab = "document" | "text" | "items" | "metadata";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "document", label: "Document", icon: <FileText className="w-3.5 h-3.5" /> },
    { id: "text", label: "OCR Text", icon: <AlignLeft className="w-3.5 h-3.5" /> },
    { id: "items", label: "Items", icon: <List className="w-3.5 h-3.5" /> },
    { id: "metadata", label: "Details", icon: <Info className="w-3.5 h-3.5" /> },
];

function MetaRow({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4 py-3.5 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold min-w-[110px] flex-shrink-0 pt-0.5">
                {icon && <span className="text-gray-300">{icon}</span>}
                {label}
            </div>
            <div className="text-sm text-[#313131] font-medium text-right flex-1">
                {value ?? <span className="text-gray-300 italic text-xs">Not available</span>}
            </div>
        </div>
    );
}

export function ReceiptDetailSheet({ receipt, open, onClose }: ReceiptDetailSheetProps) {
    const [activeTab, setActiveTab] = useState<Tab>("document");

    if (!receipt) return null;

    const tags = Array.isArray(receipt.tags) ? receipt.tags : [];
    const items = Array.isArray(receipt.items) ? receipt.items : [];
    const isImage = receipt.imageUrl && !receipt.imageUrl.toLowerCase().includes(".pdf");
    const isPdf = receipt.imageUrl && receipt.imageUrl.toLowerCase().includes(".pdf");

    const storeName =
        receipt.storeName && receipt.storeName !== "Unknown Store"
            ? receipt.storeName
            : "Scanned Receipt";

    const date = receipt.purchaseDate
        ? format(new Date(receipt.purchaseDate), "dd MMM yyyy")
        : receipt.createdAt
            ? format(new Date(receipt.createdAt), "dd MMM yyyy")
            : "—";

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent
                side="right"
                className="w-full sm:w-[700px] sm:max-w-[700px] p-0 flex flex-col gap-0 overflow-hidden bg-[#f8f7fc]"
            >
                {/* ── Header ── */}
                <SheetHeader className="p-0 flex-shrink-0">
                    <div className="bg-gradient-to-br from-[#3d326d] via-[#5a468a] to-[#7661d3] px-5 pt-5 pb-6">
                        {/* Store + Icon */}
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
                                <ReceiptIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <SheetTitle className="text-white font-extrabold text-lg leading-tight truncate">
                                    {storeName}
                                </SheetTitle>
                                {receipt.description ? (
                                    <p className="text-white/70 text-xs mt-0.5 line-clamp-2 font-medium">{receipt.description}</p>
                                ) : (
                                    <p className="text-white/40 text-xs mt-0.5 italic">No description</p>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats Chips */}
                        <div className="flex items-center flex-wrap gap-2">
                            {receipt.totalAmount && (
                                <div className="flex items-center gap-1 bg-white/15 border border-white/20 rounded-full px-3 py-1.5">
                                    <IndianRupee className="w-3 h-3 text-[#a0c878]" />
                                    <span className="text-white font-extrabold text-sm">
                                        {Number(receipt.totalAmount).toFixed(2)}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-1 bg-white/10 border border-white/15 rounded-full px-3 py-1.5">
                                <Calendar className="w-3 h-3 text-white/60" />
                                <span className="text-white/80 text-xs font-semibold">{date}</span>
                            </div>
                            {items.length > 0 && (
                                <div className="flex items-center gap-1 bg-white/10 border border-white/15 rounded-full px-3 py-1.5">
                                    <List className="w-3 h-3 text-white/60" />
                                    <span className="text-white/80 text-xs font-semibold">{items.length} items</span>
                                </div>
                            )}
                            {isPdf && (
                                <div className="flex items-center gap-1 bg-white/10 border border-white/15 rounded-full px-3 py-1.5">
                                    <FileText className="w-3 h-3 text-white/60" />
                                    <span className="text-white/80 text-xs font-semibold">PDF</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tab Bar */}
                    <div className="bg-white border-b border-gray-100 flex px-1">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-1.5 px-4 py-3.5 text-xs font-bold transition-all duration-200 relative flex-1 justify-center",
                                    activeTab === tab.id
                                        ? "text-[#7661d3]"
                                        : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                {tab.icon}
                                <span className="hidden sm:inline">{tab.label}</span>
                                {activeTab === tab.id && (
                                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-[#7661d3] to-[#7dab4f] rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </SheetHeader>

                {/* ── Tab Content ── */}
                <div className="flex-1 overflow-y-auto">

                    {/* Document Tab */}
                    {activeTab === "document" && (
                        <div className="p-4 h-full">
                            {receipt.imageUrl ? (
                                <div className="flex flex-col gap-3 h-full">
                                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex-1 min-h-[350px]">
                                        {isPdf ? (
                                            <iframe
                                                src={receipt.imageUrl}
                                                className="w-full h-full min-h-[350px]"
                                                title="Receipt PDF"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full bg-gray-50/50 p-4 min-h-[300px]">
                                                <img
                                                    src={receipt.imageUrl}
                                                    alt="Receipt"
                                                    className="max-w-full max-h-[480px] object-contain rounded-lg shadow-sm"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <a
                                        href={receipt.imageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 text-xs text-[#7661d3] hover:text-[#5a468a] font-bold bg-white border border-[#7661d3]/20 rounded-xl py-2.5 hover:bg-[#F3F0FD] transition-colors"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        Open original in new tab
                                    </a>
                                </div>
                            ) : (
                                <div className="h-48 flex flex-col items-center justify-center text-center gap-4 bg-white rounded-2xl border border-dashed border-gray-200">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                                        <ImageIcon className="w-6 h-6 text-gray-300" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-500">No document stored</p>
                                        <p className="text-xs text-gray-400 mt-1 max-w-[200px]">The original file was not uploaded to storage</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* OCR Text Tab */}
                    {activeTab === "text" && (
                        <div className="p-4">
                            {receipt.rawText ? (
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
                                        <AlignLeft className="w-3.5 h-3.5 text-[#7661d3]" />
                                        <span className="text-xs font-bold text-gray-600">Raw OCR Output</span>
                                        <span className="ml-auto text-[10px] text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded-full">
                                            {receipt.rawText.length} chars
                                        </span>
                                    </div>
                                    <div className="p-4 max-h-[500px] overflow-y-auto">
                                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed break-words">
                                            {receipt.rawText}
                                        </pre>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-40 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-dashed border-gray-200">
                                    <AlignLeft className="w-8 h-8 text-gray-200" />
                                    <p className="text-sm text-gray-400 font-medium">No extracted text available</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Items Tab */}
                    {activeTab === "items" && (
                        <div className="p-4">
                            {items.length > 0 ? (
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent bg-gray-50/80 border-b border-gray-100">
                                                <TableHead className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wide h-10">Item</TableHead>
                                                <TableHead className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wide h-10 text-center w-14">Qty</TableHead>
                                                <TableHead className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wide h-10 text-right w-24">Price</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((item, idx) => (
                                                <TableRow
                                                    key={idx}
                                                    className={cn(
                                                        "border-gray-50 hover:bg-[#F3F0FD]/30 transition-colors",
                                                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                                                    )}
                                                >
                                                    <TableCell className="text-xs text-[#313131] py-3 font-medium">{item.name}</TableCell>
                                                    <TableCell className="text-xs text-center text-gray-400 py-3 font-semibold">
                                                        ×{item.quantity ?? 1}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-right py-3 font-bold text-[#313131]">
                                                        {item.price != null ? `₹${Number(item.price).toFixed(2)}` : "—"}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* Totals footer */}
                                    <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3 space-y-1.5">
                                        {receipt.taxAmount && (
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500 font-medium">Tax</span>
                                                <span className="text-gray-600 font-semibold">₹{Number(receipt.taxAmount).toFixed(2)}</span>
                                            </div>
                                        )}
                                        {receipt.totalAmount && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-extrabold text-[#313131]">Total</span>
                                                <span className="text-base font-extrabold text-[#7661d3]">₹{Number(receipt.totalAmount).toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-40 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-dashed border-gray-200">
                                    <List className="w-8 h-8 text-gray-200" />
                                    <p className="text-sm text-gray-400 font-medium">No items extracted</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Details / Metadata Tab */}
                    {activeTab === "metadata" && (
                        <div className="p-4 space-y-3">
                            {/* Basic Info */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 divide-y divide-gray-50">
                                <MetaRow
                                    label="Store"
                                    icon={<Store className="w-3.5 h-3.5" />}
                                    value={receipt.storeName}
                                />
                                <MetaRow
                                    label="Purchase Date"
                                    icon={<Calendar className="w-3.5 h-3.5" />}
                                    value={receipt.purchaseDate ? format(new Date(receipt.purchaseDate), "PPP") : null}
                                />
                                <MetaRow
                                    label="Uploaded"
                                    icon={<Calendar className="w-3.5 h-3.5" />}
                                    value={format(new Date(receipt.createdAt), "dd MMM yyyy, hh:mm a")}
                                />
                                <MetaRow
                                    label="Total"
                                    icon={<IndianRupee className="w-3.5 h-3.5" />}
                                    value={
                                        receipt.totalAmount ? (
                                            <span className="text-[#7dab4f] font-extrabold text-base">
                                                ₹{Number(receipt.totalAmount).toFixed(2)}
                                            </span>
                                        ) : null
                                    }
                                />
                                {receipt.taxAmount && (
                                    <MetaRow
                                        label="Tax"
                                        icon={<IndianRupee className="w-3.5 h-3.5" />}
                                        value={`₹${Number(receipt.taxAmount).toFixed(2)}`}
                                    />
                                )}
                                {receipt.submittedBy && (
                                    <MetaRow
                                        label="Submitted By"
                                        icon={<User className="w-3.5 h-3.5" />}
                                        value={
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="text-sm font-semibold text-[#313131]">
                                                    {receipt.submittedBy.firstName} {receipt.submittedBy.lastName || ""}
                                                </span>
                                                <Avatar className="w-6 h-6 border shadow-sm">
                                                    <AvatarImage src={receipt.submittedBy.avatar || ""} />
                                                    <AvatarFallback className="bg-[#7dab4f] text-white text-[10px] font-bold">
                                                        {receipt.submittedBy.firstName?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                        }
                                    />
                                )}
                            </div>

                            {/* Annotation */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 divide-y divide-gray-50">
                                <MetaRow
                                    label="Description"
                                    icon={<AlignLeft className="w-3.5 h-3.5" />}
                                    value={receipt.description}
                                />
                                <MetaRow
                                    label="Tags"
                                    icon={<Tag className="w-3.5 h-3.5" />}
                                    value={
                                        tags.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5 justify-end">
                                                {tags.map((tag, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-flex items-center gap-1 bg-[#F3F0FD] text-[#7661d3] text-[11px] font-bold px-2 py-0.5 rounded-full border border-[#7661d3]/10"
                                                    >
                                                        <Tag className="w-2.5 h-2.5" />
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : null
                                    }
                                />
                            </div>

                            {/* System Info */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4">
                                <MetaRow
                                    label="Receipt ID"
                                    icon={<Hash className="w-3.5 h-3.5" />}
                                    value={<span className="font-mono text-[11px] text-gray-400 break-all">{receipt.id}</span>}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

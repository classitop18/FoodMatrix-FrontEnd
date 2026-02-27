"use client";

import { Receipt } from "@/services/receipt/types/receipt.types";
import { format } from "date-fns";
import {
    Store,
    FileText,
    ImageIcon,
    Calendar,
    IndianRupee,
    Tag,
    Pencil,
    Eye,
    ShoppingBag,
    User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReceiptCardProps {
    receipt: Receipt;
    onClick: (receipt: Receipt) => void;
    onTag: (receipt: Receipt) => void;
}

function getFileType(imageUrl?: string | null): "pdf" | "image" | "none" {
    if (!imageUrl) return "none";
    if (imageUrl.toLowerCase().includes(".pdf")) return "pdf";
    return "image";
}

export function ReceiptCard({ receipt, onClick, onTag }: ReceiptCardProps) {
    const fileType = getFileType(receipt.imageUrl);
    const tags = Array.isArray(receipt.tags) ? receipt.tags : [];
    const items = Array.isArray(receipt.items) ? receipt.items : [];

    const storeName =
        receipt.storeName && receipt.storeName !== "Unknown Store"
            ? receipt.storeName
            : "Scanned Receipt";

    const dateStr = receipt.purchaseDate
        ? format(new Date(receipt.purchaseDate), "dd MMM yyyy")
        : receipt.createdAt
            ? format(new Date(receipt.createdAt), "dd MMM yyyy")
            : "—";

    const isPdf = fileType === "pdf";

    return (
        <div
            className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#7661d3]/25 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
            onClick={() => onClick(receipt)}
        >
            {/* Top color band */}
            <div className={`h-1.5 w-full ${isPdf ? "bg-gradient-to-r from-[#7661d3] to-[#9b87e8]" : "bg-gradient-to-r from-[#7dab4f] to-[#a0c878]"}`} />

            {/* Card Body */}
            <div className="p-4 flex-1 flex flex-col gap-3">
                {/* Row 1: Icon + Store + Badge */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${isPdf ? "bg-[#F3F0FD]" : "bg-[#e8f5e0]"}`}>
                            {isPdf ? (
                                <FileText className="w-5 h-5 text-[#7661d3]" />
                            ) : fileType === "image" ? (
                                <ImageIcon className="w-5 h-5 text-[#7dab4f]" />
                            ) : (
                                <ShoppingBag className="w-5 h-5 text-gray-400" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="font-extrabold text-[#313131] text-sm truncate leading-tight">
                                {storeName}
                            </p>
                            {receipt.description ? (
                                <p className="text-xs text-[#7661d3]/80 font-medium truncate mt-0.5">
                                    {receipt.description}
                                </p>
                            ) : (
                                <p className="text-xs text-gray-400 truncate mt-0.5">No description added</p>
                            )}
                        </div>
                    </div>

                    <Badge
                        className={`text-[10px] font-bold px-2 py-0.5 flex-shrink-0 border-0 ${isPdf
                            ? "bg-[#F3F0FD] text-[#7661d3] hover:bg-[#F3F0FD]"
                            : fileType === "image"
                                ? "bg-[#e8f5e0] text-[#7dab4f] hover:bg-[#e8f5e0]"
                                : "bg-gray-100 text-gray-500"
                            }`}
                    >
                        {isPdf ? "PDF" : fileType === "image" ? "IMAGE" : "TEXT"}
                    </Badge>
                </div>

                {/* Row 2: Amount (prominent) */}
                {receipt.totalAmount && (
                    <div className="bg-gradient-to-r from-[#f8f7fc] to-[#f0fdf4] rounded-xl px-3 py-2.5 flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-semibold">Total Amount</span>
                        <div className="flex items-center gap-0.5 font-extrabold text-[#313131] text-base">
                            <IndianRupee className="w-3.5 h-3.5 text-[#7dab4f]" />
                            {Number(receipt.totalAmount).toFixed(2)}
                        </div>
                    </div>
                )}

                {/* Row 3: Date + Items */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium">{dateStr}</span>
                    </div>
                    {items.length > 0 && (
                        <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            {items.length} items
                        </span>
                    )}
                </div>

                {/* Row 4: Tags (if any) */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {tags.slice(0, 3).map((tag, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center gap-1 bg-[#F3F0FD] text-[#7661d3] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#7661d3]/10"
                            >
                                <Tag className="w-2.5 h-2.5" />
                                {tag}
                            </span>
                        ))}
                        {tags.length > 3 && (
                            <span className="text-[10px] text-gray-400 font-medium self-center">
                                +{tags.length - 3} more
                            </span>
                        )}
                    </div>
                )}

                {/* Submitter Info */}
                {receipt.submittedBy && (
                    <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-50">
                        <Avatar className="w-5 h-5">
                            <AvatarImage src={receipt.submittedBy.avatar || ""} />
                            <AvatarFallback className="bg-[#7661d3] text-white text-[9px] font-bold">
                                {receipt.submittedBy.firstName?.charAt(0) || <User className="w-3 h-3" />}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] font-medium text-gray-500">
                            {receipt.submittedBy.firstName} {receipt.submittedBy.lastName || ""}
                        </span>
                    </div>
                )}
            </div>

            {/* Card Footer / Actions */}
            <div className="px-4 pb-3 pt-0 flex items-center justify-between border-t border-gray-50 mt-auto">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onTag(receipt);
                    }}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#7661d3] font-semibold transition-colors py-1.5 px-2 rounded-lg hover:bg-[#F3F0FD]"
                >
                    <Pencil className="w-3 h-3" />
                    {receipt.description || tags.length > 0 ? "Edit" : "Add tags"}
                </button>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick(receipt);
                    }}
                    className="flex items-center gap-1.5 text-xs text-white bg-gradient-to-r from-[#7661d3] to-[#5a468a] hover:from-[#6450c2] hover:to-[#4a3878] font-bold transition-all py-1.5 px-3 rounded-lg shadow-sm group-hover:shadow-[#7661d3]/30 group-hover:shadow-md"
                >
                    <Eye className="w-3 h-3" />
                    View
                </button>
            </div>
        </div>
    );
}

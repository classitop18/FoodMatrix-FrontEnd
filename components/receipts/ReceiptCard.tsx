"use client";

import { useState } from "react";
import { Receipt, AuditedReceiptItem } from "@/services/receipt/types/receipt.types";
import { format } from "date-fns";
import {
    Store,
    FileText,
    ImageIcon,
    Calendar,
    DollarSign,
    Tag,
    Pencil,
    Eye,
    ShoppingBag,
    User,
    PackagePlus,
    CheckCircle2,
    Sparkles,
    Trash2,
    Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDeleteReceiptMutation } from "@/services/receipt/receipt.mutation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ReceiptCardProps {
    receipt: Receipt;
    onClick: (receipt: Receipt) => void;
    onTag: (receipt: Receipt) => void;
    onAddToPantry?: (receipt: Receipt) => void;
}

function getFileType(imageUrl?: string | null): "pdf" | "image" | "none" {
    if (!imageUrl) return "none";
    if (imageUrl.toLowerCase().includes(".pdf")) return "pdf";
    return "image";
}

export function ReceiptCard({ receipt, onClick, onTag, onAddToPantry }: ReceiptCardProps) {

    const fileType = getFileType(receipt.imageUrl);
    const tags = Array.isArray(receipt.tags) ? receipt.tags : [];
    const rawItems = Array.isArray(receipt.items) ? receipt.items : [];
    const aiItems: AuditedReceiptItem[] = Array.isArray(receipt.aiAuditedItems) ? receipt.aiAuditedItems : [];
    const hasAIItems = aiItems.length > 0;
    const hasFoodItems = aiItems.some(item => !["household", "other"].includes(item.category));
    const totalItems = hasAIItems ? aiItems.length : rawItems.length;

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

    // Count categories for AI items
    const categoryCount = hasAIItems
        ? new Set(aiItems.map((i) => i.category)).size
        : 0;

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [updateBudgetOpen, setUpdateBudgetOpen] = useState(false);
    const [budgetDate, setBudgetDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [budgetNote, setBudgetNote] = useState("");
    const [isUpdatingBudget, setIsUpdatingBudget] = useState(false);

    const deleteMutation = useDeleteReceiptMutation();

    const handleDelete = () => {
        deleteMutation.mutate(receipt.id, {
            onSuccess: () => {
                toast.success("Receipt deleted successfully");
                setDeleteOpen(false);
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Failed to delete receipt");
            }
        });
    };

    return (
        <div
            className="group relative bg-[#ffffff] rounded-[24px] p-5 flex flex-col min-h-[290px] border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_-4px_rgba(118,97,211,0.12)] hover:border-[#7661d3]/30 transition-all duration-500 cursor-pointer overflow-hidden"
            onClick={() => onClick(receipt)}
        >
            {/* Subtle Top-Right Ambient Gradient */}
            <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${isPdf ? "from-[#7661d3]/[0.08]" : fileType === "image" ? "from-[#7dab4f]/[0.08]" : "from-gray-300/[0.08]"} to-transparent rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-125 opacity-100 pointer-events-none`} />

            {/* Header: Icon + Info + Amount */}
            <div className="flex items-start justify-between gap-3 relative z-10 w-full mb-4">
                <div className="flex gap-3 min-w-0 flex-1">
                    <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0 shadow-sm border ${isPdf ? "bg-gradient-to-br from-[#F8F7FC] to-[#F3F0FD] border-[#7661d3]/10 text-[#7661d3]" : fileType === "image" ? "bg-gradient-to-br from-[#f8fcf5] to-[#e8f5e0] border-[#7dab4f]/10 text-[#7dab4f]" : "bg-gray-50 border-gray-100 text-gray-400"}`}>
                        {isPdf ? <FileText className="w-5 h-5" /> : fileType === "image" ? <ImageIcon className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col pt-0.5 justify-center">
                        <p className="font-extrabold text-[#1a1a1a] text-[15px] truncate leading-tight group-hover:text-[#7661d3] transition-colors">
                            {storeName}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 font-medium mt-1 gap-1.5 flex-wrap">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-[11px] h-[11px] text-gray-400 -mt-[1px]" />
                                {dateStr}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-300 mx-0.5" />
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isPdf ? "text-[#7661d3]" : fileType === "image" ? "text-[#7dab4f]" : "text-gray-400"}`}>
                                {isPdf ? "PDF" : fileType === "image" ? "IMG" : "TXT"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Top Right: Amount */}
                <div className="flex flex-col items-end flex-shrink-0 pl-2">
                    {receipt.totalAmount != null ? (
                        <div className="flex items-start font-black text-[#1a1a1a] tracking-tight">
                            <span className="text-[#a1a1aa] text-sm mt-[3px] mr-[1px]">$</span>
                            <span className="text-2xl">{Number(receipt.totalAmount).toFixed(2)}</span>
                        </div>
                    ) : (
                        <div className="font-bold text-gray-300 text-sm mt-1 italic">Pending</div>
                    )}
                    {hasAIItems && (
                        <Badge className="text-[9px] font-bold px-1.5 py-0 border-transparent bg-amber-50 text-amber-600 mt-0.5 shadow-none flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> AI
                        </Badge>
                    )}
                </div>
            </div>

            {/* Middle Section: Description & Tags */}
            <div className="flex flex-col flex-1 relative z-10 w-full mb-4">
                <div className="min-h-[3rem] mb-3">
                    {receipt.description ? (
                        <p className="text-[13px] text-gray-500 font-medium line-clamp-2 max-w-[95%] leading-relaxed">
                            {receipt.description}
                        </p>
                    ) : (
                        <p className="text-[13px] text-gray-400 italic">No description provided</p>
                    )}
                </div>

                {/* Stats / Badges */}
                <div className="flex items-center gap-2 flex-wrap mb-4">
                    {totalItems > 0 && (
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-600 font-bold bg-gray-50/80 px-2 py-1 rounded-md border border-gray-100">
                            <PackagePlus className="w-3.5 h-3.5 text-gray-400" />
                            {totalItems} items
                        </div>
                    )}
                    {categoryCount > 0 && (
                        <div className="flex items-center gap-1.5 text-[11px] text-[#7661d3] font-bold bg-[#F3F0FD]/80 px-2 py-1 rounded-md border border-[#7661d3]/10">
                            <Tag className="w-3.5 h-3.5" />
                            {categoryCount} cols
                        </div>
                    )}
                    {receipt.addedToPantry && (
                        <div className="flex items-center justify-center bg-green-50 w-[26px] h-[26px] rounded-full border border-green-200 shadow-sm ml-auto" title="Items in Pantry">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </div>
                    )}
                </div>

                {/* HashTags */}
                <div className="flex flex-wrap gap-1.5 mt-auto">
                    {tags.length > 0 ? (
                        <>
                            {tags.slice(0, 3).map((tag, i) => (
                                <span key={i} className="text-[10px] uppercase tracking-wide font-extrabold px-2 py-1 rounded-md text-[#7661d3]/70 bg-white border border-[#7661d3]/20 shadow-[0_1px_2px_rgba(0,0,0,0.02)] group-hover:border-[#7661d3]/40 group-hover:text-[#7661d3] transition-all">
                                    #{tag}
                                </span>
                            ))}
                            {tags.length > 3 && <span className="text-[10px] text-gray-400 font-bold self-center px-1">+{tags.length - 3}</span>}
                        </>
                    ) : (
                        <div className="h-[24px]" />
                    )}
                </div>
            </div>

            {/* Separator */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-100 to-transparent my-1" />

            {/* Footer: User + Actions */}
            <div className="pt-3 flex items-center justify-between relative z-10 w-full">
                {/* Left: User Avatar */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {receipt.submittedBy ? (
                        <>
                            <Avatar className="w-7 h-7 border-2 border-white shadow-sm">
                                <AvatarImage src={receipt.submittedBy.avatar || ""} />
                                <AvatarFallback className="bg-gradient-to-tr from-[#7661d3] to-[#9b87e8] text-white text-[9px] font-bold">
                                    {receipt.submittedBy.firstName?.charAt(0) || <User className="w-3 h-3" />}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-[12px] font-bold text-gray-600 truncate max-w-[70px]">
                                {receipt.submittedBy.firstName}
                            </span>
                        </>
                    ) : (
                        <div className="w-7" />
                    )}
                </div>

                {/* Right: Actions Row */}
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={(e) => { e.stopPropagation(); setUpdateBudgetOpen(true); }}
                        className="flex items-center bg-gradient-to-br from-[#7661d3] to-[#5a468a] text-white hover:from-[#6450c2] hover:to-[#4a3878] px-3 h-8 rounded-lg text-[10px] font-bold shadow-sm shadow-[#7661d3]/30 transition-all mr-1"
                    >
                        Update Budget
                    </button>

                    <div className="flex items-center bg-gray-50 p-0.5 rounded-[10px] border border-gray-100">
                        <button
                            onClick={(e) => { e.stopPropagation(); onTag(receipt); }}
                            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#7661d3] hover:bg-white rounded-lg transition-all"
                            title={receipt.description || tags.length > 0 ? "Edit Details" : "Add Tags"}
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {hasFoodItems && !receipt.addedToPantry && onAddToPantry && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onAddToPantry(receipt); }}
                                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#7dab4f] hover:bg-white rounded-lg transition-all"
                                title="Add to Pantry"
                            >
                                <PackagePlus className="w-3.5 h-3.5" />
                            </button>
                        )}

                        <button
                            onClick={(e) => { e.stopPropagation(); setDeleteOpen(true); }}
                            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                            title="Delete"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onClick(receipt); }}
                            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#7661d3] hover:bg-white rounded-lg transition-all"
                            title="View Detail"
                        >
                            <Eye className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent
                    className="bg-white rounded-2xl max-w-[400px] p-6 border border-gray-100 shadow-xl"
                    onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to card
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-extrabold text-[#313131] flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                                <Trash2 className="w-5 h-5 text-red-500" />
                            </div>
                            Delete Receipt?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-gray-500 mt-2 font-medium">
                            This will permanently delete the <span className="font-bold text-[#313131]">"{storeName}"</span> receipt and all its extracted data. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 gap-3 sm:gap-2">
                        <AlertDialogCancel
                            className="rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold px-6 py-2.5 h-auto m-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                setDeleteOpen(false);
                            }}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDelete();
                            }}
                            disabled={deleteMutation.isPending}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold border-0 px-6 py-2.5 h-auto m-0 shadow-sm shadow-red-500/20 flex items-center"
                        >
                            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Delete Receipt
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Update Budget Modal */}
            <Dialog open={updateBudgetOpen} onOpenChange={setUpdateBudgetOpen}>
                <DialogContent
                    className="bg-white rounded-2xl max-w-[400px] border border-gray-100 shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <DialogHeader>
                        <DialogTitle className="text-xl font-extrabold text-[#313131] flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#F3F0FD] flex items-center justify-center flex-shrink-0">
                                <DollarSign className="w-5 h-5 text-[#7661d3]" />
                            </div>
                            Update Budget
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="date" className="text-sm font-bold text-gray-700">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={budgetDate}
                                onChange={(e) => setBudgetDate(e.target.value)}
                                className="rounded-xl border-gray-200 focus-visible:ring-[#7661d3]"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="note" className="text-sm font-bold text-gray-700">Note</Label>
                            <Textarea
                                id="note"
                                placeholder="Add a note for this budget update..."
                                value={budgetNote}
                                onChange={(e) => setBudgetNote(e.target.value)}
                                className="rounded-xl border-gray-200 focus-visible:ring-[#7661d3] resize-none min-h-[100px]"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-3 sm:gap-2">
                        <button
                            type="button"
                            className="rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold px-6 py-2.5 shadow-sm transition-all"
                            onClick={(e) => {
                                e.stopPropagation();
                                setUpdateBudgetOpen(false);
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={isUpdatingBudget || !budgetDate}
                            className="bg-gradient-to-br from-[#7661d3] to-[#5a468a] hover:from-[#6450c2] hover:to-[#4a3878] text-white rounded-xl font-bold px-6 py-2.5 shadow-sm shadow-[#7661d3]/30 flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            onClick={async (e) => {
                                e.stopPropagation();
                                setIsUpdatingBudget(true);
                                // For now, just simulate an API call
                                await new Promise(resolve => setTimeout(resolve, 800));
                                toast.success("Budget updated successfully!");
                                setIsUpdatingBudget(false);
                                setUpdateBudgetOpen(false);
                                setBudgetNote("");
                            }}
                        >
                            {isUpdatingBudget ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Update Budget
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

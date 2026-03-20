"use client";

import { useState, useMemo } from "react";
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
import { useLogExpenseFromReceiptMutation } from "@/services/budget/budget.mutation";
import { useSelector } from "react-redux";
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
    const categoryCount = hasAIItems ? new Set(aiItems.map((i) => i.category)).size : 0;

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [updateBudgetOpen, setUpdateBudgetOpen] = useState(false);
    const [budgetDate, setBudgetDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [budgetNote, setBudgetNote] = useState("");

    const deleteMutation = useDeleteReceiptMutation();
    const logExpenseFromReceiptMutation = useLogExpenseFromReceiptMutation();
    const accountId = useSelector((state: any) => state?.account?.activeAccountId);

    const foodItemsPreview = useMemo(() => {
        const foodItems = aiItems.filter(item => !["household", "other"].includes(item.category));
        const total = foodItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
        return { count: foodItems.length, total };
    }, [aiItems]);

    const handleDelete = () => {
        deleteMutation.mutate(receipt.id, {
            onSuccess: () => { toast.success("Receipt deleted successfully"); setDeleteOpen(false); },
            onError: (err: any) => { toast.error(err?.response?.data?.message || "Failed to delete receipt"); },
        });
    };

    const handleUpdateBudget = () => {
        if (!accountId) { toast.error("No active account found"); return; }
        logExpenseFromReceiptMutation.mutate(
            { accountId, payload: { receiptId: receipt.id, date: budgetDate, note: budgetNote || undefined } },
            {
                onSuccess: (data: any) => {
                    toast.success(`$${data.foodTotal?.toFixed(2) || "0.00"} deducted from budget for ${budgetDate}`);
                    setUpdateBudgetOpen(false);
                    setBudgetNote("");
                },
                onError: (err: any) => { toast.error(err?.response?.data?.message || "Failed to update budget"); },
            }
        );
    };

    return (
        <div
            className="group relative bg-white rounded-[24px] border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_28px_-4px_rgba(118,97,211,0.14)] hover:border-[#7661d3]/30 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
            onClick={() => onClick(receipt)}
        >
            {/* Ambient glow */}
            <div className={`pointer-events-none absolute -top-10 -right-10 w-36 h-36 rounded-full bg-gradient-to-bl ${isPdf ? "from-[#7661d3]/10" : fileType === "image" ? "from-[#7dab4f]/10" : "from-gray-300/10"} to-transparent group-hover:scale-125 transition-transform duration-700`} />

            {/* ── HEADER ── */}
            <div className="flex items-start gap-3 px-5 pt-5 pb-4 relative z-10">

                {/* Icon */}
                <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 border shadow-sm ${isPdf
                    ? "bg-gradient-to-br from-[#F8F7FC] to-[#EDE9FB] border-[#7661d3]/15 text-[#7661d3]"
                    : fileType === "image"
                        ? "bg-gradient-to-br from-[#f5fbf0] to-[#e4f5d4] border-[#7dab4f]/15 text-[#7dab4f]"
                        : "bg-gray-50 border-gray-100 text-gray-400"
                    }`}>
                    {isPdf
                        ? <FileText className="w-[18px] h-[18px]" />
                        : fileType === "image"
                            ? <ImageIcon className="w-[18px] h-[18px]" />
                            : <ShoppingBag className="w-[18px] h-[18px]" />
                    }
                </div>

                {/* Store + date row */}
                <div className="flex-1 min-w-0 pt-0.5">
                    <p className="font-extrabold text-[15px] text-[#1a1a1a] truncate leading-snug group-hover:text-[#7661d3] transition-colors duration-200">
                        {storeName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                            <Calendar className="w-3 h-3" />
                            {dateStr}
                        </span>
                        <span className="w-[3px] h-[3px] rounded-full bg-gray-200" />
                        <span className={`text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded-md ${isPdf ? "bg-[#EDE9FB] text-[#7661d3]"
                            : fileType === "image" ? "bg-[#e4f5d4] text-[#7dab4f]"
                                : "bg-gray-100 text-gray-400"
                            }`}>
                            {isPdf ? "PDF" : fileType === "image" ? "IMG" : "TXT"}
                        </span>
                        {hasAIItems && (
                            <span className="flex items-center gap-0.5 text-[9px] font-extrabold text-amber-500 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded-md">
                                <Sparkles className="w-2.5 h-2.5" />
                                AI
                            </span>
                        )}
                    </div>
                </div>

                {/* Amount */}
                <div className="flex-shrink-0 pt-0.5 text-right">
                    {receipt.totalAmount != null ? (
                        <div className="flex items-start justify-end leading-none">
                            <span className="text-[#a1a1aa] text-xs font-semibold mt-[3px] mr-0.5">$</span>
                            <span className="text-[22px] font-black text-[#1a1a1a] tracking-tight leading-none">
                                {Number(receipt.totalAmount).toFixed(2)}
                            </span>
                        </div>
                    ) : (
                        <span className="text-xs font-semibold text-gray-300 italic">Pending</span>
                    )}
                </div>
            </div>

            {/* ── DIVIDER ── */}
            <div className="h-px mx-5 bg-gray-100" />

            {/* ── BODY: Description + Chips + Tags ── */}
            <div className="flex flex-col flex-1 px-5 py-4 gap-3 relative z-10">

                {/* Description */}
                <p className={`text-[12.5px] leading-relaxed line-clamp-2 ${receipt.description ? "text-gray-500" : "text-gray-300 italic"}`}>
                    {receipt.description || "No description provided"}
                </p>

                {/* Stat chips */}
                <div className="flex items-center flex-wrap gap-1.5">
                    {totalItems > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">
                            <PackagePlus className="w-3 h-3 text-gray-400" />
                            {totalItems} items
                        </span>
                    )}
                    {categoryCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7661d3] bg-[#F3F0FD] border border-[#7661d3]/15 px-2 py-1 rounded-lg">
                            <Tag className="w-3 h-3" />
                            {categoryCount} {categoryCount === 1 ? "category" : "categories"}
                        </span>
                    )}
                    {receipt.addedToPantry && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-1 rounded-lg">
                            <CheckCircle2 className="w-3 h-3" />
                            In Pantry
                        </span>
                    )}
                    {receipt.isBudgetDeducted && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-1 rounded-lg">
                            <CheckCircle2 className="w-3 h-3" />
                            Budget Deducted
                        </span>
                    )}
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-auto">
                        {tags.slice(0, 3).map((tag, i) => (
                            <span
                                key={i}
                                className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md text-[#7661d3]/70 bg-white border border-[#7661d3]/20 group-hover:border-[#7661d3]/40 group-hover:text-[#7661d3] transition-all"
                            >
                                #{tag}
                            </span>
                        ))}
                        {tags.length > 3 && (
                            <span className="text-[10px] font-semibold text-gray-400 self-center px-1">
                                +{tags.length - 3}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* ── DIVIDER ── */}
            <div className="h-px mx-5 bg-gray-100" />

            {/* ── FOOTER: User + Actions ── */}
            <div className="flex items-center justify-between gap-2 px-5 py-3 relative z-10">

                {/* Submitted by */}
                {receipt.submittedBy ? (
                    <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                        <Avatar className="w-7 h-7 border-2 border-white shadow-sm flex-shrink-0">
                            <AvatarImage src={receipt.submittedBy.avatar || ""} />
                            <AvatarFallback className="bg-gradient-to-tr from-[#7661d3] to-[#9b87e8] text-white text-[9px] font-bold">
                                {receipt.submittedBy.firstName?.charAt(0) || <User className="w-3 h-3" />}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-[11px] font-semibold text-gray-500 truncate max-w-[72px]">
                            {receipt.submittedBy.firstName}
                        </span>
                    </div>
                ) : (
                    <div className="w-7 h-7" />
                )}

                {/* Action controls */}
                <div className="flex items-center gap-1.5">
                    {/* Budget button */}
                    {receipt.isBudgetDeducted ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-3 h-8 rounded-lg cursor-default">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Deducted
                        </span>
                    ) : (
                        <button
                            onClick={(e) => { e.stopPropagation(); setUpdateBudgetOpen(true); }}
                            className="inline-flex items-center text-[10px] font-bold text-white bg-gradient-to-br from-[#7661d3] to-[#5a468a] hover:from-[#6450c2] hover:to-[#4a3878] px-3 h-8 rounded-lg shadow-sm shadow-[#7661d3]/20 transition-all"
                        >
                            Update Budget
                        </button>
                    )}

                    {/* Icon row */}
                    <div className="flex items-center gap-0.5 bg-gray-50 border border-gray-100 rounded-xl p-[3px]">
                        <button
                            onClick={(e) => { e.stopPropagation(); onTag(receipt); }}
                            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#7661d3] hover:bg-white rounded-lg transition-all"
                            title="Edit Details"
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

            {/* ════════════════════════
                DELETE DIALOG
            ════════════════════════ */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent
                    className="bg-white rounded-2xl max-w-[400px] p-6 border border-gray-100 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-3 text-xl font-extrabold text-[#313131]">
                            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                                <Trash2 className="w-5 h-5 text-red-500" />
                            </div>
                            Delete Receipt?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-gray-500 leading-relaxed mt-2">
                            This will permanently delete{" "}
                            <span className="font-semibold text-[#313131]">"{storeName}"</span>{" "}
                            and all its extracted data. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 flex gap-2 sm:gap-2">
                        <AlertDialogCancel
                            className="flex-1 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold h-10 m-0"
                            onClick={(e) => { e.stopPropagation(); setDeleteOpen(false); }}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(); }}
                            disabled={deleteMutation.isPending}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold border-0 h-10 m-0 inline-flex items-center justify-center gap-2"
                        >
                            {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Delete Receipt
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ════════════════════════
                UPDATE BUDGET DIALOG
            ════════════════════════ */}
            <Dialog open={updateBudgetOpen} onOpenChange={setUpdateBudgetOpen}>
                <DialogContent
                    className="bg-white rounded-2xl max-w-[400px] border border-gray-100 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl font-extrabold text-[#313131]">
                            <div className="w-10 h-10 rounded-xl bg-[#F3F0FD] border border-[#7661d3]/10 flex items-center justify-center flex-shrink-0">
                                <DollarSign className="w-5 h-5 text-[#7661d3]" />
                            </div>
                            Update Budget
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 py-4">
                        {foodItemsPreview.count > 0 && (
                            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#F3F0FD] to-[#f8f7ff] rounded-xl border border-[#7661d3]/10">
                                <div>
                                    <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#7661d3]/50 mb-0.5">Food Items</p>
                                    <p className="text-sm font-bold text-[#7661d3]">{foodItemsPreview.count} items</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#7661d3]/50 mb-0.5">Amount</p>
                                    <p className="text-xl font-black text-[#7661d3]">${foodItemsPreview.total.toFixed(2)}</p>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-1.5">
                            <Label htmlFor="budget-date" className="text-xs font-bold text-gray-600 uppercase tracking-wide">Date</Label>
                            <Input
                                id="budget-date"
                                type="date"
                                value={budgetDate}
                                onChange={(e) => setBudgetDate(e.target.value)}
                                className="rounded-xl border-gray-200 focus-visible:ring-[#7661d3] h-10"
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="budget-note" className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                                Note <span className="font-normal normal-case text-gray-400">(optional)</span>
                            </Label>
                            <Textarea
                                id="budget-note"
                                placeholder="Add a note for this budget entry…"
                                value={budgetNote}
                                onChange={(e) => setBudgetNote(e.target.value)}
                                className="rounded-xl border-gray-200 focus-visible:ring-[#7661d3] resize-none min-h-[88px] text-sm"
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2 sm:gap-2">
                        <button
                            type="button"
                            className="flex-1 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold h-10 text-sm transition-all"
                            onClick={(e) => { e.stopPropagation(); setUpdateBudgetOpen(false); }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={logExpenseFromReceiptMutation.isPending || !budgetDate || foodItemsPreview.count === 0}
                            className="flex-1 bg-gradient-to-br from-[#7661d3] to-[#5a468a] hover:from-[#6450c2] hover:to-[#4a3878] text-white rounded-xl font-bold h-10 text-sm inline-flex items-center justify-center gap-2 shadow-sm shadow-[#7661d3]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            onClick={(e) => { e.stopPropagation(); handleUpdateBudget(); }}
                        >
                            {logExpenseFromReceiptMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Deduct ${foodItemsPreview.total.toFixed(2)}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
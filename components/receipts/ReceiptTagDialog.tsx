"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import { Receipt, UpdateReceiptPayload } from "@/services/receipt/types/receipt.types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUpdateReceiptMutation } from "@/services/receipt/receipt.mutation";
import { toast } from "sonner";
import { Tag, X, Loader2, Store } from "lucide-react";

interface ReceiptTagDialogProps {
    receipt: Receipt | null;
    open: boolean;
    onClose: () => void;
}

export function ReceiptTagDialog({ receipt, open, onClose }: ReceiptTagDialogProps) {
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");

    const updateMutation = useUpdateReceiptMutation();

    // Sync when receipt changes
    useEffect(() => {
        if (receipt) {
            setDescription(receipt.description || "");
            setTags(Array.isArray(receipt.tags) ? receipt.tags : []);
            setTagInput("");
        }
    }, [receipt]);

    const addTag = () => {
        const trimmed = tagInput.trim().toLowerCase();
        if (trimmed && !tags.includes(trimmed)) {
            setTags((prev) => [...prev, trimmed]);
        }
        setTagInput("");
    };

    const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag();
        } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
            setTags((prev) => prev.slice(0, -1));
        }
    };

    const removeTag = (index: number) => {
        setTags((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (!receipt) return;

        // Also add any pending tag input
        const finalTags = [...tags];
        if (tagInput.trim()) {
            const trimmed = tagInput.trim().toLowerCase();
            if (!finalTags.includes(trimmed)) finalTags.push(trimmed);
        }

        const payload: UpdateReceiptPayload = {
            description: description.trim() || null,
            tags: finalTags,
        };

        updateMutation.mutate(
            { id: receipt.id, data: payload },
            {
                onSuccess: () => {
                    toast.success("Receipt tags updated!");
                    onClose();
                },
                onError: (err: any) => {
                    toast.error(err?.response?.data?.message || "Failed to update receipt");
                },
            }
        );
    };

    if (!receipt) return null;

    const storeName =
        receipt.storeName && receipt.storeName !== "Unknown Store"
            ? receipt.storeName
            : "Scanned Receipt";

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6 border border-gray-100 shadow-xl">
                <DialogHeader className="pb-2">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F3F0FD] to-[#e8f5e0] flex items-center justify-center flex-shrink-0">
                            <Store className="w-5 h-5 text-[#7661d3]" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-extrabold text-[#313131]">
                                Annotate Receipt
                            </DialogTitle>
                            <p className="text-xs text-gray-500 mt-0.5 font-medium">{storeName}</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 font-medium">
                        Add a description and tags to help identify what this shopping was for.
                    </p>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    {/* Description */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                            Description
                        </Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Weekly groceries for family, Diwali party supplies, Birthday dinner..."
                            className="resize-none h-20 text-sm border-gray-200 rounded-xl focus-visible:ring-1 focus-visible:ring-[#7661d3] focus-visible:border-[#7661d3] bg-gray-50/50 shadow-none font-medium text-[#313131]"
                            maxLength={300}
                        />
                        <p className="text-right text-[11px] text-gray-400 font-medium">{description.length}/300</p>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                            Tags
                        </Label>

                        <div className="min-h-[52px] px-3 py-2 border border-gray-200 rounded-xl bg-gray-50/50 focus-within:border-[#7661d3] focus-within:ring-1 focus-within:ring-[#7661d3] transition-all flex flex-wrap gap-1.5 items-center">
                            {tags.map((tag, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center gap-1 bg-[#F3F0FD] text-[#7661d3] text-xs font-bold px-2.5 py-1 rounded-full border border-[#7661d3]/10"
                                >
                                    <Tag className="w-3 h-3" />
                                    {tag}
                                    <button
                                        onClick={() => removeTag(i)}
                                        className="ml-0.5 hover:text-red-500 hover:bg-red-50 rounded-full p-0.5 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            <input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                onBlur={addTag}
                                placeholder={tags.length === 0 ? "Type a tag and press Enter..." : "Add more..."}
                                className="flex-1 min-w-[120px] bg-transparent text-sm font-medium text-[#313131] outline-none placeholder:text-gray-400"
                            />
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium">
                            Press <kbd className="bg-gray-100 px-1 py-0.5 border border-gray-200 shadow-sm rounded text-[10px] font-mono text-gray-600">Enter</kbd> or <kbd className="bg-gray-100 px-1 py-0.5 border border-gray-200 shadow-sm rounded text-[10px] font-mono text-gray-600">,</kbd> to add a tag
                        </p>
                    </div>
                </div>

                <DialogFooter className="mt-6 gap-3 sm:gap-2">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold px-6 py-2.5 h-auto m-0"
                        disabled={updateMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="rounded-xl bg-gradient-to-r from-[#7661d3] to-[#5a468a] hover:from-[#6450c2] hover:to-[#4a3878] text-white font-bold border-0 px-6 py-2.5 h-auto m-0 shadow-sm shadow-[#7661d3]/20 flex items-center"
                        disabled={updateMutation.isPending}
                    >
                        {updateMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

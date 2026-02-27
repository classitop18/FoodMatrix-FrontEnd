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
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader className="pb-2">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F3F0FD] to-[#e8f5e0] flex items-center justify-center flex-shrink-0">
                            <Store className="w-4 h-4 text-[#7661d3]" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-[#313131]">
                                Annotate Receipt
                            </DialogTitle>
                            <p className="text-xs text-gray-400 mt-0.5">{storeName}</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
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
                            className="resize-none h-20 text-sm border-gray-200 rounded-xl focus:border-[#7661d3] bg-gray-50/50"
                            maxLength={300}
                        />
                        <p className="text-right text-[11px] text-gray-400">{description.length}/300</p>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                            Tags
                        </Label>

                        <div className="min-h-[52px] px-3 py-2 border border-gray-200 rounded-xl bg-gray-50/50 focus-within:border-[#7661d3] focus-within:ring-1 focus-within:ring-[#7661d3]/20 transition-all flex flex-wrap gap-1.5 items-center">
                            {tags.map((tag, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center gap-1 bg-[#F3F0FD] text-[#7661d3] text-[11px] font-semibold px-2 py-1 rounded-full"
                                >
                                    <Tag className="w-2.5 h-2.5" />
                                    {tag}
                                    <button
                                        onClick={() => removeTag(i)}
                                        className="ml-0.5 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-2.5 h-2.5" />
                                    </button>
                                </span>
                            ))}
                            <input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                onBlur={addTag}
                                placeholder={tags.length === 0 ? "Type a tag and press Enter..." : "Add more..."}
                                className="flex-1 min-w-[120px] bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-400"
                            />
                        </div>
                        <p className="text-[11px] text-gray-400">
                            Press <kbd className="bg-gray-100 px-1 rounded text-[10px]">Enter</kbd> or <kbd className="bg-gray-100 px-1 rounded text-[10px]">,</kbd> to add a tag
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2 pt-2">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        disabled={updateMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="rounded-xl bg-gradient-to-r from-[#7661d3] to-[#3d326d] hover:from-[#6450c2] hover:to-[#2c2352] text-white shadow-md"
                        disabled={updateMutation.isPending}
                    >
                        {updateMutation.isPending ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
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

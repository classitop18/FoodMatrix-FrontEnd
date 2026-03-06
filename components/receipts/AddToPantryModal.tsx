"use client";

import { useState, useEffect, useCallback } from "react";
import { AuditedReceiptItem, ExpirySuggestion } from "@/services/receipt/types/receipt.types";
import { useAddToPantryMutation } from "@/services/receipt/receipt.mutation";
import { ReceiptService } from "@/services/receipt/receipt.service";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
    Loader2,
    PackagePlus,
    Calendar,
    MapPin,
    CheckCircle2,
    Sparkles,
    ShoppingBag,
    ChevronDown,
    ChevronUp,
    Package,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";

const receiptService = new ReceiptService();

interface PantryItemEntry {
    name: string;
    quantity: number;
    unit: string;
    price?: number;
    category: string;
    location: string;
    expirationDate: string;
    selected: boolean;
}

interface AddToPantryModalProps {
    open: boolean;
    onClose: () => void;
    receiptId: string;
    items: AuditedReceiptItem[];
    onSuccess?: () => void;
}

const STORAGE_LOCATIONS = [
    { value: "refrigerator", label: "Refrigerator", emoji: "🧊" },
    { value: "freezer", label: "Freezer", emoji: "❄️" },
    { value: "pantry", label: "Pantry", emoji: "🏪" },
    { value: "cabinet", label: "Cabinet", emoji: "🗄️" },
    { value: "countertop", label: "Countertop", emoji: "🍎" },
];

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; border: string; emoji: string }> = {
    food: { color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", emoji: "🍽️" },
    snacks: { color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200", emoji: "🍿" },
    beverages: { color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", emoji: "🥤" },
    dairy: { color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200", emoji: "🥛" },
    produce: { color: "text-green-700", bg: "bg-green-50", border: "border-green-200", emoji: "🥬" },
    meat: { color: "text-red-700", bg: "bg-red-50", border: "border-red-200", emoji: "🥩" },
    bakery: { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", emoji: "🍞" },
    spices: { color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", emoji: "🌶️" },
    frozen: { color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200", emoji: "🧊" },
    household: { color: "text-gray-700", bg: "bg-gray-50", border: "border-gray-200", emoji: "🏠" },
    other: { color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200", emoji: "📦" },
};

function getDefaultLocation(category: string): string {
    const map: Record<string, string> = {
        dairy: "refrigerator",
        produce: "refrigerator",
        meat: "freezer",
        frozen: "freezer",
        snacks: "pantry",
        food: "pantry",
        beverages: "pantry",
        bakery: "countertop",
        spices: "cabinet",
        household: "cabinet",
        other: "pantry",
    };
    return map[category] || "pantry";
}

function getDefaultExpiryDays(category: string): number {
    const map: Record<string, number> = {
        produce: 5,
        dairy: 7,
        meat: 3,
        bakery: 5,
        frozen: 90,
        beverages: 180,
        snacks: 90,
        food: 30,
        spices: 365,
        household: 730,
        other: 30,
    };
    return map[category] || 30;
}

export function AddToPantryModal({
    open,
    onClose,
    receiptId,
    items,
    onSuccess,
}: AddToPantryModalProps) {
    const [pantryItems, setPantryItems] = useState<PantryItemEntry[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [success, setSuccess] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const addToPantryMutation = useAddToPantryMutation();

    // Filter out household items by default — only food-related items go to pantry
    const foodCategories = ["food", "snacks", "beverages", "dairy", "produce", "meat", "bakery", "spices", "frozen"];

    const initializeItems = useCallback(() => {
        const entries: PantryItemEntry[] = items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            price: item.price,
            category: item.category,
            location: getDefaultLocation(item.category),
            expirationDate: format(
                addDays(new Date(), getDefaultExpiryDays(item.category)),
                "yyyy-MM-dd"
            ),
            selected: foodCategories.includes(item.category),
        }));
        setPantryItems(entries);
    }, [items]);

    useEffect(() => {
        if (open && items.length > 0) {
            initializeItems();
            setSuccess(false);
            setExpandedIndex(null);
            loadExpirySuggestions();
        }
    }, [open, items]);

    const loadExpirySuggestions = async () => {
        setLoadingSuggestions(true);
        try {
            const suggestions = await receiptService.getExpirySuggestions(receiptId);
            setPantryItems((prev) =>
                prev.map((item) => {
                    const suggestion = suggestions.find(
                        (s) => s.name.toLowerCase() === item.name.toLowerCase()
                    );
                    if (suggestion) {
                        return {
                            ...item,
                            location: suggestion.storageLocation,
                            expirationDate: format(
                                addDays(new Date(), suggestion.suggestedExpiryDays),
                                "yyyy-MM-dd"
                            ),
                        };
                    }
                    return item;
                })
            );
        } catch {
            // Silently fail — defaults already set
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const toggleItem = (index: number) => {
        setPantryItems((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, selected: !item.selected } : item
            )
        );
    };

    const updateItem = (index: number, field: keyof PantryItemEntry, value: any) => {
        setPantryItems((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        );
    };

    const selectAll = () => {
        setPantryItems((prev) => prev.map((item) => ({ ...item, selected: true })));
    };

    const deselectAll = () => {
        setPantryItems((prev) => prev.map((item) => ({ ...item, selected: false })));
    };

    const selectedCount = pantryItems.filter((i) => i.selected).length;

    const handleConfirm = () => {
        const selectedItems = pantryItems
            .filter((item) => item.selected)
            .map((item) => ({
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                price: item.price,
                category: item.category,
                location: item.location,
                expirationDate: item.expirationDate || null,
            }));

        if (selectedItems.length === 0) {
            toast.error("Please select at least one item");
            return;
        }

        addToPantryMutation.mutate(
            { receiptId, payload: { items: selectedItems } },
            {
                onSuccess: (data) => {
                    setSuccess(true);
                    toast.success(
                        `${data.addedCount} items added to pantry!`
                    );
                    if (data.errors && data.errors.length > 0) {
                        toast.warning(`${data.errors.length} items had issues`);
                    }
                    onSuccess?.();
                },
                onError: (err: any) => {
                    toast.error(
                        err?.response?.data?.message || "Failed to add items to pantry"
                    );
                },
            }
        );
    };

    if (success) {
        return (
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[480px] rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="flex flex-col items-center justify-center py-14 px-8 text-center bg-gradient-to-b from-white to-[#f0fdf4]">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#7dab4f] to-[#5a8c3e] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#7dab4f]/25 rotate-3">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-xl font-extrabold text-[#313131] mb-2">
                            Added to Pantry!
                        </h3>
                        <p className="text-sm text-gray-500 mb-8 max-w-[280px] leading-relaxed">
                            {selectedCount} items have been successfully added to your
                            pantry inventory.
                        </p>
                        <Button
                            onClick={onClose}
                            className="bg-gradient-to-r from-[#7661d3] to-[#5a468a] text-white font-bold rounded-xl px-10 py-5 shadow-md shadow-[#7661d3]/25 hover:shadow-lg transition-all"
                        >
                            Done
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[620px] max-h-[90vh] rounded-2xl p-0 overflow-hidden flex flex-col gap-0 border-0 shadow-2xl">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-5 bg-gradient-to-br from-[#3d326d] via-[#5a468a] to-[#7661d3] flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                            <PackagePlus className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-white font-extrabold text-base leading-tight">
                                Add to Pantry
                            </DialogTitle>
                            <p className="text-white/55 text-xs mt-1 font-medium">
                                Select items and customize storage details before adding
                            </p>
                        </div>
                    </div>
                    {loadingSuggestions && (
                        <div className="flex items-center gap-2 mt-4 bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 backdrop-blur-sm">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                            <span className="text-white/80 text-xs font-medium">
                                AI is suggesting expiry dates & storage locations...
                            </span>
                        </div>
                    )}
                </DialogHeader>

                {/* Select/Deselect bar */}
                <div className="px-6 py-3 bg-white border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold",
                            selectedCount > 0
                                ? "bg-[#7661d3] text-white"
                                : "bg-gray-100 text-gray-400"
                        )}>
                            {selectedCount}
                        </div>
                        <span className="text-xs font-semibold text-gray-500">
                            of {pantryItems.length} items selected
                        </span>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={selectAll}
                            className="text-xs text-[#7661d3] font-bold hover:bg-[#F3F0FD] px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                            Select All
                        </button>
                        <button
                            onClick={deselectAll}
                            className="text-xs text-gray-400 font-bold hover:bg-gray-50 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0 bg-[#fafafa]">
                    {pantryItems.map((item, index) => {
                        const catConfig = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.other;
                        const isExpanded = expandedIndex === index;
                        const locationInfo = STORAGE_LOCATIONS.find(l => l.value === item.location);

                        return (
                            <div
                                key={index}
                                className={cn(
                                    "rounded-xl border transition-all duration-200",
                                    item.selected
                                        ? "border-[#7661d3]/20 bg-white shadow-sm hover:shadow-md"
                                        : "border-gray-100 bg-gray-50/80 opacity-50 hover:opacity-70"
                                )}
                            >
                                {/* Item header row */}
                                <div className="flex items-center gap-3 px-4 py-3">
                                    <Checkbox
                                        checked={item.selected}
                                        onCheckedChange={() => toggleItem(index)}
                                        className="data-[state=checked]:bg-[#7661d3] data-[state=checked]:border-[#7661d3] flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-[#313131] truncate">
                                                {item.name}
                                            </span>
                                            <span
                                                className={cn(
                                                    "text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 flex-shrink-0",
                                                    catConfig.bg, catConfig.color, catConfig.border
                                                )}
                                            >
                                                <span className="text-[9px]">{catConfig.emoji}</span>
                                                {item.category}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            {item.price !== undefined && item.price > 0 && (
                                                <span className="text-xs text-[#7dab4f] font-semibold">
                                                    ${item.price.toFixed(2)}
                                                </span>
                                            )}
                                            <span className="text-[11px] text-gray-400 font-medium">
                                                {item.quantity} {item.unit}
                                            </span>
                                            {locationInfo && (
                                                <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                                                    <span className="text-[10px]">{locationInfo.emoji}</span>
                                                    {locationInfo.label}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Expand toggle (only when selected) */}
                                    {item.selected && (
                                        <button
                                            onClick={() => setExpandedIndex(isExpanded ? null : index)}
                                            className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-[#F3F0FD] flex items-center justify-center transition-colors flex-shrink-0"
                                        >
                                            {isExpanded ? (
                                                <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                            )}
                                        </button>
                                    )}
                                </div>

                                {/* Editable fields — shown only when selected AND expanded */}
                                {item.selected && isExpanded && (
                                    <div className="px-4 pb-4 pt-1 border-t border-gray-50">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                                            {/* Quantity */}
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                                    <Package className="w-2.5 h-2.5" /> Qty
                                                </Label>
                                                <Input
                                                    type="number"
                                                    min={0.1}
                                                    step={0.1}
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        updateItem(
                                                            index,
                                                            "quantity",
                                                            parseFloat(e.target.value) || 1
                                                        )
                                                    }
                                                    className="h-9 text-xs rounded-lg border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#7661d3] transition-colors"
                                                />
                                            </div>
                                            {/* Unit */}
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                    Unit
                                                </Label>
                                                <Input
                                                    value={item.unit}
                                                    onChange={(e) =>
                                                        updateItem(index, "unit", e.target.value)
                                                    }
                                                    className="h-9 text-xs rounded-lg border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#7661d3] transition-colors"
                                                />
                                            </div>
                                            {/* Storage Location */}
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                                    <MapPin className="w-2.5 h-2.5" /> Storage
                                                </Label>
                                                <Select
                                                    value={item.location}
                                                    onValueChange={(v) =>
                                                        updateItem(index, "location", v)
                                                    }
                                                >
                                                    <SelectTrigger className="h-9 text-xs rounded-lg border-gray-200 bg-gray-50/50 focus:bg-white">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {STORAGE_LOCATIONS.map((loc) => (
                                                            <SelectItem
                                                                key={loc.value}
                                                                value={loc.value}
                                                                className="text-xs"
                                                            >
                                                                {loc.emoji} {loc.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {/* Expiry Date */}
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                                    <Calendar className="w-2.5 h-2.5" /> Expiry
                                                </Label>
                                                <Input
                                                    type="date"
                                                    value={item.expirationDate}
                                                    onChange={(e) =>
                                                        updateItem(
                                                            index,
                                                            "expirationDate",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="h-9 text-xs rounded-lg border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#7661d3] transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {pantryItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                                <ShoppingBag className="w-7 h-7 text-gray-300" />
                            </div>
                            <p className="text-sm text-gray-400 font-semibold">
                                No items available to add
                            </p>
                            <p className="text-xs text-gray-300 mt-1">
                                Upload a receipt to extract items first
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between flex-shrink-0">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="rounded-xl text-gray-500 text-sm font-semibold hover:text-gray-700"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={
                            selectedCount === 0 || addToPantryMutation.isPending
                        }
                        className="bg-gradient-to-r from-[#7dab4f] to-[#5a8c3e] hover:from-[#6a9a40] hover:to-[#4a7a2e] text-white font-extrabold shadow-md rounded-xl gap-2 px-7 py-5 disabled:opacity-40 transition-all hover:shadow-lg"
                    >
                        {addToPantryMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <PackagePlus className="w-4 h-4" />
                                Add {selectedCount} Items
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

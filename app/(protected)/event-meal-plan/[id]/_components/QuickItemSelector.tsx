import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { MealType } from "@/services/event/event.types";
import { useAddEventItem } from "@/services/event/event.mutation";
import { STATIC_ITEMS } from "./StaticItems";

interface QuickItemSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mealType: MealType;
    mealId: string;
    eventId: string;
    onSuccess: () => void;
}

export function QuickItemSelector({
    open,
    onOpenChange,
    mealType,
    mealId,
    eventId,
    onSuccess
}: QuickItemSelectorProps) {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Mutations
    const addEventItemMutation = useAddEventItem();

    const items = STATIC_ITEMS[mealType] || [];

    const handleToggleItem = (item: string) => {
        setSelectedItems(prev =>
            prev.includes(item)
                ? prev.filter(i => i !== item)
                : [...prev, item]
        );
    };

    const handleAddItems = async () => {
        if (selectedItems.length === 0) return;

        setIsProcessing(true);
        try {
            let addedCount = 0;
            for (const item of selectedItems) {
                await addEventItemMutation.mutateAsync({
                    eventId,
                    data: {
                        name: item,
                        category: mealType as string,
                        quantity: 1,
                        unit: "serving",
                        estimatedCost: 0,
                    }
                });
                addedCount++;
            }

            toast.success(`Added ${addedCount} items to ${mealType}`);
            onSuccess();
            onOpenChange(false);
            setSelectedItems([]);

        } catch (error: any) {
            console.error("Failed to add items:", error);
            toast.error("Failed to add selections. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !isProcessing && onOpenChange(val)}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="capitalize">Add {mealType} Items</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {items.length > 0 ? (
                        <ScrollArea className="h-[300px] pr-4">
                            <div className="space-y-3">
                                {items.map((item) => (
                                    <div key={item} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-colors">
                                        <Checkbox
                                            id={item}
                                            checked={selectedItems.includes(item)}
                                            onCheckedChange={() => handleToggleItem(item)}
                                        />
                                        <label
                                            htmlFor={item}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                        >
                                            {item}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No quick items available for {mealType}.
                            <br />
                            Please use the standard recipe search.
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddItems}
                        disabled={selectedItems.length === 0 || isProcessing}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <Plus className="mr-2 h-4 w-4" />
                                Add {selectedItems.length} Item{selectedItems.length !== 1 ? 's' : ''}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

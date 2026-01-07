import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowRight, CheckCircle } from "lucide-react";
import { usePantryQuery } from "@/services/pantry/pantry.query";
import { useUpdatePantryMutation } from "@/services/pantry/pantry.mutation";
import { toast } from "@/hooks/use-toast";

interface PantryUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipeName: string;
  ingredients: any[];
  accountId?: string;
  onSuccess?: () => void;
}

interface Match {
  ingredientName: string;
  requiredQty: string; // e.g., "2 cups"
  pantryItem: any | null; // The matched pantry item
  update: boolean; // Whether the user selected this to update
  newQty: number; // calculated new quantity
}

export function PantryUpdateDialog({
  isOpen,
  onClose,
  recipeName,
  ingredients,
  accountId,
  onSuccess,
}: PantryUpdateDialogProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all pantry items for matching
  // Note: optimized implementation would search specific items, but for now fetching all for client-side match
  const { data: pantryResponse, isLoading } = usePantryQuery({
    limit: 100, // Fetch enough to cover mostpantries
    accountId,
  });

  const updatePantryMutation = useUpdatePantryMutation();

  useEffect(() => {
    if (isOpen && pantryResponse?.data && ingredients) {
      const pantryItems = pantryResponse.data;
      const newMatches: Match[] = [];

      ingredients.forEach((ing) => {
        // Simple name matching logic
        // Try to find a pantry item that contains the ingredient name or vice versa
        const ingName = typeof ing === "string" ? ing : ing.name;
        // Mock parsing quantity from string if needed, assuming ing object has qty
        const qty =
          typeof ing === "string" ? "1 serving" : `${ing.amount} ${ing.unit}`;

        const matchedItem = pantryItems.find((p: any) => {
          const pName = p.ingredient?.name?.toLowerCase() || "";
          const iName = ingName.toLowerCase();
          return pName.includes(iName) || iName.includes(pName);
        });

        if (matchedItem) {
          // Calculate new quantity (very basic logic for now, just decrementing 1 if unit unknown)
          // In a real app, unit conversion is needed.
          // Here we just simulate a reduction.
          let reduction = 1;
          if (typeof ing !== "string" && ing.amount)
            reduction = Number(ing.amount);

          let newQ = Number(matchedItem.quantity) - reduction;
          if (newQ < 0) newQ = 0;

          newMatches.push({
            ingredientName: ingName,
            requiredQty: qty,
            pantryItem: matchedItem,
            update: true,
            newQty: newQ,
          });
        }
      });

      setMatches(newMatches);
    }
  }, [isOpen, pantryResponse, ingredients]);

  const handleUpdate = async () => {
    setIsSubmitting(true);
    let successCount = 0;

    try {
      const updates = matches.filter((m) => m.update && m.pantryItem);

      await Promise.all(
        updates.map(async (match) => {
          await updatePantryMutation.mutateAsync({
            id: match.pantryItem.id,
            data: {
              quantity: match.newQty,
              accountId,
            },
          });
          successCount++;
        }),
      );

      toast({
        title: "Pantry Updated",
        description: `Successfully updated ${successCount} items.`,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not update some pantry items.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMatch = (index: number) => {
    setMatches((prev) => {
      const copy = [...prev];
      copy[index].update = !copy[index].update;
      return copy;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Pantry Inventory</DialogTitle>
          <DialogDescription>
            You cooked <strong>{recipeName}</strong>. We found matching items in
            your pantry. Confirm updates below:
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-indigo-500" />
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
              <p>No matching pantry items found for this recipe.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((match, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Checkbox
                      checked={match.update}
                      onCheckedChange={() => toggleMatch(idx)}
                    />
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900">
                        {match.ingredientName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {Number(match.pantryItem.quantity).toFixed(1)}{" "}
                        {match.pantryItem.unit}{" "}
                        <ArrowRight className="inline w-3 h-3 mx-1" />{" "}
                        <span className="font-bold text-indigo-600">
                          {match.newQty.toFixed(1)} {match.pantryItem.unit}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Skip
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isSubmitting || matches.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm Update
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

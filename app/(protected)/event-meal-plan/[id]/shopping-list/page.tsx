"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Apple,
    Cake,
    Carrot,
    Check,
    ChevronLeft,
    Coffee,
    Cookie,
    Loader2,
    Minus,
    Plus,
    Search,
    ShoppingCart,
    Trash2,
    Wine,
    Download,
    Sparkles,
    RefreshCw,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { RecipeService } from "@/services/recipe";
import {
    useEvent,
    useEventMeals
} from "@/services/event/event.query";
import {
    useAddEventItem,
    useDeleteEventItem,
    useGetEventItems,
    useGenerateShoppingList,
    useUpdateEventItem,
    useAddEventItemsBulk
} from "@/services/event/event.mutation";
import { EventService } from "@/services/event/event.service";
import { formatSmartQuantity, convertBackToBase } from "@/lib/quantity-utils";
import { getUnsplashImage } from "@/app/actions/unsplash";
import {
    fruits,
    vegitables,
    drinks,
    sweets,
    desserts,
    others,
} from "@/data/add-items";

export default function EventShoppingListPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    const recipeService = useRef(new RecipeService());

    // Queries
    const { data: event, isLoading: isEventLoading } = useEvent(eventId);
    const { data: meals, isLoading: isMealsLoading } = useEventMeals(eventId);
    const { data: eventItems, isLoading: isItemsLoading } = useGetEventItems(eventId);

    // Mutations
    const addEventItemMutation = useAddEventItem();
    const deleteEventItemMutation = useDeleteEventItem();
    const updateEventItemMutation = useUpdateEventItem();
    const addEventItemsBulkMutation = useAddEventItemsBulk();
    const generateShoppingListMutation = useGenerateShoppingList();

    // State
    const [dynamicImages, setDynamicImages] = useState<Record<string, string>>({});
    const fetchedIngredients = useRef<Set<string>>(new Set());

    // Pending items state (local only, not saved to DB yet)
    const [pendingItems, setPendingItems] = useState<any[]>([]);
    const [isSavingAll, setIsSavingAll] = useState(false);

    // Merge State Management
    const [isMerging, setIsMerging] = useState(false);
    const [aiMergedRecipeIngredients, setAiMergedRecipeIngredients] = useState<any[] | null>(null);
    const hasAttemptedMerge = useRef(false);

    const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";

    // Dialog state
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedItemToAdd, setSelectedItemToAdd] = useState<any>(null);
    const [addItemQuantity, setAddItemQuantity] = useState(1);
    const [addItemUnit, setAddItemUnit] = useState("kg");
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const categories = [
        { id: "vegitables", label: "Vegetables", icon: Carrot, data: vegitables },
        { id: "fruits", label: "Fruits", icon: Apple, data: fruits },
        { id: "snacks", label: "Snacks", icon: Cookie, data: sweets },
        { id: "beverages", label: "Beverages", icon: Coffee, data: drinks },
        { id: "desserts", label: "Desserts", icon: Cake, data: sweets },
        { id: "drinks", label: "Drinks", icon: Wine, data: drinks },
    ];

    const hasGenerated = useRef(false);

    // Auto-generate shopping list on mount if missing but meals exist
    useEffect(() => {
        if (!event?.id || isEventLoading || isMealsLoading) return;

        // Only auto-generate if:
        // 1. Shopping list doesn't exist
        // 2. There are meals in the event
        // 3. We haven't already tried generating
        const hasMeals = meals && meals.length > 0;
        const hasShoppingList = event.shoppingList && event.shoppingList.items && event.shoppingList.items.length > 0;

        if (hasMeals && !hasShoppingList && !hasGenerated.current) {
            hasGenerated.current = true;
            generateShoppingListMutation.mutate(eventId);
        }
    }, [event?.id, event?.shoppingList, meals, isEventLoading, isMealsLoading]);

    // 2. Map Shopping List Items
    const staticItems = useMemo(() => [
        ...vegitables.map((v) => ({ ...v, category: "vegetables" })),
        ...fruits.map((f) => ({ ...f, category: "fruits" })),
        ...drinks.map((d) => ({ ...d, category: "drinks" })),
        ...sweets.map((s) => ({ ...s, category: "snacks" })),
        ...(desserts || []).map((d) => ({ ...d, category: "snacks" })),
        ...(others || []).map((o) => ({ ...o, category: "others" })),
    ], []);

    const getStaticData = (name: string) => {
        if (!name) return null;
        const normalize = (s: string) => s.toLowerCase().trim();
        const target = normalize(name);

        const exactMatch = staticItems.find((item) => normalize(item.name) === target);
        if (exactMatch) return exactMatch;

        const partialMatch = staticItems.find(
            (item) => target.includes(normalize(item.name)) || normalize(item.name).includes(target)
        );
        return partialMatch || null;
    };

    // 🔥 PRODUCTION-GRADE MERGE FUNCTIONS

    /**
     * Normalizes ingredient name for better matching
     * Removes articles, extra spaces, and standardizes naming
     */
    const normalizeIngredientName = (name: string): string => {
        if (!name) return '';
        return name
            .toLowerCase()
            .trim()
            .replace(/^(a |an |the )/i, '') // Remove articles
            .replace(/\s+/g, ' ') // Multiple spaces to single
            .replace(/[,\.]+$/g, ''); // Remove trailing punctuation
    };

    /**
     * Normalizes unit for better matching
     * Converts common unit variants to standard form
     */
    const normalizeUnit = (unit: string): string => {
        if (!unit) return 'unit';
        const normalized = unit.toLowerCase().trim();

        // Unit mapping for common variants
        const unitMap: Record<string, string> = {
            'g': 'g',
            'gram': 'g',
            'grams': 'g',
            'kg': 'kg',
            'kilogram': 'kg',
            'kilograms': 'kg',
            'ml': 'ml',
            'milliliter': 'ml',
            'milliliters': 'ml',
            'l': 'l',
            'liter': 'l',
            'liters': 'l',
            'cup': 'cup',
            'cups': 'cup',
            'tbsp': 'tbsp',
            'tablespoon': 'tbsp',
            'tablespoons': 'tbsp',
            'tsp': 'tsp',
            'teaspoon': 'tsp',
            'teaspoons': 'tsp',
            'oz': 'oz',
            'ounce': 'oz',
            'ounces': 'oz',
            'lb': 'lb',
            'pound': 'lb',
            'pounds': 'lb',
            'piece': 'piece',
            'pieces': 'piece',
            'item': 'piece',
            'items': 'piece',
        };

        return unitMap[normalized] || normalized;
    };

    /**
     * Manual Merge: Rule-based merging of ingredients
     * Groups by normalized name + unit and sums quantities
     */
    const mergeIngredientsManually = (items: any[]): any[] => {
        const mergedMap = new Map<string, any>();

        for (const item of items) {
            const normalizedName = normalizeIngredientName(item.name);
            const normalizedUnit = normalizeUnit(item.unit || '');
            const key = `${normalizedName}::${normalizedUnit}`;

            if (mergedMap.has(key)) {
                const existing = mergedMap.get(key)!;

                // Sum quantities (already in base unit format)
                const existingQty = parseFloat(existing.quantity) || 0;
                const currentQty = parseFloat(item.quantity) || 0;

                existing.quantity = existingQty + currentQty;

                // Merge sources (track what was merged)
                if (!existing.mergedFrom) {
                    existing.mergedFrom = [existing.source];
                }
                if (!existing.mergedFrom.includes(item.source)) {
                    existing.mergedFrom.push(item.source);
                }
                existing.mergedCount = (existing.mergedCount || 1) + 1;
            } else {
                mergedMap.set(key, {
                    ...item,
                    mergedFrom: [item.source],
                    mergedCount: 1,
                    originalName: item.name, // Keep original for display
                });
            }
        }

        return Array.from(mergedMap.values());
    };

    /**
     * AI-Powered Merge Implementation
     */
    const runAIMerge = async (items: any[]) => {
        if (items.length === 0) return [];

        try {
            setIsMerging(true);
            // 1. Simplify for AI
            const simplifiedForAI = items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                category: item.category
            }));

            // 2. Call API
            const mergedResult = await EventService.mergeIngredients(simplifiedForAI);

            // 3. Map back (with estimated costs)
            const aiMerged = mergedResult.map((aiItem: any) => {
                // Find representative original item
                const originalName = aiItem.originalItems?.[0] || aiItem.name;
                const originalItem = items.find(item =>
                    item.name.toLowerCase() === originalName?.toLowerCase()
                ) || items[0];

                return {
                    ...originalItem,
                    name: aiItem.name,
                    quantity: aiItem.quantity,
                    unit: aiItem.unit,
                    category: aiItem.category,
                    estimatedPrice: aiItem.estimatedCost || 0, // NEW: Use AI estimated cost
                    mergedFrom: aiItem.originalItems || [],
                    mergedCount: (aiItem.originalItems || []).length,
                    isAiMerged: true
                };
            });

            return aiMerged;

        } catch (error) {
            console.error("AI Merge Failed", error);
            toast.error("Smart merge failed. Showing raw list.");
            return mergeIngredientsManually(items); // Fallback
        } finally {
            setIsMerging(false);
        }
    };

    // Raw Ingredients from DB + Pending
    const rawIngredients = useMemo(() => {
        const items: any[] = [];

        // Backend shopping list already has Recipe ingredients + Event Extra Items merged
        if (event?.shoppingList?.items) {
            // We need to distinguish Recipe Items vs previously saved manual items
            // But currently backend mixes them. However, we can use 'category' heuristic or if we had a flag.
            // For now, let's assume all fetched items are recipe items UNLESS they match our manual categories (snacks/beverages)

            items.push(...event.shoppingList.items.map((item: any) => ({
                id: item.id,
                name: item.ingredientName,
                quantity: item.quantity || 0,
                unit: item.unit || "",
                // estimatedPrice: item.estimatedPrice || 0, // We overwrite with AI cost later
                source: "Recipe", // We assume, or check
                category: item.category || "others",
                isRecipe: true, // simplified assumption for flow
                isPending: false
            })));
        }

        // Add pending items (local items not yet saved)
        items.push(...pendingItems.map((item: any, idx: number) => ({
            id: `pending-${idx}`,
            name: item.name,
            quantity: item.quantity || 0,
            unit: item.unit || "",
            estimatedPrice: item.estimatedPrice || 0,
            source: "Manual",
            category: item.category || "others",
            isRecipe: false,
            isPending: true
        })));

        return items;
    }, [event?.shoppingList?.items, pendingItems]);

    // Split Raw Ingredients into Recipe vs Manual
    // We treat "Recipe Ingredients" as anything that is NOT explicitly a manual add-on category
    // OR just use the 'isRecipe' flag if data integrity holds.
    // The user said: "shopping list ai se merge hoke hi show hogi aur jo baki vegitables honge ya other items manually add krenge to manual added items section me honge"

    // Simplest approach: Items from DB that are NOT snacks/beverages/drinks/desserts are "Recipe Items" 
    // AND all pending items are "Manual Items".

    const [recipeRawItems, manualRawItems] = useMemo(() => {
        const MANUAL_CATEGORIES = new Set(['snacks', 'beverages', 'drinks', 'desserts']);

        const recipe: any[] = [];
        const manual: any[] = [];

        rawIngredients.forEach(item => {
            const cat = (item.category || '').toLowerCase();
            // If it's pending, it's definitely manual
            if (item.isPending) {
                manual.push(item);
                return;
            }

            // If it's saved, check category to decide if it's likely a recipe ingredient or an "item"
            // Or rely on how we saved it. 
            // Better heuristic: Recipe items usually come from generate-shopping-list which merges recipes.
            // Items added via "Add Item" API are extra.
            // For now, let's process anything not in MANUAL_CATEGORIES as a recipe candidate for AI merge.

            if (MANUAL_CATEGORIES.has(cat)) {
                manual.push(item);
            } else {
                recipe.push(item);
            }
        });

        return [recipe, manual];
    }, [rawIngredients]);

    // Auto-Run AI Merge on Recipe Ingredients
    useEffect(() => {
        if (recipeRawItems.length > 0 && !hasAttemptedMerge.current) {
            hasAttemptedMerge.current = true;
            runAIMerge(recipeRawItems).then(res => {
                setAiMergedRecipeIngredients(res);
            });
        }
    }, [recipeRawItems]);

    // Prepare Display Lists
    const recipeIngredients = useMemo(() => {
        let items = aiMergedRecipeIngredients || [];
        // If loading or failed, show manual merge of raw items temporarily?
        if (!items.length && !isMerging && recipeRawItems.length > 0) {
            // Fallback if AI hasn't run or returned empty
            items = mergeIngredientsManually(recipeRawItems);
        }

        // Map images
        return items.map((item: any) => {
            const staticData = getStaticData(item.name);
            const image = staticData?.image || dynamicImages[item.name] || FALLBACK_IMAGE;
            const formatted = formatSmartQuantity(item.quantity, item.unit);
            return {
                ...item,
                image,
                displayQuantity: formatted.value,
                displayUnit: formatted.unit
            };
        });
    }, [aiMergedRecipeIngredients, recipeRawItems, dynamicImages, isMerging]);

    const manualIngredients = useMemo(() => {
        // Just local merge for manual items to avoid duplicates
        const merged = mergeIngredientsManually(manualRawItems);
        return merged.map((item: any) => {
            const staticData = getStaticData(item.name);
            const image = staticData?.image || dynamicImages[item.name] || FALLBACK_IMAGE;
            const formatted = formatSmartQuantity(item.quantity, item.unit);
            return {
                ...item,
                image,
                displayQuantity: formatted.value,
                displayUnit: formatted.unit
            };
        });
    }, [manualRawItems, dynamicImages]);

    // Combine for image fetching and PDF
    const allIngredients = useMemo(() => [...recipeIngredients, ...manualIngredients], [recipeIngredients, manualIngredients]);

    // Calculate Costs
    const estimatedTotalCost = useMemo(() => {
        const recipeCost = recipeIngredients.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
        // Manual items might not have price unless we set it. For now assume 0 or keep user input if we had it.
        const manualCost = manualIngredients.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
        return recipeCost + manualCost;
    }, [recipeIngredients, manualIngredients]);

    // Grouping for UI
    const groupedRecipeIngredients = recipeIngredients.reduce((acc, item) => {
        const cat = (item.category || "others").toLowerCase();
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {} as Record<string, typeof recipeIngredients>);

    const groupedManualIngredients = manualIngredients.reduce((acc, item) => {
        const cat = (item.category || "others").toLowerCase();
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {} as Record<string, typeof manualIngredients>);

    const categoryOrder = ["vegetables", "fruits", "meat", "dairy", "pantry", "spices", "bakery", "snacks", "drinks", "beverages", "desserts", "others"];

    // Image Fetching Effect - Production-grade with error handling
    useEffect(() => {
        const fetchImages = async () => {
            const missingImages = allIngredients.filter(
                (ing) => ing.image === FALLBACK_IMAGE && !fetchedIngredients.current.has(ing.name)
            );

            if (missingImages.length === 0) return;

            // Mark as fetched to prevent duplicate calls
            missingImages.forEach(ing => fetchedIngredients.current.add(ing.name));

            const newImages: Record<string, string> = {};

            // Batch processing to avoid rate limits - process 5 at a time
            const batchSize = 5;
            for (let i = 0; i < missingImages.length; i += batchSize) {
                const batch = missingImages.slice(i, i + batchSize);

                await Promise.allSettled(batch.map(async (ing) => {
                    try {
                        const url = await getUnsplashImage(ing.name);
                        if (url) {
                            newImages[ing.name] = url;
                        }
                    } catch (err) {
                        console.warn(`Failed to fetch image for ${ing.name}`, err);
                        // Keep fallback image - already set
                    }
                }));

                // Small delay between batches to be respectful to API
                if (i + batchSize < missingImages.length) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }

            if (Object.keys(newImages).length > 0) {
                setDynamicImages((prev) => ({ ...prev, ...newImages }));
            }
        };

        if (allIngredients.length > 0) {
            fetchImages().catch(err => {
                console.error('Error in image fetching:', err);
            });
        }
    }, [allIngredients]);

    // Handlers
    const handleAddItem = () => {
        if (!selectedItemToAdd) return;

        const newItem = {
            name: selectedItemToAdd.name,
            quantity: addItemQuantity,
            unit: addItemUnit || selectedItemToAdd.unit,
            category: activeCategory === "desserts" ? "snacks" :
                activeCategory === "beverages" ? "drinks" :
                    activeCategory || "others",
            estimatedPrice: 0,
            image: selectedItemToAdd.image
        };

        setPendingItems(prev => [...prev, newItem]);
        setSelectedItemToAdd(null);
        setAddItemQuantity(1);
        setIsDialogOpen(false);
        toast.success("Item added to list");
    };

    const handleRemoveItem = (item: any) => {
        // Check if it's a pending item
        if (item.isPending || item.source === "Pending") {
            setPendingItems(prev => prev.filter((_, idx) => `pending-${idx}` !== item.id));
            toast.success("Item removed");
            return;
        }

        // For saved items, show error for recipe items
        if (item.isRecipe) {
            toast.error("Cannot remove recipe ingredients. Edit the meal plan instead.");
            return;
        }

        // For saved manual items, would need to handle deletion
        toast.error("Cannot remove saved items. Please refresh the page.");
    };

    const handleSaveAllItems = async () => {
        if (pendingItems.length === 0) {
            toast.error("No items to save");
            return;
        }

        const itemCount = pendingItems.length;

        try {
            setIsSavingAll(true);
            toast.info(`Saving ${itemCount} items...`);

            // Prepare bulk data
            const bulkData = pendingItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                category: item.category,
                notes: "Added via Event Shopping List"
            }));

            // Bulk save
            await addEventItemsBulkMutation.mutateAsync({
                eventId,
                data: bulkData
            });

            // Generate shopping list to merge recipe ingredients + saved items
            try {
                await generateShoppingListMutation.mutateAsync(eventId);
            } catch (genError) {
                console.error('Failed to generate shopping list', genError);
                toast.warning('Items saved but shopping list generation failed. Please refresh the page.');
                setPendingItems([]);
                return;
            }

            // Success - clear pending items
            setPendingItems([]);
            // toast.success is handled by mutation
        } catch (error: any) {
            console.error("Failed to save items", error);
            toast.error(error.message || "Failed to save items. Please try again.");
        } finally {
            setIsSavingAll(false);
        }
    };

    const handleDownloadPDF = async () => {
        // Validation
        if (allIngredients.length === 0) {
            toast.error("No ingredients to download. Add items first.");
            return;
        }

        if (pendingItems.length > 0) {
            toast.warning(`You have ${pendingItems.length} unsaved item(s). Save them first for a complete list.`);
        }

        try {
            setIsDownloading(true);
            toast.info("Generating PDF...");

            const payload = {
                eventName: event?.name || "My Event",
                eventDate: event?.eventDate,
                guestCount: event?.totalServings,
                totalEventBudget: totalEventBudget,
                ingredients: allIngredients.map(item => ({
                    ...item,
                    // Ensure all fields are properly formatted
                    ingredientName: item.name,
                    quantity: item.quantity || 0,
                    unit: item.unit || '',
                    displayQuantity: item.displayQuantity || item.quantity || 0,
                    displayUnit: item.displayUnit || item.unit || '',
                    estimatedPrice: item.estimatedPrice || 0,
                    category: item.category || 'others',
                    source: item.source || 'Recipe',
                    isRecipe: item.isRecipe || false
                }))
            };

            await EventService.downloadShoppingListPdf(payload);
            toast.success("PDF Downloaded successfully!");
        } catch (error: any) {
            console.error("Download failed", error);
            toast.error(error.message || "Failed to download PDF. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleGenerateFinalList = async () => {
        try {
            await generateShoppingListMutation.mutateAsync(eventId);
            toast.success("Shopping list refreshed!");
        } catch (error) {
            console.error("Failed to generate list", error);
        }
    };


    // Use Event's Total Budget (not calculated from item prices)
    const totalEventBudget = typeof event?.budget === 'object' && event?.budget?.totalBudget
        ? event.budget.totalBudget
        : event?.budgetAmount || 0;



    // Loading States
    const isInitialLoading = isEventLoading || isMealsLoading || isItemsLoading;
    const isGenerating = generateShoppingListMutation.isPending && !isSavingAll;

    if (isInitialLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#F3F0FD]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#7dab4f]" />
                    <p className="text-gray-500 font-medium">Loading shopping list...</p>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#F3F0FD]">
                <div className="flex flex-col items-center gap-4">
                    <p className="text-gray-700 font-semibold text-lg">Event not found</p>
                    <Button onClick={() => router.push('/event-meal-plan')}>
                        Go to Events
                    </Button>
                </div>
            </div>
        );
    }



    return (
        <div className="h-[calc(100vh-57px)] bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00] relative overflow-auto">
            <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 py-8">
                {/* Header */}
                <div className="flex flex-col items-start lg:items-center justify-between mb-6 gap-3 animate-fade-in relative">
                    <Button
                        variant="ghost"
                        className="absolute md:left-0 -top-2 md:top-1/2 md:-translate-y-1/2 p-0 hover:bg-transparent text-gray-500 hover:text-gray-900 flex gap-1"
                        onClick={() => router.push(`/event-meal-plan/${eventId}`)}
                    >
                        <ChevronLeft className="w-5 h-5" /> Back to Event
                    </Button>
                    <div className="flex items-center gap-2 mt-8 md:mt-0">
                        <span className="bg-[#7dab4f] font-bold text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1">
                            Event Planning
                        </span>
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl lg:text-3xl font-extrabold text-[#313131] tracking-tight">
                            Event Shopping List
                        </h1>
                        <p className="text-sm text-gray-500 font-medium mt-1">
                            Add extra items and allow us to merge everything into a master list.
                        </p>
                    </div>

                    <div className="absolute right-0 top-0">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex flex-col items-end">
                            <span className="text-[10px] uppercase font-bold text-gray-400">Event Budget</span>
                            <span className="text-xl font-extrabold text-[#7dab4f]">
                                ${totalEventBudget.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Pending Items Alert */}
                {pendingItems.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                            <span className="text-amber-700 font-bold">{pendingItems.length}</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-amber-900">Pending Items</h3>
                            <p className="text-sm text-amber-700">
                                You have {pendingItems.length} unsaved item{pendingItems.length > 1 ? 's' : ''}. Click "Save All Items" to add them to your shopping list.
                            </p>
                        </div>
                    </div>
                )}

                {/* Add Items Section */}
                <div className="bg-gradient-to-r from-white via-[#F3F0FD] to-white border border-[#EDE9FF] rounded-xl p-6 py-4 mb-6">
                    <div className="flex gap-3 items-center font-bold mb-4 flex-wrap">
                        <ShoppingCart className="size-5 text-[var(--primary)]" />
                        Add Extra Items (Fruits, Snacks, etc.)
                    </div>

                    <div className="flex flex-wrap lg:flex-nowrap overflow-auto gap-4 lg:gap-6">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            {categories.map((cat) => (
                                <DialogTrigger
                                    key={cat.id}
                                    asChild
                                    onClick={() => {
                                        setActiveCategory(cat.id);
                                        setSearchTerm("");
                                        setSelectedItemToAdd(null);
                                        setIsDialogOpen(true);
                                    }}
                                >
                                    <button
                                        type="button"
                                        className="border border-[#EDE9FF] rounded-xl p-4 bg-white text-sm font-medium flex flex-col gap-2 justify-center items-center hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all group min-w-[108px] w-full"
                                    >
                                        <span className="w-16 h-16 flex items-center justify-center bg-[#F4F1FD] rounded-full">
                                            <cat.icon className="size-8 group-hover:hidden transition-all" strokeWidth={1.2} />
                                            <Plus className="size-8 hidden group-hover:flex transition-all" strokeWidth={1.2} />
                                        </span>
                                        <div className="group-hover:hidden transition-all">{cat.label}</div>
                                        <div className="hidden group-hover:flex transition-all">Add Items</div>
                                    </button>
                                </DialogTrigger>
                            ))}

                            <DialogContent className="sm:max-w-[800px] bg-white border-none">
                                <DialogHeader>
                                    <DialogTitle>Add {categories.find((c) => c.id === activeCategory)?.label}</DialogTitle>
                                </DialogHeader>
                                <div className="flex flex-col md:flex-row gap-5">
                                    {/* Left: Search & List */}
                                    <div className="flex-1 flex flex-col gap-4 border-b lg:border-b-0 border-r-0 lg:border-r border-gray-100 pb-5 lg:pr-5">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="text"
                                                placeholder={`Search ${activeCategory}...`}
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-[#E2E2E2] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-black"
                                            />
                                        </div>
                                        <ScrollArea className="max-h-[300px] overflow-auto">
                                            <div className="grid grid-cols-2 gap-3">
                                                {categories
                                                    .find((c) => c.id === activeCategory)
                                                    ?.data.filter((item) =>
                                                        item.name.toLowerCase().includes(searchTerm.toLowerCase())
                                                    )
                                                    .map((item, idx) => (
                                                        <div
                                                            key={idx}
                                                            onClick={() => {
                                                                setSelectedItemToAdd(item);
                                                                setAddItemUnit(item.unit);
                                                                setAddItemQuantity(1);
                                                            }}
                                                            className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all ${selectedItemToAdd?.name === item.name
                                                                ? "border-[var(--primary)] bg-[#F4F1FD]"
                                                                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                                                }`}
                                                        >
                                                            <div className="w-10 h-10 rounded bg-white flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
                                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700 line-clamp-1">{item.name}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </ScrollArea>
                                    </div>

                                    {/* Right: Details */}
                                    <div className="w-full md:w-[300px] flex flex-col justify-between">
                                        {selectedItemToAdd ? (
                                            <div className="flex flex-col h-full">
                                                <div className="flex-1">
                                                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100 mb-4 border border-gray-200">
                                                        <img src={selectedItemToAdd.image} alt={selectedItemToAdd.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedItemToAdd.name}</h3>
                                                    <p className="text-sm text-gray-500 capitalize mb-4">
                                                        {selectedItemToAdd.category} • {selectedItemToAdd.unit}
                                                    </p>

                                                    <div className="space-y-2">
                                                        <Label>Quantity</Label>
                                                        <div className="flex items-center border border-gray-200 rounded-lg p-1 w-full max-w-[150px]">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => setAddItemQuantity(Math.max(1, addItemQuantity - 1))}
                                                            >
                                                                <Minus className="h-4 w-4" />
                                                            </Button>
                                                            <Input
                                                                value={addItemQuantity}
                                                                readOnly
                                                                className="h-full border-0 text-center focus-visible:ring-0 w-full shadow-none"
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => setAddItemQuantity(addItemQuantity + 1)}
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={handleAddItem}
                                                    className="w-full bg-[#1a1a1a] text-white hover:bg-black mt-4"
                                                >
                                                    Add to List
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
                                                <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
                                                <p>Select an item to view details</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="space-y-8 pb-24">
                    {/* 1. AI Merged Recipe Ingredients Section */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in delay-100">
                        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <Sparkles className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg text-gray-900">Smart Shopping List</h2>
                                    <p className="text-xs text-gray-500">AI-optimized list from your event recipes</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {isMerging ? (
                                    <div className="flex items-center gap-2 text-sm text-purple-600 font-medium px-3 py-1 bg-purple-50 rounded-lg">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Optimizing list...
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wide">Est. Cost</span>
                                        <span className="text-lg font-extrabold text-[#7dab4f]">
                                            ${estimatedTotalCost.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* List Content */}
                        <div className="divide-y divide-gray-100">
                            {recipeIngredients.length === 0 && !isMerging ? (
                                <div className="p-10 text-center text-gray-500 flex flex-col items-center">
                                    <ShoppingCart className="w-12 h-12 mb-3 text-gray-200" />
                                    <p>No recipe ingredients yet. Generate a menu for your event first.</p>
                                    <Button
                                        variant="link"
                                        className="text-[var(--primary)] mt-2"
                                        onClick={() => router.push(`/event-meal-plan/${eventId}`)}
                                    >
                                        Go to Recipe Generation
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {categoryOrder.map((cat) => {
                                        const items = groupedRecipeIngredients[cat];
                                        if (!items || items.length === 0) return null;
                                        return (
                                            <div key={cat}>
                                                <div className="bg-gray-50/50 px-6 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 sticky top-0 border-y border-gray-100">
                                                    {cat}
                                                </div>
                                                {items.map((item: any, idx: number) => (
                                                    <div key={item.id || idx} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center overflow-hidden border border-gray-100 shrink-0 shadow-sm">
                                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                                                                    {item.mergedCount && item.mergedCount > 1 && (
                                                                        <div className="group/tooltip relative">
                                                                            <span className="cursor-help text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide border border-purple-100 flex items-center gap-1">
                                                                                <RefreshCw className="w-3 h-3" />
                                                                                Merged ({item.mergedCount})
                                                                            </span>
                                                                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover/tooltip:block bg-gray-900 text-white text-xs rounded p-2 px-3 whitespace-nowrap z-50">
                                                                                Combined from {item.mergedCount} items
                                                                                <div className="absolute left-4 top-full border-4 border-transparent border-t-gray-900"></div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-gray-500">
                                                                    Est. Cost: <span className="font-medium text-gray-700">${(item.estimatedPrice || 0).toFixed(2)}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-gray-100 rounded-lg px-3 py-1 text-sm font-bold text-gray-700 min-w-[80px] text-center border border-gray-200">
                                                            {item.displayQuantity} {item.displayUnit}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    </div>

                    {/* 2. Extra / Manual Items Section */}
                    {(manualIngredients.length > 0) && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in delay-200">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-amber-50/30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-100 rounded-lg">
                                        <ShoppingCart className="w-5 h-5 text-amber-700" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-lg text-gray-900">Extra / Manual Items</h2>
                                        <p className="text-xs text-gray-500">Items added manually (Fruits, Snacks, etc.)</p>
                                    </div>
                                </div>
                                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">
                                    {manualIngredients.length} Items
                                </span>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {categoryOrder.map((cat) => {
                                    const items = groupedManualIngredients[cat];
                                    if (!items || items.length === 0) return null;
                                    return (
                                        <div key={cat}>
                                            <div className="bg-gray-50/50 px-6 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 sticky top-0 border-y border-gray-100">
                                                {cat}
                                            </div>
                                            {items.map((item: any, idx: number) => (
                                                <div key={item.id || idx} className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group ${item.isPending ? 'bg-amber-50/30' : ''}`}>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-medium text-gray-900">{item.name}</h3>
                                                                {item.isPending && (
                                                                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                                                                        Pending
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-500 capitalize">{item.source}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-white rounded-lg px-3 py-1 text-sm font-bold text-gray-700 min-w-[80px] text-center border border-gray-200 shadow-sm">
                                                            {item.displayQuantity} {item.displayUnit}
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => handleRemoveItem(item)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions Footer */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-center z-20 gap-4">
                    <Button
                        size="lg"
                        onClick={handleSaveAllItems}
                        disabled={isSavingAll || pendingItems.length === 0}
                        className="bg-[#1a1a1a] text-white hover:bg-black rounded-lg px-8 shadow-lg"
                    >
                        {isSavingAll ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>Save All Items ({pendingItems.length})</>
                        )}
                    </Button>

                    {pendingItems.length === 0 && (
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={handleDownloadPDF}
                            disabled={isDownloading || allIngredients.length === 0}
                            className="rounded-lg px-6"
                        >
                            {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                            Download PDF
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

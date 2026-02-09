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
    Wine
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
    useUpdateEventItem
} from "@/services/event/event.mutation";
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
    const generateShoppingListMutation = useGenerateShoppingList();

    // State
    const [dynamicImages, setDynamicImages] = useState<Record<string, string>>({});
    const fetchedIngredients = useRef<Set<string>>(new Set());

    const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";

    // Dialog state
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedItemToAdd, setSelectedItemToAdd] = useState<any>(null);
    const [addItemQuantity, setAddItemQuantity] = useState(1);
    const [addItemUnit, setAddItemUnit] = useState("kg");

    const categories = [
        { id: "vegitables", label: "Vegetables", icon: Carrot, data: vegitables },
        { id: "fruits", label: "Fruits", icon: Apple, data: fruits },
        { id: "snacks", label: "Snacks", icon: Cookie, data: sweets },
        { id: "beverages", label: "Beverages", icon: Coffee, data: drinks },
        { id: "desserts", label: "Desserts", icon: Cake, data: sweets },
        { id: "drinks", label: "Drinks", icon: Wine, data: drinks },
    ];

    // 1. Auto-generate list on mount if missing or stale
    // We can't easily know if 'stale', but if missing we generate.
    // Also provide manual refresh.
    useEffect(() => {
        if (event && !event.shoppingList && !generateShoppingListMutation.isPending && !generateShoppingListMutation.isSuccess) {
            generateShoppingListMutation.mutate(eventId);
        }
    }, [event?.id, event?.shoppingList]);

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

    const allIngredients = useMemo(() => {
        if (!event?.shoppingList?.items) return [];

        const extraItemNames = new Set((eventItems || []).map((i: any) => i.name.toLowerCase()));

        return event.shoppingList.items.map((item: any) => {
            const staticData = getStaticData(item.ingredientName);
            const image = staticData?.image || dynamicImages[item.ingredientName] || FALLBACK_IMAGE;
            const formatted = formatSmartQuantity(item.quantity || 0, item.unit || "");

            const isManual = extraItemNames.has(item.ingredientName.toLowerCase());

            return {
                id: item.id,
                name: item.ingredientName,
                quantity: item.quantity,
                unit: item.unit,
                displayQuantity: formatted.value,
                displayUnit: formatted.unit,
                source: isManual ? "Added" : "Recipe",
                image,
                category: item.category || (staticData as any)?.category || "others",
                isRecipe: !isManual
            };
        });
    }, [event?.shoppingList, eventItems, dynamicImages, staticItems]);

    // 3. Image Fetching Effect
    useEffect(() => {
        const fetchImages = async () => {
            const missingImages = allIngredients.filter(
                (ing) => ing.image === FALLBACK_IMAGE && !fetchedIngredients.current.has(ing.name)
            );

            for (const ing of missingImages) {
                fetchedIngredients.current.add(ing.name);
                const url = await getUnsplashImage(ing.name);
                if (url) {
                    setDynamicImages((prev) => ({ ...prev, [ing.name]: url }));
                }
            }
        };

        if (allIngredients.length > 0) {
            fetchImages();
        }
    }, [allIngredients]);

    // Handlers
    const handleAddItem = async () => {
        if (!selectedItemToAdd) return;

        try {
            await addEventItemMutation.mutateAsync({
                eventId,
                data: {
                    name: selectedItemToAdd.name,
                    quantity: addItemQuantity,
                    unit: addItemUnit || selectedItemToAdd.unit,
                    category: activeCategory === "desserts" ? "snacks" :
                        activeCategory === "beverages" ? "drinks" :
                            activeCategory || "others",
                    notes: "Added via Event Shopping List"
                }
            });

            // Regenerate list to include new item
            await generateShoppingListMutation.mutateAsync(eventId);

            setSelectedItemToAdd(null);
            setAddItemQuantity(1);
        } catch (error) {
            console.error("Failed to add item", error);
        }
    };

    const handleRemoveItem = async (item: any) => {
        // We can only remove Extra Items easily via API.
        // We can't remove "merged" shopping list items via deleteEventItem unless we know the extraItemId.
        // But the displayed list is 'shoppingListItems'.
        // This is a UI gap. The user sees "Merged List".
        // To remove a manual item, they need to remove the 'extraItem'.
        // But we don't have the map from ShoppingListItem -> ExtraItem.
        // For now, disallow deleting from this view, or:
        // We fetched `eventItems` (extra items). We can match by name.

        const matchingExtraItem = eventItems?.find((ei: any) =>
            ei.name.toLowerCase() === item.name.toLowerCase()
        );

        if (matchingExtraItem) {
            try {
                await deleteEventItemMutation.mutateAsync({
                    eventId,
                    itemId: matchingExtraItem.id
                });
                await generateShoppingListMutation.mutateAsync(eventId);
            } catch (error) {
                console.error("Failed to remove item", error);
            }
        } else {
            toast.error("Cannot remove recipe ingredients directly. Edit the recipe or meal plan.");
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

    if (isEventLoading || isMealsLoading || isItemsLoading || generateShoppingListMutation.isPending) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#F3F0FD]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#7dab4f]" />
                    <p className="text-gray-500 font-medium">Loading shopping list...</p>
                </div>
            </div>
        );
    }

    if (!event) return <div>Event not found</div>;

    const groupedIngredients = allIngredients.reduce((acc, item) => {
        const cat = (item.category || "others").toLowerCase();
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {} as Record<string, typeof allIngredients>);

    const categoryOrder = ["vegetables", "fruits", "snacks", "drinks", "others"];

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
                </div>

                {/* Add Items Section */}
                <div className="bg-gradient-to-r from-white via-[#F3F0FD] to-white border border-[#EDE9FF] rounded-xl p-6 py-4 mb-6">
                    <div className="flex gap-3 items-center font-bold mb-4 flex-wrap">
                        <ShoppingCart className="size-5 text-[var(--primary)]" />
                        Add Extra Items (Fruits, Snacks, etc.)
                    </div>

                    <div className="flex flex-wrap lg:flex-nowrap overflow-auto gap-4 lg:gap-6">
                        <Dialog>
                            {categories.map((cat) => (
                                <DialogTrigger
                                    key={cat.id}
                                    asChild
                                    onClick={() => {
                                        setActiveCategory(cat.id);
                                        setSearchTerm("");
                                        setSelectedItemToAdd(null);
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
                                                    disabled={addEventItemMutation.isPending}
                                                    className="w-full bg-[#1a1a1a] text-white hover:bg-black mt-4"
                                                >
                                                    {addEventItemMutation.isPending ? "Adding..." : "Add to List"}
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

                {/* List View */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-20">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-bold text-lg">Merged Shopping List</h2>
                        <span className="text-sm text-gray-500">{allIngredients.length} Items</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {allIngredients.length === 0 ? (
                            <div className="p-10 text-center text-gray-500">
                                No items in the list. Add recipes or items to get started.
                            </div>
                        ) : (
                            categoryOrder.map((cat) => {
                                const items = groupedIngredients[cat];
                                if (!items || items.length === 0) return null;
                                return (
                                    <div key={cat}>
                                        <div className="bg-gray-50/50 px-6 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 sticky top-0">
                                            {cat}
                                        </div>
                                        {items.map((item) => (
                                            <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                                                        <p className="text-sm text-gray-500 capitalize">
                                                            {item.source} • {item.displayQuantity} {item.displayUnit}
                                                        </p>
                                                    </div>
                                                </div>
                                                {!item.isRecipe && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => handleRemoveItem(item)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                {item.isRecipe && (
                                                    <span className="text-xs text-gray-400 italic px-2">Recipe Item</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Final Action */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-center z-20">
                    <Button
                        size="lg"
                        onClick={handleGenerateFinalList}
                        disabled={generateShoppingListMutation.isPending || allIngredients.length === 0}
                        className="bg-[#1a1a1a] text-white hover:bg-black rounded-lg px-8 shadow-lg w-full md:w-auto"
                    >
                        {generateShoppingListMutation.isPending ? "Generating..." : "Generate Final Shopping List"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

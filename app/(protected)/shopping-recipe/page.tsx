"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import {
  Apple,
  Cake,
  Carrot,
  Check,
  Clock,
  Coffee,
  Cookie,
  DollarSign,
  Download,
  Flame,
  Heart,
  ListCheck,
  Minus,
  PencilLine,
  Plus,
  Search,
  ShoppingCart,
  ThumbsDown,
  ThumbsUp,
  Trash,
  Wine,
} from "lucide-react";

import {
  RecipePayload,
  SlotProcessingState,
  Recipe,
} from "@/lib/recipe-constants";
import { Recipe as ApiRecipe, RecipeService } from "@/services/recipe";
import { Input } from "@/components/ui/input";
import {
  formatSmartQuantity,
  getStepSize,
  convertBackToBase,
} from "@/lib/quantity-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/redux/store.redux";

import {
  toggleMealPlan,
  hydrateMealPlans,
} from "@/redux/features/meal-plan/meal-plan.slice";
import { getUnsplashImage } from "@/app/actions/unsplash";
import { getRecipeImageUrl } from "@/lib/recipe-utils";
import { Trash2, Edit2, Pencil, X, ChevronLeft } from "lucide-react";
import {
  fruits,
  vegitables,
  drinks,
  sweets,
  desserts,
  others,
} from "@/data/add-items";
import { useToast } from "@/hooks/use-toast";

export default function ShoppingRecipe() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Redux State
  const {
    plans,
    generatedRecipes: generatedRecipies,
    generatedCustomRecipes: generatedCustomRecipies,
  } = useSelector((state: RootState) => state.mealPlan);

  const [isHydrated, setIsHydrated] = useState(false);
  const [backendIngredients, setBackendIngredients] = useState<any[]>([]);
  const [isLoadingBackend, setIsLoadingBackend] = useState(false);
  const recipeService = useRef(new RecipeService());

  // Derived selections
  const currentSelections: Record<string, string[]> = {};
  Object.entries(plans).forEach(([date, meals]) => {
    Object.entries(meals).forEach(([mealType, recipes]) => {
      const slotKey = `${date}-${mealType}`;
      if (Array.isArray(recipes)) {
        currentSelections[slotKey] = recipes.map((r) => r.id);
      }
    });
  });

  // Hydrate from localStorage on mount
  useEffect(() => {
    // Only hydrate if we don't have plans in Redux (e.g. refresh)
    // OR just always re-hydrate to be safe?
    // Usually if Redux is empty, we check LS.
    if (Object.keys(plans).length === 0) {
      try {
        const saved = localStorage.getItem("foodmatrix-selected-recipes");
        if (saved) {
          const { selections, additionalRecipes } = JSON.parse(saved);

          if (selections && additionalRecipes) {
            const reconstructedPlans: Record<
              string,
              Record<string, Recipe[]>
            > = {};

            Object.entries(selections).forEach(([slotKey, recipeIds]) => {
              // slotKey is date-mealType
              const lastHyphenIndex = slotKey.lastIndexOf("-");
              if (lastHyphenIndex === -1) return;
              const date = slotKey.substring(0, lastHyphenIndex);
              const mealType = slotKey.substring(lastHyphenIndex + 1);

              if (!reconstructedPlans[date]) {
                reconstructedPlans[date] = {};
              }

              const recipes = (recipeIds as string[])
                .map((id) => additionalRecipes[id])
                .filter(Boolean);

              if (recipes.length > 0) {
                reconstructedPlans[date][mealType] = recipes;
              }
            });

            dispatch(hydrateMealPlans(reconstructedPlans));
          }
        } else {
          // No saved state, likely empty.
          // We handle redirection in the next effect or after a timeout
        }
      } catch (e) {
        console.error("Failed to hydrate shopping list", e);
      }
    }
    setIsHydrated(true);
  }, [dispatch]);

  // Handle Empty State & Redirect
  useEffect(() => {
    if (isHydrated && Object.keys(plans).length === 0) {
      // Only redirect if truly empty after hydration attempt
      // Add a small delay or check to ensure we aren't mid-transition?
      // For now, immediate redirect is what is requested.
      router.replace("/recipe-selection");
    }
  }, [isHydrated, plans, router]);

  // Sync back to localStorage when plans change (if hydrated)
  useEffect(() => {
    if (!isHydrated) return;

    // We need to reverse construct the storage format
    const selectedData: Record<string, Recipe> = {};
    const recipeIds: string[] = [];
    const selectionsPayload: Record<string, string[]> = {};

    let hasItems = false;

    Object.entries(plans).forEach(([date, dayPlan]) => {
      Object.entries(dayPlan).forEach(([meal, recipes]) => {
        if (Array.isArray(recipes) && recipes.length > 0) {
          hasItems = true;
          recipes.forEach((recipe) => {
            if (recipe && recipe.id) {
              selectedData[recipe.id] = recipe;
              recipeIds.push(recipe.id);
            }
          });
          selectionsPayload[`${date}-${meal}`] = recipes.map((r) => r.id);
        }
      });
    });

    if (hasItems) {
      localStorage.setItem(
        "foodmatrix-selected-recipes",
        JSON.stringify({
          recipeIds,
          additionalRecipes: selectedData,
          selections: selectionsPayload,
        }),
      );
    } else {
      // If user removed everything, maybe clear storage?
      // But if they refresh, they will be redirected. That's fine.
      localStorage.removeItem("foodmatrix-selected-recipes");
    }
  }, [plans, isHydrated]);

  // Fetch merged shopping list from backend
  useEffect(() => {
    const fetchBackendList = async () => {
      const ids: string[] = [];
      Object.values(plans).forEach((day) =>
        Object.values(day).forEach((recipes) => {
          if (Array.isArray(recipes)) recipes.forEach((r) => ids.push(r.id));
        }),
      );

      if (ids.length === 0) {
        setBackendIngredients([]);
        return;
      }

      setIsLoadingBackend(true);
      try {
        const list = await recipeService.current.getMergedShoppingList(ids);
        setBackendIngredients(list || []);
      } catch (e) {
        console.error("Failed to fetch backend shopping list", e);
      } finally {
        setIsLoadingBackend(false);
      }
    };

    if (isHydrated) {
      fetchBackendList();
    }
  }, [plans, isHydrated]);

  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]); // Keep strictly for local UI if needed, but rely on Redux for truth
  const [detailedRecipe, setDetailedRecipe] = useState<ApiRecipe | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Extra items state
  const [extraItems, setExtraItems] = useState<any[]>([]);

  // Dialog state
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItemToAdd, setSelectedItemToAdd] = useState<any>(null);
  const [addItemQuantity, setAddItemQuantity] = useState(1);
  const [addItemUnit, setAddItemUnit] = useState("kg");

  const { toast } = useToast();

  // Combined static data for mapping
  const staticItems = [
    ...vegitables.map((v) => ({ ...v, category: "vegetables" })),
    ...fruits.map((f) => ({ ...f, category: "fruits" })),
    ...drinks.map((d) => ({ ...d, category: "drinks" })),
    ...sweets.map((s) => ({ ...s, category: "snacks" })),
    ...(desserts || []).map((d) => ({ ...d, category: "snacks" })), // Desserts grouped with snacks or separate? Image has Snacks.
    ...(others || []).map((o) => ({ ...o, category: "others" })),
  ];

  const getStaticData = (name: string) => {
    if (!name) return null;
    const normalize = (s: string) => s.toLowerCase().trim();
    const target = normalize(name);

    // Priority 1: Exact Match (Case Insensitive)
    const exactMatch = staticItems.find(
      (item) => normalize(item.name) === target,
    );
    if (exactMatch) return exactMatch;

    // Priority 2: Partial Match (Case Insensitive)
    // Matches if the ingredient name contains the static item name (e.g., "Chopped Onion" matches "Onion")
    // or if the static item name contains the ingredient name.
    const partialMatch = staticItems.find(
      (item) =>
        target.includes(normalize(item.name)) ||
        normalize(item.name).includes(target),
    );

    return partialMatch || null;
  };

  const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";

  // Dynamic Image State
  const [dynamicImages, setDynamicImages] = useState<Record<string, string>>(
    {},
  );
  const fetchedIngredients = useRef<Set<string>>(new Set());

  // Derived Ingredients List (from Backend + Extra)
  const allIngredients = useMemo(() => {
    // 1. Map backend items
    const backendMapped = backendIngredients.map((item) => {
      const ingredientName = item.ingredientName;
      const staticData = getStaticData(ingredientName);
      // Backend doesn't return image, so we start with static or dynamic or fallback
      const image =
        staticData?.image ||
        dynamicImages[ingredientName] ||
        FALLBACK_IMAGE;

      const qty = item.quantity || 0;
      const unit = item.unit || "";
      const formatted = formatSmartQuantity(qty, unit);

      return {
        ...item,
        name: ingredientName,
        quantity: qty,
        unit: unit,
        displayQuantity: formatted.value,
        displayUnit: formatted.unit,
        source: "Recipe",
        image,
        category: (staticData as any)?.category || "others",
        price: (staticData as any)?.price || 0,
      };
    });

    return [
      ...backendMapped,
      ...extraItems.map((item) => {
        const qty = item.quantity || 0;
        const unit = item.unit || "";
        const formatted = formatSmartQuantity(qty, unit);
        return {
          ...item,
          quantity: qty,
          unit: unit,
          displayQuantity: formatted.value,
          displayUnit: formatted.unit,
          category: item.category || "others",
        };
      }),
    ];
  }, [backendIngredients, extraItems, dynamicImages]);

  // Quantity Overrides State
  const [quantityOverrides, setQuantityOverrides] = useState<
    Record<number, number>
  >({});
  const [removedIndices, setRemovedIndices] = useState<Set<number>>(new Set());
  const [editingCategories, setEditingCategories] = useState<Set<string>>(
    new Set(),
  );

  const toggleEditCategory = (cat: string) => {
    const newSet = new Set(editingCategories);
    if (newSet.has(cat)) newSet.delete(cat);
    else newSet.add(cat);
    setEditingCategories(newSet);
  };

  const handleUpdateQuantity = (
    index: number,
    changeAmount: number,
    currentDisplayUnit: string,
  ) => {
    const item = allIngredients[index];
    if (!item) return;

    // Calculate new base quantity
    const newBaseQty = convertBackToBase(
      changeAmount,
      currentDisplayUnit,
      item.unit,
    );

    if (newBaseQty <= 0) {
      handleRemoveItemByIndex(index);
      return;
    }

    setQuantityOverrides((prev) => ({ ...prev, [index]: newBaseQty }));
  };

  const handleRemoveItemByIndex = (index: number) => {
    const itemToCheck = allIngredients[index];
    if (itemToCheck && itemToCheck.source === "Recipe") {
      toast({
        title: "Cannot Remove Item",
        description: "Recipe ingredients cannot be removed, only edited.",
        variant: "destructive",
      });
      return;
    }

    setRemovedIndices((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });

    // If it exists in extra items, we might want to sync, but for visual alignment lets just track removal logically from this view
    // Actually, if it is in extraItems, we should properly remove it from extraItems too,
    // but `allIngredients` is index based on derived array.
    // Getting the real index in extraItems is tricky if we mix.
    // But `extraItems` are at the end.

    const splitIndex = allIngredients.length - extraItems.length;
    if (index >= splitIndex) {
      handleRemoveExtraItem(index - splitIndex);
    }
  };

  const handleClearCategory = (category: string) => {
    // Add all items of this category to removedIndices
    const indicesToRemove: number[] = [];
    allIngredients.forEach((ing, idx) => {
      // Only remove manual items
      if (ing.category === category && ing.source !== "Recipe") {
        indicesToRemove.push(idx);
      }
    });

    if (indicesToRemove.length === 0) {
      toast({
        title: "Nothing to Clear",
        description: "Only manual items can be removed.",
      });
      return;
    }

    setRemovedIndices((prev) => {
      const newSet = new Set(prev);
      indicesToRemove.forEach((i) => newSet.add(i));
      return newSet;
    });

    // Also remove from extraItems if applicable
    // This is a bit complex due to state sync, but visual clearing is achieved.
  };

  const groupedIngredients = useMemo(() => {
    const groups: Record<string, any[]> = {};
    const categoryOrder = [
      "vegetables",
      "fruits",
      "snacks",
      "drinks",
      "others",
    ];

    // Initialize standard groups
    categoryOrder.forEach((c) => (groups[c] = []));

    allIngredients.forEach((ing, idx) => {
      if (removedIndices.has(idx)) return;

      const cat = (ing.category || "others").toLowerCase();
      // Map unknown categories to others or keep?
      // We stick to known ones + others.
      const targetGroup = groups[cat] ? cat : "others";
      if (!groups[targetGroup]) groups[targetGroup] = []; // Just in case

      const originalIdx = idx; // Keep track of index in allIngredients

      // Check overrides (which are now in BASE unit)
      const baseQty = quantityOverrides[originalIdx] !== undefined
        ? quantityOverrides[originalIdx]
        : (ing.quantity ?? 1);

      // Re-format for smart display using the (potentially) overridden base quantity
      const formatted = formatSmartQuantity(baseQty, ing.unit);

      groups[targetGroup].push({
        ...ing,
        originalIndex: originalIdx,
        quantity: baseQty, // Current base qty
        displayQuantity: formatted.value, // Smart qty
        displayUnit: formatted.unit, // Smart unit
        price: ing.price // Keep price logic
      });
    });

    return groups;
  }, [allIngredients, quantityOverrides, removedIndices]);

  // Effect to fetch missing images
  useEffect(() => {
    const fetchImages = async () => {
      // Find ingredients that have the fallback image and haven't been fetched yet
      const missingImages = allIngredients.filter(
        (ing) =>
          ing.image === FALLBACK_IMAGE &&
          !fetchedIngredients.current.has(ing.name),
      );

      // Process sequentially or in small batches to be nice to the API
      for (const ing of missingImages) {
        // Mark as fetched immediately to prevent loops
        fetchedIngredients.current.add(ing.name);

        // Small delay to debounce/rate limit
        // await new Promise(r => setTimeout(r, 200));

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

  const categories = [
    { id: "vegitables", label: "Vegetables", icon: Carrot, data: vegitables },
    { id: "fruits", label: "Fruits", icon: Apple, data: fruits },
    { id: "snacks", label: "Snacks", icon: Cookie, data: sweets }, // Using sweets as snacks/desserts pool
    { id: "beverages", label: "Beverages", icon: Coffee, data: drinks },
    { id: "desserts", label: "Desserts", icon: Cake, data: sweets },
    { id: "drinks", label: "Drinks", icon: Wine, data: drinks },
  ];

  const handleAddItem = () => {
    if (!selectedItemToAdd) return;

    const newItem = {
      name: selectedItemToAdd.name,
      quantity: addItemQuantity,
      unit: addItemUnit || selectedItemToAdd.unit,
      category:
        activeCategory === "desserts"
          ? "snacks"
          : activeCategory === "beverages"
            ? "drinks"
            : activeCategory,
      image: selectedItemToAdd.image,
      source: "Manual",
      price: 0, // Default 0 for manual items
    };

    setExtraItems((prev) => [...prev, newItem]);
    setSelectedItemToAdd(null);
    setAddItemQuantity(1);
    toast({
      title: "Item Added",
      description: `${newItem.name} added to list`,
    });
  };

  const handleRemoveExtraItem = (index: number) => {
    setExtraItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerateFinalList = () => {
    // Here you would save to backend or local storage for the final shopping list page
    localStorage.setItem(
      "finalShoppingList",
      JSON.stringify({
        ingredients: allIngredients,
        recipes: currentSelections,
      }),
    );
    router.push("/shopping-list");
  };

  const handleRecipeSelect = (recipe: any, slotKey: string) => {
    // Parse slotKey
    const lastHyphenIndex = slotKey.lastIndexOf("-");
    if (lastHyphenIndex === -1) return;
    const date = slotKey.substring(0, lastHyphenIndex);
    const meal = slotKey.substring(lastHyphenIndex + 1);

    dispatch(
      toggleMealPlan({
        date,
        mealType: meal,
        recipe,
      }),
    );
  };

  // Return early or show loading if not hydrated/redirecting
  if (!isHydrated || (isHydrated && Object.keys(plans).length === 0)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F3F0FD]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7dab4f]"></div>
          <p className="text-gray-500 font-medium">Loading your list...</p>
        </div>
      </div>
    );
  }

  // Show loading if backend is fetching
  if (isLoadingBackend && allIngredients.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F3F0FD]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7dab4f]"></div>
          <p className="text-gray-500 font-medium">Merging ingredients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-57px)] bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00] relative overflow-auto">
      <div className="max-w-8xl mx-auto px-4 md:px-6 relative z-10 py-8">
        {/* Header */}

        <div className="flex flex-col items-start lg:items-center justify-between mb-6 gap-3 animate-fade-in relative">
          <Button
            variant="ghost"
            className="absolute md:left-0 -top-2 md:top-1/2 md:-translate-y-1/2 p-0 hover:bg-transparent text-gray-500 hover:text-gray-900 flex gap-1"
            onClick={() => router.back()}
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </Button>
          <div className="flex items-center gap-2 mt-8 md:mt-0">
            <span className="bg-[#7dab4f] font-bold text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1">
              Smart Shopping
            </span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#313131] tracking-tight">
              Build Your Recipe-Driven Shopping List
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Start with recipes, add extra items, and finalize your groceries
              in one place.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-white via-[#F3F0FD] to-white border border-[#EDE9FF] rounded-xl p-6 py-4 mb-6">
          <div className="flex gap-3 items-center font-bold mb-4 flex-wrap">
            <ShoppingCart className="size-5 text-[var(--primary)]" />
            Add Grocery Items
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
                      <cat.icon
                        className="size-8 group-hover:hidden transition-all"
                        strokeWidth={1.2}
                      />
                      <Plus
                        className="size-8 hidden group-hover:flex transition-all"
                        strokeWidth={1.2}
                      />
                    </span>
                    <div className="group-hover:hidden transition-all">
                      {cat.label}
                    </div>
                    <div className="hidden group-hover:flex transition-all">
                      Add Items
                    </div>
                  </button>
                </DialogTrigger>
              ))}

              <DialogContent className="sm:max-w-[800px] bg-white border-none">
                <DialogHeader>
                  <DialogTitle>
                    Add {categories.find((c) => c.id === activeCategory)?.label}
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col md:flex-row gap-5">
                  {/* Left Side: Search & List */}
                  <div className="flex-1 flex flex-col gap-4 border-b lg:border-b-0 border-r-0 lg:border-r border-gray-100 pb-5 lg:pr-5">
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type="text"
                        placeholder={`Search ${activeCategory}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-[#E2E2E2] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-black"
                      />
                    </div>
                    <ScrollArea className="max-h-[158px] lg:max-h-[338px] overflow-auto">
                      <div className="grid grid-cols-2 gap-3">
                        {categories
                          .find((c) => c.id === activeCategory)
                          ?.data.filter((item) =>
                            item.name
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()),
                          )
                          .map((item, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                setSelectedItemToAdd(item);
                                setAddItemUnit(item.unit);
                                setAddItemQuantity(1);
                              }}
                              className={`
                                                                flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all
                                                                ${selectedItemToAdd?.name ===
                                  item.name
                                  ? "border-[var(--primary)] bg-[#F4F1FD]"
                                  : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                                }
                                                            `}
                            >
                              <div className="w-10 h-10 rounded bg-white flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-700 line-clamp-1">
                                {item.name}
                              </span>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Right Side: Selection Details */}
                  <div className="w-full md:w-[300px] flex flex-col justify-between">
                    {selectedItemToAdd ? (
                      <div className="flex flex-col h-full">
                        <div className="flex-1">
                          <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100 mb-4 border border-gray-200">
                            <img
                              src={selectedItemToAdd.image}
                              alt={selectedItemToAdd.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {selectedItemToAdd.name}
                          </h3>
                          <p className="text-sm text-gray-500 capitalize mb-4">
                            {selectedItemToAdd.category} •{" "}
                            {selectedItemToAdd.unit}
                          </p>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Quantity</Label>
                              <div className="flex items-center border border-gray-200 rounded-lg p-1 w-full max-w-[150px]">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    setAddItemQuantity(
                                      Math.max(1, addItemQuantity - 1),
                                    )
                                  }
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
                                  onClick={() =>
                                    setAddItemQuantity(addItemQuantity + 1)
                                  }
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button
                          className="h-11 text-white w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 mt-4"
                          onClick={handleAddItem}
                        >
                          Add to List
                        </Button>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-4 border-2 border-dashed border-gray-100 rounded-xl">
                        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                          <ShoppingCart className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="text-sm font-normal">
                          Select an item to add details
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex flex-wrap lg:flex-nowrap gap-4">
          <div className="bg-gradient-to-r from-white via-[#F3F0FD] to-white border border-[#EDE9FF] rounded-xl p-4 w-full">
            <div className="flex gap-3 items-center font-bold mb-4 flex-wrap">
              <ListCheck className="size-5 text-[var(--primary)]" />
              Shopping List Preview
              <span className="rounded-full bg-[#F2EEFF] border border-[#e7e0fc] text-[var(--primary)] text-xs h-7 flex items-center px-3">
                {Object.values(groupedIngredients).flat().length} Items
              </span>
            </div>

            <div className="bg-[#fcfcfc] border border-[#f0f0f0] p-4 lg:p-6 rounded-xl min-h-[400px]">
              {allIngredients.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p>No ingredients yet.</p>
                  <p className="text-sm">
                    Select recipes or add items manually.
                  </p>
                </div>
              ) : (
                <>
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="flex flex-col gap-6">
                      {/* Render Categories */}
                      {Object.entries(groupedIngredients).map(
                        ([category, items]) => {
                          if (items.length === 0) return null;

                          let Icon = Carrot;
                          let label = "Vegetables";

                          switch (category) {
                            case "vegetables":
                              Icon = Carrot;
                              label = "Vegetables";
                              break;
                            case "fruits":
                              Icon = Apple;
                              label = "Fruits";
                              break;
                            case "snacks":
                              Icon = Cookie;
                              label = "Snacks";
                              break;
                            case "drinks":
                              Icon = Wine;
                              label = "Drinks";
                              break;
                            case "others":
                              Icon = ListCheck;
                              label = "Others";
                              break;
                            default:
                              Icon = ListCheck;
                              label = category;
                          }

                          // Capitalize label if generic
                          label =
                            label.charAt(0).toUpperCase() + label.slice(1);

                          return (
                            <div
                              key={category}
                              className="animate-in fade-in slide-in-from-bottom-2"
                            >
                              <div className="flex items-center justify-between mb-3 group">
                                <div className="flex items-center gap-2">
                                  <Icon className="size-5 text-gray-700" />
                                  <h3 className="font-bold text-gray-800 text-lg">
                                    {label}
                                  </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-[#EFE9FF] text-[var(--primary)] text-xs font-bold px-2 py-1 rounded-full">
                                    {items.length}{" "}
                                    {items.length === 1 ? "item" : "items"}
                                  </span>
                                  <div className="flex gap-1 ml-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-gray-400 hover:text-[var(--primary)]"
                                      onClick={() =>
                                        toggleEditCategory(category)
                                      }
                                    >
                                      <Pencil className="size-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-gray-400 hover:text-red-500"
                                      onClick={() =>
                                        handleClearCategory(category)
                                      }
                                    >
                                      <Trash2 className="size-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                {items.map((item: any, i) => (
                                  <div
                                    key={i}
                                    className="group/item flex items-center justify-between p-3 border-b border-gray-50 last:border-0 hover:bg-[#fafafa] transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 cursor-zoom-in relative group/image">
                                            <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors flex items-center justify-center">
                                              <Search className="text-white w-4 h-4 opacity-0 group-hover/image:opacity-100 transition-opacity" />
                                            </div>
                                            <img
                                              src={item.image}
                                              alt={item.name}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px] p-0 border-none bg-white overflow-hidden gap-0 shadow-2xl">
                                          <div className="relative w-full aspect-[4/3] bg-gray-50">
                                            <img
                                              src={item.image}
                                              alt={item.name}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                          <div className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                              <div>
                                                <h3 className="text-xl font-bold text-gray-900 capitalize leading-tight">
                                                  {item.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1 capitalize font-medium">
                                                  {item.category || "General"}
                                                </p>
                                              </div>
                                              {item.price > 0 && (
                                                <div className="text-right">
                                                  <p className="text-lg font-bold text-[var(--primary)]">
                                                    $
                                                    {(
                                                      (item.price || 0) *
                                                      (item.displayQuantity || 1)
                                                    ).toFixed(2)}
                                                  </p>
                                                  <p className="text-xs text-gray-400">
                                                    ${item.price}/{item.unit}
                                                  </p>
                                                </div>
                                              )}
                                            </div>

                                            <div className="flex gap-4 mt-6 pt-4 border-t border-gray-100">
                                              <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                                                <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                                                  Quantity
                                                </span>
                                                <span className="block text-lg font-bold text-gray-900 mt-0.5">
                                                  {item.displayQuantity}{" "}
                                                  {item.unit}
                                                </span>
                                              </div>
                                              {item.source && (
                                                <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                                                  <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                                                    Source
                                                  </span>
                                                  <span className="block text-sm font-bold text-gray-900 mt-1.5 truncate max-w-[140px] mx-auto">
                                                    {item.source === "Recipe"
                                                      ? item.recipeName ||
                                                      "Recipe"
                                                      : "Manual Add"}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                      <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-gray-900 line-clamp-1 text-sm md:text-base">
                                            {item.name}
                                          </span>
                                          {(item.source === "Manual" || item.source === "Manual Add") && (
                                            <span className="text-[10px] font-bold text-[var(--primary)] bg-[#F3F0FD] px-1.5 py-0.5 rounded border border-[var(--primary)]/20">
                                              Manual
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-xs text-gray-500">
                                          {item.quantity ?? 1} {item.unit}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-4 md:gap-8">
                                      <div className="flex items-center border border-gray-200 rounded-lg bg-white h-8">
                                        <button
                                          className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-[var(--primary)] hover:bg-gray-50 rounded-l-lg transition-colors"
                                          onClick={() => {
                                            const step = getStepSize(item.displayUnit);
                                            // Ensure we don't go below 0 with float precision issues

                                            const newVal = Math.max(0, Number((item.displayQuantity - step).toFixed(3)));

                                            handleUpdateQuantity(
                                              item.originalIndex,
                                              newVal,
                                              item.displayUnit
                                            );
                                          }}
                                        >
                                          <Minus className="size-3" />
                                        </button>
                                        <span className="min-w-[3rem] px-2 h-full flex items-center justify-center text-center text-sm font-medium text-gray-700">
                                          {item.displayQuantity} {item.displayUnit}
                                        </span>
                                        <button
                                          className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-[var(--primary)] hover:bg-gray-50 rounded-r-lg transition-colors"
                                          onClick={() => {
                                            const step = getStepSize(item.displayUnit);
                                            const newVal = Number((item.displayQuantity + step).toFixed(3));
                                            handleUpdateQuantity(
                                              item.originalIndex,
                                              newVal,
                                              item.displayUnit
                                            );
                                          }}
                                        >
                                          <Plus className="size-3" />
                                        </button>
                                      </div>

                                      <div className="flex items-center gap-3 min-w-[60px] justify-end">
                                        {item.price > 0 && (
                                          <span className="font-semibold text-gray-900 text-sm">
                                            $
                                            {(item.price || 0) *
                                              (item.displayQuantity || 1)}
                                          </span>
                                        )}
                                      </div>

                                      {/* Delete button only if editing category is active AND item is NOT from backend */}
                                      {editingCategories.has(category) && item.source !== "Recipe" && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-red-500 hover:bg-red-50"
                                          onClick={() =>
                                            handleRemoveItemByIndex(
                                              item.originalIndex,
                                            )
                                          }
                                        >
                                          <X className="size-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </ScrollArea>
                  {Object.values(groupedIngredients)
                    .flat()
                    .reduce(
                      (acc: number, item: any) =>
                        acc + (item.price || 0) * (item.displayQuantity || 1),
                      0,
                    ) > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-lg font-bold">
                        <span>Total Estimate</span>
                        <span className="text-[var(--primary)]">
                          $
                          {Object.values(groupedIngredients)
                            .flat()
                            .reduce(
                              (acc: number, item: any) =>
                                acc +
                                (item.price || 0) * (item.displayQuantity || 1),
                              0,
                            )}
                        </span>
                      </div>
                    )}
                </>
              )}
            </div>
          </div>

          <div className="lg:max-w-[550px] w-full bg-[#e9e2fe] rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white p-4 flex justify-between items-center">
              Selected Recipes
              <span className="text-sm font-normal">
                {Object.values(plans).reduce(
                  (acc, day) =>
                    acc +
                    Object.values(day).reduce(
                      (dAcc, recipes) =>
                        dAcc + (Array.isArray(recipes) ? recipes.length : 1),
                      0,
                    ),
                  0,
                )}{" "}
                Items
              </span>
            </div>

            <ScrollArea className="w-full p-4 h-[calc(100vh-280px)]">
              <div className="space-y-2">
                {Object.keys(plans).length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <p className="text-sm">No recipes selected yet</p>
                    <p className="text-xs mt-1">Go back to select recipes</p>
                  </div>
                ) : (
                  Object.entries(plans).map(([date, meals]) => {
                    const dateObj = new Date(date);
                    const shortDate = dateObj.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <div key={date} className="space-y-2">
                        <div className="flex justify-between items-center bg-white rounded-lg p-2 border border-[#DDD6FA] sticky top-0 z-10 shadow-sm">
                          <p className="font-semibold text-gray-900">
                            {shortDate}
                          </p>
                        </div>

                        {Object.entries(meals).map(([mealType, recipes]) => {
                          if (!recipes) return null;
                          const recipeList = Array.isArray(recipes)
                            ? recipes
                            : [recipes];
                          return recipeList.map((recipe) => (
                            <div
                              key={`${date}-${mealType}-${recipe.id}`}
                              className="bg-white rounded-lg p-3 space-y-3 relative cursor-pointer hover:shadow-md transition-shadow border border-transparent hover:border-[var(--primary)]/20 mb-2"
                              onClick={() => {
                                setDetailedRecipe(recipe as any);
                                setIsDetailsOpen(true);
                              }}
                            >
                              <div className="flex gap-3">
                                <div className="h-16 w-16 shrink-0 rounded-md bg-gray-100 overflow-hidden">
                                  {recipe.image || (recipe as any).imageUrl ? (
                                    <img
                                      src={
                                        getRecipeImageUrl(
                                          recipe.image ||
                                          (recipe as any).imageUrl,
                                        )!
                                      }
                                      alt={recipe.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                      <Apple className="text-gray-300 size-6" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-gray-900 line-clamp-1 text-sm">
                                      {recipe.name}
                                    </h3>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] bg-[#F2EEFF] px-1.5 py-0.5 rounded-sm">
                                      {mealType}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                    {recipe.description}
                                  </p>

                                  <div className="flex gap-3 mt-2 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <Clock className="size-3" />
                                      <span>{recipe.prepTime || "30"}m</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Flame className="size-3" />
                                      <span>
                                        {recipe.nutrition?.calories ||
                                          recipe.calories ||
                                          "250"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ));
                        })}
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="rounded-lg bg-[#e9e2fe] mt-5 p-4">
          <div className="flex gap-3 items-center font-bold justify-between flex-wrap">
            <div className="flex flex-col">
              <div className="text-[var(--primary)]">Ready to shop?</div>
              <span className="text-sm font-medium text-black/60">
                You have {allIngredients.length} items from{" "}
                {allIngredients.length > 0 ? Object.keys(plans).length + 1 : 0}{" "}
                sources
              </span>
            </div>


            <Button
              variant={"outline"}
              type="button"
              className="border border-[var(--primary)] bg-white text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all shadow-sm"
              onClick={async () => {
                try {
                  toast({
                    title: "Generating...",
                    description: "Preparing your shopping list...",
                  });

                  const ingredients = allIngredients;
                  const payload = { ingredients };

                  // 1. Download PDF
                  const service = new RecipeService();
                  await service.downloadShoppingListPdf(payload);

                  toast({
                    title: "Download Started",
                    description: "Your shopping list PDF is downloading...",
                  });

                  // 2. Navigate to Shopping List Page
                  // handleGenerateFinalList();

                } catch (error) {
                  console.error("Download failed", error);
                  toast({
                    title: "Download Failed",
                    description: "Could not generate PDF. Proceeding to list...",
                    variant: "destructive",
                  });

                  // Proceed anyway so user isn't stuck
                  handleGenerateFinalList();
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" /> Generate Shopping List
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

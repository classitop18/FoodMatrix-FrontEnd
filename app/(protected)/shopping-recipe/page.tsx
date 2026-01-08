"use client";

import { useState, useEffect } from "react";
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
  IndianRupee,
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
import { Recipe as ApiRecipe } from "@/services/recipe";
import { Input } from "@/components/ui/input";
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
import { toggleMealPlan } from "@/redux/features/meal-plan/meal-plan.slice";
import { getRecipeImageUrl } from "@/lib/recipe-utils";
import { ChevronLeft } from "lucide-react";
import { fruits, vegitables, drinks, sweets } from "@/data/add-items";
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

  // Derived selections
  const currentSelections: Record<string, string> = {};
  Object.entries(plans).forEach(([date, meals]) => {
    Object.entries(meals).forEach(([mealType, recipe]) => {
      const slotKey = `${date}-${mealType}`;
      if (recipe && recipe.id) {
        currentSelections[slotKey] = recipe.id;
      }
    });
  });

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

  // Derived Ingredients List
  const allIngredients = [
    ...Object.values(plans).flatMap((day) =>
      Object.values(day).flatMap((recipe) =>
        (recipe?.ingredients || []).map((ing: any) => ({
          ...ing,
          source: "Recipe",
          recipeName: recipe?.name,
        })),
      ),
    ),
    ...extraItems,
  ];

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
      category: activeCategory,
      image: selectedItemToAdd.image,
      source: "Manual",
      price: 50, // Placeholder price
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

          <div className="flex flex-wrap gap-4 lg:gap-6">
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
                    className="border border-[#EDE9FF] rounded-xl p-4 bg-white text-sm font-medium flex flex-col gap-2 justify-center items-center hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all group min-w-[108px]"
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
                <div className="flex flex-col md:flex-row gap-6 h-[500px]">
                  {/* Left Side: Search & List */}
                  <div className="flex-1 flex flex-col gap-4 border-r border-gray-100 pr-4">
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
                    <ScrollArea className="flex-1">
                      <div className="grid grid-cols-2 gap-3 p-1">
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
                                  : "border-transparent hover:bg-gray-50 hover:border-gray-200"
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
                          <p className="text-sm text-gray-500 capitalize mb-6">
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
                                  className="h-8 border-0 text-center focus-visible:ring-0 w-full"
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
                          className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 mt-4"
                          onClick={handleAddItem}
                        >
                          Add to List
                        </Button>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-4 border-2 border-dashed border-gray-100 rounded-xl">
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                          <ShoppingCart className="h-6 w-6 text-gray-300" />
                        </div>
                        <p className="text-sm">Select an item to add details</p>
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
                {allIngredients.length} Items
              </span>
            </div>

            <div className="border border-[#EDE9FF] p-4 rounded-xl bg-white max-h-[600px] overflow-y-auto">
              {allIngredients.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p>No ingredients yet.</p>
                  <p className="text-sm">
                    Select recipes or add items manually.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Group by category logic could go here, for now linear list */}
                  {allIngredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 flex-wrap justify-between w-full items-center border-b border-gray-50 pb-3 last:border-0 hover:bg-gray-50/50 p-2 rounded-lg transition-all"
                    >
                      <div className="flex gap-4 items-center w-full xl:w-60">
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 shrink-0 border border-gray-100 flex items-center justify-center">
                          {ing.image ? (
                            <img
                              src={ing.image}
                              alt={ing.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-gray-400">Img</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="line-clamp-1 text-sm font-medium text-gray-900">
                            {ing.name || ing.item}
                          </h5>
                          <p className="text-gray-400 text-xs truncate">
                            {ing.quantity || 1} {ing.unit} •{" "}
                            {ing.source === "Recipe" ? "From Recipe" : "Manual"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-[var(--primary)] whitespace-nowrap">
                          <IndianRupee className="size-3 inline mr-1" />
                          {ing.price || 0}
                        </span>
                        {ing.source === "Manual" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-50"
                            onClick={() =>
                              handleRemoveExtraItem(
                                allIngredients.indexOf(ing) -
                                (allIngredients.length - extraItems.length),
                              )
                            } // Determine functionality relative to extra items array
                          >
                            <Trash className="size-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:max-w-[550px] w-full bg-[#e9e2fe] rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white p-4 flex justify-between items-center">
              Selected Recipes
              <span className="text-sm font-normal">
                {Object.values(plans).reduce(
                  (acc, day) => acc + Object.keys(day).length,
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

                        {Object.entries(meals).map(([mealType, recipe]) => {
                          if (!recipe) return null;
                          return (
                            <div
                              key={`${date}-${mealType}`}
                              className="bg-white rounded-lg p-3 space-y-3 relative cursor-pointer hover:shadow-md transition-shadow border border-transparent hover:border-[var(--primary)]/20"
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
                          );
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
              onClick={handleGenerateFinalList}
            >
              <Download className="mr-2 h-4 w-4" /> Generate Shopping List
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

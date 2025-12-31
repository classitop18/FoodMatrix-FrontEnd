"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChefHat,
  ShoppingCart,
  ArrowRight,
  Sparkles,
  Search,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

import {
  useAddRecipeMutation,
  useGenerateAICustomRecipeMutation,
  useGenerateAIRecipeMutation,
} from "@/api/recipe";
import {
  cuisineOptions,
  RecipeEntry,
  RecipePayload,
  SlotProcessingState,
  recipeDatabase,
  Recipe,
} from "@/lib/recipe-constants";

import RecipeSelectionCard, {
  Slot,
} from "@/components/meal-planning/recipe-selection-card";

interface Member {
  id: string;
  name: string;
  age: number;
  sex: "male" | "female" | "other";
  healthProfile?: {
    dietaryRestrictions?: string[];
    allergies?: string[];
    healthConditions?: string[];
    healthGoals?: string[];
  };
}

export default function RecipeSelection() {
  const router = useRouter();
  const { toast } = useToast();

  const [mealSlots, setMealSlots] = useState<Slot[]>([]);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [generatedRecipies, setGeneratedRecipies] = useState<
    Record<string, { recipes: Recipe[] }>
  >({});
  const [generatedCustomRecipies, setGeneratedCustomRecipies] = useState<
    Record<string, { recipes: Recipe[] }>
  >({});

  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  const [recipePayload, setRecipePayload] = useState<RecipePayload>({});
  const [isSlotProcessing, setIsSlotProcessing] = useState<SlotProcessingState>(
    {},
  );

  // Mutations
  const generateRecipeWithAi = useGenerateAIRecipeMutation();
  const generateCustomRecipeWithAi = useGenerateAICustomRecipeMutation();

  // Load Members
  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ["/api/members-with-health"],
    // Query function would normally fetch here, assuming global fetcher or configured
    enabled: true,
  });

  // Initialize Slots from Local Storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mealplanner:weekPlan");
      if (!saved) return;

      const weekPlan = JSON.parse(saved);
      const slots: Slot[] = [];

      (["breakfast", "lunch", "dinner"] as const).forEach((mealTime) => {
        Object.entries(weekPlan).forEach(([date, meals]: [string, any]) => {
          const mealType = meals?.[mealTime]?.type;
          if (["cook-home", "quick-simple", "meal-prep"].includes(mealType)) {
            slots.push({
              date,
              meal: mealTime.toUpperCase(),
              type:
                mealType === "cook-home"
                  ? "Cook at home"
                  : mealType === "quick-simple"
                    ? "Quick/Simple"
                    : "Meal prep",
            });
          }
        });
      });
      setMealSlots(slots);
    } catch (e) {
      console.error("Failed to load meal slots", e);
    }
  }, []);

  // Helper to update payload
  const generateRecipePayload = (
    slotKey: string,
    key: keyof RecipeEntry,
    value: any,
  ) => {
    setRecipePayload((prev) => ({
      ...prev,
      [slotKey]: {
        ...(prev[slotKey] || {}),
        [key]: value,
      },
    }));
  };

  // Generate Recipe Logic
  const generateRecipe = async (slot: Slot) => {
    const slotKey = `${slot.date}-${slot.meal}`;
    const payload = recipePayload[slotKey];

    if (!payload?.cuisine) {
      toast({
        title: "Select Cuisine",
        description: "Please select a cuisine first.",
        variant: "destructive",
      });
      return;
    }

    setIsSlotProcessing((prev) => ({
      ...prev,
      [slotKey]: { ...prev[slotKey], isRecipeLoading: true },
    }));

    try {
      const response = await generateRecipeWithAi.mutateAsync({
        mealType: slot.meal.toLowerCase(),
        memberCount: payload.members?.length || members.length || 4,
        maxBudgetPerServing: 8,
        preferredCuisines: [payload.cuisine],
        recipeCount: Number(payload.recipeCount) || 1,
        usePantryItems:
          payload.pantryOption === "can-use" ||
          payload.pantryOption === "only-pantry",
        pantryOnly: payload.pantryOption === "only-pantry",
        targetMembers: payload.members,
      });

      const recipes = (response.recipes || []).map((r: any, idx: number) => ({
        ...r,
        id: r.id || `ai-${slotKey}-${idx}-${Date.now()}`,
        complementaryItems: [],
        isAIGenerated: true,
      }));

      setGeneratedRecipies((prev) => ({
        ...prev,
        [slotKey]: { recipes },
      }));

      toast({
        title: "Recipes Generated!",
        description: `Found ${recipes.length} recipes.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate recipes.",
        variant: "destructive",
      });
    } finally {
      setIsSlotProcessing((prev) => ({
        ...prev,
        [slotKey]: { ...prev[slotKey], isRecipeLoading: false },
      }));
    }
  };

  // Custom Recipe Logic
  const generateCustomRecipe = async (slot: Slot) => {
    const slotKey = `${slot.date}-${slot.meal}`;
    const customName = recipePayload[slotKey]?.customRecipe;

    if (!customName) return;

    setIsSlotProcessing((prev) => ({
      ...prev,
      [slotKey]: { ...prev[slotKey], isCustomRecipeLoading: true },
    }));

    try {
      const response = await generateCustomRecipeWithAi.mutateAsync({
        recipeName: customName,
        mealType: slot.meal.toLowerCase(),
        servings: 4,
      });

      const recipe = response.data?.recipe;
      if (recipe) {
        const processed = {
          ...recipe,
          id: recipe.id || `custom-${slotKey}-${Date.now()}`,
          isAIGenerated: true,
        };
        setGeneratedCustomRecipies((prev) => ({
          ...prev,
          [slotKey]: { recipes: [processed] },
        }));
        toast({ title: "Recipe Found!", description: `Found ${customName}` });
      }
    } catch {
      toast({
        title: "Error",
        description: "Could not find custom recipe.",
        variant: "destructive",
      });
    } finally {
      setIsSlotProcessing((prev) => ({
        ...prev,
        [slotKey]: { ...prev[slotKey], isCustomRecipeLoading: false },
      }));
    }
  };

  const handleRecipeSelect = (recipe: any, slotKey: string) => {
    setSelections((prev) => ({ ...prev, [slotKey]: recipe.id }));
    if (!selectedRecipes.includes(recipe.id)) {
      setSelectedRecipes((prev) => [...prev, recipe.id]);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    Object.entries(selections).forEach(([slotKey, recipeId]) => {
      const allRecipes = [
        ...recipeDatabase,
        ...(generatedRecipies[slotKey]?.recipes || []),
        ...(generatedCustomRecipies[slotKey]?.recipes || []),
      ];
      const r = allRecipes.find((r) => r.id === recipeId);
      if (r) {
        total += r.price || r.costAnalysis?.totalCost || 0;
      }
    });
    return total;
  };

  const handleGenerateShoppingList = () => {
    // Collect all selected recipe data
    const selectedData: any = {};
    const recipeIds: string[] = [];

    Object.entries(selections).forEach(([slotKey, recipeId]) => {
      const allRecipes = [
        ...recipeDatabase,
        ...(generatedRecipies[slotKey]?.recipes || []),
        ...(generatedCustomRecipies[slotKey]?.recipes || []),
      ];
      const r = allRecipes.find((r) => r.id === recipeId);
      if (r) {
        selectedData[recipeId] = r;
        recipeIds.push(recipeId);
      }
    });

    localStorage.setItem(
      "foodmatrix-selected-recipes",
      JSON.stringify({
        recipeIds,
        additionalRecipes: selectedData,
        selections,
      }),
    );

    router.push("/shopping-list");
  };

  return (
    <div className="min-h-screen bg-[#F2F4F7] relative pb-20 font-sans">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-[#7dab4f]/10 to-transparent rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 py-12 max-w-8xl">
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <span className="bg-gradient-to-r from-[#7dab4f] to-[#5a8c3e] font-bold text-white text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg shadow-[#7dab4f]/20">
              <Sparkles size={12} className="fill-white" />
              AI Chef Assistant
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-[#1a1a1a] tracking-tight mb-4">
            Culinary Selection
          </h1>
          <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Personalize each meal with our AI chef. Choose cuisines, specific
            dishes, or let us surprise you.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content: Meal Slots */}
          <div className="xl:col-span-3 space-y-8">
            {mealSlots.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  No Meals Planned for Cooking
                </h3>
                <p className="text-gray-500">
                  Go back to Meal Planning to schedule some home-cooked meals.
                </p>
                <Button
                  onClick={() => router.push("/meal-planning")}
                  variant="outline"
                  className="mt-4"
                >
                  Go to Meal Planning
                </Button>
              </div>
            ) : (
              mealSlots.map((slot) => {
                const slotKey = `${slot.date}-${slot.meal}`;
                return (
                  <div
                    key={slotKey}
                    className="animate-in slide-in-from-bottom-4 duration-500"
                  >
                    <RecipeSelectionCard
                      slot={slot}
                      recipePayload={recipePayload}
                      members={members}
                      isSlotProcessing={isSlotProcessing}
                      recipes={generatedRecipies[slotKey]?.recipes || []}
                      customRecipes={
                        generatedCustomRecipies[slotKey]?.recipes || []
                      }
                      generateRecipePayload={generateRecipePayload}
                      onGenerateRecipe={generateRecipe}
                      onGenerateCustomRecipe={generateCustomRecipe}
                      onRecipeView={(r) => console.log("View", r)}
                      onRecipeSelect={(r) => handleRecipeSelect(r, slotKey)}
                      selectedRecipeId={selections[slotKey]}
                    />
                  </div>
                );
              })
            )}
          </div>
          {/* Sidebar: Summary */}
          <div className="xl:col-span-1 space-y-6">
            <div className="sticky top-8">
              <Card className="border-0 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.08)] bg-white/80 backdrop-blur-md overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-[#7dab4f] to-[#5a8c3e]" />
                <CardHeader>
                  <CardTitle>Selection Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                      Total Estimated Cost
                    </span>
                    <div className="text-3xl font-black text-[#1a1a1a]">
                      ${calculateTotal().toFixed(2)}
                    </div>
                    <span className="text-xs text-emerald-600/80 font-medium">
                      For {Object.keys(selections).length} meals
                    </span>
                  </div>

                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-3">
                      {Object.entries(selections).map(([key, id]) => {
                        // Find recipe details
                        const all = [
                          ...recipeDatabase,
                          ...(generatedRecipies[key]?.recipes || []),
                          ...(generatedCustomRecipies[key]?.recipes || []),
                        ];
                        const r = all.find((x) => x.id === id);
                        if (!r) return null;

                        return (
                          <div
                            key={key}
                            className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm relative group"
                          >
                            <button
                              onClick={() => {
                                const newSel = { ...selections };
                                delete newSel[key];
                                setSelections(newSel);
                                setSelectedRecipes((prev) =>
                                  prev.filter((x) => x !== id),
                                );
                              }}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                            >
                              &times;
                            </button>
                            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                              <ChefHat size={16} className="text-gray-400" />
                            </div>
                            <div className="overflow-hidden">
                              <h4 className="font-bold text-gray-900 text-sm truncate">
                                {r.name}
                              </h4>
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                {key.split("-")[1]}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {Object.keys(selections).length === 0 && (
                        <div className="text-center text-gray-400 py-8 text-sm">
                          No recipes selected yet
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  <Button
                    onClick={handleGenerateShoppingList}
                    className="w-full h-12 bg-[#1a1a1a] hover:bg-black text-white font-bold rounded-xl shadow-lg shadow-black/5 hover:-translate-y-0.5 transition-all"
                    disabled={Object.keys(selections).length === 0}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Generate Shopping List
                    <ArrowRight className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

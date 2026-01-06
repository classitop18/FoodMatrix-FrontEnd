"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChefHat,
  ShoppingCart,
  ArrowRight,
  Sparkles,
  Search,
  Info,
  Clock,
  Flame,
  DollarSign,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Plus,
  Check,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store.redux";
import { useMembers } from "@/services/member/member.query";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import { RecipeDetailsDialog } from "../recipes/components/recipe-details-dialog";
import { Recipe as ApiRecipe } from "@/api/recipe";

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

  const [detailedRecipe, setDetailedRecipe] = useState<ApiRecipe | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Mutations
  const generateRecipeWithAi = useGenerateAIRecipeMutation();
  const generateCustomRecipeWithAi = useGenerateAICustomRecipeMutation();

  // Load Members
  // Load Members
  const { activeAccountId } = useSelector((state: RootState) => state.account);
  const { data: membersData } = useMembers(
    {
      accountId: activeAccountId || "",
      limit: 100,
    },
    {
      enabled: !!activeAccountId,
    },
  );
  const members: Member[] = (membersData as any)?.data?.data || [];

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

      console.log(response, "AI Recipe Response");

      const recipes = (response.data || []).map((r: any, idx: number) => ({
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
    <div className="h-[calc(100vh-57px)] bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00] relative overflow-auto">
      {/* Background Decoration */}
      {/* <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-[#7dab4f]/10 to-transparent rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-[100px]" />
      </div> */}
      <div className="max-w-8xl mx-auto px-4 md:px-6 relative z-10 py-8">
        {/* Header */}

        <div className="flex flex-col items-start lg:items-center justify-between mb-6 gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="bg-[#7dab4f] font-bold text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1">
              <Sparkles size={12} className="fill-white" />
              AI Recipe Selection
            </span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#313131] tracking-tight">
              Smarter choices for effortless cooking
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Choose your cuisine and generate personalized AI recipes for each meal
            </p>
          </div>
        </div>

        <div className="flex flex-wrap lg:flex-nowrap gap-4">
          {mealSlots.length === 0 ? (
            <div className="flex-1 text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
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
            <>
              <Accordion
                type="single"
                collapsible
                className="w-full"
                defaultValue={mealSlots.length > 0 ? `date-${mealSlots[0].date}` : undefined}
              >
                {/* Group slots by date */}
                {Object.entries(
                  mealSlots.reduce((acc, slot) => {
                    const dateKey = slot.date.toString();
                    if (!acc[dateKey]) acc[dateKey] = [];
                    acc[dateKey].push(slot);
                    return acc;
                  }, {} as Record<string, Slot[]>)
                ).map(([date, slotsForDate], dateIndex) => {
                  const formattedDate = new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  return (
                    <AccordionItem value={`date-${date}`} key={date} className="">
                      <AccordionTrigger className="p-4 hover:underline-none items-center bg-[#e9e2fe] rounded-lg">
                        <div className="flex flex-col md:justify-between w-full gap-1">
                          <h3 className="truncate text-base font-semibold text-[#7661d3]">{formattedDate}</h3>
                          <span>{slotsForDate.length} meals planned</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-4 text-balance border border-[#F1EEFF] rounded-lg p-4 bg-white mt-3">
                        <Accordion
                          type="single"
                          collapsible
                          className="w-full"
                          defaultValue={slotsForDate.length > 0 ? `meal-${date}-${slotsForDate[0].meal}` : undefined}
                        >
                          {slotsForDate.map((slot, mealIndex) => {
                            const slotKey = `${slot.date}-${slot.meal}`;
                            const payload = recipePayload[slotKey] || {};
                            const generatedRecipes = generatedRecipies[slotKey]?.recipes || [];
                            const customRecipes = generatedCustomRecipies[slotKey]?.recipes || [];
                            const allRecipesForSlot = [...generatedRecipes, ...customRecipes];

                            return (
                              <AccordionItem value={`meal-${slotKey}`} key={slotKey} className="">
                                <AccordionTrigger className="p-0 items-center">
                                  <div className="flex flex-row md:justify-between w-full gap-2 items-center">
                                    <h3 className="truncate text-lg font-semibold text-black">{slot.meal}</h3>
                                    <span>Generate Recipes</span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="flex gap-4 flex-col mt-4">
                                  <div className="border border-[#F1EEFF] rounded-lg p-4 bg-white">
                                    <div className="w-100">
                                      <h5 className="font-medium text-[#7661d3] text-base">Ai Recipe Generator</h5>
                                      <p className="font-normal text-[#313131]">Search for specific recipes or ingredients</p>
                                    </div>

                                    <div className="flex flex-wrap justify-between gap-4 my-4 mb-6">
                                      <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-gray-700">
                                          AI Recipe Controls
                                        </label>

                                        <div className="flex gap-4 flex-wrap">
                                          <Select
                                            value={payload.cuisine}
                                            onValueChange={(value) =>
                                              generateRecipePayload(slotKey, "cuisine", value)
                                            }
                                          >
                                            <SelectTrigger className="w-[155px] h-11 rounded-lg border border-[#BCBCBC] text-black bg-white focus:ring-0 transition-all text-sm font-medium shadow-none">
                                              <SelectValue placeholder="Select Cuisine" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectGroup>
                                                {cuisineOptions.map((cuisine) => (
                                                  <SelectItem key={cuisine.value} value={cuisine.value} className="text-sm">
                                                    <span className="flex items-center gap-2">
                                                      <span>{cuisine.icon}</span>
                                                      <span>{cuisine.label}</span>
                                                    </span>
                                                  </SelectItem>
                                                ))}
                                              </SelectGroup>
                                            </SelectContent>
                                          </Select>

                                          <Select
                                            value={payload.members?.join(',') || 'all'}
                                            onValueChange={(value) => {
                                              if (value === 'all') {
                                                generateRecipePayload(slotKey, "members", members.map(m => m.id));
                                              } else {
                                                const selectedIds = value.split(',');
                                                generateRecipePayload(slotKey, "members", selectedIds);
                                              }
                                            }}
                                          >
                                            <SelectTrigger className="w-[220px] h-11 rounded-lg border border-[#BCBCBC] text-black bg-white focus:ring-0 transition-all text-sm font-medium shadow-none">
                                              <SelectValue placeholder="Select Members" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectGroup>
                                                <SelectItem value="all" className="text-sm">All Members ({members.length})</SelectItem>
                                                {members.map((member) => (
                                                  <SelectItem key={member.id} value={member.id} className="text-sm">
                                                    {member.name || member?.user?.firstName + `(${member?.user?.username})` || 'Unnamed Member'}
                                                  </SelectItem>
                                                ))}
                                              </SelectGroup>
                                            </SelectContent>
                                          </Select>

                                          <Select
                                            value={payload.recipeCount?.toString() || ''}
                                            onValueChange={(value) =>
                                              generateRecipePayload(slotKey, "recipeCount", value)
                                            }
                                          >
                                            <SelectTrigger className="w-[230px] h-11 rounded-lg border border-[#BCBCBC] text-black bg-white focus:ring-0 transition-all text-sm font-medium shadow-none">
                                              <SelectValue placeholder="Select Number of Recipes" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectGroup>
                                                {[1, 2, 3, 4, 5].map((num) => (
                                                  <SelectItem key={num} value={num.toString()} className="text-sm">
                                                    {num} Recipe{num > 1 ? 's' : ''}
                                                  </SelectItem>
                                                ))}
                                              </SelectGroup>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>

                                      <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-gray-700 flex gap-2 items-center">
                                          Pantry Preferences
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger>
                                                <Info className="w-3.5 h-3.5 text-gray-400" />
                                              </TooltipTrigger>
                                              <TooltipContent className="max-w-[190px] text-xs bg-black text-white p-2 rounded-md shadow-lg">
                                                Choose how to use your pantry items in recipe generation
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        </label>

                                        <Select
                                          value={payload.pantryOption || ''}
                                          onValueChange={(value) =>
                                            generateRecipePayload(slotKey, "pantryOption", value)
                                          }
                                        >
                                          <SelectTrigger className="w-[180px] h-11 rounded-lg border border-[#BCBCBC] text-black bg-white focus:ring-0 transition-all text-sm font-medium shadow-none">
                                            <SelectValue placeholder="Select Preferences" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectGroup>
                                              <SelectItem value="can-use" className="text-sm">Can Use Pantry</SelectItem>
                                              <SelectItem value="only-pantry" className="text-sm">Only Pantry Items</SelectItem>
                                              <SelectItem value="ignore" className="text-sm">Ignore Pantry</SelectItem>
                                            </SelectGroup>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>

                                    <Button
                                      className="border-[#3d326d] hover:bg-[#2d2454] text-[#2d2454] hover:text-white font-medium text-base rounded-lg h-10 transition-all"
                                      variant={"outline"}
                                      onClick={() => generateRecipe(slot)}
                                      disabled={isSlotProcessing[slotKey]?.isRecipeLoading}
                                    >
                                      {isSlotProcessing[slotKey]?.isRecipeLoading ? 'Generating...' : 'Generate Recipes'}
                                    </Button>
                                  </div>

                                  <div className="border border-[#DFF6C9] rounded-lg p-4 bg-gradient-to-r from-[#EFFAE4] to-[#effae450]">
                                    <div className="w-100">
                                      <h5 className="font-medium text-[#7661d3] text-base">Custom Recipe Search</h5>
                                      <p className="font-normal text-[#313131]">Search for specific recipes or ingredients</p>
                                    </div>
                                    <div className="relative mt-3">
                                      <Search
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        size={16}
                                      />
                                      <input
                                        type="text"
                                        placeholder="Search for recipes, ingredients, or cuisines..."
                                        value={payload.customRecipe || ''}
                                        onChange={(e) =>
                                          generateRecipePayload(slotKey, "customRecipe", e.target.value)
                                        }
                                        className="w-full pl-9 pr-3 py-2 bg-white/10 border border-[#E2E2E2] rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/20 transition-all text-sm font-normal h-13"
                                      />
                                      <Button
                                        className="text-white bg-(--primary) hover:bg-(--primary) font-medium ps-3! pe-3! py-1 h-10 rounded-lg text-base transition-all duration-300 cursor-pointer group relative flex items-center inset-shadow-[5px_5px_5px_rgba(0,0,0,0.30)] hover:inset-shadow-[-5px_-5px_5px_rgba(0,0,0,0.50)] min-w-26 justify-center absolute right-2 top-1/2 -translate-y-1/2"
                                        onClick={() => generateCustomRecipe(slot)}
                                        disabled={isSlotProcessing[slotKey]?.isCustomRecipeLoading || !payload.customRecipe}
                                      >
                                        {isSlotProcessing[slotKey]?.isCustomRecipeLoading ? 'Searching...' : 'Search'}
                                      </Button>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            );
                          })}
                        </Accordion>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>

              <div className="lg:max-w-[550px] w-full bg-[#e9e2fe] rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white p-4 flex justify-between items-center">
                  AI Generated Recipes
                  <span className="text-sm font-normal">
                    {Object.values(generatedRecipies).reduce((acc, val) => acc + (val?.recipes?.length || 0), 0) +
                      Object.values(generatedCustomRecipies).reduce((acc, val) => acc + (val?.recipes?.length || 0), 0)} Results
                  </span>
                </div>

                <ScrollArea className="w-full h-[calc(100vh-300px)] p-4">
                  <div className="space-y-2">
                    {Object.entries(generatedRecipies).length === 0 && Object.entries(generatedCustomRecipies).length === 0 ? (
                      <div className="text-center py-10 text-gray-500">
                        <p className="text-sm">No recipes generated yet</p>
                        <p className="text-xs mt-1">Select options and click Generate Recipes</p>
                      </div>
                    ) : (
                      Object.entries({ ...generatedRecipies, ...generatedCustomRecipies }).map(([slotKey, data]) => {
                        const recipes = data?.recipes || [];
                        if (recipes.length === 0) return null;

                        const [date, meal] = slotKey.split('-');
                        const shortDate = new Date(date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        });

                        return (
                          <div key={slotKey} className="space-y-2">
                            <div className="flex justify-between items-center bg-white rounded-lg p-2 border border-[#DDD6FA] sticky top-0 z-10">
                              <div>
                                <p className="font-semibold text-gray-900">{shortDate}</p>
                                <p className="text-xs text-gray-500">{recipes.length} Result{recipes.length > 1 ? 's' : ''}</p>
                              </div>
                              <span className="text-sm font-normal text-[var(--primary)]">{meal}</span>
                            </div>

                            {recipes.map((recipe) => {
                              const isSelected = selections[slotKey] === recipe.id;

                              return (
                                <div
                                  key={recipe.id}
                                  className="bg-white rounded-lg p-2 space-y-3 relative cursor-pointer hover:shadow-md transition-shadow"
                                  onClick={() => handleRecipeSelect(recipe, slotKey)}
                                >
                                  <div className="flex justify-between flex-col items-start">
                                    <h3 className="font-bold text-gray-900 relative mb-2 pr-8">
                                      {recipe.name || 'Untitled Recipe'}
                                    </h3>
                                    <span
                                      className={`w-6 h-6 ${isSelected ? 'bg-amber-500' : 'bg-[var(--primary)]'} rounded-tr-md rounded-bl-md absolute top-0 right-0 flex items-center justify-center`}
                                    >
                                      {isSelected ? (
                                        <Check className="size-4 text-white m-auto"></Check>
                                      ) : (
                                        <Plus className="size-4 text-white m-auto"></Plus>
                                      )}
                                    </span>

                                    <div className="flex gap-4 justify-between w-full">
                                      <p className="text-sm font-normal text-gray-500 line-clamp-2">
                                        {recipe.description || 'No description available'}
                                      </p>
                                      <div className="flex gap-3 flex-shrink-0">
                                        <ThumbsUp className="size-4 cursor-pointer hover:text-green-600 transition-colors"></ThumbsUp>
                                        <ThumbsDown className="size-4 cursor-pointer hover:text-red-600 transition-colors"></ThumbsDown>
                                        <Heart className="size-4 cursor-pointer hover:text-pink-600 transition-colors"></Heart>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4 text-sm text-black justify-between flex-wrap">
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-1">
                                        <Clock className="size-4"></Clock>
                                        <span>{recipe.prepTime || '30'} min</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Flame className="size-4"></Flame>
                                        <span>{recipe.nutrition?.calories || recipe.calories || '250'} cal</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <DollarSign className="size-4"></DollarSign>
                                        <span>{(recipe.price || recipe.costAnalysis?.totalCost || 5).toFixed(2)}</span>
                                      </div>
                                    </div>

                                    <Link
                                      href="#"
                                      className="text-sm font-medium text-[var(--primary)] underline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDetailedRecipe(recipe as any);
                                        setIsDetailsOpen(true);
                                      }}
                                    >
                                      See more
                                    </Link>
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
            </>
          )}
        </div>

      </div>
      <RecipeDetailsDialog
        recipe={detailedRecipe}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
}

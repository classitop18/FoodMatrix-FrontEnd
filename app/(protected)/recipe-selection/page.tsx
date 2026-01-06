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
    <div className="min-h-screen bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00] pb-8 relative overflow-hidden font-sans">
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
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#313131] tracking-tight">
              Smarter choices for effortless cooking
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Choose your cuisine and generate personalized AI recipes for each meal
            </p>
          </div>
        </div>

        <div className="flex flex-wrap lg:flex-nowrap gap-4">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="item-1"
          >
            <AccordionItem value="item-1" className="">
              <AccordionTrigger className="p-4 hover:underline-none items-center bg-[#e9e2fe] rounded-lg">
                <div className="flex flex-col md:justify-between w-full gap-1">
                  <h3 className="truncate text-base font-semibold text-[#7661d3]">Monday, Dec 29, 2025</h3>
                  <span>3 meals planned</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance border border-[#F1EEFF] rounded-lg p-4 bg-white mt-3">
                <Accordion
                  type="single"
                  collapsible
                  className="w-full"
                  defaultValue="item-1.0"
                >
                  <AccordionItem value="item-1.0" className="">
                    <AccordionTrigger className="p-0 items-center">
                      <div className="flex flex-row md:justify-between w-full gap-2 items-center">
                        <h3 className="truncate text-lg font-semibold text-black">Breakfast</h3>
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
                              <Select>
                                <SelectTrigger className="w-[155px] h-11 rounded-lg border border-[#BCBCBC] text-black bg-white focus:ring-0 transition-all text-sm font-medium shadow-none">
                                  <SelectValue placeholder="Select Cuisine" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectItem value="Cuisine1" className="text-sm">Cuisine 1</SelectItem>
                                    <SelectItem value="Cuisine2" className="text-sm">Cuisine 2</SelectItem>
                                    <SelectItem value="Cuisine3" className="text-sm">Cuisine 3</SelectItem>
                                    <SelectItem value="Cuisine4" className="text-sm">Cuisine 4</SelectItem>
                                    <SelectItem value="Cuisine5" className="text-sm">Cuisine 5</SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <Select>
                                <SelectTrigger className="w-[160px] h-11 rounded-lg border border-[#BCBCBC] text-black bg-white focus:ring-0 transition-all text-sm font-medium shadow-none">
                                  <SelectValue placeholder="Select Members" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectItem value="Members1" className="text-sm">Members 1</SelectItem>
                                    <SelectItem value="Members2" className="text-sm">Members 2</SelectItem>
                                    <SelectItem value="Members3" className="text-sm">Members 3</SelectItem>
                                    <SelectItem value="Members4" className="text-sm">Members 4</SelectItem>
                                    <SelectItem value="Members5" className="text-sm">Members 5</SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <Select>
                                <SelectTrigger className="w-[230px] h-11 rounded-lg border border-[#BCBCBC] text-black bg-white focus:ring-0 transition-all text-sm font-medium shadow-none">
                                  <SelectValue placeholder="Select Number of Recipes" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectItem value="Recipes1" className="text-sm">Recipes 1</SelectItem>
                                    <SelectItem value="Recipes2" className="text-sm">Recipes 2</SelectItem>
                                    <SelectItem value="Recipes3" className="text-sm">Recipes 3</SelectItem>
                                    <SelectItem value="Recipes4" className="text-sm">Recipes 4</SelectItem>
                                    <SelectItem value="Recipes5" className="text-sm">Recipes 5</SelectItem>
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


                            <Select>
                              <SelectTrigger className="w-[180px] h-11 rounded-lg border border-[#BCBCBC] text-black bg-white focus:ring-0 transition-all text-sm font-medium shadow-none">
                                <SelectValue placeholder="Select Preferences" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="Preferences1" className="text-sm">Preferences 1</SelectItem>
                                  <SelectItem value="Preferences2" className="text-sm">Preferences 2</SelectItem>
                                  <SelectItem value="Preferences3" className="text-sm">Preferences 3</SelectItem>
                                  <SelectItem value="Preferences4" className="text-sm">Preferences 4</SelectItem>
                                  <SelectItem value="Preferences5" className="text-sm">Preferences 5</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Button className="border-[#3d326d] hover:bg-[#2d2454] text-[#2d2454] hover:text-white font-medium text-base rounded-lg h-10 transition-all" variant={"outline"}>
                          Generate Recipes
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
                            className="w-full pl-9 pr-3 py-2 bg-white/10 border border-[#E2E2E2] rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/20 transition-all text-sm font-normal h-13" />
                          <Button className="text-white bg-(--primary) hover:bg-(--primary) font-medium ps-3! pe-3! py-1 h-10 rounded-lg text-base transition-all duration-300 cursor-pointer group relative flex items-center
            inset-shadow-[5px_5px_5px_rgba(0,0,0,0.30)] hover:inset-shadow-[-5px_-5px_5px_rgba(0,0,0,0.50)] min-w-26 justify-center absolute right-2 top-1/2 -translate-y-1/2">
                            Search
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="lg:max-w-[400px] w-full bg-[#e9e2fe] rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white p-4 flex justify-between items-center">
              AI Generated Recipes
              <span className="text-sm font-normal">2 Results</span>
            </div>

            <div className="w-full space-y-2 p-4">

              <div className="flex justify-between items-center bg-white rounded-lg p-2 border border-[#DDD6FA]">
                <div>
                  <p className="font-semibold text-gray-900">Mon, Dec 29</p>
                  <p className="text-xs text-gray-500">2 Results</p>
                </div>
                <span className="text-sm font-normal text-[var(--primary)]">Breakfast</span>
              </div>

              <div className="bg-white rounded-lg p-2  space-y-3 relative">
                <div className="flex justify-between flex-col items-start">
                  <h3 className="font-bold text-gray-900 relative mb-2">
                    Blueberry Protein Pancakes
                  </h3>
                  <span className="w-6 h-6 bg-amber-500 rounded-tr-md rounded-bl-md absolute top-0 right-0 flex items-center justify-center">
                    <Check className="size-4 text-white m-auto"></Check>
                  </span>

                  <div className="flex gap-4 justify-between w-full">
                    <p className="text-sm font-normal text-gray-500">
                      Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sit ullam quis iste eum sint itaque eos architecto voluptas pariatur officiis.
                    </p>
                    <div className="flex gap-3">
                      <ThumbsUp className="size-4"></ThumbsUp>
                      <ThumbsDown className="size-4"></ThumbsDown>
                      <Heart className="size-4"></Heart>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-black justify-between flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="size-4"></Clock>
                      <span>15 min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="size-4"></Flame>
                      <span>320 cal</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="size-4"></DollarSign>
                      <span>4.50</span>
                    </div>
                  </div>

                  <Link href={'/'} className="text-sm font-medium text-[var(--primary)] underline">See more</Link>
                </div>
              </div>

              <div className="bg-white rounded-lg p-2  space-y-3 relative">
                <div className="flex justify-between flex-col items-start">
                  <h3 className="font-bold text-gray-900 relative mb-2">
                    Blueberry Protein Pancakes
                  </h3>
                  <span className="w-6 h-6 bg-[var(--primary)] rounded-tr-md rounded-bl-md absolute top-0 right-0 flex items-center justify-center">
                    <Plus className="size-4 text-white m-auto"></Plus>
                  </span>

                  <div className="flex gap-4 justify-between w-full">
                    <p className="text-sm font-normal text-gray-500">
                      Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sit ullam quis iste eum sint itaque eos architecto voluptas pariatur officiis.
                    </p>
                    <div className="flex gap-3">
                      <ThumbsUp className="size-4"></ThumbsUp>
                      <ThumbsDown className="size-4"></ThumbsDown>
                      <Heart className="size-4"></Heart>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-black justify-between flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="size-4"></Clock>
                      <span>15 min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="size-4"></Flame>
                      <span>320 cal</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="size-4"></DollarSign>
                      <span>4.50</span>
                    </div>
                  </div>

                  <Link href={'/'} className="text-sm font-medium text-[var(--primary)] underline">See more</Link>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 hidden">
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
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
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
                            className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100  relative group"
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
                    className="w-full h-12 bg-[#1a1a1a] hover:bg-black text-white font-bold rounded-lg shadow-lg shadow-black/5 hover:-translate-y-0.5 transition-all"
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

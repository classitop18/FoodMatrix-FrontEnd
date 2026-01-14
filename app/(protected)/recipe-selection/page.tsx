"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverAnchor,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ChefHat,
  Sparkles,
  Search,
  Info,
  Clock,
  Flame,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Plus,
  Check,
  ChevronDown,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import {
  toggleMealPlan,
  setGeneratedRecipes,
  setGeneratedCustomRecipes,
} from "@/redux/features/meal-plan/meal-plan.slice";
import { RootState } from "@/redux/store.redux";
import { useMembers } from "@/services/member/member.query";
import { useToast } from "@/hooks/use-toast";

import {
  useGenerateAICustomRecipeMutation,
  useGenerateAIRecipeMutation,
  useInteractWithRecipeMutation,
  RecipeService,
} from "@/services/recipe";
import {
  cuisineOptions,
  RecipeEntry,
  RecipePayload,
  SlotProcessingState,
} from "@/lib/recipe-constants";

import RecipeSelectionCard, {
  Slot,
} from "@/components/meal-planning/recipe-selection-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { RecipeDetailsDialog } from "../recipes/components/recipe-details-dialog";
import { Recipe as ApiRecipe } from "@/services/recipe";
import { getRecipeImageUrl } from "@/lib/recipe-utils";

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
  user?: {
    firstName?: string;
    username?: string;
  };
}

export default function RecipeSelection() {
  const router = useRouter();
  const { toast } = useToast();

  // Redux
  const dispatch = useDispatch();

  const {
    plans,
    generatedRecipes: generatedRecipies,
    generatedCustomRecipes: generatedCustomRecipies,
  } = useSelector((state: RootState) => state.mealPlan);

  // Derived selections for UI compatibility
  const currentSelections: Record<string, string[]> = {};
  Object.entries(plans).forEach(([date, meals]) => {
    Object.entries(meals).forEach(([mealType, recipes]) => {
      const slotKey = `${date}-${mealType}`;
      if (Array.isArray(recipes)) {
        currentSelections[slotKey] = recipes.map((r) => r.id);
      }
    });
  });

  const [mealSlots, setMealSlots] = useState<Slot[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  const [recipePayload, setRecipePayload] = useState<RecipePayload>({});
  const [isSlotProcessing, setIsSlotProcessing] = useState<SlotProcessingState>(
    {},
  );
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [detailedRecipe, setDetailedRecipe] = useState<ApiRecipe | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [interactions, setInteractions] = useState<
    Record<
      string,
      { isLiked: boolean; isDisliked: boolean; isFavorite: boolean }
    >
  >({});

  const [isReduxHydrated, setIsReduxHydrated] = useState(false);
  const searchTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const [suggestions, setSuggestions] = useState<Record<string, ApiRecipe[]>>(
    {},
  );

  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState<
    Record<string, boolean>
  >({});

  // Global Generation State
  const [globalSettings, setGlobalSettings] = useState<{
    cuisine: string;
    members: string[];
    recipeCount: string;
    pantryOption: string;
  }>({
    cuisine: "",
    members: [], // Empty implies all
    recipeCount: "1",
    pantryOption: "can-use",
  });
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  // Mutations
  const generateRecipeWithAi = useGenerateAIRecipeMutation();
  const generateCustomRecipeWithAi = useGenerateAICustomRecipeMutation();
  const interactWithRecipeMutation = useInteractWithRecipeMutation();
  const recipeService = new RecipeService();

  const handleGenerateAll = async () => {
    if (!globalSettings.cuisine) {
      toast({
        title: "Select Cuisine",
        description: "Please select a cuisine for all recipes first.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingAll(true);

    const promises = mealSlots.map(async (slot) => {
      const slotKey = `${slot.date}-${slot.meal}`;

      // Set individual loading state
      setIsSlotProcessing((prev) => ({
        ...prev,
        [slotKey]: { ...prev[slotKey], isRecipeLoading: true },
      }));

      try {
        const targetMemberIds =
          globalSettings.members.length > 0
            ? globalSettings.members
            : members.map((m) => m.id);

        const response = await generateRecipeWithAi.mutateAsync({
          mealType: slot.meal.toLowerCase(),
          memberCount: targetMemberIds.length || 4,
          maxBudgetPerServing: 8,
          preferredCuisines: [globalSettings.cuisine],
          recipeCount: Number(globalSettings.recipeCount) || 1,
          usePantryItems:
            globalSettings.pantryOption === "can-use" ||
            globalSettings.pantryOption === "only-pantry",
          pantryOnly: globalSettings.pantryOption === "only-pantry",
          targetMembers: targetMemberIds,
        });

        const recipes = (response.data || []).map((r: any, idx: number) => ({
          ...r,
          id: r.id || `ai-${slotKey}-${idx}-${Date.now()}`,
          complementaryItems: [],
          isAIGenerated: true,
          image: r.image,
        }));

        dispatch(
          setGeneratedRecipes({
            slotKey,
            recipes,
          }),
        );
      } catch (error) {
        console.error(`Failed to generate recipe for ${slotKey}`, error);
      } finally {
        setIsSlotProcessing((prev) => ({
          ...prev,
          [slotKey]: { ...prev[slotKey], isRecipeLoading: false },
        }));
      }
    });

    try {
      await Promise.all(promises);
      toast({
        title: "All Recipes Generated",
        description: "Successfully generated recipes for all slots.",
      });
    } catch (e) {
      toast({
        title: "Partial Error",
        description: "Some recipes might have failed to generate.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const handleInteraction = async (
    recipe: any,
    action: "like" | "dislike" | "favorite",
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();

    // Calculate optimistic state
    const current = interactions[recipe.id] || {
      isLiked: recipe.isLiked || false,
      isDisliked: recipe.isDisliked || false,
      isFavorite: recipe.isFavorite || false,
    };

    const next = { ...current };

    if (action === "like") {
      if (next.isLiked) {
        next.isLiked = false;
      } else {
        next.isLiked = true;
        next.isDisliked = false;
        next.isFavorite = false;
      }
    } else if (action === "dislike") {
      if (next.isDisliked) {
        next.isDisliked = false;
      } else {
        next.isDisliked = true;
        next.isLiked = false;
        next.isFavorite = false;
      }
    } else if (action === "favorite") {
      if (next.isFavorite) {
        next.isFavorite = false;
      } else {
        next.isFavorite = true;
        next.isLiked = false;
        next.isDisliked = false;
      }
    }

    // Apply Optimistic Update
    setInteractions((prev) => ({ ...prev, [recipe.id]: next }));

    try {
      await interactWithRecipeMutation.mutateAsync({
        id: recipe.id,
        action,
      });
    } catch (error) {
      // Revert on error
      setInteractions((prev) => ({ ...prev, [recipe.id]: current }));
      toast({
        title: "Error",
        description: "Failed to update preference",
        variant: "destructive",
      });
    }
  };

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

  // Hydrate generated recipes from Local Storage
  useEffect(() => {
    try {
      const savedGenerated = localStorage.getItem(
        "foodmatrix-generated-recipes",
      );
      if (savedGenerated) {
        const parsed = JSON.parse(savedGenerated);
        if (parsed.generated) {
          Object.entries(parsed.generated).forEach(([key, recipes]) => {
            dispatch(
              setGeneratedRecipes({ slotKey: key, recipes: recipes as any[] }),
            );
          });
        }
        if (parsed.custom) {
          Object.entries(parsed.custom).forEach(([key, recipes]) => {
            dispatch(
              setGeneratedCustomRecipes({
                slotKey: key,
                recipes: recipes as any[],
              }),
            );
          });
        }
      }
    } catch (e) {
      console.error("Failed to load generated recipes", e);
    } finally {
      setIsReduxHydrated(true);
    }
  }, [dispatch]);

  // Persist generated recipes to Local Storage
  useEffect(() => {
    if (!isReduxHydrated) return;
    try {
      const data = {
        generated: generatedRecipies,
        custom: generatedCustomRecipies,
      };
      localStorage.setItem(
        "foodmatrix-generated-recipes",
        JSON.stringify(data),
      );
    } catch (e) {
      console.error("Failed to save generated recipes", e);
    }
  }, [generatedRecipies, generatedCustomRecipies, isReduxHydrated]);

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
      // If payload.members is undefined, it means "All Members" (default state)
      // If it is empty array [], it means "None" (but we'll handle it as passed)
      const targetMemberIds =
        payload.members === undefined
          ? members.map((m) => m.id)
          : payload.members;

      const response = await generateRecipeWithAi.mutateAsync({
        mealType: slot.meal.toLowerCase(),
        memberCount: targetMemberIds.length || members.length || 4,
        maxBudgetPerServing: 8,
        preferredCuisines: [payload.cuisine],
        recipeCount: Number(payload.recipeCount) || 1,
        usePantryItems:
          payload.pantryOption === "can-use" ||
          payload.pantryOption === "only-pantry",
        pantryOnly: payload.pantryOption === "only-pantry",
        targetMembers: targetMemberIds,
      });

      console.log(response, "AI Recipe Response");

      const recipes = (response.data || []).map((r: any, idx: number) => ({
        ...r,
        id: r.id || `ai-${slotKey}-${idx}-${Date.now()}`,
        complementaryItems: [],
        isAIGenerated: true,
        image: r.image, // Ensure image is passed through
      }));

      dispatch(
        setGeneratedRecipes({
          slotKey,
          recipes,
        }),
      );

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
  const generateCustomRecipe = async (
    slot: Slot,
    isBackground: boolean = false,
  ) => {
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
      console.log(response?.data, "Custom Recipe Response");

      const recipesData = Array.isArray(response.data)
        ? response.data
        : response.data
          ? [response.data]
          : [];

      if (recipesData.length > 0) {
        const processed = recipesData.map((recipe: any, index: number) => ({
          ...recipe,
          id: recipe.id || `custom-${slotKey}-${Date.now()}-${index}`,
          isAIGenerated: true,
          isCustomSearch: true,
          image: recipe.imageUrl || recipe.image, // Ensure image compatibility
        }));

        const existingCustomRecipes = generatedCustomRecipies[slotKey] || [];
        const existingIds = new Set(existingCustomRecipes.map((r) => r.id));

        // Filter out duplicates based on ID or Name similarity if needed
        // For now, strict ID check, but AI might generate new ID for same recipe.
        // Let's filter by Name to avoid cluttering "Chicken" with 10 "Chicken"s
        const existingNames = new Set(
          existingCustomRecipes.map((r) => r.name.toLowerCase()),
        );

        const uniqueNewRecipes = processed.filter(
          (r: any) =>
            !existingIds.has(r.id) && !existingNames.has(r.name.toLowerCase()),
        );

        if (uniqueNewRecipes.length > 0) {
          dispatch(
            setGeneratedCustomRecipes({
              slotKey,
              recipes: [...uniqueNewRecipes, ...existingCustomRecipes],
            }),
          );
        }
        if (!isBackground) {
          toast({
            title: "Custom Search",
            description: `Found ${recipesData.length} recipes`,
          });
        }
      }
    } catch (error: any) {
      if (!isBackground) {
        // Extract error message
        const errorMessage = error?.response?.data?.message || error?.message || "Could not find custom recipe.";

        toast({
          title: "Recipe Not Found",
          description: errorMessage.replace("Failed to search recipe: ", ""), // Clean up backend wrapper
          variant: "destructive",
        });
      }
    } finally {
      setIsSlotProcessing((prev) => ({
        ...prev,
        [slotKey]: { ...prev[slotKey], isCustomRecipeLoading: false },
      }));
    }
  };

  const handleCustomRecipeChange = (slot: Slot, value: string) => {
    const slotKey = `${slot.date}-${slot.meal}`;

    // Update state immediately
    generateRecipePayload(slotKey, "customRecipe", value);

    // Clear existing timeout
    if (searchTimeoutRef.current[slotKey]) {
      clearTimeout(searchTimeoutRef.current[slotKey]);
    }

    // Set new timeout (Debounce 600ms)
    // If value is empty, clear suggestions
    if (!value || value.length < 3) {
      setSuggestions((prev) => ({ ...prev, [slotKey]: [] }));
      return;
    }

    if (value && value.length >= 3) {
      searchTimeoutRef.current[slotKey] = setTimeout(async () => {
        // Trigger generic search for suggestions
        setIsSearchingSuggestions((prev) => ({ ...prev, [slotKey]: true }));
        try {
          const response = await recipeService.getRecipes({
            search: value,
            page: 1,
            pageSize: 5,
          });
          const recipes = response.recipes || [];
          setSuggestions((prev) => ({
            ...prev,
            [slotKey]: recipes as ApiRecipe[],
          }));
        } catch (e) {
          console.error("Failed to fetch suggestions", e);
        } finally {
          setIsSearchingSuggestions((prev) => ({ ...prev, [slotKey]: false }));
        }
      }, 600);
    }
  };

  const handleSelectSuggestion = async (recipeId: string, slot: Slot) => {
    const slotKey = `${slot.date}-${slot.meal}`;

    // Clear suggestions
    setSuggestions((prev) => ({ ...prev, [slotKey]: [] }));
    generateRecipePayload(slotKey, "customRecipe", ""); // Clear input or keep it? User might want to search again. Let's clear for now as it moves to right.

    setIsSlotProcessing((prev) => ({
      ...prev,
      [slotKey]: { ...prev[slotKey], isCustomRecipeLoading: true },
    }));

    try {
      // Fetch full details
      const fullRecipe = await recipeService.getRecipeById(recipeId);

      const processed = {
        ...fullRecipe,
        // Ensure ID is unique if added multiple times? No, reuse ID for actual recipe.
        isAIGenerated: false, // It's from DB
        isCustomSearch: true,
        image: fullRecipe.imageUrl,
      };

      const existingCustomRecipes = generatedCustomRecipies[slotKey] || [];
      // Check for duplicates
      if (!existingCustomRecipes.find((r) => r.id === processed.id)) {
        dispatch(
          setGeneratedCustomRecipes({
            slotKey,
            recipes: [processed as any, ...existingCustomRecipes],
          }),
        );
        toast({
          title: "Recipe Added",
          description: `Added ${fullRecipe.name}`,
        });
      } else {
        toast({
          title: "Already Added",
          description: `Recipe already in list`,
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to load recipe details",
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
    // We need to parse slotKey to get date and mealType
    // slotKey format: date-meal
    // Find the last hyphen to split meal type
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

  const calculateTotal = () => {
    let total = 0;
    Object.values(plans).forEach((dayPlan) => {
      Object.values(dayPlan).forEach((recipes) => {
        if (Array.isArray(recipes)) {
          recipes.forEach((recipe) => {
            total += recipe.price || recipe.costAnalysis?.totalCost || 0;
          });
        }
      });
    });
    return total;
  };

  const handleGenerateShoppingList = () => {
    // Collect all selected recipe data from Redux
    const selectedData: any = {};
    const recipeIds: string[] = [];
    const selectionsPayload: Record<string, string[]> = {};

    Object.entries(plans).forEach(([date, dayPlan]) => {
      Object.entries(dayPlan).forEach(([meal, recipes]) => {
        if (Array.isArray(recipes)) {
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

    localStorage.setItem(
      "foodmatrix-selected-recipes",
      JSON.stringify({
        recipeIds,
        additionalRecipes: selectedData,
        selections: selectionsPayload,
      }),
    );

    router.push("/shopping-recipe");
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

        <div className="flex flex-col items-start lg:items-center justify-between mb-6 gap-3 animate-fade-in relative">
          <Button
            variant="ghost"
            className="absolute md:left-0 -top-2 md:top-1/2 md:-translate-y-1/2 p-0 hover:bg-transparent text-gray-500 hover:text-gray-900 flex gap-1"
            onClick={() => router.push("/meal-planning")}
          >
            <ChevronDown className="rotate-90 w-5 h-5" /> Back
          </Button>
          <div className="flex items-center gap-2 mt-8 md:mt-0">
            <span className="bg-[#7dab4f] font-bold text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1">
              <Sparkles size={12} className="fill-white" />
              AI Recipe Selection
            </span>
          </div>
          <div className="lg:text-center">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#313131] tracking-tight">
              Smarter choices for effortless cooking
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Choose your cuisine and generate personalized AI recipes for each
              meal
            </p>
          </div>
        </div>

        <div className="animate-fade-in">
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
              {/* Full Width AI Generator Section */}

              <div className="relative rounded-2xl p-6 mb-8 overflow-hidden group">
                {/* Glassmorphism Background with Theme Gradients */}
                <div className="absolute inset-0 bg-white/40 backdrop-blur-xl border border-white/60 shadow-xl z-0 rounded-2xl" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#7661d3]/10 via-transparent to-[#F3F0FD] z-0 pointer-events-none" />
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#7661d3]/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-end justify-between gap-6">
                  {/* Left Side: Title & Description */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-[#7661d3] p-2 rounded-lg shadow-lg shadow-[#7661d3]/20">
                        <Sparkles className="w-5 h-5 text-white" />
                      </span>
                      <div>
                        <h2 className="text-xl font-extrabold text-[#2D2D2D] tracking-tight">
                          AI Meal Planner
                        </h2>
                        <p className="text-sm text-gray-500 font-medium">
                          Auto-generate your entire week's meal plan in seconds
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end bg-white/50 p-4 rounded-xl border border-white/60 shadow-sm backdrop-blur-md">
                      {/* Cuisine Selection */}
                      <div className="flex flex-col gap-1.5 w-full">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[#7661d3]">
                          Favorite Cuisine
                        </label>
                        <Select
                          value={globalSettings.cuisine}
                          onValueChange={(val) =>
                            setGlobalSettings((prev) => ({
                              ...prev,
                              cuisine: val,
                            }))
                          }
                        >
                          <SelectTrigger className="h-10 w-full bg-white border-0 ring-1 ring-gray-200 focus:ring-[#7661d3] focus:bg-white transition-all text-gray-700 font-medium shadow-sm hover:shadow-md">
                            <SelectValue placeholder="Select Cuisine" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {cuisineOptions.map((c) => (
                                <SelectItem
                                  key={c.value}
                                  value={c.value}
                                  className="text-sm focus:bg-[#F3F0FD] focus:text-[#7661d3]"
                                >
                                  <span className="flex items-center gap-2">
                                    <span>{c.icon}</span>
                                    <span>{c.label}</span>
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Members Selection */}
                      <div className="flex flex-col gap-1.5 w-full">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[#7661d3]">
                          For Whom?
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="h-10 w-full justify-between bg-white border-0 ring-1 ring-gray-200 hover:ring-[#7661d3] focus:ring-[#7661d3] font-medium text-left px-3 text-gray-700 shadow-sm hover:shadow-md"
                            >
                              <span className="truncate">
                                {globalSettings.members.length === 0 ||
                                  globalSettings.members.length === members.length
                                  ? "Everyone"
                                  : `${globalSettings.members.length} Members`}
                              </span>
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[var(--radix-popover-trigger-width)] p-0"
                            align="start"
                          >
                            <Command>
                              <CommandInput placeholder="Search members..." />
                              <CommandList>
                                <CommandEmpty>No member found.</CommandEmpty>
                                <CommandGroup>
                                  <CommandItem
                                    onSelect={() => {
                                      setGlobalSettings((prev) => ({
                                        ...prev,
                                        members: [],
                                      }));
                                    }}
                                  >
                                    <div
                                      className={cn(
                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                        globalSettings.members.length === 0 ||
                                          globalSettings.members.length ===
                                          members.length
                                          ? "bg-primary text-primary-foreground"
                                          : "opacity-50 [&_svg]:invisible",
                                      )}
                                    >
                                      <Check className="h-4 w-4" />
                                    </div>
                                    <span>Select All</span>
                                  </CommandItem>
                                </CommandGroup>
                                <CommandSeparator />
                                <CommandGroup>
                                  {members.map((member) => {
                                    const isEffectiveSelected =
                                      globalSettings.members.length === 0 ||
                                      globalSettings.members.includes(
                                        member.id,
                                      );

                                    return (
                                      <CommandItem
                                        key={member.id}
                                        onSelect={() => {
                                          let newMembers: string[];
                                          if (
                                            globalSettings.members.length === 0
                                          ) {
                                            newMembers = members
                                              .map((m) => m.id)
                                              .filter((id) => id !== member.id);
                                          } else {
                                            if (
                                              globalSettings.members.includes(
                                                member.id,
                                              )
                                            ) {
                                              newMembers =
                                                globalSettings.members.filter(
                                                  (id) => id !== member.id,
                                                );
                                            } else {
                                              newMembers = [
                                                ...globalSettings.members,
                                                member.id,
                                              ];
                                            }
                                          }
                                          if (
                                            newMembers.length === members.length
                                          )
                                            newMembers = [];

                                          setGlobalSettings((prev) => ({
                                            ...prev,
                                            members: newMembers,
                                          }));
                                        }}
                                      >
                                        <div
                                          className={cn(
                                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                            isEffectiveSelected
                                              ? "bg-primary text-primary-foreground"
                                              : "opacity-50 [&_svg]:invisible",
                                          )}
                                        >
                                          <Check className="h-4 w-4" />
                                        </div>
                                        <span>
                                          {member.name ||
                                            member?.user?.firstName ||
                                            "Unnamed"}
                                        </span>
                                      </CommandItem>
                                    );
                                  })}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Recipe Count */}
                      <div className="flex flex-col gap-1.5 w-full">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[#7661d3]">
                          Variations
                        </label>
                        <Select
                          value={globalSettings.recipeCount}
                          onValueChange={(val) =>
                            setGlobalSettings((prev) => ({
                              ...prev,
                              recipeCount: val,
                            }))
                          }
                        >
                          <SelectTrigger className="h-10 w-full bg-white border-0 ring-1 ring-gray-200 focus:ring-[#7661d3] transition-all text-gray-700 font-medium shadow-sm hover:shadow-md">
                            <SelectValue placeholder="1" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <SelectItem key={n} value={n.toString()}>
                                {n} Option{n > 1 ? "s" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Big Button */}
                  <div className="md:w-auto w-full flex-shrink-0">
                    <Button
                      onClick={handleGenerateAll}
                      disabled={isGeneratingAll || !globalSettings.cuisine}
                      className="w-full md:min-w-[300px] h-24 md:px-8 bg-gradient-to-br from-[#7661d3] to-[#5c4aab] hover:from-[#6552b8] hover:to-[#4e3e96] text-white shadow-lg shadow-[#7661d3]/30 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex flex-col items-center justify-center gap-2 border border-white/10"
                    >
                      {isGeneratingAll ? (
                        <>
                          <span className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="text-sm font-normal">
                            Processing...
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles
                            className="w-8 h-8 md:w-10 md:h-10 mb-1"
                            strokeWidth={1.5}
                          />
                          <div className="flex flex-col items-center leading-tight">
                            <span className="text-lg md:text-xl">
                              Generate All
                            </span>
                          </div>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Content Area: Accordion + Sidebar */}
              <div className="flex flex-wrap lg:flex-nowrap gap-6 mt-6">
                {/* Left Side: Daily Meal Accordion */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    defaultValue={
                      mealSlots.length > 0
                        ? `date-${mealSlots[0].date}`
                        : undefined
                    }
                  >
                    {/* Group slots by date */}
                    {Object.entries(
                      mealSlots.reduce(
                        (acc, slot) => {
                          const dateKey = slot.date.toString();
                          if (!acc[dateKey]) acc[dateKey] = [];
                          acc[dateKey].push(slot);
                          return acc;
                        },
                        {} as Record<string, Slot[]>,
                      ),
                    ).map(([date, slotsForDate], dateIndex) => {
                      const formattedDate = new Date(date).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      );

                      return (
                        <AccordionItem
                          value={`date-${date}`}
                          key={date}
                          className=""
                        >
                          <AccordionTrigger className="p-4 hover:no-underline items-center bg-[#e9e2fe] rounded-lg">
                            <div className="flex flex-col md:justify-between w-full gap-1">
                              <h3 className="truncate text-base font-semibold text-[#7661d3]">
                                {formattedDate}
                              </h3>
                              <span>{slotsForDate.length} meals planned</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="flex flex-col gap-4 text-balance border border-[#F1EEFF] rounded-lg p-4 bg-gradient-to-r from-white via-[#F3F0FD] to-white mt-3">
                            <Accordion
                              type="multiple"
                              className="w-full flex gap-4 flex-col"
                              defaultValue={
                                slotsForDate.length > 0
                                  ? [`meal-${date}-${slotsForDate[0].meal}`]
                                  : undefined
                              }
                            >
                              {slotsForDate?.map((slot, mealIndex) => {
                                const slotKey = `${slot.date}-${slot.meal}`;
                                const payload = recipePayload[slotKey] || {};
                                const generatedRecipes =
                                  generatedRecipies[slotKey] || [];
                                const customRecipes =
                                  generatedCustomRecipies[slotKey] || [];
                                const allRecipesForSlot = [
                                  ...generatedRecipes,
                                  ...customRecipes,
                                ];

                                return (
                                  <AccordionItem
                                    value={`meal-${slotKey}`}
                                    key={slotKey}
                                    className="border-none"
                                  >
                                    <AccordionTrigger className="p-0 items-center hover:no-underline group">
                                      <div className="flex flex-row md:justify-between w-full gap-2 items-center">
                                        <h3 className="text-base font-semibold text-black">
                                          {slot.meal}{" "}
                                          <span className="text-gray-500 font-normal text-xs">
                                            ({slot.type})
                                          </span>
                                        </h3>
                                        <span className="group-hover:underline text-primary">
                                          Generate Recipes
                                        </span>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="flex gap-4 flex-col mt-4">
                                      <div className="border border-[#F1EEFF] rounded-lg p-4 bg-white">
                                        {/* <div className="w-100">
                                      <h5 className="font-medium text-[#7661d3] text-base">Ai Recipe Generator</h5>
                                      <p className="font-normal text-[#313131]">Search for specific recipes or ingredients</p>
                                    </div> */}

                                        <div className="flex flex-wrap justify-between gap-4 mb-6">
                                          <div className="flex flex-col gap-2">
                                            <label className="text-sm font-medium text-gray-700">
                                              AI Recipe Controls
                                            </label>

                                            <div className="flex gap-4 flex-wrap">
                                              <Select
                                                value={payload.cuisine}
                                                onValueChange={(value) =>
                                                  generateRecipePayload(
                                                    slotKey,
                                                    "cuisine",
                                                    value,
                                                  )
                                                }
                                              >
                                                <SelectTrigger className="w-[155px] h-11 rounded-lg border border-[#BCBCBC] text-black bg-white focus:ring-0 transition-all text-sm font-medium shadow-none">
                                                  <SelectValue placeholder="Select Cuisine" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectGroup>
                                                    {cuisineOptions.map(
                                                      (cuisine) => (
                                                        <SelectItem
                                                          key={cuisine.value}
                                                          value={cuisine.value}
                                                          className="text-sm"
                                                        >
                                                          <span className="flex items-center gap-2">
                                                            <span>
                                                              {cuisine.icon}
                                                            </span>
                                                            <span>
                                                              {cuisine.label}
                                                            </span>
                                                          </span>
                                                        </SelectItem>
                                                      ),
                                                    )}
                                                  </SelectGroup>
                                                </SelectContent>
                                              </Select>

                                              <Popover>
                                                <PopoverTrigger asChild>
                                                  <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-[220px] h-11 justify-between text-black bg-white border-[#BCBCBC] hover:bg-white hover:text-black font-normal"
                                                  >
                                                    <span className="truncate">
                                                      {payload.members ===
                                                        undefined ||
                                                        payload.members.length ===
                                                        members.length
                                                        ? "All Members"
                                                        : payload.members
                                                          .length === 0
                                                          ? "Select Members"
                                                          : `${payload.members.length} selected`}
                                                    </span>
                                                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                  </Button>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                  className="w-[220px] p-0 bg-white"
                                                  align="start"
                                                >
                                                  <Command>
                                                    <CommandInput placeholder="Search members..." />
                                                    <CommandList>
                                                      <CommandEmpty>
                                                        No member found.
                                                      </CommandEmpty>
                                                      <CommandGroup>
                                                        <CommandItem
                                                          onSelect={() => {
                                                            const allIds =
                                                              members.map(
                                                                (m) => m.id,
                                                              );
                                                            const isAllSelected =
                                                              !payload.members ||
                                                              payload.members
                                                                .length ===
                                                              members.length;

                                                            generateRecipePayload(
                                                              slotKey,
                                                              "members",
                                                              isAllSelected
                                                                ? []
                                                                : allIds,
                                                            );
                                                          }}
                                                        >
                                                          <div
                                                            className={cn(
                                                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                              !payload.members ||
                                                                payload.members
                                                                  .length ===
                                                                members.length
                                                                ? "bg-primary text-primary-foreground"
                                                                : "opacity-50 [&_svg]:invisible",
                                                            )}
                                                          >
                                                            <Check
                                                              className={cn(
                                                                "h-4 w-4",
                                                              )}
                                                            />
                                                          </div>
                                                          <span>
                                                            Select All
                                                          </span>
                                                        </CommandItem>
                                                      </CommandGroup>
                                                      <CommandSeparator />
                                                      <CommandGroup>
                                                        {members.map(
                                                          (member) => {
                                                            const isSelected =
                                                              !payload.members ||
                                                              payload.members.includes(
                                                                member.id,
                                                              );
                                                            return (
                                                              <CommandItem
                                                                key={member.id}
                                                                onSelect={() => {
                                                                  const allIds =
                                                                    members.map(
                                                                      (m) =>
                                                                        m.id,
                                                                    );
                                                                  const currentIds =
                                                                    payload.members ||
                                                                    allIds;
                                                                  let newIds;
                                                                  if (
                                                                    isSelected
                                                                  ) {
                                                                    newIds =
                                                                      currentIds.filter(
                                                                        (id) =>
                                                                          id !==
                                                                          member.id,
                                                                      );
                                                                  } else {
                                                                    newIds = [
                                                                      ...currentIds,
                                                                      member.id,
                                                                    ];
                                                                  }
                                                                  generateRecipePayload(
                                                                    slotKey,
                                                                    "members",
                                                                    newIds,
                                                                  );
                                                                }}
                                                              >
                                                                <div
                                                                  className={cn(
                                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                                    isSelected
                                                                      ? "bg-primary text-primary-foreground"
                                                                      : "opacity-50 [&_svg]:invisible",
                                                                  )}
                                                                >
                                                                  <Check
                                                                    className={cn(
                                                                      "h-4 w-4",
                                                                    )}
                                                                  />
                                                                </div>
                                                                <span>
                                                                  {member.name ||
                                                                    member?.user
                                                                      ?.firstName +
                                                                    (member
                                                                      ?.user
                                                                      ?.username
                                                                      ? ` (${member?.user?.username})`
                                                                      : "") ||
                                                                    "Unnamed Member"}
                                                                </span>
                                                              </CommandItem>
                                                            );
                                                          },
                                                        )}
                                                      </CommandGroup>
                                                    </CommandList>
                                                  </Command>
                                                </PopoverContent>
                                              </Popover>

                                              <Select
                                                value={
                                                  payload.recipeCount?.toString() ||
                                                  ""
                                                }
                                                onValueChange={(value) =>
                                                  generateRecipePayload(
                                                    slotKey,
                                                    "recipeCount",
                                                    value,
                                                  )
                                                }
                                              >
                                                <SelectTrigger className="w-[230px] h-11 rounded-lg border border-[#BCBCBC] text-black bg-white focus:ring-0 transition-all text-sm font-medium shadow-none">
                                                  <SelectValue placeholder="Select Number of Recipes" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectGroup>
                                                    {[1, 2, 3, 4, 5].map(
                                                      (num) => (
                                                        <SelectItem
                                                          key={num}
                                                          value={num.toString()}
                                                          className="text-sm"
                                                        >
                                                          {num} Recipe
                                                          {num > 1 ? "s" : ""}
                                                        </SelectItem>
                                                      ),
                                                    )}
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
                                                    Choose how to use your
                                                    pantry items in recipe
                                                    generation
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            </label>

                                            <Select
                                              value={payload.pantryOption || ""}
                                              onValueChange={(value) =>
                                                generateRecipePayload(
                                                  slotKey,
                                                  "pantryOption",
                                                  value,
                                                )
                                              }
                                            >
                                              <SelectTrigger className="w-[180px] h-11 rounded-lg border border-[#BCBCBC] text-black bg-white focus:ring-0 transition-all text-sm font-medium shadow-none">
                                                <SelectValue placeholder="Select Preferences" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectGroup>
                                                  <SelectItem
                                                    value="can-use"
                                                    className="text-sm"
                                                  >
                                                    Can Use Pantry
                                                  </SelectItem>
                                                  <SelectItem
                                                    value="only-pantry"
                                                    className="text-sm"
                                                  >
                                                    Only Pantry Items
                                                  </SelectItem>
                                                  <SelectItem
                                                    value="ignore"
                                                    className="text-sm"
                                                  >
                                                    Ignore Pantry
                                                  </SelectItem>
                                                </SelectGroup>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        </div>

                                        <Button
                                          className="border-[#3d326d] hover:bg-[#2d2454] text-[#2d2454] hover:text-white font-medium text-sm rounded-lg h-10 transition-all"
                                          variant={"outline"}
                                          onClick={() => generateRecipe(slot)}
                                          disabled={
                                            isSlotProcessing[slotKey]
                                              ?.isRecipeLoading
                                          }
                                        >
                                          {isSlotProcessing[slotKey]
                                            ?.isRecipeLoading
                                            ? "Generating..."
                                            : "Generate Recipes"}
                                        </Button>
                                      </div>

                                      <div className="border border-[#DFF6C9] rounded-lg p-4 bg-gradient-to-r from-[#EFFAE4] to-[#effae450]">
                                        <div className="w-100">
                                          <h5 className="font-medium text-[#7661d3] text-base">
                                            Custom Recipe Search
                                          </h5>
                                          <p className="font-normal text-[#313131]">
                                            Search for specific recipes or
                                            ingredients
                                          </p>
                                        </div>
                                        <Popover
                                          open={
                                            !!(
                                              suggestions[slotKey] &&
                                              payload.customRecipe &&
                                              payload.customRecipe.length >= 3
                                            )
                                          }
                                          onOpenChange={() => { }} // Controlled by input state
                                        >
                                          <PopoverAnchor asChild>
                                            <div className="relative mt-3 bg-white">
                                              <Search
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                size={16}
                                              />
                                              <input
                                                type="text"
                                                placeholder="Search for recipes, ingredients, or cuisines..."
                                                value={
                                                  payload.customRecipe || ""
                                                }
                                                onChange={(e) =>
                                                  handleCustomRecipeChange(
                                                    slot,
                                                    e.target.value,
                                                  )
                                                }
                                                className="w-full pl-9 pr-[130px] py-2 bg-white/10 border border-[#E2E2E2] rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/20 transition-all text-sm font-normal h-13"
                                              />
                                              <Button
                                                className="text-white bg-(--primary) hover:bg-(--primary) font-medium ps-3! pe-3! py-1 h-10 rounded-lg text-sm transition-all duration-300 cursor-pointer group flex items-center inset-shadow-[5px_5px_5px_rgba(0,0,0,0.30)] hover:inset-shadow-[-5px_-5px_5px_rgba(0,0,0,0.50)] min-w-26 justify-center absolute right-2 top-1/2 -translate-y-1/2 z-10"
                                                onClick={() =>
                                                  generateCustomRecipe(slot)
                                                }
                                                disabled={
                                                  isSlotProcessing[slotKey]
                                                    ?.isCustomRecipeLoading ||
                                                  !payload.customRecipe
                                                }
                                              >
                                                {isSlotProcessing[slotKey]
                                                  ?.isCustomRecipeLoading
                                                  ? "Searching..."
                                                  : "Search"}
                                              </Button>
                                            </div>
                                          </PopoverAnchor>

                                          <PopoverContent
                                            className="p-0 border-0 shadow-xl bg-transparent w-[var(--radix-popover-trigger-width)] z-0"
                                            align="start"
                                            sideOffset={5}
                                            onOpenAutoFocus={(e) =>
                                              e.preventDefault()
                                            }
                                          >
                                            <div className="bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto ring-1 ring-black/5 z-0">
                                              {isSearchingSuggestions[
                                                slotKey
                                              ] ? (
                                                <div className="p-3 text-sm text-gray-500 text-center">
                                                  Searching...
                                                </div>
                                              ) : suggestions[slotKey]
                                                ?.length === 0 ? (
                                                <div className="p-3 text-sm text-gray-500 text-center">
                                                  No matched item
                                                </div>
                                              ) : (
                                                suggestions[slotKey]?.map(
                                                  (suggestion) => (
                                                    <div
                                                      key={suggestion.id}
                                                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 flex gap-3 items-center"
                                                      onClick={() =>
                                                        handleSelectSuggestion(
                                                          suggestion.id,
                                                          slot,
                                                        )
                                                      }
                                                    >
                                                      {suggestion.imageUrl && (
                                                        <img
                                                          src={
                                                            getRecipeImageUrl(
                                                              suggestion.imageUrl,
                                                            )!
                                                          }
                                                          alt={suggestion.name}
                                                          className="w-14 h-14 rounded-lg object-cover bg-gray-100"
                                                        />
                                                      )}
                                                      <div className="flex-1">
                                                        <div className="text-base font-medium text-gray-900">
                                                          {suggestion.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 truncate whitespace-normal line-clamp-2">
                                                          {
                                                            suggestion.description
                                                          }
                                                        </div>
                                                      </div>
                                                    </div>
                                                  ),
                                                )
                                              )}
                                            </div>
                                          </PopoverContent>
                                        </Popover>
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
                </div>

                {/* Right Side: Results Sidebar */}
                <div className="lg:max-w-[550px] w-full flex flex-col gap-4">
                  <div className="w-full bg-[#e9e2fe] rounded-lg overflow-hidden flex-1">
                    <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white p-4 flex justify-between items-center">
                      AI Generated Recipes
                      <span className="text-sm font-normal">
                        {Object.values(generatedRecipies).reduce(
                          (acc, val) => acc + (val?.length || 0),
                          0,
                        ) +
                          Object.values(generatedCustomRecipies).reduce(
                            (acc, val) => acc + (val?.length || 0),
                            0,
                          )}{" "}
                        Results
                      </span>
                    </div>

                    <ScrollArea className="w-full h-[calc(100vh-300px)] p-4">
                      <div className="space-y-2">
                        {Object.entries(generatedRecipies).length === 0 &&
                          Object.entries(generatedCustomRecipies).length === 0 ? (
                          <div className="text-center text-gray-500">
                            <p className="text-base">
                              No recipes generated yet
                            </p>
                            <p className="text-sm mt-1">
                              Select options and click Generate Recipes
                            </p>
                          </div>
                        ) : (
                          Array.from(
                            new Set([
                              ...Object.keys(generatedRecipies),
                              ...Object.keys(generatedCustomRecipies),
                            ]),
                          ).map((slotKey) => {
                            const normal = generatedRecipies[slotKey] || [];
                            const custom =
                              generatedCustomRecipies[slotKey] || [];
                            const recipes = [...normal, ...custom];
                            const data = recipes;

                            if (recipes.length === 0) return null;

                            const lastHyphenIndex = slotKey.lastIndexOf("-");
                            const date = slotKey.substring(0, lastHyphenIndex);
                            const meal = slotKey.substring(lastHyphenIndex + 1);

                            const shortDate = new Date(date).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                timeZone: "UTC",
                              },
                            );

                            return (
                              <div key={slotKey} className="space-y-2">
                                <div className="flex justify-between items-center bg-white rounded-lg p-2 border border-[#DDD6FA] sticky top-0 z-10">
                                  <div>
                                    <p className="font-semibold text-gray-900">
                                      {shortDate}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {recipes.length} Result
                                      {recipes.length > 1 ? "s" : ""}
                                    </p>
                                  </div>
                                  <span className="text-sm font-normal text-[var(--primary)]">
                                    {meal}
                                  </span>
                                </div>

                                {recipes?.map((recipeRaw: any) => {
                                  // Merge optimistic state
                                  const interactionState = interactions[
                                    recipeRaw.id
                                  ] || {
                                    isLiked: recipeRaw.isLiked || false,
                                    isDisliked: recipeRaw.isDisliked || false,
                                    isFavorite: recipeRaw.isFavorite || false,
                                  };
                                  const recipe = {
                                    ...recipeRaw,
                                    ...interactionState,
                                  };

                                  const isSelected = currentSelections[
                                    slotKey
                                  ]?.includes(recipe.id);

                                  return (
                                    <div
                                      key={recipe.id}
                                      className="bg-white rounded-xl p-3 relative cursor-pointer hover:shadow-lg transition-all border border-transparent hover:border-[#7dab4f]/20 group"
                                      onClick={() =>
                                        handleRecipeSelect(recipe, slotKey)
                                      }
                                    >
                                      <div className="flex gap-4">
                                        {/* Image Section */}
                                        <div className="h-28 w-28 shrink-0 rounded-lg bg-gray-50 overflow-hidden relative border border-gray-100">
                                          {recipe.isCustomSearch && (
                                            <Badge className="absolute top-1 left-1 z-10 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 h-auto shadow-sm border-0">
                                              Custom Recipe
                                            </Badge>
                                          )}
                                          {recipe?.imageUrl ? (
                                            <img
                                              src={getRecipeImageUrl(recipe.imageUrl)!}
                                              alt={recipe.name}
                                              onClick={(e) => {
                                                e.stopPropagation(); // prevents card click
                                                setPreviewImage(getRecipeImageUrl(recipe.imageUrl)!);
                                              }}
                                              className="h-full w-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-105"
                                            />
                                          ) : (
                                            <div className="h-full w-full flex flex-col items-center justify-center text-gray-300 gap-1">
                                              <ChefHat className="h-8 w-8" />
                                              <span className="text-[9px] font-medium uppercase tracking-wider">
                                                No Image
                                              </span>
                                            </div>
                                          )}


                                          {/* Quick Actions Overlay (optional, or keep simple) */}
                                          {/* <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Heart className="size-3 text-white hover:fill-red-500 hover:text-red-500" />
                                      </div> */}
                                        </div>
                                        {previewImage && (
                                          <div
                                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                                            onClick={() => setPreviewImage(null)}
                                          >
                                            <div
                                              className="relative max-w-3xl w-full mx-4"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <button
                                                onClick={() => setPreviewImage(null)}
                                                className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                                              >
                                                ✕
                                              </button>

                                              <img
                                                src={previewImage}
                                                alt="Recipe preview"
                                                className="w-full h-auto max-h-[80vh] object-contain rounded-xl shadow-2xl"
                                              />
                                            </div>
                                          </div>
                                        )}


                                        {/* Content Section */}
                                        <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5">
                                          <div className="space-y-1">
                                            <div className="flex justify-between items-start gap-2 pr-8">
                                              <h3 className="font-bold text-gray-900 text-sm md:text-base leading-tight line-clamp-1">
                                                {recipe.name ||
                                                  "Untitled Recipe"}
                                              </h3>
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-2 font-medium leading-relaxed">
                                              {recipe.description ||
                                                "No description available for this recipe."}
                                            </p>
                                          </div>

                                          {/* Footer */}
                                          <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-3 text-xs text-gray-600 font-medium">
                                              <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-100">
                                                <Clock className="size-3 text-gray-400" />
                                                <span>
                                                  {recipe.prepTime || "30"}m
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-100">
                                                <Flame className="size-3 text-gray-400" />
                                                <span>
                                                  {recipe.nutrition?.calories ||
                                                    recipe.calories ||
                                                    "250"}
                                                </span>
                                              </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                              <div className="flex gap-2 text-gray-400">
                                                <ThumbsUp
                                                  onClick={(e) =>
                                                    handleInteraction(
                                                      recipe,
                                                      "like",
                                                      e,
                                                    )
                                                  }
                                                  className={`size-3.5 transition-colors hover:text-green-600 ${recipe.isLiked
                                                    ? "text-green-600 fill-current"
                                                    : ""
                                                    }`}
                                                />

                                                <ThumbsDown
                                                  onClick={(e) =>
                                                    handleInteraction(
                                                      recipe,
                                                      "dislike",
                                                      e,
                                                    )
                                                  }
                                                  className={`size-3.5 transition-colors hover:text-red-600 ${recipe.isDisliked
                                                    ? "text-red-600 fill-current"
                                                    : ""
                                                    }`}
                                                />

                                                <Heart
                                                  onClick={(e) =>
                                                    handleInteraction(
                                                      recipe,
                                                      "favorite",
                                                      e,
                                                    )
                                                  }
                                                  className={`size-3.5 transition-colors hover:text-pink-600 ${recipe.isFavorite
                                                    ? "text-pink-600 fill-current"
                                                    : ""
                                                    }`}
                                                />
                                              </div>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setDetailedRecipe(
                                                    recipe as any,
                                                  );
                                                  setIsDetailsOpen(true);
                                                }}
                                                className="text-[10px] font-semibold text-[var(--primary)] hover:underline uppercase tracking-wide"
                                              >
                                                Details
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Selection Checkbox */}
                                      <span
                                        className={cn(
                                          "absolute top-0 right-0 w-8 h-8 rounded-tr-xl rounded-bl-xl flex items-center justify-center transition-all duration-300",
                                          isSelected
                                            ? "bg-[var(--primary)] text-white shadow-md scale-100"
                                            : "bg-gray-100 text-gray-300 hover:bg-gray-200 scale-90 opacity-70 hover:opacity-100",
                                        )}
                                      >
                                        {isSelected ? (
                                          <Check className="size-5 stroke-[3px]" />
                                        ) : (
                                          <Plus className="size-5" />
                                        )}
                                      </span>
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


              </div>

              <div className="rounded-lg bg-[#e9e2fe] mt-5 p-4">
                <div className="flex gap-3 items-center font-bold justify-between flex-wrap">
                  <div className="flex flex-col">
                    <div className="text-[var(--primary)]">Total Selected</div>
                    <span className="text-sm font-medium text-black/60">
                      {Object.values(currentSelections).reduce(
                        (acc, ids) => acc + ids.length,
                        0,
                      )}{" "}
                      Recipes
                    </span>
                  </div>

                  <Button
                    variant={"outline"}
                    type="button"
                    className="border border-[var(--primary)] bg-white text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all shadow-sm"
                    onClick={handleGenerateShoppingList}
                    disabled={
                      Object.values(currentSelections).reduce(
                        (acc, ids) => acc + ids.length,
                        0,
                      ) === 0
                    }
                  >
                    Continue to Shopping List
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <RecipeDetailsDialog
          recipe={detailedRecipe}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
        />
      </div>
    </div>
  );
}

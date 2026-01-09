"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/use-permissions";
import { PERMISSIONS } from "@/lib/permissions";
import { ProtectedAction } from "@/components/common/protected-action";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChefHat,
  Plus,
  Calendar as CalendarIcon,
  X,
  ArrowRight,
  LayoutGrid,
  CalendarDays,
  UtensilsCrossed,
  ShoppingBag,
  Store,
  Clock,
  Ban,
  Package,
  Soup,
  CheckSquare,
  CheckSquare2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store.redux";
import { hydrateMealPlans } from "@/redux/features/meal-plan/meal-plan.slice";
import { Recipe } from "@/lib/recipe-constants";
import { useMembers } from "@/services/member/member.query";
import {
  format,
  addDays,
  isAfter,
  isBefore,
  startOfDay,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import ConfirmDialog from "@/components/common/confirmation-dialog";
import ConfirmationModal from "@/components/common/ConfirmationModal";

type MealType =
  | "skip"
  | "cook-home"
  | "quick-simple"
  | "leftover"
  | "order-takeout"
  | "dine-out"
  | "meal-prep";
type MealTime = "breakfast" | "lunch" | "dinner";
type ViewMode = "date" | "week";

interface Member {
  id: string;
  name: string;
  age: number;
  isAdmin: boolean;
}

interface MemberSpecificMeal {
  type: MealType;
  members?: string[];
  isForAllMembers?: boolean;
  cuisine?: string;
  generateMultiple?: boolean;
}

interface MealSlot {
  breakfast: MemberSpecificMeal;
  lunch: MemberSpecificMeal;
  dinner: MemberSpecificMeal;
}

const mealOptions = [
  { value: "skip", label: "Skip Meal", icon: Ban, color: "text-gray-400" },
  {
    value: "cook-home",
    label: "Cook at Home",
    icon: ChefHat,
    color: "text-emerald-600",
  },
  {
    value: "quick-simple",
    label: "Quick & Simple",
    icon: CheckSquare2,
    color: "text-emerald-600",
  },
  {
    value: "leftover",
    label: "Leftovers",
    icon: Soup,
    color: "text-orange-500",
  },
  {
    value: "order-takeout",
    label: "Order Takeout",
    icon: ShoppingBag,
    color: "text-rose-600",
  },
  {
    value: "dine-out",
    label: "Dine Out",
    icon: Store,
    color: "text-purple-600",
  },
  {
    value: "meal-prep",
    label: "Meal Prep",
    icon: Package,
    color: "text-cyan-600",
  },
];

const mealCosts: Record<MealType, number> = {
  skip: 0,
  "cook-home": 8,
  "quick-simple": 4,
  leftover: 2,
  "order-takeout": 25,
  "dine-out": 22,
  "meal-prep": 6,
};

const LS_KEYS = {
  INITIALIZED: "mealplanner:initialized",
  SELECTED_DATES: "mealplanner:selectedDates",
  WEEK_PLAN: "mealplanner:weekPlan",
  RECIPE_SELECTIONS: "foodmatrix-recipe-selections",
  SELECTED_RECIPES: "foodmatrix-selected-recipes",
  LAST_VALIDATION: "mealplanner:lastValidation",
  VIEW_MODE: "mealplanner:viewMode",
};

const isoUTCDate = (d: Date) =>
  new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    .toISOString()
    .slice(0, 10);

const createEmptySlot = (): MealSlot => ({
  breakfast: { type: "skip" },
  lunch: { type: "skip" },
  dinner: { type: "skip" },
});

const validateAndCleanDates = () => {
  const today = startOfDay(new Date());

  try {
    const savedDates = localStorage.getItem(LS_KEYS.SELECTED_DATES);
    const savedPlan = localStorage.getItem(LS_KEYS.WEEK_PLAN);

    if (!savedDates) return { dates: [], plan: {} };

    const parsed = JSON.parse(savedDates) as {
      key: string;
      label: string;
      actualDate: string;
    }[];
    const plan = savedPlan ? JSON.parse(savedPlan) : {};

    const validDates = parsed.filter((d) => {
      const date = startOfDay(new Date(d.actualDate));
      return isAfter(date, today) || date.getTime() === today.getTime();
    });

    const validPlan: Record<string, MealSlot> = {};
    validDates.forEach((d) => {
      if (plan[d.key]) {
        validPlan[d.key] = plan[d.key];
      }
    });

    if (validDates.length !== parsed.length) {
      localStorage.setItem(LS_KEYS.SELECTED_DATES, JSON.stringify(validDates));
      localStorage.setItem(LS_KEYS.WEEK_PLAN, JSON.stringify(validPlan));
    }

    localStorage.setItem(LS_KEYS.LAST_VALIDATION, new Date().toISOString());

    return {
      dates: validDates.map((p) => ({
        key: p.key,
        label: p.label,
        actualDate: new Date(p.actualDate),
      })),
      plan: validPlan,
    };
  } catch (e) {
    console.error("Error validating dates:", e);
    return { dates: [], plan: {} };
  }
};

export default function MealPlanning() {
  const [recipeSelections, setRecipeSelections] = useState<
    Record<string, string | string[]>
  >({});
  const [selectedRecipes, setSelectedRecipes] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("date");
  const [isClearAllDialogOpen, setIsClearAllDialogOpen] = useState(false);

  const { can } = usePermissions();
  const isReadOnly = !can(PERMISSIONS.MEAL_CREATE);

  const { dates: cleanedDates, plan: cleanedPlan } = useMemo(
    () => validateAndCleanDates(),
    [],
  );

  const { activeAccountId } = useSelector((state: RootState) => state.account);
  const dispatch = useDispatch();

  const { data: membersData, isLoading: membersLoading } = useMembers(
    {
      accountId: activeAccountId || "",
      limit: 100,
    },
    {
      enabled: !!activeAccountId,
    },
  );

  const members: Member[] = (membersData as any)?.data?.data || [];

  const [weekPlan, setWeekPlan] =
    useState<Record<string, MealSlot>>(cleanedPlan);
  const [selectedDates, setSelectedDates] =
    useState<{ key: string; label: string; actualDate: Date }[]>(cleanedDates);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedViewMode = localStorage.getItem(LS_KEYS.VIEW_MODE) as ViewMode;
      if (savedViewMode) setViewMode(savedViewMode);

      const isInit = !!localStorage.getItem(LS_KEYS.INITIALIZED);
      setInitialized(isInit);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.VIEW_MODE, viewMode);
    } catch {}
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === "week") {
      const today = new Date();
      const start = startOfWeek(today, { weekStartsOn: 0 });
      const end = endOfWeek(today, { weekStartsOn: 0 });
      const days = eachDayOfInterval({ start, end });

      const newSelectedDates = days.map((d) => {
        const iso = isoUTCDate(d);
        return {
          key: iso,
          label: format(d, "EEEE, MMM d"),
          actualDate: d,
        };
      });
      setSelectedDates(newSelectedDates);

      // Ensure weekPlan has entries for all these dates
      setWeekPlan((prev) => {
        const updated = { ...prev };
        let hasChanges = false;

        newSelectedDates.forEach((d) => {
          if (!updated[d.key]) {
            updated[d.key] = createEmptySlot();
            hasChanges = true;
          }
        });

        return hasChanges ? updated : prev;
      });
    } else {
      setSelectedDates([]);
      setWeekPlan({});
    }
  }, [viewMode]);

  useEffect(() => {
    const loadRecipeSelections = () => {
      try {
        // Check primary storage from recipe-selection page
        const savedRecipesData = localStorage.getItem(LS_KEYS.SELECTED_RECIPES);
        // Also check legacy/fallback storage
        const savedSelections = localStorage.getItem(LS_KEYS.RECIPE_SELECTIONS);

        let selections = {};

        if (savedRecipesData) {
          const parsed = JSON.parse(savedRecipesData);
          if (parsed.selections) {
            selections = { ...selections, ...parsed.selections };
          }
          if (parsed.additionalRecipes) {
            setSelectedRecipes(Object.values(parsed.additionalRecipes).flat());
          }
        }

        if (savedSelections) {
          const parsed = JSON.parse(savedSelections);
          selections = { ...selections, ...parsed };
        }

        setRecipeSelections(selections);
      } catch (error) {
        console.error("Error loading recipe selections:", error);
      }
    };

    loadRecipeSelections();
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === LS_KEYS.RECIPE_SELECTIONS ||
        e.key === LS_KEYS.SELECTED_RECIPES
      ) {
        loadRecipeSelections();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    const intervalId = setInterval(loadRecipeSelections, 2000);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.WEEK_PLAN, JSON.stringify(weekPlan));
    } catch (e) {
      console.error("Error saving weekPlan:", e);
    }
  }, [weekPlan]);

  useEffect(() => {
    try {
      const serial = selectedDates.map((d) => ({
        ...d,
        actualDate: d.actualDate.toISOString(),
      }));
      localStorage.setItem(LS_KEYS.SELECTED_DATES, JSON.stringify(serial));
    } catch (e) {
      console.error("Error saving selectedDates:", e);
    }
  }, [selectedDates]);

  const [conflictDate, setConflictDate] = useState<Date | null>(null);

  const checkIfDateHasRecipes = (date: Date) => {
    const iso = isoUTCDate(date);
    // Check if any key in recipeSelections starts with this date's ISO string
    return Object.keys(recipeSelections).some((k) => k.startsWith(iso));
  };

  const clearRecipesForDate = (date: Date) => {
    const iso = isoUTCDate(date);

    // 1. Update State
    setRecipeSelections((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (k.startsWith(iso)) delete next[k];
      });
      return next;
    });

    // 2. Update Local Storage (SELECTED_RECIPES)
    try {
      const savedData = localStorage.getItem(LS_KEYS.SELECTED_RECIPES);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.selections) {
          let changed = false;
          Object.keys(parsed.selections).forEach((k) => {
            if (k.startsWith(iso)) {
              delete parsed.selections[k];
              changed = true;
            }
          });
          if (changed) {
            localStorage.setItem(
              LS_KEYS.SELECTED_RECIPES,
              JSON.stringify(parsed),
            );
          }
        }
      }
    } catch (e) {
      console.error("Error clearing recipes from storage:", e);
    }

    // 3. Update Legacy Storage if needed
    try {
      const savedLegacy = localStorage.getItem(LS_KEYS.RECIPE_SELECTIONS);
      if (savedLegacy) {
        const parsed = JSON.parse(savedLegacy);
        let changed = false;
        Object.keys(parsed).forEach((k) => {
          if (k.startsWith(iso)) {
            delete parsed[k];
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem(
            LS_KEYS.RECIPE_SELECTIONS,
            JSON.stringify(parsed),
          );
        }
      }
    } catch (e) {}

    // 4. Update Generated Recipes Storage (Candidates)
    try {
      const savedGenerated = localStorage.getItem(
        "foodmatrix-generated-recipes",
      );
      if (savedGenerated) {
        const parsed = JSON.parse(savedGenerated);
        let changed = false;

        if (parsed.generated) {
          Object.keys(parsed.generated).forEach((k) => {
            if (k.startsWith(iso)) {
              delete parsed.generated[k];
              changed = true;
            }
          });
        }
        if (parsed.custom) {
          Object.keys(parsed.custom).forEach((k) => {
            if (k.startsWith(iso)) {
              delete parsed.custom[k];
              changed = true;
            }
          });
        }

        if (changed) {
          localStorage.setItem(
            "foodmatrix-generated-recipes",
            JSON.stringify(parsed),
          );
        }
      }
    } catch (e) {
      console.error("Error clearing generated recipes:", e);
    }
  };

  const addDateToSelection = (date: Date, force = false) => {
    const today = startOfDay(new Date());
    const selectedDay = startOfDay(date);

    if (isBefore(selectedDay, today)) {
      return;
    }

    // Check for existing recipes logic
    if (!force && checkIfDateHasRecipes(date)) {
      setConflictDate(date);
      return;
    }

    const iso = isoUTCDate(date);
    if (selectedDates.find((d) => d.key === iso)) return;

    const label = format(date, "EEEE, MMM d");
    setSelectedDates((prev) => [
      ...prev,
      { key: iso, label, actualDate: date },
    ]);

    setWeekPlan((prev) => {
      // If plan already exists for this date, preserve it.
      // This happens if the user just hides the date but data was kept in state (though usually removing date removes from state).
      if (prev[iso]) return { ...prev, [iso]: prev[iso] };

      // Otherwise create new, but check if we should auto-fill based on existing recipes (Use Same case)
      const newSlot = createEmptySlot();

      // If we are forcing (Use Same) or if recipes just exist, we try to restore the 'cook-home' status
      if (force || checkIfDateHasRecipes(date)) {
        (["breakfast", "lunch", "dinner"] as const).forEach((meal) => {
          // Match keys like YYYY-MM-DD-breakfast or YYYY-MM-DD-BREAKFAST
          const target = `${iso}-${meal}`.toLowerCase();
          const hasRec = Object.keys(recipeSelections).some(
            (k) => k.toLowerCase() === target,
          );
          if (hasRec) {
            newSlot[meal].type = "cook-home";
          }
        });
      }

      return { ...prev, [iso]: newSlot };
    });

    try {
      localStorage.setItem(LS_KEYS.INITIALIZED, "1");
      setInitialized(true);
    } catch {}
  };

  const addNextDay = () => {
    if (selectedDates.length === 0) return;
    const last = selectedDates[selectedDates.length - 1].actualDate;
    const next = addDays(last, 1);
    addDateToSelection(next);
  };

  const updateMealSlot = (dateKey: string, meal: MealTime, value: MealType) => {
    setWeekPlan((prev) => {
      const base = prev[dateKey] ?? createEmptySlot();
      const updatedSlot: MemberSpecificMeal = {
        ...base[meal],
        type: value,
      };

      if (value !== "cook-home") {
        delete (updatedSlot as any).members;
        delete (updatedSlot as any).isForAllMembers;
        delete (updatedSlot as any).cuisine;
        delete (updatedSlot as any).generateMultiple;
      }

      const updated = {
        ...prev,
        [dateKey]: {
          ...base,
          [meal]: updatedSlot,
        },
      };

      try {
        localStorage.setItem(LS_KEYS.WEEK_PLAN, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save updated weekPlan:", e);
      }

      return updated;
    });
  };

  const getRecipeName = (dateKey: string, meal: MealTime) => {
    const slotKey = `${dateKey.toUpperCase()}-${meal.toUpperCase()}`;
    const selection = recipeSelections[slotKey];
    if (!selection) return null;

    const ids = Array.isArray(selection) ? selection : [selection];
    if (ids.length === 0) return null;

    const names = ids
      .map((id) => selectedRecipes.find((r) => r.id === id)?.name)
      .filter(Boolean);

    if (names.length === 0) return null;
    if (names.length === 1) return names[0];
    return `${names[0]} + ${names.length - 1} more`;
  };

  const clearAllPlans = () => {
    // if (!confirm("Are you sure you want to clear all meal plans?")) return;
    setSelectedDate(undefined);
    if (viewMode === "date") setSelectedDates([]);
    else {
      setWeekPlan({});
    }

    if (viewMode === "date") localStorage.removeItem(LS_KEYS.SELECTED_DATES);
    localStorage.removeItem(LS_KEYS.WEEK_PLAN);
    setWeekPlan({});
  };

  const { counts, costs } = useMemo(() => {
    const c: Record<string, number> = {
      "cook-home": 0,
      "order-takeout": 0,
      "dine-out": 0,
      leftover: 0,
      "quick-simple": 0,
      "meal-prep": 0,
      skip: 0,
    };
    const costAcc = { groceries: 0, takeout: 0, dining: 0 };
    Object.values(weekPlan).forEach((slot) => {
      (["breakfast", "lunch", "dinner"] as MealTime[]).forEach((mt) => {
        const type = slot[mt]?.type || "skip";
        c[type] = (c[type] ?? 0) + 1;
        if (
          type === "cook-home" ||
          type === "quick-simple" ||
          type === "leftover" ||
          type === "meal-prep"
        ) {
          costAcc.groceries += mealCosts[type];
        } else if (type === "order-takeout") {
          costAcc.takeout += mealCosts[type];
        } else if (type === "dine-out") {
          costAcc.dining += mealCosts[type];
        }
      });
    });
    return { counts: c, costs: costAcc };
  }, [weekPlan]);

  const totalCost = costs.groceries + costs.takeout + costs.dining;

  const router = useRouter();

  const handleContinueToRecipes = () => {
    // Ensure data is saved before navigating
    localStorage.setItem(LS_KEYS.WEEK_PLAN, JSON.stringify(weekPlan));
    if (selectedDates.length > 0) {
      const serial = selectedDates.map((d) => ({
        ...d,
        actualDate: d.actualDate.toISOString(),
      }));
      localStorage.setItem(LS_KEYS.SELECTED_DATES, JSON.stringify(serial));
    }

    // Hydrate Redux from LocalStorage to ensure "Use Same" or existing recipes are carried over
    try {
      const savedRecipesData = localStorage.getItem(LS_KEYS.SELECTED_RECIPES);
      if (savedRecipesData) {
        const parsed = JSON.parse(savedRecipesData);
        if (parsed.selections && parsed.additionalRecipes) {
          const plans: Record<string, Record<string, Recipe[]>> = {};

          Object.entries(parsed.selections).forEach(([slotKey, recipeIds]) => {
            // slotKey format: DATE-MEAL (e.g. 2023-10-27-BREAKFAST)
            // We need to split sensibly. Last hyphen?
            // NOTE: Dates are usually YYYY-MM-DD.
            // Let's find the last hyphen to separate meal.
            const lastHyphen = slotKey.lastIndexOf("-");
            if (lastHyphen === -1) return;

            const date = slotKey.substring(0, lastHyphen);
            const meal = slotKey.substring(lastHyphen + 1);

            if (!parsed.additionalRecipes) return;

            const ids = Array.isArray(recipeIds) ? recipeIds : [recipeIds];

            // Map IDs to full Recipe objects
            // The additionalRecipes in LS is a Record<id, Recipe>
            // We need to cast it or trust it.
            const recipes: Recipe[] = (ids as string[])
              .map((id) => parsed.additionalRecipes[id])
              .filter(Boolean);

            if (recipes.length > 0) {
              if (!plans[date]) plans[date] = {};
              plans[date][meal] = recipes;
            }
          });

          if (Object.keys(plans).length > 0) {
            dispatch(hydrateMealPlans(plans));
          }
        }
      }
    } catch (e) {
      console.error("Error hydrating meal plans before continue:", e);
    }

    router.push("/recipe-selection");
  };

  const today = startOfDay(new Date());

  const isDateDisabled = (date: Date) => {
    const day = startOfDay(date);
    return isBefore(day, today);
  };

  return (
    <div className="h-[calc(100vh-57px)] bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00] relative overflow-auto">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-[#7dab4f]/10 to-transparent rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-[100px]" />
      </div>

      {/* Main Container */}
      <div className="max-w-8xl mx-auto px-4 md:px-6 relative z-10 py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-6 gap-6 animate-fade-in">
          <div className="">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#7dab4f] font-bold text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1">
                <UtensilsCrossed size={12} className="fill-white" />
                Food Matrix Pro
              </span>
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-[#313131] tracking-tight">
                Weekly Meal Planner
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-1">
                {viewMode === "date"
                  ? "Curate your culinary journey. Select precise dates to craft your perfect menu."
                  : "Orchestrate your weekly nutrition with our structured Sunday-to-Saturday planner."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode("date")}
              className={cn(
                "px-5 py-3 rounded-lg text-sm font-bold flex items-center gap-2.5 transition-all duration-300",
                viewMode === "date"
                  ? "bg-[#1a1a1a] text-white shadow-lg scale-100"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-gray-300 bg-white",
              )}
            >
              <LayoutGrid size={18} />
              Date Mode
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={cn(
                "px-5 py-3 rounded-lg text-sm font-bold flex items-center gap-2.5 transition-all duration-300",
                viewMode === "week"
                  ? "bg-[#1a1a1a] text-white shadow-lg scale-100 border"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-gray-300 bg-white",
              )}
            >
              <CalendarDays size={18} />
              Week View
            </button>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden bg-white p-6">
          {/* Stats Cards - Premium Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
            {/* Card 1: Home Cooking */}
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-gray-200 relative overflow-hidden group hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-bl-[100px] -mr-6 -mt-6 transition-transform group-hover:scale-110 duration-700" />
              <div className="relative z-10 flex flex-col justify-between h-full gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100/80 rounded-lg flex items-center justify-center text-emerald-600 shadow-sm">
                    <ChefHat size={20} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Cooking
                  </span>
                </div>
                <div className="flex gap-4 items-center">
                  <p className="text-4xl font-black text-[#1a1a1a] tracking-tight">
                    {counts["cook-home"]}
                  </p>
                  <p className="text-sm text-emerald-600 font-bold mt-1 flex items-center gap-1">
                    Home Meals
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Takeout */}
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-gray-200 relative overflow-hidden group hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50/50 rounded-bl-[100px] -mr-6 -mt-6 transition-transform group-hover:scale-110 duration-700" />
              <div className="relative z-10 flex flex-col justify-between h-full gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-100/80 rounded-lg flex items-center justify-center text-rose-600 shadow-sm">
                    <ShoppingBag size={20} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Takeout
                  </span>
                </div>
                <div className="flex gap-4 items-center">
                  <p className="text-4xl font-black text-[#1a1a1a] tracking-tight">
                    {counts["order-takeout"]}
                  </p>
                  <p className="text-sm text-rose-600 font-bold mt-1">Orders</p>
                </div>
              </div>
            </div>

            {/* Card 3: Dine Out */}
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-gray-200 relative overflow-hidden group hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50/50 rounded-bl-[100px] -mr-6 -mt-6 transition-transform group-hover:scale-110 duration-700" />
              <div className="relative z-10 flex flex-col justify-between h-full gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100/80 rounded-lg flex items-center justify-center text-purple-600 shadow-sm">
                    <Store size={20} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Dining
                  </span>
                </div>
                <div className="flex gap-4 items-center">
                  <p className="text-4xl font-black text-[#1a1a1a] tracking-tight">
                    {counts["dine-out"]}
                  </p>
                  <p className="text-sm text-purple-600 font-bold mt-1">
                    Restaurants
                  </p>
                </div>
              </div>
            </div>

            {/* Card 4: Quick/Easy (Feature Card) */}
            <div className="bg-gradient-to-br from-[#3d326d] to-[#2d2454] rounded-xl lg:p-6 p-4 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 ring-1 ring-white/10">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-700 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#7dab4f]/20 rounded-full -ml-10 -mb-10 blur-xl" />

              <div className="relative z-10 flex flex-col justify-between h-full gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center text-white border border-white/10">
                      <Clock size={20} />
                    </div>
                    <span className="text-white/80 font-bold text-[11px] uppercase tracking-widest">
                      Quick
                    </span>
                  </div>
                </div>
                <div className="flex items-end justify-between gap-4">
                  <div className="flex gap-4 items-center">
                    <p className="text-4xl font-black text-white tracking-tight">
                      {counts.leftover +
                        counts["quick-simple"] +
                        counts["meal-prep"]}
                    </p>
                    <p className="text-sm text-white/70 font-medium mt-1">
                      Easy Meals
                    </p>
                  </div>
                  <div className="text-right bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                    <p className="text-xl font-bold text-[#7dab4f]">
                      ${Math.round(totalCost)}
                    </p>
                    <p className="text-[9px] text-white/50 uppercase tracking-wider font-bold">
                      Est. Budget
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Date Selection Control */}
          {viewMode === "date" && !isReadOnly && (
            <div className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex-1 w-full flex items-center gap-3 pl-2">
                  <div className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center text-blue-500 flex">
                    <CalendarIcon size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-gray-900">
                      Manage Dates
                    </span>
                    <span className="text-sm font-normal text-gray-400">
                      Add or remove days from your plan
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 w-full sm:w-auto items-center">
                  <Dialog
                    open={isDateDialogOpen}
                    onOpenChange={setIsDateDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-10 rounded-lg border-gray-200 bg-gray-50/50 hover:bg-white text-gray-600 justify-start flex-1 sm:min-w-[180px] transition-all hover:border-[#7dab4f]/50 group shadow-none"
                      >
                        <span className="text-sm font-semibold group-hover:text-        [#7dab4f] transition-colors">
                          {selectedDate
                            ? format(selectedDate, "PPP")
                            : "Pick a date"}
                        </span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      showCloseButton={false}
                      className="sm:max-w-[400px] p-0 overflow-hidden border-0 shadow-2xl rounded-lg"
                    >
                      <div className="relative">
                        {/* Premium Header Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#7dab4f] to-[#5a8c3e] z-0" />

                        <DialogHeader className="relative z-10 p-4 text-white flex flex-row items-center gap-4">
                          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center shadow-inner border border-white/10 shrink-0">
                            <CalendarIcon className="w-6 h-6 text-white" />
                          </div>

                          <div className="flex flex-col">
                            <DialogTitle className="text-lg font-black tracking-tight text-white">
                              Select Date
                            </DialogTitle>
                            <p className="text-white/80 text-sm font-medium">
                              Choose a day to plan your meals
                            </p>
                          </div>
                        </DialogHeader>

                        <div className="relative z-10 bg-white rounded-lg  px-6 pt-6 pb-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                          <div className="bg-gray-50/50 rounded-lg border border-gray-100 mb-6">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={(d) => {
                                if (!d) return;
                                setSelectedDate(d);
                              }}
                              disabled={(date) =>
                                isBefore(startOfDay(date), today)
                              }
                              initialFocus
                              className="rounded-lg bg-transparent mx-auto"
                              classNames={{
                                head_cell:
                                  "text-gray-400 font-bold text-[0.8rem] uppercase tracking-wider",
                                cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                day: "h-10 w-10 p-0 font-bold text-gray-700 rounded-lg transition-all hover:bg-gray-100 aria-selected:bg-[#7dab4f] aria-selected:text-white aria-selected:shadow-lg aria-selected:shadow-[#7dab4f]/30",
                                day_today: "bg-gray-100 text-gray-900",
                                day_outside: "text-gray-300 opacity-50",
                                day_disabled: "text-gray-300 opacity-30",
                                day_hidden: "invisible",
                              }}
                            />
                          </div>

                          <div className="flex justify-end gap-3">
                            <Button
                              variant="ghost"
                              onClick={() => setIsDateDialogOpen(false)}
                              className="rounded-lg font-bold text-gray-500 hover:text-gray-800 h-10 bg-gray-100"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => {
                                if (!selectedDate) return;
                                addDateToSelection(selectedDate);
                                setSelectedDate(undefined);
                                setIsDateDialogOpen(false);
                              }}
                              disabled={!selectedDate}
                              className="bg-[#1a1a1a] text-white hover:bg-black rounded-lg h-10 font-bold shadow-lg shadow-black/10 disabled:opacity-50 disabled:shadow-none transition-all hover:-translate-y-0.5"
                            >
                              Confirm
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Conflict Resolution Dialog */}
                  <Dialog
                    open={!!conflictDate}
                    onOpenChange={(open) => !open && setConflictDate(null)}
                  >
                    <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-0 shadow-2xl rounded-lg bg-transparent">
                      <div className="relative">
                        {/* Premium Header Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#7dab4f] to-[#5a8c3e] z-0" />

                        <DialogHeader className="relative z-10 p-6 text-white flex flex-row items-center gap-4">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner border border-white/10 shrink-0">
                            <UtensilsCrossed className="w-6 h-6 text-white" />
                          </div>

                          <div className="flex flex-col text-left">
                            <DialogTitle className="text-lg font-black tracking-tight text-white">
                              Recipe Already Exists
                            </DialogTitle>
                            <p className="text-white/80 text-sm font-medium leading-tight">
                              You have existing plans for{" "}
                              {conflictDate
                                ? format(conflictDate, "MMM d")
                                : "this date"}
                              .
                            </p>
                          </div>
                        </DialogHeader>

                        <div className="relative z-10 bg-white rounded-t-xl mt-[-10px] p-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                          <div className="text-sm text-gray-600 mb-6 bg-gray-50/50 p-4 rounded-lg border border-gray-100/50">
                            <p className="mb-3 font-medium text-gray-900">
                              How would you like to proceed?
                            </p>
                            <ul className="space-y-3">
                              <li className="flex gap-3 text-xs leading-relaxed items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] mt-1.5 shrink-0" />
                                <span>
                                  <strong className="text-gray-900 block mb-0.5">
                                    Use Same Recipes
                                  </strong>
                                  Keeps your previously generated recipes and
                                  effectively restores the day's plan.
                                </span>
                              </li>
                              <li className="flex gap-3 text-xs leading-relaxed items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                <span>
                                  <strong className="text-gray-900 block mb-0.5">
                                    Generate New
                                  </strong>
                                  Clears all data for this date. You will need
                                  to select cuisines and generate new recipes.
                                </span>
                              </li>
                            </ul>
                          </div>

                          <div className="flex justify-end gap-3">
                            <Button
                              variant="ghost"
                              onClick={() => {
                                if (conflictDate) {
                                  clearRecipesForDate(conflictDate);
                                  addDateToSelection(conflictDate, true);
                                  setConflictDate(null);
                                }
                              }}
                              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-semibold"
                            >
                              Generate New
                            </Button>
                            <Button
                              className="bg-[#1a1a1a] text-white hover:bg-black font-bold shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5"
                              onClick={() => {
                                if (conflictDate) {
                                  addDateToSelection(conflictDate, true); // Keep existing
                                  setConflictDate(null);
                                }
                              }}
                            >
                              Use Same
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    onClick={() => {
                      if (selectedDate) {
                        addDateToSelection(selectedDate);
                        setSelectedDate(undefined);
                      } else {
                        setIsDateDialogOpen(true);
                      }
                    }}
                    className="h-10 rounded-lg bg-[#1a1a1a] hover:bg-black text-white px-6 shadow-lg shadow-black/5 hover:-translate-y-0.5 transition-transform"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>

                  <Button
                    onClick={() => setIsClearAllDialogOpen(true)}
                    disabled={selectedDates.length === 0}
                    variant="ghost"
                    className="h-10 w-10 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors"
                    title="Clear All"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                  <ConfirmationModal
                    isOpen={isClearAllDialogOpen}
                    title="Clear All Meal Plans"
                    message="Are you sure you want to clear all selected dates and meal plans?"
                    onConfirm={() => {
                      clearAllPlans();
                      setIsClearAllDialogOpen(false);
                    }}
                    onClose={() => setIsClearAllDialogOpen(false)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Selected Dates / Week View Render */}
          <div className="space-y-5">
            {selectedDates.length === 0 && viewMode === "date" && (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-10 text-center bg-white/40 backdrop-blur-md animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-gray-50 border border-gray-200/50 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <CalendarIcon className="w-8 h-8 text-[#7dab4f]" />
                </div>
                <h3 className="text-2xl font-black text-[#1a1a1a] mb-2">
                  {isReadOnly ? "No Plans Yet" : "Start Planning"}
                </h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto leading-relaxed font-normal text-base">
                  {isReadOnly
                    ? "No meal plans have been created for this period."
                    : "Select a date to begin your nutritional journey."}
                </p>
                {!isReadOnly && (
                  <Button
                    onClick={() => setIsDateDialogOpen(true)}
                    className="text-white bg-(--primary) hover:bg-(--primary) text-white rounded-lg h-11 px-6 shadow-xl shadow-[#7dab4f]/20 hover:shadow-2xl hover:-translate-y-1 transition-all font-medium text-base"
                  >
                    Add First Day
                  </Button>
                )}
              </div>
            )}

            {selectedDates.map((d, index) => {
              const isDisabled =
                viewMode === "week" && isDateDisabled(d.actualDate);
              const isToday = isSameDay(d.actualDate, today);

              if (isDisabled) {
                return (
                  <div
                    key={d.key}
                    className="bg-gray-100/50 rounded-lg border border-gray-200/60 p-5 flex items-center justify-between grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all duration-500 group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-lg bg-white flex flex-col items-center justify-center text-gray-400 font-bold border border-gray-200 shadow-sm group-hover:border-[#7dab4f] group-hover:text-[#7dab4f] transition-colors">
                        <span className="text-[10px] uppercase">
                          {format(d.actualDate, "MMM")}
                        </span>
                        <span className="text-lg leading-none">
                          {format(d.actualDate, "d")}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-500 group-hover:text-gray-800 transition-colors text-lg">
                          {d.label}
                        </h3>
                        <p className="text-xs text-gray-400 font-medium bg-gray-200/50 inline-block px-2 py-0.5 rounded-md mt-1">
                          Past Date View Only
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={d.key}
                  className={cn(
                    "bg-white rounded-lg border transition-all duration-500 relative animate-in slide-in-from-bottom-4 fill-mode-backwards",
                    isToday
                      ? "border-[#7dab4f]/30 shadow-[0_10px_40px_-10px_rgba(125,171,79,0.15)]"
                      : "border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)]",
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {viewMode === "date" && !isReadOnly && (
                    <button
                      onClick={() => {
                        setSelectedDates((prev) =>
                          prev.filter((item) => item.key !== d.key),
                        );
                        const updated = { ...weekPlan };
                        delete updated[d.key];
                        setWeekPlan(updated);
                        localStorage.setItem(
                          LS_KEYS.WEEK_PLAN,
                          JSON.stringify(updated),
                        );
                        localStorage.setItem(
                          LS_KEYS.SELECTED_DATES,
                          JSON.stringify(
                            selectedDates.filter((item) => item.key !== d.key),
                          ),
                        );
                      }}
                      className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all duration-300 z-10 opacity-0 group-hover:opacity-100 shadow-sm"
                      title="Remove date"
                    >
                      <X className="w-5 h-5 transition-transform hover:rotate-90" />
                    </button>
                  )}

                  <div className="p-2 sm:p-4">
                    <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center">
                      {/* Left Side: Date Header */}
                      <div className="w-full xl:w-[280px] flex-shrink-0 p-4 rounded-lg bg-gray-50 border border-gray-200/50">
                        <div className="flex items-center gap-5">
                          <div
                            className={cn(
                              "w-16 h-16 rounded-lg flex flex-col items-center justify-center font-bold shadow-sm transition-all duration-300 border bg-white",
                              isToday
                                ? "text-[#7dab4f] border-[#7dab4f] shadow-[#7dab4f]/20"
                                : "text-[#1a1a1a] border-gray-100 shadow-gray-100",
                            )}
                          >
                            <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">
                              {format(d.actualDate, "MMM")}
                            </span>
                            <span className="text-2xl leading-none tracking-tighter">
                              {format(d.actualDate, "d")}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-[#1a1a1a] mb-0">
                              {d.label}
                            </h3>
                            {isToday ? (
                              <span className="inline-flex items-center gap-2 text-sm font-bold text-[#7dab4f] bg-green-50/80 px-3 py-1 rounded-full border border-green-100/50">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                                </span>
                                Current Day
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-gray-400 tracking-wide">
                                Daily Plan
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Meal Slots Grid */}
                      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(["breakfast", "lunch", "dinner"] as const).map(
                          (meal) => {
                            const mealSlot = weekPlan[d.key]?.[meal] ?? {
                              type: "skip",
                            };
                            const recipeName = getRecipeName(d.key, meal);
                            const isHomeCooking = [
                              "cook-home",
                              "quick-simple",
                              "meal-prep",
                            ].includes(mealSlot.type);

                            const selectedOption = mealOptions.find(
                              (m) => m.value === mealSlot.type,
                            );
                            const Icon = selectedOption?.icon || Ban;
                            const isSkipped = mealSlot.type === "skip";

                            return (
                              <div
                                key={meal}
                                className="group/slot flex flex-col gap-2"
                              >
                                <label className="text-sm font-medium capitalize tracking-[0.15em] text-gray-400 flex items-center justify-between">
                                  {meal}
                                  {isHomeCooking && (
                                    <ChefHat
                                      size={12}
                                      className="text-[#7dab4f]"
                                    />
                                  )}
                                </label>

                                <div
                                  className={cn(
                                    "relative transition-all duration-300 rounded-lg",
                                    isSkipped ? "bg-gray-50/30" : "bg-white",
                                  )}
                                >
                                  <Select
                                    value={mealSlot.type}
                                    onValueChange={(val: MealType) =>
                                      !isDisabled &&
                                      updateMealSlot(d.key, meal, val)
                                    }
                                    disabled={isDisabled || isReadOnly}
                                  >
                                    <SelectTrigger
                                      className={cn(
                                        "w-full rounded-lg h-14 ring-0 shadow-none text-sm font-medium pl-3 pr-2 transition-all border-0 focus:ring-0",
                                        isSkipped
                                          ? "bg-transparent text-gray-400"
                                          : "bg-white text-gray-900",
                                      )}
                                    >
                                      <SelectValue>
                                        {recipeName ? (
                                          <span className="flex items-center gap-2 truncate text-[#7dab4f]">
                                            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                                              <UtensilsCrossed size={14} />
                                            </div>
                                            <span className="truncate">
                                              {recipeName}
                                            </span>
                                          </span>
                                        ) : (
                                          <span className="flex items-center gap-2.5">
                                            <div
                                              className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 bg-gray-200/50",
                                                isSkipped
                                                  ? "bg-gray-200/50 text-gray-400"
                                                  : cn(
                                                      "bg-opacity-10",
                                                      selectedOption?.color?.replace(
                                                        "text-",
                                                        "bg-",
                                                      ),
                                                    ),
                                              )}
                                            >
                                              <Icon
                                                size={18}
                                                className={cn(
                                                  isSkipped
                                                    ? "text-gray-400"
                                                    : selectedOption?.color,
                                                )}
                                              />
                                            </div>
                                            <span className="truncate">
                                              {selectedOption?.label}
                                            </span>
                                          </span>
                                        )}
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className=" text-whit rounded-lg border border-gray-200 shadow-xl p-1 bg-white">
                                      {mealOptions.map((opt) => (
                                        <SelectItem
                                          key={opt.value}
                                          value={opt.value}
                                          className="cursor-pointer py-2.5 rounded-lg focus:bg-gray-50 pl-2 my-0.5"
                                        >
                                          <span className="flex items-center gap-3 font-medium text-sm">
                                            <div
                                              className={cn(
                                                "w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center",
                                                opt.color,
                                              )}
                                            >
                                              <opt.icon size={16} />
                                            </div>
                                            {opt.label}
                                          </span>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {viewMode === "date" && selectedDates.length > 0 && !isReadOnly && (
              <div className="flex justify-center">
                <Button
                  onClick={addNextDay}
                  className="bg-white hover:bg-gray-50 text-gray-400 hover:text-[#7dab4f] border-2 border-dashed border-gray-200 hover:border-[#7dab4f] rounded-lg h-12 px-4 font-medium transition-all duration-300 w-full md:w-auto shadow-none flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-green-50 transition-colors">
                    <Plus className="w-5 h-5" />
                  </div>
                  Add Next Day (
                  {format(
                    addDays(
                      selectedDates[selectedDates.length - 1].actualDate,
                      1,
                    ),
                    "MMM d",
                  )}
                  )
                </Button>
              </div>
            )}
          </div>

          {/* Floating Action Footer (Island Design) */}
          {/* Floating Action Footer (Island Design) */}
          {selectedDates.length > 0 && !isReadOnly && (
            <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4 animate-in slide-in-from-bottom-10 duration-700 pointer-events-none">
              <div className="bg-[#1a1a1a]/95 backdrop-blur-xl rounded-lg p-2 pl-8 pr-2 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 flex items-center gap-12 w-full max-w-lg pointer-events-auto ring-1 ring-white/10">
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm tracking-wide">
                    Plan Ready?
                  </span>
                  <span className="text-white/50 text-xs font-medium">
                    {selectedDates.length} days scheuled
                  </span>
                </div>
                <Button
                  size="lg"
                  onClick={handleContinueToRecipes}
                  className="bg-white hover:bg-gray-100 text-[#1a1a1a] rounded-lg h-10 px-8 font-medium text-sm shadow-lg shadow-white/10 transition-all hover:scale-105 ml-auto flex items-center gap-2"
                >
                  Continue <ArrowRight size={16} strokeWidth={3} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

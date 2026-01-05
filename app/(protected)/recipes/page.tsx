"use client";

import { RecipeFilters, useRecipesInfiniteQuery } from "@/api/recipe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { groupRecipesByWeek } from "@/lib/recipe-utils";
import {
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  CalendarDays,
  Plus,
  ChefHat,
  Sparkles,
  TrendingUp,
  Heart,
  List,
  Table as TableIcon,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { useInView } from "react-intersection-observer";

import { RecipeCard } from "./components/recipe-card";
import { RecipeDetailsDialog } from "./components/recipe-details-dialog";
import { RecipeFiltersSidebar } from "./components/recipe-filters";
import {
  Recipe,
  useDeleteRecipeMutation,
  useUpdateCookingStatusMutation,
} from "@/api/recipe";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  FileEdit,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Ban,
  Loader2,
  X as XIcon,
} from "lucide-react";
import { toast } from "sonner";

export default function RecipesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. State Management
  const [activeTab, setActiveTab] = useState<"timeline" | "grid" | "table">(
    "timeline",
  );

  // Initialize filters from URL params
  const [filters, setFilters] = useState<RecipeFilters>(() => {
    const params = Object.fromEntries(searchParams.entries());
    return {
      page: params.page ? parseInt(params.page) : 1,
      pageSize: params.pageSize ? parseInt(params.pageSize) : 50,
      sortBy: params.sortBy || "createdAt",
      sortOrder: (params.sortOrder as "asc" | "desc") || "desc",
      // dateFilter: params.dateFilter || "month",
      search: params.search || "",
      cuisines: params.cuisines || "",
      mealTypes: params.mealTypes || "",
      difficulty: params.difficulty || "",
      minPrepTime: params.minPrepTime
        ? parseInt(params.minPrepTime)
        : undefined,
      maxPrepTime: params.maxPrepTime
        ? parseInt(params.maxPrepTime)
        : undefined,
      minCalories: params.minCalories
        ? parseInt(params.minCalories)
        : undefined,
      maxCalories: params.maxCalories
        ? parseInt(params.maxCalories)
        : undefined,
      minBudget: params.minBudget ? parseFloat(params.minBudget) : undefined,
      maxBudget: params.maxBudget ? parseFloat(params.maxBudget) : undefined,
    };
  });

  const [searchInput, setSearchInput] = useState(filters.search || "");
  const debouncedSearch = useDebounce(searchInput, 500);

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Sync debounced search with filters
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters((prev) => ({ ...prev, search: debouncedSearch, page: 1 }));
    }
  }, [debouncedSearch]);

  // Sync filters to URL params
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, value.toString());
      }
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [filters, pathname, router]);

  // 2. Data Fetching
  const {
    data,
    isLoading,
    isError,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useRecipesInfiniteQuery(filters);
  const { ref, inView } = useInView();

  console.log({ data }, "datadatadatadata");

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);
  const deleteMutation = useDeleteRecipeMutation();
  const statusMutation = useUpdateCookingStatusMutation();

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success(`Recipe "${name}" deleted`),
      });
    }
  };

  const handleStatusUpdate = (
    id: string,
    status: "cooked" | "not_cooked" | "not_interested",
  ) => {
    statusMutation.mutate(
      { id, status },
      {
        onSuccess: () =>
          toast.success(`Status updated to ${status.replace("_", " ")}`),
      },
    );
  };

  // 3. Handlers
  const handleFilterChange = (newFilters: RecipeFilters) => {
    // Reset to page 1 implicitly by changing filters (Query key changes)
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split("-");
    handleFilterChange({ sortBy, sortOrder: sortOrder as "asc" | "desc" });
  };

  const openRecipeDetails = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsDialogOpen(true);
  };

  // Grouping Logic (Flatten all pages first)
  const allRecipes = data?.pages.flatMap((page) => page.recipes) || [];
  const groupedRecipes = groupRecipesByWeek(allRecipes);

  // Active filters count and labels
  const activeFilters = useMemo(() => {
    const filters_list: { key: string; label: string; value: any }[] = [];
    if (filters.cuisines) {
      filters.cuisines.split(",").forEach((c) => {
        filters_list.push({
          key: `cuisine-${c}`,
          label: `Cuisine: ${c}`,
          value: c,
        });
      });
    }
    if (filters.mealTypes) {
      filters.mealTypes.split(",").forEach((m) => {
        filters_list.push({
          key: `mealType-${m}`,
          label: `Meal: ${m}`,
          value: m,
        });
      });
    }
    if (filters.difficulty) {
      filters.difficulty.split(",").forEach((d) => {
        filters_list.push({
          key: `difficulty-${d}`,
          label: `Difficulty: ${d}`,
          value: d,
        });
      });
    }
    if (filters.minBudget !== undefined || filters.maxBudget !== undefined) {
      filters_list.push({
        key: "budget",
        label: `Budget: $${filters.minBudget || 0}-$${filters.maxBudget || 50}`,
        value: "budget",
      });
    }
    if (
      filters.minPrepTime !== undefined ||
      filters.maxPrepTime !== undefined
    ) {
      filters_list.push({
        key: "prepTime",
        label: `Time: ${filters.minPrepTime || 0}-${filters.maxPrepTime || 120}min`,
        value: "prepTime",
      });
    }
    if (
      filters.minCalories !== undefined ||
      filters.maxCalories !== undefined
    ) {
      filters_list.push({
        key: "calories",
        label: `Calories: ${filters.minCalories || 0}-${filters.maxCalories || 2000}`,
        value: "calories",
      });
    }
    return filters_list;
  }, [filters]);

  const removeFilter = (filterKey: string) => {
    const newFilters = { ...filters };
    if (filterKey.startsWith("cuisine-")) {
      const cuisine = filterKey.replace("cuisine-", "");
      const cuisines =
        filters.cuisines?.split(",").filter((c) => c !== cuisine) || [];
      newFilters.cuisines = cuisines.join(",");
    } else if (filterKey.startsWith("mealType-")) {
      const mealType = filterKey.replace("mealType-", "");
      const mealTypes =
        filters.mealTypes?.split(",").filter((m) => m !== mealType) || [];
      newFilters.mealTypes = mealTypes.join(",");
    } else if (filterKey.startsWith("difficulty-")) {
      const difficulty = filterKey.replace("difficulty-", "");
      const difficulties =
        filters.difficulty?.split(",").filter((d) => d !== difficulty) || [];
      newFilters.difficulty = difficulties.join(",");
    } else if (filterKey === "budget") {
      delete newFilters.minBudget;
      delete newFilters.maxBudget;
    } else if (filterKey === "prepTime") {
      delete newFilters.minPrepTime;
      delete newFilters.maxPrepTime;
    } else if (filterKey === "calories") {
      delete newFilters.minCalories;
      delete newFilters.maxCalories;
    }
    setFilters({ ...newFilters });
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setFilters({
      page: 1,
      pageSize: filters.pageSize,
      sortBy: "createdAt",
      sortOrder: "desc",
      dateFilter: "all",
      search: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans relative overflow-hidden">
      {/* Background Decoration similar to Account Page */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#3d326d]/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#7661d3]/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 py-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-8 gap-6 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#3d326d] font-bold text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                <ChefHat size={12} />
                Master Chef
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#313131] tracking-tight">
              Recipe Management
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Organize, discover, and plan your culinary journey
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                toast.promise(refetch(), {
                  loading: "Refreshing recipes...",
                  success: "Recipes refreshed!",
                  error: "Failed to refresh",
                });
              }}
              className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-4 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all flex items-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button className="bg-[#313131] hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 text-sm">
              <Plus size={18} />
              Create Recipe
            </button>
          </div>
        </div>

        {/* Dashboard Stats / Hero Grid - Mimics Account Page Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Hero Card - 5 cols */}
          <div className="lg:col-span-5 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#3d326d] to-[#7661d3] rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative h-full bg-white rounded-2xl p-6 shadow-md border border-gray-100 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#F3F0FD] to-[#e0d6ff] rounded-full -mr-10 -mt-10 opacity-50 transition-transform group-hover:scale-110 duration-700" />

              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#3d326d] flex items-center justify-center text-white shadow-md">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-[#313131]">
                      AI Chef Assist
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      Generate recipes instantly
                    </p>
                  </div>
                </div>
                <Button className="w-full bg-[#3d326d] hover:bg-[#2d2454] text-white font-bold rounded-xl shadow-md transition-all">
                  Try AI Generation
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats - 7 cols */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stat 1 */}
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-200 hover:border-[#3d326d]/20 transition-all group">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2.5 bg-[#F3F0FD] text-[#3d326d] rounded-xl group-hover:bg-[#3d326d] group-hover:text-white transition-colors">
                  <TrendingUp size={20} />
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                  +2 this week
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-[#313131] mt-2">
                {data?.pages[0]?.pagination.totalRecipes || 0}
              </h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">
                Total Recipes
              </p>
            </div>

            {/* Stat 2 */}
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-200 hover:border-[#3d326d]/20 transition-all group">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <Heart size={20} />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-[#313131] mt-2">
                12
              </h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">
                Favorites
              </p>
            </div>
          </div>
        </div>

        {/* Tabs & Toolbar - Grouped for cleaner look */}
        <div className="space-y-6">
          {/* Navigation Tabs - Exactly matching Account Page */}
          <div className="flex gap-3 overflow-x-auto pb-2 animate-fade-in no-scrollbar">
            {[
              { id: "timeline", label: "Timeline View", icon: CalendarDays },
              { id: "grid", label: "Grid View", icon: LayoutGrid },
              { id: "table", label: "Table View", icon: TableIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
                    isActive
                      ? "bg-[#3d326d] text-white shadow-md scale-105"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-200 flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              {isFetching && !isLoading && (
                <Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3d326d] animate-spin" />
              )}
              {!isFetching && (
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              )}
              <Input
                placeholder="Search recipes..."
                className="pl-10 h-11 bg-transparent border-none focus:ring-0 text-base font-medium placeholder:text-gray-400"
                value={searchInput}
                onChange={handleSearch}
              />
            </div>

            <div className="flex items-center gap-2 p-1 overflow-x-auto">
              <div className="h-6 w-px bg-gray-200 hidden md:block" />

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-9 px-3 text-gray-600 hover:text-[#3d326d] hover:bg-[#3d326d]/5 font-bold rounded-lg md:hidden"
                  >
                    <Filter className="mr-2 h-4 w-4" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px]">
                  <RecipeFiltersSidebar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                  />
                </SheetContent>
              </Sheet>

              <Select
                defaultValue="createdAt-desc"
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="w-[160px] h-9 border-none bg-gray-50 hover:bg-gray-100 rounded-lg font-bold text-gray-600 text-xs focus:ring-0">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-200 shadow-xl">
                  <SelectItem value="createdAt-desc">Newest First</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                  <SelectItem value="totalTimeMinutes-asc">Quickest</SelectItem>
                  <SelectItem value="estimatedCostPerServing-asc">
                    Details: Lowest Cost
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* <div className="flex bg-gray-100 p-1 rounded-lg">
                {["week", "month", "year"].map((limit) => (
                  <button
                    key={limit}
                    onClick={() => handleFilterChange({ dateFilter: limit })}
                    className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${filters.dateFilter === limit
                      ? "bg-white text-[#3d326d] shadow-sm"
                      : "text-gray-500 hover:text-[#313131]"
                      }`}
                  >
                    {limit}
                  </button>
                ))}
                <button
                  onClick={() => handleFilterChange({ dateFilter: "all" })}
                  className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${filters.dateFilter === "all"
                    ? "bg-white text-[#3d326d] shadow-sm"
                    : "text-gray-500 hover:text-[#313131]"
                    }`}
                >
                  All
                </button>
              </div> */}
            </div>
          </div>
        </div>

        {/* Active Filters Badges */}
        {activeFilters.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mt-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Active Filters ({activeFilters.length}):
              </span>
              {activeFilters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => removeFilter(filter.key)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3d326d]/5 text-[#3d326d] rounded-lg text-xs font-bold hover:bg-[#3d326d]/10 transition-colors group"
                >
                  {filter.label}
                  <XIcon className="w-3 h-3 group-hover:text-red-500 transition-colors" />
                </button>
              ))}
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors ml-auto"
              >
                <XIcon className="w-3 h-3" />
                Clear All
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-8 items-start mt-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden md:block w-72 shrink-0">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 sticky top-24">
              <RecipeFiltersSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-h-[500px] relative">
            {/* Loading Overlay - shows while fetching */}
            {isFetching && !isLoading && (
              <div className="absolute  inset-0 bg-white/60 backdrop-blur-[2px] z-999 flex items-center justify-center rounded-2xl">
                <div className="bg-white px-6 py-4 rounded-xl shadow-lg border border-gray-200 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-[#3d326d]" />
                  <span className="text-sm font-bold text-gray-700">
                    Loading recipes...
                  </span>
                </div>
              </div>
            )}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-2xl" />
                ))}
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-20 bg-red-50 rounded-2xl border border-red-100 text-center px-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500">
                  <Sparkles className="w-8 h-8 opacity-50" />
                </div>
                <h3 className="text-lg font-extrabold text-[#313131]">
                  Failed to load recipes
                </h3>
                <p className="text-gray-500 text-sm mt-1 max-w-xs">
                  Something went wrong while fetching your culinary collection.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="mt-6 bg-white border-red-200 hover:bg-red-50 text-red-600 font-bold"
                >
                  Try Action
                </Button>
              </div>
            ) : !allRecipes || allRecipes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-center px-4">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-400">
                  <Search className="w-10 h-10 opacity-50" />
                </div>
                <h3 className="text-xl font-extrabold text-[#313131]">
                  No recipes found
                </h3>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                  We couldn't find any recipes matching your current filters.
                  Try adjusting them or add a new one.
                </p>
                <Button
                  onClick={() =>
                    handleFilterChange({ search: "", dateFilter: "all" })
                  }
                  className="mt-8 bg-[#3d326d] text-white hover:bg-[#2d2454] rounded-xl font-bold px-8 shadow-lg hover:shadow-xl transition-all"
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === "timeline" && (
                    <div className="space-y-12">
                      {Object.entries(groupedRecipes).map(
                        ([weekRange, recipes], idx) => (
                          <div
                            key={weekRange}
                            className="relative pl-8 border-l-2 border-gray-200"
                          >
                            {/* Timeline Dot */}
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#3d326d] ring-4 ring-white" />

                            <div className="mb-6">
                              <h2 className="text-xl font-extrabold text-[#313131] flex items-center gap-3">
                                {weekRange}
                              </h2>
                              <p className="text-sm font-medium text-gray-500">
                                {recipes.length}{" "}
                                {recipes.length === 1 ? "recipe" : "recipes"}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                              {recipes.map((recipe) => (
                                <RecipeCard
                                  key={recipe.id}
                                  recipe={recipe}
                                  onViewDetails={openRecipeDetails}
                                />
                              ))}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )}

                  {activeTab === "grid" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {allRecipes.map((recipe) => (
                        <RecipeCard
                          key={recipe.id}
                          recipe={recipe}
                          onViewDetails={openRecipeDetails}
                        />
                      ))}
                    </div>
                  )}

                  {activeTab === "table" && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                            <TableHead className="w-[300px] font-bold text-[#3d326d]">
                              Recipe Name
                            </TableHead>
                            <TableHead className="font-bold text-[#3d326d]">
                              Cuisine
                            </TableHead>
                            <TableHead className="font-bold text-[#3d326d]">
                              Time
                            </TableHead>
                            <TableHead className="font-bold text-[#3d326d]">
                              Calories
                            </TableHead>
                            <TableHead className="font-bold text-[#3d326d]">
                              Cost/Srv
                            </TableHead>
                            <TableHead className="font-bold text-[#3d326d]">
                              Rating
                            </TableHead>
                            <TableHead className="font-bold text-[#3d326d]">
                              Status
                            </TableHead>
                            <TableHead className="text-right font-bold text-[#3d326d]">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allRecipes.map((recipe) => (
                            <TableRow
                              key={recipe.id}
                              className={`group hover:bg-gray-50/50 transition-colors ${recipe.cookingStatus === "not_interested" ? "opacity-50 bg-gray-50/80 grayscale-[30%]" : ""}`}
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
                                    🍳
                                  </div>
                                  <div>
                                    <p className="text-[#313131] font-bold line-clamp-1">
                                      {recipe.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {recipe.mealType}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-bold text-gray-600">
                                  {recipe.cuisineType}
                                </span>
                              </TableCell>
                              <TableCell className="text-gray-600 font-medium">
                                {recipe.totalTimeMinutes}m
                              </TableCell>
                              <TableCell className="text-gray-600 font-medium">
                                {recipe.calories} kcal
                              </TableCell>
                              <TableCell className="text-[#3d326d] font-bold">
                                $
                                {Number(recipe.estimatedCostPerServing).toFixed(
                                  2,
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <span className="text-amber-500 text-xs">
                                    ★
                                  </span>
                                  <span className="text-gray-700 font-bold text-sm">
                                    {recipe.averageRating?.toFixed(1) || "-"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {recipe.cookingStatus === "cooked" && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle2 className="w-3 h-3" /> Cooked
                                  </span>
                                )}
                                {(!recipe.cookingStatus ||
                                  recipe.cookingStatus === "not_cooked") && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Pending
                                  </span>
                                )}
                                {recipe.cookingStatus === "not_interested" && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    <Ban className="w-3 h-3" /> Not Interested
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                    >
                                      <span className="sr-only">Open menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-[200px] rounded-xl shadow-lg border-gray-100"
                                  >
                                    <DropdownMenuLabel>
                                      Actions
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem
                                      onClick={() => openRecipeDetails(recipe)}
                                      className="cursor-pointer"
                                    >
                                      <Eye className="mr-2 h-4 w-4" /> View
                                      Details
                                    </DropdownMenuItem>

                                    <DropdownMenuSub>
                                      <DropdownMenuSubTrigger className="cursor-pointer">
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Status:{" "}
                                        <span className="ml-1 capitalize font-bold text-[#3d326d]">
                                          {recipe.cookingStatus?.replace(
                                            "_",
                                            " ",
                                          ) || "Pending"}
                                        </span>
                                      </DropdownMenuSubTrigger>
                                      <DropdownMenuSubContent>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleStatusUpdate(
                                              recipe.id,
                                              "cooked",
                                            )
                                          }
                                          className="cursor-pointer"
                                        >
                                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />{" "}
                                          Cooked
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleStatusUpdate(
                                              recipe.id,
                                              "not_cooked",
                                            )
                                          }
                                          className="cursor-pointer"
                                        >
                                          <XCircle className="mr-2 h-4 w-4 text-gray-500" />{" "}
                                          Not Cooked yet
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleStatusUpdate(
                                              recipe.id,
                                              "not_interested",
                                            )
                                          }
                                          className="cursor-pointer"
                                        >
                                          <Ban className="mr-2 h-4 w-4 text-red-500" />{" "}
                                          Not Interested
                                        </DropdownMenuItem>
                                      </DropdownMenuSubContent>
                                    </DropdownMenuSub>

                                    <DropdownMenuItem className="cursor-pointer">
                                      <FileEdit className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDelete(recipe.id, recipe.name)
                                      }
                                      className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
            {/* Infinite Scroll Loader */}
            <div ref={ref} className="flex justify-center py-8">
              {isFetchingNextPage ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#3d326d]" />
                  <span className="text-sm font-bold text-gray-500">
                    Cooking up more recipes...
                  </span>
                </div>
              ) : hasNextPage ? (
                <span className="text-sm text-gray-400">Scroll for more</span>
              ) : (
                allRecipes.length > 0 && (
                  <span className="text-sm font-bold text-gray-300">
                    You've reached the end of your cookbook! 🍳
                  </span>
                )
              )}
            </div>{" "}
          </div>
        </div>

        <RecipeDetailsDialog
          onOpenChange={setIsDialogOpen}
          recipe={selectedRecipe}
          open={isDialogOpen}
        />
      </div>
    </div>
  );
}

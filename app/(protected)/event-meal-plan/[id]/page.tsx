"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowLeft,
    Calendar,
    Clock,
    Users,
    Wallet,
    ChefHat,
    ShoppingCart,
    Plus,
    MoreHorizontal,
    Sparkles,
    CheckCircle,
    AlertCircle,
    Trash2,
    Edit,
    PartyPopper,
    ListChecks,
    Utensils,
    ChevronRight,
    Search,
    Filter,
    X,
    Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

// Hooks
import { useEvent, useEventMeals } from "@/services/event/event.query";
import { useRecipe } from "@/services/recipe/recipe.query";
import {
    useUpdateEvent,
    useDeleteEvent,
    useCompleteEvent,
    useGenerateShoppingList,
    useDeleteEventMeal,
    useRemoveRecipeFromMeal,
    useAddRecipeToMeal,
    useDeleteEventItem,
} from "@/services/event/event.mutation";
import { QuickItemSelector } from "./_components/QuickItemSelector";

// Constants
import {
    getOccasionOption,
    getMealTypeOption,
    formatEventDate,
    formatEventTime,
    formatCurrency,
} from "../constants/event.constants";
import { cn } from "@/lib/utils";

// Types
import { EventResponse, EventMealResponse, MealType, EventRecipeResponse, EventItemResponse } from "@/services/event/event.types";
import { Recipe } from "@/services/recipe";
import { RecipeCard } from "../../recipes/components/recipe-card";
import { RecipeDetailsDialog } from "../../recipes/components/recipe-details-dialog";

// Helper to adapt EventRecipeResponse to Recipe
const adaptEventRecipeToRecipe = (eventRecipe: EventRecipeResponse): Recipe => {
    if (!eventRecipe.recipe) {
        // Fallback if recipe data is missing
        return {
            id: eventRecipe.recipeId,
            name: "Unknown Recipe",
            description: "",
            imageUrl: "",
            cuisineType: "Unknown",
            mealType: "Unknown",
            servings: eventRecipe.servings,
            totalTimeMinutes: 0,
            prepTimeMinutes: 0,
            cookTimeMinutes: 0,
            difficultyLevel: "Medium",
            estimatedCostPerServing: eventRecipe.estimatedCost || 0,
            calories: 0,
            isPublic: false,
            createdAt: new Date().toISOString(),
            ingredients: [],
            instructions: [],
            nutrition: null,
            costAnalysis: null,
            timesCooked: 0,
            totalRatings: 0,
            isFavorite: false
        };
    }

    const r = eventRecipe.recipe;
    return {
        id: r.id,
        name: r.name,
        description: r.description || "",
        imageUrl: r.imageUrl || "",
        cuisineType: r.cuisineType || "General",
        mealType: "Event Meal", // Metadata for display
        servings: r.servings,
        totalTimeMinutes: (r.prepTimeMinutes || 0) + (r.cookTimeMinutes || 0),
        prepTimeMinutes: r.prepTimeMinutes || 0,
        cookTimeMinutes: r.cookTimeMinutes || 0,
        difficultyLevel: r.difficultyLevel || "Medium",
        estimatedCostPerServing: r.estimatedCostPerServing || 0,
        calories: r.calories || 0,
        isPublic: true,
        createdAt: new Date().toISOString(), // Fallback as event recipes might not have this
        ingredients: (r as any).ingredients || [],
        instructions: (r as any).instructions || [],
        nutrition: (r as any).nutrition || null,
        costAnalysis: (r as any).costAnalysis || null,
        timesCooked: 0,
        totalRatings: 0,
        isFavorite: false, // Default
        // Add other fields as necessary from r if available
        ...((r as any).nutrition ? { nutrition: (r as any).nutrition } : {}),
        ...((r as any).instructions ? { instructions: (r as any).instructions } : {}),
        ...((r as any).ingredients ? { ingredients: (r as any).ingredients } : {}),
    };
};

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    // Fetch event data
    const { data: event, isLoading, error, refetch: refetchEvent } = useEvent(eventId);
    const { data: meals, refetch: refetchMeals } = useEventMeals(eventId);

    // Mutations
    const deleteEventMutation = useDeleteEvent();
    const completeEventMutation = useCompleteEvent();
    const generateShoppingListMutation = useGenerateShoppingList();
    const deleteEventMealMutation = useDeleteEventMeal();
    const removeRecipeFromMealMutation = useRemoveRecipeFromMeal();
    const deleteEventItemMutation = useDeleteEventItem();

    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

    // Fetch full recipe details when selected
    const { data: fullRecipe } = useRecipe(selectedRecipeId);

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Quick Item Selector State
    const [isQuickSelectOpen, setIsQuickSelectOpen] = useState(false);
    const [quickSelectMealId, setQuickSelectMealId] = useState<string>("");
    const [quickSelectMealType, setQuickSelectMealType] = useState<MealType>("snacks");

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">Loading details...</p>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 p-6">
                <div className="max-w-md w-full bg-white rounded-xl  border border-gray-200 p-8 text-center">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Event Not Found</h2>
                    <p className="text-sm text-gray-500 mb-6">The event you are looking for has been removed or does not exist.</p>
                    <Button
                        variant="default"
                        className="w-full bg-[var(--primary)] hover:bg-indigo-700 text-white"
                        onClick={() => router.push("/event-meal-plan")}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Events
                    </Button>
                </div>
            </div>
        );
    }

    const occasionOption = getOccasionOption(event.occasionType);
    const OccasionIcon = occasionOption?.icon || Sparkles;

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteEventMutation.mutateAsync(eventId);
            router.push("/event-meal-plan/list");
        } catch (error) {
            setIsDeleting(false);
        }
    };

    const handleComplete = async () => {
        try {
            await completeEventMutation.mutateAsync(eventId);
            toast.success("Event marked as complete");
        } catch (error) {
            toast.error("Failed to complete event");
        }
    };

    const handleGenerateShoppingList = async () => {
        try {
            await generateShoppingListMutation.mutateAsync(eventId);
            toast.success("Shopping list generated successfully");
        } catch (error) {
            toast.error("Failed to generate shopping list");
        }
    };

    const handleDeleteMeal = async (mealId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Remove this meal time from the event?")) return;
        try {
            await deleteEventMealMutation.mutateAsync({ eventId, mealId });
        } catch (error) {
            // Error handled by mutation
        }
    };

    const handleRemoveRecipe = async (mealId: string, recipeId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Remove this recipe from the meal?")) return;
        try {
            await removeRecipeFromMealMutation.mutateAsync({ eventId, mealId, recipeId });
        } catch (error) {
            // Error handled by mutation
        }
    };

    const handleRemoveItem = async (itemId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Remove this item from the event?")) return;
        try {
            await deleteEventItemMutation.mutateAsync({ eventId, itemId });
        } catch (error) {
            // Error handled by mutation
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'completed': return "bg-green-100 text-green-700 border-green-200";
            case 'in_progress': return "bg-blue-100 text-blue-700 border-blue-200";
            case 'cancelled': return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="h-[calc(100vh-57px)] bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00] relative overflow-auto">

            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-8xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/event-meal-plan/list")}
                            className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full border border-gray-200"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="h-6 w-px bg-gray-200" />
                        <nav className="flex items-center text-sm font-medium text-gray-500">
                            <Link href="/event-meal-plan/list" className="hover:text-gray-900 transition-colors">
                                Events
                            </Link>
                            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
                            <span className="text-gray-900 truncate max-w-[200px]">{event.name}</span>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="default"
                            size="sm"
                            className="bg-[#313131] hover:bg-black text-white font-bold py-2.5 px-4 rounded-lg shadow-none transition-all flex items-center gap-2 text-sm h-auto" onClick={() => router.push(`/event-meal-plan/${eventId}/generate-recipe`)}
                        >
                            <Plus className="w-4 h-4" />
                            Add Meal
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="rounded-full border-gray-200 hover:bg-gray-50">
                                    <MoreHorizontal className="w-5 h-5 text-gray-500" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-2 bg-white border-gray-200">
                                <DropdownMenuItem onClick={() => router.push(`/event-meal-plan/${eventId}/edit`)} className="cursor-pointer">
                                    <Edit className="w-4 h-4 mr-2" /> Edit Event
                                </DropdownMenuItem>
                                {event.status !== "completed" && (
                                    <DropdownMenuItem onClick={handleComplete} className="cursor-pointer">
                                        <CheckCircle className="w-4 h-4 mr-2" /> Mark Complete
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator className="bg-gray-200 h-px" />
                                <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete Event
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <div className="max-w-8xl mx-auto px-4 md:px-6 relative z-10 py-8">


                {/* Event Header Section */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <Badge variant="outline" className={cn("px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide rounded-md", getStatusStyle(event.status))}>
                                {event.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-md border-transparent">
                                {occasionOption?.label || event.occasionType}
                            </Badge>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-extrabold text-[#313131] tracking-tight mb-2">
                            {event.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>{formatEventDate(new Date(event.eventDate))}</span>
                            </div>
                            {event.eventTime && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span>{formatEventTime(event.eventTime)}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span>{event.totalServings} Guests</span>
                            </div>
                        </div>
                    </div>
                    {event.description && (
                        <div className="md:max-w-md w-full bg-white border border-gray-200 rounded-xl p-4 ">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {event.description}
                            </p>
                        </div>
                    )}
                </div>

                <div className="rounded-2xl overflow-hidden bg-white lg:p-6 p-4">


                    {/* KPI Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {[
                            { label: "Budget", value: event.budgetAmount ? formatCurrency(event.budgetAmount) : "Not Set", icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-50" },
                            { label: "Meals Planned", value: meals?.length || 0, icon: ChefHat, color: "text-orange-600", bg: "bg-orange-50" },
                            { label: "Adult Guests", value: event.adultGuests, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                            { label: "Child Guests", value: event.kidGuests, icon: Users, color: "text-pink-600", bg: "bg-pink-50" },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white rounded-xl lg:p-6 p-4 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] relative overflow-hidden group border border-gray-200 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:border-[#7661d3]/20 transition-all">
                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 font-bold text-xs uppercase tracking-wide mb-1">{stat.label}</p>
                                        <h3 className="text-3xl font-extrabold text-[#313131]">{stat.value}</h3>
                                    </div>
                                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", stat.bg)}>
                                        <stat.icon className={cn("w-6 h-6", stat.color)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Main Content Areas */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column: Menu Schedule (2/3 width) */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Utensils className="w-5 h-5 text-gray-400" />
                                    Event Menu
                                </h2>
                                {meals && meals.length > 0 && (
                                    <Button variant="outline" size="sm" onClick={() => router.push(`/event-meal-plan/${eventId}/generate-recipe`)}>
                                        Manage Menu
                                    </Button>
                                )}
                            </div>

                            {meals && meals.length > 0 ? (
                                <div className="space-y-4">
                                    {meals.map((meal: EventMealResponse) => {
                                        const mealOption = getMealTypeOption(meal.mealType as MealType);
                                        const MealIcon = mealOption?.icon || ChefHat;
                                        const extraItems = event.extraItems?.filter(i => i.category === meal.mealType) || [];

                                        return (
                                            <div
                                                key={meal.id}
                                                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-indigo-300 transition-colors cursor-pointer"
                                                onClick={() => router.push(`/event-meal-plan/${eventId}/meals/${meal.id}`)}
                                            >
                                                <div className="p-5 flex flex-col sm:flex-row gap-4">
                                                    <div className="flex-shrink-0">
                                                        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", mealOption?.color ? `bg-${mealOption.color.split('-')[1]}-50 text-${mealOption.color.split('-')[1]}-600` : "bg-gray-100 text-gray-600")}>
                                                            <MealIcon className="w-6 h-6" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <h3 className="text-base font-bold text-gray-900 capitalize">{mealOption?.label || meal.mealType}</h3>
                                                                {meal.scheduledTime && (
                                                                    <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5 mt-0.5">
                                                                        <Clock className="w-3.5 h-3.5" />
                                                                        {formatEventTime(meal.scheduledTime)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[var(--primary)] transition-colors" />
                                                        </div>

                                                        {(meal.recipes && meal.recipes.length > 0) || (extraItems && extraItems.length > 0) ? (
                                                            ['breakfast', 'lunch', 'dinner', 'brunch'].includes(meal.mealType) ? (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                                                                    {meal.recipes?.map((eventRecipe: EventRecipeResponse) => {
                                                                        const recipe = adaptEventRecipeToRecipe(eventRecipe);
                                                                        return (
                                                                            <div key={eventRecipe.id} className="h-full relative group/wrapper">
                                                                                <RecipeCard
                                                                                    recipe={recipe}
                                                                                    onViewDetails={(r) => {
                                                                                        setSelectedRecipe(r);
                                                                                        setSelectedRecipeId(r.id);
                                                                                        setIsDialogOpen(true);
                                                                                    }}
                                                                                />
                                                                                <Button
                                                                                    variant="destructive"
                                                                                    size="icon"
                                                                                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover/wrapper:opacity-100 transition-opacity z-20"
                                                                                    onClick={(e) => handleRemoveRecipe(meal.id, eventRecipe.recipeId || "", e)}
                                                                                >
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </Button>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                    <div
                                                                        className="h-full min-h-[300px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-6 text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group/add"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            router.push(`/event-meal-plan/${eventId}/recipe-selection`);
                                                                        }}
                                                                    >
                                                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3 group-hover/add:scale-110 transition-transform shadow-sm">
                                                                            <Plus className="w-6 h-6" />
                                                                        </div>
                                                                        <h4 className="font-semibold text-gray-900">Add Recipes</h4>
                                                                        <p className="text-xs text-gray-500 mt-1">
                                                                            Generate or select more
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ) : (


                                                                /* Compact Grid for Snacks & Beverages */
                                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
                                                                    {extraItems.map((item: EventItemResponse) => {
                                                                        return (
                                                                            <div key={item.id} className="relative group/compact-card bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all flex flex-col h-full">
                                                                                {/* Image Area - Placeholder for Items */}
                                                                                <div className="h-24 w-full bg-gray-100 relative overflow-hidden flex items-center justify-center">
                                                                                    <img
                                                                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random`}
                                                                                        alt={item.name}
                                                                                        className="w-full h-full object-cover group-hover/compact-card:scale-105 transition-transform duration-300"
                                                                                    />
                                                                                    {/* Overlay Actions */}
                                                                                    <div className="absolute inset-x-0 bottom-0 p-1 bg-gradient-to-t from-black/60 to-transparent flex justify-end opacity-0 group-hover/compact-card:opacity-100 transition-opacity">
                                                                                        <Button
                                                                                            variant="destructive"
                                                                                            size="icon"
                                                                                            className="h-6 w-6 rounded-full"
                                                                                            onClick={(e) => handleRemoveItem(item.id, e)}
                                                                                        >
                                                                                            <Trash2 className="w-3 h-3" />
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>

                                                                                {/* Content */}
                                                                                <div className="p-2 flex-1 flex flex-col">
                                                                                    <h4 className="text-xs font-semibold text-gray-900 line-clamp-2 mb-1 leading-tight min-h-[2.5em]" title={item.name}>
                                                                                        {item.name}
                                                                                    </h4>
                                                                                    <p className="text-[10px] text-gray-500 mb-2">
                                                                                        {item.quantity} {item.unit}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}

                                                                    {/* Compact Add More */}
                                                                    <div
                                                                        className="h-full min-h-[140px] border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center p-2 text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group/add-compact"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setQuickSelectMealId(meal.id);
                                                                            setQuickSelectMealType(meal.mealType as MealType);
                                                                            setIsQuickSelectOpen(true);
                                                                        }}
                                                                    >
                                                                        <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-2 group-hover/add-compact:scale-110 transition-transform">
                                                                            <Plus className="w-4 h-4" />
                                                                        </div>
                                                                        <span className="text-xs font-medium text-gray-600 group-hover/add-compact:text-indigo-600">Add Item</span>
                                                                    </div>
                                                                </div>
                                                            )
                                                        ) : (
                                                            <div className="mt-4 p-8 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                                                                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
                                                                    <Sparkles className="w-6 h-6 text-indigo-600" />
                                                                </div>
                                                                <h4 className="text-sm font-semibold text-gray-900 mb-1">No recipes yet</h4>
                                                                <p className="text-xs text-gray-500 mb-4 max-w-[250px]">
                                                                    {['breakfast', 'lunch', 'dinner'].includes(meal.mealType)
                                                                        ? 'Start building your menu by generating recipes with AI.'
                                                                        : 'Add items from our curated list.'}
                                                                </p>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (['breakfast', 'lunch', 'dinner'].includes(meal.mealType)) {
                                                                            router.push(`/event-meal-plan/${eventId}/recipe-selection`);
                                                                        } else {
                                                                            setQuickSelectMealId(meal.id);
                                                                            setQuickSelectMealType(meal.mealType as MealType);
                                                                            setIsQuickSelectOpen(true);
                                                                        }
                                                                    }}
                                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                                                                >
                                                                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                                                                    {['breakfast', 'lunch', 'dinner'].includes(meal.mealType) ? 'Add Recipes' : 'Add Items'}
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <ChefHat className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">Create your menu</h3>
                                    <p className="text-gray-500 max-w-xs mx-auto mb-6 text-sm">Start by adding meal times (Breakfast, Lunch, Dinner, etc.) for your event.</p>
                                    <Button onClick={() => router.push(`/event-meal-plan/${eventId}/generate-recipe`)} className="bg-[var(--primary)] hover:bg-indigo-700 text-white">
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Launch Recipe Wizard
                                    </Button>
                                </div>
                            )}
                        </div>



                        {/* Right Column: Context & Tools (1/3 width) */}
                        <div className="space-y-6">

                            {/* Shopping List Widget */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                                        <ShoppingCart className="w-4 h-4 text-gray-500" />
                                        Shopping List
                                    </h3>
                                    {event.shoppingList && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-2 py-0.5 h-auto text-[10px] uppercase">Active</Badge>}
                                </div>
                                <div className="p-5">
                                    {event.shoppingList ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Status</span>
                                                <span className="font-medium capitalize text-gray-900">{event.shoppingList.status}</span>
                                            </div>
                                            {event.shoppingList.totalEstimated && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500">Est. Cost</span>
                                                    <span className="font-bold text-gray-900">{formatCurrency(event.shoppingList.totalEstimated)}</span>
                                                </div>
                                            )}
                                            <Button
                                                variant="outline"
                                                className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                                                onClick={() => router.push(`/event-meal-plan/${eventId}/shopping-list`)}
                                            >
                                                View List
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-3">
                                            <p className="text-sm text-gray-500">Generate a master shopping list from all your planned recipes.</p>
                                            <Button
                                                className="w-full bg-gray-900 text-white hover:bg-black h-12 text-base"
                                                onClick={handleGenerateShoppingList}
                                                disabled={generateShoppingListMutation.isPending}
                                            >
                                                {generateShoppingListMutation.isPending ? "Processing..." : "Generate List"}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Guest Summary Widget */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                                        <ListChecks className="w-4 h-4 text-gray-500" />
                                        Guest Breakdown
                                    </h3>
                                </div>
                                <div className="p-5">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-200 text-xs font-bold text-gray-700">AD</div>
                                                <span className="text-sm font-medium text-gray-700">Adult Guests</span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">{event.adultGuests}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-200 text-xs font-bold text-gray-700">CH</div>
                                                <span className="text-sm font-medium text-gray-700">Children</span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">{event.kidGuests}</span>
                                        </div>
                                    </div>

                                    {event.participants && event.participants.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Family Members</h4>
                                            <div className="space-y-3">
                                                {event.participants.map((participant: any) => (
                                                    <div key={participant.id} className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs border border-indigo-200">
                                                            {participant.member?.name?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700">{participant.member?.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500">Total Servings Required</span>
                                        <span className="text-lg font-bold text-indigo-600">{event.totalServings}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div >

            {/* Recipe Details Dialog */}
            < RecipeDetailsDialog
                recipe={fullRecipe ?? selectedRecipe
                }
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        // Optional: Clear selection after animation
                        setTimeout(() => setSelectedRecipeId(null), 300);
                    }
                }}
            />
            {/* Quick Item Selector for Snacks/Beverages */}
            <QuickItemSelector
                open={isQuickSelectOpen}
                onOpenChange={setIsQuickSelectOpen}
                mealId={quickSelectMealId}
                mealType={quickSelectMealType}
                eventId={eventId}
                onSuccess={() => {
                    refetchEvent();
                    refetchMeals();
                }}
            />
        </div >
    );
}

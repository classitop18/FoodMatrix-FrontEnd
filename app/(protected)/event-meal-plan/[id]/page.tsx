"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
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
    ListChecks,
    Utensils,
    ChevronRight,
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
    useDeleteEventItem,
} from "@/services/event/event.mutation";
import { QuickItemSelector } from "./_components/QuickItemSelector";
import { MealSection } from "./_components/MealSection";

// Constants
import {
    getOccasionOption,
    formatEventDate,
    formatEventTime,
    formatCurrency,
} from "../constants/event.constants";
import { cn } from "@/lib/utils";

// Types
import { EventRecipeResponse, MealType } from "@/services/event/event.types";
import { Recipe } from "@/services/recipe";
import { RecipeDetailsDialog } from "@/components/common/RecipeDetailsDialog";
import ThemeButton from "@/components/common/buttons/theme-button";
import { useToast } from "@/hooks/use-toast";


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
        createdAt: new Date().toISOString(),
        ingredients: (r as any).ingredients || [],
        instructions: (r as any).instructions || [],
        nutrition: (r as any).nutrition || null,
        costAnalysis: (r as any).costAnalysis || null,
        timesCooked: 0,
        totalRatings: 0,
        isFavorite: false, // Default
        ...((r as any).nutrition ? { nutrition: (r as any).nutrition } : {}),
        ...((r as any).instructions ? { instructions: (r as any).instructions } : {}),
        ...((r as any).ingredients ? { ingredients: (r as any).ingredients } : {}),
    };
};

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    const { toast } = useToast();

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

    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

    // Fetch full recipe details when selected
    const { data: fullRecipe, isLoading: isRecipeLoading } = useRecipe(selectedRecipeId);

    // Merge logic: Use fullRecipe if available, but preserve imageUrl from selectedRecipe if fullRecipe lacks it
    // This fixes the issue where event recipes might have images in the list but not in the detailed fetch
    const displayRecipe = fullRecipe
        ? { ...fullRecipe, imageUrl: fullRecipe.imageUrl || selectedRecipe?.imageUrl }
        : selectedRecipe;

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
                <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 p-8 text-center">
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

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
            return;
        }

        try {
            await deleteEventMutation.mutateAsync(eventId);
            router.push("/event-meal-plan/list");
        } catch (error) {
            // Error handling
        }
    };

    const handleComplete = async () => {
        try {
            await completeEventMutation.mutateAsync(eventId);

            toast({
                title: "Event marked as completed",
                description: "You can still view the event details, but it is now read-only.",

            });
        } catch (error) {
            console.log(error);

            toast({
                title: "Error",
                description: "Failed to complete event",
                variant: "destructive",
            })
        }
    };

    const handleGenerateShoppingList = async () => {
        try {
            await generateShoppingListMutation.mutateAsync(eventId);
            toast({
                title: "Success",
                description: "Shopping list generated successfully",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to generate shopping list",
                variant: "destructive",
            })
        }
    };

    const handleDeleteMeal = async (mealId: string) => {
        if (!confirm("Remove this meal time from the event?")) return;
        try {
            await deleteEventMealMutation.mutateAsync({ eventId, mealId });
        } catch (error) {
            console.log(error);

            toast({
                title: "Error",
                description: "Failed to delete meal",
                variant: "destructive",
            })
        }
    };

    const handleRemoveRecipe = async (mealId: string, recipeId: string) => {
        if (!confirm("Remove this recipe from the meal?")) return;
        try {
            await removeRecipeFromMealMutation.mutateAsync({ eventId, mealId, recipeId });
        } catch (error) {
            console.log(error);

            toast({
                title: "Error",
                description: "Failed to remove recipe",
                variant: "destructive",
            })
        }
    };

    const handleRemoveItem = async (itemId: string) => {
        if (!confirm("Remove this item from the event?")) return;
        try {
            await deleteEventItemMutation.mutateAsync({ eventId, itemId });
        } catch (error) {
            console.log(error);

            toast({
                title: "Error",
                description: "Failed to remove item",
                variant: "destructive",
            })
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

    console.log({ participants: event.participants });

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
                        {/* <Button
                            variant="default"
                            size="sm"
                            className="bg-[#313131] hover:bg-black text-white font-bold py-2.5 px-4 rounded-lg shadow-none transition-all flex items-center gap-2 text-sm h-auto" onClick={() => router.push(`/event-meal-plan/${eventId}/generate-recipe`)}
                        >
                            <Plus className="w-4 h-4" />
                            Add Meal
                        </Button> */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="rounded-full border-gray-200 hover:bg-gray-50">
                                    <MoreHorizontal className="w-5 h-5 text-gray-500" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-2 bg-white border-gray-200">
                                <DropdownMenuItem onClick={() => toast({

                                })} className="cursor-pointer">
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
                        <div className="lg:col-span-2 space-y-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Utensils className="w-5 h-5 text-gray-400" />
                                    Event Menu
                                </h2>
                                {/* {meals && meals.length > 0 && (

                                    <ThemeButton
                                        label="Manage Meals"
                                        onClick={() => router.push(`/event-meal-plan/${eventId}/generate-recipe`)}
                                        className="rounded-xl"
                                    />

                                )} */}


                            </div>

                            {meals && meals.filter(m => ['breakfast', 'lunch', 'dinner'].includes(m.mealType)).length > 0 ? (
                                <div className="space-y-8">
                                    {meals
                                        .filter(m => ['breakfast', 'lunch', 'dinner'].includes(m.mealType))
                                        .sort((a, b) => {
                                            const order = { 'breakfast': 1, 'lunch': 2, 'dinner': 3 };
                                            return (order[a.mealType as keyof typeof order] || 99) - (order[b.mealType as keyof typeof order] || 99);
                                        })
                                        .map((meal) => (
                                            <MealSection
                                                key={meal.id}
                                                meal={meal}
                                                eventItems={event.extraItems || []}
                                                onRemoveRecipe={handleRemoveRecipe}
                                                onDeleteMeal={handleDeleteMeal}
                                                onAddRecipe={(mealId) => router.push(`/event-meal-plan/${eventId}/generate-recipe`)}
                                                onAddQuickItem={(mealId, type) => {
                                                    setQuickSelectMealId(mealId);
                                                    setQuickSelectMealType(type);
                                                    setIsQuickSelectOpen(true);
                                                }}
                                                onRemoveItem={handleRemoveItem}
                                                onViewRecipe={(recipe) => {
                                                    setSelectedRecipe(recipe);
                                                    setSelectedRecipeId(recipe.id);
                                                    setIsDialogOpen(true);
                                                }}
                                                adaptRecipe={adaptEventRecipeToRecipe}
                                            />
                                        ))}
                                </div>
                            ) : (
                                <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center justify-center min-h-[400px] transition-all hover:bg-white hover:border-[#3d326d]/20 hover:shadow-lg group">
                                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                        <ChefHat className="w-10 h-10 text-[var(--primary)]" />
                                    </div>
                                    <h3 className="text-xl font-extrabold text-[#313131] mb-3">Your Menu is Empty</h3>
                                    <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium">
                                        Start planning your event by adding Breakfast, Lunch, or Dinner. Our AI can help satisfy all your guests!
                                    </p>
                                    <Button
                                        onClick={() => router.push(`/event-meal-plan/${eventId}/generate-recipe`)}
                                        className="bg-[var(--primary)] hover:bg-[#2d2454] text-white font-bold px-8 py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all text-base"
                                    >
                                        <Sparkles className="w-5 h-5 mr-3" />
                                        Launch Meal Planner
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
                                                className="w-full bg-gray-900 text-white hover:bg-black h-12 text-base font-medium"
                                                onClick={() => router.push(`/event-meal-plan/${eventId}/shopping-list`)}
                                            >
                                                Build & Generate List
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
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {participant.member?.name || (participant?.member?.user?.firstName + " " + participant?.member?.user?.lastName)}
                                                        </span>
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
            <RecipeDetailsDialog
                recipe={displayRecipe}
                isLoading={isRecipeLoading}
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
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

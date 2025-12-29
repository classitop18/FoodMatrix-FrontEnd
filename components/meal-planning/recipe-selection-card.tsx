import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChefHat, Clock, DollarSign, Loader2, Search, Sparkles, Users, Utensils, ThumbsUp, ThumbsDown, Heart, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cuisineOptions, RecipeEntry, RecipePayload, SlotProcessingState } from '@/lib/recipe-constants';
import { useUpdateRecipeMutation } from '@/api/recipe';
import { MultiSelectDropdown } from '@/components/common/multiselect-dropdown';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type GenerateRecipePayload = (
    slotKey: string,
    key: keyof RecipeEntry,
    value: RecipeEntry[keyof RecipeEntry]
) => void;

export type Slot = {
    date: string | Date;
    meal: string;
    type: string;
}

interface RecipeSelectionCardProps {
    slot: Slot;
    recipePayload: RecipePayload;
    members: { id: string, name: string }[];
    isSlotProcessing: SlotProcessingState;
    recipes: any[];
    customRecipes: any[];
    generateRecipePayload: GenerateRecipePayload;
    onGenerateRecipe: (slot: Slot) => void;
    onGenerateCustomRecipe: (slot: Slot) => void;
    onRecipeView: (recipe: any) => void;
    onRecipeSelect?: (recipe: any) => void;
    selectedRecipeId?: string;
}

type RecipePreference = 'liked' | 'disliked' | 'favorited' | null;

export default function RecipeSelectionCard(props: RecipeSelectionCardProps) {
    const {
        slot,
        recipePayload,
        members,
        isSlotProcessing,
        recipes,
        customRecipes,
        generateRecipePayload,
        onGenerateRecipe,
        onRecipeView,
        onGenerateCustomRecipe,
        onRecipeSelect,
        selectedRecipeId
    } = props;

    const slotKey = `${slot.date}-${slot.meal}`;
    const { toast } = useToast();
    const updateRecipeMutation = useUpdateRecipeMutation();

    // Optimized state - storing only one preference per recipe
    const [recipePreferences, setRecipePreferences] = useState<Record<string, RecipePreference>>({});

    // Memoized date formatting
    const formattedDate = useMemo(() =>
        new Date(slot.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }), [slot.date]
    );

    // Score mapping for each preference
    const preferenceScores: Record<'liked' | 'disliked' | 'favorited', number> = {
        liked: 2,
        disliked: -2,
        favorited: 3
    };

    // Optimized preference handler - only one can be active
    const handlePreferenceToggle = useCallback((recipeId: string, preference: RecipePreference, e: React.MouseEvent) => {
        e.stopPropagation();

        setRecipePreferences(prev => {
            const currentPref = prev[recipeId];
            const newPref = currentPref === preference ? null : preference;

            // Calculate score change
            let scoreChange = 0;

            // Remove previous preference score (if any)
            if (currentPref && currentPref !== preference) {
                scoreChange -= preferenceScores[currentPref];
            }

            // Add new preference score (if any)
            if (newPref) {
                scoreChange += preferenceScores[newPref];
            } else if (currentPref === preference && currentPref) {
                // Removing the same preference
                scoreChange -= preferenceScores[currentPref];
            }

            console.log(recipeId, "recipeId", "currentPref:", currentPref, "newPref:", newPref, "scoreChange:", scoreChange);

            // Update backend - send update for both setting and removing preferences
            updateRecipeMutation.mutate({
                id: recipeId,
                data: {
                    lastPreference: newPref,
                    scoreChange: scoreChange
                }
            });

            return { ...prev, [recipeId]: newPref };
        });

        const messages = {
            liked: { active: "👍 Liked! (+2 score)", inactive: "Like Removed (-2 score)", desc: "This helps us learn your preferences" },
            disliked: { active: "👎 Disliked (-2 score)", inactive: "Dislike Removed (+2 score)", desc: "We'll avoid similar recipes" },
            favorited: { active: "❤️ Added to Favorites! (+3 score)", inactive: "Removed from Favorites (-3 score)", desc: "You can find this in your favorites list" }
        };

        const isActive = recipePreferences[recipeId] !== preference;
        const msg = messages[preference!];

        toast({
            title: isActive ? msg.active : msg.inactive,
            description: isActive ? msg.desc : "",
            duration: 2000,
        });
    }, [recipePreferences, updateRecipeMutation, toast]);

    // Recipe card component - optimized and reusable
    const RecipeCard = useCallback(({ recipe }: { recipe: any }) => {

        const cannotGenerate = recipe.canGenerateRecipe === false;
        const hasPantryItems = recipe.pantryItemsUsedCount > 0;
        const preference = recipePreferences[recipe.id];
        const isSelected = selectedRecipeId === recipe.id;

        return (
            <div
                key={recipe.id}
                onClick={() => {
                    if (!cannotGenerate && onRecipeSelect) onRecipeSelect(recipe);
                }}
                className={`relative p-4 rounded-lg transition-all duration-200 cursor-pointer border ${cannotGenerate
                    ? "bg-red-50 border-red-200 opacity-60 cursor-not-allowed"
                    : isSelected
                        ? "border-indigo-400 bg-indigo-50/50 shadow-md ring-2 ring-indigo-100"
                        : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
            >
                {/* Interaction Buttons */}
                {!cannotGenerate && (
                    <div className="absolute top-3 right-3 flex items-center gap-1">
                        <button
                            onClick={(e) => handlePreferenceToggle(recipe?.id, 'liked', e)}
                            className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${preference === 'liked'
                                ? "bg-green-500 text-white shadow-sm"
                                : "bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600"
                                }`}
                        >
                            <ThumbsUp className="w-3 h-3" />
                        </button>

                        <button
                            onClick={(e) => handlePreferenceToggle(recipe.id, 'disliked', e)}
                            className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${preference === 'disliked'
                                ? "bg-red-500 text-white shadow-sm"
                                : "bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600"
                                }`}
                        >
                            <ThumbsDown className="w-3 h-3" />
                        </button>

                        <button
                            onClick={(e) => handlePreferenceToggle(recipe.id, 'favorited', e)}
                            className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${preference === 'favorited'
                                ? "bg-rose-500 text-white shadow-sm"
                                : "bg-gray-100 text-gray-500 hover:bg-rose-50 hover:text-rose-600"
                                }`}
                        >
                            <Heart className={`w-3 h-3 ${preference === 'favorited' ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                )}

                {/* Content Layout - Horizontal */}
                <div className="flex items-center justify-between gap-4 pr-24">
                    {/* Left: Title & Badges */}
                    <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-base mb-1.5 truncate ${cannotGenerate ? "text-red-700" : "text-gray-900"}`}>
                            {recipe.name}
                        </h4>

                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {cannotGenerate && (
                                <Badge variant="destructive" className="text-xs px-2 py-0.5 font-medium">
                                    Cannot Generate
                                </Badge>
                            )}
                            {hasPantryItems && !cannotGenerate && (
                                <Badge className="text-xs px-2 py-0.5 bg-emerald-50 border-emerald-200 text-emerald-700 font-medium">
                                    {recipe.pantryItemsUsedCount} Pantry
                                </Badge>
                            )}
                            {preference === 'favorited' && (
                                <Badge className="text-xs px-2 py-0.5 bg-rose-50 border-rose-200 text-rose-700 font-medium">
                                    Favorite
                                </Badge>
                            )}
                            {preference === 'liked' && (
                                <Badge className="text-xs px-2 py-0.5 bg-green-50 border-green-200 text-green-700 font-medium">
                                    Liked
                                </Badge>
                            )}
                        </div>

                        {/* Stats - Inline */}
                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-1 text-sm">
                                <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center">
                                    <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                                </div>
                                <span className="font-semibold text-gray-900">${recipe?.costAnalysis?.totalCost}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                                <div className="w-6 h-6 rounded-md bg-orange-100 flex items-center justify-center">
                                    <Clock className="w-3.5 h-3.5 text-orange-700" />
                                </div>
                                <span className="font-semibold text-gray-900">{recipe?.totalTimeMinutes}m</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                                <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center">
                                    <Users className="w-3.5 h-3.5 text-blue-700" />
                                </div>
                                <span className="font-semibold text-gray-900">{recipe.servings}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: View Details Button */}
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRecipeView(recipe);
                        }}
                        variant="outline"
                        size="sm"
                        className="text-xs font-medium hover:bg-gray-50 shrink-0"
                    >
                        View Details
                    </Button>
                </div>
            </div>
        );
    }, [recipePreferences, selectedRecipeId, handlePreferenceToggle, onRecipeSelect, onRecipeView]);

    return (
        <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30">
            <Card className="max-w-5xl mx-auto border shadow-lg overflow-hidden">
                <CardHeader className="pb-5 border-b bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
                    <CardTitle className="text-base sm:text-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-14 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-full shadow-sm" />
                                <div>
                                    <div className="font-semibold text-xl flex items-center gap-2.5">
                                        <ChefHat className="w-5 h-5 text-indigo-600" />
                                        <span className="text-gray-900">
                                            {formattedDate}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 font-medium capitalize flex items-center gap-1.5 mt-1">
                                        <Utensils className="w-3.5 h-3.5" />
                                        {slot.meal.toLowerCase()}
                                    </div>
                                </div>
                            </div>
                            <Badge variant="secondary" className="self-start sm:self-center capitalize text-sm font-semibold bg-indigo-100 text-indigo-700 border-indigo-200">
                                {slot.type}
                            </Badge>
                        </div>
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6 pt-6 pb-6">
                    {/* AI Recipe Generator */}
                    <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-indigo-100 shadow-sm">
                        <div className="flex items-center gap-2.5 mb-2">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="font-semibold text-base text-gray-900">
                                AI Recipe Generator
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-700">
                                    Cuisine
                                </label>
                                <Select
                                    value={recipePayload[slotKey]?.cuisine || ""}
                                    onValueChange={(value) => generateRecipePayload(slotKey, "cuisine", value)}
                                >
                                    <SelectTrigger className="w-full bg-white h-10 border-gray-200 hover:border-indigo-300 transition-colors font-medium">
                                        <SelectValue placeholder="Choose cuisine..." />
                                    </SelectTrigger>
                                    <SelectContent className="z-[9999] max-h-60" position="popper">
                                        {cuisineOptions.map((cuisine) => (
                                            <SelectItem key={cuisine.value} value={cuisine.value}>
                                                <span className="flex items-center gap-2">
                                                    <span>{cuisine.icon}</span>
                                                    <span>{cuisine.label}</span>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-700">
                                    Number of Recipes
                                </label>
                                <Select
                                    value={recipePayload[slotKey]?.recipeCount || "1"}
                                    onValueChange={(value) => generateRecipePayload(slotKey, "recipeCount", value)}
                                >
                                    <SelectTrigger className="w-full bg-white h-10 border-gray-200 hover:border-indigo-300 transition-colors font-medium">
                                        <SelectValue placeholder="Select count" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[9999]" position="popper">
                                        {[1, 2, 3].map((value) => (
                                            <SelectItem value={value.toString()} key={value}>
                                                <span className="font-medium">{value} {value === 1 ? 'Recipe' : 'Recipes'}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <MultiSelectDropdown
                                    label="Members"
                                    items={members.map(m => ({ id: m.id, label: m.name }))}
                                    selected={recipePayload[slotKey]?.members || []}
                                    onChange={(updated) => generateRecipePayload(slotKey, "members", updated)}
                                />
                            </div>
                        </div>

                        {/* Pantry Options */}
                        <div className="space-y-2.5 pt-2">
                            <label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                                Pantry Preferences
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="w-3.5 h-3.5 text-gray-400" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs text-xs">
                                            Choose how to use your pantry items in recipe generation
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </label>

                            <RadioGroup
                                value={recipePayload[slotKey]?.pantryOption}
                                onValueChange={(value) => generateRecipePayload(slotKey, "pantryOption", value)}
                                className="flex items-center gap-2 flex-wrap"
                            >
                                {[
                                    { value: "only-pantry", label: "Only Pantry" },
                                    { value: "can-use", label: "Can Use" },
                                    { value: "ignore-pantry", label: "Ignore" }
                                ].map(option => (
                                    <div key={option.value} className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-indigo-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer">
                                        <RadioGroupItem value={option.value} id={option.value} />
                                        <Label htmlFor={option.value} className="text-xs font-semibold cursor-pointer text-gray-700">
                                            {option.label}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        <Button
                            onClick={() => onGenerateRecipe(slot)}
                            disabled={!recipePayload[slotKey]?.cuisine || isSlotProcessing[slotKey]?.isRecipeLoading}
                            className="w-full h-11 font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
                        >
                            {isSlotProcessing[slotKey]?.isRecipeLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Generate Recipes
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Custom Search */}
                    <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-green-50 via-emerald-50 to-orange-50 border border-emerald-100 shadow-sm">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm">
                                <Search className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="font-semibold text-base text-gray-900">
                                Search Custom Recipe
                            </h3>
                        </div>

                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder="e.g., Butter Chicken, Caesar Salad..."
                                value={recipePayload[slotKey]?.customRecipe || ""}
                                onChange={(e) => generateRecipePayload(slotKey, "customRecipe", e.target.value)}
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all bg-white placeholder:text-gray-400"
                            />
                            <Button
                                onClick={() => onGenerateCustomRecipe(slot)}
                                disabled={!(recipePayload[slotKey]?.customRecipe || "").trim()}
                                className="px-5 h-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-semibold shadow-md hover:shadow-lg transition-all"
                            >
                                {isSlotProcessing[slotKey]?.isCustomRecipeLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Search className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* AI Generated Recipes */}
                    {recipes?.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b">
                                <div className="flex items-center gap-2.5">
                                    <Sparkles className="w-5 h-5 text-indigo-600" />
                                    <h3 className="font-semibold text-lg text-gray-900">
                                        AI Generated Recipes
                                    </h3>
                                </div>
                                <Badge className="text-xs font-semibold bg-indigo-100 text-indigo-700 border-indigo-200">
                                    {recipes.length} {recipes.length === 1 ? 'Result' : 'Results'}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {recipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
                            </div>
                        </div>
                    )}

                    {/* Custom Recipes */}
                    {customRecipes?.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b">
                                <div className="flex items-center gap-2.5">
                                    <Search className="w-5 h-5 text-emerald-600" />
                                    <h3 className="font-semibold text-lg text-gray-900">
                                        Custom Search Results
                                    </h3>
                                </div>
                                <Badge className="text-xs font-semibold bg-emerald-100 text-emerald-700 border-emerald-200">
                                    {customRecipes.length} {customRecipes.length === 1 ? 'Result' : 'Results'}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {customRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
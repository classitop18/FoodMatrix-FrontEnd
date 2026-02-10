"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Check, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";

// Services & Redux
import { useEvent } from "@/services/event/event.query";
import { useMembers } from "@/services/member/member.query";
import {
    useAddMealToEvent,
    useAddRecipeToMeal,
    useSuggestBudget,
    useGenerateEventRecipes
} from "@/services/event/event.mutation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store.redux";

// Types & Constants
import { MealType } from "@/services/event/event.types";
import { HealthStats, MealBudgetAllocation, GeneratedRecipeForMeal, GeneratedRecipe } from "./_components/types";
import { MEAL_TYPE_CONFIG, DEFAULT_BUDGET_WEIGHTS } from "./_components/constants";

// Components
import { StepIndicator } from "./_components/StepIndicator";
import { HealthProfileSection } from "./_components/HealthProfileSection";
import { BudgetDistributionSection } from "./_components/BudgetDistributionSection";
import { RecipeSelectionSection } from "./_components/RecipeSelectionSection";

export default function EventRecipeSelectionPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    // States
    const [step, setStep] = useState<"health" | "budget" | "recipes">("health");
    const [budgetStrategy, setBudgetStrategy] = useState<"manual" | "ai">("ai");
    const [totalBudget, setTotalBudget] = useState<number>(100);
    const [selectedMealTypes, setSelectedMealTypes] = useState<MealType[]>([]);
    const [mealBudgets, setMealBudgets] = useState<MealBudgetAllocation[]>([]);
    const [mealRecipes, setMealRecipes] = useState<GeneratedRecipeForMeal[]>([]);
    const [activeMealTab, setActiveMealTab] = useState<MealType>("dinner");
    const [globalCuisine, setGlobalCuisine] = useState<string>("");
    const [isSavingAll, setIsSavingAll] = useState(false);
    const [considerHealthProfile, setConsiderHealthProfile] = useState(true);
    const [selectedHealthMembers, setSelectedHealthMembers] = useState<string[]>([]);

    // Queries
    const { data: event, isLoading: isEventLoading, refetch: refetchEvent } = useEvent(eventId);
    const { activeAccountId } = useSelector((state: RootState) => state.account);
    const { data: membersData, isLoading: isMembersLoading } = useMembers(
        { accountId: activeAccountId || "", limit: 100 },
        { enabled: !!activeAccountId }
    );

    // Mutations - Using NEW Event AI APIs
    const suggestBudgetMutation = useSuggestBudget();
    const generateEventRecipesMutation = useGenerateEventRecipes();
    const { mutateAsync: addMeal } = useAddMealToEvent();
    const { mutateAsync: addRecipe } = useAddRecipeToMeal();

    // Derived Data
    const participants = useMemo(() => {
        const allMembers = (membersData as any)?.data?.data || [];
        const participantIds = (event as any)?.participants?.map((p: any) => p.memberId) || [];

        if (participantIds.length > 0) {
            return allMembers.filter((m: any) => participantIds.includes(m.id));
        }
        return allMembers;
    }, [event, membersData]);

    // Initialize selected members
    useEffect(() => {
        if (participants.length > 0 && selectedHealthMembers.length === 0) {
            setSelectedHealthMembers(participants.map((p: any) => p.id));
        }
    }, [participants]);

    const activeHealthParticipants = useMemo(() => {
        if (!considerHealthProfile) return [];
        return participants.filter((p: any) => selectedHealthMembers.includes(p.id));
    }, [participants, considerHealthProfile, selectedHealthMembers]);

    const healthStats = useMemo<HealthStats>(() => {
        if (activeHealthParticipants.length === 0) {
            return {
                dietaryRestrictions: {},
                allergies: {},
                healthConditions: {},
                totalMembers: 0
            };
        }

        const stats: HealthStats = {
            dietaryRestrictions: {},
            allergies: {},
            healthConditions: {},
            totalMembers: activeHealthParticipants.length
        };

        activeHealthParticipants.forEach((p: any) => {
            p.healthProfile?.dietaryRestrictions?.forEach((dr: string) => {
                stats.dietaryRestrictions[dr] = (stats.dietaryRestrictions[dr] || 0) + 1;
            });
            p.healthProfile?.allergies?.forEach((a: string) => {
                stats.allergies[a] = (stats.allergies[a] || 0) + 1;
            });
            p.healthProfile?.healthConditions?.forEach((hc: string) => {
                stats.healthConditions[hc] = (stats.healthConditions[hc] || 0) + 1;
            });
        });

        return stats;
    }, [activeHealthParticipants]);

    // Initialize meal types from event
    useEffect(() => {
        if (event) {
            let types: MealType[] = [];

            // First priority: Use selectedMealTypes from event creation
            if ((event as any)?.selectedMealTypes &&
                Array.isArray((event as any).selectedMealTypes) &&
                (event as any).selectedMealTypes.length > 0) {
                types = (event as any).selectedMealTypes as MealType[];
            }
            // Fallback: Use existing meals if they exist
            else if ((event as any)?.meals && (event as any).meals.length > 0) {
                const distinct = new Set((event as any).meals.map((m: any) => m.mealType));
                types = Array.from(distinct) as MealType[];
            }

            if (types.length > 0) {
                setSelectedMealTypes(prev => {
                    if (JSON.stringify(prev) !== JSON.stringify(types)) {
                        return types;
                    }
                    return prev;
                });
            }

            // Initialize total budget if set in event
            if ((event as any)?.budget) {
                const budgetData = (event as any).budget;
                const amount = typeof budgetData === 'object' && budgetData.totalBudget
                    ? budgetData.totalBudget
                    : budgetData;

                if (amount && !isNaN(parseFloat(amount))) {
                    setTotalBudget(parseFloat(amount));
                }
            } else if ((event as any)?.budgetAmount) {
                setTotalBudget(parseFloat((event as any).budgetAmount));
            }
        }
    }, [event]);

    // Initialize meal recipes state when meal types change
    useEffect(() => {
        if (selectedMealTypes.length > 0) {
            setMealRecipes(prev => {
                const updated: GeneratedRecipeForMeal[] = selectedMealTypes.map(mt => {
                    const existing = prev.find(p => p.mealType === mt);
                    return existing || { mealType: mt, recipes: [], isGenerating: false };
                });
                return updated;
            });

            // Set first meal as active tab if current tab not in selected
            if (!selectedMealTypes.includes(activeMealTab)) {
                setActiveMealTab(selectedMealTypes[0]);
            }
        }
    }, [selectedMealTypes, activeMealTab]);

    // Calculate manual budget distribution when meal types change
    useEffect(() => {
        if (selectedMealTypes.length > 0 && budgetStrategy === "manual") {
            setMealBudgets(prev => {
                const typesMatch = prev.length === selectedMealTypes.length &&
                    selectedMealTypes.every(mt => prev.some(p => p.mealType === mt));

                // Preserve existing allocations if structure matches
                if (typesMatch && prev.length > 0) {
                    return prev;
                }

                // Calculate default distribution
                const totalWeight = selectedMealTypes.reduce(
                    (sum, mt) => sum + DEFAULT_BUDGET_WEIGHTS[mt], 0
                );
                return selectedMealTypes.map(mealType => ({
                    mealType,
                    percentage: Math.round((DEFAULT_BUDGET_WEIGHTS[mealType] / totalWeight) * 100),
                    budget: Math.round((DEFAULT_BUDGET_WEIGHTS[mealType] / totalWeight) * totalBudget)
                }));
            });
        }
    }, [selectedMealTypes, totalBudget, budgetStrategy]);

    // ==================== HANDLERS ====================

    const handleManualBudgetChange = useCallback((mealType: MealType, value: string) => {
        const numValue = parseInt(value) || 0;
        setMealBudgets(prev => prev.map(mb =>
            mb.mealType === mealType ? { ...mb, budget: numValue } : mb
        ));
    }, []);

    const handleContinueToBudget = useCallback(() => {
        if (selectedMealTypes.length === 0) {
            toast.error("No meal types selected for this event");
            return;
        }
        setStep("budget");
    }, [selectedMealTypes]);

    // AI Budget Distribution using NEW API
    const handleAIDistributeBudget = useCallback(async () => {
        try {
            const result = await suggestBudgetMutation.mutateAsync({ eventId, mealTypes: selectedMealTypes });

            // Convert API response to our local state format
            const allocations: MealBudgetAllocation[] = result.allocations.map(a => ({
                mealType: a.mealType as MealType,
                percentage: a.percentage,
                budget: a.suggestedBudget,
                reasoning: a.reasoning
            }));

            setMealBudgets(allocations);

            // Show AI recommendations if any
            if (result.aiRecommendations && result.aiRecommendations.length > 0) {
                toast.success(
                    <div className="space-y-1">
                        <p className="font-semibold">Budget optimized by AI!</p>
                        <p className="text-xs text-gray-600">{result.aiRecommendations[0]}</p>
                    </div>
                );
            } else {
                toast.success("AI has optimized your budget distribution!");
            }
        } catch (error: any) {
            console.error("Budget suggestion error:", error);
            toast.error(error?.message || "Failed to get AI budget suggestion");

            // Fallback to local calculation
            fallbackBudgetDistribution();
        }
    }, [eventId, suggestBudgetMutation, selectedMealTypes, totalBudget, healthStats]);

    // Fallback budget distribution (local calculation)
    const fallbackBudgetDistribution = useCallback(() => {
        const healthComplexity = Object.keys(healthStats.dietaryRestrictions).length +
            Object.keys(healthStats.allergies).length;

        const adjustedWeights = selectedMealTypes.reduce((acc, mt) => {
            let weight = DEFAULT_BUDGET_WEIGHTS[mt];
            if (healthComplexity > 2) {
                weight *= 1.15; // Increase budget for health complexity
            }
            acc[mt] = weight;
            return acc;
        }, {} as Record<MealType, number>);

        const totalWeight = Object.values(adjustedWeights).reduce((sum, w) => sum + w, 0);
        const allocations = selectedMealTypes.map(mealType => ({
            mealType,
            percentage: Math.round((adjustedWeights[mealType] / totalWeight) * 100),
            budget: Math.round((adjustedWeights[mealType] / totalWeight) * totalBudget)
        }));

        setMealBudgets(allocations);
    }, [selectedMealTypes, totalBudget, healthStats]);

    const handleContinueToRecipes = useCallback(() => {
        setStep("recipes");
    }, []);

    // Generate Recipes using NEW Event Recipe API
    const handleGenerateRecipesForMeal = useCallback(async (
        mealType: MealType,
        customSearch?: string
    ) => {
        const mealBudget = mealBudgets.find(mb => mb.mealType === mealType)?.budget || 0;

        // Set generating state
        setMealRecipes(prev => prev.map(mr =>
            mr.mealType === mealType
                ? { ...mr, isGenerating: true, customSearch, error: undefined }
                : mr
        ));

        try {
            // Use the NEW Event Recipe Generation API
            const recipes = await generateEventRecipesMutation.mutateAsync({
                eventId,
                data: {
                    mealType,
                    recipeCount: 3,
                    budget: mealBudget,
                    preferredCuisines: (globalCuisine && globalCuisine !== "ALL")
                        ? [globalCuisine]
                        : undefined,
                    customSearch: customSearch?.trim() || undefined,
                    considerHealthProfiles: considerHealthProfile,
                    targetMemberIds: selectedHealthMembers.length > 0
                        ? selectedHealthMembers
                        : undefined
                }
            });

            // Transform response to our local format
            const transformedRecipes: GeneratedRecipe[] = recipes.map((r: any, idx: number) => ({
                id: r.id || `ai-event-${Date.now()}-${idx}`,
                name: r.name,
                description: r.description,
                cuisineType: r.cuisineType,
                mealType: r.mealType || mealType,
                servings: r.servings,
                imageUrl: r.imageUrl,
                cookingTime: r.totalTimeMinutes ? `${r.totalTimeMinutes} min` : undefined,
                totalTimeMinutes: r.totalTimeMinutes,
                prepTimeMinutes: r.prepTimeMinutes,
                cookTimeMinutes: r.cookTimeMinutes,
                difficultyLevel: r.difficultyLevel,
                estimatedCost: r.costAnalysis?.totalCost,
                costPerServing: r.costAnalysis?.costPerServing,
                price: r.costAnalysis?.totalCost
                    ? `₹${r.costAnalysis.totalCost}`
                    : undefined,
                ingredients: r.ingredients,
                instructions: r.instructions,
                nutrition: r.nutrition,
                nutritionalHighlights: r.nutritionalHighlights,
                healthScore: r.healthScore,
                healthConsiderations: r.healthConsiderations,
                cookingTips: r.cookingTips,
                eventRecommendations: r.eventRecommendations,
                isAIGenerated: true
            }));

            setMealRecipes(prev => prev.map(mr =>
                mr.mealType === mealType
                    ? { ...mr, recipes: transformedRecipes, isGenerating: false }
                    : mr
            ));

            toast.success(
                `Generated ${transformedRecipes.length} ${MEAL_TYPE_CONFIG[mealType].label} recipes!`
            );

        } catch (error: any) {
            console.error("Recipe generation error:", error);
            const errorMessage = error?.response?.data?.message ||
                error?.message ||
                "Failed to generate recipes. Please try again.";

            setMealRecipes(prev => prev.map(mr =>
                mr.mealType === mealType
                    ? { ...mr, isGenerating: false, error: errorMessage }
                    : mr
            ));

            toast.error(errorMessage);
        }
    }, [
        eventId,
        mealBudgets,
        globalCuisine,
        considerHealthProfile,
        selectedHealthMembers,
        generateEventRecipesMutation
    ]);

    const handleSelectRecipeForMeal = useCallback((mealType: MealType, recipeId: string) => {
        setMealRecipes(prev => prev.map(mr =>
            mr.mealType === mealType
                ? { ...mr, selectedRecipeId: mr.selectedRecipeId === recipeId ? undefined : recipeId }
                : mr
        ));
    }, []);

    const handleSaveAllRecipes = useCallback(async () => {
        const selectedRecipes = mealRecipes.filter(mr => mr.selectedRecipeId);

        if (selectedRecipes.length === 0) {
            toast.error("Please select at least one recipe");
            return;
        }

        setIsSavingAll(true);

        try {
            for (const mr of selectedRecipes) {
                const recipe = mr.recipes.find((r: any) => r.id === mr.selectedRecipeId);
                if (!recipe) continue;

                // Check if meal already exists for this type
                let mealId = (event as any)?.meals?.find(
                    (m: any) => m.mealType === mr.mealType
                )?.id;

                // Create meal if it doesn't exist
                if (!mealId) {
                    const newMeal = await addMeal({
                        eventId,
                        data: {
                            mealType: mr.mealType,
                            scheduledTime: MEAL_TYPE_CONFIG[mr.mealType].defaultTime,
                            notes: `AI-generated recipe from Event Recipe Wizard`
                        }
                    });
                    mealId = newMeal.id;
                }

                // Add recipe to meal
                await addRecipe({
                    eventId,
                    mealId,
                    data: {
                        recipeId: recipe.id,
                        servings: event?.totalServings || recipe.servings || 4,
                        notes: `AI Selected - Budget: ₹${mealBudgets.find(mb => mb.mealType === mr.mealType)?.budget || 0}`
                    }
                });
            }

            toast.success(`Successfully added ${selectedRecipes.length} recipes to event!`);

            // Refetch event data
            await refetchEvent();

            // Navigate back to event detail
            router.push(`/event-meal-plan/${eventId}`);

        } catch (error: any) {
            console.error("Save recipes error:", error);
            toast.error(error?.message || "Failed to save recipes. Please try again.");
        } finally {
            setIsSavingAll(false);
        }
    }, [mealRecipes, event, eventId, addMeal, addRecipe, mealBudgets, refetchEvent, router]);

    const getSelectedCount = useCallback(() => {
        return mealRecipes.filter(mr => mr.selectedRecipeId).length;
    }, [mealRecipes]);

    // ==================== RENDER ====================

    if (isEventLoading || isMembersLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    <p className="text-sm text-gray-500 font-medium">Loading event details...</p>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex h-screen flex-col items-center justify-center text-center p-4">
                <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Event not found</h2>
                <p className="text-gray-500 mb-4">The event you&apos;re looking for doesn&apos;t exist.</p>
                <Button onClick={() => router.push("/event-meal-plan")} variant="outline">
                    Back to Events
                </Button>
            </div>
        );
    }

    const steps = [
        { id: 'health', label: 'Health' },
        { id: 'budget', label: 'Budget' },
        { id: 'recipes', label: 'Recipes' }
    ] as const;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-white/90">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                                    Event Recipe Wizard
                                </h1>
                                <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                            </div>
                            <p className="text-xs text-gray-500 font-medium">
                                AI-powered meal planning for {event.name}
                            </p>
                        </div>
                    </div>

                    {/* Step Indicator */}
                    <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-full px-6 py-2 border border-gray-100">
                        {steps.map((s, index) => {
                            const isCurrent = step === s.id;
                            const isCompleted = steps.findIndex(st => st.id === step) > index;

                            return (
                                <React.Fragment key={s.id}>
                                    <StepIndicator
                                        step={index + 1}
                                        active={isCurrent}
                                        isCompleted={isCompleted}
                                        label={s.label}
                                    />
                                    {index < steps.length - 1 && (
                                        <div className={`w-8 h-0.5 ${isCompleted ? 'bg-green-400' : 'bg-gray-200'}`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* Mobile step indicator */}
                    <div className="sm:hidden flex items-center gap-1 text-sm">
                        <span className="font-bold text-indigo-600">
                            Step {steps.findIndex(s => s.id === step) + 1}
                        </span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-500">{steps.length}</span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AnimatePresence mode="wait">
                    {step === "health" && (
                        <HealthProfileSection
                            key="health"
                            healthStats={healthStats}
                            considerHealthProfile={considerHealthProfile}
                            setConsiderHealthProfile={setConsiderHealthProfile}
                            participants={participants}
                            selectedHealthMembers={selectedHealthMembers}
                            setSelectedHealthMembers={setSelectedHealthMembers}
                            onContinue={handleContinueToBudget}
                        />
                    )}

                    {step === "budget" && (
                        <BudgetDistributionSection
                            key="budget"
                            budgetStrategy={budgetStrategy}
                            setBudgetStrategy={setBudgetStrategy}
                            totalBudget={totalBudget}
                            setTotalBudget={setTotalBudget}
                            mealBudgets={mealBudgets}
                            handleManualBudgetChange={handleManualBudgetChange}
                            handleAIDistributeBudget={handleAIDistributeBudget}
                            isAIDistributing={suggestBudgetMutation.isPending}
                            onBack={() => setStep("health")}
                            onContinue={handleContinueToRecipes}
                        />
                    )}

                    {step === "recipes" && (
                        <RecipeSelectionSection
                            key="recipes"
                            globalCuisine={globalCuisine}
                            setGlobalCuisine={setGlobalCuisine}
                            selectedMealTypes={selectedMealTypes}
                            handleGenerateRecipesForMeal={handleGenerateRecipesForMeal}
                            activeMealTab={activeMealTab}
                            setActiveMealTab={setActiveMealTab}
                            mealRecipes={mealRecipes}
                            mealBudgets={mealBudgets}
                            handleSelectRecipeForMeal={handleSelectRecipeForMeal}
                            onBack={() => setStep("budget")}
                            handleSaveAllRecipes={handleSaveAllRecipes}
                            isSavingAll={isSavingAll}
                            getSelectedCount={getSelectedCount}
                        />
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Check, Calendar, ChevronRight, Sparkles, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

// Services & Redux
import { useEvent } from "@/services/event/event.query";
import { useMembers } from "@/services/member/member.query";
import { useAddMealToEvent, useAddRecipeToMeal, useSuggestBudget, useGenerateEventRecipes } from "@/services/event/event.mutation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store.redux";

// Types & Constants
import { MealType } from "@/services/event/event.types";
import { HealthStats, MealBudgetAllocation, GeneratedRecipeForMeal, MIN_BUDGET_PERCENTAGES } from "./_components/types";
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
    const [aiRecommendations, setAIRecommendations] = useState<string[]>([]);
    const [budgetValidationErrors, setBudgetValidationErrors] = useState<Partial<Record<MealType, string>>>({});

    // Queries
    const { data: event, isLoading: isEventLoading } = useEvent(eventId);
    const { activeAccountId } = useSelector((state: RootState) => state.account);
    const { data: membersData, isLoading: isMembersLoading } = useMembers(
        { accountId: activeAccountId || "", limit: 100 },
        { enabled: !!activeAccountId }
    );

    // Mutations
    // Mutations
    const generateEventRecipes = useGenerateEventRecipes();
    const { mutateAsync: addMeal } = useAddMealToEvent();
    const { mutateAsync: addRecipe } = useAddRecipeToMeal();
    const suggestBudgetMutation = useSuggestBudget();

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
        if (activeHealthParticipants.length === 0) return { dietaryRestrictions: {}, allergies: {}, healthConditions: {}, totalMembers: 0 };

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
            // First priority: Use selectedMealTypes from event creation
            if ((event as any)?.selectedMealTypes && Array.isArray((event as any).selectedMealTypes) && (event as any).selectedMealTypes.length > 0) {
                setSelectedMealTypes((event as any).selectedMealTypes as MealType[]);
            }
            // Fallback: Use existing meals if they exist
            else if ((event as any)?.meals && (event as any).meals.length > 0) {
                const existingMealTypes = (event as any).meals.map((m: any) => m.mealType as MealType);
                setSelectedMealTypes(existingMealTypes);
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
            }
        }
    }, [event]);

    // Calculate budget distribution when meal types or total budget changes
    useEffect(() => {
        if (selectedMealTypes.length > 0 && budgetStrategy === "manual") {
            const totalWeight = selectedMealTypes.reduce((sum, mt) => sum + DEFAULT_BUDGET_WEIGHTS[mt], 0);
            const allocations = selectedMealTypes.map(mealType => ({
                mealType,
                percentage: Math.round((DEFAULT_BUDGET_WEIGHTS[mealType] / totalWeight) * 100),
                budget: Math.round((DEFAULT_BUDGET_WEIGHTS[mealType] / totalWeight) * totalBudget)
            }));
            setMealBudgets(allocations);
        }
    }, [selectedMealTypes, totalBudget, budgetStrategy]);

    // Initialize meal recipes state with existing event data
    useEffect(() => {
        if (selectedMealTypes.length > 0) {
            setMealRecipes(prev => {
                const updated: GeneratedRecipeForMeal[] = selectedMealTypes.map(mt => {
                    const existing = prev.find(p => p.mealType === mt);
                    // If we have local state with recipes, preserve it (user might have generated something)
                    if (existing && existing.recipes.length > 0) return existing;

                    // Otherwise, try to populate from event data (Edit/Resume mode)
                    const eventMeal = (event as any)?.meals?.find((m: any) => m.mealType === mt);

                    if (eventMeal && eventMeal.recipes && eventMeal.recipes.length > 0) {
                        const existingRecipes = eventMeal.recipes.map((er: any) => {
                            const r = er.recipe || {};
                            return {
                                ...r,
                                id: r.id, // Ensure ID is top level
                                isAIGenerated: false,
                                isSaved: true,
                                cookingTime: r.cookTimeMinutes ? `${r.cookTimeMinutes} min` : (r.totalTimeMinutes ? `${r.totalTimeMinutes} min` : 'N/A'),
                                price: (er.estimatedCost && !isNaN(Number(er.estimatedCost))) ? `$${Number(er.estimatedCost).toFixed(2)}` : ((r.estimatedCostPerServing && !isNaN(Number(r.estimatedCostPerServing))) ? `$${Number(r.estimatedCostPerServing).toFixed(2)}` : 'N/A'),
                                calories: r.calories,
                                servings: er.servings
                            };
                        });
                        const selectedIds = existingRecipes.map((r: any) => r.id);

                        return {
                            mealType: mt,
                            recipes: existingRecipes,
                            selectedRecipeIds: selectedIds,
                            isGenerating: false,
                            customSearch: existing?.customSearch
                        };
                    }

                    // Fallback to existing state or empty
                    return existing || { mealType: mt, recipes: [], isGenerating: false };
                });
                return updated;
            });
            // Set first meal as active tab if not set
            if (!selectedMealTypes.includes(activeMealTab)) {
                setActiveMealTab(selectedMealTypes[0]);
            }
        }
    }, [selectedMealTypes, activeMealTab, event]);

    // Handler for manual budget amount change
    const handleManualBudgetChange = useCallback((mealType: MealType, value: string) => {
        const numValue = parseInt(value) || 0;
        setMealBudgets(prev => {
            const updated = prev.map(mb =>
                mb.mealType === mealType ? { ...mb, budget: numValue } : mb
            );
            // Recalculate percentages 
            const totalAllocated = updated.reduce((sum, mb) => sum + mb.budget, 0);
            return updated.map(mb => ({
                ...mb,
                percentage: totalAllocated > 0 ? Math.round((mb.budget / totalBudget) * 100) : 0
            }));
        });
    }, [totalBudget]);

    // Handler for manual percentage change with minimum validation
    const handleManualPercentageChange = useCallback((mealType: MealType, value: string) => {
        const numValue = parseInt(value) || 0;
        const minPercentage = MIN_BUDGET_PERCENTAGES[mealType];

        // Validate minimum percentage
        if (numValue < minPercentage) {
            setBudgetValidationErrors(prev => ({
                ...prev,
                [mealType]: `Minimum ${minPercentage}% required for ${MEAL_TYPE_CONFIG[mealType].label}`
            }));
        } else {
            setBudgetValidationErrors(prev => {
                const { [mealType]: removed, ...rest } = prev;
                return rest;
            });
        }

        setMealBudgets(prev => prev.map(mb =>
            mb.mealType === mealType
                ? {
                    ...mb,
                    percentage: numValue,
                    budget: Math.round((numValue / 100) * totalBudget),
                    minPercentage
                }
                : mb
        ));
    }, [totalBudget]);

    const handleContinueToBudget = () => {
        setStep("budget");
    };

    // AI Budget Distribution using actual API
    const handleAIDistributeBudget = useCallback(async () => {
        try {
            // Call the actual budget suggestion API
            const response = await suggestBudgetMutation.mutateAsync(eventId);

            // Transform API response to local state format
            const allocations: MealBudgetAllocation[] = response.allocations.map(a => ({
                mealType: a.mealType as MealType,
                percentage: a.percentage,
                budget: a.suggestedBudget,
                reasoning: a.reasoning,
                minPercentage: MIN_BUDGET_PERCENTAGES[a.mealType as MealType]
            }));

            setMealBudgets(allocations);
            setAIRecommendations(response.aiRecommendations || []);

            // Show success with AI recommendation if available
            if (response.aiRecommendations && response.aiRecommendations.length > 0) {
                toast.success(
                    <div className="space-y-1">
                        <p className="font-semibold">Budget optimized by AI!</p>
                        <p className="text-xs text-gray-600">{response.aiRecommendations[0]}</p>
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
    }, [eventId, suggestBudgetMutation]);

    // Fallback budget distribution (local calculation)
    const fallbackBudgetDistribution = useCallback(() => {
        const healthComplexity = Object.keys(healthStats.dietaryRestrictions).length +
            Object.keys(healthStats.allergies).length;

        const adjustedWeights = selectedMealTypes.reduce((acc, mt) => {
            let weight = DEFAULT_BUDGET_WEIGHTS[mt];
            if (healthComplexity > 2) {
                weight *= 1.15;
            }
            acc[mt] = weight;
            return acc;
        }, {} as Record<MealType, number>);

        const totalWeight = Object.values(adjustedWeights).reduce((sum, w) => sum + w, 0);
        const allocations = selectedMealTypes.map(mealType => ({
            mealType,
            percentage: Math.round((adjustedWeights[mealType] / totalWeight) * 100),
            budget: Math.round((adjustedWeights[mealType] / totalWeight) * totalBudget),
            minPercentage: MIN_BUDGET_PERCENTAGES[mealType]
        }));

        setMealBudgets(allocations);
        toast.info("Using local budget calculation as fallback");
    }, [selectedMealTypes, totalBudget, healthStats]);

    // Validate if continue is allowed (all percentages >= minimum)
    const canContinueToRecipes = useMemo(() => {
        if (budgetStrategy === "ai") return true;
        return Object.keys(budgetValidationErrors).length === 0 &&
            mealBudgets.every(mb => mb.percentage >= (MIN_BUDGET_PERCENTAGES[mb.mealType] || 0));
    }, [budgetStrategy, budgetValidationErrors, mealBudgets]);

    const handleContinueToRecipes = () => {
        if (!canContinueToRecipes) {
            toast.error("Please fix validation errors before continuing");
            return;
        }
        setStep("recipes");
    };

    const handleGenerateRecipesForMeal = async (mealType: MealType, customSearch?: string) => {
        const mealBudget = mealBudgets.find(mb => mb.mealType === mealType)?.budget || 0;

        setMealRecipes(prev => prev.map(mr =>
            mr.mealType === mealType
                ? { ...mr, isGenerating: true, customSearch }
                : mr
        ));

        try {
            const recipeData = await generateEventRecipes.mutateAsync({
                eventId,
                data: {
                    mealType,
                    recipeCount: 3,
                    budget: mealBudget > 0 ? mealBudget : undefined,
                    customSearch: customSearch?.trim(),
                    preferredCuisines: (globalCuisine && globalCuisine !== "ALL" && !customSearch) ? [globalCuisine] : undefined,
                    considerHealthProfiles: considerHealthProfile,
                    targetMemberIds: considerHealthProfile && activeHealthParticipants.length > 0 ? activeHealthParticipants.map((p: any) => p.id) : [],
                }
            });

            const newRecipes = (recipeData || []).map((r: any, idx: number) => ({
                ...r,
                id: r.id || `ai-${Date.now()}-${idx}`,
                isAIGenerated: true,
                cookingTime: r.cookingTime || (r.totalTimeMinutes ? `${r.totalTimeMinutes} min` : '30 min'),
                price: r.price || (r.costAnalysis?.costPerServing ? `$${r.costAnalysis.costPerServing.toFixed(2)}` : 'N/A'),
            }));

            setMealRecipes(prev => prev.map(mr => {
                if (mr.mealType !== mealType) return mr;

                // Merge: Keep currently selected recipes + add new ones (filtering duplicates)
                const currentSelectedIds = mr.selectedRecipeIds || [];
                const keptRecipes = mr.recipes.filter(r => currentSelectedIds.includes(r.id));
                const uniqueNewRecipes = newRecipes.filter((n: any) => !keptRecipes.some(k => k.id === n.id));

                return {
                    ...mr,
                    recipes: [...keptRecipes, ...uniqueNewRecipes],
                    isGenerating: false
                };
            }));

            toast.success(`Generated ${newRecipes.length} ${MEAL_TYPE_CONFIG[mealType].label} recipes!`);
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to generate recipes. Please try again.");
            setMealRecipes(prev => prev.map(mr =>
                mr.mealType === mealType
                    ? { ...mr, isGenerating: false }
                    : mr
            ));
        }
    };

    const handleSelectRecipeForMeal = (mealType: MealType, recipeId: string) => {
        setMealRecipes(prev => prev.map(mr => {
            if (mr.mealType !== mealType) return mr;

            const currentIds = mr.selectedRecipeIds || [];
            const isAlreadySelected = currentIds.includes(recipeId);

            return {
                ...mr,
                selectedRecipeIds: isAlreadySelected
                    ? currentIds.filter(id => id !== recipeId)  // Remove if already selected
                    : [...currentIds, recipeId]  // Add if not selected
            };
        }));
    };

    const handleSaveAllRecipes = async () => {
        // Gather all selected recipes across all meal types
        const mealsWithSelections = mealRecipes.filter(mr => mr.selectedRecipeIds && mr.selectedRecipeIds.length > 0);
        const totalSelectedCount = mealsWithSelections.reduce((sum, mr) => sum + (mr.selectedRecipeIds?.length || 0), 0);

        if (totalSelectedCount === 0) {
            toast.error("Please select at least one recipe");
            return;
        }

        setIsSavingAll(true);

        try {
            let savedCount = 0;

            for (const mr of mealsWithSelections) {
                // Get or create meal for this meal type
                let mealId = (event as any)?.meals?.find((m: any) => m.mealType === mr.mealType)?.id;

                if (!mealId) {
                    const newMeal = await addMeal({
                        eventId,
                        data: {
                            mealType: mr.mealType,
                            scheduledTime: MEAL_TYPE_CONFIG[mr.mealType].defaultTime,
                            notes: `Created via Recipe Wizard`
                        }
                    });
                    mealId = newMeal.id;
                }

                // Add all selected recipes for this meal type
                for (const recipeId of (mr.selectedRecipeIds || [])) {
                    const recipe = mr.recipes.find(r => r.id === recipeId);
                    if (!recipe) continue;

                    // Skip if already saved
                    if (recipe.isSaved) continue;

                    await addRecipe({
                        eventId,
                        mealId,
                        data: {
                            recipeId: recipe.id,
                            servings: event?.totalServings || 4,
                            notes: `AI Selected - Budget Optimized`
                        }
                    });
                    savedCount++;
                }
            }

            toast.success(`Successfully added ${savedCount} recipes to event!`);
            router.push(`/event-meal-plan/${eventId}`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save recipes. Please try again.");
        } finally {
            setIsSavingAll(false);
        }
    };

    const getSelectedCount = () => mealRecipes.reduce((sum, mr) => sum + (mr.selectedRecipeIds?.length || 0), 0);

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

    if (!event) return <div className="flex h-screen items-center justify-center text-gray-500">Event not found</div>;

    const steps = [
        { id: 'health', label: 'Health' },
        { id: 'budget', label: 'Budget' },
        { id: 'recipes', label: 'Recipes' }
    ] as const;


    console.log({
        budgetStrategy,
        mealBudgets
    })

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/80 via-gray-50 to-gray-50 font-sans pb-20">
            {/* Header Section */}
            <header className="pt-8 pb-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-8xl mx-auto">
                    {/* Top Navigation */}
                    <div className="flex items-center justify-between mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="bg-white/60 hover:bg-white text-gray-600 hover:text-gray-900 rounded-full px-4 h-10 backdrop-blur-sm border border-gray-200/50 shadow-sm transition-all hover:shadow text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Event
                        </Button>

                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-white/80 px-4 py-2 rounded-full backdrop-blur-sm border border-gray-200/50 shadow-sm">
                            <Calendar className="w-4 h-4 text-indigo-500" />
                            <span className="opacity-40">|</span>
                            {event.name}
                        </div>
                    </div>

                    {/* Title Area */}
                    <div className="text-center space-y-4 mb-12 relative">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
                            <Sparkles className="w-3 h-3" />
                            AI-Powered Planner
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                            Design Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Perfect Menu</span>
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Follow the steps below to create a tailored dining experience. Our AI will help you balance health needs, budget, and culinary preferences.
                        </p>
                    </div>

                    {/* Premium Stepper */}
                    <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-xl shadow-indigo-100/40 border border-white/20 p-6 md:p-8 mb-8 relative">
                        <div className="relative flex justify-between items-center">
                            {/* Connecting Line */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 rounded-full -z-10 transform -translate-y-1/2 overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
                                    initial={{ width: "0%" }}
                                    animate={{
                                        width: `${(steps.findIndex(s => s.id === step) / (steps.length - 1)) * 100}%`
                                    }}
                                />
                            </div>

                            {steps.map((s, index) => {
                                const isCurrent = step === s.id;
                                const isCompleted = steps.findIndex(st => st.id === step) > index;

                                return (
                                    <StepIndicator
                                        key={s.id}
                                        step={index + 1}
                                        active={isCurrent}
                                        isCompleted={isCompleted}
                                        label={s.label}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
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
                            handleManualPercentageChange={handleManualPercentageChange}
                            handleAIDistributeBudget={handleAIDistributeBudget}
                            isAIDistributing={suggestBudgetMutation.isPending}
                            validationErrors={budgetValidationErrors}
                            aiRecommendations={aiRecommendations}
                            onBack={() => setStep("health")}
                            onContinue={handleContinueToRecipes}
                            canContinue={canContinueToRecipes}
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

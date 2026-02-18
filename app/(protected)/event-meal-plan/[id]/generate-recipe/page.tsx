"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";

// Services & Redux
import { useEvent } from "@/services/event/event.query";
import { useMembers } from "@/services/member/member.query";
import {
    useAddMealToEvent,
    useAddRecipeToMeal,
    useSuggestBudget,
    useGenerateEventRecipes,
    useAddEventItem,
    useGetEventItems,
    useDeleteEventItem,
} from "@/services/event/event.mutation";
import { EventService } from "@/services/event/event.service";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store.redux";

// Types & Constants
import { MealType } from "@/services/event/event.types";
import { HealthStats, MealBudgetAllocation, GeneratedRecipeForMeal, MIN_BUDGET_PERCENTAGES, CategoryBudgetAllocation, BudgetCategory, MIN_CATEGORY_PERCENTAGES } from "./_components/types";
import { MEAL_TYPE_CONFIG, DEFAULT_BUDGET_WEIGHTS, BUDGET_CATEGORIES, DEFAULT_CATEGORY_WEIGHTS } from "./_components/constants";

// Components
import { StepIndicator } from "./_components/StepIndicator";
import { HealthProfileSection } from "./_components/HealthProfileSection";
import { BudgetDistributionSection } from "./_components/BudgetDistributionSection";
import { getUnsplashImage } from "@/app/actions/unsplash";

import { RecipeSelectionSection } from "./_components/RecipeSelectionSection";
import { ReviewMenuSection } from "./_components/ReviewMenuSection";

export default function EventRecipeSelectionPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    // States
    const [step, setStep] = useState<"health" | "budget" | "main-courses" | "extras" | "review">("health");
    const [budgetStrategy, setBudgetStrategy] = useState<"manual" | "ai">("manual");
    const [totalBudget, setTotalBudget] = useState<number>(100);
    // selectedMealTypes is now derived from event data
    const [mealBudgets, setMealBudgets] = useState<MealBudgetAllocation[]>([]);
    const [categoryBudgets, setCategoryBudgets] = useState<Record<MealType, CategoryBudgetAllocation[]>>({} as any);
    const [mealRecipes, setMealRecipes] = useState<GeneratedRecipeForMeal[]>([]);
    const [activeMealTab, setActiveMealTab] = useState<MealType>("dinner");
    const [globalCuisine, setGlobalCuisine] = useState<string>("");
    const [isSavingAll, setIsSavingAll] = useState(false);
    const [considerHealthProfile, setConsiderHealthProfile] = useState(true);
    const [selectedHealthMembers, setSelectedHealthMembers] = useState<string[]>([]);
    const [aiRecommendations, setAIRecommendations] = useState<string[]>([]);
    const [budgetValidationErrors, setBudgetValidationErrors] = useState<Partial<Record<MealType, string>>>({});
    const [categoryValidationErrors, setCategoryValidationErrors] = useState<Record<MealType, Partial<Record<BudgetCategory, string>>>>({} as any);
    const [isBudgetStale, setIsBudgetStale] = useState(false); // New State

    // Persistence Ref
    const isRestoring = useRef(false);

    // RESTORE STATE
    useEffect(() => {
        if (!eventId) return;

        const restoreState = async () => {
            try {
                // 1. Try fetching from Backend first
                const backendState = await EventService.getGenerationState(eventId);
                console.log({ backendState })

                let savedState = null;

                if (backendState && backendState.stateData) {
                    savedState = backendState.stateData;
                    console.log("Restored wizard state from Backend");
                } else {
                    // 2. Fallback to Local Storage
                    const localSaved = localStorage.getItem(`event-wizard-state-${eventId}`);
                    if (localSaved) {
                        savedState = JSON.parse(localSaved);
                        console.log("Restored wizard state from Local Storage");
                    }
                }

                if (savedState) {
                    isRestoring.current = true;

                    if (savedState.step) setStep(savedState.step);
                    if (savedState.budgetStrategy) setBudgetStrategy(savedState.budgetStrategy);
                    if (savedState.totalBudget) setTotalBudget(savedState.totalBudget);
                    if (savedState.mealBudgets && Array.isArray(savedState.mealBudgets)) setMealBudgets(savedState.mealBudgets);

                    // Migration Check: If categoryBudgets is an Array (old format), discard it. It must be an Object/Record.
                    if (savedState.categoryBudgets && !Array.isArray(savedState.categoryBudgets)) {
                        setCategoryBudgets(savedState.categoryBudgets);
                    }

                    if (savedState.mealRecipes) {
                        // Sanitize to ensure we never restore a "generating" state
                        setMealRecipes(savedState.mealRecipes.map((mr: any) => ({ ...mr, isGenerating: false })));
                    }
                    if (savedState.activeMealTab) setActiveMealTab(savedState.activeMealTab);
                    if (savedState.globalCuisine) setGlobalCuisine(savedState.globalCuisine);
                    if (savedState.considerHealthProfile !== undefined) setConsiderHealthProfile(savedState.considerHealthProfile);
                    if (savedState.selectedHealthMembers) setSelectedHealthMembers(savedState.selectedHealthMembers);

                    // Clear restoring flag after effects run
                    setTimeout(() => { isRestoring.current = false; }, 500);
                }
            } catch (e) {
                console.error("Failed to restore wizard state", e);
            }
        };

        restoreState();
    }, [eventId]);

    // SAVE STATE Helper
    const saveWizardState = async (stepOverride?: string, dataOverrides?: any) => {
        const stateToSave = {
            step: stepOverride || step,
            budgetStrategy,
            totalBudget,
            mealBudgets,
            categoryBudgets,
            // Sanitize recipes to never save "generating" state
            mealRecipes: mealRecipes.map(mr => ({ ...mr, isGenerating: false })),
            activeMealTab,
            globalCuisine,
            considerHealthProfile,
            selectedHealthMembers,
            ...dataOverrides
        };
        // Ensure allocations are saved if mealBudgets is updated
        if (!stateToSave.allocations && stateToSave.mealBudgets) {
            (stateToSave as any).allocations = stateToSave.mealBudgets.reduce((acc: any, mb: any) => {
                acc[mb.mealType] = mb.budget;
                return acc;
            }, {});
        }

        try {
            await EventService.saveGenerationState(eventId, stateToSave, stateToSave.step);
        } catch (error) {
            console.error("Failed to save state to backend", error);
        }
    };

    // Ref to always hold the latest saveWizardState (avoids stale closures in useEffect)
    const saveWizardStateRef = useRef(saveWizardState);
    saveWizardStateRef.current = saveWizardState;

    // AUTO-SAVE: Persist mealRecipes to backend whenever they change
    useEffect(() => {
        if (isRestoring.current || !eventId) return;
        // Debounce to avoid saving on every rapid interaction
        const timer = setTimeout(() => {
            saveWizardStateRef.current();
        }, 500);
        return () => clearTimeout(timer);
    }, [mealRecipes, eventId]);

    // Queries
    const { data: event, isLoading: isEventLoading } = useEvent(eventId);

    const { activeAccountId } = useSelector((state: RootState) => state.account);
    const { data: membersData, isLoading: isMembersLoading } = useMembers(
        { accountId: activeAccountId || "", limit: 100, includeHealthProfile: true },
        { enabled: !!activeAccountId }
    );

    // Mutations
    const generateEventRecipes = useGenerateEventRecipes();
    const { mutateAsync: addMeal } = useAddMealToEvent();
    const { mutateAsync: addRecipe } = useAddRecipeToMeal();
    const suggestBudgetMutation = useSuggestBudget();
    const { mutateAsync: addEventItem } = useAddEventItem();
    const { mutateAsync: deleteEventItem } = useDeleteEventItem();
    const { data: eventItems } = useGetEventItems(eventId);

    // Derived Data
    const participants = useMemo(() => {
        const allMembers = (membersData as any)?.data?.data || [];
        const participantIds = (event as any)?.participants?.map((p: any) => p.memberId) || [];

        if (participantIds.length > 0) {
            return allMembers.filter((m: any) => participantIds.includes(m.id));
        }
        return allMembers;
    }, [event, membersData]);

    const selectedMealTypes = useMemo<MealType[]>(() => {
        let types: MealType[] = [];
        if ((event as any)?.selectedMealTypes && Array.isArray((event as any).selectedMealTypes) && (event as any).selectedMealTypes.length > 0) {
            types = (event as any).selectedMealTypes as MealType[];
        }
        else if ((event as any)?.meals && (event as any).meals.length > 0) {
            const existingMealTypes = (event as any).meals.map((m: any) => m.mealType as MealType);
            types = Array.from(new Set(existingMealTypes));
        }
        return types.filter(t => ['breakfast', 'lunch', 'dinner'].includes(t.toLowerCase() as any));
    }, [event]);



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

    // Dynamic Steps Calculation
    const steps = useMemo(() => {
        const s = [
            { id: 'health', label: 'Health' },
            { id: 'budget', label: 'Budget' }
        ];

        const hasMainMeals = selectedMealTypes.some(mt => ['breakfast', 'lunch', 'dinner'].includes(mt));
        if (hasMainMeals) {
            s.push({ id: 'main-courses', label: 'Main Courses' });
        }

        const hasExtras = selectedMealTypes.some(mt => ['snacks', 'beverages', 'dessert'].includes(mt));
        if (hasExtras) {
            s.push({ id: 'extras', label: 'Snacks & Drinks' });
        }

        s.push({ id: 'review', label: 'Review Menu' });
        return s;
    }, [selectedMealTypes]);

    // Initialize meal types from event
    // Initialize total budget if set in event
    useEffect(() => {
        if (event && (event as any)?.budget) {
            const budgetData = (event as any).budget;
            const amount = typeof budgetData === 'object' && budgetData.totalBudget
                ? budgetData.totalBudget
                : budgetData;

            if (amount && !isNaN(parseFloat(amount))) {
                setTotalBudget(parseFloat(amount));
            }
        }
    }, [event]);

    // Initialize active meal tab
    useEffect(() => {
        if (selectedMealTypes.length > 0 && !selectedMealTypes.includes(activeMealTab)) {
            setActiveMealTab(selectedMealTypes[0]);
        }
    }, [selectedMealTypes, activeMealTab]);

    // Calculate budget distribution when meal types or total budget changes
    useEffect(() => {
        if (selectedMealTypes.length === 0) return;

        setMealBudgets(prev => {
            // Check if current state matches selected meal types structure
            const currentTypes = prev.map(mb => mb.mealType);
            const isStructureMatching = currentTypes.length === selectedMealTypes.length &&
                selectedMealTypes.every(mt => currentTypes.includes(mt));

            // If manual strategy, calculate default weighted distribution for MAIN MEALS ONLY
            if (budgetStrategy === "manual") {
                // If restoring from saved state, preserve the saved values instead of resetting
                if (isRestoring.current && isStructureMatching && prev.some(mb => mb.percentage > 0)) {
                    return prev.map(mb => ({
                        ...mb,
                        budget: Math.round((mb.percentage / 100) * totalBudget)
                    }));
                }

                const mainMeals = ["breakfast", "lunch", "dinner"];
                const targetMeals = selectedMealTypes.filter(mt => mainMeals.includes(mt.toLowerCase()));

                const totalWeight = targetMeals.reduce((sum, mt) => sum + DEFAULT_BUDGET_WEIGHTS[mt], 0);

                return selectedMealTypes.map(mealType => {
                    const isMainMeal = mainMeals.includes(mealType.toLowerCase());
                    if (!isMainMeal) {
                        return {
                            mealType,
                            percentage: 0,
                            budget: 0,
                            minPercentage: 0
                        };
                    }

                    return {
                        mealType,
                        percentage: Math.round((DEFAULT_BUDGET_WEIGHTS[mealType] / totalWeight) * 100),
                        budget: Math.round((DEFAULT_BUDGET_WEIGHTS[mealType] / totalWeight) * totalBudget),
                        minPercentage: MIN_BUDGET_PERCENTAGES[mealType]
                    };
                });
            }

            // AI STRATEGY
            // If structure matches and we have existing data (from AI run), preserve it but update budget amounts if totalBudget changed
            if (isStructureMatching && prev.some(mb => mb.percentage > 0)) {
                // Recalculate budget amounts based on percentages in case totalBudget changed
                return prev.map(mb => ({
                    ...mb,
                    budget: Math.round((mb.percentage / 100) * totalBudget)
                }));
            }

            // For AI initialization (or if structure didn't match), set empty structure to satisfy validation
            return selectedMealTypes.map(mealType => ({
                mealType,
                percentage: 0,
                budget: 0,
                minPercentage: MIN_BUDGET_PERCENTAGES[mealType]
            }));
        });
    }, [selectedMealTypes, totalBudget, budgetStrategy]);

    // Dynamic Image State for Event Items
    const [dynamicImages, setDynamicImages] = useState<Record<string, string>>({});
    const fetchedImagesRef = useRef<Set<string>>(new Set());

    // Fetch images for existing event items
    useEffect(() => {
        if (!eventItems) return;

        const fetchImages = async () => {
            const itemsToFetch = eventItems.filter((i: any) =>
                ['snacks', 'beverages', 'dessert'].includes(i.category) &&
                !fetchedImagesRef.current.has(i.name)
            );

            for (const i of itemsToFetch) {
                fetchedImagesRef.current.add(i.name);
                // Check if we already have it in state (optimization)
                if (dynamicImages[i.name]) continue;

                getUnsplashImage(i.name).then(url => {
                    if (url) {
                        setDynamicImages(prev => ({ ...prev, [i.name]: url }));
                    }
                });
            }
        };

        fetchImages();
    }, [eventItems]);

    // Initialize meal recipes state with existing event data and items
    useEffect(() => {
        if (selectedMealTypes.length > 0) {
            setMealRecipes(prev => {
                const updated: GeneratedRecipeForMeal[] = selectedMealTypes.map(mt => {
                    const existing = prev.find(p => p.mealType === mt);

                    // Handling for Add-ons (Snacks, Beverages, Dessert) using Event Items
                    if (['snacks', 'beverages', 'dessert'].includes(mt) && eventItems) {
                        const items = eventItems.filter((i: any) => i.category === mt);
                        const itemRecipes = items.map((i: any) => ({
                            id: i.id,
                            name: i.name,
                            description: i.notes || '',
                            imageUrl: dynamicImages[i.name] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80", // Dynamic or Generic food image
                            cookingTime: "Ready to serve",
                            price: i.estimatedCost ? `$${i.estimatedCost}` : "N/A",
                            servings: i.quantity,
                            isAIGenerated: false,
                            isSaved: true
                        }));

                        return {
                            mealType: mt,
                            recipes: itemRecipes,
                            selectedRecipeIds: itemRecipes.map(r => r.id),
                            isGenerating: existing?.isGenerating || false,
                            customSearch: existing?.customSearch
                        };
                    }

                    // Handling for Main Meals (Preserve local state if generating, otherwise sync with Event)
                    if (existing && existing.recipes.length > 0 && existing.recipes.some(r => !r.isSaved)) return existing;

                    const eventMeal = (event as any)?.meals?.find((m: any) => m.mealType === mt);

                    if (eventMeal && eventMeal.recipes && eventMeal.recipes.length > 0) {
                        const existingRecipes = eventMeal.recipes.map((er: any) => {
                            const r = er.recipe || {};
                            return {
                                ...r,
                                id: r.id,
                                isAIGenerated: false,
                                isSaved: true,
                                cookingTime: r.cookTimeMinutes ? `${r.cookTimeMinutes} min` : (r.totalTimeMinutes ? `${r.totalTimeMinutes} min` : 'N/A'),
                                price: (er.estimatedCost && !isNaN(Number(er.estimatedCost))) ? `$${Number(er.estimatedCost).toFixed(2)}` : ((r.estimatedCostPerServing && !isNaN(Number(r.estimatedCostPerServing))) ? `$${Number(r.estimatedCostPerServing).toFixed(2)}` : 'N/A'),
                                calories: r.calories,
                                servings: er.servings
                            };
                        });

                        return {
                            mealType: mt,
                            recipes: existingRecipes,
                            selectedRecipeIds: existingRecipes.map((r: any) => r.id),
                            isGenerating: false,
                            customSearch: existing?.customSearch
                        };
                    }

                    return existing || { mealType: mt, recipes: [], isGenerating: false };
                });
                return updated;
            });

            if (!selectedMealTypes.includes(activeMealTab)) {
                setActiveMealTab(selectedMealTypes[0]);
            }
        }
    }, [selectedMealTypes, activeMealTab, event, eventItems, dynamicImages]);

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

    // ---- Category Budget Handlers ----

    // Initialize category budgets from defaults per Meal Type
    useEffect(() => {
        if (selectedMealTypes.length === 0) return;

        setCategoryBudgets(prev => {
            const next = { ...prev };
            console.log({ next }, "next")
            const allCategories: BudgetCategory[] = ['starter', 'main_course', 'side_dish', 'snacks', 'desserts', 'beverages'];

            selectedMealTypes.forEach(mealType => {
                // Optimization: Only initialize if missing or structure invalid
                if (!next[mealType]) {
                    const mealBudget = mealBudgets.find(mb => mb.mealType === mealType)?.budget || 0;

                    next[mealType] = allCategories.map(cat => ({
                        category: cat,
                        percentage: DEFAULT_CATEGORY_WEIGHTS[cat],
                        budget: Math.round((DEFAULT_CATEGORY_WEIGHTS[cat] / 100) * mealBudget),
                        spent: 0,
                        minPercentage: MIN_CATEGORY_PERCENTAGES[cat],
                    }));
                }
            });
            return next;
        });
    }, [selectedMealTypes, mealBudgets]); // Re-run when meal budgets change to update amounts if needed? No, separate effect for amounts.

    // Recalculate category budget amounts when Meal Budgets change
    useEffect(() => {
        setCategoryBudgets(prev => {
            const next = { ...prev };
            let hasChanges = false;

            Object.keys(next).forEach((key) => {
                const mealType = key as MealType;
                const mealBudget = mealBudgets.find(mb => mb.mealType === mealType)?.budget || 0;

                // Safety Check: Ensure we are working with an array
                if (!Array.isArray(next[mealType])) return;

                const updatedCats = next[mealType].map(cb => {
                    const newBudget = Math.round((cb.percentage / 100) * mealBudget);
                    if (newBudget !== cb.budget) hasChanges = true;
                    return { ...cb, budget: newBudget };
                });

                if (hasChanges) next[mealType] = updatedCats;
            });

            return hasChanges ? next : prev;
        });
    }, [mealBudgets]);

    // Compute spent per category from selected recipes' prices
    useEffect(() => {
        const spentByMealAndCategory: Record<MealType, Record<BudgetCategory, number>> = {} as any;

        mealRecipes.forEach(mr => {
            const mealType = mr.mealType;
            if (!spentByMealAndCategory[mealType]) {
                spentByMealAndCategory[mealType] = { starter: 0, main_course: 0, side_dish: 0, snacks: 0, desserts: 0, beverages: 0 };
            }

            const selectedRecipes = mr.recipes.filter(r => mr.selectedRecipeIds?.includes(r.id));
            selectedRecipes.forEach(r => {
                const price = typeof r.price === 'string' ? parseFloat(r.price.replace(/[^0-9.]/g, '')) : (r.price || 0);
                if (isNaN(price)) return;

                if (mealType === 'snacks') {
                    spentByMealAndCategory[mealType].snacks += price;
                } else if (mealType === 'beverages') {
                    spentByMealAndCategory[mealType].beverages += price;
                } else if (mealType === 'dessert') {
                    spentByMealAndCategory[mealType].desserts += price;
                } else {
                    const courseType = r.courseType?.toLowerCase() || '';
                    if (courseType.includes('starter') || courseType.includes('appetizer')) {
                        spentByMealAndCategory[mealType].starter += price;
                    } else if (courseType.includes('side')) {
                        spentByMealAndCategory[mealType].side_dish += price;
                    } else {
                        spentByMealAndCategory[mealType].main_course += price;
                    }
                }
            });
        });

        setCategoryBudgets(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(key => {
                const mt = key as MealType;
                if (spentByMealAndCategory[mt]) {
                    next[mt] = next[mt].map(cb => ({
                        ...cb,
                        spent: spentByMealAndCategory[mt][cb.category] || 0
                    }));
                }
            });
            return next;
        });
    }, [mealRecipes]);

    // Handler for category budget change
    const handleCategoryBudgetChange = useCallback((mealType: MealType, category: BudgetCategory, value: string) => {
        const numValue = parseInt(value) || 0;
        setCategoryBudgets(prev => {
            const currentCats = prev[mealType] || [];
            const mealBudget = mealBudgets.find(mb => mb.mealType === mealType)?.budget || 0;

            const updated = currentCats.map(cb =>
                cb.category === category ? { ...cb, budget: numValue } : cb
            );

            // Recalculate percentage based on MEAL budget
            return {
                ...prev,
                [mealType]: updated.map(cb => ({
                    ...cb,
                    percentage: mealBudget > 0 ? Math.round((cb.budget / mealBudget) * 100) : 0
                }))
            };
        });
    }, [mealBudgets]);

    // Handler for category percentage change with minimum validation
    const handleCategoryPercentageChange = useCallback((mealType: MealType, category: BudgetCategory, value: string) => {

        console.log({
            mealType,
            category,
            value
        })
        const numValue = parseInt(value) || 0;
        const minPercentage = MIN_CATEGORY_PERCENTAGES[category];

        // Allow 0 explicitly (to represent "removed/disabled"), otherwise check minimum
        if (numValue > 0 && numValue < minPercentage) {
            setCategoryValidationErrors(prev => ({
                ...prev,
                [mealType]: {
                    ...(prev[mealType] || {}),
                    [category]: `Minimum ${minPercentage}% required for ${BUDGET_CATEGORIES.find(bc => bc.value === category)?.label || category}`
                }
            }));
        } else {
            // If checking/unchecking in AI mode, mark as STALE to force recalculation
            if (budgetStrategy === "ai") {
                setIsBudgetStale(true);
            }

            setCategoryValidationErrors(prev => {
                const currentMealErrors = { ...(prev[mealType] || {}) };
                delete currentMealErrors[category];
                return { ...prev, [mealType]: currentMealErrors };
            });
        }

        setCategoryBudgets(prev => {
            const currentCats = prev[mealType] || [];
            const mealBudget = mealBudgets.find(mb => mb.mealType === mealType)?.budget || 0;

            return {
                ...prev,
                [mealType]: currentCats.map(cb =>
                    cb.category === category
                        ? {
                            ...cb,
                            percentage: numValue,
                            budget: Math.round((numValue / 100) * mealBudget),
                            minPercentage
                        }
                        : cb
                )
            };
        });
    }, [mealBudgets]);

    // Category-level validation for continue button
    const canContinueCategoryBudget = useMemo(() => {
        if (budgetStrategy === "ai") return true;

        // Validation: For EVERY valid meal type, total percentage must be 100
        return selectedMealTypes.filter(mt => ['breakfast', 'lunch', 'dinner'].includes(mt)).every(mt => {
            const cats = categoryBudgets[mt] || [];
            if (cats.length === 0) return true; // Or false?
            const totalPct = cats.reduce((s, cb) => s + cb.percentage, 0);
            const hasErrors = Object.keys(categoryValidationErrors[mt] || {}).length > 0;
            return totalPct === 100 && !hasErrors;
        });
    }, [budgetStrategy, categoryValidationErrors, categoryBudgets, selectedMealTypes]);

    const handleContinueToBudget = () => {
        goToNextStep();
    };

    // AI Budget Distribution using actual API
    // AI Budget Distribution using actual API
    const handleAIDistributeBudget = useCallback(async () => {
        try {
            const toastId = toast.loading("AI is optimizing your budget...");

            // 1. Prepare Active Categories (send only what user hasn't actively removed/set to 0)
            // If checking "removed", we look for 0% percentage or 0 budget.
            // However, initially, we might want to send ALL categories if none are explicitly removed.
            // Let's assume if state exists, we respect it.
            // 1. Prepare Active Categories based on user's current setup
            // If user removed a category (0%), do not send it to AI.
            const activeCategories: Record<MealType, string[]> = {} as any;

            selectedMealTypes.forEach(mt => {
                const currentBudgets = categoryBudgets[mt];
                if (currentBudgets && currentBudgets.length > 0) {
                    const active = currentBudgets
                        .filter(cb => cb.percentage > 0 || cb.budget > 0)
                        .map(cb => cb.category);

                    // If user has some active categories, use them.
                    // If all are 0 (e.g. initialized but empty), default to ALL to let AI decide.
                    if (active.length > 0) {
                        activeCategories[mt] = active;
                    } else {
                        activeCategories[mt] = BUDGET_CATEGORIES.map(c => c.value);
                    }
                } else {
                    activeCategories[mt] = BUDGET_CATEGORIES.map(c => c.value);
                }
            });

            // Call the actual budget suggestion API
            const response = await suggestBudgetMutation.mutateAsync({
                eventId,
                mealTypes: selectedMealTypes,
                activeCategories
            } as any);

            // Transform API response to local state format
            const allocations: MealBudgetAllocation[] = response.allocations.map(a => ({
                mealType: a.mealType as MealType,
                percentage: a.percentage,
                budget: a.suggestedBudget,
                reasoning: a.reasoning,
                minPercentage: MIN_BUDGET_PERCENTAGES[a.mealType as MealType]
            }));

            setMealBudgets(allocations);

            // Apply Category Breakdowns from AI
            setCategoryBudgets(prev => {
                const next = { ...prev };

                response.allocations.forEach(alloc => {
                    const mt = alloc.mealType as MealType;
                    const breakdown = alloc.categoryBreakdown;
                    const mealBudget = alloc.suggestedBudget;

                    if (breakdown && Object.keys(breakdown).length > 0) {
                        // Map AI breakdown to our state
                        next[mt] = (categoryBudgets[mt] || BUDGET_CATEGORIES.map(c => ({
                            category: c.value,
                            percentage: 0,
                            budget: 0,
                            spent: 0,
                            minPercentage: MIN_CATEGORY_PERCENTAGES[c.value]
                        }))).map(cb => {
                            // AI returns percentage of MEAL budget (0-100)
                            const aiPct = breakdown[cb.category] || 0;
                            return {
                                ...cb,
                                percentage: aiPct,
                                budget: Math.round((aiPct / 100) * mealBudget),
                                spent: 0 // Reset spent to 0 for AI distribution
                            };
                        });
                    } else {
                        // Fallback implies AI didn't return breakdown (maybe old prompt), keep defaults logic?
                        // Or distribute evenly among active?
                        // For now we do nothing if no breakdown, just update total amounts based on new meal budget
                        // But we should update the budgets based on existing percentages and NEW meal budget
                        const currentCats = next[mt] || [];
                        next[mt] = currentCats.map(cb => ({
                            ...cb,
                            budget: Math.round((cb.percentage / 100) * mealBudget),
                            spent: 0 // Reset spent to 0 for AI distribution
                        }));
                    }
                });
                return next;
            });

            setAIRecommendations(response.aiRecommendations || []);

            toast.dismiss(toastId);

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

            setIsBudgetStale(false);
        } catch (error: any) {
            console.error("Budget suggestion error:", error);
            toast.error(error?.message || "Failed to get AI budget suggestion");

            // Fallback to local calculation
            fallbackBudgetDistribution();
        }
    }, [eventId, suggestBudgetMutation, selectedMealTypes, categoryBudgets]);

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
        const totalAllocated = mealBudgets.reduce((sum, mb) => sum + mb.budget, 0);
        // Must have some budget allocated to proceed
        if (totalAllocated <= 0) return false;

        if (budgetStrategy === "ai") {
            // For AI, we strictly require it to be up-to-date
            return !isBudgetStale;
        }

        // Manual mode validation
        return Object.keys(budgetValidationErrors).length === 0 &&
            mealBudgets.every(mb => mb.percentage >= (MIN_BUDGET_PERCENTAGES[mb.mealType] || 0));
    }, [budgetStrategy, budgetValidationErrors, mealBudgets, isBudgetStale]);

    const handleContinueToRecipes = () => {
        if (!canContinueToRecipes) {
            toast.error("Please fix validation errors before continuing");
            return;
        }
        goToNextStep();
    };

    // Existing recipes to avoid duplication
    const existingRecipes = useMemo(() => {
        if (!event || !event.meals) return {} as Record<MealType, { id: string, name: string, courseType?: string }[]>;
        const map: Record<MealType, { id: string, name: string, courseType?: string }[]> = {} as any;

        event.meals.forEach((meal: any) => {
            if (meal.recipes) {
                map[meal.mealType as MealType] = meal.recipes.map((r: any) => ({
                    id: r.id,
                    name: r.recipe?.name || "Unknown Recipe",
                    courseType: r.recipe?.courseType
                }));
            }
        });
        return map;
    }, [event]);

    const handleGenerateRecipesForMeal = async (mealType: MealType, customSearch?: string, count: number = 3, specificCuisine?: string, courseType?: string) => {
        // Handle Add-ons (Event Items) - Direct to DB
        if (['snacks', 'beverages', 'dessert'].includes(mealType)) {
            if (!customSearch) {
                toast.error("Please select items to add");
                return;
            }

            setMealRecipes(prev => prev.map(mr =>
                mr.mealType === mealType ? { ...mr, isGenerating: true } : mr
            ));

            try {
                const itemsToAdd = customSearch.split(", ");
                let addedCount = 0;

                for (const name of itemsToAdd) {
                    // Avoid duplicates locally if possible, but backend will handle ID creation
                    const exists = eventItems?.some((i: any) => i.name === name.trim() && i.category === mealType);
                    if (exists) continue;

                    await addEventItem({
                        eventId,
                        data: {
                            name: name.trim(),
                            category: mealType as any,
                            quantity: 1,
                            unit: 'serving',
                            estimatedCost: 0
                        }
                    });
                    addedCount++;
                }

                if (addedCount > 0) {
                    toast.success(`Added ${addedCount} item${addedCount !== 1 ? 's' : ''} to ${MEAL_TYPE_CONFIG[mealType].label}`);
                } else {
                    toast.info("Selected items already added");
                }

            } catch (error: any) {
                console.error(error);
                toast.error("Failed to add items");
            } finally {
                setMealRecipes(prev => prev.map(mr =>
                    mr.mealType === mealType ? { ...mr, isGenerating: false } : mr
                ));
            }
            return;
        }

        const mealBudget = mealBudgets.find(mb => mb.mealType === mealType)?.budget || 0;

        // Calculate excluded categories based on 0 budget
        const currentCategoryBudgets = categoryBudgets[mealType] || [];
        const excludedCategories = currentCategoryBudgets
            .filter(cb => cb.percentage === 0 || cb.budget === 0)
            .map(cb => cb.category);

        setMealRecipes(prev => prev.map(mr =>
            mr.mealType === mealType
                ? { ...mr, isGenerating: true, customSearch }
                : mr
        ));

        try {
            // Get existing names to avoid duplicates — ONLY for THIS event (not other events)
            // 1. DB-saved recipes for this event (all meal types, to avoid cross-meal duplicates)
            const savedNames = Object.values(existingRecipes)
                .flat()
                .map(r => r.name)
                .filter(Boolean);
            // 2. Locally generated (unsaved) recipes in this wizard session
            const localNames = mealRecipes
                .flatMap(mr => mr.recipes.map(r => r.name))
                .filter(Boolean);
            const existingNames = [...new Set([...savedNames, ...localNames])];

            const recipeData = await generateEventRecipes.mutateAsync({
                eventId,
                data: {
                    mealType,
                    courseType: courseType || undefined,
                    recipeCount: customSearch ? 1 : count,
                    budget: mealBudget > 0 ? mealBudget : undefined,
                    customSearch: customSearch?.trim(),
                    preferredCuisines: ((specificCuisine || globalCuisine) && (specificCuisine || globalCuisine) !== "ALL" && !customSearch) ? [specificCuisine || globalCuisine] : undefined,
                    considerHealthProfiles: considerHealthProfile,
                    targetMemberIds: considerHealthProfile && activeHealthParticipants.length > 0 ? activeHealthParticipants.map((p: any) => p.id) : [],
                    excludedCategories: excludedCategories.length > 0 ? excludedCategories : undefined,
                    existingRecipeNames: existingNames.length > 0 ? existingNames : undefined
                }
            });

            const newRecipes = (recipeData || []).map((r: any, idx: number) => ({
                ...r,
                id: r.id || `ai-${Date.now()}-${idx}`,
                isAIGenerated: true,
                isCustomSearch: !!customSearch,
                courseType: courseType || r.courseType || undefined, // Tag with the course type used for generation
                cookingTime: r.cookingTime || (r.totalTimeMinutes ? `${r.totalTimeMinutes} min` : '30 min'),
                price: r.price || (r.costAnalysis?.costPerServing ? `$${r.costAnalysis.costPerServing.toFixed(2)}` : 'N/A'),
            }));

            setMealRecipes(prev => prev.map(mr => {
                if (mr.mealType !== mealType) return mr;

                // Merge Logic:
                // 1. Custom Search: Append new recipe to EXISTING list (keep all previous recipes)
                // 2. Course Type Generation: Append to existing (keep all) — user can generate starter, then main course separately
                // 3. Full Generate (no courseType): Keep only SELECTED recipes + New ones (replace unselected)

                let keptRecipes = [];
                if (customSearch || courseType) {
                    // Keep ALL existing recipes — additive mode for custom search and course-type generation
                    keptRecipes = mr.recipes;
                } else {
                    // Keep only currently selected recipes (standard "Regenerate" behavior)
                    const currentSelectedIds = mr.selectedRecipeIds || [];
                    keptRecipes = mr.recipes.filter(r => currentSelectedIds.includes(r.id));
                }

                const uniqueNewRecipes = newRecipes.filter((n: any) => !keptRecipes.some(k => k.id === n.id));

                // Auto-select custom search results
                const newSelectedIds = customSearch
                    ? [...(mr.selectedRecipeIds || []), ...uniqueNewRecipes.map((r: any) => r.id)]
                    : (mr.selectedRecipeIds || []);

                return {
                    ...mr,
                    recipes: [...keptRecipes, ...uniqueNewRecipes],
                    selectedRecipeIds: newSelectedIds,
                    isGenerating: false
                };
            }));

            if (['snacks', 'beverages', 'dessert'].includes(mealType)) {
                toast.success(`Added ${newRecipes.length} item${newRecipes.length !== 1 ? 's' : ''} to ${MEAL_TYPE_CONFIG[mealType].label}`);
            } else if (customSearch) {
                if (newRecipes.length > 0) {
                    toast.success(`Added "${newRecipes[0].name}" to your list!`);
                } else {
                    toast.error(`No recipe found for "${customSearch}". Please check the name and try again.`);
                }
            } else {
                toast.success(`Generated ${newRecipes.length} ${MEAL_TYPE_CONFIG[mealType].label} recipes!`);
            }
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

    const handleDirectAddItem = async (item: { name: string, quantity: number, unit: string, category: string }) => {
        try {
            await addEventItem({
                eventId,
                data: {
                    name: item.name,
                    category: item.category as any, // category should match MealType mostly, or handled
                    quantity: item.quantity,
                    unit: item.unit,
                    estimatedCost: 0
                }
            });
            toast.success(`Added ${item.quantity} ${item.unit} of ${item.name}`);

            // Refresh logic if needed? 
            // The existing MealSection uses optimistic updates or query invalidation?
            // addEventItem mutation typically invalidates 'event-items'.
        } catch (error) {
            console.error(error);
            toast.error("Failed to add item");
        }
    };

    const handleRemoveRecipe = async (mealType: string, recipeId: string) => {
        // Handle Add-ons (Event Items) - Direct from DB
        if (['snacks', 'beverages', 'dessert'].includes(mealType)) {
            // Optimistic update for UI responsiveness
            setMealRecipes(prev => prev.map(mr => {
                if (mr.mealType !== mealType) return mr;
                const updatedRecipes = mr.recipes.filter(r => r.id !== recipeId);
                return {
                    ...mr,
                    recipes: updatedRecipes,
                    selectedRecipeIds: updatedRecipes.map(r => r.id)
                };
            }));

            try {
                await deleteEventItem({ eventId, itemId: recipeId });
                toast.success("Item removed");
            } catch (error) {
                console.error(error);
                toast.error("Failed to remove item");
                // Rollback if needed (simplest is to let react-query refetch fix it)
            }
            return;
        }


        setMealRecipes(prev => prev.map(mr => {
            if (mr.mealType !== mealType) return mr;
            return {
                ...mr,
                selectedRecipeIds: (mr.selectedRecipeIds || []).filter(id => id !== recipeId)
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
                // Skip Add-ons (Snacks, Bev, Dessert) as they are saved immediately to Event Items
                if (['snacks', 'beverages', 'dessert'].includes(mr.mealType)) continue;

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
                            notes: recipe.isCustomSearch ? `Custom Selection - ${recipe.name}` : `AI Selected - Budget Optimized`
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



    // Navigation Helpers
    const goToNextStep = () => {
        const currentIndex = steps.findIndex(s => s.id === step);
        if (currentIndex < steps.length - 1) {
            const nextStepId = steps[currentIndex + 1].id;

            // Set active tab logic based on target step
            if (nextStepId === 'main-courses') {
                const mainMeals = selectedMealTypes.filter(mt => ['breakfast', 'lunch', 'dinner'].includes(mt));
                if (mainMeals.length > 0) setActiveMealTab(mainMeals[0]);
            } else if (nextStepId === 'extras') {
                const extraMeals = selectedMealTypes.filter(mt => ['snacks', 'beverages', 'dessert'].includes(mt));
                if (extraMeals.length > 0) setActiveMealTab(extraMeals[0]);
            }

            setStep(nextStepId as any);

            // Save state on successful navigation
            saveWizardState(nextStepId);
        }
    };

    const goToPrevStep = () => {
        const currentIndex = steps.findIndex(s => s.id === step);
        if (currentIndex > 0) {
            setStep(steps[currentIndex - 1].id as any);
        }
    };




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
                            <Calendar className="w-4 h-4 text-[var(--primary)]" />
                            <span className="opacity-40">|</span>
                            {event.name}
                        </div>
                    </div>

                    {/* Title Area */}
                    <div className="text-center space-y-4 mb-5 relative">
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
                    <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-xl shadow-indigo-100/40 border border-white/20 p-6 md:p-8 mb-2 relative">
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
                            selectedMealTypes={selectedMealTypes}
                            setBudgetStrategy={setBudgetStrategy}
                            totalBudget={totalBudget}
                            setTotalBudget={setTotalBudget}
                            categoryBudgets={categoryBudgets}
                            handleCategoryBudgetChange={handleCategoryBudgetChange}
                            handleCategoryPercentageChange={handleCategoryPercentageChange}
                            handleAIDistributeBudget={handleAIDistributeBudget}
                            isAIDistributing={suggestBudgetMutation.isPending}
                            validationErrors={categoryValidationErrors}
                            aiRecommendations={aiRecommendations}
                            onBack={goToPrevStep}
                            onContinue={handleContinueToRecipes}
                            canContinue={canContinueCategoryBudget}
                            isBudgetStale={isBudgetStale}
                        />
                    )}

                    {step === "main-courses" && (
                        <RecipeSelectionSection
                            key="main-courses"
                            globalCuisine={globalCuisine}
                            setGlobalCuisine={setGlobalCuisine}
                            selectedMealTypes={selectedMealTypes.filter(mt => ['breakfast', 'lunch', 'dinner'].includes(mt))}
                            handleGenerateRecipesForMeal={handleGenerateRecipesForMeal}
                            activeMealTab={activeMealTab}
                            setActiveMealTab={setActiveMealTab}
                            mealRecipes={mealRecipes}
                            mealBudgets={mealBudgets}
                            handleSelectRecipeForMeal={handleSelectRecipeForMeal}
                            onBack={goToPrevStep}
                            handleSaveAllRecipes={goToNextStep} // Continue to next step
                            isSavingAll={false}
                            getSelectedCount={getSelectedCount}
                            actionLabel="Continue"
                            onAddEventItem={handleDirectAddItem}
                            onRemoveRecipe={handleRemoveRecipe}
                            onUpdateBudget={(mt, val) => handleManualBudgetChange(mt, val.toString())}
                            categoryBudgets={categoryBudgets}
                            existingRecipes={existingRecipes}
                        />
                    )}

                    {step === "extras" && (
                        <RecipeSelectionSection
                            key="extras"
                            existingRecipes={existingRecipes}
                            globalCuisine={globalCuisine}
                            setGlobalCuisine={setGlobalCuisine}
                            selectedMealTypes={selectedMealTypes.filter(mt => ['snacks', 'beverages', 'dessert'].includes(mt))}
                            handleGenerateRecipesForMeal={handleGenerateRecipesForMeal}
                            activeMealTab={activeMealTab}
                            setActiveMealTab={setActiveMealTab}
                            mealRecipes={mealRecipes}
                            mealBudgets={mealBudgets}
                            handleSelectRecipeForMeal={handleSelectRecipeForMeal}
                            onBack={goToPrevStep}
                            handleSaveAllRecipes={goToNextStep} // Continue to Review
                            isSavingAll={false}
                            getSelectedCount={getSelectedCount}
                            actionLabel="Review Final Menu"
                            onRemoveRecipe={handleRemoveRecipe}
                            onUpdateBudget={(mt, val) => handleManualBudgetChange(mt, val.toString())}
                            categoryBudgets={categoryBudgets}
                        />
                    )}

                    {step === "review" && (
                        <ReviewMenuSection
                            mealRecipes={mealRecipes}
                            onBack={goToPrevStep}
                            onSave={handleSaveAllRecipes}
                            isSaving={isSavingAll}
                            onRemoveRecipe={handleRemoveRecipe}
                            totalBudget={totalBudget}
                        />
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

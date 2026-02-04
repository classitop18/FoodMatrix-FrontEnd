"use client";

import { useCallback, useMemo } from "react";
import {
    EventFormData,
    Member,
    MealType,
    UseEventFormValidationReturn,
    UseEventFormActionsReturn,
} from "../types/event.types";
import { SERVING_MULTIPLIERS } from "../constants/event.constants";

// ========== Validation Hook ==========

interface UseEventFormValidationProps {
    formData: EventFormData;
    currentStep: number;
}

export const useEventFormValidation = ({
    formData,
    currentStep,
}: UseEventFormValidationProps): UseEventFormValidationReturn => {

    // Step 1: Event Details Validation
    const isStep1Valid = useMemo(() => {
        return (
            formData.name.trim().length >= 2 &&
            formData.occasionType !== "" &&
            formData.eventDate !== undefined
        );
    }, [formData.name, formData.occasionType, formData.eventDate]);

    // Step 2: Budget Validation
    const isStep2Valid = useMemo(() => {
        if (formData.budgetType === "weekly") {
            return true;
        }
        // For separate budget, amount must be a positive number
        const amount = parseFloat(formData.budgetAmount);
        return !isNaN(amount) && amount > 0;
    }, [formData.budgetType, formData.budgetAmount]);

    // Step 3: Guests Validation
    const isStep3Valid = useMemo(() => {
        const totalGuests =
            formData.selectedMemberIds.length +
            formData.adultGuests +
            formData.kidGuests;
        return totalGuests > 0;
    }, [formData.selectedMemberIds.length, formData.adultGuests, formData.kidGuests]);

    // Step 4: Menu Planning Validation
    const isStep4Valid = useMemo(() => {
        return formData.selectedMealTypes.length > 0;
    }, [formData.selectedMealTypes.length]);

    // Step 5: Summary - always valid if previous steps are valid
    const isStep5Valid = useMemo(() => {
        return isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid;
    }, [isStep1Valid, isStep2Valid, isStep3Valid, isStep4Valid]);

    // Can proceed to next step
    const canProceed = useMemo(() => {
        switch (currentStep) {
            case 1:
                return isStep1Valid;
            case 2:
                return isStep2Valid;
            case 3:
                return isStep3Valid;
            case 4:
                return isStep4Valid;
            case 5:
                return isStep5Valid;
            default:
                return false;
        }
    }, [currentStep, isStep1Valid, isStep2Valid, isStep3Valid, isStep4Valid, isStep5Valid]);

    // Get validation errors for a specific step
    const getStepErrors = useCallback((step: number): string[] => {
        const errors: string[] = [];

        switch (step) {
            case 1:
                if (formData.name.trim().length < 2) {
                    errors.push("Event name must be at least 2 characters");
                }
                if (!formData.occasionType) {
                    errors.push("Please select an occasion type");
                }
                if (!formData.eventDate) {
                    errors.push("Please select an event date");
                }
                break;
            case 2:
                if (formData.budgetType === "separate" && !parseFloat(formData.budgetAmount)) {
                    errors.push("Please enter a valid budget amount");
                }
                break;
            case 3:
                const totalGuests = formData.selectedMemberIds.length + formData.adultGuests + formData.kidGuests;
                if (totalGuests === 0) {
                    errors.push("Please add at least one guest");
                }
                break;
            case 4:
                if (formData.selectedMealTypes.length === 0) {
                    errors.push("Please select at least one meal type");
                }
                break;
        }

        return errors;
    }, [formData]);

    return { isStep1Valid, isStep2Valid, isStep3Valid, isStep4Valid, isStep5Valid, canProceed, getStepErrors };
};

// ========== Actions Hook ==========

interface UseEventFormActionsProps {
    formData: EventFormData;
    setFormData: React.Dispatch<React.SetStateAction<EventFormData>>;
    members: Member[];
}

export const useEventFormActions = ({
    formData,
    setFormData,
    members,
}: UseEventFormActionsProps): UseEventFormActionsReturn => {

    // Update a single form field
    const updateFormData = useCallback(
        <K extends keyof EventFormData>(key: K, value: EventFormData[K]) => {
            setFormData((prev) => ({ ...prev, [key]: value }));
        },
        [setFormData]
    );

    // Toggle a member's selection
    const toggleMember = useCallback(
        (memberId: string) => {
            setFormData((prev) => {
                const isSelected = prev.selectedMemberIds.includes(memberId);
                return {
                    ...prev,
                    selectedMemberIds: isSelected
                        ? prev.selectedMemberIds.filter((id) => id !== memberId)
                        : [...prev.selectedMemberIds, memberId],
                };
            });
        },
        [setFormData]
    );

    // Select or deselect all members
    const selectAllMembers = useCallback(() => {
        setFormData((prev) => {
            const allSelected = prev.selectedMemberIds.length === members.length;
            return {
                ...prev,
                selectedMemberIds: allSelected ? [] : members.map((m) => m.id),
            };
        });
    }, [members, setFormData]);

    // Toggle a meal type
    const toggleMealType = useCallback(
        (mealType: MealType) => {
            setFormData((prev) => {
                const isSelected = prev.selectedMealTypes.includes(mealType);
                return {
                    ...prev,
                    selectedMealTypes: isSelected
                        ? prev.selectedMealTypes.filter((type) => type !== mealType)
                        : [...prev.selectedMealTypes, mealType],
                };
            });
        },
        [setFormData]
    );

    // Toggle a recipe for an event
    const toggleRecipe = useCallback(
        (recipeId: string, mealType: MealType) => {
            setFormData((prev) => {
                const existing = prev.selectedRecipes.find(r => r.recipeId === recipeId);
                if (existing) {
                    return {
                        ...prev,
                        selectedRecipes: prev.selectedRecipes.filter(r => r.recipeId !== recipeId),
                    };
                }
                return {
                    ...prev,
                    selectedRecipes: [...prev.selectedRecipes, { recipeId, mealType, servings: 4 }],
                };
            });
        },
        [setFormData]
    );

    // Calculate total servings based on selections
    const calculateTotalServings = useCallback(() => {
        const memberCount = formData.selectedMemberIds.length * SERVING_MULTIPLIERS.member;
        const adultServings = formData.adultGuests * SERVING_MULTIPLIERS.adult;
        const kidServings = formData.kidGuests * SERVING_MULTIPLIERS.kid;
        return memberCount + adultServings + kidServings;
    }, [formData.selectedMemberIds.length, formData.adultGuests, formData.kidGuests]);

    // Calculate total estimated cost
    const calculateTotalEstimatedCost = useCallback(() => {
        // Placeholder - would calculate based on selected recipes
        return formData.selectedRecipes.reduce((total, recipe) => {
            const costPerServing = recipe.recipe?.estimatedCostPerServing || 0;
            return total + (costPerServing * recipe.servings);
        }, 0);
    }, [formData.selectedRecipes]);

    return {
        updateFormData,
        toggleMember,
        selectAllMembers,
        toggleMealType,
        toggleRecipe,
        calculateTotalServings,
        calculateTotalEstimatedCost,
    };
};

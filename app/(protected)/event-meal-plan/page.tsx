"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Redux
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store.redux";

// Components
import {
    StepIndicator,
    EventDetailsStep,
    BudgetStep,
    GuestStep,
    MenuPlanningStep,
    EventSummary,
} from "./components";

// Hooks
import { useEventFormValidation, useEventFormActions } from "./hooks/use-event-form";
import { useMembers } from "@/services/member/member.query";
import { useCreateEvent } from "@/services/event/event.mutation";

// Constants & Types
import { FORM_STEPS, INITIAL_FORM_DATA, calculateTotalServings } from "./constants/event.constants";
import { EventFormData } from "./types/event.types";
import { CreateEventDto } from "@/services/event/event.types";
import { cn } from "@/lib/utils";

export default function EventMealPlan() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [formData, setFormData] = useState<EventFormData>(INITIAL_FORM_DATA);

    // Redux state
    const { activeAccountId } = useSelector((state: RootState) => state.account);

    // Fetch members
    const { data: membersData, isLoading: membersLoading } = useMembers({
        accountId: activeAccountId || "",
    });
    const members = (membersData as any)?.data?.data || [];

    // Mutations
    const createEventMutation = useCreateEvent();

    // Form hooks
    const { canProceed, getStepErrors } = useEventFormValidation({ formData, currentStep });
    const {
        updateFormData,
        toggleMember,
        selectAllMembers,
        calculateTotalServings: calcServings,
        calculateTotalEstimatedCost,
    } = useEventFormActions({
        formData,
        setFormData,
        members,
    });

    // Calculate total servings
    const totalServings = calculateTotalServings(
        formData.selectedMemberIds.length,
        formData.adultGuests,
        formData.kidGuests
    );

    // Navigation handlers
    const handleNext = useCallback(() => {
        if (currentStep < FORM_STEPS.length) {
            setCurrentStep((prev) => prev + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [currentStep]);

    const handleBack = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [currentStep]);

    const handleStepClick = useCallback((stepId: number) => {
        // Only allow going back to previous steps
        if (stepId < currentStep) {
            setCurrentStep(stepId);
        }
    }, [currentStep]);

    // Submit handler
    const handleSubmit = useCallback(async () => {
        if (!activeAccountId) {
            toast.error("Account not found");
            return;
        }

        // Prepare the data
        const eventData: CreateEventDto = {
            ...formData,
            name: formData.name,
            occasionType: formData.occasionType as any,
            eventDate: formData.eventDate!.toISOString(),
            eventTime: formData.eventTime || undefined,
            description: formData.description || undefined,
            budgetType: formData.budgetType,
            budgetAmount: formData.budgetType === "separate"
                ? parseFloat(formData.budgetAmount)
                : undefined,
            currency: "USD",
            adultGuests: formData.adultGuests,
            kidGuests: formData.kidGuests,
            selectedMemberIds: formData.selectedMemberIds,
            guestNotes: formData.guestNotes || undefined,
            selectedMealTypes: formData.selectedMealTypes,
        };

        try {
            const createdEvent = await createEventMutation.mutateAsync(eventData);
            toast.success("Event created successfully!");

            // Navigate to event detail page
            router.push(`/event-meal-plan/${createdEvent.id}`);
        } catch (error: any) {
            console.error("Failed to create event:", error);
            toast.error(error?.message || "Failed to create event. Please try again.");
        }
    }, [activeAccountId, formData, createEventMutation, router]);

    // Render current step content
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <EventDetailsStep
                        formData={formData}
                        onUpdate={updateFormData}
                    />
                );
            case 2:
                return (
                    <BudgetStep
                        formData={formData}
                        onUpdate={updateFormData}
                    />
                );
            case 3:
                return (
                    <GuestStep
                        formData={formData}
                        onUpdate={updateFormData}
                        members={members}
                        onToggleMember={toggleMember}
                        onSelectAllMembers={selectAllMembers}
                    />
                );
            case 4:
                return (
                    <MenuPlanningStep
                        formData={formData}
                        onUpdate={updateFormData}
                        totalServings={totalServings}
                    />
                );
            case 5:
                return (
                    <EventSummary
                        formData={formData}
                        members={members}
                        totalServings={totalServings}
                        totalEstimatedCost={calculateTotalEstimatedCost()}
                        isSubmitting={createEventMutation.isPending}
                        onSubmit={handleSubmit}
                    />
                );
            default:
                return null;
        }
    };

    const isLastStep = currentStep === FORM_STEPS.length;
    const isFirstStep = currentStep === 1;

    return (
        <div className="min-h-[calc(100vh-57px)] bg-gray-50/50 flex flex-col">
            {/* Top Navigation Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 md:px-8 h-16 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/event-meal-plan/list")}
                        className="text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 leading-tight">Create Event</h1>
                        <p className="text-xs text-gray-500 font-medium hidden sm:block">Step {currentStep} of {FORM_STEPS.length}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Sidebar Steps */}
                    <div className="hidden lg:block lg:col-span-3 sticky top-24">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <StepIndicator
                                currentStep={currentStep}
                                steps={FORM_STEPS}
                            />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-9 w-full mx-auto lg:mx-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[600px]">
                            {/* Content */}
                            <div className="p-6 md:p-10 flex-1">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentStep}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {membersLoading ? (
                                            <div className="flex items-center justify-center py-32">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                                                    <p className="text-gray-500 font-medium animate-pulse">Loading resources...</p>
                                                </div>
                                            </div>
                                        ) : (
                                            renderStep()
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Validation Errors Overlay */}
                            {!canProceed && getStepErrors(currentStep).length > 0 && (
                                <div className="bg-red-50 border-t border-red-100 p-4 animate-in slide-in-from-bottom-2 mx-6 mb-6 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2 text-red-700 font-bold text-sm uppercase tracking-wider">
                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                        Please fix the following issues:
                                    </div>
                                    <ul className="space-y-1">
                                        {getStepErrors(currentStep).map((error, idx) => (
                                            <li key={idx} className="text-sm text-red-600 font-medium flex items-start gap-2">
                                                <span className="mt-1.5 w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                                                {error}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Bottom Navigation Footer */}
                            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                <Button
                                    variant="ghost"
                                    onClick={handleBack}
                                    disabled={isFirstStep}
                                    className={cn(
                                        "text-gray-600 font-bold hover:bg-white hover:shadow-sm px-6 h-12 rounded-xl transition-all",
                                        isFirstStep && "opacity-0 pointer-events-none"
                                    )}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>

                                {!isLastStep && (
                                    <Button
                                        onClick={handleNext}
                                        disabled={!canProceed}
                                        className={cn(
                                            "bg-[#1a1a1a] hover:bg-black text-white px-8 h-12 rounded-xl font-bold shadow-lg shadow-black/5 transition-all text-base flex items-center",
                                            !canProceed && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        Next Step
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <p className="text-center text-gray-400 text-sm font-medium mt-6">
                            FoodMatrix Event Planner &copy; {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

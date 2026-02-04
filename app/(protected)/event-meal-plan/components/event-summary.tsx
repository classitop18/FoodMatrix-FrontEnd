"use client";

import { motion } from "framer-motion";
import {
    PartyPopper,
    Calendar,
    Clock,
    Wallet,
    Users,
    ChefHat,
    Check,
    Sparkles,
    Info,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventSummaryProps, MealType } from "../types/event.types";
import {
    getOccasionOption,
    getMealTypeOption,
    formatEventDate,
    formatEventTime,
    formatCurrency,
} from "../constants/event.constants";
import { cn } from "@/lib/utils";

export function EventSummary({
    formData,
    members,
    totalServings,
    totalEstimatedCost,
    isSubmitting,
    onSubmit,
}: EventSummaryProps) {
    const occasionOption = getOccasionOption(formData.occasionType);
    const OccasionIcon = occasionOption?.icon || PartyPopper;

    const selectedMembers = members.filter((m) =>
        formData.selectedMemberIds.includes(m.id)
    );

    const budgetAmount = formData.budgetType === "weekly"
        ? "Using Weekly Budget"
        : formatCurrency(parseFloat(formData.budgetAmount) || 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="flex items-center gap-4 space-y-2">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-xl shadow-indigo-200"
                >
                    <Sparkles className="w-10 h-10 text-white" />
                </motion.div>
                <div className="flex-1">
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Review & Confirm</h2>
                <p className="text-gray-500 font-medium mx-auto">
                    Take a moment to review the event details before finalizing your plan.
                </p>
                </div>
            </div>

            {/* Event Summary Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-indigo-100/50"
            >
                {/* Event Header */}
                <div className="relative overflow-hidden bg-gray-900 p-4 text-white">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-20 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-20 pointer-events-none" />

                    <div className="relative z-10 flex items-start justify-between gap-4">
                        <div className="flex items-center gap-5">
                            <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner">
                                <OccasionIcon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500 text-white">Event</span>
                                </div>
                                <h3 className="text-xl font-bold text-white tracking-tight">{formData.name || "Unnamed Event"}</h3>
                                <p className="text-white/70 font-medium text-sm capitalize flex items-center gap-2">
                                    {occasionOption?.label || "Special Occasion"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="divide-y divide-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Event Date */}
                        <div className="p-6 flex items-start gap-4 hover:bg-gray-50/50 transition-colors">
                            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date & Time</p>
                                <p className="font-bold text-gray-900 text-lg">
                                    {formatEventDate(formData.eventDate)}
                                </p>
                                {formData.eventTime && (
                                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1 mt-0.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        {formatEventTime(formData.eventTime)}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Budget */}
                        <div className="p-6 flex items-start gap-4 hover:bg-gray-50/50 transition-colors border-t md:border-t-0 md:border-l border-gray-100">
                            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-600">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Budget Allocation</p>
                                <p className="font-bold text-gray-900 text-lg">
                                    {budgetAmount}
                                </p>
                                <p className="text-sm font-medium text-gray-500 mt-0.5">
                                    {formData.budgetType === "separate" ? "Separate allocation" : "Integrated with weekly"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Guest Count */}
                        <div className="p-6 flex items-start gap-4 hover:bg-gray-50/50 transition-colors">
                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Guests</p>
                                <p className="font-bold text-gray-900 text-lg">
                                    {totalServings} <span className="text-sm font-medium text-gray-500">People</span>
                                </p>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs font-medium text-gray-500">
                                    <span>{selectedMembers.length} Family</span>
                                    <span>•</span>
                                    <span>{formData.adultGuests} Adults</span>
                                    <span>•</span>
                                    <span>{formData.kidGuests} Kids</span>
                                </div>
                            </div>
                        </div>

                        {/* Menu Plan */}
                        <div className="p-6 flex items-start gap-4 hover:bg-gray-50/50 transition-colors border-t md:border-t-0 md:border-l border-gray-100">
                            <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 text-orange-600">
                                <ChefHat className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Menu Structure</p>
                                <p className="font-bold text-gray-900 text-lg">
                                    {formData.selectedMealTypes.length} <span className="text-sm font-medium text-gray-500">Courses</span>
                                </p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {formData.selectedMealTypes.slice(0, 3).map((mealType: MealType) => (
                                        <span key={mealType} className="text-[10px] px-2 py-1 bg-gray-100 rounded-md text-gray-600 font-bold uppercase tracking-wider">
                                            {mealType}
                                        </span>
                                    ))}
                                    {formData.selectedMealTypes.length > 3 && (
                                        <span className="text-[10px] px-2 py-1 bg-gray-100 rounded-md text-gray-600 font-bold uppercase tracking-wider">
                                            +{formData.selectedMealTypes.length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Notes Section */}
                {(formData.guestNotes || formData.description) && (
                    <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Notes & Details</p>
                        <div className="space-y-3">
                            {formData.description && (
                                <p className="text-sm text-gray-600 italic">
                                    "{formData.description}"
                                </p>
                            )}
                            {formData.guestNotes && (
                                <div className="flex gap-2 text-sm text-gray-600 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                    <Info className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                                    <p>{formData.guestNotes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Action Buttons */}
            <div className="space-y-4 text-center">
                <Button
                    size="lg"
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className={cn(
                        "w-auto h-12 text-base font-bold rounded-lg",
                        "bg-[#1a1a1a] hover:bg-black",
                        "text-white shadow-lg shadow-black/10",
                        "transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]",
                        "disabled:opacity-70 disabled:cursor-not-allowed"
                    )}
                >
                    {isSubmitting ? (
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Creating Event...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span>Confirm & Create Event</span>
                            <ArrowRight className="w-5 h-5" />
                        </div>
                    )}
                </Button>

                <p className="text-center text-xs text-gray-400 font-medium">
                    By creating this event, you can start adding recipes and generating shopping lists.
                </p>
            </div>
        </div>
    );
}

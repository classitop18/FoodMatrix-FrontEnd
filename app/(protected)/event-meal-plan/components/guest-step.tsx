"use client";

import React, { memo, useCallback, useMemo } from "react";
import { Users, User, Baby, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { GuestCounter } from "./guest-counter";
import { GuestSummary } from "./guest-summary";
import { SERVING_MULTIPLIERS } from "../constants/event.constants";
import type { GuestStepProps } from "../types/event.types";

const GuestStepComponent: React.FC<GuestStepProps> = ({
    formData,
    members,
    onUpdate,
    onToggleMember,
    onSelectAllMembers,
}) => {
    // Calculate total servings
    const totalServings = useMemo(() => {
        const memberServings = formData.selectedMemberIds.length * SERVING_MULTIPLIERS.member;
        const adultServings = formData.adultGuests * SERVING_MULTIPLIERS.adult;
        const kidServings = formData.kidGuests * SERVING_MULTIPLIERS.kid;
        return memberServings + adultServings + kidServings;
    }, [formData.selectedMemberIds.length, formData.adultGuests, formData.kidGuests]);

    // Guest count handlers
    const handleIncrementAdults = useCallback(() => {
        onUpdate("adultGuests", formData.adultGuests + 1);
    }, [formData.adultGuests, onUpdate]);

    const handleDecrementAdults = useCallback(() => {
        onUpdate("adultGuests", Math.max(0, formData.adultGuests - 1));
    }, [formData.adultGuests, onUpdate]);

    const handleIncrementKids = useCallback(() => {
        onUpdate("kidGuests", formData.kidGuests + 1);
    }, [formData.kidGuests, onUpdate]);

    const handleDecrementKids = useCallback(() => {
        onUpdate("kidGuests", Math.max(0, formData.kidGuests - 1));
    }, [formData.kidGuests, onUpdate]);

    // Calculate selection progress
    const selectionPercentage = Math.round((formData.selectedMemberIds.length / (members.length || 1)) * 100);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">Guest Management</h2>
                <p className="text-gray-500 font-medium">Select household members and invite external guests.</p>
            </div>

            {/* Household Members */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        Household Members
                        {formData.selectedMemberIds.length > 0 && (
                            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[10px]">
                                {formData.selectedMemberIds.length} Selected
                            </span>
                        )}
                    </Label>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onSelectAllMembers}
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold h-8"
                    >
                        Select All
                    </Button>
                </div>

                {members.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {members.map((member) => (
                            <button
                                key={member.id}
                                type="button"
                                onClick={() => onToggleMember(member.id)}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group text-left",
                                    formData.selectedMemberIds.includes(member.id)
                                        ? "border-[var(--primary)] bg-indigo-50/50 shadow-md ring-1 ring-indigo-500/20"
                                        : "border-gray-200 bg-white hover:border-gray-200 hover:bg-gray-50"
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300",
                                        formData.selectedMemberIds.includes(member.id)
                                            ? "bg-[var(--primary)] text-white shadow-md shadow-indigo-200 transform scale-105"
                                            : "bg-gray-100 text-gray-500 group-hover:bg-white border border-gray-100"
                                    )}
                                >
                                    {member.name?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn(
                                        "font-bold truncate text-sm transition-colors",
                                        formData.selectedMemberIds.includes(member.id)
                                            ? "text-indigo-900"
                                            : "text-gray-700"
                                    )}>
                                        {member.name || "Member"}
                                    </p>
                                    <p className="text-xs text-gray-400 capitalize">Family Member</p>
                                </div>
                                <div className={cn(
                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                    formData.selectedMemberIds.includes(member.id)
                                        ? "border-[var(--primary)] bg-[var(--primary)] scale-100"
                                        : "border-gray-200 bg-transparent scale-90 opacity-0 group-hover:opacity-100"
                                )}>
                                    <Check className="w-3 h-3 text-white stroke-[3]" />
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100 border-dashed">
                        <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No household members found.</p>
                        <Button variant="link" className="text-indigo-600 font-bold mt-2">
                            Add Members in Profile
                        </Button>
                    </div>
                )}
            </div>

            {/* External Guests */}
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-white rounded-xl p-4 space-y-6 border border-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full -mr-10 -mt-10 pointer-events-none" />

                <h3 className="font-extrabold text-gray-900 flex items-center gap-3 text-lg relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-[var(--primary)] flex items-center justify-center shadow-lg shadow-indigo-200">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    Invite Guests
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <GuestCounter
                        label="Adult Guests"
                        subLabel="Standard serving size"
                        value={formData.adultGuests}
                        onIncrement={handleIncrementAdults}
                        onDecrement={handleDecrementAdults}
                        icon={User}
                        iconColor="text-indigo-600"
                        iconBgColor="bg-indigo-100"
                    />

                    <GuestCounter
                        label="Kids (Under 12)"
                        subLabel="Half serving size"
                        value={formData.kidGuests}
                        onIncrement={handleIncrementKids}
                        onDecrement={handleDecrementKids}
                        icon={Baby}
                        iconColor="text-pink-600"
                        iconBgColor="bg-pink-100"
                    />
                </div>

                <p className="text-xs font-semibold text-gray-400 text-center uppercase tracking-wider relative z-10">
                    Total Estimated Servings: {totalServings}
                </p>
            </div>

            {/* Summary Card */}
            <GuestSummary
                memberCount={formData.selectedMemberIds.length}
                guestCount={formData.adultGuests + formData.kidGuests}
                totalServings={totalServings}
            />
        </div>
    );
};

export const GuestStep = memo(GuestStepComponent);

"use client";

import React, { memo } from "react";
import { Users, UserCheck, Utensils } from "lucide-react";
import type { GuestSummaryProps } from "../types/event.types";

const GuestSummaryComponent: React.FC<GuestSummaryProps> = ({
    memberCount,
    guestCount,
    totalServings,
}) => {
    return (
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl p-4 text-white shadow-xl shadow-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center border border-white/10">
                            <UserCheck className="w-5 h-5 text-indigo-300" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{memberCount}</p>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Family</p>
                        </div>
                    </div>

                    <div className="w-px h-10 bg-white/10 hidden sm:block" />

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center border border-white/10">
                            <Users className="w-5 h-5 text-purple-300" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{guestCount}</p>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Guests</p>
                        </div>
                    </div>
                </div>

                <div className="w-full sm:w-auto p-4 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Servings</p>
                        <p className="text-2xl font-black bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                            {totalServings}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <Utensils className="w-5 h-5 text-white" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const GuestSummary = memo(GuestSummaryComponent);

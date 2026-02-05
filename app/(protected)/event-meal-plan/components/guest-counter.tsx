"use client";

import React, { memo } from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GuestCounterProps } from "../types/event.types";

const GuestCounterComponent: React.FC<GuestCounterProps> = ({
    label,
    subLabel,
    value,
    onIncrement,
    onDecrement,
    icon: Icon,
    iconColor,
    iconBgColor,
}) => {
    return (
        <div className="flex items-center justify-between bg-white rounded-xl p-5 border border-gray-200 hover:shadow-sm transition-all group">
            <div className="flex items-center gap-4">
                {Icon && (
                    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center transition-colors", iconBgColor || 'bg-gray-50')}>
                        <Icon className={cn("w-6 h-6 transition-colors", iconColor || 'text-gray-500')} />
                    </div>
                )}
                <div>
                    <p className="font-bold text-gray-900 text-lg">{label}</p>
                    <p className="text-xs font-medium text-gray-500">{subLabel}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                    onClick={onDecrement}
                    disabled={value === 0}
                >
                    <Minus className="w-5 h-5" />
                </Button>
                <span className="w-8 text-center text-2xl font-extrabold text-gray-900 tabular-nums">{value}</span>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-lg bg-gray-900 text-white hover:bg-black hover:scale-105 transition-all shadow-md active:scale-95"
                    onClick={onIncrement}
                >
                    <Plus className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
};

export const GuestCounter = memo(GuestCounterComponent);

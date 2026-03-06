"use client";

import { AlertTriangle, ArrowRight } from "lucide-react";
import type { PendingUpdate } from "@/services/budget/types/budget.types";

interface PendingUpdateAlertProps {
    pendingUpdates: PendingUpdate[];
    onUpdateClick: (update: PendingUpdate) => void;
}

export function PendingUpdateAlert({
    pendingUpdates,
    onUpdateClick,
}: PendingUpdateAlertProps) {
    if (!pendingUpdates || pendingUpdates.length === 0) return null;

    return (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 animate-fade-in">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-amber-800">
                        ⚠ Budget Update Pending
                    </h3>
                    <p className="text-xs text-amber-600 mt-0.5">
                        You haven't updated spending for{" "}
                        {pendingUpdates.length === 1
                            ? "yesterday"
                            : `${pendingUpdates.length} days`}
                        . Please update to maintain accurate tracking.
                    </p>

                    <div className="flex flex-wrap gap-2 mt-3">
                        {pendingUpdates.slice(0, 5).map((update) => (
                            <button
                                key={update.dailyBudgetId}
                                onClick={() => onUpdateClick(update)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-semibold text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-all cursor-pointer"
                            >
                                {new Date(update.date).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                })}
                                <span className="text-amber-400">
                                    ${update.allocatedAmount}
                                </span>
                                <ArrowRight className="w-3 h-3" />
                            </button>
                        ))}
                        {pendingUpdates.length > 5 && (
                            <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-amber-500">
                                +{pendingUpdates.length - 5} more
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

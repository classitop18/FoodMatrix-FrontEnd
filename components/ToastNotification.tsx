"use client";

import React from "react";
import { useNotificationContext } from "../providers/NotificationContext";
import { X } from "lucide-react";

export const ToastNotification = () => {
    const { activeToast, dismissToast } = useNotificationContext();

    if (!activeToast) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] animate-slide-up">
            <div className="bg-white border-l-4 border-blue-500 shadow-xl rounded-lg p-4 max-w-sm w-full flex items-start space-x-3 transition-all duration-300">
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">{activeToast.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{activeToast.body}</p>
                </div>
                <button onClick={dismissToast} className="text-gray-400 hover:text-gray-800 transition-colors">
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

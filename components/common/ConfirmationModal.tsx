"use client";

import React from "react";
import { X, AlertTriangle, CheckCircle, Info, Loader2 } from "lucide-react";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "success" | "info" | "warning";
    isLoading?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "info",
    isLoading = false,
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const handleConfirm = async () => {
        await onConfirm();
    };

    const variantStyles = {
        danger: {
            icon: AlertTriangle,
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
            headerBg: "from-red-600 to-red-700",
            buttonBg: "bg-red-600 hover:bg-red-700",
        },
        success: {
            icon: CheckCircle,
            iconBg: "bg-green-100",
            iconColor: "text-green-600",
            headerBg: "from-green-600 to-green-700",
            buttonBg: "bg-green-600 hover:bg-green-700",
        },
        warning: {
            icon: AlertTriangle,
            iconBg: "bg-amber-100",
            iconColor: "text-amber-600",
            headerBg: "from-amber-600 to-amber-700",
            buttonBg: "bg-amber-600 hover:bg-amber-700",
        },
        info: {
            icon: Info,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            headerBg: "from-[#7661d3] to-[#3d326d]",
            buttonBg: "bg-[#7661d3] hover:bg-[#3d326d]",
        },
    };

    const style = variantStyles[variant];
    const Icon = style.icon;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className={`bg-gradient-to-r ${style.headerBg} text-white p-6`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 ${style.iconBg} rounded-xl flex items-center justify-center`}>
                                <Icon size={20} className={style.iconColor} />
                            </div>
                            <h2 className="text-xl font-extrabold">{title}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-700 text-sm leading-relaxed">{message}</p>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={`flex-1 py-3 rounded-xl ${style.buttonBg} text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Processing...
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

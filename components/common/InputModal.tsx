"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

interface InputOption {
    value: string;
    label: string;
}

interface InputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (value: string) => void | Promise<void>;
    title: string;
    description?: string;
    inputLabel: string;
    inputType?: "text" | "select" | "textarea";
    options?: InputOption[];
    placeholder?: string;
    defaultValue?: string;
    submitText?: string;
    cancelText?: string;
    isLoading?: boolean;
    required?: boolean;
    icon?: React.ReactNode;
}

export default function InputModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    description,
    inputLabel,
    inputType = "text",
    options = [],
    placeholder = "",
    defaultValue = "",
    submitText = "Submit",
    cancelText = "Cancel",
    isLoading = false,
    required = true,
    icon,
}: InputModalProps) {
    const [value, setValue] = useState(defaultValue);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setValue(defaultValue);
            setError("");
        }
    }, [isOpen, defaultValue]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (required && !value.trim()) {
            setError("This field is required");
            return;
        }

        setError("");
        await onSubmit(value);
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#7661d3] to-[#3d326d] text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {icon && (
                                <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    {icon}
                                </div>
                            )}
                            <div>
                                <h2 className="text-xl font-extrabold">{title}</h2>
                                {description && (
                                    <p className="text-sm text-white/80 mt-1">{description}</p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={isLoading}
                            className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">
                            {inputLabel} {required && <span className="text-red-500">*</span>}
                        </label>

                        {inputType === "select" ? (
                            <select
                                value={value}
                                onChange={(e) => {
                                    setValue(e.target.value);
                                    setError("");
                                }}
                                disabled={isLoading}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold focus:ring-2 focus:ring-[#7661d3]/20 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {options.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        ) : inputType === "textarea" ? (
                            <textarea
                                value={value}
                                onChange={(e) => {
                                    setValue(e.target.value);
                                    setError("");
                                }}
                                placeholder={placeholder}
                                disabled={isLoading}
                                rows={4}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#7661d3]/20 outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                            />
                        ) : (
                            <input
                                type={inputType}
                                value={value}
                                onChange={(e) => {
                                    setValue(e.target.value);
                                    setError("");
                                }}
                                placeholder={placeholder}
                                disabled={isLoading}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#7661d3]/20 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        )}

                        {error && (
                            <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#7661d3] to-[#3d326d] text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                submitText
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

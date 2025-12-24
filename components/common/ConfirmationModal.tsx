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

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const variantStyles = {
    danger: {
      icon: AlertTriangle,
      iconBg: "bg-white/20",
      iconColor: "text-white",
      headerBg: "from-[#7661d3] to-[#3d326d]",
      buttonBg: "from-[#7661d3] to-[#3d326d]",
      contentBg: "bg-[#F3F0FD]",
      contentBorder: "border-[#7661d3]/20",
      contentText: "text-[#313131]",
    },
    success: {
      icon: CheckCircle,
      iconBg: "bg-white/20",
      iconColor: "text-white",
      headerBg: "from-[#7661d3] to-[#3d326d]",
      buttonBg: "from-[#7661d3] to-[#3d326d]",
      contentBg: "bg-[#F3F0FD]",
      contentBorder: "border-[#7661d3]/20",
      contentText: "text-[#313131]",
    },
    warning: {
      icon: AlertTriangle,
      iconBg: "bg-white/20",
      iconColor: "text-white",
      headerBg: "from-[#7661d3] to-[#3d326d]",
      buttonBg: "from-[#7661d3] to-[#3d326d]",
      contentBg: "bg-[#F3F0FD]",
      contentBorder: "border-[#7661d3]/20",
      contentText: "text-[#313131]",
    },
    info: {
      icon: Info,
      iconBg: "bg-white/20",
      iconColor: "text-white",
      headerBg: "from-[#7661d3] to-[#3d326d]",
      buttonBg: "from-[#7661d3] to-[#3d326d]",
      contentBg: "bg-[#F3F0FD]",
      contentBorder: "border-[#7661d3]/20",
      contentText: "text-[#313131]",
    },
  };

  const style = variantStyles[variant];
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div
          className={`bg-gradient-to-r ${style.headerBg} text-white p-6 rounded-t-2xl`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 ${style.iconBg} rounded-xl flex items-center justify-center backdrop-blur-sm`}
              >
                <Icon size={20} className={style.iconColor} />
              </div>
              <h2 className="text-xl font-extrabold">{title}</h2>
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
        <div className="p-6 space-y-5">
          <div
            className={`${style.contentBg} border ${style.contentBorder} rounded-xl p-4`}
          >
            <p
              className={`text-sm leading-relaxed font-medium ${style.contentText}`}
            >
              {message}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 rounded-xl bg-gradient-to-r ${style.buttonBg} text-white font-bold text-sm hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
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
    </div>
  );
}

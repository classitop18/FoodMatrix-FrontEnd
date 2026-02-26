"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotificationContext } from "../providers/NotificationContext";
import { useRouter } from "next/navigation";
import {
    X,
    Bell,
    AlertTriangle,
    ShieldAlert,
    CheckCircle2,
    Info,
} from "lucide-react";

const TOAST_DURATION = 5000;

const typeConfig: Record<
    string,
    { icon: React.ReactNode; accent: string; bg: string }
> = {
    WARNING: {
        icon: <AlertTriangle size={18} />,
        accent: "#f59e0b",
        bg: "rgba(245,158,11,0.08)",
    },
    ERROR: {
        icon: <ShieldAlert size={18} />,
        accent: "#ef4444",
        bg: "rgba(239,68,68,0.08)",
    },
    SUCCESS: {
        icon: <CheckCircle2 size={18} />,
        accent: "#22c55e",
        bg: "rgba(34,197,94,0.08)",
    },
    INFO: {
        icon: <Info size={18} />,
        accent: "#6366f1",
        bg: "rgba(99,102,241,0.08)",
    },
    DEFAULT: {
        icon: <Bell size={18} />,
        accent: "#6366f1",
        bg: "rgba(99,102,241,0.08)",
    },
};

function getTypeConfig(type?: string) {
    const key = type?.toUpperCase() || "DEFAULT";
    return typeConfig[key] || typeConfig.DEFAULT;
}

function ProgressBar({
    duration,
    accent,
}: {
    duration: number;
    accent: string;
}) {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);
            if (remaining <= 0) clearInterval(interval);
        }, 50);
        return () => clearInterval(interval);
    }, [duration]);

    return (
        <div
            className="absolute bottom-0 left-0 right-0 h-[3px] overflow-hidden"
            style={{ borderRadius: "0 0 12px 12px" }}
        >
            <div
                className="h-full"
                style={{
                    width: `${progress}%`,
                    backgroundColor: accent,
                    opacity: 0.6,
                    transition: "width 50ms linear",
                }}
            />
        </div>
    );
}

export const ToastNotification = () => {
    const { toasts, removeToast } = useNotificationContext();
    const router = useRouter();

    const handleClick = (id: string) => {
        removeToast(id);
        router.push("/notifications");
    };

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none max-w-[420px] w-full">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => {
                    const config = getTypeConfig(toast.type);

                    return (
                        <motion.div
                            key={toast.id}
                            layout
                            initial={{ x: 420, opacity: 0, scale: 0.95 }}
                            animate={{ x: 0, opacity: 1, scale: 1 }}
                            exit={{ x: 420, opacity: 0, scale: 0.95 }}
                            transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 30,
                                mass: 0.8,
                            }}
                            className="pointer-events-auto relative overflow-hidden cursor-pointer"
                            style={{
                                background: "rgba(255,255,255,0.95)",
                                backdropFilter: "blur(20px)",
                                WebkitBackdropFilter: "blur(20px)",
                                borderRadius: "12px",
                                borderLeft: `4px solid ${config.accent}`,
                                boxShadow:
                                    "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                            }}
                            onClick={() => handleClick(toast.id)}
                        >
                            <div className="p-4 flex items-start gap-3">
                                {/* Type Icon */}
                                <div
                                    className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5"
                                    style={{
                                        backgroundColor: config.bg,
                                        color: config.accent,
                                    }}
                                >
                                    {config.icon}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                                        {toast.title}
                                    </h4>
                                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">
                                        {toast.body}
                                    </p>
                                    <span className="text-[10px] text-gray-400 mt-1.5 block font-medium">
                                        Just now
                                    </span>
                                </div>

                                {/* Dismiss */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeToast(toast.id);
                                    }}
                                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100/80 transition-all duration-200"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {/* Progress Bar */}
                            <ProgressBar duration={TOAST_DURATION} accent={config.accent} />
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

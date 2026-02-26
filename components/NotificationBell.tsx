"use client";

import React, { useState, useRef, useEffect } from "react";
import { useNotificationContext } from "../providers/NotificationContext";
import { useFCM } from "../hooks/useFCM";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } =
        useNotificationContext();
    const { permission, requestPermission } = useFCM();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Click-outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const getRelativeTime = (dateStr: string) => {
        const now = Date.now();
        const then = new Date(dateStr).getTime();
        const diffSec = Math.floor((now - then) / 1000);
        if (diffSec < 60) return "Just now";
        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) return `${diffMin}m ago`;
        const diffHour = Math.floor(diffMin / 60);
        if (diffHour < 24) return `${diffHour}h ago`;
        const diffDay = Math.floor(diffHour / 24);
        if (diffDay < 7) return `${diffDay}d ago`;
        return new Date(dateStr).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 focus:outline-none transition-all duration-200"
            >
                <Bell
                    size={22}
                    className={unreadCount > 0 ? "animate-[bell-ring_0.5s_ease-in-out]" : ""}
                />
                {unreadCount > 0 && (
                    <span
                        className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white rounded-full px-1"
                        style={{
                            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                            boxShadow: "0 2px 6px rgba(239,68,68,0.4)",
                        }}
                    >
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-[380px] bg-white rounded-xl overflow-hidden z-50 animate-scale-in"
                    style={{
                        boxShadow:
                            "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
                        border: "1px solid rgba(0,0,0,0.06)",
                    }}
                >
                    {/* Header */}
                    <div
                        className="px-4 py-3 flex justify-between items-center"
                        style={{
                            background: "linear-gradient(135deg, #f8f7ff 0%, #f0fdf4 100%)",
                            borderBottom: "1px solid rgba(0,0,0,0.06)",
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-900">
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <span
                                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                    }}
                                >
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {permission !== "granted" && (
                                <button
                                    onClick={requestPermission}
                                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                                >
                                    Enable Push
                                </button>
                            )}
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-[11px] text-gray-500 hover:text-gray-800 flex items-center gap-1 font-medium transition-colors"
                                >
                                    <CheckCheck size={13} />
                                    Read all
                                </button>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-50 flex items-center justify-center">
                                    <Bell className="text-gray-300" size={22} />
                                </div>
                                <p className="text-sm text-gray-400 font-medium">
                                    No notifications yet
                                </p>
                            </div>
                        ) : (
                            notifications.slice(0, 8).map((notif) => (
                                <div
                                    key={notif.id}
                                    className="px-4 py-3 hover:bg-gray-50/80 cursor-pointer transition-all duration-150 flex items-start gap-3"
                                    style={{
                                        borderBottom: "1px solid rgba(0,0,0,0.03)",
                                        backgroundColor: !notif.isRead
                                            ? "rgba(99,102,241,0.04)"
                                            : "transparent",
                                    }}
                                    onClick={() => {
                                        if (!notif.isRead) markAsRead(notif.id);
                                    }}
                                >
                                    {/* Unread dot */}
                                    <div className="flex-shrink-0 mt-2">
                                        {!notif.isRead ? (
                                            <div
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{
                                                    background:
                                                        "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                                    boxShadow: "0 0 6px rgba(99,102,241,0.4)",
                                                }}
                                            />
                                        ) : (
                                            <div className="w-2.5 h-2.5 rounded-full bg-transparent" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h4
                                            className={`text-[13px] truncate ${!notif.isRead
                                                ? "font-semibold text-gray-900"
                                                : "font-medium text-gray-600"
                                                }`}
                                        >
                                            {notif.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                                            {notif.body}
                                        </p>
                                        <span className="text-[10px] text-gray-400 mt-1 block font-medium">
                                            {getRelativeTime(notif.sentAt)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                router.push("/notifications");
                            }}
                            className="w-full py-2.5 text-xs font-semibold text-center transition-all duration-200"
                            style={{
                                color: "#6366f1",
                                borderTop: "1px solid rgba(0,0,0,0.06)",
                                background: "rgba(99,102,241,0.02)",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.background = "rgba(99,102,241,0.06)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.background = "rgba(99,102,241,0.02)")
                            }
                        >
                            View all notifications
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

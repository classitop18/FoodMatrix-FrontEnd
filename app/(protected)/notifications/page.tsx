"use client";

import React, { useState, useCallback } from "react";
import { useNotificationContext, AppNotification } from "../../../providers/NotificationContext";
import { useFCM } from "../../../hooks/useFCM";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  Info,
  ShieldAlert,
  AlertTriangle,
  Loader2,
  ChevronDown,
  Trash2,
} from "lucide-react";

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year:
      new Date(dateStr).getFullYear() !== new Date().getFullYear()
        ? "numeric"
        : undefined,
  });
}

function getIconForType(type?: string) {
  switch (type?.toUpperCase()) {
    case "WARNING":
      return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-50 text-amber-500">
          <AlertTriangle size={20} />
        </div>
      );
    case "ERROR":
      return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50 text-red-500">
          <ShieldAlert size={20} />
        </div>
      );
    case "SUCCESS":
      return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-50 text-green-500">
          <Check size={20} />
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-500">
          <Info size={20} />
        </div>
      );
  }
}

export default function NotificationPage() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    refreshNotifications,
    isLoading,
  } = useNotificationContext();
  const { permission, requestPermission } = useFCM();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [visibleCount, setVisibleCount] = useState(20);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  const handleClearAll = () => {
    clearAllNotifications();
    setIsClearAllModalOpen(false);
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => n.isRead !== true)
      : notifications;

  const visibleNotifications = filteredNotifications.slice(0, visibleCount);
  const hasMore = visibleCount < filteredNotifications.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + 20);
  }, []);

  return (
    <div className="max-w-8xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              }}
            >
              <Bell className="text-white" size={20} />
            </div>
            Notifications
            {unreadCount > 0 && (
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  boxShadow: "0 2px 8px rgba(239,68,68,0.3)",
                }}
              >
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-gray-500 mt-1.5 text-sm">
            Stay updated with your latest alerts and activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {permission !== "granted" && (
            <button
              onClick={requestPermission}
              className="text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200"
              style={{
                background: "rgba(99,102,241,0.08)",
                color: "#6366f1",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(99,102,241,0.15)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(99,102,241,0.08)")
              }
            >
              Enable Push
            </button>
          )}
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="text-sm px-4 py-2 rounded-lg font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            <CheckCheck size={15} />
            Mark all read
          </button>
          <button
            onClick={() => setIsClearAllModalOpen(true)}
            disabled={notifications.length === 0}
            className="text-sm px-4 py-2 rounded-lg font-medium border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            <Trash2 size={15} />
            Clear All
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-5 p-1 bg-gray-100/80 rounded-lg w-fit">
        <button
          onClick={() => setFilter("all")}
          className={`text-xs font-semibold px-4 py-2 rounded-md transition-all duration-200 ${filter === "all"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`text-xs font-semibold px-4 py-2 rounded-md transition-all duration-200 flex items-center gap-1.5 ${filter === "unread"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          Unread
          {unreadCount > 0 && (
            <span
              className="text-[10px] text-white px-1.5 py-0.5 rounded-full font-bold"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Loading */}
      {isLoading && notifications.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-indigo-500" size={28} />
        </div>
      )}

      {/* Notification List */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {!isLoading && visibleNotifications.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
              }}
            >
              <Bell className="text-gray-400" size={28} />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {filter === "unread"
                ? "All caught up!"
                : "No notifications yet"}
            </h3>
            <p className="text-sm text-gray-500 max-w-xs">
              {filter === "unread"
                ? "You've read all your notifications. Nice work!"
                : "When you get notifications, they'll show up here."}
            </p>
          </div>
        ) : (
          <>
            {visibleNotifications.map((notif, index) => (
              <div
                key={notif.id}
                className="group relative transition-all duration-150 hover:bg-gray-50/80"
                style={{
                  borderBottom:
                    index !== visibleNotifications.length - 1
                      ? "1px solid rgba(0,0,0,0.04)"
                      : "none",
                  backgroundColor: !notif.isRead
                    ? "rgba(99,102,241,0.03)"
                    : "transparent",
                }}
              >
                <div className="p-4 sm:px-5 sm:py-4 flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getIconForType(notif.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-0.5">
                      <h4
                        className={`text-sm leading-snug ${!notif.isRead
                          ? "font-semibold text-gray-900"
                          : "font-medium text-gray-700"
                          }`}
                      >
                        {notif.title}
                      </h4>
                      <span className="flex-shrink-0 flex items-center text-[11px] text-gray-400 whitespace-nowrap gap-1 font-medium">
                        <Clock size={11} />
                        {getRelativeTime(notif.sentAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {notif.body}
                    </p>

                    {!notif.isRead && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="mt-2 text-xs font-semibold flex items-center gap-1 transition-all duration-200 hover:gap-1.5"
                        style={{ color: "#6366f1" }}
                      >
                        <Check size={13} />
                        Mark as read
                      </button>
                    )}
                  </div>

                  {/* Unread Indicator */}
                  {!notif.isRead && (
                    <div className="flex-shrink-0 mt-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          background:
                            "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          boxShadow: "0 0 8px rgba(99,102,241,0.4)",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Load More */}
            {hasMore && (
              <button
                onClick={loadMore}
                className="w-full py-3 text-sm font-semibold text-center flex items-center justify-center gap-2 transition-all duration-200"
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
                <ChevronDown size={16} />
                Load more notifications
              </button>
            )}
          </>
        )}
      </div>

      <ConfirmationModal
        isOpen={isClearAllModalOpen}
        onClose={() => setIsClearAllModalOpen(false)}
        onConfirm={handleClearAll}
        title="Clear All Notifications"
        message="Are you sure you want to clear all notifications? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

"use client";

import React from "react";
import { useNotificationContext } from "../../../providers/NotificationContext";
import { useFCM } from "../../../hooks/useFCM";
import { Bell, Check, Trash2, Clock, Info, ShieldAlert, AlertTriangle } from "lucide-react";

export default function NotificationPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationContext();
  const { permission, requestPermission } = useFCM();

  const getIconForType = (type?: string) => {
    switch (type?.toUpperCase()) {
      case "WARNING": return <AlertTriangle className="text-amber-500" size={20} />;
      case "ERROR": return <ShieldAlert className="text-red-500" size={20} />;
      case "SUCCESS": return <Check className="text-green-500" size={20} />;
      default: return <Info className="text-blue-500" size={20} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="text-indigo-600" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-gray-500 mt-1">Manage and view your recent system alerts and updates.</p>
        </div>

        <div className="flex items-center gap-3">
          {permission !== "granted" && (
            <button
              onClick={requestPermission}
              className="text-sm px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 font-medium transition-colors"
            >
              Enable Push Notifications
            </button>
          )}
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="text-sm px-4 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 font-medium border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Check size={16} />
            Mark all as read
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="bg-gray-50 p-4 rounded-full">
              <Bell className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No notifications yet</h3>
            <p className="text-gray-500 max-w-sm">When you get notifications, they'll show up here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map((notif) => (
              <li
                key={notif.id}
                className={`p-4 sm:p-6 transition-colors hover:bg-gray-50 ${!notif.isRead ? 'bg-indigo-50/30' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1 bg-white p-2 rounded-full shadow-sm border border-gray-100">
                    {getIconForType(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <h4 className={`text-base truncate pr-4 ${!notif.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>
                        {notif.title}
                      </h4>
                      <span className="flex-shrink-0 flex items-center text-xs text-gray-500 whitespace-nowrap gap-1">
                        <Clock size={12} />
                        {new Date(notif.sentAt).toLocaleString(undefined, {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {notif.body}
                    </p>

                    {!notif.isRead && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 mt-1"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useNotificationContext } from "../providers/NotificationContext";
import { useFCM } from "../hooks/useFCM";
import { Bell, Check, Trash } from "lucide-react";

export const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationContext();
    const { permission, requestPermission } = useFCM();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/4 -translate-y-1/4">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-md shadow-lg overflow-hidden z-50 border border-gray-200">
                    <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                        <div className="flex space-x-2">
                            {permission !== "granted" && (
                                <button onClick={requestPermission} className="text-xs text-blue-600 hover:text-blue-800">
                                    Enable Push
                                </button>
                            )}
                            <button onClick={markAllAsRead} className="text-xs text-gray-500 hover:text-gray-800 flex items-center">
                                <Check size={14} className="mr-1" /> Mark all read
                            </button>
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">No notifications yet.</div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notif.isRead ? 'bg-blue-50/50' : ''}`}
                                    onClick={() => markAsRead(notif.id)}
                                >
                                    <h4 className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                        {notif.title}
                                    </h4>
                                    <p className="text-xs text-gray-600 mt-1 truncate">{notif.body}</p>
                                    <span className="text-[10px] text-gray-400 mt-2 block">
                                        {new Date(notif.sentAt).toLocaleString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

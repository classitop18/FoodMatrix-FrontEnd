"use client";

import { motion } from "framer-motion";
import { Watch, Smartphone, Monitor } from "lucide-react";

export const WearableIntegration = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <Watch className="w-5 h-5 text-[#7661d3]" />
                    Connected Devices
                </h3>
                <button className="px-3 py-1.5 text-xs font-medium text-[#7661d3] bg-[#f3f0fd] rounded-lg hover:bg-[#eaeaface] transition-colors">
                    + Add Device
                </button>
            </div>

            <div className="flex flex-wrap gap-4">
                {/* Apple Health - Connected */}
                <div className="flex items-center gap-3 p-3 pr-6 rounded-xl border border-green-100 bg-green-50/30">
                    <div className="p-2 bg-black text-white rounded-lg">
                        <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-800">Apple Health</p>
                        <p className="text-xs text-green-600 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Syncing
                        </p>
                    </div>
                </div>

                {/* Fitbit - Connected */}
                <div className="flex items-center gap-3 p-3 pr-6 rounded-xl border border-green-100 bg-green-50/30">
                    <div className="p-2 bg-[#00B0B9] text-white rounded-lg">
                        <Watch className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-800">Fitbit</p>
                        <p className="text-xs text-green-600 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Connected
                        </p>
                    </div>
                </div>

                {/* Garmin - Disconnected */}
                <div className="flex items-center gap-3 p-3 pr-6 rounded-xl border border-gray-100 bg-gray-50 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                    <div className="p-2 bg-black text-white rounded-lg">
                        <Monitor className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-800">Garmin</p>
                        <p className="text-xs text-gray-500">Connect</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

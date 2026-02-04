"use client";

import { motion } from "framer-motion";
import { TrendingUp, Activity, Award } from "lucide-react";

export const HealthScore = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#7661d3]" />
                    Health Score
                </h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                    Updated Today
                </span>
            </div>

            <div className="flex flex-col items-center justify-center flex-1">
                <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                    {/* Circular Progress (Simplified SVG) */}
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path
                            className="text-gray-100"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                        />
                        <path
                            className="text-[#7dab4f]"
                            strokeDasharray="85, 100"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center text-[#3d326d]">
                        <span className="text-4xl font-bold">85</span>
                        <span className="text-sm font-medium text-gray-400">Excellent</span>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-sm text-gray-500 mb-4">You're doing great! Top 15% of users.</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f3f0fd] text-[#7661d3] rounded-lg text-sm font-medium">
                        <TrendingUp className="w-4 h-4" />
                        +2.5% from last week
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

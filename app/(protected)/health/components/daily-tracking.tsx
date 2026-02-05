"use client";

import { motion } from "framer-motion";
import { Scale, Moon, Footprints, Heart } from "lucide-react";

const MetricCard = ({ icon: Icon, title, value, unit, trend, trendUp, colorClass, bgClass }: any) => (
    <div className={`p-4 rounded-2xl border ${bgClass} border-transparent hover:border-gray-200 transition-all`}>
        <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${colorClass} bg-white/80 shadow-sm`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-600">{title}</span>
        </div>
        <div className="flex items-end justify-between">
            <div>
                <span className="text-2xl font-bold text-gray-800">{value}</span>
                <span className="text-xs text-gray-500 ml-1">{unit}</span>
            </div>
            {trend && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {trend}
                </span>
            )}
        </div>
    </div>
);

export const DailyTracking = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    Today's Metrics
                </h3>
                <select className="bg-gray-50 border border-gray-200 text-gray-600 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#7661d3]/20">
                    <option>Today</option>
                    <option>This Week</option>
                    <option>This Month</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    icon={Scale}
                    title="Weight"
                    value="74.5"
                    unit="kg"
                    trend="-0.5kg"
                    trendUp={true}
                    colorClass="text-blue-500"
                    bgClass="bg-blue-50/50"
                />
                <MetricCard
                    icon={Moon}
                    title="Sleep"
                    value="7h 20m"
                    unit=""
                    trend="+15m"
                    trendUp={true}
                    colorClass="text-[var(--primary)]"
                    bgClass="bg-indigo-50/50"
                />
                <MetricCard
                    icon={Footprints}
                    title="Steps"
                    value="8,432"
                    unit=""
                    trend="Goal: 10k"
                    trendUp={false} // Just for color variation logic if needed, usually gray for neutral
                    colorClass="text-orange-500"
                    bgClass="bg-orange-50/50"
                />
                <MetricCard
                    icon={Heart}
                    title="Blood Pressure"
                    value="118/78"
                    unit="mmHg"
                    trend="Normal"
                    trendUp={true}
                    colorClass="text-red-500"
                    bgClass="bg-red-50/50"
                />
            </div>
        </motion.div>
    );
};

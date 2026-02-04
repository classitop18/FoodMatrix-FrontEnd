"use client";

import { motion } from "framer-motion";
import { User, HeartPulse, Leaf, Utensils, AlertCircle } from "lucide-react";

export const HealthProfile = () => {
    // Static data matching the prompt requirements
    const profile = {
        conditions: ["Type 2 Diabetes (Managed)"],
        allergies: ["Peanuts", "Shellfish"],
        preferences: ["Low Carb", "High Protein"],
        restrictions: ["Gluten-Free"],
        goals: ["Stabilize Glucose", "Weight Loss"]
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-[#7661d3]" />
                    Your Profile
                </h3>
                <button className="text-sm text-[#7661d3] hover:underline">Edit</button>
            </div>

            <div className="space-y-5">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-500">
                        <HeartPulse className="w-4 h-4" /> Medical Conditions
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {profile.conditions.map((item, i) => (
                            <span key={i} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-semibold border border-red-100">{item}</span>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-500">
                        <AlertCircle className="w-4 h-4" /> Allergies
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {profile.allergies.map((item, i) => (
                            <span key={i} className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs font-semibold border border-orange-100">{item}</span>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-500">
                        <Leaf className="w-4 h-4" /> Preferences & Restrictions
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {profile.preferences.map((item, i) => (
                            <span key={i} className="px-3 py-1 bg-green-50 text-[#7dab4f] rounded-lg text-xs font-semibold border border-green-100">{item}</span>
                        ))}
                        {profile.restrictions.map((item, i) => (
                            <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold border border-gray-200">{item}</span>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-500">
                        <Utensils className="w-4 h-4" /> Current Goal
                    </div>
                    <div className="bg-[#f3f0fd] p-3 rounded-xl border border-[#7661d3]/10">
                        <p className="text-[#3d326d] font-semibold text-sm">Weight Loss & Glucose Control</p>
                        <p className="text-xs text-[#3d326d]/70 mt-1">Target: 2200 kcal/day • Low Glycemic Index</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

"use client";

import { motion } from "framer-motion";
import { Brain, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

export const MealIntelligence = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#7661d3]" />
                    Meal Intelligence
                </h3>
            </div>

            <div className="space-y-4">
                {/* Insight 1 */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#f3f0fd] to-white border border-[#7661d3]/10 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-start gap-3 relative z-10">
                        <div className="p-2 bg-white rounded-lg text-[#7661d3] shadow-sm">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-[#3d326d] text-sm">Diabetic Friendly Mode</h4>
                            <p className="text-xs text-gray-500 mt-1">Found 3 recipes with high sugar. Auto-substituted with Stevia & Almond Flour.</p>
                        </div>
                    </div>
                    <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7661d3]/40 group-hover:text-[#7661d3] group-hover:translate-x-1 transition-all" />
                </div>

                {/* Insight 2 */}
                <div className="p-4 rounded-2xl bg-white border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-start gap-3 relative z-10">
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-500 border border-orange-100">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">Carb Limit Warning</h4>
                            <p className="text-xs text-gray-500 mt-1">Dinner "Pasta Alfredo" exceeds your 45g carb limit. <span className="text-[#7661d3] font-medium">Switch to Zucchini Noodles?</span></p>
                        </div>
                    </div>
                    <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-hover:text-[#7661d3] group-hover:translate-x-1 transition-all" />
                </div>

                {/* Insight 3 */}
                <div className="p-4 rounded-2xl bg-white border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-start gap-3 relative z-10">
                        <div className="p-2 bg-green-50 rounded-lg text-[#7dab4f] border border-green-100">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">Nutrient Synergy</h4>
                            <p className="text-xs text-gray-500 mt-1">Iron absorption optimizer active. Added Vitamin C rich sides to your lunch.</p>
                        </div>
                    </div>
                    <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-hover:text-[#7661d3] group-hover:translate-x-1 transition-all" />
                </div>

            </div>
        </motion.div>
    );
};

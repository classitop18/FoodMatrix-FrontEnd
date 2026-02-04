"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export const HealthHeader = () => {
    return (
        <div className="relative mb-8 p-6 rounded-3xl bg-gradient-to-r from-[#3d326d] to-[#7661d3] overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 mb-2"
                    >
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-semibold border border-white/10 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-yellow-300" />
                            Health Optimization
                        </span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl font-bold text-white mb-2"
                    >
                        Your Personal Wellness Advisor
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/80 max-w-xl"
                    >
                        AI-driven recommendations tailored to your unique biology, logic, and lifestyle.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <button className="px-6 py-2.5 bg-white text-[#3d326d] font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all flex items-center gap-2">
                        Update Profile
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

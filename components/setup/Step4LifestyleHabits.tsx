"use client";

import { motion } from "framer-motion";
import { ChefHat, Home, Info, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";

interface Step4Props {
    form: UseFormReturn<any>;
}

export default function Step4LifestyleHabits({ form }: Step4Props) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
        >
            {/* Cooking Habits */}
            <div className="bg-gradient-to-br from-[#F3F0FD] to-white rounded-2xl p-6 shadow-lg border border-[#7661d3]/20">
                <h3 className="text-2xl font-bold mb-6 flex items-center text-[#3d326d]">
                    <div className="bg-gradient-to-br from-[#7661d3] to-[#3d326d] p-3 rounded-xl mr-3 shadow-md">
                        <ChefHat className="text-white w-6 h-6" />
                    </div>
                    Cooking & Lifestyle Habits
                </h3>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <Label className="text-[#3d326d] font-semibold mb-2 block">
                            Cooking Skill Level <span className="text-[#7dab4f]">*</span>
                        </Label>
                        <Select onValueChange={(value) => form.setValue("cookingSkill", value as any)}>
                            <SelectTrigger data-testid="select-cooking-skill" className="h-12 border-2 border-[#7661d3]/30 focus:border-[#7661d3] rounded-xl">
                                <SelectValue placeholder="Select skill level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="beginner">👶 Beginner (basic meals, simple recipes)</SelectItem>
                                <SelectItem value="moderate">👨‍🍳 Moderate (comfortable with most recipes)</SelectItem>
                                <SelectItem value="advanced">⭐ Advanced (complex recipes, techniques)</SelectItem>
                            </SelectContent>
                        </Select>
                        {form.formState.errors.cookingSkill && (
                            <p className="text-sm text-red-500 mt-1">{String(form.formState.errors.cookingSkill.message)}</p>
                        )}
                    </div>

                    <div>
                        <Label className="text-[#3d326d] font-semibold mb-2 block">
                            Cooking Frequency <span className="text-[#7dab4f]">*</span>
                        </Label>
                        <Select onValueChange={(value) => form.setValue("cookingFrequency", value as any)}>
                            <SelectTrigger data-testid="select-cooking-frequency" className="h-12 border-2 border-[#7661d3]/30 focus:border-[#7661d3] rounded-xl">
                                <SelectValue placeholder="How often do you cook?" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mostly_home">🏠 Mostly at home (5+ meals/week)</SelectItem>
                                <SelectItem value="mixed">🔄 Mixed (2-4 meals/week)</SelectItem>
                                <SelectItem value="mostly_dining_out">🍽️ Mostly dining out (0-1 meals/week)</SelectItem>
                            </SelectContent>
                        </Select>
                        {form.formState.errors.cookingFrequency && (
                            <p className="text-sm text-red-500 mt-1">{String(form.formState.errors.cookingFrequency.message)}</p>
                        )}
                    </div>
                </div>

                <div>
                    <Label className="text-[#3d326d] font-semibold mb-2 block">
                        Budget Flexibility <span className="text-[#7dab4f]">*</span>
                    </Label>
                    <Select onValueChange={(value) => form.setValue("budgetFlexibility", value as any)}>
                        <SelectTrigger data-testid="select-budget-flexibility" className="h-12 border-2 border-[#7661d3]/30 focus:border-[#7661d3] rounded-xl">
                            <SelectValue placeholder="How flexible is your budget?" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="strict">🔒 Strict (must stay within budget)</SelectItem>
                            <SelectItem value="moderate">⚖️ Moderate (small overages for health trade-offs)</SelectItem>
                            <SelectItem value="flexible">💰 Flexible (health over budget when needed)</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.budgetFlexibility && (
                        <p className="text-sm text-red-500 mt-1">{String(form.formState.errors.budgetFlexibility.message)}</p>
                    )}
                </div>
            </div>

            {/* Storage & Shopping */}
            <div className="bg-gradient-to-br from-[#E8F5E0] to-white rounded-2xl p-6 shadow-lg border border-[#7dab4f]/20">
                <h3 className="text-2xl font-bold mb-6 flex items-center text-[#3d326d]">
                    <div className="bg-gradient-to-br from-[#7dab4f] to-[#9bc76d] p-3 rounded-xl mr-3 shadow-md">
                        <Home className="text-white w-6 h-6" />
                    </div>
                    Storage & Shopping Preferences
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                    <label className="flex items-start space-x-4 p-5 border-2 border-[#7661d3]/20 rounded-xl hover:bg-[#F3F0FD] cursor-pointer transition-all duration-300 hover:border-[#7661d3] hover:shadow-md group">
                        <Checkbox
                            checked={form.watch('hasDeepFreezer')}
                            onCheckedChange={(checked) => form.setValue('hasDeepFreezer', !!checked)}
                            data-testid="checkbox-deep-freezer"
                            className="mt-1 border-[#7661d3]"
                        />
                        <div>
                            <div className="flex items-center mb-1">
                                <span className="text-2xl mr-2">🧊</span>
                                <span className="font-bold text-[#3d326d] group-hover:text-[#7661d3]">Have Deep Freezer</span>
                            </div>
                            <p className="text-sm text-gray-600">Can buy and store bulk frozen foods</p>
                        </div>
                    </label>

                    <label className="flex items-start space-x-4 p-5 border-2 border-[#7dab4f]/20 rounded-xl hover:bg-[#E8F5E0] cursor-pointer transition-all duration-300 hover:border-[#7dab4f] hover:shadow-md group">
                        <Checkbox
                            checked={form.watch('shopsDaily')}
                            onCheckedChange={(checked) => form.setValue('shopsDaily', !!checked)}
                            data-testid="checkbox-shops-daily"
                            className="mt-1 border-[#7dab4f]"
                        />
                        <div>
                            <div className="flex items-center mb-1">
                                <span className="text-2xl mr-2">🛒</span>
                                <span className="font-bold text-[#3d326d] group-hover:text-[#7dab4f]">Shop Daily for Fresh Items</span>
                            </div>
                            <p className="text-sm text-gray-600">Prefer fresh ingredients over bulk shopping</p>
                        </div>
                    </label>
                </div>
            </div>

            {/* Ready to Create Account */}
            <motion.div
                className="bg-gradient-to-r from-[#7661d3]/10 via-[#7dab4f]/10 to-[#9bc76d]/10 border-2 border-[#7661d3]/30 rounded-2xl p-6 shadow-lg"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-br from-[#7661d3] to-[#7dab4f] p-3 rounded-xl shadow-md">
                        <Sparkles className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-bold text-xl text-[#3d326d] mb-2 flex items-center">
                            🎉 Ready to Create Your Account!
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            Your health profile will help <span className="font-bold text-[#7661d3]">FoodMatrix</span> provide personalized food recommendations,
                            budget optimizations, and health-aligned meal planning while staying within your food budget.
                        </p>
                        <div className="mt-4 flex items-center space-x-2 text-sm text-[#7dab4f] font-semibold">
                            <Info className="w-4 h-4" />
                            <span>Click "Create Account" below to get started!</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

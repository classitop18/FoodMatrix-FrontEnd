"use client";

import { motion } from "framer-motion";
import { Activity, Stethoscope, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";

interface Step2Props {
    form: UseFormReturn<any>;
    handleArrayToggle: (field: any, value: string) => void;
}

export default function Step2HealthActivity({ form, handleArrayToggle }: Step2Props) {
    const conditions = [
        { value: 'type1_diabetes', label: 'Type 1 Diabetes', icon: '💉' },
        { value: 'type2_diabetes', label: 'Type 2 Diabetes', icon: '🩺' },
        { value: 'prediabetes', label: 'Prediabetes', icon: '⚕️' },
        { value: 'hypertension', label: 'High Blood Pressure', icon: '❤️' },
        { value: 'high_cholesterol', label: 'High Cholesterol', icon: '🫀' },
        { value: 'heart_disease', label: 'Heart Disease', icon: '💔' },
        { value: 'ibs', label: 'IBS', icon: '🔬' },
        { value: 'gerd', label: 'GERD/Acid Reflux', icon: '🔥' },
        { value: 'celiac_disease', label: 'Celiac Disease', icon: '🌾' },
        { value: 'obesity', label: 'Obesity', icon: '⚖️' },
        { value: 'pcos', label: 'PCOS', icon: '🩺' },
        { value: 'kidney_disease', label: 'Kidney Disease', icon: '🫘' },
        { value: 'gout', label: 'Gout', icon: '🦴' },
    ];

    const allergies = [
        { value: 'nuts', label: 'Nuts', icon: '🥜' },
        { value: 'dairy', label: 'Dairy', icon: '🥛' },
        { value: 'gluten', label: 'Gluten', icon: '🌾' },
        { value: 'shellfish', label: 'Shellfish', icon: '🦐' },
        { value: 'soy', label: 'Soy', icon: '🫘' },
        { value: 'eggs', label: 'Eggs', icon: '🥚' },
    ];

    const goals = [
        { value: 'lose_weight', label: 'Lose Weight', icon: '⬇️' },
        { value: 'maintain_weight', label: 'Maintain Weight', icon: '⚖️' },
        { value: 'gain_weight', label: 'Gain Weight', icon: '⬆️' },
        { value: 'build_muscle', label: 'Build Muscle', icon: '💪' },
        { value: 'control_blood_sugar', label: 'Control Blood Sugar', icon: '🩸' },
        { value: 'lower_cholesterol', label: 'Lower Cholesterol', icon: '📉' },
        { value: 'reduce_sodium', label: 'Reduce Sodium', icon: '🧂' },
        { value: 'general_wellness', label: 'General Wellness', icon: '✨' },
        { value: 'healthy_family_eating', label: 'Healthy Family Eating', icon: '👨‍👩‍👧‍👦' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
        >
            {/* Physical Profile */}
            <div className="bg-gradient-to-br from-[#F3F0FD] to-white rounded-2xl p-6 shadow-lg border border-[#7661d3]/20">
                <h3 className="text-2xl font-bold mb-6 flex items-center text-[#3d326d]">
                    <div className="bg-gradient-to-br from-[#7661d3] to-[#3d326d] p-3 rounded-xl mr-3 shadow-md">
                        <Activity className="text-white w-6 h-6" />
                    </div>
                    Physical Profile & Activity
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                    <div>
                        <Label htmlFor="height" className="text-[#3d326d] font-semibold mb-2 block">
                            Height (inches)
                        </Label>
                        <Input
                            id="height"
                            type="number"
                            placeholder="68"
                            min="36"
                            max="96"
                            {...form.register("height")}
                            data-testid="input-height"
                            className="h-12 border-2 border-[#7661d3]/30 focus:border-[#7661d3] rounded-xl"
                        />
                    </div>
                    <div>
                        <Label htmlFor="weight" className="text-[#3d326d] font-semibold mb-2 block">
                            Weight (lbs)
                        </Label>
                        <Input
                            id="weight"
                            type="number"
                            placeholder="150"
                            min="50"
                            max="500"
                            {...form.register("weight")}
                            data-testid="input-weight"
                            className="h-12 border-2 border-[#7661d3]/30 focus:border-[#7661d3] rounded-xl"
                        />
                    </div>
                    <div>
                        <Label className="text-[#3d326d] font-semibold mb-2 block">
                            Activity Level <span className="text-[#7dab4f]">*</span>
                        </Label>
                        <Select onValueChange={(value) => form.setValue("activityLevel", value as any)}>
                            <SelectTrigger data-testid="select-activity-level" className="h-12 border-2 border-[#7661d3]/30 focus:border-[#7661d3] rounded-xl bg-white">
                                <SelectValue placeholder="Select activity level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sedentary">🪑 Sedentary (desk job, little exercise)</SelectItem>
                                <SelectItem value="moderate">🚶 Moderate (some exercise)</SelectItem>
                                <SelectItem value="active">🏃 Active (regular exercise)</SelectItem>
                                <SelectItem value="very_active">🏋️ Very Active (intense exercise)</SelectItem>
                            </SelectContent>
                        </Select>
                        {form.formState.errors.activityLevel && (
                            <p className="text-sm text-red-500 mt-1">{String(form.formState.errors.activityLevel.message)}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Health Conditions & Goals */}
            <div className="bg-gradient-to-br from-[#E8F5E0] to-white rounded-2xl p-6 shadow-lg border border-[#7dab4f]/20">
                <h3 className="text-2xl font-bold mb-6 flex items-center text-[#3d326d]">
                    <div className="bg-gradient-to-br from-[#7dab4f] to-[#9bc76d] p-3 rounded-xl mr-3 shadow-md">
                        <Stethoscope className="text-white w-6 h-6" />
                    </div>
                    Health Conditions & Goals
                </h3>

                {/* Medical Conditions */}
                <div className="mb-6">
                    <Label className="mb-3 block text-[#3d326d] font-semibold">Medical Conditions (Select all that apply)</Label>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {conditions.map((condition) => (
                            <label
                                key={condition.value}
                                className="flex items-center space-x-3 p-4 border-2 border-[#7661d3]/20 rounded-xl hover:bg-[#F3F0FD] cursor-pointer transition-all duration-300 hover:border-[#7661d3] hover:shadow-md group"
                            >
                                <Checkbox
                                    checked={form.watch('conditions')?.includes(condition.value)}
                                    onCheckedChange={() => handleArrayToggle('conditions', condition.value)}
                                    data-testid={`checkbox-condition-${condition.value}`}
                                    className="border-[#7661d3]"
                                />
                                <span className="text-xl mr-2">{condition.icon}</span>
                                <span className="text-sm font-medium text-[#3d326d] group-hover:text-[#7661d3]">{condition.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Food Allergies */}
                <div className="mb-6">
                    <Label className="mb-3 block text-[#3d326d] font-semibold">Food Allergies & Intolerances</Label>
                    <div className="grid md:grid-cols-3 gap-3">
                        {allergies.map((allergy) => (
                            <label
                                key={allergy.value}
                                className="flex items-center space-x-3 p-4 border-2 border-[#7dab4f]/20 rounded-xl hover:bg-[#E8F5E0] cursor-pointer transition-all duration-300 hover:border-[#7dab4f] hover:shadow-md group"
                            >
                                <Checkbox
                                    checked={form.watch('allergies')?.includes(allergy.value)}
                                    onCheckedChange={() => handleArrayToggle('allergies', allergy.value)}
                                    data-testid={`checkbox-allergy-${allergy.value}`}
                                    className="border-[#7dab4f]"
                                />
                                <span className="text-xl mr-2">{allergy.icon}</span>
                                <span className="text-sm font-medium text-[#3d326d] group-hover:text-[#7dab4f]">{allergy.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Health Goals */}
                <div>
                    <Label className="mb-3 block text-[#3d326d] font-semibold flex items-center">
                        <Heart className="w-5 h-5 mr-2 text-[#7dab4f]" />
                        Health & Nutrition Goals
                    </Label>
                    <div className="grid md:grid-cols-2 gap-3">
                        {goals.map((goal) => (
                            <label
                                key={goal.value}
                                className="flex items-center space-x-3 p-4 border-2 border-[#7661d3]/20 rounded-xl hover:bg-gradient-to-r hover:from-[#F3F0FD] hover:to-[#E8F5E0] cursor-pointer transition-all duration-300 hover:border-[#7661d3] hover:shadow-md group"
                            >
                                <Checkbox
                                    checked={form.watch('goals')?.includes(goal.value)}
                                    onCheckedChange={() => handleArrayToggle('goals', goal.value)}
                                    data-testid={`checkbox-goal-${goal.value}`}
                                    className="border-[#7661d3]"
                                />
                                <span className="text-xl mr-2">{goal.icon}</span>
                                <span className="text-sm font-medium text-[#3d326d] group-hover:text-[#7661d3]">{goal.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

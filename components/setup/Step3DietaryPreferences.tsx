"use client";

import { motion } from "framer-motion";
import { Apple, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";

interface Step3Props {
    form: UseFormReturn<any>;
    handleArrayToggle: (field: any, value: string) => void;
}

export default function Step3DietaryPreferences({
    form,
    handleArrayToggle,
}: Step3Props) {
    const dietaryRestrictions = [
        { value: "vegan", label: "Vegan", icon: "🌱" },
        { value: "vegetarian", label: "Vegetarian", icon: "🥗" },
        { value: "keto", label: "Ketogenic", icon: "🥑" },
        { value: "paleo", label: "Paleo", icon: "🍖" },
        { value: "mediterranean", label: "Mediterranean", icon: "🫒" },
        { value: "low_carb", label: "Low-Carb", icon: "🥦" },
        { value: "dash", label: "DASH Diet", icon: "💚" },
        { value: "halal", label: "Halal", icon: "☪️" },
        { value: "kosher", label: "Kosher", icon: "✡️" },
    ];

    const cuisines = [
        { value: "Italian", icon: "🍝" },
        { value: "Mexican", icon: "🌮" },
        { value: "Chinese", icon: "🥡" },
        { value: "Indian", icon: "🍛" },
        { value: "Thai", icon: "🍜" },
        { value: "Japanese", icon: "🍱" },
        { value: "Mediterranean", icon: "🫒" },
        { value: "American", icon: "🍔" },
        { value: "French", icon: "🥐" },
        { value: "Korean", icon: "🍲" },
        { value: "Vietnamese", icon: "🥢" },
        { value: "Middle Eastern", icon: "🧆" },
        { value: "Ethiopian", icon: "🫓" },
        { value: "Caribbean", icon: "🏝️" },
        { value: "Greek", icon: "🥙" },
        { value: "Spanish", icon: "🥘" },
    ];

    const organicOptions = [
        {
            value: "standard_only",
            label: "Only Standard Food",
            description: "Choose conventional food options only",
            icon: "🛒",
            gradient: "from-[#7661d3] to-[#3d326d]",
        },
        {
            value: "prefer_when_budget_allows",
            label: "Prefer Organic Foods",
            description: "When budget allows, prioritize organic options",
            icon: "🌿",
            gradient: "from-[#7dab4f] to-[#9bc76d]",
        },
        {
            value: "organic_only",
            label: "Organic Food Only",
            description: "Purchase only certified organic food products",
            icon: "🌱",
            gradient: "from-[#9bc76d] to-[#7dab4f]",
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
        >
            {/* Dietary Restrictions */}
            <div className="bg-white border-2 border-[#7661d3]/20 shadow-2xl p-6 rounded-2xl  shadow-lg border border-[#7661d3]/20">
                <h3 className="text-2xl font-bold mb-6 flex items-center text-[#3d326d]">
                    <div className="bg-gradient-to-br from-[#7661d3] to-[#3d326d] p-3 rounded-xl mr-3 shadow-md">
                        <Apple className="text-white w-6 h-6" />
                    </div>
                    Dietary Preferences & Restrictions
                </h3>

                <div className="mb-6">
                    <Label className="mb-3 block text-[#3d326d] font-semibold">
                        Dietary Restrictions & Lifestyle
                    </Label>
                    <div className="grid md:grid-cols-3 gap-3">
                        {dietaryRestrictions.map((diet) => (
                            <label
                                key={diet.value}
                                className="flex items-center space-x-3 p-4 border-2 border-[#7661d3]/20 rounded-xl hover:bg-[#F3F0FD] cursor-pointer transition-all duration-300 hover:border-[#7661d3] hover:shadow-md group"
                            >
                                <Checkbox
                                    checked={form
                                        .watch("dietaryRestrictions")
                                        ?.includes(diet.value)}
                                    onCheckedChange={() =>
                                        handleArrayToggle("dietaryRestrictions", diet.value)
                                    }
                                    data-testid={`checkbox-diet-${diet.value}`}
                                    className="border-[#7661d3]"
                                />
                                <span className="text-xl mr-2">{diet.icon}</span>
                                <span className="text-sm font-medium text-[#3d326d] group-hover:text-[#7661d3]">
                                    {diet.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Preferred Cuisines */}
                <div>
                    <Label className="mb-3 block text-[#3d326d] font-semibold flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-[#7dab4f]" />
                        Preferred Cuisines (Select your favorites)
                    </Label>
                    <div className="grid md:grid-cols-4 gap-3">
                        {cuisines.map((cuisine) => (
                            <label
                                key={cuisine.value}
                                className="flex items-center space-x-3 p-4 border-2 border-[#7dab4f]/20 rounded-xl hover:bg-[#E8F5E0] cursor-pointer transition-all duration-300 hover:border-[#7dab4f] hover:shadow-md group"
                            >
                                <Checkbox
                                    checked={form
                                        .watch("preferredCuisines")
                                        ?.includes(cuisine.value)}
                                    onCheckedChange={() =>
                                        handleArrayToggle("preferredCuisines", cuisine.value)
                                    }
                                    data-testid={`checkbox-cuisine-${cuisine.value.toLowerCase()}`}
                                    className="border-[#7dab4f]"
                                />
                                <span className="text-xl mr-2">{cuisine.icon}</span>
                                <span className="text-sm font-medium text-[#3d326d] group-hover:text-[#7dab4f]">
                                    {cuisine.value}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Organic Preference */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <Label className="mb-4 block text-base font-semibold text-gray-800">
                    Organic Food Preference
                </Label>

                <div className="space-y-2">
                    {organicOptions.map((option) => {
                        const isSelected =
                            form.watch("organicPreference") === option.value;

                        return (
                            <label
                                key={option.value}
                                className={`
            flex items-start gap-3 p-3 rounded-lg border cursor-pointer
            transition-colors
            ${isSelected
                                        ? "border-[var(--green)] bg-[var(--green)]/5"
                                        : "border-gray-200 hover:bg-gray-50"
                                    }
          `}
                            >
                                {/* Radio */}
                                <input
                                    type="radio"
                                    name="organicPreference"
                                    value={option.value}
                                    checked={isSelected}
                                    onChange={() =>
                                        form.setValue("organicPreference", option.value as any)
                                    }
                                    className="mt-1 h-4 w-4 accent-[var(--green)]"
                                />

                                {/* Text */}
                                <div className="flex-1">
                                    <p
                                        className={`text-sm font-semibold ${isSelected ? "text-[var(--green)]" : "text-gray-800"
                                            }`}
                                    >
                                        {option.label}
                                    </p>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        {option.description}
                                    </p>
                                </div>
                            </label>
                        );
                    })}
                </div>
            </div>

        </motion.div>
    );
}

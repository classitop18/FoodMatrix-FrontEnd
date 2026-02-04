"use client";

import React from "react";
import { Activity, Users, MoveRight, HelpCircle, Heart, AlertTriangle, Utensils, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { HealthStats } from "./types";

interface HealthProfileSectionProps {
    healthStats: HealthStats;
    considerHealthProfile: boolean;
    setConsiderHealthProfile: (val: boolean) => void;
    participants: any[];
    selectedHealthMembers: string[];
    setSelectedHealthMembers: React.Dispatch<React.SetStateAction<string[]>>;
    onContinue: () => void;
}

export const HealthProfileSection: React.FC<HealthProfileSectionProps> = ({
    healthStats,
    considerHealthProfile,
    setConsiderHealthProfile,
    participants,
    selectedHealthMembers,
    setSelectedHealthMembers,
    onContinue
}) => {
    const hasAnyRestrictions =
        Object.keys(healthStats.dietaryRestrictions).length > 0 ||
        Object.keys(healthStats.allergies).length > 0 ||
        Object.keys(healthStats.healthConditions).length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Health Profile Card */}
            <Card className="rounded-2xl border border-gray-200 shadow-sm bg-white overflow-hidden">
                <CardHeader className="pb-4 border-b border-gray-50 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm">
                            <Heart className="w-5 h-5 text-pink-600" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <CardTitle className="text-xl font-bold text-gray-900">
                                    Health Profile Analysis
                                </CardTitle>
                                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-bold rounded-lg px-2.5 py-0.5">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    AI-Powered
                                </Badge>
                            </div>
                            <CardDescription className="mt-1">
                                AI will generate recipes compatible with your guests&apos; dietary needs and health conditions
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-gray-600 border-gray-200 bg-white font-semibold">
                            <Users className="w-3.5 h-3.5 mr-1.5" />
                            {participants.length} participants
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="pt-6 px-6">
                    {/* Toggle Section */}
                    <div className="flex items-center justify-between mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-100">
                        <div className="flex items-center gap-4">
                            <Switch
                                checked={considerHealthProfile}
                                onCheckedChange={setConsiderHealthProfile}
                                id="consider-health"
                                className="data-[state=checked]:bg-indigo-600"
                            />
                            <div>
                                <Label
                                    htmlFor="consider-health"
                                    className="text-sm font-bold text-gray-900 cursor-pointer block"
                                >
                                    Smart Health Optimization
                                </Label>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Generate recipes that respect all dietary restrictions and health conditions
                                </p>
                            </div>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-indigo-600">
                                        <HelpCircle className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p>When enabled, AI will avoid allergens, respect dietary restrictions, and consider health conditions when generating recipes.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {considerHealthProfile && (
                        <div className="space-y-8">
                            {/* Health Stats Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Allergies */}
                                <div className="p-5 bg-red-50/50 rounded-xl border border-red-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertTriangle className="w-5 h-5 text-red-600" />
                                        <h4 className="font-bold text-gray-900">Allergies</h4>
                                    </div>
                                    {Object.keys(healthStats.allergies).length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(healthStats.allergies).map(([allergy, count]) => (
                                                <Badge
                                                    key={allergy}
                                                    className="bg-red-100 text-red-700 border-red-200 font-medium"
                                                >
                                                    {allergy} ({count})
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No allergies reported</p>
                                    )}
                                </div>

                                {/* Dietary Restrictions */}
                                <div className="p-5 bg-amber-50/50 rounded-xl border border-amber-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Utensils className="w-5 h-5 text-amber-600" />
                                        <h4 className="font-bold text-gray-900">Dietary</h4>
                                    </div>
                                    {Object.keys(healthStats.dietaryRestrictions).length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(healthStats.dietaryRestrictions).map(([restriction, count]) => (
                                                <Badge
                                                    key={restriction}
                                                    className="bg-amber-100 text-amber-700 border-amber-200 font-medium capitalize"
                                                >
                                                    {restriction} ({count})
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No restrictions</p>
                                    )}
                                </div>

                                {/* Health Conditions */}
                                <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Activity className="w-5 h-5 text-blue-600" />
                                        <h4 className="font-bold text-gray-900">Conditions</h4>
                                    </div>
                                    {Object.keys(healthStats.healthConditions).length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(healthStats.healthConditions).map(([condition, count]) => (
                                                <Badge
                                                    key={condition}
                                                    className="bg-blue-100 text-blue-700 border-blue-200 font-medium capitalize"
                                                >
                                                    {condition} ({count})
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No conditions</p>
                                    )}
                                </div>
                            </div>

                            {/* AI Insight Box */}
                            {hasAnyRestrictions && (
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-5 text-white">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold mb-1">AI Health Protection Active</h4>
                                            <p className="text-sm text-white/80">
                                                Recipes will automatically exclude allergens and respect all dietary restrictions.
                                                {Object.keys(healthStats.allergies).length > 0 && (
                                                    <span className="block mt-1 font-medium text-white">
                                                        ⚠️ Zero tolerance for: {Object.keys(healthStats.allergies).join(", ")}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Participants Selection */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                        Select Participants to Consider
                                    </h4>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="text-indigo-600 h-auto p-0 text-xs font-semibold"
                                        onClick={() => {
                                            if (selectedHealthMembers.length === participants.length) {
                                                setSelectedHealthMembers([]);
                                            } else {
                                                setSelectedHealthMembers(participants.map(p => p.id));
                                            }
                                        }}
                                    >
                                        {selectedHealthMembers.length === participants.length ? "Deselect All" : "Select All"}
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {participants.map((p: any) => {
                                        const hasHealthData =
                                            (p.healthProfile?.allergies?.length > 0) ||
                                            (p.healthProfile?.dietaryRestrictions?.length > 0) ||
                                            (p.healthProfile?.healthConditions?.length > 0);

                                        return (
                                            <div
                                                key={p.id}
                                                className={cn(
                                                    "flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                                                    selectedHealthMembers.includes(p.id)
                                                        ? "bg-indigo-50/50 border-indigo-300 shadow-sm"
                                                        : "bg-white border-gray-100 hover:border-gray-200"
                                                )}
                                                onClick={() => {
                                                    setSelectedHealthMembers(prev =>
                                                        prev.includes(p.id)
                                                            ? prev.filter(id => id !== p.id)
                                                            : [...prev, p.id]
                                                    );
                                                }}
                                            >
                                                <Checkbox
                                                    id={p.id}
                                                    checked={selectedHealthMembers.includes(p.id)}
                                                    onCheckedChange={() => { }}
                                                    className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                                />
                                                <div className="flex-1">
                                                    <Label
                                                        htmlFor={p.id}
                                                        className="text-sm font-semibold text-gray-900 cursor-pointer block"
                                                    >
                                                        {p.name}
                                                    </Label>
                                                    {hasHealthData && (
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            Has health profile
                                                        </p>
                                                    )}
                                                </div>
                                                {hasHealthData && (
                                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                                        <Heart className="w-3 h-3 mr-1" />
                                                        Profile
                                                    </Badge>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {!considerHealthProfile && (
                        <div className="text-center py-8 text-gray-500">
                            <Utensils className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-sm">
                                Health optimization is disabled. Recipes will be generated for general consumption.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-end pt-4">
                <Button
                    onClick={onContinue}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 h-12 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02]"
                >
                    Continue to Budget
                    <MoveRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </motion.div>
    );
};

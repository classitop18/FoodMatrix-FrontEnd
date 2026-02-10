import React from "react";
import { Activity, Users, MoveRight, HelpCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { HealthStats } from "./types";
import { cn } from "@/lib/utils";

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
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 m-1"
        >
            {/* Health Profile Card */}
            <Card className="rounded-2xl border border-gray-200 shadow-sm bg-white overflow-hidden">
                <CardHeader className="pb-4 border-b border-gray-100 bg-[var(--primary-bg)] px-6 pt-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-[var(--primary)] text-white hover:bg-[#2d2454] font-bold rounded-md px-2.5 py-0.5">
                                    <Activity className="w-3.5 h-3.5 mr-1.5" /> Health Analysis
                                </Badge>
                                <Badge variant="outline" className="text-gray-600 border-gray-200 bg-white font-medium">
                                    <Users className="w-3.5 h-3.5 mr-1.5" /> {healthStats.totalMembers} participants
                                </Badge>
                            </div>
                            <CardTitle className="text-xl font-bold text-[#313131] mt-2">Health Profile Insights</CardTitle>
                            <CardDescription className="text-gray-500">
                                AI will generate recipes compatible with your guests' dietary needs
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 px-6 pb-6">
                    <div className="flex items-center justify-between mb-8 bg-[var(--primary-bg)] p-4 rounded-xl border border-[var(--primary-light)]/20">
                        <div className="flex items-center gap-3">
                            <Switch
                                checked={considerHealthProfile}
                                onCheckedChange={setConsiderHealthProfile}
                                id="consider-health"
                                className="data-[state=checked]:bg-[var(--primary)]"
                            />
                            <div>
                                <Label htmlFor="consider-health" className="text-sm font-bold text-[#313131] cursor-pointer block">
                                    Smart Health Optimization
                                </Label>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Adjust recipes based on participants' health data
                                </p>
                            </div>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[var(--primary)]">
                                        <HelpCircle className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-[#313131] text-white border-none">
                                    <p>When enabled, AI filters recipes to match dietary restrictions.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {considerHealthProfile && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                            {/* LEFT COLUMN: Member Selection (7 cols) */}
                            <div className="lg:col-span-7 space-y-6 pt-2 lg:pt-0 lg:pr-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-base font-bold text-[#313131]">Select Participants</h4>
                                        <p className="text-xs text-gray-500 mt-1">Choose who will be attending this meal</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-[var(--primary)] hover:text-[#2d2454] hover:bg-[var(--primary-bg)] font-semibold text-xs h-8 px-3 rounded-lg border border-transparent hover:border-[var(--primary-light)]/20"
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

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {participants.map((p: any) => {
                                        const isSelected = selectedHealthMembers.includes(p.id);
                                        return (
                                            <div
                                                key={p.id}
                                                onClick={() => {
                                                    setSelectedHealthMembers(prev =>
                                                        prev.includes(p.id)
                                                            ? prev.filter(id => id !== p.id)
                                                            : [...prev, p.id]
                                                    );
                                                }}
                                                className={cn(
                                                    "flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all border group relative overflow-hidden",
                                                    isSelected
                                                        ? "bg-[var(--primary-bg)] border-[var(--primary)] shadow-sm"
                                                        : "bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm"
                                                )}
                                            >
                                                {/* Selection Indicator Bar */}
                                                {isSelected && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary)] h-full"></div>
                                                )}

                                                <Checkbox
                                                    id={p.id}
                                                    checked={isSelected}
                                                    className={cn(
                                                        "data-[state=checked]:bg-[var(--primary)] data-[state=checked]:border-[var(--primary)] ml-2"
                                                    )}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <Label
                                                        htmlFor={p.id}
                                                        className={cn(
                                                            "text-sm font-semibold cursor-pointer block truncate transition-colors",
                                                            isSelected ? "text-[var(--primary)]" : "text-[#313131]"
                                                        )}
                                                    >
                                                        {p.name}
                                                    </Label>
                                                    {/* Optional subtitle (could add role or details here if available) */}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Health Insights (5 cols) */}
                            <div className="lg:col-span-5 pt-6 lg:pt-0 lg:pl-6">
                                <div className="bg-gray-50/50 rounded-2xl border border-gray-200 p-5 h-full flex flex-col relative overflow-hidden">
                                    {/* Header */}
                                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200/60 w-full relative z-10">
                                        <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                                            <Activity className="w-4 h-4 text-[var(--primary)]" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-[#313131] uppercase tracking-wider">Dietary Insights</h4>
                                            <p className="text-[10px] text-gray-500 font-medium">Based on selected members</p>
                                        </div>
                                    </div>

                                    {/* Scrollable Content */}
                                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 max-h-[320px] relative z-10">
                                        {(() => {
                                            const allStats = [
                                                ...Object.entries(healthStats.dietaryRestrictions).map(([k, v]) => ({ label: k, count: v, type: 'Restriction', color: 'text-blue-600 bg-blue-50 border-blue-100' })),
                                                ...Object.entries(healthStats.allergies).map(([k, v]) => ({ label: k, count: v, type: 'Allergy', color: 'text-red-600 bg-red-50 border-red-100' })),
                                                ...Object.entries(healthStats.healthConditions).map(([k, v]) => ({ label: k, count: v, type: 'Condition', color: 'text-amber-600 bg-amber-50 border-amber-100' }))
                                            ];

                                            if (allStats.length === 0) {
                                                return (
                                                    <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                                                        <div className="p-4 bg-white rounded-full mb-3 shadow-sm border border-gray-100 animate-in zoom-in duration-300">
                                                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                                                        </div>
                                                        <h5 className="text-sm font-bold text-gray-900">All Clear!</h5>
                                                        <p className="text-xs text-gray-500 mt-1 max-w-[200px] leading-relaxed">
                                                            No specific dietary restrictions found for the selected group.
                                                        </p>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div className="space-y-3 pb-2">
                                                    {allStats.map((stat, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between group hover:border-gray-300 transition-all hover:shadow-md"
                                                        >
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                {/* Colored Indicator */}
                                                                <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0 ml-1", stat.type === 'Restriction' ? 'bg-blue-500' : stat.type === 'Allergy' ? 'bg-red-500' : 'bg-amber-500')}></div>

                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-bold text-[#313131] truncate leading-tight" title={stat.label}>{stat.label}</p>
                                                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider text-left mt-0.5">{stat.type}</p>
                                                                </div>
                                                            </div>
                                                            <Badge variant="secondary" className={cn("font-bold text-xs ml-3 px-2 py-0.5 border flex-shrink-0 min-w-[30px] justify-center", stat.color)}>
                                                                {stat.count}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Background decoration */}
                                    {selectedHealthMembers.length > 0 && (
                                        <div className="absolute top-0 right-0 p-20 bg-gradient-to-bl from-[var(--primary-light)]/5 to-transparent rounded-bl-full -z-0 pointer-events-none opacity-50"></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-end pt-4">
                <Button
                    onClick={onContinue}
                    className="bg-[var(--primary)] hover:bg-[#2d2454] text-white px-8 h-12 rounded-xl font-bold shadow-lg transition-all hover:scale-[1.02]"
                >
                    Continue to Budget
                    <MoveRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </motion.div>
    );
};

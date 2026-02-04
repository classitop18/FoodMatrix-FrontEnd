import React from "react";
import { Activity, Users, MoveRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
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
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 m-1"
        >
            {/* Health Profile Card */}
            <Card className="rounded-2xl border border-gray-200 shadow-sm bg-white overflow-hidden p-5">
                <CardHeader className="pb-4 border-b border-gray-50 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-bold rounded-md px-2.5 py-0.5">
                                    <Activity className="w-3.5 h-3.5 mr-1.5" /> Health Analysis
                                </Badge>
                                <Badge variant="outline" className="text-gray-500 border-gray-200 bg-white">
                                    <Users className="w-3.5 h-3.5 mr-1.5" /> {healthStats.totalMembers} participants
                                </Badge>
                            </div>
                            <CardTitle className="text-xl font-bold text-gray-900 mt-2">Health Profile Insights</CardTitle>
                            <CardDescription>
                                AI will generate recipes compatible with your guests’ dietary needs
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-8 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                        <div className="flex items-center gap-3">
                            <Switch
                                checked={considerHealthProfile}
                                onCheckedChange={setConsiderHealthProfile}
                                id="consider-health"
                                className="data-[state=checked]:bg-indigo-600"
                            />
                            <div>
                                <Label htmlFor="consider-health" className="text-sm font-semibold text-gray-900 cursor-pointer block">
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
                                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-indigo-600">
                                        <HelpCircle className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>When enabled, AI filters recipes to match dietary restrictions.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {considerHealthProfile && (
                        <div className="space-y-8">
                            {/* Health Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {Object.entries(healthStats.dietaryRestrictions).length > 0 ? (
                                    Object.entries(healthStats.dietaryRestrictions).slice(0, 3).map(([restriction, count]) => (
                                        <div key={restriction} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700 capitalize">{restriction}</span>
                                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 font-semibold">
                                                    {count} guests
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-4 text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                        No specific dietary restrictions found among selected participants.
                                    </div>
                                )}
                            </div>

                            {/* Participants Selection */}
                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-bold text-gray-900">Included Participants</h4>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="text-indigo-600 h-auto p-0 text-xs"
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
                                    {participants.map((p: any) => (
                                        <div
                                            key={p.id}
                                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${selectedHealthMembers.includes(p.id)
                                                ? "bg-indigo-50 border-indigo-200"
                                                : "bg-white border-gray-100 hover:border-gray-200"
                                                }`}
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
                                                className="data-[state=checked]:bg-indigo-600 border-gray-300"
                                            />
                                            <Label htmlFor={p.id} className="text-sm font-medium text-gray-700 cursor-pointer flex-1 user-select-none">
                                                {p.name}
                                            </Label>
                                        </div>
                                    ))}
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
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02]"
                >
                    Continue to Budget
                    <MoveRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </motion.div>
    );
};

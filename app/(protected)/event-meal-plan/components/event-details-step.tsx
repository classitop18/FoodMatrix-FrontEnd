"use client";

import React, { memo, useCallback } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, AlignLeft, Type } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { OCCASION_OPTIONS } from "../constants/event.constants";
import type { EventDetailsStepProps } from "../types/event.types";

const EventDetailsStepComponent: React.FC<EventDetailsStepProps> = ({ formData, onUpdate }) => {
    const handleNameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onUpdate("name", e.target.value);
        },
        [onUpdate]
    );

    const handleDescriptionChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            onUpdate("description", e.target.value);
        },
        [onUpdate]
    );

    const handleTimeChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onUpdate("eventTime", e.target.value);
        },
        [onUpdate]
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">Event Details</h2>
                <p className="text-gray-500 font-medium">Tell us about your special occasion to get started.</p>
            </div>

            {/* Event Name */}
            <div className="space-y-3">
                <Label htmlFor="eventName" className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Type className="w-3 h-3" />
                    Event Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="eventName"
                    placeholder="e.g., Rahul's Birthday Party"
                    value={formData.name}
                    onChange={handleNameChange}
                    className="h-14 text-lg px-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-300"
                />
            </div>

            {/* Occasion Type */}
            <div className="space-y-3">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    Occasion Type <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {OCCASION_OPTIONS.map((occasion) => (
                        <button
                            key={occasion.value}
                            type="button"
                            onClick={() => onUpdate("occasionType", occasion.value)}
                            className={cn(
                                "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden group",
                                formData.occasionType === occasion.value
                                    ? "border-indigo-600 bg-indigo-50 shadow-md"
                                    : "border-gray-100 bg-white hover:border-indigo-200"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300",
                                formData.occasionType === occasion.value
                                    ? "bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-200"
                                    : "bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                            )}>
                                <occasion.icon className="w-6 h-6" />
                            </div>
                            <span className={cn(
                                "text-sm font-bold transition-colors",
                                formData.occasionType === occasion.value
                                    ? "text-indigo-700"
                                    : "text-gray-600 group-hover:text-indigo-600"
                            )}>
                                {occasion.label}
                            </span>

                            {formData.occasionType === occasion.value && (
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Event Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <CalendarIcon className="w-3 h-3" />
                        Event Date <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full h-14 justify-start text-left font-medium rounded-xl border-2 border-gray-200 hover:border-indigo-500/30 hover:bg-gray-50",
                                    !formData.eventDate && "text-gray-400"
                                )}
                            >
                                <CalendarIcon className={cn("mr-3 h-5 w-5", formData.eventDate ? "text-indigo-600" : "text-gray-400")} />
                                {formData.eventDate ? (
                                    <span className="text-gray-900 font-semibold">{format(formData.eventDate, "PPP")}</span>
                                ) : (
                                    "Pick a date"
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-2xl border border-gray-100 shadow-2xl" align="start">
                            <div className="bg-white rounded-xl shadow-xl  z-50">
                                <Calendar
                                    mode="single"
                                    selected={formData.eventDate}
                                    onSelect={(date) => onUpdate("eventDate", date)}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                />
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-3">
                    <Label htmlFor="eventTime" className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        Event Time
                    </Label>
                    <div className="relative group">
                        <Input
                            id="eventTime"
                            type="time"
                            value={formData.eventTime}
                            onChange={handleTimeChange}
                            className="h-14 pl-12 rounded-xl border-2 border-gray-200 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 text-gray-900 font-semibold cursor-pointer"
                        />
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
                <Label htmlFor="description" className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <AlignLeft className="w-3 h-3" />
                    Description
                </Label>
                <Textarea
                    id="description"
                    placeholder="Add any specific notes about the event, theme, or preferences..."
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    className="min-h-[120px] resize-none rounded-xl border-2 border-gray-200 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 p-4 text-base placeholder:text-gray-300"
                />
            </div>
        </div>
    );
};

export const EventDetailsStep = memo(EventDetailsStepComponent);

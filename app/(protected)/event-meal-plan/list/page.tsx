"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Plus,
    Calendar,
    ChefHat,
    Users,
    Wallet,
    Search,
    Filter,
    ArrowRight,
    Sparkles,
    Clock,
    PartyPopper,
    X,
    RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Redux
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store.redux";

// Hooks
import { useEvents, useEventStats } from "@/services/event/event.query";

// Constants
import {
    getOccasionOption,
    formatEventDate,
    formatCurrency,
} from "../constants/event.constants";
import { cn } from "@/lib/utils";

// Types
import { EventResponse, EventStatus } from "@/services/event/event.types";
import { useDebounce } from "@/hooks/useDebounce";

export default function EventsListPage() {
    const router = useRouter();
    const { activeAccountId } = useSelector((state: RootState) => state.account);

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");
    const [page, setPage] = useState(1);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // hooks
    const debouncedSearch = useDebounce(search, 500);

    // Fetch events
    const { data: eventsData, isLoading, refetch } = useEvents({
        accountId: activeAccountId || undefined,
        page,
        limit: 12,
        sortBy: "createdAt",
        sortOrder: "desc",
        search: debouncedSearch || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
    });

    const handleRefetch = async () => {
        setIsRefreshing(true);
        await refetch();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    const { data: stats } = useEventStats();

    const events = eventsData?.data || [];
    const pagination = eventsData?.pagination;

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { color: string; label: string }> = {
            draft: { color: "bg-gray-100 text-gray-600 border-gray-200", label: "Draft" },
            planned: { color: "bg-blue-50 text-blue-600 border-blue-200", label: "Planned" },
            in_progress: { color: "bg-amber-50 text-amber-600 border-amber-200", label: "In Progress" },
            completed: { color: "bg-emerald-50 text-emerald-600 border-emerald-200", label: "Completed" },
            cancelled: { color: "bg-red-50 text-red-600 border-red-200", label: "Cancelled" },
        };
        const config = statusConfig[status] || statusConfig.draft;
        return (
            <Badge className={cn("px-2.5 py-0.5 text-xs font-semibold shadow-sm border", config.color)}>
                {config.label}
            </Badge>
        );
    };

    // Check if date is upcoming (within next 7 days)
    const isUpcoming = (date: string) => {
        const eventDate = new Date(date);
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return eventDate >= now && eventDate <= weekFromNow;
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="h-[calc(100vh-57px)] bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00] relative overflow-auto">
            <div className="max-w-8xl mx-auto px-4 md:px-6 relative z-10 py-8">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-6 gap-6 animate-fade-in">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-[#7dab4f] font-bold text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1">
                                <PartyPopper size={12} className="fill-white" />
                                Event Planning
                            </span>
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#313131] tracking-tight">
                                Your Event Meal Plans
                            </h1>
                            <p className="text-sm text-gray-500 font-medium mt-1">
                                Manage and organize culinary experiences for your special occasions
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => router.push("/event-meal-plan/new")}
                            className="bg-[#313131] hover:bg-black text-white font-bold py-2.5 px-4 rounded-lg shadow-none transition-all flex items-center gap-2 text-sm h-auto"
                        >
                            <Plus size={18} />
                            Create New Event
                        </Button>
                    </div>
                </div>

                <div className="rounded-2xl overflow-hidden bg-white lg:p-6 p-4">
                    {/* Stats Cards */}
                    {stats && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
                        >
                            {[
                                {
                                    label: "Total Events",
                                    value: stats.totalEvents,
                                    icon: PartyPopper,
                                    color: "text-purple-600",
                                    bg: "bg-purple-50",
                                    border: "border-purple-100"
                                },
                                {
                                    label: "Upcoming",
                                    value: stats.upcomingEvents,
                                    icon: Calendar,
                                    color: "text-blue-600",
                                    bg: "bg-blue-50",
                                    border: "border-blue-100"
                                },
                                {
                                    label: "Total Spent",
                                    value: formatCurrency(stats.totalSpent),
                                    icon: Wallet,
                                    color: "text-emerald-600",
                                    bg: "bg-emerald-50",
                                    border: "border-emerald-100"
                                },
                                {
                                    label: "Completed",
                                    value: stats.completedEvents,
                                    icon: Sparkles,
                                    color: "text-amber-600",
                                    bg: "bg-amber-50",
                                    border: "border-amber-100"
                                }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white rounded-xl lg:p-6 p-4 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] relative overflow-hidden group border border-gray-200 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:border-[#7661d3]/20 transition-all">
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-500 font-bold text-xs uppercase tracking-wide mb-1">{stat.label}</p>
                                            <h3 className="text-3xl font-extrabold text-[#313131]">{stat.value}</h3>
                                        </div>
                                        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", stat.bg, stat.border)}>
                                            <stat.icon className={cn("w-6 h-6", stat.color)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {/* Filters */}
                    <div className="bg-white rounded-xl p-3 border border-gray-200 flex flex-col md:flex-row gap-2 mb-6 items-center">
                        <div className="relative flex-1 flex items-center">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by event name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-9 focus:ring-0 text-base font-medium placeholder:text-gray-400 border-none bg-gray-100 shadow-none"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="h-6 w-px bg-gray-200 hidden md:block" />

                        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                            <SelectTrigger className="w-[160px] h-9 border-none bg-gray-50 hover:bg-gray-100 rounded-lg font-bold text-gray-600 text-xs focus:ring-0 shadow-none !border-gray-200">
                                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-gray-200 shadow-xl">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="planned">Planned</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="h-6 w-px bg-gray-200 hidden md:block" />

                        <Button
                            variant="ghost"
                            onClick={handleRefetch}
                            className="h-auto px-4 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"
                            title="Refresh events"
                        >
                            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                        </Button>
                    </div>

                    {/* Events Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white h-72 rounded-xl border border-gray-100 p-6 animate-pulse" />
                            ))}
                        </div>
                    ) : events.length > 0 ? (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {events.map((event: EventResponse) => {
                                const occasionOption = getOccasionOption(event.occasionType);
                                const OccasionIcon = occasionOption?.icon || PartyPopper;
                                const upcoming = isUpcoming(event.eventDate);

                                return (
                                    <motion.div
                                        key={event.id}
                                        variants={itemVariants}
                                        onClick={() => router.push(`/event-meal-plan/${event.id}`)}
                                        className="group bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/20 transition-all duration-300 relative isolate"
                                    >
                                        {/* Occasion Decoration */}
                                        <div className={cn(
                                            "absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-100 transition-transform group-hover:scale-110 duration-500",
                                            occasionOption?.bgGradient || "bg-linear-to-br from-gray-200 to-gray-400"
                                        )} />

                                        <div className="p-6">
                                            {/* Header */}
                                            <div className="flex flex-wrap items-start justify-between mb-4 gap-4">
                                                <div className={cn(
                                                    "h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner",
                                                    occasionOption?.color ? `bg-${occasionOption.color.split('-')[1]}-50` : "bg-gray-50"
                                                )}>
                                                    <OccasionIcon className={cn("w-7 h-7", occasionOption?.color || "text-gray-500")} />
                                                </div>

                                                {/* Title */}
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1 gap-4 items-center flex justify-between">
                                                        {event.name} {getStatusBadge(event.status)}
                                                    </h3>
                                                    <p className="text-sm font-medium text-gray-500 capitalize">
                                                        {occasionOption?.label || event.occasionType}
                                                    </p>
                                                </div>

                                            </div>



                                            {/* Details Grid */}
                                            <div className="grid grid-cols-2 gap-3 mb-6">
                                                <div className="bg-gray-50 rounded-lg p-2.5">
                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                                        <Calendar className="w-3 h-3" />
                                                        Date
                                                    </div>
                                                    <div className="text-sm font-bold text-gray-700 pe-4">
                                                        {formatEventDate(new Date(event.eventDate))}
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-2.5">
                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                                        <Users className="w-3 h-3" />
                                                        Guests
                                                    </div>
                                                    <div className="text-sm font-bold text-gray-700">
                                                        {event.totalServings}
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-2.5">
                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                                        <ChefHat className="w-3 h-3" />
                                                        Meals
                                                    </div>
                                                    <div className="text-sm font-bold text-gray-700">
                                                        {event.meals?.length || 0}
                                                    </div>
                                                </div>
                                                {event.budgetAmount && (
                                                    <div className="bg-gray-50 rounded-lg p-2.5">
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                                            <Wallet className="w-3 h-3" />
                                                            Budget
                                                        </div>
                                                        <div className="text-sm font-bold text-gray-700">
                                                            {formatCurrency(event.budgetAmount)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Footer / CTA */}
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                {upcoming ? (
                                                    <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span className="text-xs font-bold">Upcoming</span>
                                                    </div>
                                                ) : (
                                                    <div />
                                                )}

                                                <div className="flex items-center gap-1 text-sm font-bold text-gray-600 group-hover:text-indigo-600 transition-all group-hover:translate-x-1">
                                                    View Details
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <div className="text-center py-20 px-4 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <PartyPopper className="w-10 h-10 text-[var(--primary)]" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Events Yet</h3>
                            <p className="text-gray-500 mb-8 font-medium leading-relaxed max-w-sm mx-auto">
                                Start planning your first event! Create memorable meals for birthdays,
                                anniversaries, festivals, and more.
                            </p>
                            <Button
                                size="lg"
                                onClick={() => router.push("/event-meal-plan/new")}
                                className="bg-[var(--primary)] hover:bg-indigo-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-indigo-200"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Plan Your First Event
                            </Button>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-12 bg-white inline-flex mx-auto p-2 rounded-xl shadow-sm border border-gray-200">
                            <Button
                                variant="ghost"
                                disabled={!pagination.hasPrev}
                                onClick={() => setPage((p) => p - 1)}
                                className="font-bold text-gray-600"
                            >
                                Previous
                            </Button>
                            <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md">
                                {pagination.page} / {pagination.totalPages}
                            </span>
                            <Button
                                variant="ghost"
                                disabled={!pagination.hasNext}
                                onClick={() => setPage((p) => p + 1)}
                                className="font-bold text-gray-600"
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

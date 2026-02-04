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
        sortBy: "eventDate",
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
        <div className="min-h-[calc(100vh-57px)] bg-[#FAFAFA] relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="max-w-8xl mx-auto py-8 px-4 lg:px-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
                            <PartyPopper size={12} className="fill-indigo-600 text-indigo-600" />
                            Event Planning
                        </div>
                        <h1 className="text-4xl font-extrabold text-[#1a1a1a] tracking-tight">
                            Your Event Meal Plans
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg font-medium max-w-2xl">
                            Manage and organize culinary experiences for your special occasions.
                        </p>
                    </div>

                    <Button
                        size="lg"
                        onClick={() => router.push("/event-meal-plan/new")}
                        className="bg-[#1a1a1a] hover:bg-black text-white h-12 px-6 rounded-xl font-bold shadow-lg shadow-black/5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Event
                    </Button>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
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
                            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center border", stat.bg, stat.border)}>
                                        <stat.icon className={cn("w-6 h-6", stat.color)} />
                                    </div>
                                    <h3 className="text-3xl font-extrabold text-gray-900">{stat.value}</h3>
                                </div>
                                <p className="text-sm font-semibold text-gray-500">{stat.label}</p>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 mb-8 flex flex-col md:flex-row gap-2 sticky top-4 z-20 backdrop-blur-xl bg-white/90 supports-[backdrop-filter]:bg-white/60">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search by event name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-10 h-11 border-transparent bg-transparent hover:bg-gray-50 focus:bg-white focus:border-indigo-500/20 rounded-xl transition-all"
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

                    <div className="h-px md:h-8 w-full md:w-px bg-gray-200 my-auto" />

                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                        <SelectTrigger className="w-full md:w-56 h-11 border-transparent bg-transparent hover:bg-gray-50 focus:border-transparent rounded-xl">
                            <Filter className="w-4 h-4 mr-2 text-gray-400" />
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border border-gray-100 shadow-xl">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="planned">Planned</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="h-px md:h-8 w-full md:w-px bg-gray-200 my-auto hidden md:block" />

                    <Button
                        variant="ghost"
                        onClick={handleRefetch}
                        className="h-11 px-4 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"
                        title="Refresh events"
                    >
                        <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                    </Button>
                </div>

                {/* Events Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white h-72 rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse" />
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
                                    className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/20 transition-all duration-300 relative isolate"
                                >
                                    {/* Occasion Decoration */}
                                    <div className={cn(
                                        "absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 transition-transform group-hover:scale-110 duration-500",
                                        occasionOption?.bgGradient || "bg-gradient-to-br from-gray-200 to-gray-400"
                                    )} />

                                    <div className="p-6">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={cn(
                                                "h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner",
                                                occasionOption?.color ? `bg-${occasionOption.color.split('-')[1]}-50` : "bg-gray-50"
                                            )}>
                                                <OccasionIcon className={cn("w-7 h-7", occasionOption?.color || "text-gray-500")} />
                                            </div>
                                            {getStatusBadge(event.status)}
                                        </div>

                                        {/* Title */}
                                        <div className="mb-4">
                                            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                                {event.name}
                                            </h3>
                                            <p className="text-sm font-medium text-gray-500 capitalize">
                                                {occasionOption?.label || event.occasionType}
                                            </p>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            <div className="bg-gray-50 rounded-lg p-2.5">
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Date
                                                </div>
                                                <div className="text-sm font-bold text-gray-700">
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
                            <PartyPopper className="w-10 h-10 text-indigo-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">No Events Yet</h3>
                        <p className="text-gray-500 mb-8 font-medium leading-relaxed max-w-sm mx-auto">
                            Start planning your first event! Create memorable meals for birthdays,
                            anniversaries, festivals, and more.
                        </p>
                        <Button
                            size="lg"
                            onClick={() => router.push("/event-meal-plan/new")}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-indigo-200"
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
    );
}

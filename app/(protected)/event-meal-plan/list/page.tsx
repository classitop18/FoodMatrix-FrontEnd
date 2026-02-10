"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Plus,
    Calendar,
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
    ChefHat,
    ChevronLeft,
    ChevronRight,
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
import { useDebounce } from "@/hooks/useDebounce";

// Constants
import {
    getOccasionOption,
    formatEventDate,
    formatCurrency,
} from "../constants/event.constants";
import { cn } from "@/lib/utils";

// Types
import { EventResponse, EventStatus } from "@/services/event/event.types";

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
        const statusConfig: Record<string, { className: string; label: string }> = {
            draft: { className: "bg-gray-100 text-gray-700 border-gray-200", label: "Draft" },
            planned: { className: "bg-blue-50 text-blue-700 border-blue-200", label: "Planned" },
            in_progress: { className: "bg-amber-50 text-amber-700 border-amber-200", label: "In Progress" },
            completed: { className: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Completed" },
            cancelled: { className: "bg-red-50 text-red-700 border-red-200", label: "Cancelled" },
        };
        const config = statusConfig[status] || statusConfig.draft;
        return (
            <Badge variant="outline" className={cn("px-2.5 py-0.5 text-xs font-medium border", config.className)}>
                {config.label}
            </Badge>
        );
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-[calc(100vh-57px)] bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Event Meal Plans
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage your events, menus, and shopping lists.
                        </p>
                    </div>
                    <Button
                        onClick={() => router.push("/event-meal-plan/new")}
                        className="bg-black hover:bg-gray-800 text-white font-medium px-5 h-10 rounded-lg shadow-sm transition-all flex items-center gap-2"
                    >
                        <Plus size={16} />
                        New Event
                    </Button>
                </div>

                {/* Stats Overview */}
                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            {
                                label: "Total Events",
                                value: stats.totalEvents,
                                icon: PartyPopper,
                                className: "text-purple-600 bg-purple-50",
                            },
                            {
                                label: "Upcoming",
                                value: stats.upcomingEvents,
                                icon: Calendar,
                                className: "text-blue-600 bg-blue-50",
                            },
                            {
                                label: "Total Budget",
                                value: formatCurrency(stats.totalSpent),
                                icon: Wallet,
                                className: "text-emerald-600 bg-emerald-50",
                            },
                            {
                                label: "Completed",
                                value: stats.completedEvents,
                                icon: ChefHat,
                                className: "text-amber-600 bg-amber-50",
                            },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                </div>
                                <div className={cn("p-3 rounded-lg", stat.className)}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filters & Actions */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
                    <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative flex-1 w-full md:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search events..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                                <SelectTrigger className="w-full md:w-[150px] h-10 bg-white border-gray-200 text-sm">
                                    <Filter className="w-3.5 h-3.5 mr-2 text-gray-500" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="planned">Planned</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant="outline"
                                onClick={handleRefetch}
                                className="h-10 px-3 border-gray-200 text-gray-500 hover:text-gray-900"
                            >
                                <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Events List */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-white h-24 rounded-xl border border-gray-200 animate-pulse" />
                        ))}
                    </div>
                ) : events.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-3"
                    >
                        {events.map((event: EventResponse) => {
                            const occasionOption = getOccasionOption(event.occasionType);
                            const OccasionIcon = occasionOption?.icon || PartyPopper;

                            return (
                                <motion.div
                                    key={event.id}
                                    variants={itemVariants}
                                    onClick={() => router.push(`/event-meal-plan/${event.id}`)}
                                    className="group bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
                                >
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                                        {/* Icon */}
                                        <div className="hidden sm:flex h-12 w-12 rounded-full bg-gray-50 items-center justify-center shrink-0 border border-gray-100 group-hover:bg-gray-100 transition-colors">
                                            <OccasionIcon className="w-5 h-5 text-gray-600" />
                                        </div>

                                        {/* Main Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                                                    {event.name}
                                                </h3>
                                                {getStatusBadge(event.status)}
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {formatEventDate(new Date(event.eventDate))}
                                                </span>
                                                <span className="hidden sm:inline w-1 h-1 bg-gray-300 rounded-full" />
                                                <span className="hidden sm:flex items-center gap-1.5">
                                                    <Users className="w-3.5 h-3.5" />
                                                    {event.totalServings} Guests
                                                </span>
                                                {event.budgetAmount && (
                                                    <>
                                                        <span className="hidden sm:inline w-1 h-1 bg-gray-300 rounded-full" />
                                                        <span className="hidden sm:flex items-center gap-1.5 font-medium text-gray-700">
                                                            {formatCurrency(event.budgetAmount)}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action / Arrow */}
                                        <div className="flex items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-gray-100">
                                            <div className="sm:hidden flex items-center justify-between w-full">
                                                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                                    <Users className="w-3.5 h-3.5" />
                                                    {event.totalServings} Guests
                                                </span>
                                                <span className="text-sm font-semibold text-gray-900">{event.budgetAmount ? formatCurrency(event.budgetAmount) : ""}</span>
                                            </div>

                                            <div className="hidden sm:flex h-8 w-8 rounded-full items-center justify-center text-gray-400 group-hover:text-gray-900 group-hover:bg-gray-50 transition-colors">
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <PartyPopper className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No Events Yet</h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                            Get started by creating your first event to manage recipes and shopping lists.
                        </p>
                        <Button
                            onClick={() => router.push("/event-meal-plan/new")}
                            className="bg-black hover:bg-gray-800 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Event
                        </Button>
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!pagination.hasPrev}
                            onClick={() => setPage((p) => p - 1)}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <div className="flex items-center gap-1 mx-2">
                            <span className="text-sm font-medium text-gray-700">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!pagination.hasNext}
                            onClick={() => setPage((p) => p + 1)}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

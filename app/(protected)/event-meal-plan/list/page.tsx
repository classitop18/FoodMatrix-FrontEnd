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
    PartyPopper,
    X,
    RefreshCw,
    ChefHat,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    CheckCircle2,
    Clock,
    TrendingUp,
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

    const getStatusConfig = (status: string) => {
        const statusConfig: Record<string, { className: string; label: string; icon?: any; color: string; bg: string }> = {
            draft: { className: "text-gray-600 bg-gray-100 border-gray-200", label: "Draft", icon: Clock, color: "#4b5563", bg: "bg-gray-50" },
            planned: { className: "text-[#7661d3] bg-[#F3F0FD] border-[#7661d3]/20", label: "Planned", icon: Calendar, color: "#7661d3", bg: "bg-[#F3F0FD]" },
            in_progress: { className: "text-amber-600 bg-amber-50 border-amber-200", label: "In Progress", icon: RefreshCw, color: "#d97706", bg: "bg-amber-50" },
            completed: { className: "text-[#7dab4f] bg-[#e8f5e0] border-[#7dab4f]/20", label: "Completed", icon: CheckCircle2, color: "#7dab4f", bg: "bg-[#e8f5e0]" },
            cancelled: { className: "text-red-600 bg-red-50 border-red-200", label: "Cancelled", icon: X, color: "#dc2626", bg: "bg-red-50" },
        };
        return statusConfig[status] || statusConfig.draft;
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
        visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
    };

    return (
        <div className="h-[calc(100vh-57px)] bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00] relative overflow-auto">
            <div className="max-w-8xl mx-auto px-4 md:px-6 relative z-10 py-8">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-8 gap-6 animate-fade-in">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-[#7661d3]/10 font-bold text-[#7661d3] text-[10px] uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1">
                                <Calendar size={12} />
                                Event Planning
                            </span>
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#313131] tracking-tight">
                                Event Meal Plans
                            </h1>
                            <p className="text-sm text-gray-500 font-medium mt-1">
                                Manage your upcoming events, guests, and menus efficiently
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleRefetch}
                            variant="outline"
                            className="bg-white hover:bg-gray-50 text-[#313131] font-bold py-2.5 px-4 rounded-xl shadow-sm border border-gray-200 transition-all flex items-center gap-2 text-sm h-auto"
                        >
                            <RefreshCw
                                size={18}
                                className={cn("text-[#7661d3]", isRefreshing && "animate-spin")}
                            />
                            Refresh
                        </Button>
                        <Button
                            onClick={() => router.push("/event-meal-plan/new")}
                            className="bg-[#313131] hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm h-auto"
                        >
                            <Plus size={18} />
                            Create New Event
                        </Button>
                    </div>
                </div>

                {/* Stats Row */}
                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 animate-slide-up">
                        {[
                            { label: "Total Events", value: stats.totalEvents, icon: Sparkles, color: "#7661d3", trend: "up" },
                            { label: "Upcoming", value: stats.upcomingEvents, icon: Calendar, color: "#7dab4f", trend: "up" },
                            { label: "Total Budget", value: formatCurrency(stats.totalSpent), icon: Wallet, color: "#f59e0b", trend: "stable" },
                            { label: "Completed", value: stats.completedEvents, icon: ChefHat, color: "#06b6d4", trend: "up" },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-xl lg:p-6 p-4 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] relative overflow-hidden group border border-gray-200 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:border-[#7661d3]/20 transition-all"
                            >
                                <div
                                    className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-125"
                                    style={{ background: `linear-gradient(135deg, ${stat.color}15 0%, transparent 100%)` }}
                                />
                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 font-bold text-xs uppercase tracking-wide mb-1">
                                            {stat.label}
                                        </p>
                                        <h3 className="text-3xl font-extrabold text-[#313131]">
                                            {stat.value}
                                        </h3>
                                    </div>
                                    <div
                                        className="h-12 w-12 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                                    >
                                        <stat.icon size={24} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Main Content Area */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters - Styled like a Card */}
                    <div className="w-full lg:w-72 flex-shrink-0 animate-scale-in">
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md sticky top-4">
                            <div className="flex items-center gap-2 mb-6">
                                <Filter size={18} className="text-[#7661d3]" />
                                <h3 className="text-lg font-bold text-[#313131]">Filters</h3>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search events..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-9 h-10 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#7661d3]/20 focus:border-[#7661d3] rounded-xl text-sm transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</label>
                                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                                        <SelectTrigger className="w-full h-10 bg-gray-50 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#7661d3]/20 focus:border-[#7661d3]">
                                            <SelectValue placeholder="All Statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Events</SelectItem>
                                            <SelectItem value="draft">Drafts</SelectItem>
                                            <SelectItem value="planned">Planned</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Filters</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {['all', 'planned', 'draft'].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setStatusFilter(tab as any)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize border",
                                                    statusFilter === tab
                                                        ? "bg-[#313131] text-white border-[#313131] shadow-sm"
                                                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                                )}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Events Grid */}
                    <div className="flex-1">
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white h-[240px] rounded-2xl border border-gray-200 animate-pulse shadow-sm" />
                                ))}
                            </div>
                        ) : events.length > 0 ? (
                            <div className="space-y-6">
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    {events.map((event: EventResponse) => {
                                        const occasionOption = getOccasionOption(event.occasionType);
                                        const OccasionIcon = occasionOption?.icon || PartyPopper;
                                        const statusConfig = getStatusConfig(event.status);

                                        return (
                                            <motion.div
                                                key={event.id}
                                                variants={itemVariants}
                                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                                onClick={() => router.push(`/event-meal-plan/${event.id}`)}
                                                className="group bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:border-[#7661d3]/20 transition-all cursor-pointer flex flex-col relative overflow-hidden min-h-[200px]"
                                            >
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#F3F0FD] to-transparent rounded-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-125" />

                                                <div className="relative z-10 w-full flex flex-col h-full">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all shadow-sm", "bg-white border border-gray-100 group-hover:border-[#7661d3]/20 group-hover:bg-[#F3F0FD]")}>
                                                                <OccasionIcon className="w-5 h-5 text-[#313131] group-hover:text-[#7661d3] transition-colors" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-sm font-extrabold text-[#313131] group-hover:text-[#7661d3] transition-colors line-clamp-1">
                                                                    {event.name}
                                                                </h3>
                                                                <div className="flex items-center gap-2 text-[10px] font-medium text-gray-500">
                                                                    <Calendar size={10} className="text-[#7661d3]" />
                                                                    {formatEventDate(new Date(event.eventDate))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Badge variant="secondary" className={cn("font-bold text-[9px] px-2 py-0.5 uppercase tracking-wider bg-white border shadow-sm", statusConfig.className)}>
                                                            {statusConfig.label}
                                                        </Badge>
                                                    </div>

                                                    <div className="mb-4 flex-1">
                                                        {event.description ? (
                                                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                                                {event.description}
                                                            </p>
                                                        ) : (
                                                            <p className="text-xs text-gray-400 italic line-clamp-2">
                                                                No description added for this event.
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-1.5" title="Guests">
                                                                <Users size={12} className="text-gray-400 group-hover:text-[#7661d3] transition-colors" />
                                                                <span className="text-xs font-bold text-[#313131]">{event.totalServings} <span className="text-gray-400 font-normal hidden sm:inline">Guests</span></span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5" title="Budget">
                                                                <Wallet size={12} className="text-gray-400 group-hover:text-[#7661d3] transition-colors" />
                                                                <span className="text-xs font-bold text-[#313131]">
                                                                    {event.budgetAmount ? formatCurrency(event.budgetAmount) : "NA"}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="h-6 w-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#313131] group-hover:text-white transition-all transform group-hover:translate-x-1">
                                                            <ArrowRight size={10} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>

                                {/* Pagination */}
                                {pagination && pagination.totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-4 mt-8 pb-8">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!pagination.hasPrev}
                                            onClick={() => setPage((p) => p - 1)}
                                            className="h-10 w-10 p-0 rounded-xl border-gray-200 hover:bg-gray-50 text-[#313131]"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </Button>
                                        <span className="text-sm font-bold text-gray-600">
                                            Page {pagination.page} of {pagination.totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!pagination.hasNext}
                                            onClick={() => setPage((p) => p + 1)}
                                            className="h-10 w-10 p-0 rounded-xl border-gray-200 hover:bg-gray-50 text-[#313131]"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300 shadow-sm">
                                <div className="w-20 h-20 bg-[#F3F0FD] rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Sparkles className="w-10 h-10 text-[#7661d3]" />
                                </div>
                                <h3 className="text-lg font-bold text-[#313131] mb-2">No Events Found</h3>
                                <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">
                                    It looks like you haven't created any events yet. Start planning your next gathering today!
                                </p>
                                <Button
                                    onClick={() => router.push("/event-meal-plan/new")}
                                    className="bg-[#313131] hover:bg-black text-white font-bold px-6 py-6 h-auto rounded-xl shadow-lg"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Create New Event
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

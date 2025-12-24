"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  Package,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Loader2,
  Bell,
  AlertTriangle,
  X,
  Clock,
  TrendingUp,
  Filter,
  RefreshCw,
  Crown,
  Settings,
  MapPin,
  List,
  Grid3x3,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import ConfirmDialog from "@/components/common/confirmation-dialog";
import AddToPantry from "@/components/pantry/add-pantry-modal";

// Import from services
import {
  usePantryQuery,
  usePantryAlertsQuery,
} from "@/services/pantry/pantry.query";
import {
  useDeletePantryMutation,
  useDismissAlertMutation,
} from "@/services/pantry/pantry.mutation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store.redux";

// Hero patterns (adjust paths as needed, assuming same location as account page)
import pattern1 from "@/public/hero-pattern-1.svg";
import pattern2 from "@/public/hero-pattern-2.svg";

const LOCATIONS = [
  "refrigerator",
  "freezer",
  "pantry",
  "cabinet",
  "countertop",
];

const PantryPage: React.FC = () => {
  const { toast } = useToast();
  const { activeAccountId, account } = useSelector(
    (state: RootState) => state.account,
  );

  // UI States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showAlerts, setShowAlerts] = useState(false);

  // Filter & Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [tableSearchQuery, setTableSearchQuery] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [itemToEdit, setItemToEdit] = useState(null);
  const [viewMode, setViewMode] = useState<"card" | "table">("table");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(tableSearchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [tableSearchQuery]);

  // Fetch pantry data with pagination
  const {
    data: pantryResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = usePantryQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch || undefined,
    location: filterLocation !== "all" ? filterLocation : undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
    accountId: activeAccountId || undefined,
  });

  // Fetch alerts
  const { data: alerts = [] } = usePantryAlertsQuery(
    activeAccountId || undefined,
  );

  // Mutations
  const deleteMutation = useDeletePantryMutation();
  const dismissAlertMutation = useDismissAlertMutation();

  // Transform API data
  const pantryItems =
    pantryResponse?.data?.map((item: any) => ({
      id: item.id,
      ingredientId: item.ingredientId,
      ingredientName: item.ingredient?.name || "Unknown",
      quantity: item.quantity.toString(),
      category: item?.ingredient?.category,
      unit: item.unit,
      location: item.location,
      expirationDate: item.expirationDate
        ? new Date(item.expirationDate).toISOString().split("T")[0]
        : undefined,
      costPaid: item.costPaid,
      addedBy: item.addedBy || "N/A",
      createdAt: new Date(item.createdAt).toISOString().split("T")[0],
    })) || [];

  const pagination = pantryResponse?.pagination || {
    page: 1,
    limit: itemsPerPage,
    total: 0,
    totalPages: 1,
  };

  // Handle delete
  const handleDeleteItem = (id: string) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleEdit = (item: any) => {
    setIsAddModalOpen(true);
    setItemToEdit(item);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteMutation.mutateAsync({
        id: itemToDelete,
        accountId: activeAccountId || undefined,
      });
      toast({
        title: "Success",
        description: "Pantry item deleted successfully",
        variant: "default",
      });
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await dismissAlertMutation.mutateAsync(alertId);
      toast({
        title: "Alert Dismissed",
        description: "The alert has been dismissed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to dismiss alert.",
        variant: "destructive",
      });
    }
  };

  const handleClearFilters = () => {
    setTableSearchQuery("");
    setFilterLocation("all");
    setCurrentPage(1);
  };

  // Utility functions
  const getExpirationStatus = (expirationDate?: string) => {
    if (!expirationDate)
      return { status: "N/A", color: "text-gray-400", bgColor: "bg-gray-50" };

    const today = new Date();
    const expDate = new Date(expirationDate);
    const daysUntilExpiry = Math.ceil(
      (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntilExpiry < 0)
      return { status: "Expired", color: "text-red-600", bgColor: "bg-red-50" };
    if (daysUntilExpiry <= 3)
      return {
        status: `${daysUntilExpiry}d left`,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      };
    if (daysUntilExpiry <= 7)
      return {
        status: `${daysUntilExpiry}d left`,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
      };
    return {
      status: `${daysUntilExpiry}d left`,
      color: "text-green-600",
      bgColor: "bg-green-50",
    };
  };

  const getLocationBadgeColor = (location: string) => {
    const colors: Record<string, string> = {
      refrigerator: "bg-blue-100 text-blue-700 border-blue-200",
      freezer: "bg-cyan-100 text-cyan-700 border-cyan-200",
      pantry: "bg-amber-100 text-amber-700 border-amber-200",
      cabinet: "bg-purple-100 text-purple-700 border-purple-200",
      countertop: "bg-pink-100 text-pink-700 border-pink-200",
    };
    return colors[location] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case "expired":
        return <AlertCircle className="text-red-500" size={18} />;
      case "expiring_soon":
        return <Clock className="text-orange-500" size={18} />;
      case "low_stock":
        return <AlertTriangle className="text-yellow-500" size={18} />;
      default:
        return <Bell className="text-gray-500" size={18} />;
    }
  };

  // Calculate stats
  // Note: These calculations are based on the *fetched page*. Ideally, backend should return stats.
  // Assuming full stats are not available yet from backend, we might want to fetch stats separately or just show stats for current view.
  // However, "Expiring Soon" query exists.
  // For now, let's keep it simple or use the separate ExpiringItems query for the Expiring Card.

  // Use pagination total for total items.
  // Use pagination total for total items.
  const activeAlerts = alerts?.filter((a: any) => !a.isDismissed) || [];

  // For total value, we can only sum visible items unless we have a stats endpoint.
  // Use visible items for now.
  const totalValue = pantryItems?.reduce(
    (sum: number, item: any) => sum + (parseFloat(item.costPaid) || 0),
    0,
  );

  if (!activeAccountId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00] pb-8 relative overflow-hidden font-sans">
        <div className="max-w-8xl mx-auto px-4 md:px-6 relative z-10 py-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-8 gap-6 animate-fade-in">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#7dab4f] font-bold text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1">
                  <Crown size={12} className="fill-white" />
                  {account?.isPremium ? "Premium Plan" : "Basic Plan"}
                </span>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-[#313131] tracking-tight">
                  Pantry Management
                </h1>
                <p className="text-sm text-gray-500 font-medium mt-1">
                  Track inventory, monitor expiration, and reduce waste
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="bg-white hover:bg-gray-50 text-[#313131] font-bold py-2.5 px-4 rounded-xl shadow-sm border border-gray-200 transition-all flex items-center gap-2 text-sm h-auto"
              >
                <RefreshCw
                  size={18}
                  className={`text-[#7661d3] ${isFetching ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                onClick={() => {
                  setItemToEdit(null);
                  setIsAddModalOpen(true);
                }}
                className="bg-[#313131] hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm h-auto"
              >
                <Plus size={18} />
                Add Item
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {/* Total Items */}
            <div className="bg-white rounded-2xl p-6 shadow-md relative overflow-hidden group border border-gray-200 hover:shadow-lg hover:border-[#7661d3]/20 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#F3F0FD] to-transparent rounded-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-125" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-gray-500 font-bold text-xs uppercase tracking-wide mb-1">
                    Total Items
                  </p>
                  <h3 className="text-3xl font-extrabold text-[#313131]">
                    {isLoading ? "..." : pagination.total}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-[#F3F0FD] rounded-xl flex items-center justify-center text-[#7661d3]">
                  <Package size={24} />
                </div>
              </div>
            </div>

            {/* Expiring Soon */}
            <div className="bg-white rounded-2xl p-6 shadow-md relative overflow-hidden group border border-gray-200 hover:shadow-lg hover:border-orange-200 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-50 to-transparent rounded-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-125" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-gray-500 font-bold text-xs uppercase tracking-wide mb-1">
                    Alerts
                  </p>
                  <h3 className="text-3xl font-extrabold text-orange-600">
                    {activeAlerts.length}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                  <Bell size={24} />
                </div>
              </div>
            </div>

            {/* Total Value */}
            <div className="bg-white rounded-2xl p-6 shadow-md relative overflow-hidden group border border-gray-200 hover:shadow-lg hover:border-[#7dab4f]/20 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#e8f5e0] to-transparent rounded-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-125" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-gray-500 font-bold text-xs uppercase tracking-wide mb-1">
                    Value (Visible)
                  </p>
                  <h3 className="text-3xl font-extrabold text-[#7dab4f]">
                    ${totalValue.toFixed(0)}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-[#e8f5e0] rounded-xl flex items-center justify-center text-[#7dab4f]">
                  <TrendingUp size={24} />
                </div>
              </div>
            </div>

            {/* Storage Locations */}
            <div className="bg-gradient-to-br from-[#3d326d] to-[#2d2454] rounded-2xl p-6 shadow-lg text-white relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#7dab4f]/10 rounded-full -ml-6 -mb-6" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-white/70 font-bold text-xs uppercase tracking-wide mb-1">
                    Locations
                  </p>
                  <h3 className="text-3xl font-extrabold text-white">5</h3>
                </div>
                <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-sm">
                  <MapPin size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Active Alerts Section */}
          {activeAlerts.length > 0 && (
            <div className="mb-6 animate-fade-in-up">
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-100 rounded-2xl p-4 shadow-sm">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowAlerts(!showAlerts)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-orange-900 text-sm">
                        {activeAlerts.length} Action Required
                      </h3>
                      <p className="text-xs text-orange-700">
                        You have items expiring or expired.
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={20}
                    className={`text-orange-400 transition-transform ${showAlerts ? "rotate-90" : ""}`}
                  />
                </div>
                {showAlerts && (
                  <div className="mt-4 space-y-2 border-t border-orange-100 pt-3">
                    {activeAlerts.map((alert: any) => (
                      <div
                        key={alert.id}
                        className="flex justify-between items-start bg-white p-3 rounded-lg border border-orange-100 shadow-sm"
                      >
                        <div className="flex gap-3">
                          {getAlertIcon(alert.alertType)}
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {alert.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(alert.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDismissAlert(alert.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="border-0 shadow-xl bg-white rounded-xl overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white p-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <h3 className="flex items-center gap-3 text-xl font-extrabold">
                <Package className="h-6 w-6" />
                Inventory
              </h3>

              {/* Filters */}
              <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:gap-4 justify-end">
                {/* Search */}
                <div className="relative w-3xs">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    value={tableSearchQuery}
                    onChange={(e) => setTableSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="
        w-full pl-9 pr-3 py-2
        bg-white/10 border border-white/20
        rounded-lg text-white
        placeholder-white/60
        focus:outline-none focus:bg-white/20
        transition-all text-sm font-medium
      "
                  />
                </div>

                {/* Location Filter */}
                <div className="w-full md:w-56 shrink-0">
                  <Select
                    value={filterLocation}
                    onValueChange={(val) => {
                      setFilterLocation(val);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-11 rounded-lg !border !border-[#BCBCBC] text-black bg-white focus:ring-0 transition-all text-sm font-medium shadow-none">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>

                    <SelectContent className="rounded-xl border border-gray-200 shadow-xl p-1 bg-white">
                      <SelectItem
                        value="all"
                        className="
            rounded-lg px-3 py-2 cursor-pointer
            transition-colors
            focus:bg-[#F3F0FD]
            data-[state=checked]:bg-[#7661d3]
            data-[state=checked]:text-white
          "
                      >
                        All Locations
                      </SelectItem>

                      {LOCATIONS.map((loc) => (
                        <SelectItem
                          key={loc}
                          value={loc}
                          className="
              capitalize rounded-lg px-3 py-2 cursor-pointer
              transition-colors
              focus:bg-[#F3F0FD]
              data-[state=checked]:bg-[#7661d3]
              data-[state=checked]:text-white
            "
                        >
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="p-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2
                    className="animate-spin text-[#7661d3] mb-4"
                    size={48}
                  />
                  <p className="text-gray-500">Loading pantry items...</p>
                </div>
              ) : isError ? (
                <div className="text-center py-20">
                  <AlertCircle
                    size={48}
                    className="text-red-500 mx-auto mb-4"
                  />
                  <p className="text-gray-800 font-medium">
                    Failed to load items
                  </p>
                  <Button
                    onClick={() => refetch()}
                    variant="outline"
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-200">
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Ingredient
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Expiration
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Cost
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pantryItems.length > 0 ? (
                        pantryItems.map((item: any) => {
                          const expStatus = getExpirationStatus(
                            item.expirationDate,
                          );
                          return (
                            <tr
                              key={item.id}
                              className="hover:bg-gray-50/50 transition-colors group"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-[#F3F0FD] flex items-center justify-center text-[#7661d3] font-bold text-lg">
                                    {item.ingredientName.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-bold text-[#313131] text-sm">
                                      {item.ingredientName}
                                    </div>
                                    <div className="text-gray-400 text-xs capitalize">
                                      {item.category}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-semibold text-gray-700 text-sm">
                                  {item.quantity}{" "}
                                  <span className="text-gray-400 text-xs ml-0.5">
                                    {item.unit}
                                  </span>
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <Badge
                                  variant="outline"
                                  className={`capitalize font-medium border ${getLocationBadgeColor(item.location)}`}
                                >
                                  {item.location}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                <div
                                  className={`px-2.5 py-1 rounded-md inline-block ${expStatus.bgColor}`}
                                >
                                  <div className="flex items-center gap-1.5">
                                    <div
                                      className={`w-1.5 h-1.5 rounded-full ${expStatus.color.replace("text", "bg")}`}
                                    ></div>
                                    <span
                                      className={`text-xs font-bold ${expStatus.color}`}
                                    >
                                      {expStatus.status}
                                    </span>
                                  </div>
                                  {item.expirationDate && (
                                    <div className="text-[10px] text-gray-400 mt-0.5 ml-3">
                                      {item.expirationDate}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {item.costPaid ? (
                                  <span className="font-bold text-[#7dab4f] text-sm">
                                    ${item.costPaid}
                                  </span>
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleEdit(item)}
                                    className="p-2 hover:bg-[#F3F0FD] rounded-lg text-gray-400 hover:text-[#7661d3] transition-colors"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-16 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                                <Package size={24} className="text-gray-300" />
                              </div>
                              <h3 className="text-gray-800 font-bold">
                                No items found
                              </h3>
                              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                {debouncedSearch || filterLocation !== "all"
                                  ? "Try adjusting your filters."
                                  : "Your pantry is empty. Add some items to get started."}
                              </p>
                              {!debouncedSearch && filterLocation === "all" && (
                                <Button
                                  onClick={() => setIsAddModalOpen(true)}
                                  className="mt-4 bg-[#313131] hover:bg-black text-white px-6"
                                >
                                  Add First Item
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/30">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === pagination.totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        <ConfirmDialog
          open={showDeleteConfirm}
          setOpen={setShowDeleteConfirm}
          title="Delete Pantry Item?"
          message="Are you sure you want to delete this item? This action cannot be undone."
          onConfirm={confirmDelete}
        />

        {isAddModalOpen && (
          <AddToPantry
            itemToEdit={itemToEdit}
            setIsAddModalOpen={setIsAddModalOpen}
          />
        )}
      </div>
    </TooltipProvider>
  );
};

export default PantryPage;

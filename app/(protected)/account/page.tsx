"use client";
import React, { useEffect, useEffectEvent, useMemo, useState } from "react";
import Image from "next/image";
import {
  User,
  Wallet,
  Calendar,
  CreditCard,
  TrendingUp,
  Settings,
  Crown,
  Users,
  Edit,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Bell,
  LogOut,
  ChevronDown,
  Plus,
  Mail,
  MailIcon,
  Check,
  X,
  MoreHorizontal,
  DollarSign,
  Grid3x3,
  List,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Trash2,
  Send,
  RefreshCw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ThemeButton from "@/components/common/buttons/theme-button";
import pattern1 from "@/public/hero-pattern-1.svg";
import pattern2 from "@/public/hero-pattern-2.svg";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useAccount, useMyAccounts } from "@/services/account/account.query";
import Loader from "@/components/common/Loader";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store.redux";
import { setActiveAccountId } from "@/redux/features/account/account.slice";
import { useMembers } from "@/services/member/member.query";
import { useGetHealthProfile } from "@/services/health-profile/health-profile.query";
import { useRouter } from "next/navigation";
import AddMemberModal from "@/components/account/AddMemberModal";
import EditMemberModal from "@/components/account/EditMemberModal";
import DeleteMemberModal from "@/components/account/DeleteMemberModal";
import DeleteAccountModal from "@/components/account/DeleteAccountModal";
import EditAccountModal from "@/components/account/EditAccountModal";
import NavigationMenu from "@/components/common/navigation-menu";
import { InvitationService } from "@/services/invitation/invitation.service";
import { toast } from "sonner";

const mockInvitations = [
  {
    id: 1,
    sender: "Rahul Verma",
    email: "rahul.v@gmail.com",
    role: "Admin",
    date: "2024-12-14",
    status: "Pending",
    avatar: "R",
  },
  {
    id: 2,
    sender: "Priya Singh",
    email: "priya.singh@yahoo.com",
    role: "Member",
    date: "2024-12-12",
    status: "Accepted",
    avatar: "P",
  },
  {
    id: 3,
    sender: "Amit Patel",
    email: "amit.patel@work.com",
    role: "Viewer",
    date: "2024-12-10",
    status: "Rejected",
    avatar: "A",
  },
  {
    id: 4,
    sender: "Sneha Gupta",
    email: "sneha.g@outlook.com",
    role: "Member",
    date: "2024-12-08",
    status: "Accepted",
    avatar: "S",
  },
];

const formatCurrency = (value: string | null) => {
  if (!value) return "—";
  return `₹${Number(value).toLocaleString()}`;
};

const calculateResetInDays = (lastReset?: string) => {
  if (!lastReset) return 0;
  const diff = Date.now() - new Date(lastReset).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return Math.max(7 - days, 0);
};

export default function AccountPage() {
  const [receivedInvitations, setReceivedInvitations] = useState<any[]>([]);
  const [sentInvitations, setSentInvitations] = useState<{ data: any[], pagination: any }>({ data: [], pagination: {} });
  const [isFetchingInv, setIsFetchingInv] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState("card"); // 'card' or 'table'
  const [activeMember, setActiveMember] = useState(null);

  // Modal states
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [isDeleteMemberModalOpen, setIsDeleteMemberModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);
  const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState(false);

  const dispatch = useDispatch();

  // Redux State
  const {
    accountsList,
    activeAccountId,
    account,
    activeBudget,
    spent,
    usagePercent,
    resetInDays,
    location,
    loading,
  } = useSelector((state: RootState) => state.account);
  const user = useSelector((state: RootState) => state.auth.user);

  // Fetch Invitations Data
  const fetchInvitations = async () => {
    if (!activeAccountId) return;
    setIsFetchingInv(true);
    try {
      // 1. Fetch invitations sent TO the user
      const received = await InvitationService.getMyInvitations();
      setReceivedInvitations(received.data || []);

      // 2. Fetch invitations sent FROM this account
      const sent = await InvitationService.getInvitations(activeAccountId);
      setSentInvitations(sent);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setIsFetchingInv(false);
    }
  };

  useEffect(() => {
    if (activeTab === "invitations") {
      fetchInvitations();
    }
  }, [activeTab, activeAccountId]);

  // Handlers for Invitation Actions
  const handleAcceptInvitation = async (token: string) => {
    try {
      await InvitationService.acceptInvitation(token);
      toast.success("Invitation accepted! Waiting for admin approval.");
      fetchInvitations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to accept invitation");
    }
  };

  const handleApproveInvitation = async (invitationId: string, role: string) => {
    try {
      await InvitationService.approveInvitation(invitationId, role);
      toast.success("Invitation approved. User is now a member.");
      fetchInvitations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve invitation");
    }
  };

  const handleRejectInvitation = async (invitationId: string, reason?: string) => {
    try {
      await InvitationService.rejectInvitation(invitationId, reason);
      toast.success("Invitation rejected");
      fetchInvitations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject invitation");
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      await InvitationService.resendInvitation(invitationId);
      toast.success("Invitation resent successfully");
      fetchInvitations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to resend invitation");
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!window.confirm("Are you sure you want to cancel this invitation?")) return;
    try {
      await InvitationService.cancelInvitation(invitationId);
      toast.success("Invitation cancelled");
      fetchInvitations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel invitation");
    }
  };

  const { data: members, isLoading: isMemberLoading } = useMembers({
    accountId: activeAccountId!,
    page: currentPage,
    limit: 10,
  });

  console.log({ activeMember });

  const membersList: any[] = members?.data?.data || [];
  const pagination = members?.data.pagination;

  console.log(membersList, "jhjhjhjhjh");
  const router = useRouter();

  const handleInvitationAction = (
    id: number,
    action: "Accepted" | "Rejected",
  ) => {
    // In a real app, you would make an API call here.
    // For now, we optimistically update the state.
    // setInvitations((prev) =>
    //   prev.map((inv) => (inv.id === id ? { ...inv, status: action } : inv)),
    // );
  };

  const onAccountChange = (id: string) => {
    dispatch(setActiveAccountId(id));
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00] relative overflow-hidden w-full font-sans">
      {/* Background Patterns */}
      <Image
        src={pattern1}
        className="absolute -top-64 -left-32 opacity-30 pointer-events-none"
        width={818}
        height={818}
        alt="Pattern-1"
      />
      <Image
        src={pattern2}
        className="absolute right-0 -top-48 opacity-30 pointer-events-none"
        width={818}
        height={600}
        alt="Pattern-2"
      />

      {/* Main Container */}
      <div className="container mx-auto px-4 md:px-6 relative z-10 py-8">
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
                Account Management
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-1">
                Overview of your budget, settings & invitations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-white hover:bg-gray-50 text-[#313131] font-bold py-2.5 px-4 rounded-xl shadow-sm border border-gray-100 transition-all flex items-center gap-2 text-sm">
              <Settings size={18} className="text-[#7661d3]" />
              Settings
            </button>
            <Link href={"/account/create"}>
              <button className="bg-[#313131] hover:bg-black text-white font-bold py-2.5 px-4  rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm">
                <Plus size={18} />
                Create New
              </button>
            </Link>
          </div>
        </div>

        {/* Top Section: Account Selector + Budget Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Account Selector - Takes 4 columns */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 relative overflow-hidden group h-full hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#F3F0FD] to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Settings size={16} className="text-[#7661d3]" />
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Active Account
                  </label>
                </div>

                <Select value={account?.id!} onValueChange={onAccountChange}>
                  <SelectTrigger className="w-full h-auto py-3.5 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-[#F8F7FC] to-white hover:border-[#7661d3]/40 focus:ring-2 focus:ring-[#7661d3]/20 focus:ring-offset-0 transition-all px-4 text-left shadow-sm">
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7661d3] to-[#3d326d] flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md">
                        {account?.accountName.charAt(0)}
                      </div>
                      <div className="flex flex-col overflow-hidden text-left flex-1">
                        <span className="font-bold text-[#313131] text-base truncate block">
                          {account?.accountName}
                        </span>
                        <span className="text-xs text-gray-500 truncate block font-medium">
                          Account #{account?.accountNumber}
                        </span>
                      </div>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border border-gray-100 shadow-xl p-1 bg-white">
                    {accountsList?.map((acc: any) => (
                      <SelectItem
                        key={acc.id}
                        value={acc.id}
                        className="rounded-lg p-3 focus:bg-[#F3F0FD] cursor-pointer transition-colors"
                      >
                        <span className="sr-only">{acc.accountName}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#f3f0fd] flex items-center justify-center text-[#6d53e1] font-bold text-sm">
                            {acc.accountName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#313131] text-sm truncate">
                              {acc.accountName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              #{acc.accountNumber}
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Budget Cards - Takes 8 columns */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Budget Card */}
            <div className="bg-white rounded-2xl p-6 shadow-md relative overflow-hidden group border border-gray-100 hover:shadow-lg hover:border-[#7661d3]/20 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#F3F0FD] to-transparent rounded-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-125" />

              <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-500 font-bold text-xs uppercase tracking-wide">
                      {activeBudget?.label ?? "No Budget Set"}
                    </span>
                  </div>

                  <h3 className="text-3xl font-extrabold text-[#313131] tracking-tight">
                    {activeBudget
                      ? `$${activeBudget.amount.toLocaleString()}`
                      : "—"}
                  </h3>
                </div>

                <div className="h-14 w-14 bg-gradient-to-br from-[#F3F0FD] to-[#e8e0fc] rounded-2xl flex items-center justify-center text-[#7661d3] shadow-sm">
                  <Calendar size={24} />
                </div>
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-gray-500">Budget Usage</span>
                  <span className="text-xs font-bold text-[#7dab4f]">
                    {Math.round(usagePercent)}% Used
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-[#7dab4f] to-[#6a9642] h-full transition-all duration-500 rounded-full"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Current Balance Card */}
            <div className="bg-gradient-to-br from-[#3d326d] to-[#2d2454] rounded-2xl p-6 shadow-lg text-white relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#7dab4f]/10 rounded-full -ml-10 -mb-10" />

              <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white/70 font-bold text-xs uppercase tracking-wide">
                      Current Balance
                    </span>
                  </div>

                  <h3 className="text-3xl font-extrabold text-white tracking-tight">
                    {activeBudget
                      ? `$${Math.max(
                        activeBudget.amount - spent,
                        0,
                      ).toLocaleString()}`
                      : "—"}
                  </h3>
                </div>

                <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm shadow-lg">
                  <Wallet size={24} />
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[#7dab4f] font-bold bg-white/10 px-3 py-1.5 rounded-lg text-xs backdrop-blur-sm shadow-sm">
                  {usagePercent < 80 ? "✓ Healthy" : "⚠ Attention"}
                </span>

                <span className="text-white/70 text-xs font-medium">
                  Resets in {resetInDays} days
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation - Profile Style */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 animate-fade-in">
          {[
            { id: "overview", label: "Account Overview", icon: User },
            { id: "budget", label: "Budget & Finance", icon: Wallet },
            { id: "members", label: "Family Members", icon: Users },
            { id: "invitations", label: "Invitations", icon: MailIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                  ? "bg-[var(--primary)] text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-6 animate-scale-in">
              {/* Account Information Card with Blue Header */}
              <div className="border-0 shadow-xl bg-white rounded-xl overflow-hidden">
                {/* Blue Gradient Header */}
                <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white p-4 flex justify-between items-center">
                  <h3 className="flex items-center gap-3 text-xl font-extrabold">
                    <User className="h-6 w-6" />
                    Account Information
                  </h3>
                  <button
                    onClick={() => setIsEditAccountModalOpen(true)}
                    className="bg-white text-[#7661d3] px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Account
                  </button>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-6 bg-white">

                  {/* Account Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {[
                      {
                        label: "Account Name",
                        value: account?.accountName,
                      },
                      {
                        label: "Account Number",
                        value: account?.accountNumber,
                      },
                      {
                        label: "Account Type",
                        value: account?.accountType
                          ? account.accountType.charAt(0).toUpperCase() +
                          account.accountType.slice(1)
                          : null,
                      },
                      {
                        label: "Description",
                        value: account?.description,
                        fullWidth: true,
                      },
                    ].map((field, i) => (
                      <div key={i} className="group">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                          {field.label}
                        </label>
                        <div className="flex items-center justify-between border-b border-gray-100 group-hover:border-[#7661d3]/30 transition-colors pb-1.5">
                          <p className="text-base font-bold text-[#313131]">
                            {field.value || "—"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Address Section */}
                  {(account?.formattedAddress ||
                    account?.addressLine1 ||
                    account?.city) && (
                      <div className="mt-8">
                        <div className="flex items-center gap-2 mb-4">
                          <MapPin size={18} className="text-[#7661d3]" />
                          <h4 className="font-bold text-[#313131] text-sm">
                            Account Address
                          </h4>
                        </div>
                        <div className="bg-[#F8F7FC] rounded-xl p-5 border border-gray-100">
                          <div className="space-y-3">
                            {account?.formattedAddress && (
                              <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                                  Full Address
                                </label>
                                <p className="text-sm font-medium text-[#313131]">
                                  {account.formattedAddress}
                                </p>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                              {account?.addressLine1 && (
                                <div>
                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                                    Address Line 1
                                  </label>
                                  <p className="text-sm font-medium text-gray-700">
                                    {account.addressLine1}
                                  </p>
                                </div>
                              )}

                              {account?.addressLine2 && (
                                <div>
                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                                    Address Line 2
                                  </label>
                                  <p className="text-sm font-medium text-gray-700">
                                    {account.addressLine2}
                                  </p>
                                </div>
                              )}

                              {account?.city && (
                                <div>
                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                                    City
                                  </label>
                                  <p className="text-sm font-medium text-gray-700">
                                    {account.city}
                                  </p>
                                </div>
                              )}

                              {account?.state && (
                                <div>
                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                                    State
                                  </label>
                                  <p className="text-sm font-medium text-gray-700">
                                    {account.state}
                                  </p>
                                </div>
                              )}

                              {account?.zipCode && (
                                <div>
                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                                    ZIP Code
                                  </label>
                                  <p className="text-sm font-medium text-gray-700">
                                    {account.zipCode}
                                  </p>
                                </div>
                              )}

                              {account?.country && (
                                <div>
                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                                    Country
                                  </label>
                                  <p className="text-sm font-medium text-gray-700">
                                    {account.country}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                  {/* Preferences */}
                  <div className="bg-[#F8F7FC] rounded-xl p-5 mt-4">
                    <h4 className="font-bold text-[#313131] mb-4 text-sm flex items-center gap-2">
                      <span className="w-1 h-4 bg-[#7661d3] rounded-full"></span>
                      Account Preferences
                    </h4>

                    <div className="space-y-3">
                      {/* Budget Override */}
                      <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100/50">
                        <div>
                          <p className="font-bold text-gray-800 text-sm">
                            Budget Override Approval
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Require admin approval for exceeding limits
                          </p>
                        </div>

                        <div
                          className={`w-10 h-6 rounded-full relative transition-colors ${account?.requiresAdminApprovalForOverrides
                            ? "bg-[#7dab4f]"
                            : "bg-gray-200"
                            }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${account?.requiresAdminApprovalForOverrides
                              ? "left-5"
                              : "left-1"
                              }`}
                          />
                        </div>
                      </div>

                      {/* Auto Grocery */}
                      <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100/50">
                        <div>
                          <p className="font-bold text-gray-800 text-sm">
                            Auto-Generate Grocery Lists
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Create smart lists based on planning period
                          </p>
                        </div>

                        <div
                          className={`w-10 h-6 rounded-full relative transition-colors ${account?.autoGenerateGroceryLists
                            ? "bg-[#7dab4f]"
                            : "bg-gray-200"
                            }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${account?.autoGenerateGroceryLists
                              ? "left-5"
                              : "left-1"
                              }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-50/50 rounded-2xl p-6 border-2 border-red-100 shadow-md mt-8">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <AlertTriangle size={20} className="text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-red-900 uppercase tracking-wider mb-1">
                          Danger Zone
                        </h3>
                        <p className="text-sm text-red-700 leading-relaxed mb-4">
                          Permanently delete this account and all associated data. This action cannot be undone.
                        </p>
                        <button
                          onClick={() => setIsDeleteAccountModalOpen(true)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-3 px-5 rounded-xl transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                        >
                          <Trash2 size={16} />
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "budget" && account && (
            <div className="space-y-6 animate-scale-in">
              {/* Budget & Finance Card with Blue Header */}
              <div className="border-0 shadow-xl bg-white rounded-xl overflow-hidden">
                {/* Blue Gradient Header */}
                <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white p-4 flex justify-between items-center">
                  <h3 className="flex items-center gap-3 text-xl font-extrabold">
                    <Wallet className="h-6 w-6" />
                    Budget Overview
                  </h3>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-6 bg-white">
                  {/* HEADER */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-extrabold text-[#313131]">
                      Budget Overview
                    </h3>
                  </div>

                  {/* ACTIVE BUDGET CARD */}
                  {activeBudget && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-gray-500 font-bold text-xs uppercase">
                            {activeBudget.label}
                          </p>
                          <p className="text-3xl font-extrabold text-[#313131]">
                            ₹{activeBudget.amount.toLocaleString("en-IN")}
                          </p>
                        </div>

                        <span className="text-xs font-bold bg-[#F3F0FD] text-[#3d326d] px-3 py-1 rounded-full">
                          Active · {account.currentAllocation}
                        </span>
                      </div>

                      {/* PROGRESS */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-gray-500">
                            Spent ₹{spent.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[#7dab4f]">
                            {usagePercent.toFixed(0)}%
                          </span>
                        </div>

                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#7dab4f] transition-all"
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>

                        {resetInDays !== null && (
                          <p className="text-[11px] text-gray-400 mt-2">
                            Resets in {resetInDays} days
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CATEGORY SPLIT */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        label: "Groceries",
                        value: account.groceriesPercentage,
                        color: "bg-[#7dab4f]",
                        icon: "🥦",
                      },
                      {
                        label: "Dining",
                        value: account.diningPercentage,
                        color: "bg-[#f59e0b]",
                        icon: "🍽️",
                      },
                      {
                        label: "Emergency",
                        value: account.emergencyPercentage,
                        color: "bg-[#ef4444]",
                        icon: "🚨",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="bg-[#F8F7FC] rounded-xl p-5 text-center relative overflow-hidden"
                      >
                        <div
                          className={`absolute top-0 left-0 w-full h-1 ${item.color}`}
                        />
                        <div className="text-3xl mb-2">{item.icon}</div>
                        <p className="text-sm font-bold text-gray-700">
                          {item.label}
                        </p>
                        <p className="text-2xl font-extrabold text-[#313131]">
                          {item.value}%
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* STATS */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      {
                        label: "Current Streak",
                        value: account.weeklyFoodStreak,
                      },
                      { label: "Best Streak", value: account.bestFoodStreak },
                      { label: "Overrides", value: account.totalFoodOverrides },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="border border-dashed border-gray-300 rounded-xl p-5 text-center"
                      >
                        <p className="text-gray-400 text-[10px] font-bold uppercase">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-extrabold text-[#313131] mt-1">
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}




          {activeTab === "invitations" && (
            <div className="space-y-6">
              {/* RECEIVED INVITATIONS SECTION */}
              {receivedInvitations.length > 0 && (
                <div className="border-0 shadow-xl bg-white gap-0 rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between bg-gradient-to-r from-[#4f46e5] to-[#7661d3] text-white p-4">
                    <div>
                      <h3 className="text-xl font-extrabold flex items-center gap-2">
                        <Mail size={20} />
                        Invitations Received
                      </h3>
                      <p className="text-sm opacity-90">
                        Invitations to join other household accounts
                      </p>
                    </div>
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 shadow-none font-bold">
                      {receivedInvitations.length} Total
                    </Badge>
                  </div>

                  <div className="p-0">
                    <Table>
                      <TableHeader className="bg-gray-50/50">
                        <TableRow>
                          <TableHead className="font-bold">From Account</TableHead>
                          <TableHead className="font-bold">Invited By</TableHead>
                          <TableHead className="font-bold">Status</TableHead>
                          <TableHead className="text-right font-bold tracking-wider">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {receivedInvitations.map((inv: any) => (
                          <TableRow key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell>
                              <div className="font-bold text-[#313131]">
                                {inv.account?.accountName}
                              </div>
                              <div className="text-xs text-gray-500">
                                #{inv.account?.accountNumber}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-medium">
                                {inv.inviter?.firstName} {inv.inviter?.lastName}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`border-0 font-bold capitalize ${inv.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                inv.status === 'user_accepted' ? 'bg-blue-100 text-blue-700' :
                                  inv.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                {inv.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {inv.status === "pending" && (
                                <div className="flex items-center justify-end gap-2">
                                  <ThemeButton
                                 
                                    onClick={() => handleAcceptInvitation(inv.token)}
                                    className="h-8 px-4 bg-green-600 hover:bg-green-700 text-white font-bold"
                                    label="Accept"
                                  />
                                  
                                  <ThemeButton                   
                                    onClick={() => handleRejectInvitation(inv.id, "Rejected by user")}
                                    className="h-8 px-4 font-bold"
                                    label=" Decline"
                                  />
                                   
                                  
                                </div>
                              )}
                              {inv.status === "user_accepted" && (
                                <span className="text-xs italic text-gray-400">Awaiting admin approval</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* SENT INVITATIONS SECTION */}
              <div className="border-0 shadow-xl bg-white gap-0 rounded-xl overflow-hidden animate-in fade-in duration-500">
                <div className="flex items-center justify-between bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white p-4">
                  <div>
                    <h3 className="text-xl font-extrabold flex items-center gap-2">
                      <Send size={20} />
                      Sent Invitations
                    </h3>
                    <p className="text-sm opacity-90">
                      Manage invitations for {account?.accountName || 'this account'}
                    </p>
                  </div>

                  <ThemeButton
                    onClick={() => setIsAddMemberModalOpen(true)}
                    className="font-bold h-9 border-0"
                    label={`Invite New`} />


                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#F8F7FC]">
                      <TableRow>
                        <TableHead className="font-bold text-gray-600">Email / Invitee</TableHead>
                        <TableHead className="font-bold text-gray-600">Proposed Role</TableHead>
                        <TableHead className="font-bold text-gray-600">Sent Date</TableHead>
                        <TableHead className="font-bold text-gray-600">Status</TableHead>
                        <TableHead className="text-right font-bold text-gray-600">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isFetchingInv ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-32 text-center text-gray-400">
                            <RefreshCw className="animate-spin inline mr-2" size={16} />
                            Fetching invitations...
                          </TableCell>
                        </TableRow>
                      ) : sentInvitations.data?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-32 text-center text-gray-400">
                            No invitations sent yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        sentInvitations.data?.map((inv: any) => (
                          <TableRow key={inv.id} className="hover:bg-gray-50/50">
                            <TableCell>
                              <div className="font-bold text-[#313131] text-sm">
                                {inv.email}
                              </div>
                              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                                By {inv.inviter?.firstName}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 bg-gray-100 w-fit px-2 py-1 rounded text-[10px] font-extrabold text-gray-600 uppercase">
                                <ShieldCheck size={12} />
                                {inv.role || 'Member'}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600 font-medium">
                              {new Date(inv.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge className={`border-0 font-bold capitalize ${inv.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                inv.status === 'user_accepted' ? 'bg-blue-100 text-blue-700' :
                                  inv.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    inv.status === 'expired' ? 'bg-gray-100 text-gray-500' :
                                      'bg-red-100 text-red-700'
                                }`}>
                                {inv.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {inv.status === "user_accepted" && (
                                  <>
                                    <button
                                      onClick={() => handleApproveInvitation(inv.id, inv.role || "member")}
                                      className="h-8 w-8 rounded-full bg-green-50 text-green-600 hover:bg-green-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                      title="Approve User"
                                    >
                                      <Check size={16} strokeWidth={3} />
                                    </button>
                                    <button
                                      onClick={() => handleRejectInvitation(inv.id, "Admin rejected")}
                                      className="h-8 w-8 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                      title="Reject User"
                                    >
                                      <X size={16} strokeWidth={3} />
                                    </button>
                                  </>
                                )}

                                {inv.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() => handleResendInvitation(inv.id)}
                                      className="h-8 w-8 rounded-full bg-[#f3f0fd] text-[#7661d3] hover:bg-[#7661d3] hover:text-white flex items-center justify-center transition-all shadow-sm"
                                      title="Resend"
                                    >
                                      <RefreshCw size={14} strokeWidth={3} />
                                    </button>
                                    <button
                                      onClick={() => handleCancelInvitation(inv.id)}
                                      className="h-8 w-8 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                      title="Cancel"
                                    >
                                      <Trash2 size={14} strokeWidth={3} />
                                    </button>
                                  </>
                                )}

                                {(inv.status === "approved" || inv.status === "rejected" || inv.status === "expired") && (
                                  <button
                                    onClick={() => handleCancelInvitation(inv.id)}
                                    className="h-8 w-8 rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all"
                                    title="Delete from history"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="border-0 shadow-xl bg-white gap-0 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between mb-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-extrabold">
                    Family Members
                  </h3>
                  <p className="text-sm">
                    Manage account members and roles
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("card")}
                      className={`p-1.5 rounded transition-all ${viewMode === "card"
                        ? "bg-white shadow-sm"
                        : "text-gray-400"
                        }`}
                    >
                      <Grid3x3 size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode("table")}
                      className={`p-1.5 rounded transition-all ${viewMode === "table"
                        ? "bg-white shadow-sm"
                        : "text-gray-400"
                        }`}
                    >
                      <List size={16} />
                    </button>
                  </div>
                  <span className="bg-[#F3F0FD] text-[#7661d3] font-bold text-xs px-3 py-1 rounded-full">
                    {pagination?.total} Members
                  </span>
                  <button
                    onClick={() => setIsAddMemberModalOpen(true)}
                    className="bg-[#7661d3] hover:bg-[#6952c2] text-white font-bold text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus size={14} />
                    Add Member
                  </button>
                </div>
              </div>

              {viewMode === "card" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 m-5 p-5">
                  {(membersList as any[])?.map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      userId={user?.id}
                      setActiveMember={(member: any) =>
                        router.push(`/health-profile/${member?.id}`)
                      }
                      onEdit={(member: any) => {
                        setSelectedMember(member);
                        setIsEditMemberModalOpen(true);
                      }}
                      onDelete={(member: any) => {
                        setSelectedMember(member);
                        setIsDeleteMemberModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[#F8F7FC]">
                      <tr>
                        <th className="text-left py-3 px-4 font-bold text-gray-600 text-xs uppercase">
                          Member
                        </th>
                        <th className="text-left py-3 px-4 font-bold text-gray-600 text-xs uppercase">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 font-bold text-gray-600 text-xs uppercase">
                          Role
                        </th>
                        <th className="text-left py-3 px-4 font-bold text-gray-600 text-xs uppercase">
                          Account
                        </th>
                        <th className="text-left py-3 px-4 font-bold text-gray-600 text-xs uppercase">
                          Joined
                        </th>
                        <th className="text-left py-3 px-4 font-bold text-gray-600 text-xs uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {membersList.map((member: any) => (
                        <MemberTableRow key={member.id} member={member} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination?.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-bold">
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-bold">
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total,
                      )}
                    </span>{" "}
                    of <span className="font-bold">{pagination.total}</span>{" "}
                    members
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={!pagination.hasPrev}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${pagination.hasPrev
                        ? "bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1,
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`h-9 px-3 rounded-lg font-bold text-sm transition-all ${page === pagination.page
                          ? "bg-[#7661d3] text-white"
                          : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      disabled={!pagination.hasNext}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${pagination.hasNext
                        ? "bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Placeholder for other tabs */}
          {activeTab !== "overview" &&
            activeTab !== "budget" &&
            activeTab !== "invitations" &&
            activeTab !== "members" && (
              <div className="flex flex-col items-center justify-center h-[300px] text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-[#F3F0FD] text-[#7661d3] rounded-full flex items-center justify-center mb-4 shadow-inner">
                  <Settings size={32} className="animate-spin-slow" />
                </div>
                <h3 className="text-xl font-bold text-[#313131] mb-2">
                  Coming Soon
                </h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  We are currently crafting the pixel-perfect {activeTab}{" "}
                  experience.
                </p>
              </div>
            )}
        </div>



      </div>
      {/* Danger Zone - At Bottom */}

      {/* Modals */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        accountId={activeAccountId!}
      />

      <EditMemberModal
        isOpen={isEditMemberModalOpen}
        onClose={() => {
          setIsEditMemberModalOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        accountId={activeAccountId!}
      />

      <DeleteMemberModal
        isOpen={isDeleteMemberModalOpen}
        onClose={() => {
          setIsDeleteMemberModalOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        accountId={activeAccountId!}
      />

      <DeleteAccountModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        account={account}
      />

      <EditAccountModal
        isOpen={isEditAccountModalOpen}
        onClose={() => setIsEditAccountModalOpen(false)}
        account={account}
      />

      <style jsx global>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

    </div>
  )
}







const MemberCard = ({
  member,
  userId,
  setActiveMember,
  onEdit,
  onDelete,
}: any) => {
  const isCurrentUser = userId == member?.userId;

  return (
    <div className="group relative bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border-2 border-gray-100 hover:border-[#7dab4f]/40 transition-all duration-300 p-6 shadow-lg hover:shadow-xl hover:-translate-y-1">
      {/* Decorative corner gradient */}
      <div className="absolute top-0 right-0 w-24 h-20 bg-gradient-to-br from-[#7dab4f]/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              {member.userId && member.user?.avatar ? (
                <img
                  src={member.user.avatar}
                  alt={member.user.firstName}
                  className="h-14 w-14 rounded-2xl object-cover ring-4 ring-[#7dab4f]/20 shadow-md"
                />
              ) : (
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#7dab4f] to-[#5a8a3e] flex items-center justify-center text-white text-lg font-extrabold ring-4 ring-[#7dab4f]/20 shadow-md">
                  {member.userId
                    ? `${member.user?.firstName?.[0] || ""}${member.user?.lastName?.[0] || ""}`
                    : member.name?.[0]?.toUpperCase() || "M"}
                </div>
              )}
              {member.role === "super_admin" && (
                <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center border-3 border-white shadow-lg">
                  <Crown size={12} className="fill-white text-white" />
                </div>
              )}
              {isCurrentUser && (
                <div className="absolute -top-1 -left-1 h-6 w-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-extrabold text-gray-800 text-base">
                  {member.userId
                    ? `${member.user?.firstName || ""} ${member.user?.lastName || ""}`.trim()
                    : member.name || "Unnamed Member"}
                </h4>
                {isCurrentUser && (
                  <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">You</span>
                )}
              </div>
              {member.userId && member.user?.username && (
                <p className="text-xs text-gray-500 font-semibold">
                  @{member.user.username}
                </p>
              )}
              {!member.userId && (
                <p className="text-xs text-[#7dab4f] font-bold flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  In-house Member
                </p>
              )}
            </div>
          </div>

          <div
            className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm ${member.role === "super_admin"
              ? "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800"
              : member.role === "admin"
                ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800"
                : member.role === "member"
                  ? "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800"
                  : member.role === "internal"
                    ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800"
                    : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700"
              }`}
          >
            {member.role === "super_admin" ? "Super Admin" : member.role}
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-3 mb-5 pb-5 border-b-2 border-dashed border-gray-100">
          {member.userId && member.user?.email && (
            <div className="flex items-center gap-2.5 text-sm bg-gray-50 rounded-xl p-3">
              <div className="w-8 h-8 rounded-lg bg-[#7dab4f]/10 flex items-center justify-center flex-shrink-0">
                <Mail size={14} className="text-[#7dab4f]" />
              </div>
              <span className="text-gray-700 font-medium truncate">{member.user.email}</span>
            </div>
          )}

          {!member.userId && (
            <div className="grid grid-cols-2 gap-2">
              {member.age && (
                <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-xl p-3">
                  <Calendar size={14} className="text-[#7dab4f]" />
                  <span className="text-gray-700 font-bold">
                    {member.age} yrs
                  </span>
                </div>
              )}
              {member.sex && (
                <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-xl p-3">
                  <User size={14} className="text-[#7dab4f]" />
                  <span className="text-gray-700 font-bold capitalize">
                    {member.sex}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-br from-[#7dab4f]/5 to-transparent rounded-xl p-4 mb-5">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-500 font-semibold mb-1.5 uppercase text-[10px] tracking-wider">Account Type</p>
              <p className="text-gray-800 font-extrabold capitalize text-sm flex items-center gap-1">
                <svg className="w-3 h-3 text-[#7dab4f]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                {member.account?.accountType}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold mb-1.5 uppercase text-[10px] tracking-wider">Joined</p>
              <p className="text-gray-800 font-extrabold text-sm">
                {new Date(member.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => setActiveMember(member)}
            className="w-full bg-gradient-to-r from-[#7dab4f] to-[#6a9c46] hover:from-[#6a9c46] hover:to-[#5a8a3e] text-white font-extrabold text-sm py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
            title="View Health Profile"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
            <span>🍽️ Health Profile</span>
          </button>

          {/* Show Edit/Delete only if NOT current user */}
          {!isCurrentUser && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onEdit(member)}
                className="bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 border-2 border-gray-200 hover:border-[#7dab4f] shadow-sm"
                title="Edit Member"
              >
                <Edit size={14} />
                <span>Edit</span>
              </button>

              {member.role !== "super_admin" && (
                <button
                  onClick={() => onDelete(member)}
                  className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white font-bold text-xs py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 border-2 border-red-100 hover:border-red-600 shadow-sm"
                  title="Remove Member"
                >
                  <X size={14} />
                  <span>Remove</span>
                </button>
              )}
            </div>
          )}

          {/* If current user, show info message */}
          {isCurrentUser && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 text-center">
              <p className="text-blue-700 font-bold text-xs flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                This is you! Edit from Profile settings
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MemberTableRow = ({ member }: { member: any }) => (
  <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
    <td className="py-4 px-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          {member.userId && member.user?.avatar ? (
            <img
              src={member.user.avatar}
              alt={member.user.firstName}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-[#F3F0FD]"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#7661d3] to-[#3d326d] flex items-center justify-center text-white text-sm font-bold ring-2 ring-[#F3F0FD]">
              {member.userId
                ? `${member.user?.firstName?.[0] || ""}${member.user?.lastName?.[0] || ""}`
                : member.name?.[0]?.toUpperCase() || "M"}
            </div>
          )}
          {member.role === "super_admin" && (
            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-[#7dab4f] rounded-full flex items-center justify-center border-2 border-white">
              <Crown size={8} className="fill-white text-white" />
            </div>
          )}
        </div>
        <div>
          <p className="font-bold text-[#313131] text-sm">
            {member.userId
              ? `${member.user?.firstName || ""} ${member.user?.lastName || ""}`.trim()
              : member.name || "Unnamed Member"}
          </p>
          {member.userId && member.user?.username && (
            <p className="text-xs text-gray-500">@{member.user.username}</p>
          )}
          {!member.userId && (
            <p className="text-xs text-gray-500">In-house Member</p>
          )}
        </div>
      </div>
    </td>
    <td className="py-4 px-4">
      {member.userId && member.user?.email ? (
        <p className="text-sm text-gray-600 font-medium">{member.user.email}</p>
      ) : (
        <div className="space-y-1">
          {member.age && (
            <p className="text-sm text-gray-600 font-medium">
              Age: {member.age} years
            </p>
          )}
          {member.sex && (
            <p className="text-xs text-gray-500 capitalize">{member.sex}</p>
          )}
        </div>
      )}
    </td>
    <td className="py-4 px-4">
      <div
        className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${member.role === "super_admin"
          ? "bg-[#7dab4f]/10 text-[#7dab4f]"
          : member.role === "admin"
            ? "bg-blue-50 text-blue-600"
            : "bg-purple-50 text-purple-600"
          }`}
      >
        {member.role === "super_admin" ? "Super Admin" : member.role}
      </div>
    </td>
    <td className="py-4 px-4">
      <p className="text-sm text-gray-600 font-medium capitalize">
        {member.account?.accountType}
      </p>
    </td>
    <td className="py-4 px-4">
      <p className="text-sm text-gray-600 font-medium">
        {new Date(member.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>
    </td>
    <td className="py-4 px-4">
      <div className="flex items-center gap-1">
        <button
          className="h-8 w-8 rounded-lg bg-[#F3F0FD] hover:bg-[#7661d3] text-[#7661d3] hover:text-white flex items-center justify-center transition-all"
          title="View Profile"
        >
          <User size={14} />
        </button>
        {member.userId && (
          <>
            <button
              className="h-8 w-8 rounded-lg bg-gray-50 hover:bg-gray-600 text-gray-600 hover:text-white flex items-center justify-center transition-all"
              title="Change Role"
            >
              <ShieldCheck size={14} />
            </button>
            <button
              className="h-8 w-8 rounded-lg bg-gray-50 hover:bg-gray-600 text-gray-600 hover:text-white flex items-center justify-center transition-all"
              title="Edit"
            >
              <Edit size={14} />
            </button>
            {member.role !== "super_admin" && (
              <button
                className="h-8 w-8 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white flex items-center justify-center transition-all"
                title="Remove"
              >
                <X size={14} />
              </button>
            )}
          </>
        )}
      </div>
    </td>
  </tr>
);

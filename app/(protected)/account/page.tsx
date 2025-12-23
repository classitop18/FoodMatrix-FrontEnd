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
import { fetchAccountDetail, setActiveAccountId } from "@/redux/features/account/account.slice";
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
import { useAccountInvitations, useMyInvitations } from "@/services/invitation/invitation.query";
import { useAcceptInvitation, useApproveInvitation, useCancelInvitation, useRejectInvitation, useResendInvitation } from "@/services/invitation/invitation.mutation";
import { queryClient } from "@/lib/react-query";
import InputModal from "@/components/common/InputModal";
import ConfirmationModal from "@/components/common/ConfirmationModal";

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

  // New modal states for invitation flow
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null);

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

  // Fetch Queries
  const { data: myInvitationsData, isLoading: isMyInvLoading, refetch: refetchMyInv } = useMyInvitations();
  const { data: accountInvitationsData, isLoading: isAccInvLoading, refetch: refetchAccInv } = useAccountInvitations(activeAccountId!);

  const receivedInvitations = myInvitationsData?.data || [];
  const sentInvitations = accountInvitationsData || { data: [], pagination: {} };

  const { data: members, isLoading: isMemberLoading, refetch: refetchMembers } = useMembers({
    accountId: activeAccountId!,
    page: currentPage,
    limit: 10,
  });

  // Mutations
  const acceptInvMutation = useAcceptInvitation();
  const approveInvMutation = useApproveInvitation();
  const rejectInvMutation = useRejectInvitation();
  const resendInvMutation = useResendInvitation();
  const cancelInvMutation = useCancelInvitation();

  // Handlers for Invitation Actions
  const handleAcceptInvitation = async (token: string) => {
    await acceptInvMutation.mutateAsync(token);
  };

  const handleApproveInvitation = async (invitationId: string, role: string) => {
    await approveInvMutation.mutateAsync({ invitationId, role, accountId: activeAccountId! });
  };

  const handleRejectInvitation = async (invitationId: string, reason?: string) => {
    await rejectInvMutation.mutateAsync({ invitationId, reason, accountId: activeAccountId! });
  };

  const handleResendInvitation = async (invitationId: string) => {
    await resendInvMutation.mutateAsync(invitationId);
  };

  const handleCancelInvitation = async (invitationId: string) => {
    setSelectedInvitationId(invitationId);
    setIsCancelConfirmOpen(true);
  };

  const confirmCancelInvitation = async () => {
    if (!selectedInvitationId) return;
    await cancelInvMutation.mutateAsync({ invitationId: selectedInvitationId, accountId: activeAccountId! });
    setIsCancelConfirmOpen(false);
    setSelectedInvitationId(null);
  };

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
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#313131] text-base truncate">
                            {account?.accountName}
                          </span>
                          {account?.primaryAdminId === user?.id && (
                            <Badge className="bg-amber-100 text-amber-600 border-amber-200 text-[9px] h-4 px-1 py-0 font-bold uppercase shrink-0">
                              Owner
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-white-300 truncate block font-medium">
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

                        className="rounded-lg p-3 focus:bg-[#F3F0FD] cursor-pointer transition-colors  data-[state=checked]:text-white"
                      >
                        <div className="flex items-center justify-between w-full min-w-[240px]">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#f3f0fd] flex items-center justify-center text-[#6d53e1] font-bold text-sm">
                              {acc.accountName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-bold  data-[state=checked]:text-white text-sm truncate max-w-[120px]">
                                  {acc.accountName}
                                </p>
                                {acc.isOwner && (
                                  <Badge className="bg-amber-100 text-amber-600 border-amber-200 text-[9px] h-4 px-1 py-0 font-bold uppercase">
                                    Owner
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-500 truncate">
                                #{acc.accountNumber} • {acc.role}
                              </p>
                            </div>
                          </div>
                          {!acc.isOwner && (
                            <Badge variant="outline" className="text-[9px] h-4 px-1 py-0 font-medium text-gray-400 border-gray-200">
                              Invited
                            </Badge>
                          )}
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
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => dispatch(fetchAccountDetail(activeAccountId!) as any)}
                      className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all"
                      title="Refetch Details"
                    >
                      <RefreshCw size={16} />
                    </button>
                    <button
                      onClick={() => setIsEditAccountModalOpen(true)}
                      className="bg-white text-[#7661d3] px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Account
                    </button>
                  </div>
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
                  <button
                    onClick={() => dispatch(fetchAccountDetail(activeAccountId!) as any)}
                    className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all"
                    title="Refetch Budget Stats"
                  >
                    <RefreshCw size={16} />
                  </button>
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
                  <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 p-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-[#313131] flex items-center gap-2">
                        <MailIcon size={20} className="text-gray-600" />
                        Received Invitations
                      </h3>
                      <p className="text-sm text-gray-600">
                        Invitations you have received from accounts
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => refetchMyInv()}
                        className={`bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full transition-all ${isMyInvLoading ? 'animate-spin' : ''}`}
                        title="Refetch Received Invitations"
                      >
                        <RefreshCw size={16} />
                      </button>
                      <Badge className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-0 shadow-none font-bold">
                        {receivedInvitations.length} Total
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 bg-[#F8F7FC] min-h-[100px]">
                    <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      <div className="col-span-4">From Account</div>
                      <div className="col-span-3">Invited By</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-3 text-right">Actions</div>
                    </div>
                    <div className="space-y-3">
                      {receivedInvitations.map((inv: any) => (
                        <div
                          key={inv.id}
                          className="group bg-white rounded-xl p-4 md:py-3 md:px-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#7661d3]/30 transition-all grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                        >
                          <div className="col-span-12 md:col-span-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-[#F3F0FD] flex items-center justify-center text-[#7661d3] font-bold text-sm shrink-0">
                              {inv.account?.accountName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-[#313131] text-sm leading-tight">
                                {inv.account?.accountName}
                              </div>
                              <div className="text-[10px] font-medium text-gray-500 mt-0.5">
                                #{inv.account?.accountNumber}
                              </div>
                            </div>
                          </div>

                          <div className="col-span-6 md:col-span-3">
                            <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">Invited By</div>
                            <div className="text-sm font-semibold text-gray-700">
                              {inv.inviter?.firstName} {inv.inviter?.lastName}
                            </div>
                          </div>

                          <div className="col-span-6 md:col-span-2">
                            <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">Status</div>
                            <Badge className={`border-0 font-bold capitalize px-2.5 py-0.5 h-6 text-[10px] ${inv.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              inv.status === 'user_accepted' ? 'bg-blue-100 text-blue-700' :
                                inv.status === 'approved' ? 'bg-green-100 text-green-700' :
                                  'bg-red-100 text-red-700'
                              }`}>
                              {inv.status.replace('_', ' ')}
                            </Badge>
                          </div>

                          <div className="col-span-12 md:col-span-3 flex items-center justify-end gap-2 mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-50">
                            {inv.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleAcceptInvitation(inv.token)}
                                  className="h-8 px-4 bg-[#7dab4f] hover:bg-[#6a9642] text-white font-bold rounded-lg text-xs transition-shadow shadow-sm hover:shadow"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleRejectInvitation(inv.id, "Rejected by user")}
                                  className="h-8 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold rounded-lg text-xs transition-colors"
                                >
                                  Decline
                                </button>
                              </>
                            )}
                            {inv.status === "user_accepted" && (
                              <span className="text-[10px] italic text-gray-400 font-medium">Awaiting admin approval</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SENT INVITATIONS SECTION */}
              <div className="border-0 shadow-xl bg-white gap-0 rounded-xl overflow-hidden animate-in fade-in duration-500">
                <div className="flex items-center justify-between  bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)]  border-b-2 border-gray-200 p-4">
                  <div className="text-white">
                    <h3 className="text-xl font-extrabold flex items-center gap-2">
                      <Send size={20} />
                      Sent Invitations
                    </h3>
                    <p className="text-sm">
                      Manage invitations for {account?.accountName || 'this account'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => refetchAccInv()}
                      className={`bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full transition-all ${isAccInvLoading ? 'animate-spin' : ''}`}
                      title="Refetch Sent Invitations"
                    >
                      <RefreshCw size={16} />
                    </button>
                    <button
                      onClick={() => setIsAddMemberModalOpen(true)}
                      className="bg-[#313131] hover:bg-black text-white font-bold h-9 px-4 rounded-lg shadow-md"
                    >
                      Invite New
                    </button>
                  </div>


                </div>

                <div className="p-4 bg-[#F8F7FC] min-h-[100px]">
                  <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    <div className="col-span-4">Email / Invitee</div>
                    <div className="col-span-2">Proposed Role</div>
                    <div className="col-span-2">Sent Date</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>

                  <div className="space-y-3">
                    {isAccInvLoading ? (
                      <div className="h-32 flex flex-col items-center justify-center text-gray-400">
                        <RefreshCw className="animate-spin mb-2" size={24} />
                        <span className="text-xs font-medium">Fetching invitations...</span>
                      </div>
                    ) : sentInvitations.data?.length === 0 ? (
                      <div className="h-32 flex flex-col items-center justify-center text-gray-400">
                        <Mail size={24} className="mb-2 opacity-20" />
                        <span className="text-xs font-medium">No invitations sent yet</span>
                      </div>
                    ) : (
                      sentInvitations.data?.map((inv: any) => (
                        <div
                          key={inv.id}
                          className="group bg-white rounded-xl p-4 md:py-3 md:px-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#7661d3]/30 transition-all grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                        >
                          <div className="col-span-12 md:col-span-4">
                            <div className="font-bold text-[#313131] text-sm break-all">
                              {inv.email}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                                By {inv.inviter?.firstName}
                              </span>
                            </div>
                          </div>

                          <div className="col-span-6 md:col-span-2">
                            <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">Role</div>
                            <div className="flex items-center gap-1.5 bg-gray-50 w-fit px-2 py-1 rounded text-[10px] font-extrabold text-gray-600 uppercase border border-gray-100">
                              <ShieldCheck size={10} />
                              {inv.role || 'Member'}
                            </div>
                          </div>

                          <div className="col-span-6 md:col-span-2">
                            <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">Date</div>
                            <div className="text-xs text-gray-600 font-medium">
                              {new Date(inv.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                          </div>

                          <div className="col-span-6 md:col-span-2">
                            <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">Status</div>
                            <Badge className={`border-0 font-bold capitalize px-2.5 py-0.5 h-6 text-[10px] ${inv.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              inv.status === 'user_accepted' ? 'bg-blue-100 text-blue-700' :
                                inv.status === 'approved' ? 'bg-green-100 text-green-700' :
                                  inv.status === 'expired' ? 'bg-gray-100 text-gray-500' :
                                    'bg-red-100 text-red-700'
                              }`}>
                              {inv.status.replace('_', ' ')}
                            </Badge>
                          </div>

                          <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2 mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-50">
                            {inv.status === "user_accepted" && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedInvitationId(inv.id);
                                    setIsRoleModalOpen(true);
                                  }}
                                  className="h-8 w-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                  title="Approve User"
                                >
                                  <Check size={14} strokeWidth={3} />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedInvitationId(inv.id);
                                    setIsRejectModalOpen(true);
                                  }}
                                  className="h-8 w-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                  title="Reject User"
                                >
                                  <X size={14} strokeWidth={3} />
                                </button>
                              </>
                            )}

                            {inv.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleResendInvitation(inv.id)}
                                  className="h-8 w-8 rounded-lg bg-[#f3f0fd] text-[#7661d3] hover:bg-[#7661d3] hover:text-white flex items-center justify-center transition-all shadow-sm"
                                  title="Resend"
                                >
                                  <RefreshCw size={14} strokeWidth={3} />
                                </button>
                                <button
                                  onClick={() => handleCancelInvitation(inv.id)}
                                  className="h-8 w-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                  title="Cancel"
                                >
                                  <Trash2 size={14} strokeWidth={3} />
                                </button>
                              </>
                            )}

                            {(inv.status === "approved" || inv.status === "rejected" || inv.status === "expired") && (
                              <button
                                onClick={() => handleCancelInvitation(inv.id)}
                                className="h-8 w-8 rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all"
                                title="Delete from history"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="border-0 shadow-xl bg-white gap-0 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between mb-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] border-b-2 border-gray-200 p-4 flex justify-between items-center">
                <div className="text-white">
                  <h3 className="text-xl font-extrabold">
                    Family Members
                  </h3>
                  <p className="text-sm">
                    Manage account members and roles
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => refetchMembers()}
                    className={`bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full transition-all ${isMemberLoading ? 'animate-spin' : ''}`}
                    title="Refetch Members"
                  >
                    <RefreshCw size={16} />
                  </button>
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
                  <span className="bg-gray-200 text-gray-700 font-bold text-xs px-3 py-1 rounded-full">
                    {pagination?.total} Members
                  </span>
                  <button
                    onClick={() => setIsAddMemberModalOpen(true)}
                    className="bg-[#313131] hover:bg-black text-white font-bold text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-md"
                  >
                    <Plus size={14} />
                    Add Member
                  </button>
                </div>
              </div>

              {viewMode === "card" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-3">
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
                <div className="p-4 bg-[#F8F7FC] min-h-[100px] animate-in fade-in duration-300">
                  <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    <div className="col-span-3">Member</div>
                    <div className="col-span-3">Email</div>
                    <div className="col-span-2">Role</div>
                    <div className="col-span-1">Account</div>
                    <div className="col-span-2">Joined</div>
                    <div className="col-span-1 text-right">Actions</div>
                  </div>
                  <div className="space-y-3">
                    {membersList.map((member: any) => (
                      <MemberTableRow key={member.id} member={member} />
                    ))}
                  </div>
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
                          ? "bg-[#313131] text-white shadow-md"
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

      {/* Role Selection Modal */}
      <InputModal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setSelectedInvitationId(null);
        }}
        onSubmit={async (role) => {
          if (selectedInvitationId) {
            await handleApproveInvitation(selectedInvitationId, role);
            setIsRoleModalOpen(false);
            setSelectedInvitationId(null);
          }
        }}
        title="Assign Role"
        description="Select the role for this member"
        inputLabel="Role"
        inputType="select"
        options={[
          { value: "member", label: "Member" },
          { value: "admin", label: "Admin" },
          { value: "super_admin", label: "Super Admin" },
          { value: "viewer", label: "Viewer" },
        ]}
        defaultValue="member"
        submitText="Approve & Assign"
        isLoading={approveInvMutation.isPending}
        icon={<ShieldCheck size={20} />}
      />

      {/* Rejection Reason Modal */}
      <InputModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setSelectedInvitationId(null);
        }}
        onSubmit={async (reason) => {
          if (selectedInvitationId) {
            await handleRejectInvitation(selectedInvitationId, reason || "Rejected by admin");
            setIsRejectModalOpen(false);
            setSelectedInvitationId(null);
          }
        }}
        title="Reject Invitation"
        description="Provide a reason for rejection (optional)"
        inputLabel="Rejection Reason"
        inputType="textarea"
        placeholder="e.g., Not authorized, Invalid request..."
        defaultValue=""
        submitText="Reject"
        required={false}
        isLoading={rejectInvMutation.isPending}
        icon={<X size={20} />}
      />

      {/* Cancel Invitation Confirmation */}
      <ConfirmationModal
        isOpen={isCancelConfirmOpen}
        onClose={() => {
          setIsCancelConfirmOpen(false);
          setSelectedInvitationId(null);
        }}
        onConfirm={confirmCancelInvitation}
        title="Cancel Invitation"
        message="Are you sure you want to cancel this invitation? The recipient will no longer be able to accept it."
        confirmText="Yes, Cancel"
        cancelText="No, Keep It"
        variant="warning"
        isLoading={cancelInvMutation.isPending}
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
    <div className="group relative bg-white rounded-xl border border-gray-100 hover:border-[#7661d3]/30 transition-all duration-300 p-3 shadow-sm hover:shadow-md h-full flex flex-col justify-between">
      {/* Decorative corner gradient */}
      <div className="absolute top-0 right-0 w-16 h-12 bg-gradient-to-br from-[#7661d3]/5 to-transparent rounded-tr-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="relative">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="relative shrink-0">
              {member.userId && member.user?.avatar ? (
                <img
                  src={member.user.avatar}
                  alt={member.user.firstName}
                  className="h-9 w-9 rounded-lg object-cover ring-2 ring-[#F3F0FD] shadow-sm"
                />
              ) : (
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#7661d3] to-[#3d326d] flex items-center justify-center text-white text-xs font-bold ring-2 ring-[#F3F0FD] shadow-sm">
                  {member.userId
                    ? `${member.user?.firstName?.[0] || ""}${member.user?.lastName?.[0] || ""}`
                    : member.name?.[0]?.toUpperCase() || "M"}
                </div>
              )}
              {member.role === "super_admin" && (
                <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  <Crown size={7} className="fill-white text-white" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-gray-800 text-sm truncate leading-tight">
                  {member.userId
                    ? `${member.user?.firstName || ""} ${member.user?.lastName || ""}`.trim()
                    : member.name || "Unnamed"}
                </h4>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div
                  className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide leading-none ${member.role === "super_admin"
                    ? "bg-amber-50 text-amber-700"
                    : member.role === "admin"
                      ? "bg-blue-50 text-blue-700"
                      : member.role === "member"
                        ? "bg-purple-50 text-purple-700"
                        : "bg-gray-50 text-gray-600"
                    }`}
                >
                  {member.role === "super_admin" ? "Super" : member.role}
                </div>
                {member.userId && member.user?.username && (
                  <span className="text-[10px] text-gray-400 truncate">@{member.user.username}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-1.5 mb-3 bg-[#F8F7FC] rounded-lg p-2">
          {member.userId && member.user?.email ? (
            <div className="flex items-center gap-2 text-xs">
              <Mail size={10} className="text-[#7661d3] shrink-0" />
              <span className="text-gray-600 font-medium truncate text-[10px]">{member.user.email}</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              {member.age && <span className="text-[10px] text-gray-600 font-bold">Age: {member.age}</span>}
              {member.sex && <span className="text-[10px] text-gray-600 capitalize">{member.sex}</span>}
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-gray-100/50">
            <span className="text-[9px] text-gray-400 uppercase font-semibold">Account</span>
            <span className="text-[10px] font-bold text-gray-700 capitalize">{member.account?.accountType || 'Household'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[9px] text-gray-400 uppercase font-semibold">Joined</span>
            <span className="text-[10px] font-bold text-gray-700">
              {new Date(member.createdAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <button
            onClick={() => setActiveMember(member)}
            className="col-span-2 bg-[#313131] hover:bg-black text-white font-bold text-[10px] py-1.5 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            Health Profile
          </button>

          {!isCurrentUser && (
            <>
              <button
                onClick={() => onEdit(member)}
                className="bg-white hover:bg-gray-50 text-gray-700 font-bold text-[10px] py-1.5 rounded-lg border border-gray-200 hover:border-[#7661d3] transition-all flex items-center justify-center gap-1"
              >
                <Edit size={10} /> Edit
              </button>

              {member.role !== "super_admin" && (
                <button
                  onClick={() => onDelete(member)}
                  className="bg-white hover:bg-red-50 text-red-600 font-bold text-[10px] py-1.5 rounded-lg border border-red-100 hover:border-red-200 transition-all flex items-center justify-center gap-1"
                >
                  <X size={10} /> Remove
                </button>
              )}
              {member.role === "super_admin" && (
                <div className="bg-gray-50 rounded-lg"></div>
              )}
            </>
          )}

          {isCurrentUser && (
            <div className="col-span-2 text-center text-[10px] text-gray-400 py-1 italic">
              Manage in Profile
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MemberTableRow = ({ member }: { member: any }) => (
  <div className="group bg-white rounded-xl p-4 md:py-3 md:px-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#7661d3]/30 transition-all grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
    <div className="col-span-12 md:col-span-3 flex items-center gap-3">
      <div className="relative shrink-0">
        {member.userId && member.user?.avatar ? (
          <img
            src={member.user.avatar}
            alt={member.user.firstName}
            className="h-10 w-10 rounded-xl object-cover ring-2 ring-[#F3F0FD]"
          />
        ) : (
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#7661d3] to-[#3d326d] flex items-center justify-center text-white text-sm font-bold ring-2 ring-[#F3F0FD]">
            {member.userId
              ? `${member.user?.firstName?.[0] || ""}${member.user?.lastName?.[0] || ""}`
              : member.name?.[0]?.toUpperCase() || "M"}
          </div>
        )}
        {member.role === "super_admin" && (
          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white">
            <Crown size={8} className="fill-white text-white" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="font-bold text-[#313131] text-sm truncate">
          {member.userId
            ? `${member.user?.firstName || ""} ${member.user?.lastName || ""}`.trim()
            : member.name || "Unnamed Member"}
        </p>
        {member.userId && member.user?.username && (
          <p className="text-xs text-gray-500 truncate">@{member.user.username}</p>
        )}
        {!member.userId && (
          <p className="text-xs text-[#7661d3] font-bold">In-house Member</p>
        )}
      </div>
    </div>

    <div className="col-span-6 md:col-span-3">
      <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">Email</div>
      {member.userId && member.user?.email ? (
        <p className="text-xs text-gray-600 font-medium truncate">{member.user.email}</p>
      ) : (
        <div className="space-y-0.5">
          {member.age && (
            <p className="text-xs text-gray-600 font-medium">
              Age: {member.age}
            </p>
          )}
          {member.sex && (
            <p className="text-[10px] text-gray-500 capitalize">{member.sex}</p>
          )}
        </div>
      )}
    </div>

    <div className="col-span-6 md:col-span-2">
      <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">Role</div>
      <div
        className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${member.role === "super_admin"
          ? "bg-amber-50 text-amber-600 border-amber-100"
          : member.role === "admin"
            ? "bg-blue-50 text-blue-600 border-blue-100"
            : "bg-purple-50 text-purple-600 border-purple-100"
          }`}
      >
        {member.role === "super_admin" ? "Super Admin" : member.role}
      </div>
    </div>

    <div className="col-span-6 md:col-span-1">
      <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">Account</div>
      <p className="text-xs text-gray-600 font-medium capitalize truncate">
        {member.account?.accountType || "Household"}
      </p>
    </div>

    <div className="col-span-6 md:col-span-2">
      <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">Joined</div>
      <p className="text-xs text-gray-600 font-medium">
        {new Date(member.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>
    </div>

    <div className="col-span-12 md:col-span-1 flex items-center justify-end gap-1 mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-50">
      <button
        className="h-8 w-8 rounded-lg bg-[#F3F0FD] hover:bg-[#7661d3] text-[#7661d3] hover:text-white flex items-center justify-center transition-all shadow-sm"
        title="View Profile"
      >
        <User size={14} />
      </button>
      {member.userId && (
        <div className="flex items-center gap-1">
          <button
            className="h-8 w-8 rounded-lg bg-gray-50 hover:bg-gray-600 text-gray-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
            title="Edit"
          >
            <Edit size={14} />
          </button>

          {member.role !== "super_admin" && (
            <button
              className="h-8 w-8 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
              title="Remove"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  </div>
);

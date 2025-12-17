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
  ChevronRight
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
import NavigationMenu from "@/components/common/navigation-menu";
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

const mockInvitations = [
  {
    id: 1,
    sender: "Rahul Verma",
    email: "rahul.v@gmail.com",
    role: "Admin",
    date: "2024-12-14",
    status: "Pending",
    avatar: "R"
  },
  {
    id: 2,
    sender: "Priya Singh",
    email: "priya.singh@yahoo.com",
    role: "Member",
    date: "2024-12-12",
    status: "Accepted",
    avatar: "P"
  },
  {
    id: 3,
    sender: "Amit Patel",
    email: "amit.patel@work.com",
    role: "Viewer",
    date: "2024-12-10",
    status: "Rejected",
    avatar: "A"
  },
  {
    id: 4,
    sender: "Sneha Gupta",
    email: "sneha.g@outlook.com",
    role: "Member",
    date: "2024-12-08",
    status: "Accepted",
    avatar: "S"
  }
];

const formatCurrency = (value: string | null) => {
  if (!value) return "—";
  return `₹${Number(value).toLocaleString()}`;
};

const calculateResetInDays = (lastReset?: string) => {
  if (!lastReset) return 0;
  const diff =
    Date.now() - new Date(lastReset).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return Math.max(7 - days, 0);
};

export default function AccountPage() {

  const [invitations, setInvitations] = useState(mockInvitations);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState("card"); // 'card' or 'table'
  const [activeMember, setActiveMember] = useState(null);
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
    loading
  } = useSelector((state: RootState) => state.account);

  const { user } = useSelector((state: RootState) => state.auth);

  const { data: members, isLoading: isMemberLoading } =
    useMembers({ accountId: activeAccountId! });




  console.log({ activeMember })

  const membersList = members?.data?.data;
  const pagination = members?.data.pagination;

  console.log(membersList, "jhjhjhjhjh")
  const router = useRouter();

  const handleInvitationAction = (id: number, action: 'Accepted' | 'Rejected') => {
    // In a real app, you would make an API call here.
    // For now, we optimistically update the state.
    setInvitations(prev => prev.map(inv =>
      inv.id === id ? { ...inv, status: action } : inv
    ));
  };

  const onAccountChange = (id: string) => {
    dispatch(setActiveAccountId(id));
  };



  if (loading) {
    return (
      <Loader />
    );
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT SIDEBAR: Account Selection & Menu */}
          <div className="lg:col-span-3 space-y-5">
            {/* Account Selector Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-white/60 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#F3F0FD] rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />

              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block relative z-10">
                Switch Account
              </label>

              <Select value={account?.id!} onValueChange={onAccountChange}>
                <SelectTrigger className="w-full h-auto py-2.5 rounded-xl border border-gray-100 bg-[#F8F7FC] hover:border-[#7661d3]/30 focus:ring-0 focus:ring-offset-0 transition-all px-3 text-left shadow-sm mb-2">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7661d3] to-[#3d326d] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                      {account?.accountName.charAt(0)}
                    </div>
                    <div className="flex flex-col overflow-hidden text-left">
                      <span className="font-bold text-[#313131] text-sm truncate block">{account?.accountName}</span>
                      <span className="text-[10px] text-gray-500 truncate block font-medium">#{account?.accountNumber}</span>
                    </div>
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-gray-100 shadow-xl p-1 bg-white">
                  {accountsList?.map((acc: any) => (
                    <SelectItem
                      key={acc.id}
                      value={acc.id}
                      className="rounded-lg p-2 focus:bg-[#F3F0FD] cursor-pointer"
                    >
                      <span className="sr-only">{acc.accountName}</span>

                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#f3f0fd] flex items-center justify-center text-[#6d53e1] font-bold text-[10px]">
                          {acc.accountName.charAt(0)}
                        </div>

                        <div className="min-w-0">
                          <p className="font-bold text-[#313131] text-xs truncate">
                            {acc.accountName}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate">
                            #{acc.accountNumber}
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>

              </Select>
            </div>

            {/* Navigation Menu */}
            <NavigationMenu
              items={[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'budget', label: 'Budget & Finance', icon: Wallet },
                { id: 'members', label: 'Family Members', icon: Users },
                { id: 'invitations', label: 'Invitations', icon: MailIcon },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>

          {/* RIGHT CONTENT: Dynamic Sections */}
          <div className="lg:col-span-9 space-y-5">

            {/* Compact Highlights Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Budget Card */}
              <div className="bg-white rounded-xl p-5 shadow-sm relative overflow-hidden group border border-gray-100/50 hover:shadow-md transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#F3F0FD] rounded-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110" />

                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <span className="text-gray-500 font-bold text-[11px] uppercase tracking-wide">
                      {activeBudget?.label ?? "No Budget Set"}
                    </span>

                    <h3 className="text-2xl font-extrabold text-[#313131] tracking-tight">
                      {activeBudget
                        ? `$${activeBudget.amount.toLocaleString()}`
                        : "—"}
                    </h3>
                  </div>

                  <div className="h-12 w-12 bg-[#F3F0FD] rounded-xl flex items-center justify-center text-[#7661d3]">
                    <Calendar size={20} />
                  </div>
                </div>

                <div className="mt-3 relative z-10 flex items-center gap-2">
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#7dab4f] h-full transition-all"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>

                  <span className="text-[10px] font-bold text-[#7dab4f] whitespace-nowrap">
                    {Math.round(usagePercent)}% Used
                  </span>
                </div>
              </div>

              {/* Current Balance Card */}
              <div className="bg-[#3d326d] rounded-xl p-5 shadow-md shadow-[#3d326d]/10 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-10 -mt-10 group-hover:scale-105 transition-transform duration-700" />

                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <span className="text-white/70 font-bold text-[11px] uppercase tracking-wide block mb-1">
                      Current Balance
                    </span>

                    <h3 className="text-2xl font-extrabold text-white tracking-tight">

                      {activeBudget
                        ? `$${Math.max(
                          activeBudget.amount - spent,
                          0
                        ).toLocaleString()}`
                        : "—"}
                    </h3>
                  </div>

                  <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-sm">
                    <Wallet size={20} />
                  </div>
                </div>

                <div className="mt-3 relative z-10 flex items-center justify-between text-[11px]">
                  <span className="text-[#7dab4f] font-bold bg-white/10 px-2 py-0.5 rounded text-[10px]">
                    {usagePercent < 80 ? "Healthy" : "Attention"}
                  </span>

                  <span className="text-white/60">
                    Resets in {resetInDays} days
                  </span>
                </div>
              </div>
            </div>


            {/* TABS CONTENT AREA */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 min-h-[400px]">

              {activeTab === "overview" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-extrabold text-[#313131]">
                      Account Information
                    </h3>
                    <button className="text-[#7661d3] font-bold text-xs hover:bg-[#F3F0FD] px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5">
                      <Edit size={14} /> Edit
                    </button>
                  </div>

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
                      {
                        label: "Location",
                        value: [account?.city, account?.state, account?.country]
                          .filter(Boolean)
                          .join(", "),
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
                </div>
              )}


              {activeTab === "budget" && account && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

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
                        <div className={`absolute top-0 left-0 w-full h-1 ${item.color}`} />
                        <div className="text-3xl mb-2">{item.icon}</div>
                        <p className="text-sm font-bold text-gray-700">{item.label}</p>
                        <p className="text-2xl font-extrabold text-[#313131]">
                          {item.value}%
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* STATS */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Current Streak", value: account.weeklyFoodStreak },
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
              )}

              {activeTab === 'invitations' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-[#313131]">Invitations</h3>
                      <p className="text-sm text-gray-500 mt-1">Manage pending invitations and history</p>
                    </div>
                    <span className="bg-[#F3F0FD] text-[#7661d3] font-bold text-xs px-3 py-1 rounded-full">
                      {invitations.filter(i => i.status === 'Pending').length} Pending
                    </span>
                  </div>

                  <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader className="bg-[#F8F7FC]">
                        <TableRow>
                          <TableHead className="font-bold text-gray-600">Sender</TableHead>
                          <TableHead className="font-bold text-gray-600">Role</TableHead>
                          <TableHead className="font-bold text-gray-600">Date Received</TableHead>
                          <TableHead className="font-bold text-gray-600">Status</TableHead>
                          <TableHead className="text-right font-bold text-gray-600">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invitations.map((inv) => (
                          <TableRow key={inv.id} className="hover:bg-gray-50/50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-[#3d326d] flex items-center justify-center text-white text-xs font-bold">
                                  {inv.avatar}
                                </div>
                                <div>
                                  <p className="font-bold text-[#313131] text-sm">{inv.sender}</p>
                                  <p className="text-xs text-gray-500">{inv.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 bg-gray-100 w-fit px-2 py-1 rounded text-xs font-bold text-gray-600">
                                <ShieldCheck size={12} />
                                {inv.role}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600 font-medium">
                              {inv.date}
                            </TableCell>
                            <TableCell>
                              {inv.status === 'Pending' && (
                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0 shadow-none font-bold">Pending</Badge>
                              )}
                              {inv.status === 'Accepted' && (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0 shadow-none font-bold">Accepted</Badge>
                              )}
                              {inv.status === 'Rejected' && (
                                <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0 shadow-none font-bold">Rejected</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {inv.status === 'Pending' ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleInvitationAction(inv.id, 'Accepted')}
                                    className="h-8 w-8 rounded-full bg-green-50 text-green-600 hover:bg-green-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                    title="Accept"
                                  >
                                    <Check size={16} strokeWidth={3} />
                                  </button>
                                  <button
                                    onClick={() => handleInvitationAction(inv.id, 'Rejected')}
                                    className="h-8 w-8 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                    title="Reject"
                                  >
                                    <X size={16} strokeWidth={3} />
                                  </button>
                                </div>
                              ) : (
                                <button className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 flex items-center justify-center ml-auto">
                                  <MoreHorizontal size={16} />
                                </button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}






              {activeTab === "members" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-extrabold text-[#313131]">Family Members</h3>
                      <p className="text-sm text-gray-500 mt-1">Manage account members and roles</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setViewMode("card")}
                          className={`p-1.5 rounded transition-all ${viewMode === "card" ? "bg-white shadow-sm" : "text-gray-400"
                            }`}
                        >
                          <Grid3x3 size={16} />
                        </button>
                        <button
                          onClick={() => setViewMode("table")}
                          className={`p-1.5 rounded transition-all ${viewMode === "table" ? "bg-white shadow-sm" : "text-gray-400"
                            }`}
                        >
                          <List size={16} />
                        </button>
                      </div>
                      <span className="bg-[#F3F0FD] text-[#7661d3] font-bold text-xs px-3 py-1 rounded-full">
                        {pagination?.total} Members
                      </span>
                      <button className="bg-[#7661d3] hover:bg-[#6952c2] text-white font-bold text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-sm">
                        <Plus size={14} />
                        Invite
                      </button>
                    </div>
                  </div>

                  {viewMode === "card" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {membersList?.map((member) => (
                        <MemberCard key={member.id} member={member} userId={user?.id} setActiveMember={(member) => router.push(`/health-profile/${member?.id}`)} />
                      ))}
                    </div>
                  ) : (
                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-[#F8F7FC]">
                          <tr>
                            <th className="text-left py-3 px-4 font-bold text-gray-600 text-xs uppercase">Member</th>
                            <th className="text-left py-3 px-4 font-bold text-gray-600 text-xs uppercase">Email</th>
                            <th className="text-left py-3 px-4 font-bold text-gray-600 text-xs uppercase">Role</th>
                            <th className="text-left py-3 px-4 font-bold text-gray-600 text-xs uppercase">Account</th>
                            <th className="text-left py-3 px-4 font-bold text-gray-600 text-xs uppercase">Joined</th>
                            <th className="text-left py-3 px-4 font-bold text-gray-600 text-xs uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {membersList.map((member) => (
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
                        Showing <span className="font-bold">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
                        <span className="font-bold">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{" "}
                        <span className="font-bold">{pagination.total}</span> members
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={!pagination.hasPrev}
                          onClick={() => setCurrentPage(p => p - 1)}
                          className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${pagination.hasPrev
                            ? "bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                          <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
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
                          onClick={() => setCurrentPage(p => p + 1)}
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
              {(activeTab !== 'overview' && activeTab !== 'budget' && activeTab !== 'invitations' && activeTab !== 'members') && (
                <div className="flex flex-col items-center justify-center h-[300px] text-center animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-20 h-20 bg-[#F3F0FD] text-[#7661d3] rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <Settings size={32} className="animate-spin-slow" />
                  </div>
                  <h3 className="text-xl font-bold text-[#313131] mb-2">Coming Soon</h3>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto">
                    We are currently crafting the pixel-perfect {activeTab} experience.
                  </p>
                </div>
              )}
              {/* Placeholder for other tabs
              {(activeTab !== 'overview' && activeTab !== 'budget' && activeTab !== 'invitations') && (
                <div className="flex flex-col items-center justify-center h-[300px] text-center animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-20 h-20 bg-[#F3F0FD] text-[#7661d3] rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <Settings size={32} className="animate-spin-slow" />
                  </div>
                  <h3 className="text-xl font-bold text-[#313131] mb-2">Coming Soon</h3>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto">
                    We are currently crafting the pixel-perfect {activeTab} experience.
                  </p>
                </div>
              )} */}

            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .animate-spin-slow {
            animation: spin 8s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}



const MemberCard = ({ member, userId, setActiveMember }) => (







  <div className="bg-white rounded-xl border border-gray-100 hover:border-[#7661d3]/30 transition-all p-5 shadow-sm hover:shadow-md group">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          {member.user?.avatar ? (
            <img
              src={member.user.avatar}
              alt={member.user.firstName}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-[#F3F0FD]"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#7661d3] to-[#3d326d] flex items-center justify-center text-white text-base font-bold ring-2 ring-[#F3F0FD] shadow-sm">
              {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
            </div>
          )}
          {member.role === 'super_admin' && (
            <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-[#7dab4f] rounded-full flex items-center justify-center border-2 border-white">
              <Crown size={10} className="fill-white text-white" />
            </div>
          )}
        </div>

        <div>
          <h4 className="font-bold text-[#313131] text-base">
            {member.user?.firstName} {member.user?.lastName} {userId == member?.userId && "(You)"}
          </h4>
          <p className="text-xs text-gray-500 font-medium">
            @{member.user?.username}
          </p>
        </div>
      </div>

      <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${member.role === 'super_admin'
        ? 'bg-[#7dab4f]/10 text-[#7dab4f]'
        : member.role === 'admin'
          ? 'bg-blue-50 text-blue-600'
          : member.role === 'member'
            ? 'bg-purple-50 text-purple-600'
            : 'bg-gray-100 text-gray-600'
        }`}>
        {member.role === 'super_admin' ? 'Super Admin' : member.role}
      </div>
    </div>

    <div className="space-y-2 mb-4 pb-4 border-b border-gray-50">
      <div className="flex items-center gap-2 text-sm">
        <Mail size={14} className="text-gray-400" />
        <span className="text-gray-600 font-medium">{member.user?.email}</span>
      </div>

      {member.name && (
        <div className="flex items-center gap-2 text-sm">
          <User size={14} className="text-gray-400" />
          <span className="text-gray-600 font-medium">{member.name}</span>
        </div>
      )}

      {(member.age || member.sex) && (
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
          {member.age && <span>Age: {member.age}</span>}
          {member.sex && <span>•</span>}
          {member.sex && <span className="capitalize">{member.sex}</span>}
        </div>
      )}
    </div>

    <div className="bg-[#F8F7FC] rounded-lg p-3 mb-4">
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-gray-500 font-medium mb-1">Account Type</p>
          <p className="text-[#313131] font-bold capitalize">{member.account?.accountType}</p>
        </div>
        <div>
          <p className="text-gray-500 font-medium mb-1">Member Since</p>
          <p className="text-[#313131] font-bold">
            {new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={() => setActiveMember(member)}
        className="col-span-2 bg-[#313131] hover:bg-black text-white font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
        title="View Health Profile"
      >
        <User size={13} />
        <span>View Health Profile</span>
      </button>

      {member.userId && (
        <>
          <button
            className="bg-white hover:bg-gray-50 text-[#313131] font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 border border-gray-200 shadow-sm"
            title="Change Role"
          >
            <ShieldCheck size={13} />
            <span>Change Role</span>
          </button>

          <button
            className="bg-white hover:bg-gray-50 text-[#313131] font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 border border-gray-200 shadow-sm"
            title="Edit Member"
          >
            <Edit size={13} />
            <span>Edit</span>
          </button>

          {member.role !== 'super_admin' && (
            <button
              className="col-span-2 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 border border-red-100 hover:border-red-500"
              title="Remove Member"
            >
              <X size={13} />
              <span>Remove Member</span>
            </button>
          )}
        </>
      )}

      {!member.userId && (
        <button
          className="col-span-2 bg-white hover:bg-gray-50 text-[#313131] font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 border border-gray-200 shadow-sm"
          title="More Options"
        >
          <MoreHorizontal size={13} />
          <span>More Options</span>
        </button>
      )}
    </div>
  </div>
);

const MemberTableRow = ({ member }) => (
  <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
    <td className="py-4 px-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          {member.user?.avatar ? (
            <img
              src={member.user.avatar}
              alt={member.user.firstName}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-[#F3F0FD]"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#7661d3] to-[#3d326d] flex items-center justify-center text-white text-sm font-bold ring-2 ring-[#F3F0FD]">
              {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
            </div>
          )}
          {member.role === 'super_admin' && (
            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-[#7dab4f] rounded-full flex items-center justify-center border-2 border-white">
              <Crown size={8} className="fill-white text-white" />
            </div>
          )}
        </div>
        <div>
          <p className="font-bold text-[#313131] text-sm">
            {member.user?.firstName} {member.user?.lastName}
          </p>
          <p className="text-xs text-gray-500">@{member.user?.username}</p>
        </div>
      </div>
    </td>
    <td className="py-4 px-4">
      <p className="text-sm text-gray-600 font-medium">{member.user?.email}</p>
    </td>
    <td className="py-4 px-4">
      <div className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${member.role === 'super_admin'
        ? 'bg-[#7dab4f]/10 text-[#7dab4f]'
        : member.role === 'admin'
          ? 'bg-blue-50 text-blue-600'
          : 'bg-purple-50 text-purple-600'
        }`}>
        {member.role === 'super_admin' ? 'Super Admin' : member.role}
      </div>
    </td>
    <td className="py-4 px-4">
      <p className="text-sm text-gray-600 font-medium capitalize">{member.account?.accountType}</p>
    </td>
    <td className="py-4 px-4">
      <p className="text-sm text-gray-600 font-medium">
        {new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
            {member.role !== 'super_admin' && (
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
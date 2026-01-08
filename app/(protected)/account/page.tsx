"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  User,
  Wallet,
  Calendar,
  Crown,
  Users,
  Settings,
  Plus,
  MailIcon,
  ChevronDown,
  CloudCog,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import pattern1 from "@/public/hero-pattern-1.svg";
import pattern2 from "@/public/hero-pattern-2.svg";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Loader from "@/components/common/Loader";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store.redux";
import {
  fetchAccountDetail,
  setActiveAccountId,
} from "@/redux/features/account/account.slice";
import AddMemberModal from "@/components/account/AddMemberModal";
import EditMemberModal from "@/components/account/EditMemberModal";
import DeleteMemberModal from "@/components/account/DeleteMemberModal";
import DeleteAccountModal from "@/components/account/DeleteAccountModal";
import EditAccountModal from "@/components/account/EditAccountModal";
import { AccountOverviewTab } from "@/components/account/tabs/AccountOverviewTab";
import { BudgetOverviewTab } from "@/components/account/tabs/BudgetOverviewTab";
import { MembersTab } from "@/components/account/tabs/MembersTab";
import { InvitationsTab } from "@/components/account/tabs/InvitationsTab";

import { usePermissions } from "@/hooks/use-permissions";
import { PERMISSIONS } from "@/lib/permissions";

export default function AccountPage() {
  const { can, isMember } = usePermissions();
  const [activeTab, setActiveTab] = useState("overview");
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(
    new Set(["overview"]),
  );

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
    myMembership,

    activeBudget,
    spent,
    usagePercent,
    resetInDays,
    loading,
  } = useSelector((state: RootState) => state.account);

  const user = useSelector((state: RootState) => state.auth.user);

  // Handle tab change with lazy loading tracking
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setVisitedTabs((prev) => new Set([...prev, tabId]));
  };

  const onAccountChange = (id: string) => {
    dispatch(setActiveAccountId(id));
  };

  const handleRefetch = () => {
    dispatch(fetchAccountDetail(activeAccountId!) as any);
  };

  if (loading && !account) {
    return <Loader />;
  }

  return (
    <div className="h-[calc(100vh-57px)] bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00] relative overflow-auto">
      {/* Main Container */}
      <div className="max-w-8xl mx-auto px-4 md:px-6 relative z-10 py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-6 gap-6 animate-fade-in">
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
            {!isMember && (
              <button className="bg-white hover:bg-gray-50 text-[#313131] font-bold py-2.5 px-4 rounded-xl shadow-sm border border-gray-200 transition-all flex items-center gap-2 text-sm">
                <Settings size={18} className="text-[#7661d3]" />
                Settings
              </button>
            )}

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
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 relative overflow-hidden group h-full hover:shadow-lg transition-all">
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
                  <SelectContent className="rounded-xl border border-gray-200 shadow-xl p-1 bg-white">
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
                            <Badge
                              variant="outline"
                              className="text-[9px] h-4 px-1 py-0 font-medium text-gray-400 border-gray-200"
                            >
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
            <div className="bg-white rounded-xl lg:p-6 p-4 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] relative overflow-hidden group border border-gray-200 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:border-[#7661d3]/20 transition-all">
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
                  <span className="text-xs font-medium text-gray-500">
                    Budget Usage
                  </span>
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
            <div className="bg-gradient-to-br from-[#3d326d] to-[#2d2454] rounded-xl p-6 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] text-white relative overflow-hidden group hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all">
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
            {
              id: "invitations",
              label: "Invitations",
              icon: MailIcon,
              permission: PERMISSIONS.INVITE_VIEW,
            },
          ]
            .filter((tab) => !tab.permission || can(tab.permission))
            .map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-5 py-2 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-[var(--primary)] text-white"
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
            <AccountOverviewTab
              account={account}
              activeAccountId={activeAccountId!}
              loading={loading}
              onRefetch={handleRefetch}
              onEdit={() => setIsEditAccountModalOpen(true)}
              onDelete={() => setIsDeleteAccountModalOpen(true)}
            />
          )}

          {activeTab === "budget" && account && (
            <BudgetOverviewTab
              account={account}
              activeBudget={activeBudget}
              spent={spent}
              usagePercent={usagePercent}
              resetInDays={resetInDays}
              activeAccountId={activeAccountId!}
              loading={loading}
              onRefetch={handleRefetch}
            />
          )}

          {activeTab === "invitations" && (
            <InvitationsTab
              activeAccountId={activeAccountId!}
              account={account}
              isActive={visitedTabs.has("invitations")}
              onInviteNew={() => setIsAddMemberModalOpen(true)}
            />
          )}

          {activeTab === "members" && (
            <MembersTab
              activeAccountId={activeAccountId!}
              userId={user?.id!}
              isActive={visitedTabs.has("members")}
              onAddMember={() => setIsAddMemberModalOpen(true)}
              onEditMember={(member) => {
                setSelectedMember(member);
                setIsEditMemberModalOpen(true);
              }}
              onDeleteMember={(member) => {
                setSelectedMember(member);
                setIsDeleteMemberModalOpen(true);
              }}
            />
          )}
        </div>
      </div>

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
                                {acc.isOwner &
      `}</style>
    </div>
  );
}

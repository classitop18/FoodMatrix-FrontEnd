"use client";

import React, { useState } from "react";
import { X, User, Calendar, Users2, Loader2, Mail, ShieldCheck, Info } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MemberService } from "@/services/member/member.service";
import { InvitationService } from "@/services/invitation/invitation.service";
import { toast } from "sonner";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
}

const memberService = new MemberService();

export default function AddMemberModal({
  isOpen,
  onClose,
  accountId,
}: AddMemberModalProps) {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<"internal" | "invite">("internal");

  // States for Internal Member
  const [internalData, setInternalData] = useState({
    name: "",
    age: "",
    sex: "male",
    role: "member",
  });

  // States for Invitation
  const [inviteData, setInviteData] = useState({
    email: "",
    role: "member",
  });

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "super_admin", label: "Super Admin" },
    { value: "viewer", label: "Viewer" },
    { value: "member", label: "Member" },
  ];

  // Mutation for Internal Member
  const createMemberMutation = useMutation({
    mutationFn: async (data: any) => await memberService.createMember(data),
    onSuccess: () => {
      toast.success("Member added successfully!");
      queryClient.invalidateQueries({ queryKey: ["members", accountId] });
      onClose();
      setInternalData({ name: "", age: "", sex: "male", role: "member" });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add member");
    },
  });

  // Mutation for Invitation
  const sendInviteMutation = useMutation({
    mutationFn: async (data: any) => await InvitationService.sendInvitation(data),
    onSuccess: () => {
      toast.success("Invitation sent successfully via email!");
      onClose();
      setInviteData({ email: "", role: "member" });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to send invitation");
    },
  });

  const handleInternalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    createMemberMutation.mutate({
      accountId,
      userId: null,
      name: internalData.name.trim(),
      age: internalData.age ? parseInt(internalData.age) : null,
      sex: internalData.sex,
      role: internalData.role,
    });
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    sendInviteMutation.mutate({
      email: inviteData.email.trim(),
      accountId,
      proposedRole: inviteData.role,
    });
  };

  if (!isOpen) return null;

  const isPending = createMemberMutation.isPending || sendInviteMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7661d3] to-[#3d326d] text-white p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Users2 size={20} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold">Add Member</h2>
                <p className="text-sm text-white/80">Grow your household</p>
              </div>
            </div>
            <button onClick={onClose} className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
              <X size={18} />
            </button>
          </div>

          {/* Sub-Tabs */}
          <div className="flex bg-black/10 rounded-lg p-1">
            <button
              onClick={() => setActiveSubTab("internal")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeSubTab === "internal" ? "bg-white text-[#7661d3] shadow-sm" : "text-white/60 hover:text-white"
                }`}
            >
              Add Profile
            </button>
            <button
              onClick={() => setActiveSubTab("invite")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeSubTab === "invite" ? "bg-white text-[#7661d3] shadow-sm" : "text-white/60 hover:text-white"
                }`}
            >
              Invite User
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeSubTab === "internal" ? (
            /* INTERNAL FLOW */
            <form onSubmit={handleInternalSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Full Name *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#7661d3]/20 outline-none"
                    value={internalData.name}
                    onChange={(e) => setInternalData({ ...internalData, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Age</label>
                  <input
                    type="number"
                    placeholder="Age"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    value={internalData.age}
                    onChange={(e) => setInternalData({ ...internalData, age: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Sex</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    value={internalData.sex}
                    onChange={(e) => setInternalData({ ...internalData, sex: e.target.value })}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Role</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold"
                  value={internalData.role}
                  onChange={(e) => setInternalData({ ...internalData, role: e.target.value })}
                >
                  {roleOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl flex gap-3">
                <Info size={16} className="text-blue-500 shrink-0" />
                <p className="text-[10px] text-blue-700 leading-normal">
                  Internal profiles are for family members who don't have their own account. You can manage their health data directly.
                </p>
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7661d3] to-[#3d326d] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : "Add Profile"}
              </button>
            </form>
          ) : (
            /* INVITE FLOW */
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Email Address *</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#7661d3]/20 outline-none"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Access Level</label>
                <div className="relative">
                  <ShieldCheck size={16} className="absolute left-3 top-3 text-gray-400" />
                  <select
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold"
                    value={inviteData.role}
                    onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                  >
                    {roleOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl flex gap-3">
                <Info size={16} className="text-amber-500 shrink-0" />
                <p className="text-[10px] text-amber-700 leading-normal">
                  User will receive an email. After they accept, you'll need to <strong>Approve</strong> them from the Invitations tab.
                </p>
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#7661d3] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : "Send Invitation"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

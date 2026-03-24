"use client";
import React, { useState } from "react";
import { Mail, ArrowLeft, MailPlus } from "lucide-react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store.redux";
import Loader from "@/components/common/Loader";
import AddMemberModal from "@/components/account/AddMemberModal";
import { ReceivedInvitations } from "@/components/account/invitations/ReceivedInvitations";
import { SentInvitations } from "@/components/account/invitations/SentInvitations";
import { usePermissions } from "@/hooks/use-permissions";
import { PERMISSIONS } from "@/lib/permissions";

export default function InvitationsModulePage() {
  const { can } = usePermissions();
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  // Redux State
  const { activeAccountId, account, loading } = useSelector(
    (state: RootState) => state.account
  );

  if (!can(PERMISSIONS.INVITE_VIEW)) {
    return (
      <div className="p-10 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100 mt-10 max-w-lg mx-auto">
        You don't have permission to view invitations.
      </div>
    );
  }

  if (loading && !account) {
    return <Loader />;
  }

  return (
    <div className="bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00] relative overflow-auto min-h-screen">
      <div className="max-w-8xl mx-auto px-4 md:px-6 relative z-10 py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-8 gap-6 animate-fade-in">
          <div>
            <Link
              href="/account"
              className="inline-flex items-center gap-1 text-sm font-bold text-[#7661d3] hover:text-[#5c4aab] transition-colors mb-3 group"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              Back to Account
            </Link>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-[#7661d3] to-[#3d326d] rounded-xl flex items-center justify-center text-white shadow-md">
                <Mail size={20} />
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-[#313131] tracking-tight">
                Invitations Manager
              </h1>
            </div>
            <p className="text-sm text-gray-500 font-medium mt-1 ml-13">
              Manage sent and received invitations for <span className="text-[#3d326d] font-bold">{account?.accountName || "your account"}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddMemberModalOpen(true)}
              className="bg-gradient-to-r from-[#3d326d] to-[#2d2454] hover:shadow-xl hover:scale-105 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm border-0"
            >
              <MailPlus size={16} />
              Invite New User
            </button>
          </div>
        </div>

        {/* Invitations Content */}
        {activeAccountId ? (
          <div className="space-y-6 animate-slide-up ">
            <ReceivedInvitations
              isActive={true}
              activeAccountId={activeAccountId}
            />

            <SentInvitations
              isActive={true}
              activeAccountId={activeAccountId}
              account={account}
              onInviteNew={() => setIsAddMemberModalOpen(true)}
            />
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
            Please setup or select an account first to manage invitations.
          </div>
        )}
      </div>

      {activeAccountId && (
        <AddMemberModal
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
          accountId={activeAccountId}
        />
      )}
    </div>
  );
}

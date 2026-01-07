import React, { useState } from "react";
import {
  MailIcon,
  Send,
  RefreshCw,
  Mail,
  ShieldCheck,
  Check,
  X,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  useAccountInvitations,
  useMyInvitations,
} from "@/services/invitation/invitation.query";
import {
  useAcceptInvitation,
  useApproveInvitation,
  useRejectInvitation,
  useResendInvitation,
  useCancelInvitation,
} from "@/services/invitation/invitation.mutation";
import InputModal from "@/components/common/InputModal";
import ConfirmationModal from "@/components/common/ConfirmationModal";

interface InvitationsTabProps {
  activeAccountId: string;
  account: any;
  isActive: boolean;
  onInviteNew: () => void;
}

export const InvitationsTab: React.FC<InvitationsTabProps> = ({
  activeAccountId,
  account,
  isActive,
  onInviteNew,
}) => {
  // Modal states
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [selectedInvitationId, setSelectedInvitationId] = useState<
    string | null
  >(null);

  // Refetch states
  const [isRefetchingMyInv, setIsRefetchingMyInv] = useState(false);
  const [isRefetchingAccInv, setIsRefetchingAccInv] = useState(false);

  // Fetch Queries with lazy loading
  const {
    data: myInvitationsData,
    isLoading: isMyInvLoading,
    refetch: refetchMyInv,
  } = useMyInvitations({
    enabled: isActive, // Lazy loading - only fetch when tab is active
  });

  const {
    data: accountInvitationsData,
    isLoading: isAccInvLoading,
    refetch: refetchAccInv,
  } = useAccountInvitations(activeAccountId, {
    enabled: isActive && !!activeAccountId, // Lazy loading - only fetch when tab is active
  });

  const receivedInvitations = (myInvitationsData as any)?.data || [];
  const sentInvitations: any = accountInvitationsData || {
    data: [],
    pagination: {},
  };

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

  const handleApproveInvitation = async (
    invitationId: string,
    role: string,
  ) => {
    await approveInvMutation.mutateAsync({
      invitationId,
      role,
      accountId: activeAccountId,
    });
  };

  const handleRejectInvitation = async (
    invitationId: string,
    reason?: string,
  ) => {
    await rejectInvMutation.mutateAsync({
      invitationId,
      reason,
      accountId: activeAccountId,
    });
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
    await cancelInvMutation.mutateAsync({
      invitationId: selectedInvitationId,
      accountId: activeAccountId,
    });
    setIsCancelConfirmOpen(false);
    setSelectedInvitationId(null);
  };

  // Refetch handlers with debouncing
  const handleRefetchMyInv = async () => {
    if (isRefetchingMyInv || isMyInvLoading) return;
    setIsRefetchingMyInv(true);
    await refetchMyInv();
    setTimeout(() => setIsRefetchingMyInv(false), 1000);
  };

  const handleRefetchAccInv = async () => {
    if (isRefetchingAccInv || isAccInvLoading) return;
    setIsRefetchingAccInv(true);
    await refetchAccInv();
    setTimeout(() => setIsRefetchingAccInv(false), 1000);
  };

  const isMyInvLoading_combined = isMyInvLoading || isRefetchingMyInv;
  const isAccInvLoading_combined = isAccInvLoading || isRefetchingAccInv;

  return (
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
                onClick={handleRefetchMyInv}
                disabled={isMyInvLoading_combined}
                className={`bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isMyInvLoading_combined ? "animate-spin" : ""
                }`}
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
                  className="group bg-white rounded-xl p-4 md:py-3 md:px-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-[#7661d3]/30 transition-all grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
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
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Invited By
                    </div>
                    <div className="text-sm font-semibold text-gray-700">
                      {inv.inviter?.firstName} {inv.inviter?.lastName}
                    </div>
                  </div>

                  <div className="col-span-6 md:col-span-2">
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Status
                    </div>
                    <Badge
                      className={`border-0 font-bold capitalize px-2.5 py-0.5 h-6 text-[10px] ${
                        inv.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : inv.status === "user_accepted"
                            ? "bg-blue-100 text-blue-700"
                            : inv.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                      }`}
                    >
                      {inv.status.replace("_", " ")}
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
                          onClick={() =>
                            handleRejectInvitation(inv.id, "Rejected by user")
                          }
                          className="h-8 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold rounded-lg text-xs transition-colors"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {inv.status === "user_accepted" && (
                      <span className="text-[10px] italic text-gray-400 font-medium">
                        Awaiting admin approval
                      </span>
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
              Manage invitations for {account?.accountName || "this account"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefetchAccInv}
              disabled={isAccInvLoading_combined}
              className={`bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed h-10 w-10 flex items-center justify-center ${
                isAccInvLoading_combined ? "animate-spin" : ""
              }`}
              title="Refetch Sent Invitations"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={onInviteNew}
              className="bg-[#313131] hover:bg-black text-white font-bold h-10 text-sm px-4 rounded-lg shadow-md"
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
            {isAccInvLoading_combined ? (
              <div className="h-32 flex flex-col items-center justify-center text-gray-400">
                <RefreshCw className="animate-spin mb-2" size={24} />
                <span className="text-xs font-medium">
                  Fetching invitations...
                </span>
              </div>
            ) : sentInvitations?.data?.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-gray-400">
                <Mail size={24} className="mb-2 opacity-20" />
                <span className="text-xs font-medium">
                  No invitations sent yet
                </span>
              </div>
            ) : (
              sentInvitations?.data?.map((inv: any) => (
                <div
                  key={inv.id}
                  className="group bg-white rounded-xl p-4 md:py-3 md:px-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-[#7661d3]/30 transition-all grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
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
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Role
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-50 w-fit px-2 py-1 rounded text-[10px] font-extrabold text-gray-600 uppercase border border-gray-200">
                      <ShieldCheck size={10} />
                      {inv.role || "Member"}
                    </div>
                  </div>

                  <div className="col-span-6 md:col-span-2">
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Date
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                      {new Date(inv.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>

                  <div className="col-span-6 md:col-span-2">
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Status
                    </div>
                    <Badge
                      className={`border-0 font-bold capitalize px-2.5 py-0.5 h-6 text-[10px] ${
                        inv.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : inv.status === "user_accepted"
                            ? "bg-blue-100 text-blue-700"
                            : inv.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : inv.status === "expired"
                                ? "bg-gray-100 text-gray-500"
                                : "bg-red-100 text-red-700"
                      }`}
                    >
                      {inv.status.replace("_", " ")}
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
                          disabled={resendInvMutation.isPending}
                          className={`h-8 w-8 rounded-lg bg-[#f3f0fd] text-[#7661d3] hover:bg-[#7661d3] hover:text-white flex items-center justify-center transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                            resendInvMutation.isPending ? "animate-spin" : ""
                          }`}
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

                    {(inv.status === "approved" ||
                      inv.status === "rejected" ||
                      inv.status === "expired") && (
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
            await handleRejectInvitation(
              selectedInvitationId,
              reason || "Rejected by admin",
            );
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
    </div>
  );
};

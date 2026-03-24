import React, { useState } from "react";
import {
  Send,
  RefreshCw,
  Mail,
  ShieldCheck,
  Check,
  X,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAccountInvitations } from "@/services/invitation/invitation.query";
import {
  useApproveInvitation,
  useRejectInvitation,
  useResendInvitation,
  useCancelInvitation,
} from "@/services/invitation/invitation.mutation";
import InputModal from "@/components/common/InputModal";
import ConfirmationModal from "@/components/common/ConfirmationModal";

interface SentInvitationsProps {
  activeAccountId: string;
  account: any;
  isActive: boolean;
  onInviteNew: () => void;
}

export const SentInvitations: React.FC<SentInvitationsProps> = ({
  activeAccountId,
  account,
  isActive,
  onInviteNew,
}) => {
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null);
  const [isRefetching, setIsRefetching] = useState(false);

  const {
    data: accountInvitationsData,
    isLoading,
    refetch,
  } = useAccountInvitations(activeAccountId, {
    enabled: isActive && !!activeAccountId,
  });

  const sentInvitations: any = accountInvitationsData || { data: [] };

  const approveInvMutation = useApproveInvitation();
  const rejectInvMutation = useRejectInvitation();
  const resendInvMutation = useResendInvitation();
  const cancelInvMutation = useCancelInvitation();

  const handleRefetch = async () => {
    if (isRefetching || isLoading) return;
    setIsRefetching(true);
    await refetch();
    setTimeout(() => setIsRefetching(false), 1000);
  };

  const isRefetchingCombined = isLoading || isRefetching;

  const handleCancelInvitation = (invitationId: string) => {
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

  return (
    <div className="border-0 shadow-xl bg-white gap-0 rounded-xl overflow-hidden animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] border-b-2 border-[#7661d3]/30 p-4">
        <div className="text-white">
          <h3 className="text-xl font-extrabold flex items-center gap-2">
            <Send size={20} />
            Sent Invitations
          </h3>
          <p className="text-sm text-white/80">
            Manage invitations for {account?.accountName || "this account"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefetch}
            disabled={isRefetchingCombined}
            className={`bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed h-10 w-10 flex items-center justify-center ${isRefetchingCombined ? "animate-spin" : ""
              }`}
            title="Refetch Sent Invitations"
          >
            <RefreshCw size={16} />
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
          {isRefetchingCombined ? (
            <div className="h-32 flex flex-col items-center justify-center text-gray-400">
              <RefreshCw className="animate-spin mb-2" size={24} />
              <span className="text-xs font-medium">Fetching invitations...</span>
            </div>
          ) : sentInvitations?.data?.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-gray-400">
              <Mail size={24} className="mb-2 opacity-20" />
              <span className="text-xs font-medium">No invitations sent yet</span>
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
                    className={`border-0 font-bold capitalize px-2.5 py-0.5 h-6 text-[10px] ${inv.status === "pending"
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
                        onClick={() => resendInvMutation.mutateAsync(inv.id)}
                        disabled={resendInvMutation.isPending}
                        className={`h-8 w-8 rounded-lg bg-[#f3f0fd] text-[#7661d3] hover:bg-[#7661d3] hover:text-white flex items-center justify-center transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${resendInvMutation.isPending ? "animate-spin" : ""
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

      <InputModal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setSelectedInvitationId(null);
        }}
        onSubmit={async (role) => {
          if (selectedInvitationId) {
            await approveInvMutation.mutateAsync({
              invitationId: selectedInvitationId,
              role,
              accountId: activeAccountId,
            });
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

      <InputModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setSelectedInvitationId(null);
        }}
        onSubmit={async (reason) => {
          if (selectedInvitationId) {
            await rejectInvMutation.mutateAsync({
              invitationId: selectedInvitationId,
              reason: reason || "Rejected by admin",
              accountId: activeAccountId,
            });
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

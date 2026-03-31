import React, { useState } from "react";
import { MailIcon, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMyInvitations } from "@/services/invitation/invitation.query";
import {
  useAcceptInvitation,
  useRejectInvitation,
} from "@/services/invitation/invitation.mutation";

interface ReceivedInvitationsProps {
  isActive: boolean;
  activeAccountId: string;
}


export const ReceivedInvitations: React.FC<ReceivedInvitationsProps> = ({
  isActive,
  activeAccountId,
}) => {
  const [isRefetching, setIsRefetching] = useState(false);

  const {
    data: myInvitationsData,
    isLoading,
    refetch,
  } = useMyInvitations({
    enabled: isActive,
  });

  const acceptInvMutation = useAcceptInvitation();
  const rejectInvMutation = useRejectInvitation();

  const receivedInvitations = (myInvitationsData as any)?.data || [];

  const handleRefetch = async () => {
    if (isRefetching || isLoading) return;
    setIsRefetching(true);
    await refetch();
    setTimeout(() => setIsRefetching(false), 1000);
  };

  const isRefetchingCombined = isLoading || isRefetching;

  const handleAccept = async (token: string) => {
    await acceptInvMutation.mutateAsync(token);
  };

  const handleReject = async (invitationId: string) => {
    await rejectInvMutation.mutateAsync({
      invitationId,
      reason: "Rejected by user",
      accountId: activeAccountId,
    });
  };

  if (receivedInvitations.length === 0 && !isLoading) return null;

  return (
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
            onClick={handleRefetch}
            disabled={isRefetchingCombined}
            className={`bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isRefetchingCombined ? "animate-spin" : ""
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
                  className={`border-0 font-bold capitalize px-2.5 py-0.5 h-6 text-[10px] ${inv.status === "pending"
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
                      onClick={() => handleAccept(inv.token)}
                      className="h-8 px-4 bg-[#7dab4f] hover:bg-[#6a9642] text-white font-bold rounded-lg text-xs transition-shadow shadow-sm hover:shadow"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(inv.id)}
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
  );
};

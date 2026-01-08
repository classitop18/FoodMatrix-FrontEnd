import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InvitationService } from "./invitation.service";
import { toast } from "@/hooks/use-toast";

const invitationService = new InvitationService();

export const useSendInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      email: string;
      accountId: string;
      proposedRole?: string;
    }) => invitationService.sendInvitation(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["account-invitations", variables.accountId],
      });
      toast({
        title: "Invitation sent successfully!",
        description: "Invitation sent successfully!",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send invitation",
        description:
          error.response?.data?.message || "Failed to send invitation",
        variant: "destructive",
      });
    },
  });
};

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => invitationService.acceptInvitation(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-invitations"] });
      queryClient.invalidateQueries({ queryKey: ["myaccounts"] });
      toast({
        title: "Invitation accepted successfully!",
        description: "Invitation accepted successfully!",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to accept invitation",
        description:
          error.response?.data?.message || "Failed to accept invitation",
        variant: "destructive",
      });
    },
  });
};

export const useApproveInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      invitationId,
      role,
      accountId,
    }: {
      invitationId: string;
      role: string;
      accountId: string;
    }) => invitationService.approveInvitation(invitationId, role, accountId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["account-invitations", variables.accountId],
      });
      queryClient.invalidateQueries({
        queryKey: ["members", { accountId: variables.accountId }],
      });
      toast({
        title: "Invitation approved successfully!",
        description: "Invitation approved successfully!",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to approve invitation",
        description:
          error.response?.data?.message || "Failed to approve invitation",
        variant: "destructive",
      });
    },
  });
};

export const useRejectInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      invitationId,
      reason,
      accountId,
    }: {
      invitationId: string;
      reason?: string;
      accountId: string;
    }) => invitationService.rejectInvitation(invitationId, reason, accountId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["account-invitations", variables.accountId],
      });
      toast({
        title: "Invitation rejected successfully!",
        description: "Invitation rejected successfully!",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to reject invitation",
        description:
          error.response?.data?.message || "Failed to reject invitation",
        variant: "destructive",
      });
    },
  });
};

export const useResendInvitation = () => {
  return useMutation({
    mutationFn: (invitationId: string) =>
      invitationService.resendInvitation(invitationId),
    onSuccess: () => {
      toast({
        title: "Invitation resent successfully!",
        description: "Invitation resent successfully!",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to resend invitation",
        description:
          error.response?.data?.message || "Failed to resend invitation",
        variant: "destructive",
      });
    },
  });
};

export const useCancelInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      invitationId,
      accountId,
    }: {
      invitationId: string;
      accountId: string;
    }) => invitationService.cancelInvitation(invitationId, accountId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["account-invitations", variables.accountId],
      });
      toast({
        title: "Invitation cancelled successfully!",
        description: "Invitation cancelled successfully!",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to cancel invitation",
        description:
          error.response?.data?.message || "Failed to cancel invitation",
        variant: "destructive",
      });
    },
  });
};

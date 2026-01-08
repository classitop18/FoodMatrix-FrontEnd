import { useQuery } from "@tanstack/react-query";
import { InvitationService } from "./invitation.service";

const invitationService = new InvitationService();

export const useMyInvitations = (options?: any) => {
  return useQuery({
    queryKey: ["my-invitations"],
    queryFn: () => invitationService.getMyInvitations(),
    ...options,
  });
};

export const useAccountInvitations = (accountId: string, options?: any) => {
  return useQuery({
    queryKey: ["account-invitations", accountId],
    queryFn: () => invitationService.getInvitations(accountId),
    enabled: !!accountId,
    ...options,
  });
};

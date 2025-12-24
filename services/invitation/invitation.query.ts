import { useQuery } from "@tanstack/react-query";
import { InvitationService } from "./invitation.service";

export const useMyInvitations = (options?: any) => {
  return useQuery({
    queryKey: ["my-invitations"],
    queryFn: () => InvitationService.getMyInvitations(),
    ...options,
  });
};

export const useAccountInvitations = (accountId: string, options?: any) => {
  return useQuery({
    queryKey: ["account-invitations", accountId],
    queryFn: () => InvitationService.getInvitations(accountId),
    enabled: !!accountId,
    ...options,
  });
};

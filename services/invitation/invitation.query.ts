import { useQuery } from "@tanstack/react-query";
import { InvitationService } from "./invitation.service";

export const useMyInvitations = () => {
    return useQuery({
        queryKey: ["my-invitations"],
        queryFn: () => InvitationService.getMyInvitations(),
    });
};

export const useAccountInvitations = (accountId: string) => {
    return useQuery({
        queryKey: ["account-invitations", accountId],
        queryFn: () => InvitationService.getInvitations(accountId),
        enabled: !!accountId,
    });
};

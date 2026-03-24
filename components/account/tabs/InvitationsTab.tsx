import React from "react";
import { ReceivedInvitations } from "../invitations/ReceivedInvitations";
import { SentInvitations } from "../invitations/SentInvitations";

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
  return (
    <div className="space-y-6">
      <ReceivedInvitations
        isActive={isActive}
        activeAccountId={activeAccountId}
      />
      
      <SentInvitations
        isActive={isActive}
        activeAccountId={activeAccountId}
        account={account}
        onInviteNew={onInviteNew}
      />
    </div>
  );
};

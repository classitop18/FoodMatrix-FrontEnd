export interface InvitationPayload {
  email: string;
  accountId: string;
  proposedRole?: string;
}

export interface ApproveInvitationPayload {
  invitationId: string;
  role: string;
}

export interface RejectInvitationPayload {
  invitationId: string;
  reason?: string;
}

export interface Invitation {
  id: string;
  email: string;
  accountId: string;
  role: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  token: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

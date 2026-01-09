import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  InvitationPayload,
  ApproveInvitationPayload,
  RejectInvitationPayload,
  Invitation,
} from "./types/invitation.types";

export class InvitationService {
  async sendInvitation(payload: InvitationPayload) {
    const response = await apiClient.post(
      API_ENDPOINTS.INVITATION.SEND,
      payload,
    );
    return response.data;
  }

  async acceptInvitation(token: string) {
    const response = await apiClient.post(API_ENDPOINTS.INVITATION.ACCEPT, {
      token,
    });
    return response.data;
  }

  async approveInvitation(
    invitationId: string,
    role: string,
    accountId?: string,
  ) {
    const config = accountId ? { headers: { "x-account-id": accountId } } : {};
    const response = await apiClient.post(
      API_ENDPOINTS.INVITATION.APPROVE,
      {
        invitationId,
        role,
      },
      config,
    );
    return response.data;
  }

  async rejectInvitation(
    invitationId: string,
    reason?: string,
    accountId?: string,
  ) {
    const config = accountId ? { headers: { "x-account-id": accountId } } : {};
    const response = await apiClient.post(
      API_ENDPOINTS.INVITATION.REJECT,
      {
        invitationId,
        reason,
      },
      config,
    );
    return response.data;
  }

  async resendInvitation(invitationId: string, accountId?: string) {
    const config = accountId ? { headers: { "x-account-id": accountId } } : {};
    const response = await apiClient.post(
      API_ENDPOINTS.INVITATION.RESEND,
      {
        invitationId,
      },
      config,
    );
    return response.data;
  }

  async cancelInvitation(invitationId: string, accountId?: string) {
    const config = accountId ? { headers: { "x-account-id": accountId } } : {};
    const response = await apiClient.delete(API_ENDPOINTS.INVITATION.CANCEL, {
      data: { invitationId },
      ...config,
    });
    return response.data;
  }

  async getInvitations(accountId?: string, status?: string) {
    const response = await apiClient.get(API_ENDPOINTS.INVITATION.GET_ALL, {
      params: { accountId, status },
    });
    return response.data;
  }

  async getMyInvitations() {
    const response = await apiClient.get(API_ENDPOINTS.INVITATION.GET_MY);
    return response.data;
  }

  async validateToken(token: string) {
    const response = await apiClient.get(
      API_ENDPOINTS.INVITATION.VALIDATE_TOKEN(token),
    );
    return response.data;
  }
}

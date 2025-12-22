import { apiClient } from "@/lib/api";

export class InvitationService {
    // ============ SEND INVITATION ============
    static async sendInvitation(payload: { email: string; accountId: string; proposedRole?: string }) {
        const response = await apiClient.post("/invitations/send", payload);
        return response.data;
    }

    // ============ ACCEPT INVITATION ============
    static async acceptInvitation(token: string) {
        const response = await apiClient.post("/invitations/accept", { token });
        return response.data;
    }

    // ============ APPROVE INVITATION (ADMIN) ============
    static async approveInvitation(invitationId: string, role: string) {
        const response = await apiClient.post("/invitations/approve", { invitationId, role });
        return response.data;
    }

    // ============ REJECT INVITATION (ADMIN) ============
    static async rejectInvitation(invitationId: string, reason?: string) {
        const response = await apiClient.post("/invitations/reject", { invitationId, reason });
        return response.data;
    }

    // ============ RESEND INVITATION ============
    static async resendInvitation(invitationId: string) {
        const response = await apiClient.post("/invitations/resend", { invitationId });
        return response.data;
    }

    // ============ CANCEL INVITATION ============
    static async cancelInvitation(invitationId: string) {
        const response = await apiClient.delete("/invitations/cancel", { data: { invitationId } });
        return response.data;
    }

    // ============ GET ALL INVITATIONS (FOR ACCOUNT) ============
    static async getInvitations(accountId?: string, status?: string) {
        const response = await apiClient.get("/invitations", {
            params: { accountId, status }
        });
        return response.data;
    }

    // ============ GET MY INVITATIONS (RECEIVED) ============
    static async getMyInvitations() {
        const response = await apiClient.get("/invitations/my-invitations");
        return response.data;
    }
    // ============ VALIDATE TOKEN ============
    static async validateToken(token: string) {
        const response = await apiClient.get(`/invitations/validate-token/${token}`);
        return response.data;
    }
}

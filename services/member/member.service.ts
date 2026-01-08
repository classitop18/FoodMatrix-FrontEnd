import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  GetMembersParams,
  CreateMemberPayload,
  UpdateMemberPayload,
} from "./types/member.types";

export class MemberService {
  async getMembers(params: GetMembersParams) {
    const response = await apiClient.get(API_ENDPOINTS.MEMBER.GET_ALL_MEMBERS, {
      params: {
        accountId: params.accountId,
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        sortBy: params.sortBy ?? "createdAt",
        sortOrder: params.sortOrder ?? "desc",
      },
    });

    return response.data;
  }

  async createMember(data: CreateMemberPayload) {
    const response = await apiClient.post(
      API_ENDPOINTS.MEMBER.CREATE_MEMBER,
      data,
    );
    return response.data;
  }

  async updateMember(
    memberId: string,
    data: UpdateMemberPayload,
    accountId?: string,
  ) {
    const config = accountId ? { headers: { "x-account-id": accountId } } : {};
    const response = await apiClient.patch(
      API_ENDPOINTS.MEMBER.UPDATE_MEMBER.replace(":id", memberId),
      data,
      config,
    );
    return response.data;
  }

  async deleteMember(memberId: string, accountId?: string) {
    const config = accountId ? { headers: { "x-account-id": accountId } } : {};
    const response = await apiClient.delete(
      API_ENDPOINTS.MEMBER.DELETE_MEMBER.replace(":id", memberId),
      config,
    );
    return response.data;
  }

  async getMemberById(memberId: string, accountId?: string) {
    const config = accountId ? { headers: { "x-account-id": accountId } } : {};
    const response = await apiClient.get(
      API_ENDPOINTS.MEMBER.GET_MEMBER_BY_ID.replace(":id", memberId),
      config,
    );
    return response.data;
  }
}

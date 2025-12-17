import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";


export interface GetMembersParams {
    accountId: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

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
    };

}
import { apiClient } from "@/lib/api";
import { CreateAccountPayload } from "./types/account.types";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export class AccountService {
  async create(payload: CreateAccountPayload) {
    const response = await apiClient.post(
      API_ENDPOINTS.ACCOUNT.CREATE_ACCOUNT,
      payload,
    );
  }

  async getMyAccount() {
    const response = await apiClient.get(API_ENDPOINTS.ACCOUNT.GET_MY_ACCOUNT);
    return response?.data;
  }

  async getAccountById(id: string) {
    const response = await apiClient.get(API_ENDPOINTS.ACCOUNT.GET_ACCOUNT(id));
    return response.data;
  }

  async updateAccount(
    accountId: string,
    payload: Partial<CreateAccountPayload>,
  ) {
    const response = await apiClient.put(
      API_ENDPOINTS.ACCOUNT.UPDATE_ACCOUNT(accountId),
      payload,
    );
    return response.data;
  }

  async deleteAccount(accountId: string) {
    const response = await apiClient.delete(
      API_ENDPOINTS.ACCOUNT.DELETE_ACCOUNT(accountId),
    );
    return response.data;
  }
}

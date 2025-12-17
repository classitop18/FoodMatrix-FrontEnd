import { apiClient } from "@/lib/api";
import { CreateAccountPayload } from "./types/account.types";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export class AccountService {
  async create(payload: CreateAccountPayload) {
    const response = await apiClient.post(
      API_ENDPOINTS.ACCOUNT.CREATE_ACCOUNT,
      payload,
    );
    console.log(response, "accountResponse");
  }

  async getMyAccount() {
    const response = await apiClient.get(API_ENDPOINTS.ACCOUNT.GET_MY_ACCOUNT);
    console.log(response, "accountResponse");
    return response?.data;
  }

  async getAccountById(id: string) {
    const response = await apiClient.get(API_ENDPOINTS.ACCOUNT.GET_ACCOUNT(id));
    return response.data;
  }
}

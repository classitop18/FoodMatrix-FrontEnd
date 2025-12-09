import { apiClient } from "@/lib/api";
import {
  CheckIsPropertyExist,
  UserLoginPayload,
  UserRegisterPayload,
} from "./types/auth.types";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export class AuthService {
  async login(loginPayload: UserLoginPayload) {
    const response = await apiClient.post(
      API_ENDPOINTS.AUTH.LOGIN,
      loginPayload,
    );
    return response.data;
  }
  async logout() {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  }

  async register(registerPayload: UserRegisterPayload) {
    const response = await apiClient.post(
      API_ENDPOINTS.AUTH.REGISTER,
      registerPayload,
    );
    return response.data;
  }

  async checkIsExist(payload: CheckIsPropertyExist) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.CHECK_IS_EXIST, {
      ...payload,
    });
    return response.data;
  }
}

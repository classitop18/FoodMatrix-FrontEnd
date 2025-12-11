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

    console.log(response, "kkkresponse")
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

  async getCurrentSession() {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.GET_CURRENT_SESSION, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
      }

    });
    return response.data;
  }

  async forgetPassword(email: string) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return response.data;
  }


  async resetPassword(payload: { newPassword: string }) {
    const response = await apiClient.put(API_ENDPOINTS.AUTH.RESET_PASSWORD, payload);
    return response.data;
  }



}

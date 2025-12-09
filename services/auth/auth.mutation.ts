import { useMutation } from "@tanstack/react-query";
import { AuthService } from "./auth.service";
import { UserLoginPayload, UserRegisterPayload } from "./types/auth.types";
import { queryClient } from "@/lib/react-query";

const authService = new AuthService();

// ==================== LOGIN MUTATION ====================

export const useLogin = () => {
  return useMutation({
    mutationFn: (loginPayload: UserLoginPayload) =>
      authService.login(loginPayload),

    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem("accessToken", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },

    onError: (error: any) => {
      console.error("Login error:", error);
    },
  });
};

// ==================== REGISTER MUTATION  ====================
export const useRegister = () => {
  return useMutation({
    mutationFn: (registerPayload: UserRegisterPayload) =>
      authService.register(registerPayload),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },

    onError: (error: any) => {
      console.error("Registration error:", error);
    },
  });
};

// ==================== LOGOUT MUTATION (WITHOUT TOAST & REDIRECT) ====================
export const useLogout = () => {
  return useMutation({
    mutationFn: () => authService.logout(),

    onSuccess: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      queryClient.clear();
    },

    onError: (error: any) => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      queryClient.clear();
      console.error("Logout error:", error);
    },
  });
};

export const useCheckEmailUsernameExist = () => {
  return useMutation<any, any, { field: string; value: string }>({
    mutationFn: async (payload) => authService.checkIsExist(payload),
    onSuccess: (data: any) => {
      return data;
    },
    onError: (error) => {
      console.error("Check email/username error:", error);
    },
  });
};

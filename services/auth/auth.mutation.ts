import { useMutation } from "@tanstack/react-query";
import { AuthService } from "./auth.service";
import { UserLoginPayload, UserRegisterPayload } from "./types/auth.types";
import { queryClient } from "@/lib/react-query";
import { toast } from "@/hooks/use-toast";

const authService = new AuthService();

// ==================== LOGIN MUTATION ====================

export const useLogin = () => {
  return useMutation({
    mutationFn: (loginPayload: UserLoginPayload) =>
      authService.login(loginPayload),

    onSuccess: (data) => {
      const user = data.data;
      localStorage.setItem("accessToken", user.accessToken);
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

export const useCheckProperty = () => {
  return useMutation<any, any, { field: string; value: string }>({
    mutationFn: async (payload) => authService.checkProperty(payload),
    onSuccess: (data: any) => {
      return data;
    },
    onError: (error) => {
      console.error("Check email/username error:", error);
    },
  });
};

export const useForgetPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authService.forgetPassword(email),
    onSuccess: () => { },
    onError: (error: any) => {
      console.error("Logout error:", error);
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (payload: { newPassword: string }) =>
      authService.resetPassword(payload),
  });
};

export const useMFAVerify = () => {
  return useMutation({
    mutationFn: (payload: { otp: string }) =>
      authService.otpVerification(payload),
    onSuccess: (data) => {
      const user = data.data;
      localStorage.setItem("accessToken", user.accessToken);
    },

    onError: (error: any) => {
      console.error("Login error:", error);
    },
  });
};

export const useUpdateUserProfile = () => {
  return useMutation({
    mutationFn: (payload: any) => authService.updateProfile(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["auth", "me"],
      });
    },

    onError: (error: any) => {
      console.error("Login error:", error);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (payload: any) => {
      return await authService.changePassword(payload);
    },
    onError: (error: any) => {
      // Extract the message safely
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong";

      console.error("Change Password error:", errorMessage);
    },
  });
};

export const useUploadAvatar = () => {
  return useMutation({
    mutationFn: (file: File) => authService.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["auth", "me"],
      });
      toast({
        title: "Avatar Updated Successfully",
        description: "Your profile picture has been updated.",
        variant: "success",
      });
    },
    onError: (error: any) => {
      console.error("Upload Avatar error:", error);
      toast({
        title: "Failed to Update Avatar",
        description:
          error?.response?.data?.message ||
          "Please try again with a valid image file.",
        variant: "destructive",
      });
    },
  });
};

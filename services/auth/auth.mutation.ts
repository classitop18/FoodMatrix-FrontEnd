import { useMutation } from "@tanstack/react-query";
import { AuthService } from "./auth.service";
import { UserLoginPayload, UserRegisterPayload } from "./types/auth.types";
import { queryClient } from "@/lib/react-query";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/error-utils";

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
      console.error("Login error:", getErrorMessage(error));
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
      console.error("Registration error:", getErrorMessage(error));
    },
  });
};

// ==================== LOGOUT MUTATION (WITHOUT TOAST & REDIRECT) ====================
export const useLogout = () => {
  return useMutation({
    mutationFn: () => authService.logout(),

    onSuccess: () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      queryClient.removeQueries({ queryKey: ["auth", "me"] });
      queryClient.clear();
      toast({
        title: "Logged out successfully",
        variant: "success",
      });
    },

    onError: (error: any) => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      queryClient.removeQueries({ queryKey: ["auth", "me"] });
      queryClient.clear();
      console.error("Logout error:", getErrorMessage(error));
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
      console.error("Check email/username error:", getErrorMessage(error));
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
      console.error("Check property error:", getErrorMessage(error));
    },
  });
};

export const useForgetPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authService.forgetPassword(email),
    onSuccess: () => { },
    onError: (error: any) => {
      const msg = getErrorMessage(error);
      toast({
        title: "Request Failed",
        description: msg,
        variant: "destructive"
      });
      console.error("Forget Password error:", msg);
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (payload: { newPassword: string }) =>
      authService.resetPassword(payload),
    onError: (error: any) => {
      const msg = getErrorMessage(error);
      toast({
        title: "Reset Password Failed",
        description: msg,
        variant: "destructive"
      });
      console.error("Reset Password error:", msg);
    }
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
      console.error("MFA Verify error:", getErrorMessage(error));
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
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
        variant: "success",
      });
    },

    onError: (error: any) => {
      const msg = getErrorMessage(error);
      toast({
        title: "Update Failed",
        description: msg,
        variant: "destructive",
      });
      console.error("Update Profile error:", msg);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (payload: any) => {
      return await authService.changePassword(payload);
    },
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
        variant: "success",
      });
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(error);
      toast({
        title: "Change Password Failed",
        description: errorMessage,
        variant: "destructive",
      });
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
        description: getErrorMessage(error, "Please try again with a valid image file."),
        variant: "destructive",
      });
    },
  });
};

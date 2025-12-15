"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useResetPassword } from "@/services/auth/auth.mutation";

type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const resetPasswordMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPasswordMutation.mutateAsync({ newPassword: data?.password });

      toast({
        title: "Password Reset Successfully",
        description: "You can now log in with your new password.",
      });

      router.push("/login");
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast({
        title: "Failed",
        description: msg,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[var(--primary-bg)] via-white to-[var(--primary-bg)] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--primary)] rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--green)] rounded-full blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
      </div>

      <Card className="relative z-10 w-full max-w-md rounded-3xl border-2 border-[var(--primary)]/10 shadow-2xl bg-white/90 backdrop-blur-xl animate-scale-in">
        <CardContent className="p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center w-12 h-12">
              <div className="absolute inset-0 bg-[var(--primary)] opacity-20 blur-2xl rounded-full animate-pulse"></div>
              <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white shadow-lg shadow-[var(--primary)]/30">
                <KeyRound className="w-6 h-6" />
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-[var(--primary)] mb-2">
              Reset Password
            </h1>
            <p className="text-gray-600 text-base">
              Enter your new password below
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* New Password */}
            <div className="space-y-2">
              <Label className="text-[var(--primary)] font-semibold">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--primary)]/60" />

                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-12 pr-12 h-14 rounded-xl border-2 border-[var(--primary)]/20 focus:border-[var(--primary)]"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Must be 6+ characters" },
                  })}
                />

                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label className="text-[var(--primary)] font-semibold">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--primary)]/60" />

                <Input
                  type={showPassword2 ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-12 pr-12 h-14 rounded-xl border-2 border-[var(--primary)]/20 focus:border-[var(--primary)]"
                  {...register("confirmPassword", {
                    required: "Confirm your password",
                    validate: (value) =>
                      value === watch("password") || "Passwords do not match",
                  })}
                />

                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword2(!showPassword2)}
                >
                  {showPassword2 ? <EyeOff /> : <Eye />}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary-dark)] transition-all"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending
                ? "Updating..."
                : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

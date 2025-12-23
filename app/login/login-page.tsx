"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, LogIn, UserCheck } from "lucide-react";
import { useLogin } from "@/services/auth/auth.mutation";
import { toast } from "@/hooks/use-toast";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/redux/features/auth/auth.slice";
import { useRouter, useSearchParams } from "next/navigation";

import Image from "next/image";
import pattern1 from "@/public/hero-pattern-1.svg";
import pattern2 from "@/public/hero-pattern-2.svg";
import foodBanner from "@/public/food-banner.svg";

type LoginFormData = {
  emailOrUsername: string;
  password: string;
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  // Hookes

  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const prefilledEmail = searchParams.get("email");

  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      emailOrUsername: prefilledEmail || "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log("Form Data:", data);
    try {
      const response = await loginMutation.mutateAsync(data);

      if (response?.data?.mfaRequired) {
        const otpUrl = returnUrl
          ? `/otp-verification?returnUrl=${encodeURIComponent(returnUrl)}`
          : "/otp-verification";
        router.push(otpUrl);
        return;
      }

      const user = response.data;
      dispatch(
        loginSuccess({
          user,
          accessToken: user.accessToken,
        }),
      );

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      router.push(returnUrl || "/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);

      // Extract server message if exists
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again.";
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive", // "destructive" usually shows red/error toast
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background Patterns */}
      <Image
        src={pattern1}
        className="absolute -top-64 -left-32 opacity-20 pointer-events-none"
        width={818}
        height={818}
        alt="Pattern-1"
      />
      <Image
        src={pattern2}
        className="absolute right-0 -top-48 opacity-20 pointer-events-none"
        width={818}
        height={600}
        alt="Pattern-2"
      />

      {/* Food Banner - Decorative */}
      {/* <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
        <Image
          src={foodBanner}
          className="animate-spin [animation-duration:30s]"
          width={500}
          height={500}
          alt="Food Banner"
        />
      </div> */}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--primary)] rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--green)] rounded-full blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
      </div>

      <Card className="relative z-10 w-full max-w-md rounded-3xl border-2 border-[var(--primary)]/10 shadow-2xl bg-white/90 backdrop-blur-xl animate-scale-in">
        <CardContent className="p-8 md:p-10">
          {/* icon + heading */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center w-12 h-12">
              <div className="absolute inset-0 bg-[var(--primary)] opacity-20 blur-2xl rounded-full animate-pulse"></div>
              <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white shadow-lg shadow-[var(--primary)]/30">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            <h1 className="text-4xl font-extrabold text-[var(--primary)] mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-base">
              Sign in to continue your meal planning journey
            </p>
          </div>

          {/* form */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* email/username */}
            <div className="space-y-2">
              <Label
                htmlFor="emailOrUsername"
                className="text-[var(--primary)] font-semibold"
              >
                Email or Username
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary)]/60 w-5 h-5 group-focus-within:text-[var(--primary)] transition-colors" />
                <Input
                  id="emailOrUsername"
                  placeholder="your.email@example.com"
                  className="pl-12 h-14 rounded-xl border-2 border-[var(--primary)]/20 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                  {...register("emailOrUsername", {
                    required: "Email or Username is required",
                  })}
                />
              </div>
              {errors.emailOrUsername && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span className="text-lg">⚠</span>{" "}
                  {errors.emailOrUsername.message}
                </p>
              )}
            </div>

            {/* password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-[var(--primary)] font-semibold"
                >
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[var(--green)] hover:text-[var(--green-light)] font-medium hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--primary)]/60 group-focus-within:text-[var(--primary)] transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-12 pr-12 h-14 rounded-xl border-2 border-[var(--primary)]/20 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--primary)]/60 hover:text-[var(--primary)] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span className="text-lg">⚠</span> {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full justify-center text-white bg-(--primary) hover:bg-(--primary) font-medium ps-6! pe-6! py-1 h-12 rounded-lg text-base transition-all duration-300 cursor-pointer group relative flex items-center
            inset-shadow-[5px_5px_5px_rgba(0,0,0,0.30)] hover:inset-shadow-[-5px_-5px_5px_rgba(0,0,0,0.50)]"
              disabled={loginMutation?.isPending}
            >
              {loginMutation?.isPending ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          {/* divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-[var(--primary)]/10" />
            </div>
            <div className="relative flex justify-center text-sm text-gray-600 font-medium">
              <span className="bg-white px-4">Don't have an account?</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full justify-center bg-white  hover:text-white hover:bg-(--primary) border-(--primary) border text-(--primary) font-medium ps-6! pe-6! py-1 h-10 rounded-lg text-base transition-all duration-300 cursor-pointer group relative flex items-center hover:inset-shadow-[-5px_-5px_5px_rgba(0,0,0,0.30)]"
            disabled={loginMutation?.isPending}
            asChild
          >
            <Link
              href={`/register${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ""}`}
            >
              Create Account
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

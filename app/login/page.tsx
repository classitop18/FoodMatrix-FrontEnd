"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { useLogin } from "@/services/auth/auth.mutation";
import { toast } from "@/hooks/use-toast";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/redux/features/auth/auth.slice";
import { useRouter } from "next/navigation";

type LoginFormData = {
  emailOrUsername: string;
  password: string;
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  // Hookes

  const dispatch = useDispatch()
  const router = useRouter();

  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      emailOrUsername: "",
      password: "",
    },
  });



  const onSubmit = async (data: LoginFormData) => {
    console.log("Form Data:", data);
    try {
      const response = await loginMutation.mutateAsync(data);
      const user = response.data;
      dispatch(
        loginSuccess({
          user,
          accessToken: user.accessToken,
        })
      );

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      router.push("/dashboard")

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
    <div className="relative min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md rounded-2xl border border-border/50 shadow-xl bg-card">
        <CardContent className="p-8">
          {/* icon + heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/15 text-primary shadow-inner">
              <LogIn className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-semibold mt-4">Welcome Back</h1>
            <p className="text-muted-foreground text-sm">
              Sign in to continue your journey
            </p>
          </div>

          {/* form */}
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* email/username */}
            <div className="space-y-2">
              <Label htmlFor="emailOrUsername">Email or Username</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                <Input
                  id="emailOrUsername"
                  placeholder="your.email@example.com"
                  className="pl-11 h-12"
                  {...register("emailOrUsername", {
                    required: "Email or Username is required",
                  })}
                />
              </div>
              {errors.emailOrUsername && (
                <p className="text-red-500 text-sm">
                  {errors.emailOrUsername.message}
                </p>
              )}
            </div>

            {/* password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-11 pr-11 h-12"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
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
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold rounded-xl"
              disabled={loginMutation?.isPending}
            >
              Sign In
            </Button>
          </form>

          {/* divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-card px-4">Don't have an account?</span>
            </div>
          </div>

          {/* <Button
            variant="outline"
            className="w-full h-11 rounded-xl"
            disabled={loginMutation?.isPending}
            asChild
          >
            <Link href="/register">Create Account</Link>
          </Button> */}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import Link from "next/link";
import {
  useCheckEmailUsernameExist,
  useRegister,
} from "@/services/auth/auth.mutation";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import pattern1 from "@/public/hero-pattern-1.svg";
import pattern2 from "@/public/hero-pattern-2.svg";
import foodBanner from "@/public/food-banner.svg";
import ThemeButton from "@/components/common/buttons/theme-button-arrow";
import BorderButton from "@/components/common/buttons/border-button";

export const usernameRegex = /^[A-Za-z][A-Za-z0-9_]{2,19}$/;

type RegisterFormData = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function Register() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<any>(null);

  // Hooks
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const prefilledEmail = searchParams.get("email");
  const isEmailReadonly = searchParams.get("readonlyEmail") === "true";

  const checkIsExistMutation = useCheckEmailUsernameExist();
  const registerMutation = useRegister();

  // H

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: prefilledEmail || "",
      password: "",
      confirmPassword: "",
    },
  });

  const username = watch("username");
  const email = watch("email");

  const [validation, setValidation] = useState({
    usernameFormat: true,
    username: { checked: false, available: false },
    email: { checked: false, available: false },
  });

  const checkAvailability = async (
    field: "username" | "email",
    value: string,
  ) => {
    if (!value) return;
    try {
      const response = await checkIsExistMutation.mutateAsync({ field, value });
      setValidation((prev) => ({
        ...prev,
        [field]: { checked: true, available: !response?.data?.exists },
      }));
    } catch (err) {
      console.error("Availability check error:", err);
      setValidation((prev) => ({
        ...prev,
        [field]: { checked: true, available: false },
      }));
    }
  };

  // Live validation with debounce - FIXED: Using useEffect instead of useState
  useEffect(() => {
    const timer = setTimeout(() => {
      if (username) {
        const valid = usernameRegex.test(username);
        setValidation((prev) => ({
          ...prev,
          usernameFormat: valid,
          username: { checked: false, available: false }, // Reset availability check
        }));
        if (valid) {
          checkAvailability("username", username);
        }
      } else {
        // Reset when empty
        setValidation((prev) => ({
          ...prev,
          usernameFormat: true,
          username: { checked: false, available: false },
        }));
      }

      if (email) {
        checkAvailability("email", email);
      } else {
        setValidation((prev) => ({
          ...prev,
          email: { checked: false, available: false },
        }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email, username]);

  const onSubmit = async (data: RegisterFormData) => {
    // Client-side validation
    if (!usernameRegex.test(data.username)) {
      toast({
        title: "Invalid Username",
        description:
          "Username must start with a letter, 3–20 chars, A-Z, a-z, 0-9, or _",
        variant: "destructive",
      });
      return;
    }

    if (!validation.username.available) {
      toast({
        title: "Username Unavailable",
        description: "Choose a different username.",
        variant: "destructive",
      });
      return;
    }

    if (!validation.email.available) {
      toast({
        title: "Email Already Registered",
        description: "Try another email address.",
        variant: "destructive",
      });
      return;
    }

    if (data.password !== data.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response: any = await registerMutation.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        password: data.password,
      });
      toast({
        title: "Registration Successful",
        description:
          response.message || "Your account has been created successfully.",
      });
      setRegisteredUser(response.user);
      router.push(
        `/login${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ""}`,
      );
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Something went wrong",
        description: error?.message ?? "Unable to register right now.",
        variant: "destructive",
      });
    }
  };

  //   if (registeredUser) {
  //     return <EmailVerificationNotice name={registeredUser.firstName} />;
  //   }

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00] overflow-hidden">
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
        className="absolute right-0 top-0 opacity-20 pointer-events-none"
        width={818}
        height={600}
        alt="Pattern-2"
      />

      {/* Food Banner - Decorative */}
      {/* <div className="absolute left-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
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
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)] rounded-full blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--green)] rounded-full blur-3xl opacity-20 -translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <Card className="w-full max-w-2xl border-2 border-[var(--primary)]/10 shadow-2xl rounded-3xl backdrop-blur-xl bg-white/90 animate-scale-in">
          <CardContent className="p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white shadow-lg shadow-[var(--primary)]/30">
                <UserPlus className="w-5 h-5" />
              </div>
              <h1 className="text-2xl lg:text-4xl font-extrabold text-[var(--primary)] my-2">
                Create Account
              </h1>
              <p className="text-gray-600 text-base">
                Join FoodMatrix — Smarter Food, Smarter Budget
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* First Name & Last Name - Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-2">
                  <Label className="text-[var(--primary)] font-semibold">
                    First Name
                  </Label>
                  <Input
                    placeholder="John"
                    className="h-12 rounded-xl border-2 border-[var(--primary)]/20 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                    {...register("firstName", {
                      required: "First name is required",
                    })}
                  />
                  {errors.firstName && (
                    <p className="text-red-600 text-sm flex items-center gap-1">
                      <span className="text-lg">⚠</span>{" "}
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label className="text-[var(--primary)] font-semibold">
                    Last Name
                  </Label>
                  <Input
                    placeholder="Doe"
                    className="h-12 rounded-xl border-2 border-[var(--primary)]/20 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                    {...register("lastName", {
                      required: "Last name is required",
                    })}
                  />
                  {errors.lastName && (
                    <p className="text-red-600 text-sm flex items-center gap-1">
                      <span className="text-lg">⚠</span>{" "}
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label className="text-[var(--primary)] font-semibold">
                  Username
                </Label>
                <Input
                  placeholder="john_doe"
                  className="h-12 rounded-xl border-2 border-[var(--primary)]/20 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                  {...register("username", { required: "Username required" })}
                />
                {username && !validation.usernameFormat && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> Username must start with a
                    letter, 3-20 characters, only A-Z, a-z, 0-9, or _
                  </p>
                )}
                {username &&
                  validation.usernameFormat &&
                  validation.username.checked && (
                    <p
                      className={`text-sm flex items-center gap-1 ${validation.username.available ? "text-green-600" : "text-red-600"}`}
                    >
                      {validation.username.available ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Username
                          available
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" /> Username already taken
                        </>
                      )}
                    </p>
                  )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-[var(--primary)] font-semibold">
                  Email
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary)]/60 w-5 h-5 group-focus-within:text-[var(--primary)] transition-colors" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    readOnly={isEmailReadonly}
                    className={`pl-12 h-12 rounded-xl border-2 border-[var(--primary)]/20 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all ${isEmailReadonly ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`}
                    {...register("email", { required: "Email required" })}
                  />
                </div>
                {validation.email.checked && (
                  <p
                    className={`text-sm flex items-center gap-1 ${validation.email.available ? "text-green-600" : "text-red-600"}`}
                  >
                    {validation.email.available ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Email available
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" /> Email already registered
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* Password & Confirm Password - Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Password */}
                <div className="space-y-2 relative">
                  <Label className="text-[var(--primary)] font-semibold">
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary)]/60 w-5 h-5 group-focus-within:text-[var(--primary)] transition-colors" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-12 pr-12 h-12 rounded-xl border-2 border-[var(--primary)]/20 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                      {...register("password", {
                        required: "Password required",
                        minLength: 8,
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--primary)]/60 hover:text-[var(--primary)] transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2 relative">
                  <Label className="text-[var(--primary)] font-semibold">
                    Confirm Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary)]/60 w-5 h-5 group-focus-within:text-[var(--primary)] transition-colors" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-12 pr-12 h-12 rounded-xl border-2 border-[var(--primary)]/20 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                      {...register("confirmPassword", {
                        required: "Confirm password required",
                      })}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--primary)]/60 hover:text-[var(--primary)] transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full justify-center text-white bg-(--primary) hover:bg-(--primary) font-medium ps-6! pe-6! py-1 h-11 rounded-lg text-base transition-all duration-300 cursor-pointer group relative flex items-center
            inset-shadow-[5px_5px_5px_rgba(0,0,0,0.30)] hover:inset-shadow-[-5px_-5px_5px_rgba(0,0,0,0.50)]"
                disabled={registerMutation?.isPending}
              >
                {registerMutation?.isPending
                  ? "Creating Account..."
                  : "Create Account"}
              </Button>
            </form>

            <div className="flex items-center my-8">
              <div className="flex-1 border-t-2 border-[var(--primary)]/10"></div>
              <span className="px-4 text-sm text-gray-600 font-medium">
                Already have an account?
              </span>
              <div className="flex-1 border-t-2 border-[var(--primary)]/10"></div>
            </div>

            <Button
              variant="outline"
              className="w-full justify-center bg-white  hover:text-white hover:bg-black border-black border text-black font-medium ps-6! pe-6! py-1 rounded-lg text-base transition-all duration-300 cursor-pointer group relative flex items-center hover:inset-shadow-[-5px_-5px_5px_rgba(0,0,0,0.30)] h-11"
              disabled={registerMutation?.isPending}
              asChild
            >
              <Link
                href={`/login${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ""}`}
              >
                Sign In Instead
              </Link>
            </Button>
          </CardContent>
        </Card>

        <p className="absolute bottom-6 text-center text-gray-600 text-sm font-medium">
          © 2025 FoodMatrix. Smart Budget Intelligence Platform.
        </p>
      </div>
    </div>
  );
}

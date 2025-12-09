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
import { useRouter } from "next/navigation";

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
  const router = useRouter()

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
      email: "",
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

  console.log(username, "username");

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
      router.push("/");
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
    <div className="relative min-h-screen bg-gradient-to-br from-background via-accent/10 to-background overflow-hidden">
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-24">
        <Card className="w-full max-w-lg border border-border shadow-xl rounded-2xl backdrop-blur-xl bg-card/90 animate-scale-in">
          <CardContent className="p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
                <UserPlus className="w-8 h-8" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mt-4">
                Create Account
              </h1>
              <p className="text-muted-foreground mt-1">
                Join FoodMatrix — Smarter Food, Smarter Budget
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* First Name */}
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  placeholder="John"
                  {...register("firstName", {
                    required: "First name is required",
                  })}
                />
                {errors.firstName && (
                  <p className="text-red-600 text-xs">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  placeholder="Doe"
                  {...register("lastName", {
                    required: "Last name is required",
                  })}
                />
                {errors.lastName && (
                  <p className="text-red-600 text-xs">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  placeholder="john_doe"
                  {...register("username", { required: "Username required" })}
                />
                {username && !validation.usernameFormat && (
                  <p className="text-xs text-red-600">
                    ✗ Username must start with a letter, 3-20 characters, only
                    A-Z, a-z, 0-9, or _
                  </p>
                )}
                {username &&
                  validation.usernameFormat &&
                  validation.username.checked && (
                    <p
                      className={`text-xs ${validation.username.available ? "text-green-600" : "text-red-600"}`}
                    >
                      {validation.username.available
                        ? "✓ Username available"
                        : "✗ Username already taken"}
                    </p>
                  )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  {...register("email", { required: "Email required" })}
                />
                {validation.email.checked && (
                  <p
                    className={`text-xs ${validation.email.available ? "text-green-600" : "text-red-600"}`}
                  >
                    {validation.email.available
                      ? "✓ Email available"
                      : "✗ Email already registered"}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2 relative">
                <Label>Password</Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Password required",
                    minLength: 8,
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2 relative">
                <Label>Confirm Password</Label>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("confirmPassword", {
                    required: "Confirm password required",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full h-12 mt-6 flex items-center justify-center gap-2 bg-primary text-primary-foreground"

              >
                Create Account <ArrowRight />
              </Button>
            </form>

            <div className="flex items-center my-8">
              <div className="flex-1 border-t border-border"></div>
              <span className="px-3 text-xs text-muted-foreground">
                Already have an account?
              </span>
              <div className="flex-1 border-t border-border"></div>
            </div>

            <Button
              variant="outline"
              className="w-full h-11 border border-border"
              asChild
            >
              <Link href="/login">Sign In Instead</Link>
            </Button>
          </CardContent>
        </Card>

        <p className="absolute bottom-6 text-center text-muted-foreground text-xs">
          © 2025 FoodMatrix. Smart Budget Intelligence Platform.
        </p>
      </div>
    </div>
  );
}

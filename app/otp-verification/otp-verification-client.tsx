"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ArrowLeft, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { useMFAVerify } from "@/services/auth/auth.mutation";

export default function OTPVerificationClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  // HOOKS

  const mfeOtpVerifyMutation = useMFAVerify();

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the full 6-digit code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await mfeOtpVerifyMutation.mutateAsync({
        otp,
      });

      toast({
        title: "Verified Successfully",
        description: "Your account has been verified.",
      });

      router.push("/dashboard"); // or reset-password
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Invalid code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setTimeLeft(30);
    toast({
      title: "Code Resent",
      description: "A new code has been sent to your email.",
    });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[var(--primary-bg)] via-white to-[var(--primary-bg)] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)] rounded-full blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--green)] rounded-full blur-3xl opacity-20 -translate-x-1/2 translate-y-1/2"></div>
      </div>

      <Card className="relative z-10 w-full max-w-md rounded-3xl border-2 border-[var(--primary)]/10 shadow-2xl bg-white/90 backdrop-blur-xl animate-scale-in">
        <CardContent className="p-8 md:p-10">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary-light)] font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white shadow-lg shadow-[var(--primary)]/30 mb-4">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-extrabold text-[var(--primary)] mb-2">
              Enter Verification Code
            </h1>
            <p className="text-gray-600">
              We've sent a 6-digit code to <br />
              <span className="font-semibold text-[var(--primary)]">
                {email}
              </span>
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
            >
              <InputOTPGroup className="gap-2">
                {[...Array(6)].map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="w-12 h-14 rounded-xl border-2 border-[var(--primary)]/20 text-lg font-bold text-[var(--primary)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/10 transition-all bg-white"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            onClick={handleVerify}
            className="w-full h-11 text-base font-bold rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] hover:shadow-lg hover:shadow-[var(--primary)]/30 transition-all duration-300 hover:scale-[1.02] mb-6 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </Button>

          <div className="text-center">
            {timeLeft > 0 ? (
              <p className="text-sm text-gray-500">
                Resend code in{" "}
                <span className="font-semibold text-[var(--primary)]">
                  00:{timeLeft.toString().padStart(2, "0")}
                </span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-light)] transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Resend Code
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[var(--primary-bg)] via-white to-[var(--primary-bg)] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--green)] rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--primary)] rounded-full blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
      </div>

      <Card className="relative z-10 w-full max-w-md rounded-3xl border-2 border-[var(--primary)]/10 shadow-2xl bg-white/90 backdrop-blur-xl animate-scale-in">
        <CardContent className="p-8 md:p-10 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[var(--green)] to-[var(--green-light)] text-white shadow-lg shadow-[var(--green)]/30 mb-6 animate-fade-in">
            <Mail className="w-12 h-12" />
          </div>

          <h1 className="text-3xl font-extrabold text-[var(--primary)] mb-3">
            Verify Your Email
          </h1>

          <div className="space-y-4 text-gray-600 mb-8">
            <p>
              We've sent a verification link to your email address. Please check
              your inbox and click the link to activate your account.
            </p>
            <div className="bg-[var(--primary-bg)] p-4 rounded-xl border border-[var(--primary)]/10">
              <p className="text-sm font-medium text-[var(--primary)]">
                Note: Check your spam folder if you don't see the email within a
                few minutes.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              asChild
              className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] hover:shadow-lg hover:shadow-[var(--primary)]/30 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Link href="/otp-verification">
                Enter Code Manually <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              className="w-full h-12 rounded-xl text-gray-500 hover:text-[var(--primary)] hover:bg-[var(--primary-bg)] transition-all"
              asChild
            >
              <Link href="/login">Back to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

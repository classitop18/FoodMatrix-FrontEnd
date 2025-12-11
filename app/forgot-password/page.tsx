"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ForgotPasswordFormData = {
    email: string;
};

export default function ForgotPasswordPage() {
    const { toast } = useToast();
    const [isSubmitted, setIsSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<ForgotPasswordFormData>({
        defaultValues: {
            email: "",
        },
    });

    const email = watch("email");

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            // TODO: Integrate forgot password API
            console.log("Forgot password request:", data);

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            setIsSubmitted(true);
            toast({
                title: "Email Sent!",
                description: "Check your inbox for password reset instructions.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.message || "Failed to send reset email.",
                variant: "destructive",
            });
        }
    };

    if (isSubmitted) {
        return (
            <div className="relative min-h-screen bg-gradient-to-br from-[var(--primary-bg)] via-white to-[var(--primary-bg)] flex items-center justify-center px-4 py-12 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--primary)] rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--green)] rounded-full blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
                </div>

                <Card className="relative z-10 w-full max-w-md rounded-3xl border-2 border-[var(--primary)]/10 shadow-2xl bg-white/90 backdrop-blur-xl animate-scale-in">
                    <CardContent className="p-8 md:p-10 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[var(--green)] to-[var(--green-light)] text-white shadow-lg shadow-[var(--green)]/30 mb-6">
                            <Mail className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-[var(--primary)] mb-3">
                            Check Your Email
                        </h1>
                        <p className="text-gray-600 mb-2">
                            We've sent password reset instructions to:
                        </p>
                        <p className="text-[var(--primary)] font-semibold text-lg mb-6">
                            {email}
                        </p>
                        <p className="text-sm text-gray-500 mb-8">
                            Didn't receive the email? Check your spam folder or try again.
                        </p>
                        <div className="space-y-3">
                            <Button
                                onClick={() => setIsSubmitted(false)}
                                variant="outline"
                                className="w-full h-12 rounded-xl border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white font-semibold transition-all duration-300"
                            >
                                Try Another Email
                            </Button>
                            <Button
                                asChild
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] hover:shadow-lg hover:shadow-[var(--primary)]/30 transition-all duration-300"
                            >
                                <Link href="/login">Back to Login</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-[var(--primary-bg)] via-white to-[var(--primary-bg)] flex items-center justify-center px-4 py-12 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--primary)] rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--green)] rounded-full blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
            </div>

            <Card className="relative z-10 w-full max-w-md rounded-3xl border-2 border-[var(--primary)]/10 shadow-2xl bg-white/90 backdrop-blur-xl animate-scale-in">
                <CardContent className="p-8 md:p-10">
                    {/* Back Button */}
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary-light)] font-medium mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white shadow-lg shadow-[var(--primary)]/30 mb-4">
                            <Mail className="w-10 h-10" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-[var(--primary)] mb-2">
                            Forgot Password?
                        </h1>
                        <p className="text-gray-600 text-base">
                            No worries! Enter your email and we'll send you reset instructions.
                        </p>
                    </div>

                    {/* Form */}
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[var(--primary)] font-semibold">
                                Email Address
                            </Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary)]/60 w-5 h-5 group-focus-within:text-[var(--primary)] transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    className="pl-12 h-14 rounded-xl border-2 border-[var(--primary)]/20 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address",
                                        },
                                    })}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    <span className="text-lg">⚠</span> {errors.email.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] hover:shadow-lg hover:shadow-[var(--primary)]/30 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                            Send Reset Link <Send className="w-5 h-5" />
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600">
                            Remember your password?{" "}
                            <Link
                                href="/login"
                                className="text-[var(--green)] hover:text-[var(--green-light)] font-semibold hover:underline transition-colors"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

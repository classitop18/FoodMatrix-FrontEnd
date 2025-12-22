"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { InvitationService } from "@/services/invitation/invitation.service";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Mail, ArrowRight } from "lucide-react";
import ThemeButton from "@/components/common/buttons/theme-button";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store.redux";

export default function InvitationPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState("");

    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setErrorMessage("Invalid invitation link. Missing token.");
            return;
        }

        if (!isAuthenticated) {
            // If not logged in, we need the user to login/register first
            // We'll redirect to sign-up but preserve the invitation token
            setStatus("loading");
            return;
        }

        const processInvitation = async () => {
            try {
                await InvitationService.acceptInvitation(token);
                setStatus("success");
                toast.success("Invitation accepted successfully!");
            } catch (error: any) {
                setStatus("error");
                setErrorMessage(error.response?.data?.message || "Failed to accept invitation. It might be expired or already used.");
            }
        };

        processInvitation();
    }, [token, isAuthenticated]);

    if (status === "loading" && !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail size={40} />
                    </div>
                    <h2 className="text-2xl font-extrabold text-[#313131] mb-4">Almost there!</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        To accept this invitation and join the household, you need to have a FoodMatrix account. Please sign in or create a new account.
                    </p>
                    <div className="space-y-3">

                        <ThemeButton
                            className="w-full h-12 font-bold text-base"
                            onClick={() => router.push(`/register?returnUrl=${encodeURIComponent(`/accept-invitation?token=${token}`)}`)}
                            label="Create Account"
                        />

                        <ThemeButton
                            className="w-full h-12 font-bold text-base"
                            onClick={() => router.push(`/login?returnUrl=${encodeURIComponent(`/accept-invitation?token=${token}`)}`)}
                            label="Sign In"
                        />
                    </div>
                </div>
            </div >
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center animate-in fade-in zoom-in-95 duration-500">
                {status === "loading" && (
                    <div className="space-y-4">
                        <Loader2 className="w-16 h-16 text-[#7661d3] animate-spin mx-auto" />
                        <h2 className="text-xl font-bold text-[#313131]">Processing Invitation...</h2>
                        <p className="text-gray-500 text-sm">Validating your token and updating your access.</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="animate-in slide-in-from-bottom-4 duration-500">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-2xl font-extrabold text-[#313131] mb-2">Wonderful!</h2>
                        <p className="text-gray-600 mb-8">
                            Invitation accepted! You are now one step closer to joining the household.
                            <span className="block mt-2 font-medium text-[#7661d3]">Waiting for Admin Approval.</span>
                        </p>
                        <ThemeButton
                            className="w-full h-12 font-bold"
                            onClick={() => router.push("/account")}
                            label="Go to My Account"
                        />
                    </div>
                )}

                {status === "error" && (
                    <div className="animate-in shake duration-500">
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-extrabold text-[#313131] mb-2">Oops!</h2>
                        <p className="text-red-600 text-sm font-medium mb-2">{errorMessage}</p>
                        <p className="text-gray-500 text-sm mb-8">
                            The link might be broken, expired, or already used. Please contact the person who invited you.
                        </p>
                        <ThemeButton
                            className="w-full h-12 font-bold"
                            onClick={() => router.push("/")}
                            label="Back to Home"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

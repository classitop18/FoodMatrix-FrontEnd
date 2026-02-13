"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { InvitationService } from "@/services/invitation/invitation.service";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/error-utils";
import { Loader2, CheckCircle2, XCircle, Mail, ArrowRight } from "lucide-react";
import ThemeButton from "@/components/common/buttons/theme-button";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store.redux";

const invitationService = new InvitationService();

export default function InvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [invitationDetails, setInvitationDetails] = useState<{
    email: string;
    exists: boolean;
  } | null>(null);

  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth,
  );

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Invalid invitation link. Missing token.");
      return;
    }

    const handleInvitation = async () => {
      try {
        // 1. Validate token and get invitation info
        const response = await invitationService.validateToken(token);
        const details = response.data;
        setInvitationDetails(details);

        // 2. If authenticated, attempt to accept automatically
        if (isAuthenticated && user) {
          if (user.email.toLowerCase() === details.email.toLowerCase()) {
            await invitationService.acceptInvitation(token);
            setStatus("success");
            toast({
              variant: "success",
              title: "Invitation accepted",
              description: "Invitation accepted successfully!",
            });

            // Store invitation context for the setup dialog
            sessionStorage.setItem("pending_invitation_context", JSON.stringify({
              email: details.email,
              type: "invitation",
              timestamp: Date.now()
            }));
          } else {
            setStatus("error");
            setErrorMessage(
              `This invitation was sent to ${details.email}, but you are signed in as ${user.email}. Please sign out and use the correct account.`,
            );
          }
        } else {
          // Not authenticated, wait for user to click Sign In / Register
          setStatus("loading");
        }
      } catch (error: any) {
        // Use utility to get clean error message
        const errorMessage = getErrorMessage(error);

        // Handle case where invitation was just accepted during registration
        if (
          errorMessage.includes("user_accepted") ||
          errorMessage.includes("user_approved") ||
          errorMessage === "Invitation has already been user_accepted"
        ) {
          setStatus("success");
          return;
        }

        setStatus("error");
        setErrorMessage(errorMessage);
        toast({
          variant: "destructive",
          title: "Invitation failed",
          description: errorMessage,
        });
      }
    };

    handleInvitation();
  }, [token, isAuthenticated, user]);

  if (status === "loading" && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={40} />
          </div>
          <h2 className="text-2xl font-extrabold text-[#313131] mb-4">
            Almost there!
          </h2>

          {invitationDetails ? (
            <>
              <p className="text-gray-600 mb-2 leading-relaxed">
                Invitation for{" "}
                <span className="font-bold text-[#7661d3]">
                  {invitationDetails.email}
                </span>
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed text-sm">
                {invitationDetails.exists
                  ? "You already have an account with this email. Please sign in to accept the invitation."
                  : "You don't have an account yet. Please register to accept the invitation."}
              </p>

              <div className="space-y-3">
                {invitationDetails.exists ? (
                  <ThemeButton
                    className="w-full h-12 font-bold text-base"
                    onClick={() =>
                      router.push(
                        `/login?email=${encodeURIComponent(invitationDetails.email)}&returnUrl=${encodeURIComponent(`/accept-invitation?token=${token}`)}`,
                      )
                    }
                    label="Sign In to Accept"
                  />
                ) : (
                  <ThemeButton
                    className="w-full h-12 font-bold text-base"
                    onClick={() =>
                      router.push(
                        `/register?email=${encodeURIComponent(invitationDetails.email)}&readonlyEmail=true&invitationToken=${token}&returnUrl=${encodeURIComponent(`/accept-invitation?token=${token}`)}`,
                      )
                    }
                    label="Create Account & Accept"
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-[#7661d3] animate-spin mb-4" />
              <p className="text-gray-500">Validating invitation...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center animate-in fade-in zoom-in-95 duration-500">
        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="w-16 h-16 text-[#7661d3] animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-[#313131]">
              Processing Invitation...
            </h2>
            <p className="text-gray-500 text-sm">
              Validating your token and updating your access.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-extrabold text-[#313131] mb-2">
              Wonderful!
            </h2>
            <p className="text-gray-600 mb-8">
              Invitation accepted! You are now one step closer to joining the
              household.
              <span className="block mt-2 font-medium text-[#7661d3]">
                Waiting for Admin Approval.
              </span>
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
            <h2 className="text-2xl font-extrabold text-[#313131] mb-2">
              Oops!
            </h2>
            <p className="text-red-600 text-sm font-medium mb-2">
              {errorMessage}
            </p>
            <p className="text-gray-500 text-sm mb-8">
              The link might be broken, expired, or already used. Please contact
              the person who invited you.
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

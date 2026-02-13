"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

type PendingInvitationContext = {
  email: string;
  type: "invitation";
  timestamp: number;
} | null;

export function AccountSetupRequiredDialog({
  isOpen,
  onClose,
  pendingInvitation,
}: {
  isOpen: boolean;
  onClose?: () => void;
  pendingInvitation?: PendingInvitationContext;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(isOpen);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const handleCreateAccount = () => {
    router.push("/account/create");
  };

  const isPendingInvitation = !!pendingInvitation;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val && onClose) onClose();
        if (!val && !onClose) setOpen(true);
      }}
    >
      <DialogContent
        className="sm:max-w-md bg-white border-0 shadow-2xl rounded-3xl p-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header Section with Gradient */}
        <div className={`p-8 text-center relative overflow-hidden ${isPendingInvitation ? 'bg-gradient-to-br from-indigo-50 to-purple-50' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>

          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-40 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-current opacity-5 rounded-full blur-2xl translate-x-1/2 translate-y-1/2"></div>

          <div className={`relative w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 duration-300 ${isPendingInvitation ? 'bg-white text-4xl' : 'bg-white text-3xl'}`}>
            {isPendingInvitation ? (
              <span className="animate-bounce-subtle">🎉</span>
            ) : (
              <span className="animate-pulse-subtle">🚀</span>
            )}
          </div>

          <DialogTitle className={`text-2xl font-extrabold mb-3 tracking-tight ${isPendingInvitation ? 'text-indigo-900' : 'text-gray-900'}`}>
            {isPendingInvitation ? "Wonderful! Accepted!" : "Setup Your Account"}
          </DialogTitle>

          <DialogDescription className="text-gray-600 text-base font-medium leading-relaxed px-2">
            {isPendingInvitation
              ? `You have successfully accepted the invitation. We are waiting for the admin to approve your request.`
              : "Welcome to FoodMatrix! To get started with managing your expenses and meals, let's create your first account."
            }
          </DialogDescription>
        </div>

        {/* Action Section */}
        <div className="p-8 bg-white">
          {isPendingInvitation ? (
            <div className="space-y-6">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
                <p className="text-indigo-800 text-sm font-semibold mb-1">Status: Pending Approval</p>
                <p className="text-gray-500 text-xs">You'll be notified once approved.</p>
              </div>

              <p className="text-center text-gray-500 text-sm leading-relaxed px-4">
                While you wait, you can create a personal account to explore the features.
              </p>

              <Button
                onClick={handleCreateAccount}
                className="w-full h-14 bg-[#313131] hover:bg-black text-white font-bold rounded-xl shadow-xl shadow-gray-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Create Personal Account
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform sm:inline-block" />
                </span>
              </Button>
            </div>
          ) : (
            <>
              <ul className="space-y-4 mb-8">
                {[
                  "Track your daily & monthly budget",
                  "Collaborate with family members",
                  "Get smart insights on spending",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-gray-600 font-medium group"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm group-hover:scale-125 transition-transform" />
                    {item}
                  </li>
                ))}
              </ul>

              <Button
                onClick={handleCreateAccount}
                className="w-full h-14 bg-[#313131] hover:bg-black text-white font-bold rounded-xl shadow-xl shadow-gray-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Create Account Now
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

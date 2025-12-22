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

export function AccountSetupRequiredDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(isOpen);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const handleCreateAccount = () => {
    router.push("/account/create");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        // Force user to take action, do not allow closing by clicking outside if required
        if (!val && onClose) onClose();
        // If strictly required, we override onOpenChange to do nothing or keep it open
        if (!val && !onClose) setOpen(true);
      }}
    >
      <DialogContent
        className="sm:max-w-md bg-white border border-gray-100 shadow-2xl rounded-2xl p-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="bg-[#F3F0FD] p-6 text-center border-b border-gray-100">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-3xl">
            🚀
          </div>
          <DialogTitle className="text-xl font-extrabold text-[#313131]">
            Setup Your Account
          </DialogTitle>
          <DialogDescription className="text-gray-500 mt-2 text-sm font-medium">
            Welcome to FoodMatrix! To get started with managing your expenses
            and meals, you need to create your first account.
          </DialogDescription>
        </div>

        <div className="p-6">
          <ul className="space-y-3 mb-6">
            {[
              "Track your daily & monthly budget",
              "Collaborate with family members",
              "Get smart insights on spending",
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-sm text-gray-600 font-medium"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#7dab4f]" />
                {item}
              </li>
            ))}
          </ul>

          <Button
            onClick={handleCreateAccount}
            className="w-full bg-[#313131] hover:bg-black text-white font-bold py-6 rounded-xl shadow-lg transition-all group"
          >
            Create Account Now
            <ArrowRight
              size={18}
              className="ml-2 group-hover:translate-x-1 transition-transform"
            />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";

interface InviteMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onInvite: (payload: { email: string }) => Promise<void>;
}

const InviteMemberDialog: React.FC<InviteMemberDialogProps> = ({
  open,
  onClose,
  onInvite,
}) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await onInvite({ email });
      setEmail("");
      onClose();
    } catch (error) {
      console.error("Invitation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && email) {
      handleInvite();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl p-6 border-2 shadow-xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Mail className="w-5 h-5 text-orange-600" />
            Invite Member
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Send an invitation to join your account. You'll assign their role
            after they accept.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="invite-email" className="font-semibold">
              Email Address
            </Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="member@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-12 rounded-xl"
              autoFocus
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              They'll receive an email with an invitation link
            </p>
          </div>
        </div>

        <DialogFooter className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button
            disabled={loading || !email}
            onClick={handleInvite}
            className="rounded-xl bg-orange-600 hover:bg-orange-700"
          >
            {loading ? "Sending..." : "Send Invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMemberDialog;

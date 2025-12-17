import React, { useState } from "react";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export default function ChangePasswordModal({ open, onClose, onSave }: any) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const toggle = (key: "current" | "new" | "confirm") =>
    setShow((p) => ({ ...p, [key]: !p[key] }));

  const handleChange = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p: any) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e: any = {};
    if (!form.currentPassword) e.currentPassword = "Current password required";
    if (!form.newPassword || form.newPassword.length < 8)
      e.newPassword = "Minimum 8 characters";
    if (form.newPassword !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    await onSave(form);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-xl">
        <Card className="border-0 shadow-xl gap-0">
          {/* Header */}
          <DialogHeader className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] px-6 py-4 text-white">
            <DialogTitle className="flex items-center gap-2 text-lg font-extrabold">
              <Lock className="w-5 h-5" />
              Change Password
            </DialogTitle>
          </DialogHeader>

          <CardContent className="px-6 py-6 space-y-4 bg-white">
            {/* Current Password */}
            <PasswordField
              label="Current Password"
              value={form.currentPassword}
              error={errors.currentPassword}
              show={show.current}
              onToggle={() => toggle("current")}
              onChange={(v) => handleChange("currentPassword", v)}
            />

            {/* New Password */}
            <PasswordField
              label="New Password"
              value={form.newPassword}
              error={errors.newPassword}
              show={show.new}
              onToggle={() => toggle("new")}
              onChange={(v) => handleChange("newPassword", v)}
            />

            {/* Confirm Password */}
            <PasswordField
              label="Confirm Password"
              value={form.confirmPassword}
              error={errors.confirmPassword}
              show={show.confirm}
              onToggle={() => toggle("confirm")}
              onChange={(v) => handleChange("confirmPassword", v)}
            />

            <DialogFooter className="pt-4 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="text-white bg-black hover:bg-black font-medium ps-6! pe-6! py-1 h-10 rounded-full text-base transition-all duration-300 cursor-pointer group relative flex items-center
            inset-shadow-[5px_5px_5px_rgba(255,255,255,0.30)] hover:inset-shadow-[-5px_-5px_5px_rgba(255,255,255,0.30)]"
              >
                Cancel
              </Button>

              <Button
                onClick={handleSave}
                disabled={loading}
                className="text-white bg-(--primary) hover:bg-(--primary) font-medium ps-6! pe-6!  h-10 rounded-full text-base transition-all duration-300 cursor-pointer group relative flex items-center
            inset-shadow-[5px_5px_5px_rgba(0,0,0,0.30)] hover:inset-shadow-[-5px_-5px_5px_rgba(0,0,0,0.50)] min-w-42 justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving
                  </>
                ) : (
                  "Save Password"
                )}
              </Button>
            </DialogFooter>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

/* 🔹 Reusable Password Field */
const PasswordField = ({
  label,
  value,
  error,
  show,
  onToggle,
  onChange,
}: any) => (
  <div className="space-y-1.5 relative">
    <Label className="font-bold text-gray-700 text-sm">{label}</Label>

    <Input
      type={show ? "text" : "password"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-11 pr-10 rounded-lg border ${error ? "border-red-500" : "border-[#BCBCBC]"
        }`}
    />

    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-9 text-gray-500 hover:text-[var(--primary)]"
    >
      {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>

    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

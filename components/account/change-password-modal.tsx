import React, { useState } from "react";

import { Lock, Eye, EyeOff } from "lucide-react";
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

  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const togglePassword = (field: string) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    let valid = true;
    let newErrors: any = {};

    if (!form.currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
      valid = false;
    }

    if (!form.newPassword.trim()) {
      newErrors.newPassword = "New password is required";
      valid = false;
    } else if (form.newPassword.length < 8) {
      newErrors.newPassword = "Password should be at least 8 characters";
      valid = false;
    }

    if (!form.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
      valid = false;
    } else if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
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
      <DialogContent className="max-w-md p-0">
        <Card className="border-none shadow-none">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-orange-600" />
              Change Password
            </DialogTitle>
          </DialogHeader>

          <CardContent className="space-y-4 px-6 pb-6">
            {/* Current Password */}
            <div className="space-y-1 relative">
              <Label>Current Password</Label>
              <Input
                type={showPassword.current ? "text" : "password"}
                value={form.currentPassword}
                onChange={(e) =>
                  handleChange("currentPassword", e.target.value)
                }
                placeholder="Enter current password"
                className={`h-12 pr-10 ${errors.currentPassword ? "border-red-500" : ""}`}
              />
              <button
                type="button"
                onClick={() => togglePassword("current")}
                className="absolute right-3 top-9"
              >
                {showPassword.current ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
              {errors.currentPassword && (
                <p className="text-red-500 text-sm">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-1 relative">
              <Label>New Password</Label>
              <Input
                type={showPassword.new ? "text" : "password"}
                value={form.newPassword}
                onChange={(e) => handleChange("newPassword", e.target.value)}
                placeholder="Enter new password"
                className={`h-12 pr-10 ${errors.newPassword ? "border-red-500" : ""}`}
              />
              <button
                type="button"
                onClick={() => togglePassword("new")}
                className="absolute right-3 top-9"
              >
                {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.newPassword && (
                <p className="text-red-500 text-sm">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1 relative">
              <Label>Confirm Password</Label>
              <Input
                type={showPassword.confirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
                placeholder="Confirm new password"
                className={`h-12 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
              />
              <button
                type="button"
                onClick={() => togglePassword("confirm")}
                className="absolute right-3 top-9"
              >
                {showPassword.confirm ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
              )}
            </div>

            <DialogFooter className="pt-2 flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>

              <Button
                className="bg-orange-600 hover:bg-orange-700"
                disabled={loading}
                onClick={handleSave}
              >
                {loading ? "Saving..." : "Save Password"}
              </Button>
            </DialogFooter>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

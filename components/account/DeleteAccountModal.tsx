"use client";

import React, { useState } from "react";
import { X, AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useDeleteAccount } from "@/services/account/account.mutation";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: any;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  account,
}: DeleteAccountModalProps) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const deleteAccountMutation = useDeleteAccount();

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    try {
      await deleteAccountMutation.mutateAsync(account.id);
      toast.success("Account deleted successfully!");
      onClose();
      // Redirect to account selection or home page
      router.push("/account");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete account");
    }
  };

  if (!isOpen || !account) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold">Delete Account</h2>
                <p className="text-sm text-white/80 mt-0.5">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={deleteAccountMutation.isPending}
              className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Trash2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-bold text-red-900">
                  Warning: Permanent Deletion
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Deleting this account will permanently remove:
                </p>
                <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                  <li>All account data and settings</li>
                  <li>All family members and their profiles</li>
                  <li>All health profiles and medical data</li>
                  <li>Budget allocations and history</li>
                  <li>Meal plans and preferences</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Account Name:</span>
              <span className="font-bold text-gray-800">
                {account.accountName || "Unnamed Account"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Account Type:</span>
              <span className="font-bold text-gray-800 capitalize">
                {account.accountType}
              </span>
            </div>
            {account.accountNumber && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">
                  Account Number:
                </span>
                <span className="font-bold text-gray-800">
                  {account.accountNumber}
                </span>
              </div>
            )}
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-widest block">
              Type "DELETE" to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              disabled={deleteAccountMutation.isPending}
              className="w-full px-4 py-3 rounded-xl border-2 border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-sm font-bold uppercase text-center disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 text-center">
              This confirmation is required to prevent accidental deletion
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={deleteAccountMutation.isPending}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={
                deleteAccountMutation.isPending || confirmText !== "DELETE"
              }
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-sm hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {deleteAccountMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete Account
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

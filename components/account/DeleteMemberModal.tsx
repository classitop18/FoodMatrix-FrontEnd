"use client";

import React from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { useDeleteMember } from "@/services/member/member.mutation";

interface DeleteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: any;
  accountId: string;
}

export default function DeleteMemberModal({
  isOpen,
  onClose,
  member,
  accountId,
}: DeleteMemberModalProps) {
  const deleteMemberMutation = useDeleteMember();

  const handleDelete = () => {
    deleteMemberMutation.mutate(member.id, {
      onSuccess: () => onClose()
    });
  };

  if (!isOpen || !member) return null;

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
                <h2 className="text-xl font-extrabold">Delete Member</h2>
                <p className="text-sm text-white/80 mt-0.5">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-bold text-red-600">
                {member.name ||
                  `${member.user?.firstName} ${member.user?.lastName}`}
              </span>
              ? This will permanently remove their profile and all associated
              data including their health profile.
            </p>
          </div>

          {/* Member Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Name:</span>
              <span className="font-bold text-gray-800">
                {member.name ||
                  `${member.user?.firstName} ${member.user?.lastName}`}
              </span>
            </div>
            {member.age && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Age:</span>
                <span className="font-bold text-gray-800">{member.age}</span>
              </div>
            )}
            {member.sex && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Gender:</span>
                <span className="font-bold text-gray-800 capitalize">
                  {member.sex}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Role:</span>
              <span className="font-bold text-gray-800 capitalize">
                {member.role}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all"
              disabled={deleteMemberMutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMemberMutation.isPending}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-sm hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {deleteMemberMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Member"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

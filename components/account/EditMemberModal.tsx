"use client";

import React, { useState, useEffect } from "react";
import { X, User, Calendar, Loader2, Edit3 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MemberService } from "@/services/member/member.service";
import { toast } from "sonner";

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: any;
  accountId: string;
}

const memberService = new MemberService();

export default function EditMemberModal({
  isOpen,
  onClose,
  member,
  accountId,
}: EditMemberModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    sex: "male",
    role: "member",
  });

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || "",
        age: member.age?.toString() || "",
        sex: member.sex || "male",
        role: member.role || "member",
      });
    }
  }, [member]);

  const updateMemberMutation = useMutation({
    mutationFn: async (data: any) => {
      return await memberService.updateMember(member.id, data);
    },
    onSuccess: () => {
      toast.success("Member updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["members", accountId] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update member");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    const updateData: any = {
      name: formData.name.trim(),
      sex: formData.sex,
      role: formData.role,
    };

    if (formData.age) {
      updateData.age = parseInt(formData.age);
    }

    updateMemberMutation.mutate(updateData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#7661d3] to-[#3d326d] text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Edit3 size={20} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold">Edit Member</h2>
                <p className="text-sm text-white/80 mt-0.5">
                  Update member information
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name Field */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
              Full Name *
            </label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter member's full name"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#7661d3] focus:ring-2 focus:ring-[#7661d3]/20 outline-none transition-all text-sm font-medium"
                required
              />
            </div>
          </div>

          {/* Age Field */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
              Age (Optional)
            </label>
            <div className="relative">
              <Calendar
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter age"
                min="0"
                max="150"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#7661d3] focus:ring-2 focus:ring-[#7661d3]/20 outline-none transition-all text-sm font-medium"
              />
            </div>
          </div>

          {/* Sex Field */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
              Gender
            </label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7661d3] focus:ring-2 focus:ring-[#7661d3]/20 outline-none transition-all text-sm font-medium bg-white"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Role Field */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7661d3] focus:ring-2 focus:ring-[#7661d3]/20 outline-none transition-all text-sm font-medium bg-white"
              disabled={member.role === "super_admin"}
            >
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
              <option value="internal">Internal</option>
              {member.role === "super_admin" && (
                <option value="super_admin">Super Admin</option>
              )}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all"
              disabled={updateMemberMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMemberMutation.isPending}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#7661d3] to-[#3d326d] text-white font-bold text-sm hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {updateMemberMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Member"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

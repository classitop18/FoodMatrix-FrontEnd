"use client";

import React, { useState } from "react";
import { X, User, Calendar, Users2, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MemberService } from "@/services/member/member.service";
import { toast } from "@/hooks/use-toast";


interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
}

const memberService = new MemberService();

export default function AddMemberModal({
  isOpen,
  onClose,
  accountId,
}: AddMemberModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    sex: "male",
    role: "member",
  });

  const roleOptions = [
    {
      value: "admin",
      label: "Admin",
    },
    {
      value: "super_admin",
      label: "Super Admin",
    },
    {
      value: "viewer",
      label: "Viewer",
    },
    {
      value: "member",
      label: "Member",
    },
  ];

  const createMemberMutation = useMutation({
    mutationFn: async (data: any) => {
      return await memberService.createMember(data);
    },
    onSuccess: () => {

      toast({
        title: "Member added successfully!",
        description: "Member added successfully!",
        variant: "default",
      })

      queryClient.invalidateQueries({ queryKey: ["members", accountId] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      onClose();
      setFormData({ name: "", age: "", sex: "male", role: "member" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add member",
        description: error?.response?.data?.message || "Failed to add member",
        variant: "destructive",
      })
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    try {

      e.preventDefault();

      if (!formData.name.trim()) {
        toast({
          title: "Name is required",
          description: "Name is required",
          variant: "destructive",
        })
        return;
      }

      const memberData = {
        accountId,
        userId: null, // Explicitly set to null for internal members
        name: formData.name.trim(),
        age: formData.age ? parseInt(formData.age) : null,
        sex: formData.sex,
        role: formData.role,
      };

      createMemberMutation.mutate(memberData);

    } catch (error: any) {
      toast({
        title: "Failed to add member",
        description: error?.response?.data?.message || "Failed to add member",
        variant: "destructive",
      })
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#7661d3] to-[#3d326d] text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Users2 size={20} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold">Add Family Member</h2>
                <p className="text-sm text-white/80 mt-0.5">
                  Add a new member to your household
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
            >
              {
                roleOptions?.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))
              }
            </select>
          </div>

          {/* Info Box */}
          <div className="bg-[#F3F0FD] rounded-xl p-4 border border-[#7661d3]/10">
            <p className="text-xs text-gray-600 leading-relaxed">
              <span className="font-bold text-[#7661d3]">Note:</span> After
              adding this member, you'll be able to create their health profile
              to personalize meal recommendations.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all"
              disabled={createMemberMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMemberMutation.isPending}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#7661d3] to-[#3d326d] text-white font-bold text-sm hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {createMemberMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Member"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

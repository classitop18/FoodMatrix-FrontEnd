import React from "react";
import { Crown, Mail, Edit, X } from "lucide-react";
import { ProtectedAction } from "@/components/common/protected-action";
import { PERMISSIONS } from "@/lib/permissions";

interface MemberCardProps {
  member: any;
  userId: string;
  onViewProfile: (member: any) => void;
  onEdit: (member: any) => void;
  onDelete: (member: any) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  userId,
  onViewProfile,
  onEdit,
  onDelete,
}) => {
  const isCurrentUser = userId == member?.userId;

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 hover:border-[#7661d3]/30 transition-all duration-300 p-3 shadow-sm hover:shadow-md h-full flex flex-col justify-between">
      {/* Decorative corner gradient */}
      <div className="absolute top-0 right-0 w-16 h-12 bg-gradient-to-br from-[#7661d3]/5 to-transparent rounded-tr-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="relative">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="relative shrink-0">
              {member.userId && member.user?.avatar ? (
                <img
                  src={member.user.avatar}
                  alt={member.user.firstName}
                  className="h-9 w-9 rounded-lg object-cover ring-2 ring-[#F3F0FD] shadow-sm"
                />
              ) : (
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#7661d3] to-[#3d326d] flex items-center justify-center text-white text-xs font-bold ring-2 ring-[#F3F0FD] shadow-sm">
                  {member.userId
                    ? `${member.user?.firstName?.[0] || ""}${member.user?.lastName?.[0] || ""}`
                    : member.name?.[0]?.toUpperCase() || "M"}
                </div>
              )}
              {member.role === "super_admin" && (
                <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  <Crown size={7} className="fill-white text-white" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-gray-800 text-sm truncate leading-tight">
                  {member.userId
                    ? `${member.user?.firstName || ""} ${member.user?.lastName || ""}`.trim()
                    : member.name || "Unnamed"}
                </h4>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide leading-none ${member.role === "super_admin"
                    ? "bg-amber-50 text-amber-700"
                    : member.role === "admin"
                      ? "bg-blue-50 text-blue-700"
                      : member.role === "member"
                        ? "bg-purple-50 text-purple-700"
                        : "bg-gray-50 text-gray-600"
                    }`}
                >
                  {member.role === "super_admin" ? "Super" : member.role}
                </div>
                {member.userId && member.user?.username && (
                  <span className="text-xs text-gray-400 truncate">
                    @{member.user.username}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-1.5 mb-3 bg-[#F8F7FC] rounded-lg p-2">
          {member.userId && member.user?.email ? (
            <div className="flex items-center gap-2 text-xs">
              <Mail size={10} className="text-[#7661d3] shrink-0" />
              <span className="text-gray-600 font-medium truncate text-xs">
                {member.user.email}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              {member.age && (
                <span className="text-xs text-gray-600 font-bold">
                  Age: {member.age}
                </span>
              )}
              {member.sex && (
                <span className="text-xs text-gray-600 capitalize">
                  {member.sex}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-gray-200/50">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">
              Account
            </span>
            <span className="text-xs font-bold text-gray-700 capitalize">
              {member.account?.accountType || "Household"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">
              Joined
            </span>
            <span className="text-xs font-bold text-gray-700">
              {new Date(member.createdAt).toLocaleDateString("en-US", {
                month: "short",
                year: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <ProtectedAction permission={PERMISSIONS.HEALTH_PROFILE_VIEW}>
            <button
              onClick={() => onViewProfile(member)}
              className="col-span-2 bg-[#313131] hover:bg-black text-white font-bold text-xs py-1.5 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              Health Profile
            </button>
          </ProtectedAction>

          {!isCurrentUser && (
            <>
              <ProtectedAction permission={PERMISSIONS.MEMBER_UPDATE}>
                <button
                  onClick={() => onEdit(member)}
                  className="bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs py-1.5 rounded-lg border border-gray-200 hover:border-[#7661d3] transition-all flex items-center justify-center gap-1"
                >
                  <Edit size={12} /> Edit
                </button>
              </ProtectedAction>

              {member.role !== "super_admin" && (
                <ProtectedAction permission={PERMISSIONS.MEMBER_DELETE}>
                  <button
                    onClick={() => onDelete(member)}
                    className="bg-white hover:bg-red-50 text-red-600 font-bold text-xs py-1.5 rounded-lg border border-red-100 hover:border-red-200 transition-all flex items-center justify-center gap-1"
                  >
                    <X size={12} /> Remove
                  </button>
                </ProtectedAction>
              )}
              {member.role === "super_admin" && (
                <div className="bg-gray-50 rounded-lg"></div>
              )}
            </>
          )}

          {isCurrentUser && (
            <div className="col-span-2 text-center text-[10px] text-gray-400 py-1 italic">
              Manage in Profile
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

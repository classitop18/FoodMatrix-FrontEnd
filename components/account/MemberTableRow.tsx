import React from "react";
import { Crown, User, Edit, X } from "lucide-react";
import { ProtectedAction } from "@/components/common/protected-action";
import { PERMISSIONS } from "@/lib/permissions";
import { API_BASE_URL } from "@/lib/api/endpoints";

interface MemberTableRowProps {
  member: any;
  onViewProfile: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isCurrentUser: boolean;
}

export const MemberTableRow: React.FC<MemberTableRowProps> = ({
  member,
  onViewProfile,
  onEdit,
  onDelete,
  isCurrentUser,
}) => (
  <div className="group bg-white rounded-xl p-4 md:py-3 md:px-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-[#7661d3]/30 transition-all grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
    <div className="col-span-12 md:col-span-3 flex items-center gap-3">
      <div className="relative shrink-0">
        {member.avatar ? (
          <img
            src={
              member.avatar.startsWith("http")
                ? member.avatar
                : `${API_BASE_URL.replace("/api/v1", "")}${member.avatar}`
            }
            alt={member.name}
            className="h-10 w-10 rounded-xl object-cover ring-2 ring-[#F3F0FD]"
          />
        ) : member.userId && member.user?.avatar ? (
          <img
            src={member.user.avatar}
            alt={member.user.firstName}
            className="h-10 w-10 rounded-xl object-cover ring-2 ring-[#F3F0FD]"
          />
        ) : (
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#7661d3] to-[#3d326d] flex items-center justify-center text-white text-sm font-bold ring-2 ring-[#F3F0FD]">
            {member.userId
              ? `${member.user?.firstName?.[0] || ""}${member.user?.lastName?.[0] || ""}`
              : member.name?.[0]?.toUpperCase() || "M"}
          </div>
        )}
        {member.role === "super_admin" && (
          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white">
            <Crown size={8} className="fill-white text-white" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="font-bold text-[#313131] text-sm truncate">
          {member.name || (member.userId
            ? `${member.user?.firstName || ""} ${member.user?.lastName || ""}`.trim()
            : "Unnamed Member")}
        </p>
        {member.userId && member.user?.username && (
          <p className="text-xs text-gray-500 truncate">
            @{member.user.username}
          </p>
        )}
        {!member.userId && (
          <p className="text-xs text-[#7661d3] font-bold">In-house Member</p>
        )}
      </div>
    </div>

    <div className="col-span-6 md:col-span-3">
      <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">
        Email
      </div>
      {member.userId && member.user?.email ? (
        <p className="text-xs text-gray-600 font-medium truncate">
          {member.user.email}
        </p>
      ) : (
        <div className="space-y-0.5">
          {member.age && (
            <p className="text-xs text-gray-600 font-medium">
              Age: {member.age}
            </p>
          )}
          {member.sex && (
            <p className="text-[10px] text-gray-500 capitalize">{member.sex}</p>
          )}
        </div>
      )}
    </div>

    <div className="col-span-6 md:col-span-2">
      <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">
        Role
      </div>
      <div
        className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${member.role === "super_admin"
          ? "bg-amber-50 text-amber-600 border-amber-100"
          : member.role === "admin"
            ? "bg-blue-50 text-blue-600 border-blue-100"
            : "bg-purple-50 text-purple-600 border-purple-100"
          }`}
      >
        {member.role === "super_admin" ? "Super Admin" : member.role}
      </div>
    </div>

    <div className="col-span-6 md:col-span-1">
      <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">
        Account
      </div>
      <p className="text-xs text-gray-600 font-medium capitalize truncate">
        {member.account?.accountType || "Household"}
      </p>
    </div>

    <div className="col-span-6 md:col-span-2">
      <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">
        Joined
      </div>
      <p className="text-xs text-gray-600 font-medium">
        {new Date(member.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>
    </div>

    <div className="col-span-12 md:col-span-1 flex items-center justify-end gap-1 mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-50">
      <ProtectedAction permission={PERMISSIONS.HEALTH_PROFILE_VIEW}>
        <button
          onClick={onViewProfile}
          className="h-8 w-8 rounded-lg bg-[#F3F0FD] hover:bg-[#7661d3] text-[#7661d3] hover:text-white flex items-center justify-center transition-all shadow-sm"
          title="View Profile"
        >
          <User size={14} />
        </button>
      </ProtectedAction>
      {!isCurrentUser && (
        <div className="flex items-center gap-1">
          <ProtectedAction permission={PERMISSIONS.MEMBER_UPDATE}>
            <button
              onClick={onEdit}
              className="h-8 w-8 rounded-lg bg-gray-50 hover:bg-gray-600 text-gray-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
              title="Edit"
            >
              <Edit size={14} />
            </button>
          </ProtectedAction>

          {member.role !== "super_admin" && (
            <ProtectedAction permission={PERMISSIONS.MEMBER_DELETE}>
              <button
                onClick={onDelete}
                className="h-8 w-8 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                title="Remove"
              >
                <X size={14} />
              </button>
            </ProtectedAction>
          )}
        </div>
      )}
    </div>
  </div>
);

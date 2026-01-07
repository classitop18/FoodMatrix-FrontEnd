import React, { useState } from "react";
import {
  RefreshCw,
  Grid3x3,
  List,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useMembers } from "@/services/member/member.query";
import { MemberCard } from "../MemberCard";
import { MemberTableRow } from "../MemberTableRow";
import { useRouter } from "next/navigation";
import { ProtectedAction } from "@/components/common/protected-action";
import { PERMISSIONS } from "@/lib/permissions";

interface MembersTabProps {
  activeAccountId: string;
  userId: string;
  isActive: boolean;
  onAddMember: () => void;
  onEditMember: (member: any) => void;
  onDeleteMember: (member: any) => void;
}

export const MembersTab: React.FC<MembersTabProps> = ({
  activeAccountId,
  userId,
  isActive,
  onAddMember,
  onEditMember,
  onDeleteMember,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const router = useRouter();

  // Only fetch when tab is active (lazy loading)
  const {
    data: members,
    isLoading: isMemberLoading,
    refetch: refetchMembers,
  } = useMembers(
    {
      accountId: activeAccountId,
      page: currentPage,
      limit: 10,
    },
    {
      enabled: isActive, // Lazy loading - only fetch when tab is active
    },
  );

  const [isRefetching, setIsRefetching] = useState(false);

  const handleRefetch = async () => {
    if (isRefetching || isMemberLoading) return;
    setIsRefetching(true);
    await refetchMembers();
    setTimeout(() => setIsRefetching(false), 1000);
  };

  const membersList: any[] = (members as any)?.data?.data || [];
  const pagination = (members as any)?.data.pagination;
  const isLoading = isMemberLoading || isRefetching;

  return (
    <div className="border-0 shadow-xl bg-white gap-0 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between mb-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] border-b-2 border-gray-200 p-4 flex justify-between items-center">
        <div className="text-white">
          <h3 className="text-xl font-extrabold">Family Members</h3>
          <p className="text-sm">Manage account members and roles</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefetch}
            disabled={isLoading}
            className={`bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed h-10 w-10 flex items-center justify-center ${
              isLoading ? "animate-spin" : ""
            }`}
            title="Refetch Members"
          >
            <RefreshCw size={16} />
          </button>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("card")}
              className={`p-1.5 rounded transition-all h-8 ${
                viewMode === "card" ? "bg-white shadow-sm" : "text-gray-400"
              }`}
            >
              <Grid3x3 size={16} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded transition-all h-8 ${
                viewMode === "table" ? "bg-white shadow-sm" : "text-gray-400"
              }`}
            >
              <List size={16} />
            </button>
          </div>
          <span className="bg-gray-200 text-gray-700 font-bold text-xs px-3 py-1 rounded-full">
            {pagination?.total || 0} Members
          </span>
          <ProtectedAction permission={PERMISSIONS.MEMBER_CREATE}>
            <button
              onClick={onAddMember}
              className="bg-[#313131] hover:bg-black text-white font-medium text-sm px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-md h-10"
            >
              <Plus size={14} />
              Add Member
            </button>
          </ProtectedAction>
        </div>
      </div>

      {viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-3">
          {membersList.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              userId={userId}
              onViewProfile={(member: any) =>
                router.push(`/health-profile/${member?.id}`)
              }
              onEdit={onEditMember}
              onDelete={onDeleteMember}
            />
          ))}
        </div>
      ) : (
        <div className="p-4 bg-[#F8F7FC] min-h-[100px] animate-in fade-in duration-300">
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            <div className="col-span-3">Member</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-1">Account</div>
            <div className="col-span-2">Joined</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          <div className="space-y-3">
            {membersList.map((member: any) => (
              <MemberTableRow
                key={member.id}
                member={member}
                onViewProfile={() =>
                  router.push(`/health-profile/${member?.id}`)
                }
                onEdit={() => onEditMember(member)}
                onDelete={() => onDeleteMember(member)}
                isCurrentUser={userId == member?.userId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination?.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-bold">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of <span className="font-bold">{pagination.total}</span> members
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={!pagination.hasPrev}
              onClick={() => setCurrentPage((p) => p - 1)}
              className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${
                pagination.hasPrev
                  ? "bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-9 px-3 rounded-lg font-bold text-sm transition-all ${
                    page === pagination.page
                      ? "bg-[#313131] text-white shadow-md"
                      : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  {page}
                </button>
              ),
            )}
            <button
              disabled={!pagination.hasNext}
              onClick={() => setCurrentPage((p) => p + 1)}
              className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${
                pagination.hasNext
                  ? "bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

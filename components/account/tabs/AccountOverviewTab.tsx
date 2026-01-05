import React, { useState } from "react";
import {
  User,
  MapPin,
  AlertTriangle,
  Trash2,
  Edit,
  RefreshCw,
} from "lucide-react";
import { PERMISSIONS } from "@/lib/permissions";
import { usePermissions } from "@/hooks/use-permissions";

interface AccountOverviewTabProps {
  account: any;
  activeAccountId: string;
  loading: boolean;
  onRefetch: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const AccountOverviewTab: React.FC<AccountOverviewTabProps> = ({
  account,
  activeAccountId,
  loading,
  onRefetch,
  onEdit,
  onDelete,
}) => {
  const { can, isSuperAdmin, isAdmin, isMember } = usePermissions();
  const [isRefetching, setIsRefetching] = useState(false);


  const handleRefetch = async () => {
    if (isRefetching || loading) return;
    setIsRefetching(true);
    await onRefetch();
    // Keep the button disabled for a minimum duration to prevent spam
    setTimeout(() => setIsRefetching(false), 1000);
  };

  const isLoading = loading || isRefetching;

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Account Information Card with Blue Header */}
      <div className="border-0 shadow-xl bg-white rounded-xl overflow-hidden">
        {/* Blue Gradient Header */}
        <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white p-4 flex justify-between items-center">
          <h3 className="flex items-center gap-3 text-xl font-extrabold">
            <User className="h-6 w-6" />
            Account Information
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefetch}
              disabled={isLoading}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refetch Details"
            >
              <RefreshCw
                size={16}
                className={`${isLoading ? "animate-spin" : ""}`}
              />
            </button>
            {can(PERMISSIONS.ACCOUNT_UPDATE) && (
              <button
                onClick={onEdit}
                className="bg-white text-[#7661d3] px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Edit className="h-4 w-4" />
                Edit Account
              </button>
            )}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6 space-y-6 bg-white">
          {/* Account Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {[
              {
                label: "Account Name",
                value: account?.accountName,
              },
              {
                label: "Account Number",
                value: account?.accountNumber,
              },
              {
                label: "Account Type",
                value: account?.accountType
                  ? account.accountType.charAt(0).toUpperCase() +
                    account.accountType.slice(1)
                  : null,
              },
              {
                label: "Description",
                value: account?.description,
                fullWidth: true,
              },
            ].map((field, i) => (
              <div key={i} className="group">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                  {field.label}
                </label>
                <div className="flex items-center justify-between border-b border-gray-200 group-hover:border-[#7661d3]/30 transition-colors pb-1.5">
                  <p className="text-base font-bold text-[#313131]">
                    {field.value || "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Address Section */}
          {(account?.formattedAddress ||
            account?.addressLine1 ||
            account?.city) && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={18} className="text-[#7661d3]" />
                <h4 className="font-bold text-[#313131] text-sm">
                  Account Address
                </h4>
              </div>
              <div className="bg-[#F8F7FC] rounded-xl p-5 border border-gray-200">
                <div className="space-y-3">
                  {account?.formattedAddress && (
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                        Full Address
                      </label>
                      <p className="text-sm font-medium text-[#313131]">
                        {account.formattedAddress}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {account?.addressLine1 && (
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Address Line 1
                        </label>
                        <p className="text-sm font-medium text-gray-700">
                          {account.addressLine1}
                        </p>
                      </div>
                    )}

                    {account?.addressLine2 && (
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Address Line 2
                        </label>
                        <p className="text-sm font-medium text-gray-700">
                          {account.addressLine2}
                        </p>
                      </div>
                    )}

                    {account?.city && (
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          City
                        </label>
                        <p className="text-sm font-medium text-gray-700">
                          {account.city}
                        </p>
                      </div>
                    )}

                    {account?.state && (
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          State
                        </label>
                        <p className="text-sm font-medium text-gray-700">
                          {account.state}
                        </p>
                      </div>
                    )}

                    {account?.zipCode && (
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          ZIP Code
                        </label>
                        <p className="text-sm font-medium text-gray-700">
                          {account.zipCode}
                        </p>
                      </div>
                    )}

                    {account?.country && (
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Country
                        </label>
                        <p className="text-sm font-medium text-gray-700">
                          {account.country}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences */}
          <div className="bg-[#F8F7FC] rounded-xl p-5 mt-4">
            <h4 className="font-bold text-[#313131] mb-4 text-sm flex items-center gap-2">
              <span className="w-1 h-4 bg-[#7661d3] rounded-full"></span>
              Account Preferences
            </h4>

            <div className="space-y-3">
              {/* Budget Override */}
              <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-200/50">
                <div>
                  <p className="font-bold text-gray-800 text-sm">
                    Budget Override Approval
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Require admin approval for exceeding limits
                  </p>
                </div>

                <div
                  className={`w-10 h-6 rounded-full relative transition-colors ${
                    account?.requiresAdminApprovalForOverrides
                      ? "bg-[#7dab4f]"
                      : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${
                      account?.requiresAdminApprovalForOverrides
                        ? "left-5"
                        : "left-1"
                    }`}
                  />
                </div>
              </div>

              {/* Auto Grocery */}
              <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-200/50">
                <div>
                  <p className="font-bold text-gray-800 text-sm">
                    Auto-Generate Grocery Lists
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Create smart lists based on planning period
                  </p>
                </div>

                <div
                  className={`w-10 h-6 rounded-full relative transition-colors ${
                    account?.autoGenerateGroceryLists
                      ? "bg-[#7dab4f]"
                      : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${
                      account?.autoGenerateGroceryLists ? "left-5" : "left-1"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {can(PERMISSIONS.ACCOUNT_DELETE) && (
            <div className="bg-gradient-to-br from-red-50 to-red-50/50 rounded-2xl p-6 border-2 border-red-100 shadow-md mt-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-red-900 uppercase tracking-wider mb-1">
                    Danger Zone
                  </h3>
                  <p className="text-sm text-red-700 leading-relaxed mb-4">
                    Permanently delete this account and all associated data.
                    This action cannot be undone.
                  </p>
                  <button
                    onClick={onDelete}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-3 px-5 rounded-xl transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <Trash2 size={16} />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

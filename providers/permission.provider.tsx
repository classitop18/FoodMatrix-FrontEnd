"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store.redux";
import {
  Role,
  hasPermission as checkPermission,
  hasAnyPermission,
  hasAllPermissions,
  getExpandedPermissions,
  getRoleLabel,
} from "@/lib/permissions";

// ============ CONTEXT TYPES ============
interface PermissionContextType {
  /** Current user's role in the active account */
  role: Role | null;
  /** Current user's member ID in the active account */
  memberId: string | null;
  /** Check if user has a specific permission */
  can: (permission: string) => boolean;
  /** Check if user has any of the given permissions */
  canAny: (permissions: string[]) => boolean;
  /** Check if user has all of the given permissions */
  canAll: (permissions: string[]) => boolean;
  /** Check if user is super admin */
  isSuperAdmin: boolean;
  /** Check if user is admin or higher */
  isAdmin: boolean;
  /** Check if user is a member (any role) */
  isMember: boolean;
  /** Get human-readable role label */
  roleLabel: string;
  /** Get all permissions for current role */
  permissions: string[];
  /** Whether permission data is loading */
  isLoading: boolean;
}

const defaultContext: PermissionContextType = {
  role: null,
  memberId: null,
  can: () => false,
  canAny: () => false,
  canAll: () => false,
  isSuperAdmin: false,
  isAdmin: false,
  isMember: false,
  roleLabel: "",
  permissions: [],
  isLoading: true,
};

const PermissionContext = createContext<PermissionContextType>(defaultContext);

// ============ PROVIDER ============
interface PermissionProviderProps {
  children: ReactNode;
}

export function PermissionProvider({ children }: PermissionProviderProps) {
  // Get current user's membership from Redux store
  const { myMembership, loading } = useSelector(
    (state: RootState) => state.account,
  );
  const role = (myMembership?.role as Role) ?? null;
  const memberId = myMembership?.id ?? null;

  // Memoized permission check functions
  const can = useCallback(
    (permission: string): boolean => {
      return checkPermission(role, permission);
    },
    [role],
  );

  const canAny = useCallback(
    (permissions: string[]): boolean => {
      return hasAnyPermission(role, permissions);
    },
    [role],
  );

  const canAll = useCallback(
    (permissions: string[]): boolean => {
      return hasAllPermissions(role, permissions);
    },
    [role],
  );

  // Computed role checks
  const isSuperAdmin = role === "super_admin";
  const isAdmin = role === "super_admin" || role === "admin";
  const isMember = role !== null;

  // Memoized values
  const roleLabel = useMemo(() => (role ? getRoleLabel(role) : ""), [role]);

  const permissions = useMemo(
    () => (role ? getExpandedPermissions(role) : []),
    [role],
  );

  const value: PermissionContextType = useMemo(
    () => ({
      role,
      memberId,
      can,
      canAny,
      canAll,
      isSuperAdmin,
      isAdmin,
      isMember,
      roleLabel,
      permissions,
      isLoading: loading,
    }),
    [
      role,
      memberId,
      can,
      canAny,
      canAll,
      isSuperAdmin,
      isAdmin,
      isMember,
      roleLabel,
      permissions,
      loading,
    ],
  );

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

// ============ HOOK ============
/**
 * Hook to access permission context
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { can, isAdmin, role } = usePermissions();
 *
 *   if (!can('meal:create')) {
 *     return <p>You don't have permission to create meals</p>;
 *   }
 *
 *   return <CreateMealForm />;
 * }
 * ```
 */
export function usePermissions(): PermissionContextType {
  const context = useContext(PermissionContext);

  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }

  return context;
}

// ============ EXPORT ============
export { PermissionContext };
export type { PermissionContextType };

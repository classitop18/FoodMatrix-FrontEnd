"use client";

import { useContext } from "react";
import {
    PermissionContext,
    PermissionContextType,
} from "@/providers/permission.provider";

/**
 * Hook to access permission context for role-based access control
 *
 * @returns {PermissionContextType} Permission context with role checks and permission utilities
 *
 * @example
 * ```tsx
 * function MealPlanning() {
 *   const { can, isAdmin, role, roleLabel } = usePermissions();
 *
 *   return (
 *     <div>
 *       <p>Your role: {roleLabel}</p>
 *
 *       {can('meal:create') && (
 *         <Button onClick={handleCreate}>Create Meal</Button>
 *       )}
 *
 *       {isAdmin && (
 *         <AdminPanel />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Check multiple permissions
 * ```tsx
 * function AdminSection() {
 *   const { canAny, canAll } = usePermissions();
 *
 *   // Show if user has ANY of these permissions
 *   if (canAny(['member:create', 'member:update'])) {
 *     return <MemberManagement />;
 *   }
 *
 *   // Show only if user has ALL permissions
 *   if (canAll(['account:update', 'member:delete'])) {
 *     return <DangerZone />;
 *   }
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

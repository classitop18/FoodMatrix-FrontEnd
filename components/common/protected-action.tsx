"use client";

import React, { ReactNode } from "react";
import { usePermissions } from "@/hooks/use-permissions";

// ============ PROTECTED ACTION COMPONENT ============
interface ProtectedActionProps {
    /** Required permission to show children */
    permission?: string;
    /** Alternative: require ANY of these permissions */
    anyPermission?: string[];
    /** Alternative: require ALL of these permissions */
    allPermissions?: string[];
    /** Content to show when user has permission */
    children: ReactNode;
    /** Optional fallback content when user doesn't have permission */
    fallback?: ReactNode;
    /** Show nothing instead of fallback (default: true) */
    hideIfUnauthorized?: boolean;
}

/**
 * Conditionally render content based on user permissions
 *
 * @example Single permission
 * ```tsx
 * <ProtectedAction permission="meal:create">
 *   <Button onClick={handleCreate}>Create Meal</Button>
 * </ProtectedAction>
 * ```
 *
 * @example Any of multiple permissions
 * ```tsx
 * <ProtectedAction anyPermission={['meal:create', 'meal:update']}>
 *   <MealActions />
 * </ProtectedAction>
 * ```
 *
 * @example All permissions required
 * ```tsx
 * <ProtectedAction allPermissions={['account:update', 'member:delete']}>
 *   <DangerZone />
 * </ProtectedAction>
 * ```
 *
 * @example With fallback
 * ```tsx
 * <ProtectedAction
 *   permission="member:delete"
 *   fallback={<p className="text-muted">Contact admin to delete</p>}
 * >
 *   <DeleteButton />
 * </ProtectedAction>
 * ```
 */
export function ProtectedAction({
    permission,
    anyPermission,
    allPermissions,
    children,
    fallback = null,
    hideIfUnauthorized = true,
}: ProtectedActionProps) {
    const { can, canAny, canAll, isLoading } = usePermissions();

    // Don't render anything while loading
    if (isLoading) {
        return null;
    }

    let hasAccess = false;

    if (permission) {
        hasAccess = can(permission);
    } else if (anyPermission && anyPermission.length > 0) {
        hasAccess = canAny(anyPermission);
    } else if (allPermissions && allPermissions.length > 0) {
        hasAccess = canAll(allPermissions);
    } else {
        // No permission specified, always show
        hasAccess = true;
    }

    if (hasAccess) {
        return <>{children}</>;
    }

    if (hideIfUnauthorized) {
        return null;
    }

    return <>{fallback}</>;
}

// ============ ROLE-BASED COMPONENTS ============

interface RoleBasedProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Show content only to Super Admin users
 */
export function SuperAdminOnly({ children, fallback = null }: RoleBasedProps) {
    const { isSuperAdmin, isLoading } = usePermissions();

    if (isLoading) return null;
    if (!isSuperAdmin) return <>{fallback}</>;
    return <>{children}</>;
}

/**
 * Show content only to Admin or Super Admin users
 */
export function AdminOnly({ children, fallback = null }: RoleBasedProps) {
    const { isAdmin, isLoading } = usePermissions();

    if (isLoading) return null;
    if (!isAdmin) return <>{fallback}</>;
    return <>{children}</>;
}

/**
 * Show content to any authenticated member
 */
export function MemberOnly({ children, fallback = null }: RoleBasedProps) {
    const { isMember, isLoading } = usePermissions();

    if (isLoading) return null;
    if (!isMember) return <>{fallback}</>;
    return <>{children}</>;
}

// ============ DISABLED VARIANT ============

interface ProtectedButtonProps {
    /** Required permission */
    permission: string;
    /** Children to wrap (should be a button or clickable element) */
    children: ReactNode;
    /** Show tooltip explaining why disabled */
    disabledTooltip?: string;
}

/**
 * Wrapper that disables children if user lacks permission
 * Useful for showing disabled buttons instead of hiding them
 *
 * @example
 * ```tsx
 * <ProtectedButton
 *   permission="meal:delete"
 *   disabledTooltip="Only admins can delete meals"
 * >
 *   <Button onClick={handleDelete}>Delete</Button>
 * </ProtectedButton>
 * ```
 */
export function ProtectedButton({
    permission,
    children,
    disabledTooltip,
}: ProtectedButtonProps) {
    const { can, isLoading } = usePermissions();

    const hasPermission = can(permission);

    if (isLoading || hasPermission) {
        return <>{children}</>;
    }

    // Clone children and add disabled prop
    const disabledChildren = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
                disabled: true,
                title: disabledTooltip,
                "aria-disabled": true,
                style: {
                    ...(child.props as any).style,
                    cursor: "not-allowed",
                    opacity: 0.5,
                },
            });
        }
        return child;
    });

    return <>{disabledChildren}</>;
}

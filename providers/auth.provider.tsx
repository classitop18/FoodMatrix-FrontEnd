"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthMe } from "@/services/auth/auth.query";
import { useMyAccounts } from "@/services/account/account.query";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, logout } from "@/redux/features/auth/auth.slice";
import {
  setAccounts,
  setActiveAccountId,
  clearAccount,
  fetchAccountDetail,
  fetchMyMembership,
} from "@/redux/features/account/account.slice";
import Loader from "@/components/common/Loader";
import { AccountSetupRequiredDialog } from "@/components/account/account-setup-required-dialog";
import { RootState } from "@/redux/store.redux";
import { PermissionProvider } from "@/providers/permission.provider";
import { AuthService } from "@/services/auth/auth.service";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const [isRestoringSession, setIsRestoringSession] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        try {
          const authService = new AuthService();
          await authService.refreshToken(true);
        } catch (error) {
          // Silent fail - user will be redirected to login by useAuthMe error
        }
      }
      setIsRestoringSession(false);
    };
    restoreSession();
  }, []);

  const {
    data: authData,
    isLoading: isAuthLoadingProp,
    isError: isAuthError,
  } = useAuthMe({ enabled: !isRestoringSession });

  const isAuthLoading = isRestoringSession || isAuthLoadingProp;

  const { data: accountsData, isLoading: isAccountsLoading } = useMyAccounts();

  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [pendingInvitation, setPendingInvitation] = useState<any>(null);

  // Get current active account and user from Redux
  const { activeAccountId } = useSelector((state: RootState) => state.account);
  const { user } = useSelector((state: RootState) => state.auth);

  /* ---------- AUTH STATE SYNC ---------- */
  useEffect(() => {
    if (isAuthLoading) return;

    if (isAuthError || !authData?.data) {
      dispatch(logout());
      dispatch(clearAccount()); // Clear account data on logout
      // Don't redirect here, let the Routing effect handle it if needed
      // Actually, if we are on a protected page, we DO want to redirect to login.
      // But let's handle that in Routing effect too?
      // Current logic: router.replace("/login") is okay.
      return;
    }

    // Update Redux state
    dispatch(
      loginSuccess({
        user: authData.data,
        accessToken: authData.accessToken,
      }),
    );
  }, [isAuthLoading, isAuthError, authData, dispatch]);

  /* ---------- ROUTING / REDIRECTS ---------- */
  useEffect(() => {
    if (isAuthLoading) return;

    const publicPaths = [
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
      "/verify-email",
      "/otp-verification",
      "/accept-invitation",
      "/subscription-plan"
    ];
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path)) || pathname === "/";
    const protectedPaths = ["/dashboard", "/account", "/profile", "/setup"]; // Add other protected roots
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

    const returnUrl = searchParams.get("returnUrl");

    // Case 1: Authenticated User on Public Page -> Redirect to Dashboard
    if (user && isPublicPath) {
      console.log("AuthProvider: Authenticated user on public path");
      if (returnUrl) {
        router.replace(returnUrl);
      } else {
        router.replace("/dashboard");
      }
    }

    // Case 2: Unauthenticated User on Protected Page -> Redirect to Login
    // (Note: The first useEffect handles logout, but this ensures redirect happens if user state is null)
    if (!user && isProtectedPath) {
      console.log("AuthProvider: Unauthenticated user on protected path, redirecting to login");
      // We let the first useEffect handle the logout/clear, but here we enforce navigation
      // router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
      // Actually, the first useEffect replaces with "/login". Let's stick to that for now to avoid double redirects.
      router.replace("/login");
    }

  }, [user, pathname, isAuthLoading, router]);

  /* ---------- ACCOUNTS ---------- */
  useEffect(() => {
    if (isAccountsLoading || !accountsData) return;

    const accounts = accountsData.data || [];

    if (accounts.length > 0) {
      dispatch(setAccounts(accounts));

      // Only set active account if:
      // 1. No active account is set (not from localStorage)
      // 2. OR the persisted account doesn't exist in current accounts list
      const persistedAccountExists =
        activeAccountId &&
        accounts.some((acc: any) => acc.id === activeAccountId);

      if (!activeAccountId || !persistedAccountExists) {
        dispatch(setActiveAccountId(accounts[0].id));
      }

      setShowSetupDialog(false);
      return;
    }

    // No accounts
    if (!pathname.includes("/account/create")) {
      setShowSetupDialog(true);

      // Check for pending invitation context
      if (typeof window !== "undefined") {
        const storedContext = sessionStorage.getItem("pending_invitation_context");
        if (storedContext) {
          try {
            const parsedContext = JSON.parse(storedContext);
            // Verify timestamp is recent (e.g., within 1 hour) to avoid stale popups
            const oneHour = 60 * 60 * 1000;
            if (Date.now() - parsedContext.timestamp < oneHour) {
              setPendingInvitation(parsedContext);
            } else {
              sessionStorage.removeItem("pending_invitation_context");
            }
          } catch (e) {
            console.error("Failed to parse pending invitation context", e);
            sessionStorage.removeItem("pending_invitation_context");
          }
        }
      }
    } else {
      setShowSetupDialog(false);
    }
  }, [accountsData, isAccountsLoading, dispatch, pathname, activeAccountId]);

  /* ---------- FETCH ACCOUNT DETAILS & MEMBERSHIP ---------- */
  useEffect(() => {
    // Fetch account details when activeAccountId is available
    if (activeAccountId) {
      dispatch(fetchAccountDetail(activeAccountId) as any);

      // Fetch current user's membership in this account
      if (user?.id) {
        dispatch(
          fetchMyMembership({
            accountId: activeAccountId,
            userId: user.id,
          }) as any,
        );
      }
    }
  }, [activeAccountId, user?.id, dispatch]);

  /* ---------- LOADER ---------- */
  if (isAuthLoading || isAccountsLoading) {
    return <Loader />;
  }

  /* ---------- BLOCK UI ---------- */
  const shouldBlockUI =
    showSetupDialog &&
    !pathname.includes("/account/create") &&
    !isAccountsLoading;

  if (shouldBlockUI) {
    return <AccountSetupRequiredDialog isOpen pendingInvitation={pendingInvitation} />;
  }

  return <PermissionProvider>{children}</PermissionProvider>;
}

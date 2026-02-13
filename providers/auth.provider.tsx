"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
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

function AuthNavigationLogic() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
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
    if (!user && isProtectedPath) {
      console.log("AuthProvider: Unauthenticated user on protected path, redirecting to login");
      router.replace("/login");
    }

  }, [user, pathname, router, searchParams]);

  return null;
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
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

  /* ---------- ACCOUNTS ---------- */
  useEffect(() => {
    if (isAccountsLoading || !accountsData) return;

    const accounts = accountsData.data || [];

    if (accounts.length > 0) {
      dispatch(setAccounts(accounts));

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
    if (activeAccountId) {
      dispatch(fetchAccountDetail(activeAccountId) as any);

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

  return (
    <>
      <Suspense fallback={null}>
        <AuthNavigationLogic />
      </Suspense>
      <PermissionProvider>{children}</PermissionProvider>
    </>
  );
}

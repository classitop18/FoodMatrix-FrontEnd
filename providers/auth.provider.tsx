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
  fetchAccountMembers,
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
      "/otp-verification",
      "/subscription-plan"
    ];
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path)) || pathname === "/";
    const protectedPaths = ["/dashboard", "/account", "/profile", "/setup", "/meal-planning"]; // Add other protected roots
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
          console.error("Session restoration failed", error);

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

  // Gate accounts query on auth - only fetch when we have a user
  const {
    data: accountsData,
    isLoading: isAccountsLoading,
    isError: isAccountsError // Destructure error state
  } = useMyAccounts({
    enabled: !!authData?.data
  });


  console.log("authData", authData);
  console.log("accountsData", accountsData);
  console.log("isAccountsLoading", isAccountsLoading);
  console.log("isAccountsError", isAccountsError);
  console.log("isAuthLoadingProp", isAuthLoadingProp);
  console.log("isAuthError", isAuthError);
  console.log("isRestoringSession", isRestoringSession);
  // console.log("activeAccountId", activeAccountId);
  // console.log("account", account);
  // console.log("accountError", accountError);
  // console.log("user", user);

  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [pendingInvitation, setPendingInvitation] = useState<any>(null);

  // Get current active account and user from Redux
  const { activeAccountId, account, error: accountError } = useSelector((state: RootState) => state.account);
  const { user } = useSelector((state: RootState) => state.auth);

  /* ---------- AUTH STATE SYNC ---------- */
  useEffect(() => {
    if (isRestoringSession || isAuthLoadingProp) return;

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
  }, [isRestoringSession, isAuthLoadingProp, isAuthError, authData, dispatch]);

  /* ---------- ACCOUNTS ERROR HANDLING ---------- */
  useEffect(() => {
    if (isAccountsError || accountError) {
      console.error("Failed to load accounts or details", { isAccountsError, accountError });
      // If critical error, logout
      if (isAccountsError) {
        dispatch(logout());
        dispatch(clearAccount());
      }
    }
  }, [isAccountsError, accountError, dispatch]);

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
        // localStorage.setItem("foodmatrix_active_account_id", accounts[0].id);
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

  /* ---------- FETCH ACCOUNT DETAILS & DATA ---------- */
  useEffect(() => {
    if (activeAccountId) {
      // Fetch account details and members - Only depends on activeAccountId
      dispatch(fetchAccountDetail(activeAccountId) as any);
      dispatch(fetchAccountMembers(activeAccountId) as any);
    }
  }, [activeAccountId, dispatch]);

  /* ---------- FETCH MY MEMBERSHIP ---------- */
  useEffect(() => {
    if (activeAccountId && user?.id) {
      // Fetch my membership - Depends on both activeAccountId and user.id
      dispatch(
        fetchMyMembership({
          accountId: activeAccountId,
          userId: user.id,
        }) as any,
      );
    }
  }, [activeAccountId, user?.id, dispatch]);

  /* ---------- LOADER ---------- */
  // Block protected routes until we have an active account
  const protectedPaths = ["/dashboard", "/account", "/profile", "/setup", "/meal-planning"];
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));

  // Account is ready if we have an activeAccountId AND we have fetched the account details (or hit an error)
  const isAccountReady = !!activeAccountId && (!!account || !!accountError);

  // If we don't have accounts (accountsData is empty or not loaded yet),
  // we shouldn't block on !isAccountReady indefinitely.
  // We ONLY want to block if we actually HAVE accounts but haven't selected/loaded one yet.
  const hasAccounts = accountsData?.length > 0 || (accountsData?.data && accountsData.data.length > 0);

  // Show loader if:
  // 1. Session restoring or Auth loading
  // 2. OR (User is authenticated AND we are on a protected route AND (Accounts are loading OR (We have accounts but Active ID not set yet)))
  const shouldShowLoader =
    (isProtectedRoute && (isRestoringSession || isAuthLoadingProp)) || // Only block on protected routes during load
    (!!user && isProtectedRoute && isAccountsLoading) ||
    (!!user && isProtectedRoute && hasAccounts && !isAccountReady);

  if (shouldShowLoader) {
    return <Loader message={isAccountReady ? undefined : "Preparing your dashboard..."} />;
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

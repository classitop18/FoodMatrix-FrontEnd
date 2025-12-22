"use client";

import { useRouter, usePathname } from "next/navigation";
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
} from "@/redux/features/account/account.slice";
import Loader from "@/components/common/Loader";
import { AccountSetupRequiredDialog } from "@/components/account/account-setup-required-dialog";
import { RootState } from "@/redux/store.redux";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const {
    data: authData,
    isLoading: isAuthLoading,
    isError: isAuthError,
  } = useAuthMe();
  const { data: accountsData, isLoading: isAccountsLoading } = useMyAccounts();

  const [showSetupDialog, setShowSetupDialog] = useState(false);

  // Get current active account from Redux (might be from localStorage)
  const { activeAccountId } = useSelector((state: RootState) => state.account);

  /* ---------- AUTH ---------- */
  useEffect(() => {
    if (isAuthLoading) return;

    if (isAuthError || !authData?.data) {
      dispatch(logout());
      dispatch(clearAccount()); // Clear account data on logout
      router.replace("/login");
      return;
    }

    dispatch(
      loginSuccess({
        user: authData.data,
        accessToken: authData.accessToken,
      }),
    );
  }, [isAuthLoading, isAuthError, authData, dispatch, router]);

  /* ---------- ACCOUNTS ---------- */
  useEffect(() => {
    if (isAccountsLoading || !accountsData) return;

    const accounts = accountsData.data || [];

    if (accounts.length > 0) {
      dispatch(setAccounts(accounts));

      // Only set active account if:
      // 1. No active account is set (not from localStorage)
      // 2. OR the persisted account doesn't exist in current accounts list
      const persistedAccountExists = activeAccountId && accounts.some((acc: any) => acc.id === activeAccountId);

      if (!activeAccountId || !persistedAccountExists) {
        dispatch(setActiveAccountId(accounts[0].id));
      }

      setShowSetupDialog(false);
      return;
    }

    // No accounts
    if (!pathname.includes("/account/create")) {
      setShowSetupDialog(true);
    } else {
      setShowSetupDialog(false);
    }
  }, [accountsData, isAccountsLoading, dispatch, pathname, activeAccountId]);

  /* ---------- FETCH ACCOUNT DETAILS ---------- */
  useEffect(() => {
    // Fetch account details when activeAccountId is available
    if (activeAccountId) {
      dispatch(fetchAccountDetail(activeAccountId) as any);
    }
  }, [activeAccountId, dispatch]);

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
    return <AccountSetupRequiredDialog isOpen />;
  }

  return <>{children}</>;
}

"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthMe } from "@/services/auth/auth.query";
import { useMyAccounts } from "@/services/account/account.query";
import { useDispatch } from "react-redux";
import { loginSuccess, logout } from "@/redux/features/auth/auth.slice";
import {
  setAccounts,
  setActiveAccountId,
} from "@/redux/features/account/account.slice";
import Loader from "@/components/common/Loader";
import { AccountSetupRequiredDialog } from "@/components/account/account-setup-required-dialog";

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

  /* ---------- AUTH ---------- */
  useEffect(() => {
    if (isAuthLoading) return;

    if (isAuthError || !authData?.data) {
      dispatch(logout());
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
      dispatch(setActiveAccountId(accounts[0].id));
      setShowSetupDialog(false);
      return;
    }

    // No accounts
    if (!pathname.includes("/account/create")) {
      setShowSetupDialog(true);
    } else {
      setShowSetupDialog(false);
    }
  }, [accountsData, isAccountsLoading, dispatch, pathname]);

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

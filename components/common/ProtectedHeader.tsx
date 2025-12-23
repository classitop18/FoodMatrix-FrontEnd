"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store.redux";
import { User, Building2, ChevronDown, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLogout } from "@/services/auth/auth.mutation";
import { toast } from "@/hooks/use-toast";

export default function ProtectedHeader() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const { account } = useSelector((state: RootState) => state.account);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    toast({
      variant: "default",
      title: "Logout",
      description: "You have been logged out.",
    });

    router.push("/");
  };

  // Close on outside click / Esc
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center">
          {/* Left spacer (logo can go here later) */}
          <div className="flex-1" />

          {/* Right section */}
          <div className="flex items-center gap-3">
            {account && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#7661d3]/15 bg-gradient-to-r from-[#F3F0FD] to-[#E8E4FC]">
                <Building2 size={14} className="text-[#7661d3]" />
                <span className="max-w-[160px] truncate text-xs font-semibold text-[#7661d3]">
                  {account.accountName}
                </span>
              </div>
            )}

            <div className="relative" ref={dropdownRef}>
              <button
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-gray-200 px-2 py-1.5 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7661d3]/30"
              >
                <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#7661d3] to-[#9b87e8] text-xs font-bold text-white">
                  {initials || <User size={14} />}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[10px] uppercase tracking-wide text-gray-400">
                    Welcome
                  </p>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>
                <ChevronDown
                  size={14}
                  className="hidden sm:block text-gray-400"
                />
              </button>

              {open && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl"
                >
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">
                      Signed in as
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-900">
                      {user?.email}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      @{user?.username}
                    </p>
                  </div>

                  <div className="py-2">
                    <Link
                      href="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50"
                    >
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#F3F0FD]">
                        <User size={16} className="text-[#7661d3]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Profile
                        </p>
                        <p className="text-[10px] text-gray-500">
                          View your profile
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/account"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50"
                    >
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#F3F0FD]">
                        <Settings size={16} className="text-[#7661d3]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Account Settings
                        </p>
                        <p className="text-[10px] text-gray-500">
                          Manage your account
                        </p>
                      </div>
                    </Link>
                  </div>

                  <div className="border-t border-gray-100 py-2">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-red-50"
                    >
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-red-50">
                        <LogOut size={16} className="text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-red-600">
                          Logout
                        </p>
                        <p className="text-[10px] text-red-400">Sign out</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

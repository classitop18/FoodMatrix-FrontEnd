"use client";

import { useEffect, useState } from "react";

import { loginSuccess, logout } from "@/redux/features/auth/auth.slice";
import { useAuthMe } from "@/services/auth/auth.query";

export function useCurrentSession() {
  const [loading, setLoading] = useState(true);

  const response = useAuthMe();

  return { loading, reloadSession: response };
}

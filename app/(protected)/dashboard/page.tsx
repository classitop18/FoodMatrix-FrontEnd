"use client";
import { useCurrentSession } from "@/hooks/use-current-session";
import { RootState } from "@/redux/store.redux";
import { useAuthMe } from "@/services/auth/auth.query";
import { useSelector } from "react-redux";

export default function DashBoardPage() {
  const user = useSelector((state: RootState) => state.auth);

  return <></>;
}

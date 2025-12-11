"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthMe } from "@/services/auth/auth.query";
import { useDispatch } from "react-redux";
import { loginSuccess, logout } from "@/redux/features/auth/auth.slice";


export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const dispatch = useDispatch();

    const { data, isLoading, isError } = useAuthMe();

    useEffect(() => {
        // Still fetching → do nothing
        if (isLoading) return;

        // If session not found → logout + redirect
        if (isError || !data?.data) {
            dispatch(logout());
            router.replace("/login");
            return;
        }

        dispatch(
            loginSuccess({
                user: data.data,                 // Correct shape
                accessToken: data.accessToken,   // Real token from backend
            })
        );
    }, [isLoading, isError, data, dispatch, router]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return <>{children}</>;
}

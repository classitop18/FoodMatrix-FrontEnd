"use client";

import { useQuery } from "@tanstack/react-query";
import { AuthService } from "./auth.service";

const authService = new AuthService();

export const useAuthMe = () => {
    return useQuery({
        queryKey: ["auth", "me"],
        queryFn: () => authService.getCurrentSession(),
        retry: false,
        refetchOnWindowFocus: false,
    });
};

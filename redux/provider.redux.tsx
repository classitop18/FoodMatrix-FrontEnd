"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Toaster } from "@/components/ui/sonner";

import { store } from "./store.redux";
import { Provider } from "react-redux";
import { usePathname } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // All routes where Navbar + Footer should be hidden
  const hiddenRoutes = [
    "/login",
    "/register",
    "/reset-password",
    "/",
    "/subscription-plan",
  ];

  const hideLayout = hiddenRoutes.includes(pathname);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {hideLayout && <Navbar />}

          <Toaster />
          {children}
          {hideLayout && <Footer />}
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
}

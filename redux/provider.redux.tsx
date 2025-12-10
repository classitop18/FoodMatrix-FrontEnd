"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Toaster } from "@/components/ui/toaster";

import { store } from "./store.redux";
import { Provider } from "react-redux";
import { useCurrentSession } from "@/hooks/use-current-session";

export function Providers({ children }: { children: React.ReactNode }) {

 
  return (
    <>
      <Provider store={store} >
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            {children}
          </TooltipProvider>
        </QueryClientProvider>
      </Provider>
    </>
  );
}

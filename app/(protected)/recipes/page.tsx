"use client";

import { Suspense } from "react";
import RecipesContent from "./recipes-content";
import { Loader2 } from "lucide-react";

export default function RecipesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-gray-100">
          <Loader2 className="h-10 w-10 animate-spin text-[#3d326d]" />
        </div>
      }
    >
      <RecipesContent />
    </Suspense>
  );
}

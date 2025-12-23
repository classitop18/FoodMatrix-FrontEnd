import Loader from "@/components/common/Loader";
import React, { Suspense } from "react";
import LoginPage from "./login-page";

export default function LoginWrapper() {
  return (
    <Suspense fallback={<Loader />}>
      <LoginPage />
    </Suspense>
  );
}

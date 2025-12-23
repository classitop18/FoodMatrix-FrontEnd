import Loader from "@/components/common/Loader";
import React, { Suspense } from "react";
import Register from "./ragister-page";

export default function RegisterWrapper() {
  return (
    <>
      <Suspense fallback={<Loader />}>
        <Register />
      </Suspense>
    </>
  );
}

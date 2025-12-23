import React, { Suspense } from "react";

import InvitationPage from "./invitation-page";
import Loader from "@/components/common/Loader";

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div>
          <Loader />
        </div>
      }
    >
      <InvitationPage />
    </Suspense>
  );
}

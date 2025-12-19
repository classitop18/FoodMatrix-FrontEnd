import { Suspense } from "react";
import OTPVerificationClient from "./otp-verification-client";

export default function OtpVerificationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OTPVerificationClient />
    </Suspense>
  );
}

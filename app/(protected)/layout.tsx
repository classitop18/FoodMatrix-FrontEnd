import { Sidebar } from "@/components/sidebar";
import ProtectedHeader from "@/components/common/ProtectedHeader";

import AuthProvider from "@/providers/auth.provider";
import ReactQueryProvider from "@/providers/react-query.provider";
import { RTKProviders } from "@/providers/rtk.provider";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RTKProviders>
      <ReactQueryProvider>
        <AuthProvider>
          {/* Root */}
          <div className="min-h-screen flex overflow-hidden">
            <Sidebar />

            {/* Main content (only this scrolls) */}
            <main className="flex-1 h-screen overflow-y-auto transition-all duration-300">
              {/* Header - Sticky at top */}
              <ProtectedHeader />

              {/* Page Content */}
              {children}
            </main>
          </div>
        </AuthProvider>
      </ReactQueryProvider>
    </RTKProviders>
  );
}

import { Sidebar } from "@/components/sidebar";

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
            {/* Sidebar (fixed height, no scroll) */}
            <div className="h-screen flex-shrink-0">
              <Sidebar />
            </div>

            {/* Main content (only this scrolls) */}
            <main className="flex-1 h-screen overflow-y-auto transition-all duration-300">
              {children}
            </main>
          </div>
        </AuthProvider>
      </ReactQueryProvider>
    </RTKProviders>
  );
}

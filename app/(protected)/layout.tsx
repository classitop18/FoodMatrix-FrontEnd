import AuthProvider from "@/providers/auth.provider";
import ReactQueryProvider from "@/providers/react-query.provider";
import { RTKProviders } from "@/providers/rtk.provider";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <RTKProviders>
            <ReactQueryProvider>
                <AuthProvider>
                    <div className="min-h-screen bg-gray-50">
                        {/* sidebar / navbar / anything */}
                        {children}
                    </div>
                </AuthProvider>
            </ReactQueryProvider>
        </RTKProviders>
    );
}

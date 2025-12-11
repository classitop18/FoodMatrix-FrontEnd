import { Sidebar } from "@/components/sidebar";

import AuthProvider from "@/providers/auth.provider";
import ReactQueryProvider from "@/providers/react-query.provider";
import { RTKProviders } from "@/providers/rtk.provider";


export default function ProtectedLayout({ children }: { children: React.ReactNode }) {


    return (
        <RTKProviders>
            <ReactQueryProvider>
                <AuthProvider>
                    <div className="min-h-screen bg-gray-50 flex">
                        <Sidebar />
                        <main className="flex-1 ml-20 md:ml-64 p-4">
                            {children}
                        </main>
                    </div>
                </AuthProvider>
            </ReactQueryProvider>
        </RTKProviders>
    );
}

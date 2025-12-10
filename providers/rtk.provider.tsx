"use client";

import { Provider } from "react-redux";
import { store } from "@/redux/store.redux";

export function RTKProviders({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Provider store={store} >
                {children}
            </Provider>
        </>
    );
}

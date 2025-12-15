"use client";

import { ReactNode } from "react";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <WorkspaceProvider>
            {children}
        </WorkspaceProvider>
    );
}

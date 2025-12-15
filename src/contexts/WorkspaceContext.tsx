"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { workspacesAPI } from '@/lib/api';
import type { Workspace } from '@/types/api-types';

interface WorkspaceContextType {
    workspaces: Workspace[];
    currentWorkspace: Workspace | null;
    setCurrentWorkspace: (workspace: Workspace | null) => void;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWorkspaces = async () => {
        try {
            setLoading(true);
            const data = await workspacesAPI.list();
            setWorkspaces(data.workspaces);

            // Auto-select first workspace if none selected
            if (data.workspaces.length > 0 && !currentWorkspace) {
                setCurrentWorkspace(data.workspaces[0]);
            }

            setError(null);
        } catch (err) {
            // Se não conseguir carregar (não autenticado, etc), não mostra erro
            // Apenas usa dados mock
            setError(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    return (
        <WorkspaceContext.Provider
            value={{
                workspaces,
                currentWorkspace,
                setCurrentWorkspace,
                loading,
                error,
                refetch: fetchWorkspaces,
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    );
}

export function useWorkspaceContext() {
    const context = useContext(WorkspaceContext);
    if (context === undefined) {
        throw new Error('useWorkspaceContext must be used within a WorkspaceProvider');
    }
    return context;
}

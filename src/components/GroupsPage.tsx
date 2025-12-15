"use client";

import { useState, useEffect, useCallback } from "react";
import { groupsAPI, workspacesAPI } from "@/lib/api";
import type { Group as APIGroup, Member, Workspace } from "@/types/api-types";

export default function GroupsPage() {
    const [groups, setGroups] = useState<APIGroup[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<APIGroup | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: "" });
    const [newWorkspaceName, setNewWorkspaceName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [workspaceId, setWorkspaceId] = useState<string | null>(null);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

    // Fetch workspaces first
    useEffect(() => {
        async function fetchWorkspaces() {
            try {
                const data = await workspacesAPI.list();
                setWorkspaces(data.workspaces);
                if (data.workspaces.length > 0) {
                    setWorkspaceId(data.workspaces[0].id);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error("Failed to fetch workspaces:", err);
                setError("Não foi possível carregar os workspaces.");
                setLoading(false);
            }
        }
        fetchWorkspaces();
    }, []);

    // Fetch groups
    const fetchGroups = useCallback(async () => {
        if (!workspaceId) {
            setGroups([]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await groupsAPI.list(workspaceId);
            setGroups(data.groups);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao carregar grupos");
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        if (workspaceId) {
            fetchGroups();
        }
    }, [workspaceId, fetchGroups]);

    // Create group
    const handleCreateGroup = async () => {
        if (!workspaceId || !newGroup.name.trim()) return;

        try {
            setLoading(true);
            await groupsAPI.create(workspaceId, { name: newGroup.name, memberIds: [] });
            setNewGroup({ name: "" });
            setShowCreateModal(false);
            await fetchGroups();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao criar grupo");
        } finally {
            setLoading(false);
        }
    };

    // Create workspace
    const handleCreateWorkspace = async () => {
        if (!newWorkspaceName.trim()) return;

        try {
            setLoading(true);
            const data = await workspacesAPI.create({ name: newWorkspaceName, type: "CLASS" });
            const newWorkspaces = [...workspaces, data.workspace];
            setWorkspaces(newWorkspaces);
            setWorkspaceId(data.workspace.id); // Select the new workspace
            setNewWorkspaceName("");
            setShowCreateWorkspaceModal(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao criar workspace");
            setLoading(false);
        }
    };

    // Leave/delete group
    const handleLeaveGroup = async () => {
        if (!workspaceId || !selectedGroup) return;

        try {
            setLoading(true);
            await groupsAPI.delete(workspaceId, selectedGroup.id);
            setSelectedGroup(null);
            setShowLeaveModal(false);
            await fetchGroups();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao sair do grupo");
        } finally {
            setLoading(false);
        }
    };

    // Get group details
    const handleSelectGroup = async (group: APIGroup) => {
        if (!workspaceId) return;

        try {
            const data = await groupsAPI.get(workspaceId, group.id);
            setSelectedGroup(data.group);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao carregar grupo");
        }
    };

    // Colors for groups (local only since API doesn't have colors)
    const getGroupColor = (id: string) => {
        const colors = ["#1E40AF", "#059669", "#DC2626", "#7C3AED", "#F59E0B", "#EC4899"];
        const index = parseInt(id, 16) % colors.length || 0;
        return colors[Math.abs(index)];
    };

    // Modal de Criar Workspace
    const CreateWorkspaceModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateWorkspaceModal(false)}>
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-slate-800 mb-4">Criar Novo Workspace</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Workspace</label>
                        <input
                            type="text"
                            value={newWorkspaceName}
                            onChange={(e) => setNewWorkspaceName(e.target.value)}
                            placeholder="Ex: Escola Secundária"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={() => setShowCreateWorkspaceModal(false)}
                        className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleCreateWorkspace}
                        disabled={!newWorkspaceName.trim() || loading}
                        className="flex-1 px-4 py-2 bg-[#1E40AF] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full size-4 border-b-2 border-white"></div>
                        ) : null}
                        Criar Workspace
                    </button>
                </div>
            </div>
        </div>
    );

    // Modal de Criar Grupo
    const CreateGroupModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-slate-800 mb-4">Criar Novo Grupo</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Grupo</label>
                        <input
                            type="text"
                            value={newGroup.name}
                            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                            placeholder="Ex: Turma 12ºA"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>

                    {workspaces.length > 1 && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Workspace</label>
                            <select
                                value={workspaceId || ""}
                                onChange={(e) => setWorkspaceId(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {workspaces.map((ws) => (
                                    <option key={ws.id} value={ws.id}>{ws.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleCreateGroup}
                        disabled={!newGroup.name.trim() || loading}
                        className="flex-1 px-4 py-2 bg-[#1E40AF] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full size-4 border-b-2 border-white"></div>
                        ) : null}
                        Criar Grupo
                    </button>
                </div>
            </div>
        </div>
    );

    // Modal de Sair do Grupo
    const LeaveGroupModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="size-12 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-red-600 text-2xl">logout</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Sair do Grupo</h2>
                        <p className="text-sm text-slate-500">{selectedGroup?.name}</p>
                    </div>
                </div>

                <p className="text-slate-600 mb-6">
                    Tens a certeza que queres eliminar este grupo? Esta ação não pode ser desfeita.
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowLeaveModal(false)}
                        className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleLeaveGroup}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full size-4 border-b-2 border-white"></div>
                        ) : null}
                        Eliminar Grupo
                    </button>
                </div>
            </div>
        </div>
    );

    // Loading state
    if (loading && groups.length === 0 && workspaces.length > 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full size-8 border-b-2 border-[#1E40AF]"></div>
            </div>
        );
    }

    // No workspace available
    if (!workspaceId && !loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                {showCreateWorkspaceModal && <CreateWorkspaceModal />}
                <div className="size-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400 text-3xl">workspaces</span>
                </div>
                <div>
                    <p className="text-slate-500 mb-2 font-medium">Nenhum workspace encontrado.</p>
                    <p className="text-sm text-slate-400">Cria um workspace primeiro para gerir grupos, tarefas e eventos.</p>
                </div>
                <button
                    onClick={() => setShowCreateWorkspaceModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1E40AF] text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    Criar Workspace
                </button>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                {error}
                <button onClick={() => window.location.reload()} className="ml-4 underline">Tentar novamente</button>
            </div>
        );
    }

    // Group details view
    if (selectedGroup) {
        const color = getGroupColor(selectedGroup.id);
        return (
            <div className="flex flex-col gap-6">
                {showLeaveModal && <LeaveGroupModal />}

                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setSelectedGroup(null)}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                        <span className="text-sm font-medium">Voltar aos Grupos</span>
                    </button>

                    <button
                        onClick={() => setShowLeaveModal(true)}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                    >
                        <span className="material-symbols-outlined text-lg">delete</span>
                        Eliminar Grupo
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div
                        className="size-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl"
                        style={{ backgroundColor: color }}
                    >
                        {selectedGroup.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{selectedGroup.name}</h1>
                        <p className="text-slate-500">{selectedGroup._count?.members || 0} membros</p>
                    </div>
                </div>

                {/* Membros */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-800">
                            Membros ({selectedGroup.members?.length || 0})
                        </h2>
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#1E40AF] border border-[#1E40AF] rounded-lg hover:bg-blue-50 transition-colors">
                            <span className="material-symbols-outlined text-lg">person_add</span>
                            Convidar
                        </button>
                    </div>
                    {selectedGroup.members && selectedGroup.members.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedGroup.members.map((member: Member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200"
                                >
                                    <div className="size-10 rounded-full bg-slate-300 flex items-center justify-center text-white font-medium">
                                        {member.user.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-700">{member.user.name}</p>
                                        <p className="text-xs text-slate-400">
                                            {member.role === "ADMIN" ? "Administrador" : "Membro"}
                                        </p>
                                    </div>
                                    {member.role === "ADMIN" && (
                                        <span className="material-symbols-outlined text-amber-500 text-sm">star</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-center py-4">Nenhum membro ainda.</p>
                    )}
                </div>

                {/* Calendário Partilhado do Grupo */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-800">
                            Calendário Partilhado
                        </h2>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#1E40AF] text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                            <span className="material-symbols-outlined text-lg">add</span>
                            Adicionar Evento
                        </button>
                    </div>
                    <p className="text-slate-500 text-center py-8">
                        Calendário partilhado - todos os membros podem ver e adicionar eventos
                    </p>
                </div>
            </div>
        );
    }

    // Groups list view
    return (
        <div className="flex flex-col gap-6">
            {showCreateModal && <CreateGroupModal />}
            {showCreateWorkspaceModal && <CreateWorkspaceModal />}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Grupos / Turmas</h1>
                    {workspaces.length > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                            <select
                                value={workspaceId || ""}
                                onChange={(e) => setWorkspaceId(e.target.value)}
                                className="text-sm text-slate-500 bg-transparent border-none focus:outline-none cursor-pointer hover:text-slate-700"
                            >
                                {workspaces.map((ws) => (
                                    <option key={ws.id} value={ws.id}>{ws.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => setShowCreateWorkspaceModal(true)}
                                className="text-slate-400 hover:text-[#1E40AF] transition-colors"
                                title="Criar novo workspace"
                            >
                                <span className="material-symbols-outlined text-lg">add_circle</span>
                            </button>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1E40AF] text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    Criar Grupo
                </button>
            </div>

            {/* Lista de Grupos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                        <div className="size-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-slate-400 text-3xl">group</span>
                        </div>
                        <p className="text-slate-500 mb-4">
                            Nenhum grupo encontrado neste workspace.
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#1E40AF] text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            Criar Primeiro Grupo
                        </button>
                    </div>
                ) : (
                    groups.map((group) => {
                        const color = getGroupColor(group.id);
                        return (
                            <div
                                key={group.id}
                                onClick={() => handleSelectGroup(group)}
                                className="bg-white rounded-xl shadow-md p-6 border-l-4 hover:shadow-lg transition-all cursor-pointer"
                                style={{ borderLeftColor: color }}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className="size-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                                        style={{ backgroundColor: color }}
                                    >
                                        {group.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-800">{group.name}</h3>
                                        <p className="text-sm text-slate-500">
                                            {group._count?.members || 0} membros
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

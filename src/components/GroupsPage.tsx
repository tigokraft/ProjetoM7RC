"use client";

import { useState } from "react";

interface GroupMember {
    id: number;
    name: string;
    avatar: string;
    role: "admin" | "member";
}

interface Group {
    id: number;
    name: string;
    description: string;
    color: string;
    members: GroupMember[];
    eventsCount: number;
}

interface GroupsPageProps {
    groups: Group[];
}

export default function GroupsPage({ groups: initialGroups }: GroupsPageProps) {
    const [groups, setGroups] = useState<Group[]>(initialGroups);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: "", description: "", color: "#1E40AF" });

    const handleCreateGroup = () => {
        if (!newGroup.name.trim()) return;

        const group: Group = {
            id: Date.now(),
            name: newGroup.name,
            description: newGroup.description,
            color: newGroup.color,
            members: [{ id: 1, name: "Eu", avatar: "", role: "admin" }],
            eventsCount: 0,
        };

        setGroups([...groups, group]);
        setNewGroup({ name: "", description: "", color: "#1E40AF" });
        setShowCreateModal(false);
    };

    const handleLeaveGroup = () => {
        if (!selectedGroup) return;
        setGroups(groups.filter(g => g.id !== selectedGroup.id));
        setSelectedGroup(null);
        setShowLeaveModal(false);
    };

    // Modal de Criar Grupo
    const CreateGroupModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
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
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                        <textarea
                            value={newGroup.description}
                            onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                            placeholder="Descrição do grupo..."
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Cor</label>
                        <div className="flex gap-2">
                            {["#1E40AF", "#059669", "#DC2626", "#7C3AED", "#F59E0B", "#EC4899"].map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setNewGroup({ ...newGroup, color })}
                                    className={`size-8 rounded-lg transition-transform ${newGroup.color === color ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : ""}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>
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
                        disabled={!newGroup.name.trim()}
                        className="flex-1 px-4 py-2 bg-[#1E40AF] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
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
                    Tens a certeza que queres sair deste grupo? Vais perder acesso ao calendário partilhado e todos os eventos do grupo.
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
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Sair do Grupo
                    </button>
                </div>
            </div>
        </div>
    );

    if (selectedGroup) {
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
                        <span className="material-symbols-outlined text-lg">logout</span>
                        Sair do Grupo
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div
                        className="size-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl"
                        style={{ backgroundColor: selectedGroup.color }}
                    >
                        {selectedGroup.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{selectedGroup.name}</h1>
                        <p className="text-slate-500">{selectedGroup.description}</p>
                    </div>
                </div>

                {/* Membros */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-800">
                            Membros ({selectedGroup.members.length})
                        </h2>
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#1E40AF] border border-[#1E40AF] rounded-lg hover:bg-blue-50 transition-colors">
                            <span className="material-symbols-outlined text-lg">person_add</span>
                            Convidar
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedGroup.members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200"
                            >
                                <div
                                    className="size-10 rounded-full bg-slate-300 flex items-center justify-center text-white font-medium"
                                    style={member.avatar ? { backgroundImage: `url(${member.avatar})`, backgroundSize: "cover" } : {}}
                                >
                                    {!member.avatar && member.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-slate-700">{member.name}</p>
                                    <p className="text-xs text-slate-400">
                                        {member.role === "admin" ? "Administrador" : "Membro"}
                                    </p>
                                </div>
                                {member.role === "admin" && (
                                    <span className="material-symbols-outlined text-amber-500 text-sm">star</span>
                                )}
                            </div>
                        ))}
                    </div>
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
                        Calendário partilhado da turma - todos os membros podem ver e adicionar eventos
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {showCreateModal && <CreateGroupModal />}

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Grupos / Turmas</h1>
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
                            Nenhum grupo encontrado. Cria um grupo para partilhar calendário com a tua turma!
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
                    groups.map((group) => (
                        <div
                            key={group.id}
                            onClick={() => setSelectedGroup(group)}
                            className="bg-white rounded-xl shadow-md p-6 border-l-4 hover:shadow-lg transition-all cursor-pointer"
                            style={{ borderLeftColor: group.color }}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className="size-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                                    style={{ backgroundColor: group.color }}
                                >
                                    {group.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-800">{group.name}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-2">{group.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-1 text-sm text-slate-500">
                                    <span className="material-symbols-outlined text-lg">group</span>
                                    {group.members.length} membros
                                </div>
                                <div className="flex items-center gap-1 text-sm text-slate-500">
                                    <span className="material-symbols-outlined text-lg">event</span>
                                    {group.eventsCount} eventos
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

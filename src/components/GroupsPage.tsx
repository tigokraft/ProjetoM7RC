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

export default function GroupsPage({ groups }: GroupsPageProps) {
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

    if (selectedGroup) {
        return (
            <div className="flex flex-col gap-6">
                <button
                    onClick={() => setSelectedGroup(null)}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors w-fit"
                >
                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                    <span className="text-sm font-medium">Voltar aos Grupos</span>
                </button>

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
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">
                        Membros ({selectedGroup.members.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedGroup.members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200"
                            >
                                <div
                                    className="size-10 rounded-full bg-center bg-cover"
                                    style={{ backgroundImage: `url(${member.avatar})` }}
                                />
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
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Grupos / Turmas</h1>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#1E40AF] text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    <span className="material-symbols-outlined text-lg">add</span>
                    Criar Grupo
                </button>
            </div>

            {/* Lista de Grupos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.length === 0 ? (
                    <p className="text-slate-500 col-span-full text-center py-8">
                        Nenhum grupo encontrado. Cria um grupo para partilhar calendário com a tua turma!
                    </p>
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

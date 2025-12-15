"use client";

import { useState } from "react";

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

type ActivePage = "calendario" | "tarefas" | "eventos" | "notificacoes";

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
    const [activePage, setActivePage] = useState<ActivePage>("calendario");

    const navItems = [
        { id: "calendario" as ActivePage, icon: "calendar_month", label: "Calendário" },
        { id: "tarefas" as ActivePage, icon: "task", label: "Tarefas" },
        { id: "eventos" as ActivePage, icon: "event", label: "Eventos" },
        { id: "notificacoes" as ActivePage, icon: "notifications", label: "Notificações" },
    ];

    return (
        <>
            {/* Botão fixo para toggle - sempre visível */}
            <button
                onClick={onToggle}
                className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md hover:bg-slate-50 transition-colors"
            >
                <div className="size-8 text-[#1E40AF]">
                    <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zM7 12h5v5H7v-5z"></path>
                    </svg>
                </div>
            </button>

            {/* Sidebar */}
            <aside className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo e Título */}
                <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-200 mt-14">
                    <h2 className="text-slate-800 text-base font-semibold leading-tight">
                        Calendário Escolar
                    </h2>
                </div>

                {/* Navegação */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActivePage(item.id)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${activePage === item.id
                                    ? 'text-[#1E40AF] bg-blue-50 hover:bg-blue-100'
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <span className="material-symbols-outlined text-xl">{item.icon}</span>
                            <span className="text-sm font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Footer com usuário e settings */}
                <div className="border-t border-gray-200 px-3 py-4">
                    <button className="flex items-center gap-3 px-3 py-2.5 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors w-full mb-2">
                        <span className="material-symbols-outlined text-xl">settings</span>
                        <span className="text-sm font-medium">Configurações</span>
                    </button>
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 border border-gray-300"
                            style={{
                                backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuADoFMxUBXqh2Ma8CEiytBaZ_-DCKKc7uoFu41DWmuhL0X9-24HufLDpqi2-kBigVcs712Nj0xeZ8jIOsKzbguKyR7lLyuufXpouY5oHzctsUmUqaH6yobwYWPjyfvlP9rz4Rwq15JHKW1u9aTPPePxXMv4boB763zLSSCynrytQJAuHyDay5xEV0RhrNMWBrFsyCBJbLX2or8ExwH74FwBLzLNCN1ijEfVA_XOYERtSFFO4IjiLcq_WO3A2hcB7Aft-jEvyPf3t94')"
                            }}
                        ></div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-800">Utilizador</span>
                            <span className="text-xs text-slate-500">user@exemplo.com</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Overlay quando sidebar está aberta em mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-30 lg:hidden"
                    onClick={onToggle}
                />
            )}
        </>
    );
}

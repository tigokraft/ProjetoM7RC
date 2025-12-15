"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
    id: string
    name: string
    email: string
}

export type ActivePage = "calendario" | "tarefas" | "eventos" | "disciplinas" | "grupos";

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    activePage: ActivePage;
    onPageChange: (page: ActivePage) => void;
}

export default function Sidebar({ isOpen, onToggle, activePage, onPageChange }: SidebarProps) {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await fetch("/api/user/me")
                if (response.ok) {
                    const data = await response.json()
                    setUser(data.user)
                }
            } catch (error) {
                console.error("Failed to fetch user:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchUser()
    }, [])

    async function handleLogout() {
        try {
            await fetch("/api/auth/logout", { method: "POST" })
            router.push("/account/login")
            router.refresh()
        } catch (error) {
            console.error("Logout failed:", error)
        }
    }

    // Get initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    const navItems = [
        { id: "calendario" as ActivePage, icon: "calendar_month", label: "Calendário" },
        { id: "tarefas" as ActivePage, icon: "task", label: "Tarefas" },
        { id: "eventos" as ActivePage, icon: "event", label: "Eventos" },
        { id: "disciplinas" as ActivePage, icon: "school", label: "Disciplinas" },
        { id: "grupos" as ActivePage, icon: "group", label: "Grupos / Turmas" },
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
                <a href="/" className="flex items-center gap-3 px-3 py-2.5 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                    <span className="material-symbols-outlined text-xl">calendar_month</span>
                    <span className="text-sm font-medium">Calendário</span>
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                    <span className="material-symbols-outlined text-xl">task</span>
                    <span className="text-sm font-medium">Tarefas</span>
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                    <span className="material-symbols-outlined text-xl">event</span>
                    <span className="text-sm font-medium">Eventos</span>
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                    <span className="material-symbols-outlined text-xl">notifications</span>
                    <span className="text-sm font-medium">Notificações</span>
                </a>
            </nav>

            {/* Footer com usuário e settings */}
            <div className="border-t border-gray-200 px-3 py-4">
                <a href="/account/settings" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors w-full mb-2">
                    <span className="material-symbols-outlined text-xl">settings</span>
                    <span className="text-sm font-medium">Configurações</span>
                </a>
                
                {isLoading ? (
                    <div className="flex items-center gap-3 px-3 py-2 animate-pulse">
                        <div className="size-9 rounded-full bg-slate-200"></div>
                        <div className="flex flex-col gap-1">
                            <div className="h-3 w-20 bg-slate-200 rounded"></div>
                            <div className="h-2 w-24 bg-slate-200 rounded"></div>
                        </div>
                    </div>
                ) : user ? (
                    <div className="flex items-center gap-3 px-3 py-2 group">
                        <div className="flex items-center justify-center size-9 rounded-full bg-primary text-primary-foreground text-sm font-medium border border-gray-300">
                            {getInitials(user.name)}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-xs font-medium text-slate-800 truncate">{user.name}</span>
                            <span className="text-xs text-slate-500 truncate">{user.email}</span>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded"
                            title="Sair"
                        >
                            <span className="material-symbols-outlined text-lg text-slate-500">logout</span>
                        </button>
                    </div>
                ) : (
                    <a href="/account/login" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                        <span className="material-symbols-outlined text-xl">login</span>
                        <span className="text-sm font-medium">Entrar</span>
                    </a>
                )}
            </div>
        </aside>
        </>
    );
}

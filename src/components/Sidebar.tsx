"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import WorkspaceSwitcher from "@/components/workspace-switcher"

interface User {
  id: string
  name: string
  email: string
}

interface Workspace {
  id: string
  name: string
  type: "CLASS" | "PERSONAL"
}

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null
  )
  const [platformOpen, setPlatformOpen] = useState(true)
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, workspacesRes] = await Promise.all([
          fetch("/api/user/me"),
          fetch("/api/workspaces"),
        ])

        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData.user)
        }

        if (workspacesRes.ok) {
          const workspacesData = await workspacesRes.json()
          setWorkspaces(workspacesData.workspaces)

          // Initialize workspace from localStorage or use first one
          const savedWorkspaceId = localStorage.getItem("activeWorkspaceId")
          if (savedWorkspaceId) {
            const savedWorkspace = workspacesData.workspaces.find(
              (w: Workspace) => w.id === savedWorkspaceId
            )
            setCurrentWorkspace(savedWorkspace || workspacesData.workspaces[0])
          } else if (workspacesData.workspaces.length > 0) {
            setCurrentWorkspace(workspacesData.workspaces[0])
            localStorage.setItem(
              "activeWorkspaceId",
              workspacesData.workspaces[0].id
            )
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleLogout = async () => {
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    localStorage.removeItem("activeWorkspaceId")
    router.push("/account/login")
  }

  const handleWorkspaceChange = (workspace: Workspace) => {
    setCurrentWorkspace(workspace)
    localStorage.setItem("activeWorkspaceId", workspace.id)
    window.location.reload()
  }

  const navItems = [
    { name: "Calendário", icon: "calendar_month", href: "/dashboard" },
    { name: "Tarefas", icon: "task_alt", href: "/dashboard/tasks" },
    { name: "Eventos", icon: "event", href: "/dashboard/events" },
    { name: "Disciplinas", icon: "school", href: "/dashboard/disciplines" },
    { name: "Grupos / Turmas", icon: "groups", href: "/dashboard/groups" },
  ]

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname?.startsWith(href)
  }

  return (
    <>
      <div
        className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 z-40 ${
          isOpen ? "w-64" : "w-[60px]"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-slate-200">
            {isOpen && (
              <h1 className="text-lg font-bold text-[#1E40AF]">Escola</h1>
            )}
          </div>

          {/* Workspace Switcher */}
          {isOpen && currentWorkspace && (
            <div className="p-3 border-b border-slate-200">
              <WorkspaceSwitcher
                workspaces={workspaces}
                currentWorkspace={currentWorkspace}
                onWorkspaceChange={handleWorkspaceChange}
              />
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <Collapsible open={platformOpen} onOpenChange={setPlatformOpen}>
              <CollapsibleTrigger className="flex items-center w-full px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-colors">
                {isOpen ? (
                  <>
                    <span className="flex-1 text-left">Plataforma</span>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        platformOpen ? "rotate-90" : ""
                      }`}
                    />
                  </>
                ) : (
                  <span className="material-symbols-outlined text-xl">
                    dashboard
                  </span>
                )}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="py-1">
                  {navItems.map((item) => {
                    const active = isActive(item.href)
                    return (
                      <TooltipProvider key={item.href} delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              href={item.href}
                              className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all ${
                                active
                                  ? "bg-blue-50 text-[#1E40AF] font-medium"
                                  : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <span className="material-symbols-outlined text-xl">
                                {item.icon}
                              </span>
                              {isOpen && (
                                <span className="text-sm">{item.name}</span>
                              )}
                            </Link>
                          </TooltipTrigger>
                          {!isOpen && (
                            <TooltipContent side="right">
                              <p>{item.name}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    )
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </nav>

          {/* User Menu */}
          {user && (
            <div className="p-3 border-t border-slate-200">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="size-8 rounded-full bg-[#1E40AF] flex items-center justify-center text-white font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    {isOpen && (
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-slate-800">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button (outside sidebar) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-4 z-50 bg-white border border-slate-200 rounded-lg p-2 shadow-md hover:shadow-lg transition-all ${
          isOpen ? "left-[272px]" : "left-[68px]"
        }`}
        title={isOpen ? "Recolher sidebar" : "Expandir sidebar"}
      >
        {isOpen ? (
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-600" />
        )}
      </button>

      {/* Spacer for main content */}
      <div className={`${isOpen ? "ml-64" : "ml-[60px]"} transition-all duration-300`} />
    </>
  )
}

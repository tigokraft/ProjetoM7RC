"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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

export type ActivePage =
  | "calendario"
  | "tarefas"
  | "eventos"
  | "disciplinas"
  | "grupos"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  activePage: ActivePage
  onPageChange: (page: ActivePage) => void
}

export default function Sidebar({
  isOpen,
  onToggle,
  activePage,
  onPageChange,
}: SidebarProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null
  )
  const [platformOpen, setPlatformOpen] = useState(true)

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
          setWorkspaces(workspacesData.workspaces || [])
          if (workspacesData.workspaces?.length > 0) {
            setCurrentWorkspace(workspacesData.workspaces[0])
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

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/account/login")
      router.refresh()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const navItems = [
    {
      id: "calendario" as ActivePage,
      icon: "calendar_month",
      label: "Calendário",
    },
    { id: "tarefas" as ActivePage, icon: "task", label: "Tarefas" },
    { id: "eventos" as ActivePage, icon: "event", label: "Eventos" },
    {
      id: "disciplinas" as ActivePage,
      icon: "school",
      label: "Disciplinas",
    },
    { id: "grupos" as ActivePage, icon: "group", label: "Grupos / Turmas" },
  ]

  const NavItem = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = activePage === item.id
    const content = (
      <button
        onClick={() => onPageChange(item.id)}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? "bg-slate-100 text-slate-900"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        } ${!isOpen ? "justify-center" : ""}`}
      >
        <span className="material-symbols-outlined text-xl">{item.icon}</span>
        {isOpen && <span>{item.label}</span>}
      </button>
    )

    if (!isOpen) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      )
    }

    return content
  }

  return (
    <TooltipProvider delayDuration={0}>
      {/* Toggle Button - Outside the sidebar */}
      <button
        onClick={onToggle}
        className={`fixed top-4 z-50 flex size-8 items-center justify-center rounded-lg border bg-background shadow-sm transition-all hover:bg-accent ${
          isOpen ? "left-[256px]" : "left-[60px]"
        }`}
      >
        {isOpen ? (
          <ChevronLeft className="size-4" />
        ) : (
          <ChevronRight className="size-4" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-background shadow-sm transition-all duration-300 ${
          isOpen ? "w-64" : "w-[60px]"
        }`}
      >
        {/* Workspace Switcher */}
        <div className="border-b p-3">
          <WorkspaceSwitcher
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
            onWorkspaceChange={setCurrentWorkspace}
            isCollapsed={!isOpen}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {/* Platform Section */}
          <div className="space-y-1">
            {!isOpen ? (
              <div className="mb-2 border-b pb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-center">
                      <span className="material-symbols-outlined text-lg text-muted-foreground">
                        apps
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Platform</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <Collapsible open={platformOpen} onOpenChange={setPlatformOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">
                      apps
                    </span>
                    <span>Platform</span>
                  </div>
                  <ChevronRight
                    className={`size-4 transition-transform ${
                      platformOpen ? "rotate-90" : ""
                    }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pl-2 pt-1">
                  {navItems.slice(0, 3).map((item) => (
                    <NavItem key={item.id} item={item} />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Collapsed mode - show icons directly */}
            {!isOpen &&
              navItems.slice(0, 3).map((item) => (
                <NavItem key={item.id} item={item} />
              ))}
          </div>

          {/* Other items */}
          <div className="space-y-1 pt-2">
            {navItems.slice(3).map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t p-3">
          {isLoading ? (
            <div className="flex animate-pulse items-center gap-3">
              <div className="size-9 rounded-full bg-slate-200"></div>
              {isOpen && (
                <div className="flex flex-col gap-1">
                  <div className="h-3 w-20 rounded bg-slate-200"></div>
                  <div className="h-2 w-24 rounded bg-slate-200"></div>
                </div>
              )}
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {isOpen ? (
                  <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-slate-100 focus:outline-none">
                    <div className="flex size-9 items-center justify-center rounded-full border border-gray-300 bg-primary text-sm font-medium text-primary-foreground">
                      {getInitials(user.name)}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col text-left">
                      <span className="truncate text-xs font-medium text-slate-800">
                        {user.name}
                      </span>
                      <span className="truncate text-xs text-slate-500">
                        {user.email}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-lg text-slate-400">
                      expand_more
                    </span>
                  </button>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="flex size-9 items-center justify-center rounded-full border border-gray-300 bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-80">
                        {getInitials(user.name)}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{user.name}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-56">
                <DropdownMenuLabel>A minha conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/account/settings")}
                >
                  <span className="material-symbols-outlined mr-2 text-lg">
                    person
                  </span>
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/account/settings")}
                >
                  <span className="material-symbols-outlined mr-2 text-lg">
                    settings
                  </span>
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    router.push("/account/settings?tab=notifications")
                  }
                >
                  <span className="material-symbols-outlined mr-2 text-lg">
                    notifications
                  </span>
                  Notificações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <span className="material-symbols-outlined mr-2 text-lg">
                    logout
                  </span>
                  Terminar sessão
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <a
              href="/account/login"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-600 transition-colors hover:bg-slate-100"
            >
              <span className="material-symbols-outlined text-xl">login</span>
              {isOpen && <span className="text-sm font-medium">Entrar</span>}
            </a>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}

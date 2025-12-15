"use client"

import { useState } from "react"
import { ChevronsUpDown, Plus, Check } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

interface Workspace {
  id: string
  name: string
  type: "CLASS" | "PERSONAL"
}

interface WorkspaceSwitcherProps {
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  onWorkspaceChange: (workspace: Workspace) => void
  isCollapsed?: boolean
}

export default function WorkspaceSwitcher({
  workspaces,
  currentWorkspace,
  onWorkspaceChange,
  isCollapsed = false,
}: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between ${
            isCollapsed ? "px-2" : "px-3"
          } bg-background hover:bg-accent`}
        >
          {isCollapsed ? (
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="text-sm font-semibold">
                {currentWorkspace?.name.charAt(0) || "W"}
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <span className="text-sm font-semibold">
                    {currentWorkspace?.name.charAt(0) || "W"}
                  </span>
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-semibold">
                    {currentWorkspace?.name || "Select workspace"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {currentWorkspace?.type === "CLASS"
                      ? "Turma"
                      : currentWorkspace?.type === "PERSONAL"
                      ? "Pessoal"
                      : ""}
                  </span>
                </div>
              </div>
              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-2" align="start">
        <div className="space-y-1">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Workspaces
          </div>
          {workspaces.map((workspace) => (
            <Button
              key={workspace.id}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                onWorkspaceChange(workspace)
                setOpen(false)
              }}
            >
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <span className="text-xs font-semibold">
                    {workspace.name.charAt(0)}
                  </span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm">{workspace.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {workspace.type === "CLASS" ? "Turma" : "Pessoal"}
                  </span>
                </div>
              </div>
              {currentWorkspace?.id === workspace.id && (
                <Check className="ml-auto size-4" />
              )}
            </Button>
          ))}
          <div className="border-t pt-1">
            <Button variant="ghost" className="w-full justify-start">
              <Plus className="mr-2 size-4" />
              <span className="text-sm">Criar workspace</span>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

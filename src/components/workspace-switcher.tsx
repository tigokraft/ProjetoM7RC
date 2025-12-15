"use client"

import { useState } from "react"
import { ChevronsUpDown, Plus, Check, UserPlus } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import InviteMembersDialog from "@/components/invite-members-dialog"

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
  const [dialogOpen, setDialogOpen] = useState(false)
  const [workspaceName, setWorkspaceName] = useState("")
  const [workspaceType, setWorkspaceType] = useState<"CLASS" | "PERSONAL">("CLASS")
  const [isCreating, setIsCreating] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) return

    setIsCreating(true)
    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: workspaceName,
          type: workspaceType,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Close dialogs
        setDialogOpen(false)
        setOpen(false)
        // Reset form
        setWorkspaceName("")
        setWorkspaceType("CLASS")
        // Reload the page to fetch updated workspaces
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to create workspace:", error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
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
            <div className="border-t pt-1 space-y-1">
              {currentWorkspace && (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setInviteDialogOpen(true)
                    setOpen(false)
                  }}
                >
                  <UserPlus className="mr-2 size-4" />
                  <span className="text-sm">Convidar membros</span>
                </Button>
              )}
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setDialogOpen(true)
                  setOpen(false)
                }}
              >
                <Plus className="mr-2 size-4" />
                <span className="text-sm">Criar workspace</span>
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
        <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Criar Workspace</DialogTitle>
            <DialogDescription>
              Crie um novo workspace para organizar as tuas disciplinas e tarefas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do workspace</Label>
              <Input
                id="name"
                placeholder="Exemplo: 1º Semestre"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateWorkspace()
                  }
                }}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <select
                id="type"
                value={workspaceType}
                onChange={(e) => setWorkspaceType(e.target.value as "CLASS" | "PERSONAL")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="CLASS">Turma</option>
                <option value="PERSONAL">Pessoal</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateWorkspace} disabled={isCreating || !workspaceName.trim()}>
              {isCreating ? "A criar..." : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {currentWorkspace && (
        <InviteMembersDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          workspaceId={currentWorkspace.id}
        />
      )}
    </>
  )
}

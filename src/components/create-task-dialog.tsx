"use client"

import { useState, useEffect } from "react"
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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { pt } from "date-fns/locale"
import type { Task, TaskType, Discipline } from "@/types/api-types"

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    title: string
    description?: string
    type: TaskType
    dueDate: string
    disciplineId?: string
  }) => Promise<void>
  task?: Task | null
  mode?: "create" | "edit"
  disciplines?: Discipline[]
}

// Helper function to format time to HH:mm
const formatTimeToHHMM = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

// Helper function to combine date and time to ISO datetime
const combineDateTime = (date: Date, timeStr: string) => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const combined = new Date(date)
  combined.setHours(hours, minutes, 0, 0)
  return combined.toISOString()
}

// Task type labels in Portuguese
const taskTypeLabels: Record<TaskType, string> = {
  TESTE: "Teste",
  PROJETO: "Projeto",
  TRABALHO: "Trabalho",
  TAREFA: "Tarefa",
}

export default function CreateTaskDialog({
  open,
  onOpenChange,
  onSubmit,
  task,
  mode = "create",
  disciplines = [],
}: CreateTaskDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<TaskType>("TAREFA")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [dueTime, setDueTime] = useState("23:59")
  const [disciplineId, setDisciplineId] = useState<string>("none")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync form fields with task prop
  useEffect(() => {
    if (task) {
      setTitle(task.title || "")
      setDescription(task.description || "")
      setType(task.type)
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined)
      setDueTime(task.dueDate ? formatTimeToHHMM(new Date(task.dueDate)) : "23:59")
      setDisciplineId(task.disciplineId || "none")
    } else {
      // Reset to defaults when task is null (create mode)
      setTitle("")
      setDescription("")
      setType("TAREFA")
      setDueDate(undefined)
      setDueTime("23:59")
      setDisciplineId("none")
    }
  }, [task])

  const handleSubmit = async () => {
    if (!title.trim() || !dueDate) return

    setIsSubmitting(true)
    try {
      // Convert Date + time to ISO datetime
      const dueDateISO = combineDateTime(dueDate, dueTime)

      await onSubmit({
        title,
        description: description || undefined,
        type,
        dueDate: dueDateISO,
        disciplineId: disciplineId === "none" ? undefined : disciplineId,
      })

      // Reset form in create mode
      if (mode === "create") {
        setTitle("")
        setDescription("")
        setType("TAREFA")
        setDueDate(undefined)
        setDueTime("23:59")
        setDisciplineId("none")
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to submit task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Criar Tarefa" : "Editar Tarefa"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Cria uma nova tarefa no workspace."
              : "Edita os detalhes da tarefa."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Exemplo: Resolver exercícios de Cálculo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              placeholder="Descrição da tarefa (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={type} onValueChange={(value) => setType(value as TaskType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(taskTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Disciplina</Label>
              <Select value={disciplineId} onValueChange={setDisciplineId}>
                <SelectTrigger>
                  <SelectValue placeholder="Nenhuma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {disciplines.map((discipline) => (
                    <SelectItem key={discipline.id} value={discipline.id}>
                      {discipline.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Entrega *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "dd/MM/yyyy", { locale: pt }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    locale={pt}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueTime">Hora *</Label>
              <Input
                id="dueTime"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !dueDate}
          >
            {isSubmitting
              ? mode === "create"
                ? "A criar..."
                : "A guardar..."
              : mode === "create"
              ? "Criar"
              : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

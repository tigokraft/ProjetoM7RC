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
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { pt } from "date-fns/locale"
import type { Event } from "@/types/api-types"

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    title: string
    description?: string
    startDate: string
    endDate?: string
    location?: string
  }) => Promise<void>
  event?: Event | null
  mode?: "create" | "edit"
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

export default function CreateEventDialog({
  open,
  onOpenChange,
  onSubmit,
  event,
  mode = "create",
}: CreateEventDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  
  // Date fields (as Date objects for Calendar component)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  
  // Time fields (as HH:mm strings)
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")
  
  const [location, setLocation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync form fields with event prop
  useEffect(() => {
    if (event) {
      setTitle(event.title || "")
      setDescription(event.description || "")
      setStartDate(event.startDate ? new Date(event.startDate) : undefined)
      setEndDate(event.endDate ? new Date(event.endDate) : undefined)
      setStartTime(event.startDate ? formatTimeToHHMM(new Date(event.startDate)) : "09:00")
      setEndTime(event.endDate ? formatTimeToHHMM(new Date(event.endDate)) : "10:00")
      setLocation(event.location || "")
    } else {
      // Reset to defaults when event is null (create mode)
      setTitle("")
      setDescription("")
      setStartDate(undefined)
      setEndDate(undefined)
      setStartTime("09:00")
      setEndTime("10:00")
      setLocation("")
    }
  }, [event])

  const handleSubmit = async () => {
    if (!title.trim() || !startDate || !startTime) return

    setIsSubmitting(true)
    try {
      // Convert Date + time to ISO datetime
      const startDateISO = combineDateTime(startDate, startTime)
      const endDateISO = endDate && endTime ? combineDateTime(endDate, endTime) : undefined

      await onSubmit({
        title,
        description: description || undefined,
        startDate: startDateISO,
        endDate: endDateISO,
        location: location || undefined,
      })
      // Reset form
      if (mode === "create") {
        setTitle("")
        setDescription("")
        setStartDate(undefined)
        setEndDate(undefined)
        setStartTime("09:00")
        setEndTime("10:00")
        setLocation("")
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to submit event:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Criar Evento" : "Editar Evento"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Cria um novo evento no calendário."
              : "Edita os detalhes do evento."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Exemplo: Prova de Cálculo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              placeholder="Descrição do evento (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          
          {/* Start Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Início *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy", { locale: pt }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    locale={pt}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Hora *</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>
          
          {/* End Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy", { locale: pt }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    locale={pt}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Hora</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              placeholder="Exemplo: Sala 301"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
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
            disabled={isSubmitting || !title.trim() || !startDate || !startTime}
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

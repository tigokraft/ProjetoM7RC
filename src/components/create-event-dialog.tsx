"use client"

import { useState } from "react"
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

// Helper function to format Date to dd-mm-yyyy
const formatDateToDDMMYYYY = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

// Helper function to format Date to HH:mm
const formatTimeToHHMM = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

// Helper function to parse dd-mm-yyyy and HH:mm to ISO datetime
const parseToISO = (dateStr: string, timeStr: string) => {
  const [day, month, year] = dateStr.split('-').map(Number)
  const [hours, minutes] = timeStr.split(':').map(Number)
  const date = new Date(year, month - 1, day, hours, minutes)
  return date.toISOString()
}

export default function CreateEventDialog({
  open,
  onOpenChange,
  onSubmit,
  event,
  mode = "create",
}: CreateEventDialogProps) {
  const [title, setTitle] = useState(event?.title || "")
  const [description, setDescription] = useState(event?.description || "")
  
  // Separate date and time fields
  const [startDateStr, setStartDateStr] = useState(
    event?.startDate ? formatDateToDDMMYYYY(new Date(event.startDate)) : ""
  )
  const [startTimeStr, setStartTimeStr] = useState(
    event?.startDate ? formatTimeToHHMM(new Date(event.startDate)) : ""
  )
  const [endDateStr, setEndDateStr] = useState(
    event?.endDate ? formatDateToDDMMYYYY(new Date(event.endDate)) : ""
  )
  const [endTimeStr, setEndTimeStr] = useState(
    event?.endDate ? formatTimeToHHMM(new Date(event.endDate)) : ""
  )
  
  const [location, setLocation] = useState(event?.location || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !startDateStr || !startTimeStr) return

    setIsSubmitting(true)
    try {
      // Convert dd-mm-yyyy HH:mm format to ISO datetime
      const startDateISO = parseToISO(startDateStr, startTimeStr)
      const endDateISO = endDateStr && endTimeStr ? parseToISO(endDateStr, endTimeStr) : undefined

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
        setStartDateStr("")
        setStartTimeStr("")
        setEndDateStr("")
        setEndTimeStr("")
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
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início *</Label>
              <Input
                id="startDate"
                placeholder="dd-mm-yyyy"
                value={startDateStr}
                onChange={(e) => setStartDateStr(e.target.value)}
                pattern="\d{2}-\d{2}-\d{4}"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Hora *</Label>
              <Input
                id="startTime"
                placeholder="HH:mm"
                value={startTimeStr}
                onChange={(e) => setStartTimeStr(e.target.value)}
                pattern="\d{2}:\d{2}"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Fim</Label>
              <Input
                id="endDate"
                placeholder="dd-mm-yyyy"
                value={endDateStr}
                onChange={(e) => setEndDateStr(e.target.value)}
                pattern="\d{2}-\d{2}-\d{4}"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Hora</Label>
              <Input
                id="endTime"
                placeholder="HH:mm"
                value={endTimeStr}
                onChange={(e) => setEndTimeStr(e.target.value)}
                pattern="\d{2}:\d{2}"
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
            disabled={isSubmitting || !title.trim() || !startDateStr || !startTimeStr}
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

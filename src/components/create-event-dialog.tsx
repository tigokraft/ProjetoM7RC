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

export default function CreateEventDialog({
  open,
  onOpenChange,
  onSubmit,
  event,
  mode = "create",
}: CreateEventDialogProps) {
  const [title, setTitle] = useState(event?.title || "")
  const [description, setDescription] = useState(event?.description || "")
  const [startDate, setStartDate] = useState(
    event?.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : ""
  )
  const [endDate, setEndDate] = useState(
    event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : ""
  )
  const [location, setLocation] = useState(event?.location || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !startDate) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        title,
        description: description || undefined,
        startDate,
        endDate: endDate || undefined,
        location: location || undefined,
      })
      // Reset form
      if (mode === "create") {
        setTitle("")
        setDescription("")
        setStartDate("")
        setEndDate("")
        setLocation("")
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to submit event:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update form when event changes
  if (event && mode === "edit") {
    if (title !== event.title) setTitle(event.title)
    if (description !== (event.description || "")) setDescription(event.description || "")
    if (startDate !== new Date(event.startDate).toISOString().slice(0, 16)) {
      setStartDate(new Date(event.startDate).toISOString().slice(0, 16))
    }
    if (event.endDate && endDate !== new Date(event.endDate).toISOString().slice(0, 16)) {
      setEndDate(new Date(event.endDate).toISOString().slice(0, 16))
    }
    if (location !== (event.location || "")) setLocation(event.location || "")
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
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Fim</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
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
            disabled={isSubmitting || !title.trim() || !startDate}
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

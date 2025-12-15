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
import type { Discipline } from "@/types/api-types"

interface CreateDisciplineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    name: string
    description?: string
    color?: string
  }) => Promise<void>
  discipline?: Discipline | null
  mode?: "create" | "edit"
}

// Predefined color palette
const colorPalette = [
  "#1E40AF", // Blue
  "#7C3AED", // Purple
  "#059669", // Green
  "#DC2626", // Red
  "#EA580C", // Orange
  "#CA8A04", // Yellow
  "#0891B2", // Cyan
  "#BE185D", // Pink
  "#4B5563", // Gray
  "#0F172A", // Slate
]

export default function CreateDisciplineDialog({
  open,
  onOpenChange,
  onSubmit,
  discipline,
  mode = "create",
}: CreateDisciplineDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedColor, setSelectedColor] = useState(colorPalette[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync form fields with discipline prop
  useEffect(() => {
    if (discipline) {
      setName(discipline.name || "")
      setDescription(discipline.description || "")
      setSelectedColor(discipline.color || colorPalette[0])
    } else {
      // Reset to defaults when discipline is null (create mode)
      setName("")
      setDescription("")
      setSelectedColor(colorPalette[0])
    }
  }, [discipline])

  const handleSubmit = async () => {
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        name,
        description: description || undefined,
        color: selectedColor,
      })

      // Reset form in create mode
      if (mode === "create") {
        setName("")
        setDescription("")
        setSelectedColor(colorPalette[0])
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to submit discipline:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Criar Disciplina" : "Editar Disciplina"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Cria uma nova disciplina no workspace."
              : "Edita os detalhes da disciplina."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              placeholder="Exemplo: Cálculo Avançado"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              placeholder="Descrição da disciplina (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="grid grid-cols-5 gap-3">
              {colorPalette.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`size-12 rounded-lg transition-all hover:scale-110 ${
                    selectedColor === color
                      ? "ring-2 ring-offset-2 ring-slate-400 scale-110"
                      : ""
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Cor selecionada: {selectedColor}
            </p>
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
            disabled={isSubmitting || !name.trim()}
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

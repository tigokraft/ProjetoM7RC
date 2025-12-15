"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Vote } from "lucide-react";

interface CreateVoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    options: string[];
    expiresAt?: string;
  }) => Promise<void>;
}

export default function CreateVoteDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateVoteDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [expiresAt, setExpiresAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async () => {
    const validOptions = options.filter((o) => o.trim());
    if (!title.trim() || validOptions.length < 2) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        description: description || undefined,
        options: validOptions,
        expiresAt: expiresAt || undefined,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setOptions(["", ""]);
      setExpiresAt("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create vote:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validOptionsCount = options.filter((o) => o.trim()).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Vote className="size-5" />
            Criar Votação
          </DialogTitle>
          <DialogDescription>
            Cria uma nova votação para os membros do workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Pergunta *</Label>
            <Input
              id="title"
              placeholder="Ex: Qual o melhor dia para a reunião?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <textarea
              id="description"
              placeholder="Adiciona mais contexto à votação..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="space-y-2">
            <Label>Opções * (mínimo 2)</Label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`Opção ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(index)}
                    >
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 10 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                className="mt-2"
              >
                <Plus className="size-4 mr-1" />
                Adicionar Opção
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresAt">Data de Expiração (opcional)</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
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
            disabled={isSubmitting || !title.trim() || validOptionsCount < 2}
          >
            {isSubmitting ? "A criar..." : "Criar Votação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

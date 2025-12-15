"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { GalleryVerticalEnd, Loader2, CheckCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

interface ResetPasswordFormProps extends React.ComponentProps<"div"> {
  resetId: string
}

export function ResetPasswordForm({
  resetId,
  className,
  ...props
}: ResetPasswordFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("As passwords não coincidem")
      setIsLoading(false)
      return
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError("A password deve ter pelo menos 8 caracteres")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/auth/forgotPassword/${resetId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erro ao redefinir password")
        return
      }

      setSuccess(true)
    } catch (err) {
      setError("Ocorreu um erro. Por favor tenta novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="size-6 text-green-600" />
          </div>
          <h1 className="text-xl font-bold">Password alterada!</h1>
          <FieldDescription>
            A tua password foi alterada com sucesso. Já podes fazer login.
          </FieldDescription>
          <Button asChild className="mt-4">
            <a href="/account/login">Ir para login</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">ProjetoM7</span>
            </a>
            <h1 className="text-xl font-bold">Nova password</h1>
            <FieldDescription>
              Introduz a tua nova password.
            </FieldDescription>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="password">Nova Password</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={isLoading}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="confirmPassword">Confirmar Password</FieldLabel>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              disabled={isLoading}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </Field>

          <Field>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  A alterar...
                </>
              ) : (
                "Alterar password"
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}

"use client"

import { useState } from "react"
import { GalleryVerticalEnd, Loader2, ArrowLeft, CheckCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [resetId, setResetId] = useState<string | null>(null)
  const [email, setEmail] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/forgotPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erro ao enviar pedido")
        return
      }

      setSuccess(true)
      setResetId(data.resetId)
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
          <h1 className="text-xl font-bold">Email enviado!</h1>
          <FieldDescription>
            Se o email existir na nossa base de dados, receberás um link para redefinir a password.
          </FieldDescription>
          {resetId && (
            <div className="mt-4 rounded-md bg-muted p-4 text-sm">
              <p className="font-medium">Link de reset (apenas para testes):</p>
              <a 
                href={`/account/reset-password/${resetId}`}
                className="text-primary underline break-all"
              >
                /account/reset-password/{resetId}
              </a>
            </div>
          )}
          <Button asChild variant="outline" className="mt-4">
            <a href="/account/login">
              <ArrowLeft className="mr-2 size-4" />
              Voltar ao login
            </a>
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
            <h1 className="text-xl font-bold">Esqueceste a password?</h1>
            <FieldDescription>
              Introduz o teu email e enviaremos um link para redefinir a password.
            </FieldDescription>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              required
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  A enviar...
                </>
              ) : (
                "Enviar link de reset"
              )}
            </Button>
          </Field>

          <Field>
            <Button asChild variant="ghost" className="w-full">
              <a href="/account/login">
                <ArrowLeft className="mr-2 size-4" />
                Voltar ao login
              </a>
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}

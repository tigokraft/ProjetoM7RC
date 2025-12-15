"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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

interface User {
  id: string
  name: string
  email: string
}

type Tab = "profile" | "password" | "notifications"

export function AccountSettingsForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<Tab>("profile")
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  })

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    reminderDaysBefore: 1,
    reminderOnDay: true,
  })

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "notifications") setActiveTab("notifications")
    else if (tab === "password") setActiveTab("password")
  }, [searchParams])

  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, prefsRes] = await Promise.all([
          fetch("/api/user/me"),
          fetch("/api/user/settings"),
        ])

        if (userRes.ok) {
          const userData = await userRes.json()
          if (userData.user) {
            setUser(userData.user)
            setProfileForm({
              name: userData.user.name,
              email: userData.user.email,
            })
          } else {
            router.push("/account/login")
          }
        }

        if (prefsRes.ok) {
          const prefsData = await prefsRes.json()
          if (prefsData.preferences) {
            setNotificationPrefs(prefsData.preferences)
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [router])

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erro ao atualizar perfil")
        return
      }

      setSuccess("Perfil atualizado com sucesso!")
      setUser(data.user)
    } catch (err) {
      setError("Ocorreu um erro. Por favor tenta novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("As passwords não coincidem")
      setIsSaving(false)
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setError("A nova password deve ter pelo menos 8 caracteres")
      setIsSaving(false)
      return
    }

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erro ao alterar password")
        return
      }

      setSuccess("Password alterada com sucesso!")
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err) {
      setError("Ocorreu um erro. Por favor tenta novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleNotificationsSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notificationPrefs),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erro ao atualizar preferências")
        return
      }

      setSuccess("Preferências atualizadas com sucesso!")
    } catch (err) {
      setError("Ocorreu um erro. Por favor tenta novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const tabs = [
    { id: "profile" as Tab, label: "Perfil", icon: "person" },
    { id: "password" as Tab, label: "Password", icon: "lock" },
    { id: "notifications" as Tab, label: "Notificações", icon: "notifications" },
  ]

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Definições da conta</h1>
          <p className="text-sm text-muted-foreground">Gere o teu perfil e preferências</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              setError(null)
              setSuccess(null)
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-100 p-3 text-sm text-green-700 flex items-center gap-2">
          <CheckCircle className="size-4" />
          {success}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <form onSubmit={handleProfileSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nome</FieldLabel>
              <Input
                id="name"
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                disabled={isSaving}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                disabled={isSaving}
              />
            </Field>
            <Field>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Guardar alterações
              </Button>
            </Field>
          </FieldGroup>
        </form>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <form onSubmit={handlePasswordSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="currentPassword">Password atual</FieldLabel>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                disabled={isSaving}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="newPassword">Nova password</FieldLabel>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                disabled={isSaving}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirmar nova password</FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                disabled={isSaving}
              />
            </Field>
            <Field>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Alterar password
              </Button>
            </Field>
          </FieldGroup>
        </form>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <form onSubmit={handleNotificationsSubmit}>
          <FieldGroup>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl">email</span>
                  <div>
                    <p className="text-sm font-medium">Notificações por email</p>
                    <p className="text-xs text-muted-foreground">Receber lembretes por email</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.emailEnabled}
                  onChange={(e) => setNotificationPrefs({ ...notificationPrefs, emailEnabled: e.target.checked })}
                  className="size-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl">sms</span>
                  <div>
                    <p className="text-sm font-medium">Notificações SMS</p>
                    <p className="text-xs text-muted-foreground">Receber lembretes por SMS</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.smsEnabled}
                  onChange={(e) => setNotificationPrefs({ ...notificationPrefs, smsEnabled: e.target.checked })}
                  className="size-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl">notifications_active</span>
                  <div>
                    <p className="text-sm font-medium">Notificações push</p>
                    <p className="text-xs text-muted-foreground">Receber notificações no browser</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.pushEnabled}
                  onChange={(e) => setNotificationPrefs({ ...notificationPrefs, pushEnabled: e.target.checked })}
                  className="size-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl">today</span>
                  <div>
                    <p className="text-sm font-medium">Lembrete no dia</p>
                    <p className="text-xs text-muted-foreground">Receber lembrete no dia do evento</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.reminderOnDay}
                  onChange={(e) => setNotificationPrefs({ ...notificationPrefs, reminderOnDay: e.target.checked })}
                  className="size-4"
                />
              </label>

              <div className="p-3 rounded-lg border">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-xl">schedule</span>
                  <div>
                    <p className="text-sm font-medium">Dias de antecedência</p>
                    <p className="text-xs text-muted-foreground">Quantos dias antes receber o lembrete</p>
                  </div>
                </div>
                <select
                  value={notificationPrefs.reminderDaysBefore}
                  onChange={(e) => setNotificationPrefs({ ...notificationPrefs, reminderDaysBefore: parseInt(e.target.value) })}
                  className="w-full p-2 rounded-md border text-sm"
                >
                  <option value={0}>No dia</option>
                  <option value={1}>1 dia antes</option>
                  <option value={2}>2 dias antes</option>
                  <option value={3}>3 dias antes</option>
                  <option value={7}>1 semana antes</option>
                </select>
              </div>
            </div>

            <Field>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Guardar preferências
              </Button>
            </Field>
          </FieldGroup>
        </form>
      )}
    </div>
  )
}

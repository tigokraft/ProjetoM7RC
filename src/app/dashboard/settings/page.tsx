"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Lock, User, Check } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [assignmentNotifications, setAssignmentNotifications] = useState(true);
  const [notificationsSaving, setNotificationsSaving] = useState(false);
  const [notificationsSuccess, setNotificationsSuccess] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/user/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setName(data.user.name);
          setEmail(data.user.email);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(false);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (res.ok) {
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleNotificationsUpdate = async () => {
    setNotificationsSaving(true);
    setNotificationsSuccess(false);

    try {
      const res = await fetch("/api/user/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailNotifications,
          eventReminders,
          assignmentNotifications,
        }),
      });

      if (res.ok) {
        setNotificationsSuccess(true);
        setTimeout(() => setNotificationsSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to update notifications:", error);
    } finally {
      setNotificationsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordSuccess(false);
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("As passwords não coincidem");
      setPasswordSaving(false);
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("A password deve ter pelo menos 8 caracteres");
      setPasswordSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (res.ok) {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(false), 3000);
      } else {
        const data = await res.json();
        setPasswordError(data.error || "Erro ao alterar password");
      }
    } catch (error) {
      setPasswordError("Erro ao alterar password");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-600">A carregar...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Definições</h1>
        <p className="text-slate-600 mt-2">
          Gere as suas preferências e informações de conta
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Perfil</h2>
            <p className="text-sm text-slate-600">
              Atualize as suas informações pessoais
            </p>
          </div>
        </div>
        <Separator className="mb-6" />
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="O seu nome"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={profileSaving}>
              {profileSaving ? "A guardar..." : "Guardar alterações"}
            </Button>
            {profileSuccess && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <Check className="w-4 h-4" />
                Perfil atualizado!
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Bell className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              Notificações
            </h2>
            <p className="text-sm text-slate-600">
              Configure as suas preferências de notificação
            </p>
          </div>
        </div>
        <Separator className="mb-6" />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">Notificações por email</p>
              <p className="text-sm text-slate-600">
                Receba atualizações por email
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">Lembretes de eventos</p>
              <p className="text-sm text-slate-600">
                Receba lembretes antes dos eventos
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={eventReminders}
                onChange={(e) => setEventReminders(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">
                Notificações de tarefas
              </p>
              <p className="text-sm text-slate-600">
                Receba alertas sobre novas tarefas
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={assignmentNotifications}
                onChange={(e) => setAssignmentNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center gap-3 pt-4">
            <Button onClick={handleNotificationsUpdate} disabled={notificationsSaving}>
              {notificationsSaving ? "A guardar..." : "Guardar preferências"}
            </Button>
            {notificationsSuccess && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <Check className="w-4 h-4" />
                Preferências guardadas!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-50 rounded-lg">
            <Lock className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              Password & Segurança
            </h2>
            <p className="text-sm text-slate-600">Altere a sua password</p>
          </div>
        </div>
        <Separator className="mb-6" />
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Password atual</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {passwordError && (
            <div className="text-red-600 text-sm">{passwordError}</div>
          )}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={passwordSaving}>
              {passwordSaving ? "A alterar..." : "Alterar password"}
            </Button>
            {passwordSuccess && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <Check className="w-4 h-4" />
                Password alterada!
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Copy, Link, Mail, Users, Trash2, RefreshCw, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InviteLink {
  id: string;
  code: string;
  maxUses: number;
  uses: number;
  expiresAt: string | null;
  isExpired: boolean;
  isExhausted: boolean;
}

interface WorkspaceInvite {
  id: string;
  email: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: string;
}

interface InviteMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  onInviteSent?: () => void;
}

export default function InviteMembersDialog({
  open,
  onOpenChange,
  workspaceId,
  onInviteSent,
}: InviteMembersDialogProps) {
  const [activeTab, setActiveTab] = useState<"link" | "email">("link");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([]);
  const [invites, setInvites] = useState<WorkspaceInvite[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch data when dialog opens
  const fetchData = async () => {
    try {
      const [linksRes, invitesRes] = await Promise.all([
        fetch(`/api/workspaces/${workspaceId}/invites/links`),
        fetch(`/api/workspaces/${workspaceId}/invites`),
      ]);
      
      if (linksRes.ok) {
        const data = await linksRes.json();
        setInviteLinks(data.links || []);
      }
      if (invitesRes.ok) {
        const data = await invitesRes.json();
        setInvites(data.invites || []);
      }
    } catch (err) {
      console.error("Failed to fetch invites:", err);
    }
  };

  // Create new invite link
  const createInviteLink = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/invites/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxUses: 10 }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create link");
      }
      
      await fetchData();
      setSuccess("Link criado com sucesso!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar link");
    } finally {
      setLoading(false);
    }
  };

  // Delete invite link
  const deleteInviteLink = async (linkId: string) => {
    try {
      await fetch(`/api/workspaces/${workspaceId}/invites/links?linkId=${linkId}`, {
        method: "DELETE",
      });
      await fetchData();
    } catch (err) {
      console.error("Failed to delete link:", err);
    }
  };

  // Copy link to clipboard
  const copyLink = async (code: string, id: string) => {
    const url = `${window.location.origin}/invite/${code}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Send email invite
  const sendEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to send invite");
      }
      
      setEmail("");
      await fetchData();
      setSuccess(data.message);
      setTimeout(() => setSuccess(null), 3000);
      onInviteSent?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar convite");
    } finally {
      setLoading(false);
    }
  };

  // Cancel email invite
  const cancelInvite = async (inviteId: string) => {
    try {
      await fetch(`/api/workspaces/${workspaceId}/invites?inviteId=${inviteId}`, {
        method: "DELETE",
      });
      await fetchData();
    } catch (err) {
      console.error("Failed to cancel invite:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (isOpen) fetchData();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Convidar Membros
          </DialogTitle>
          <DialogDescription>
            Convida pessoas para o teu workspace usando um link ou por email.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("link")}
            className={`flex-1 py-2 px-4 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === "link"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Link className="w-4 h-4" />
            Link de Convite
          </button>
          <button
            onClick={() => setActiveTab("email")}
            className={`flex-1 py-2 px-4 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === "email"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Mail className="w-4 h-4" />
            Convite por Email
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        {/* Link Tab */}
        {activeTab === "link" && (
          <div className="space-y-4">
            <button
              onClick={createInviteLink}
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Link className="w-4 h-4" />
              )}
              Criar Novo Link
            </button>

            {inviteLinks.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Links Ativos</Label>
                {inviteLinks.map((link) => (
                  <div
                    key={link.id}
                    className={`flex items-center gap-2 p-3 bg-gray-50 rounded-lg ${
                      link.isExpired || link.isExhausted ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono truncate text-gray-600">
                        /invite/{link.code}
                      </p>
                      <p className="text-xs text-gray-500">
                        {link.uses}/{link.maxUses} utilizações
                        {link.isExpired && " • Expirado"}
                        {link.isExhausted && " • Esgotado"}
                      </p>
                    </div>
                    <button
                      onClick={() => copyLink(link.code, link.id)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Copiar link"
                    >
                      {copiedId === link.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteInviteLink(link.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Email Tab */}
        {activeTab === "email" && (
          <div className="space-y-4">
            <form onSubmit={sendEmailInvite} className="flex gap-2">
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                Enviar
              </button>
            </form>

            {invites.filter((inv) => inv.status === "PENDING").length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Convites Pendentes</Label>
                {invites
                  .filter((inv) => inv.status === "PENDING")
                  .map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-gray-700">
                          {invite.email}
                        </p>
                        <p className="text-xs text-gray-500">Pendente</p>
                      </div>
                      <button
                        onClick={() => cancelInvite(invite.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancelar convite"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

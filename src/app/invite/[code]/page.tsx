"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Users, Loader2, CheckCircle, XCircle, LogIn } from "lucide-react";
import Link from "next/link";

interface WorkspaceInfo {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
}

interface InviteData {
  workspace: WorkspaceInfo;
  usesRemaining: number;
  expiresAt: string | null;
}

export default function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuthAndFetchInvite() {
      try {
        // Check if user is logged in
        const userRes = await fetch("/api/user/me");
        setIsLoggedIn(userRes.ok);

        // Fetch invite details
        const inviteRes = await fetch(`/api/invites/${code}`);
        
        if (!inviteRes.ok) {
          const data = await inviteRes.json();
          setError(data.error || "Convite inválido");
          return;
        }
        
        const data = await inviteRes.json();
        setInviteData(data);
      } catch (err) {
        setError("Erro ao carregar convite");
      } finally {
        setLoading(false);
      }
    }
    
    checkAuthAndFetchInvite();
  }, [code]);

  const handleJoin = async () => {
    if (!isLoggedIn) {
      // Redirect to login with return URL
      router.push(`/account/login?redirect=/invite/${code}`);
      return;
    }

    setJoining(true);
    setError(null);

    try {
      const res = await fetch(`/api/invites/${code}`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao entrar no workspace");
        return;
      }

      setSuccess(data.message);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      setError("Erro ao processar convite");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">A carregar convite...</p>
        </div>
      </div>
    );
  }

  if (error && !inviteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Convite Inválido</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/account/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir para Login
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo!</h1>
          <p className="text-gray-600 mb-6">{success}</p>
          <p className="text-sm text-gray-400">A redirecionar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Workspace Info */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Convite para Workspace
          </h1>
          <p className="text-gray-600">
            Foste convidado a entrar no workspace:
          </p>
        </div>

        {inviteData && (
          <>
            {/* Workspace Card */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {inviteData.workspace.name}
              </h2>
              {inviteData.workspace.description && (
                <p className="text-gray-600 text-sm mb-4">
                  {inviteData.workspace.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {inviteData.workspace.memberCount} membros
                </span>
                <span>•</span>
                <span>{inviteData.usesRemaining} convites restantes</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Action Button */}
            {isLoggedIn ? (
              <button
                onClick={handleJoin}
                disabled={joining}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {joining ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Users className="w-5 h-5" />
                )}
                {joining ? "A entrar..." : "Entrar no Workspace"}
              </button>
            ) : (
              <div className="space-y-3">
                <Link
                  href={`/account/login?redirect=/invite/${code}`}
                  className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  Iniciar Sessão para Entrar
                </Link>
                <p className="text-center text-sm text-gray-500">
                  Não tens conta?{" "}
                  <Link
                    href={`/account/register?redirect=/invite/${code}`}
                    className="text-blue-600 hover:underline"
                  >
                    Criar conta
                  </Link>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

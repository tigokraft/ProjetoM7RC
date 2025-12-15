"use client";

import { useState, useEffect, useCallback } from "react";
import { Vote, Check, Clock, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { votesAPI } from "@/lib/api";
import CreateVoteDialog from "./create-vote-dialog";

interface VoteOption {
  id: string;
  text: string;
  _count?: { responses: number };
}

interface VoteData {
  id: string;
  title: string;
  description?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  createdBy: { id: string; name: string };
  options: VoteOption[];
  userVote?: string;
}

interface VotingSectionProps {
  workspaceId: string;
  isAdmin: boolean;
}

export default function VotingSection({ workspaceId, isAdmin }: VotingSectionProps) {
  const [votes, setVotes] = useState<VoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [votingFor, setVotingFor] = useState<string | null>(null);

  const fetchVotes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await votesAPI.list(workspaceId);
      setVotes(data.votes);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.message.includes("not enabled")) {
        setError("Votações não estão ativadas neste workspace.");
      } else {
        setError(err instanceof Error ? err.message : "Erro ao carregar votações");
      }
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchVotes();
  }, [fetchVotes]);

  const handleCreateVote = async (data: {
    title: string;
    description?: string;
    options: string[];
    expiresAt?: string;
  }) => {
    await votesAPI.create(workspaceId, data);
    await fetchVotes();
  };

  const handleVote = async (voteId: string, optionId: string) => {
    try {
      setVotingFor(optionId);
      await votesAPI.respond(workspaceId, voteId, optionId);
      await fetchVotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao votar");
    } finally {
      setVotingFor(null);
    }
  };

  const isExpired = (expiresAt?: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getTotalVotes = (options: VoteOption[]) => {
    return options.reduce((sum, o) => sum + (o._count?.responses || 0), 0);
  };

  if (loading && votes.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full size-8 border-b-2 border-[#1E40AF]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-700 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Vote className="size-5" />
          Votações
        </h3>
        {isAdmin && (
          <Button
            size="sm"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="size-4 mr-1" />
            Nova Votação
          </Button>
        )}
      </div>

      {votes.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Vote className="size-12 mx-auto mb-3 text-slate-300" />
          <p className="font-medium">Nenhuma votação ativa</p>
          <p className="text-sm">Os administradores podem criar votações.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {votes.map((vote) => {
            const expired = isExpired(vote.expiresAt);
            const totalVotes = getTotalVotes(vote.options);

            return (
              <div
                key={vote.id}
                className={`bg-white rounded-xl shadow-md p-5 border-l-4 ${
                  expired ? "border-slate-300 opacity-75" : "border-[#1E40AF]"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-800">{vote.title}</h4>
                    {vote.description && (
                      <p className="text-sm text-slate-500 mt-1">{vote.description}</p>
                    )}
                  </div>
                  {expired && (
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">
                      Terminada
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-3">
                  {vote.options.map((option) => {
                    const voteCount = option._count?.responses || 0;
                    const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                    const isUserVote = vote.userVote === option.id;

                    return (
                      <button
                        key={option.id}
                        onClick={() => !expired && handleVote(vote.id, option.id)}
                        disabled={expired || votingFor === option.id}
                        className={`w-full text-left p-3 rounded-lg border transition-all relative overflow-hidden ${
                          isUserVote
                            ? "border-[#1E40AF] bg-blue-50"
                            : "border-slate-200 hover:border-slate-300"
                        } ${expired ? "cursor-default" : "cursor-pointer"}`}
                      >
                        {/* Progress bar background */}
                        <div
                          className="absolute inset-y-0 left-0 bg-blue-100/50 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isUserVote && <Check className="size-4 text-[#1E40AF]" />}
                            <span className="text-sm font-medium text-slate-700">
                              {option.text}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {voteCount} {voteCount === 1 ? "voto" : "votos"} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <User className="size-3" />
                    <span>Criado por {vote.createdBy.name}</span>
                  </div>
                  {vote.expiresAt && (
                    <div className="flex items-center gap-1">
                      <Clock className="size-3" />
                      <span>
                        {expired
                          ? "Terminou em"
                          : "Termina em"}{" "}
                        {new Date(vote.expiresAt).toLocaleDateString("pt-PT", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateVoteDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateVote}
      />
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MessageCircle, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string; email?: string };
}

interface WorkspaceChatProps {
  workspaceId: string;
  currentUserId: string;
}

async function fetchMessages(workspaceId: string, before?: string) {
  const url = `/api/workspaces/${workspaceId}/chat${before ? `?before=${before}` : ""}`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

async function sendMessage(workspaceId: string, content: string) {
  const res = await fetch(`/api/workspaces/${workspaceId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

export default function WorkspaceChat({ workspaceId, currentUserId }: WorkspaceChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = useCallback(async () => {
    try {
      const data = await fetchMessages(workspaceId);
      setMessages(data.messages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar mensagens");
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadMessages();

    // Poll for new messages every 5 seconds
    pollIntervalRef.current = setInterval(() => {
      loadMessages();
    }, 5000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const data = await sendMessage(workspaceId, newMessage.trim());
      setMessages((prev) => [...prev, data.message]);
      setNewMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar mensagem");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Hoje";
    if (date.toDateString() === yesterday.toDateString()) return "Ontem";
    return date.toLocaleDateString("pt-PT", { day: "numeric", month: "short" });
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  // Group messages by date
  const groupedMessages: { date: string; messages: ChatMessage[] }[] = [];
  let currentDate = "";
  messages.forEach((msg) => {
    const msgDate = new Date(msg.createdAt).toDateString();
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groupedMessages.push({ date: msg.createdAt, messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  });

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full size-8 border-b-2 border-[#1E40AF]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[400px] bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-slate-200">
        <MessageCircle className="size-5 text-[#1E40AF]" />
        <h3 className="font-semibold text-slate-800">Chat do Workspace</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-red-600 text-sm">
            {error}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <MessageCircle className="size-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">Nenhuma mensagem ainda</p>
            <p className="text-sm">Sê o primeiro a enviar uma mensagem!</p>
          </div>
        ) : (
          groupedMessages.map((group, gi) => (
            <div key={gi}>
              {/* Date separator */}
              <div className="flex items-center gap-2 my-4">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium">
                  {formatDate(group.date)}
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Messages for this date */}
              {group.messages.map((msg) => {
                const isOwn = msg.user.id === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 mb-3 ${isOwn ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`size-8 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0 ${
                        isOwn ? "bg-[#1E40AF]" : "bg-slate-400"
                      }`}
                    >
                      {getInitial(msg.user.name)}
                    </div>
                    <div
                      className={`max-w-[70%] rounded-xl px-3 py-2 ${
                        isOwn
                          ? "bg-[#1E40AF] text-white"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {!isOwn && (
                        <p className="text-xs font-medium text-slate-500 mb-1">
                          {msg.user.name}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          isOwn ? "text-blue-200" : "text-slate-400"
                        }`}
                      >
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escreve uma mensagem..."
            disabled={sending}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!newMessage.trim() || sending} size="icon">
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

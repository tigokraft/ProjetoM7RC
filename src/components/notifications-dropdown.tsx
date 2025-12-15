"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Check, X, Users, Calendar, CheckSquare, Vote, Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Notification {
  id: string;
  type: "WORKSPACE_INVITE" | "EVENT_REMINDER" | "TASK_DEADLINE" | "VOTE_CREATED" | "GROUP_ASSIGNED" | "GENERAL";
  title: string;
  message: string;
  referenceId: string | null;
  read: boolean;
  createdAt: string;
}

interface NotificationsDropdownProps {
  onWorkspaceJoined?: () => void;
}

export default function NotificationsDropdown({ onWorkspaceJoined }: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleInviteAction = async (notificationId: string, action: "accept" | "decline") => {
    setActionLoading(notificationId);
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        await fetchNotifications();
        if (action === "accept" && onWorkspaceJoined) {
          onWorkspaceJoined();
        }
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Failed to process action:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "WORKSPACE_INVITE":
        return <Users className="w-4 h-4 text-blue-500" />;
      case "EVENT_REMINDER":
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case "TASK_DEADLINE":
        return <CheckSquare className="w-4 h-4 text-yellow-500" />;
      case "VOTE_CREATED":
        return <Vote className="w-4 h-4 text-green-500" />;
      case "GROUP_ASSIGNED":
        return <Users className="w-4 h-4 text-cyan-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return "Agora";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString("pt-PT");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Notificações"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Notificações</h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Marcar todas como lidas
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full w-6 h-6 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Sem notificações</p>
            </div>
          ) : (
            notifications.slice(0, 10).map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  !notification.read ? "bg-blue-50/50" : ""
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex gap-3">
                  <div className="mt-0.5">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTime(notification.createdAt)}
                    </p>

                    {/* Invite Actions */}
                    {notification.type === "WORKSPACE_INVITE" && !notification.read && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInviteAction(notification.id, "accept");
                          }}
                          disabled={actionLoading === notification.id}
                          className="flex-1 py-1.5 px-3 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Aceitar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInviteAction(notification.id, "decline");
                          }}
                          disabled={actionLoading === notification.id}
                          className="flex-1 py-1.5 px-3 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Recusar
                        </button>
                      </div>
                    )}
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 10 && (
          <div className="p-3 border-t border-gray-200 text-center">
            <a
              href="/dashboard/notifications"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Ver todas as notificações
            </a>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

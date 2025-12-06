"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Check,
  Loader2,
  AlertTriangle,
  Info,
  CheckCircle,
  Calendar,
  User,
  Syringe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    // For now, use mock data since we don't have a notifications API yet
    setIsLoading(false);
    setNotifications([
      {
        id: "1",
        type: "OVERDUE_IMMUNIZATION",
        title: "Overdue Immunization Alert",
        message: "5 children have overdue immunizations this week",
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        type: "NEW_REGISTRATION",
        title: "New Registration",
        message: "A new mother has been registered: Jane Nakato",
        isRead: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "3",
        type: "TRANSFER_REQUEST",
        title: "Transfer Request Received",
        message: "Incoming transfer request from Mulago Hospital",
        isRead: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "4",
        type: "SYSTEM",
        title: "System Update",
        message: "New vaccine BCG-II has been added to the UNEPI catalog",
        isRead: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ]);
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "OVERDUE_IMMUNIZATION":
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      case "NEW_REGISTRATION":
        return <User className="h-5 w-5 text-emerald-400" />;
      case "TRANSFER_REQUEST":
        return <Calendar className="h-5 w-5 text-blue-400" />;
      case "IMMUNIZATION_COMPLETED":
        return <Syringe className="h-5 w-5 text-violet-400" />;
      case "SYSTEM":
        return <Info className="h-5 w-5 text-slate-400" />;
      default:
        return <Bell className="h-5 w-5 text-slate-400" />;
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === "unread" ? !n.isRead : true
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Notifications</h1>
          <p className="text-slate-400">
            Stay updated with important alerts and activities
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" onValueChange={(v) => setFilter(v as "all" | "unread")}>
        <TabsList className="bg-slate-800/50 border border-slate-700/50">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
          >
            All
            <Badge
              variant="secondary"
              className="ml-2 bg-slate-700 text-slate-300"
            >
              {notifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="unread"
            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
          >
            Unread
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-violet-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <NotificationList
            notifications={filteredNotifications}
            onMarkAsRead={markAsRead}
            getIcon={getNotificationIcon}
            formatTimeAgo={formatTimeAgo}
          />
        </TabsContent>

        <TabsContent value="unread" className="mt-6">
          <NotificationList
            notifications={filteredNotifications}
            onMarkAsRead={markAsRead}
            getIcon={getNotificationIcon}
            formatTimeAgo={formatTimeAgo}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationList({
  notifications,
  onMarkAsRead,
  getIcon,
  formatTimeAgo,
}: {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  getIcon: (type: string) => React.ReactNode;
  formatTimeAgo: (date: string) => string;
}) {
  if (notifications.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
        <CheckCircle className="h-12 w-12 text-emerald-500/50 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-300 mb-2">
          All caught up!
        </h3>
        <p className="text-slate-500">
          You have no unread notifications
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`bg-slate-800/50 border rounded-xl p-4 transition-colors ${
            notification.isRead
              ? "border-slate-700/50"
              : "border-violet-500/30 bg-violet-500/5"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`p-2 rounded-lg ${
                notification.isRead ? "bg-slate-700/50" : "bg-violet-500/20"
              }`}
            >
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3
                    className={`font-medium ${
                      notification.isRead ? "text-slate-300" : "text-white"
                    }`}
                  >
                    {notification.title}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {notification.message}
                  </p>
                </div>
                {!notification.isRead && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onMarkAsRead(notification.id)}
                    className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {formatTimeAgo(notification.createdAt)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

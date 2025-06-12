"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Bell, Gift, ChevronRight } from "lucide-react";

interface Notification {
  id: string;
  type: 'info' | 'promotion';
  title: string;
  message: string;
  action?: {
    text: string;
    href?: string;
  };
  dismissible?: boolean;
}

interface NotificationBannerProps {
  notifications?: Notification[];
}

const defaultNotifications: Notification[] = [
  {
    id: "1",
    type: "promotion",
    title: "🎉 春季招聘计划正在进行中",
    message: "我们正在寻找优秀的技术人才加入Yarbo团队，多个岗位热招中！",
    dismissible: true
  }
];

export function NotificationBanner({ notifications = defaultNotifications }: NotificationBannerProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const dismissedIds = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
    const filteredNotifications = notifications.filter(n => !dismissedIds.includes(n.id));
    setVisibleNotifications(filteredNotifications);
  }, [notifications]);

  const dismissNotification = (id: string) => {
    const dismissedIds = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
    const updatedDismissedIds = [...dismissedIds, id];
    localStorage.setItem('dismissedNotifications', JSON.stringify(updatedDismissedIds));
    setVisibleNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  const currentNotification = visibleNotifications[0];

  return (
    <div className="w-full mb-6">
      <Card className="border bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 shadow-sm overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="text-purple-600 mt-0.5">
                <Gift className="h-5 w-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-semibold text-purple-900 text-sm">
                    {currentNotification.title}
                  </h4>
                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                    热门
                  </Badge>
                </div>
                <p className="text-purple-800 text-sm leading-relaxed">
                  {currentNotification.message}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              {currentNotification.dismissible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissNotification(currentNotification.id)}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-white/50"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
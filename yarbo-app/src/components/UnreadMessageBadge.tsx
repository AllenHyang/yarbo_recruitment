/*
 * @Author: Allen
 * @Date: 2025-06-09 20:00:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-09 20:00:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/components/UnreadMessageBadge.tsx
 * @Description: 未读消息提醒组件
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMessages } from "@/lib/api";
import Link from "next/link";

interface UnreadMessageBadgeProps {
  userId: string;
  className?: string;
}

export function UnreadMessageBadge({ userId, className = "" }: UnreadMessageBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // 获取未读消息数量
  const fetchUnreadCount = async () => {
    try {
      const result = await getMessages(userId, { status: 'unread', limit: 1 });
      if (result.success) {
        setUnreadCount(result.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('获取未读消息数量失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUnreadCount();
      
      // 每30秒刷新一次未读消息数量
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  if (loading) {
    return (
      <Button variant="ghost" size="sm" className={className} disabled>
        <Bell className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Link href="/messages">
      <Button variant="ghost" size="sm" className={`relative ${className}`}>
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
    </Link>
  );
}

// 简化版本，只显示数字
export function UnreadMessageCount({ userId }: { userId: string }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const result = await getMessages(userId, { status: 'unread', limit: 1 });
        if (result.success) {
          setUnreadCount(result.data.unreadCount || 0);
        }
      } catch (error) {
        console.error('获取未读消息数量失败:', error);
      }
    };

    if (userId) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  return unreadCount;
}

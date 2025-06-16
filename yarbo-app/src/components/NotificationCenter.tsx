"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, X, Check, Clock, User, Briefcase, Calendar, Settings, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  realtimeManager,
  subscribeToApplicationUpdates,
  subscribeToNewApplicationsForHR,
  subscribeToInterviewUpdates,
  subscribeToMessageUpdates,
  generateNotificationActionUrl
} from "@/lib/realtime";
import {
  NotificationData,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationAPI
} from "@/lib/notifications";
import { useAuth } from "@/contexts/AuthContext";
import { getMessages } from "@/lib/messages";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 获取用户通知数据 (临时禁用)
  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      // 临时禁用通知功能，避免 API 错误
      // const result = await getNotifications({
      //   userId: user.id,
      //   page: 1,
      //   limit: 20
      // });

      // if (result.success && result.data) {
      //   setNotifications(result.data.notifications);
      //   setUnreadCount(result.data.unreadCount);
      // }

      // 临时设置为空数据
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('获取通知失败:', error);
    }
  };

  // 初始加载通知数据
  useEffect(() => {
    if (!user?.id || !userProfile?.role) return;
    fetchNotifications();
  }, [user?.id, userProfile?.role]);

  // 获取未读消息数量 (临时禁用)
  const fetchUnreadMessageCount = async () => {
    if (!user?.id) return;
    try {
      // 临时禁用消息功能，避免 API 错误
      // const result = await getMessages(user.id, { status: 'unread', limit: 1 });
      // if (result.success && result.data) {
      //   setMessageCount(result.data.unreadCount || 0);
      // }
      setMessageCount(0); // 临时设置为 0
    } catch (error) {
      console.error('获取未读消息数量失败:', error);
    }
  };

  // 设置实时订阅 (临时禁用)
  useEffect(() => {
    if (!user?.id || !userProfile?.role) return;

    const unsubscribeFunctions: (() => void)[] = [];

    // 临时禁用通知订阅，避免 API 错误
    // const unsubscribeNotifications = realtimeManager.subscribeToNotifications((notification) => {
    //   if (notification.userId === user.id) {
    //     // 刷新通知列表以获取最新数据
    //     fetchNotifications();

    //     // 显示浏览器通知
    //     if ('Notification' in window && Notification.permission === 'granted') {
    //       new Notification(notification.title, {
    //         body: notification.message,
    //         icon: '/favicon.ico'
    //       });
    //     }
    //   }
    // });
    // unsubscribeFunctions.push(unsubscribeNotifications);

    // 根据用户角色订阅不同的事件
    if (userProfile.role === 'hr' || userProfile.role === 'admin') {
      // HR/管理员订阅新申请
      const unsubscribeApplications = subscribeToNewApplicationsForHR((application) => {
        // 这里会通过实时通知系统自动处理
      });
      unsubscribeFunctions.push(unsubscribeApplications);

      // HR/管理员订阅面试管理相关通知
      const unsubscribeInterviews = subscribeToInterviewUpdates(user.id, (interview) => {
        // 这里会通过实时通知系统自动处理
      });
      unsubscribeFunctions.push(unsubscribeInterviews);
    } else if (userProfile.role === 'candidate') {
      // 候选人订阅申请状态更新
      const unsubscribeApplications = subscribeToApplicationUpdates(user.id, (application) => {
        // 这里会通过实时通知系统自动处理
      });
      unsubscribeFunctions.push(unsubscribeApplications);

      // 候选人订阅面试更新
      const unsubscribeInterviews = subscribeToInterviewUpdates(user.id, (interview) => {
        // 这里会通过实时通知系统自动处理
      });
      unsubscribeFunctions.push(unsubscribeInterviews);
    }

    // 订阅消息更新
    const unsubscribeMessages = subscribeToMessageUpdates(user.id, (message) => {
      // 这里会通过实时通知系统自动处理
      fetchUnreadMessageCount(); // 刷新消息数量
    });
    unsubscribeFunctions.push(unsubscribeMessages);

    // 初始加载消息数量
    fetchUnreadMessageCount();

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [user?.id, userProfile?.role]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 请求通知权限
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const result = await markNotificationAsRead(notificationId, user.id);
      if (result.success) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('标记通知为已读失败:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const result = await markAllNotificationsAsRead(user.id);
      if (result.success) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('标记所有通知为已读失败:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const result = await deleteNotificationAPI(notificationId, user.id);
      if (result.success) {
        const notification = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('删除通知失败:', error);
    }
  };

  // 处理通知点击跳转
  const handleNotificationClick = (notification: NotificationData) => {
    // 如果通知未读，先标记为已读
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // 生成跳转URL - 使用当前用户的角色而不是通知中的角色
    let actionUrl = notification.actionUrl;
    if (!actionUrl) {
      const { url } = generateNotificationActionUrl(
        notification.type,
        notification.metadata,
        userProfile?.role || 'candidate'  // 使用当前用户的角色
      );
      actionUrl = url;
    }

    // 关闭通知中心
    setIsOpen(false);

    // 执行跳转
    if (actionUrl) {
      if (notification.actionType === 'external') {
        window.open(actionUrl, '_blank');
      } else {
        router.push(actionUrl);
      }
    }
  };

  const getNotificationIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'new_application':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'application_status':
        return <Briefcase className="w-4 h-4 text-green-600" />;
      case 'interview_scheduled':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'system_update':
        return <Settings className="w-4 h-4 text-gray-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return '刚刚';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}天前`;

    return time.toLocaleDateString('zh-CN');
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* 通知按钮 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <Bell className="w-5 h-5" />
        {(unreadCount + messageCount) > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {(unreadCount + messageCount) > 99 ? '99+' : (unreadCount + messageCount)}
          </Badge>
        )}
      </Button>

      {/* 通知下拉菜单 */}
      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 max-w-sm shadow-lg border-0 z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">通知中心</CardTitle>
              <div className="flex items-center space-x-2">
                {messageCount > 0 && (
                  <Link href="/messages">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                    >
                      查看消息
                    </Button>
                  </Link>
                )}
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    全部已读
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {/* 消息提醒 */}
            {messageCount > 0 && (
              <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    您有 {messageCount} 条未读消息
                  </span>
                  <Link href="/messages">
                    <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-800">
                      查看
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>暂无通知</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 border-b border-gray-100 transition-colors relative group",
                        !notification.read && "bg-blue-50",
                        "hover:bg-gray-50 cursor-pointer"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </p>
                                {/* 可点击指示器 */}
                                <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {formatTimeAgo(notification.createdAt)}
                                </span>
                                {/* 点击提示 */}
                                <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                  点击查看详情
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="标记为已读"
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                title="删除通知"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

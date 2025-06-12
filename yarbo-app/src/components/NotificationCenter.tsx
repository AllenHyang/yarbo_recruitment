"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, X, Check, Clock, User, Briefcase, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  realtimeManager, 
  NotificationData,
  subscribeToApplicationUpdates,
  subscribeToNewApplicationsForHR,
  subscribeToInterviewUpdates,
  subscribeToMessageUpdates
} from "@/lib/realtime";
import { useAuth } from "@/contexts/AuthContext";

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const { user, userProfile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 模拟一些初始通知数据
  useEffect(() => {
    const mockNotifications: NotificationData[] = [
      {
        id: '1',
        type: 'new_application',
        title: '新的求职申请',
        message: '张三申请了高级前端工程师职位',
        userId: user?.id || '',
        userRole: userProfile?.role || 'candidate',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30分钟前
        read: false,
        metadata: {
          applicantName: '张三',
          jobTitle: '高级前端工程师'
        }
      },
      {
        id: '2',
        type: 'application_status',
        title: '申请状态更新',
        message: '您的申请正在审核中',
        userId: user?.id || '',
        userRole: userProfile?.role || 'candidate',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2小时前
        read: false,
        metadata: {
          jobTitle: '产品经理',
          newStatus: 'reviewing'
        }
      },
      {
        id: '3',
        type: 'interview_scheduled',
        title: '面试安排通知',
        message: '您的产品经理面试已安排在明天下午2点',
        userId: user?.id || '',
        userRole: userProfile?.role || 'candidate',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1天前
        read: true,
        metadata: {
          jobTitle: '产品经理',
          interviewDate: '2024-06-11 14:00'
        }
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, [user?.id, userProfile?.role]);

  // 设置实时订阅
  useEffect(() => {
    if (!user?.id || !userProfile?.role) return;

    const unsubscribeFunctions: (() => void)[] = [];

    // 订阅通知
    const unsubscribeNotifications = realtimeManager.subscribeToNotifications((notification) => {
      if (notification.userId === user.id) {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // 显示浏览器通知
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico'
          });
        }
      }
    });
    unsubscribeFunctions.push(unsubscribeNotifications);

    // 根据用户角色订阅不同的事件
    if (userProfile.role === 'hr' || userProfile.role === 'admin') {
      // HR订阅新申请
      const unsubscribeApplications = subscribeToNewApplicationsForHR((application) => {
        // 这里会通过实时通知系统自动处理
      });
      unsubscribeFunctions.push(unsubscribeApplications);
    } else if (userProfile.role === 'candidate') {
      // 候选人订阅申请状态更新
      const unsubscribeApplications = subscribeToApplicationUpdates(user.id, (application) => {
        // 这里会通过实时通知系统自动处理
      });
      unsubscribeFunctions.push(unsubscribeApplications);

      // 订阅面试更新
      const unsubscribeInterviews = subscribeToInterviewUpdates(user.id, (interview) => {
        // 这里会通过实时通知系统自动处理
      });
      unsubscribeFunctions.push(unsubscribeInterviews);
    }

    // 订阅消息更新
    const unsubscribeMessages = subscribeToMessageUpdates(user.id, (message) => {
      // 这里会通过实时通知系统自动处理
    });
    unsubscribeFunctions.push(unsubscribeMessages);

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

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
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
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* 通知下拉菜单 */}
      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 max-w-sm shadow-lg border-0 z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">通知</CardTitle>
              <div className="flex items-center space-x-2">
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
                        "p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors",
                        !notification.read && "bg-blue-50"
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {formatTimeAgo(notification.createdAt)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 h-auto"
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1 h-auto"
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

/*
 * @Author: Allen
 * @Date: 2025-06-10 12:00:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-10 12:00:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/app/test-notifications/page.tsx
 * @Description: 通知和消息系统测试页面
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getNotifications, 
  createNotification, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  NotificationData 
} from '@/lib/notifications';
import { 
  getMessages, 
  sendMessage, 
  MessageData 
} from '@/lib/messages';

export default function TestNotificationsPage() {
  const { user, userProfile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取通知
  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const result = await getNotifications({
        userId: user.id,
        page: 1,
        limit: 10
      });
      
      if (result.success && result.data) {
        setNotifications(result.data.notifications);
      }
    } catch (error) {
      console.error('获取通知失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取消息
  const fetchMessages = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const result = await getMessages(user.id, {
        page: 1,
        limit: 10
      });
      
      if (result.success && result.data) {
        setMessages(result.data.messages);
      }
    } catch (error) {
      console.error('获取消息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 创建测试通知
  const createTestNotification = async () => {
    if (!user?.id || !userProfile?.role) return;
    
    try {
      const result = await createNotification({
        type: 'system_update',
        title: '测试通知',
        message: `这是一条测试通知，创建时间：${new Date().toLocaleString()}`,
        user_id: user.id,
        user_role: userProfile.role,
        metadata: {
          test: true,
          timestamp: new Date().toISOString()
        }
      });
      
      if (result.success) {
        alert('测试通知创建成功！');
        fetchNotifications();
      } else {
        alert('创建通知失败：' + result.error);
      }
    } catch (error) {
      console.error('创建通知失败:', error);
      alert('创建通知失败');
    }
  };

  // 创建测试消息
  const createTestMessage = async () => {
    if (!user?.id || !userProfile?.role) return;
    
    try {
      const result = await sendMessage({
        sender_id: user.id,
        sender_name: userProfile.first_name || '测试用户',
        sender_role: userProfile.role,
        receiver_id: user.id, // 发给自己
        receiver_name: userProfile.first_name || '测试用户',
        receiver_role: userProfile.role,
        title: '测试消息',
        content: `这是一条测试消息，创建时间：${new Date().toLocaleString()}`,
        type: 'general',
        priority: 'normal',
        metadata: {
          test: true,
          timestamp: new Date().toISOString()
        }
      });
      
      if (result.success) {
        alert('测试消息创建成功！');
        fetchMessages();
      } else {
        alert('创建消息失败：' + result.error);
      }
    } catch (error) {
      console.error('创建消息失败:', error);
      alert('创建消息失败');
    }
  };

  // 标记通知为已读
  const handleMarkAsRead = async (notificationId: string) => {
    if (!user?.id) return;
    
    try {
      const result = await markNotificationAsRead(notificationId, user.id);
      if (result.success) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('标记通知失败:', error);
    }
  };

  // 标记所有通知为已读
  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      const result = await markAllNotificationsAsRead(user.id);
      if (result.success) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('标记所有通知失败:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      fetchMessages();
    }
  }, [user?.id]);

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p>请先登录以测试通知和消息功能</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">通知和消息系统测试</h1>
        <div className="space-x-2">
          <Button onClick={createTestNotification}>创建测试通知</Button>
          <Button onClick={createTestMessage}>创建测试消息</Button>
          <Button onClick={fetchNotifications} disabled={loading}>
            刷新通知
          </Button>
          <Button onClick={fetchMessages} disabled={loading}>
            刷新消息
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 通知列表 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>通知列表</CardTitle>
              <Button size="sm" onClick={handleMarkAllAsRead}>
                全部已读
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>加载中...</p>
            ) : notifications.length === 0 ? (
              <p>暂无通知</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border rounded-lg ${
                      !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{notification.title}</h4>
                          <Badge variant={notification.read ? 'secondary' : 'default'}>
                            {notification.type}
                          </Badge>
                          {!notification.read && (
                            <Badge variant="destructive" className="text-xs">
                              未读
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          标记已读
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 消息列表 */}
        <Card>
          <CardHeader>
            <CardTitle>消息列表</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>加载中...</p>
            ) : messages.length === 0 ? (
              <p>暂无消息</p>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 border rounded-lg ${
                      message.status === 'unread' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{message.title}</h4>
                      <Badge variant="outline">{message.type}</Badge>
                      <Badge variant={message.priority === 'high' ? 'destructive' : 'secondary'}>
                        {message.priority}
                      </Badge>
                      {message.status === 'unread' && (
                        <Badge variant="destructive" className="text-xs">
                          未读
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      来自：{message.sender_name} ({message.sender_role})
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      {message.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 用户信息 */}
      <Card>
        <CardHeader>
          <CardTitle>当前用户信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>用户ID:</strong> {user.id}</p>
              <p><strong>邮箱:</strong> {user.email}</p>
            </div>
            <div>
              <p><strong>角色:</strong> {userProfile?.role}</p>
              <p><strong>姓名:</strong> {userProfile?.first_name} {userProfile?.last_name}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

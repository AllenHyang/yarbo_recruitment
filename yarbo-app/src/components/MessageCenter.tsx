/*
 * @Author: Allen
 * @Date: 2025-06-09 19:00:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-09 19:00:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/components/MessageCenter.tsx
 * @Description: 消息中心组件
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Mail, 
  MailOpen, 
  Trash2, 
  Clock, 
  User, 
  Briefcase,
  CheckCircle,
  AlertCircle,
  Info,
  Star
} from "lucide-react";
import { getMessages, updateMessageStatus, deleteMessage } from "@/lib/api";

// 消息接口
interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  receiver_id: string;
  receiver_name: string;
  receiver_role: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  status: string;
  created_at: string;
  read_at?: string;
  metadata?: any;
}

interface MessageCenterProps {
  userId: string;
  userRole: string;
}

export function MessageCenter({ userId, userRole }: MessageCenterProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedTab, setSelectedTab] = useState('all');

  // 获取消息列表
  const fetchMessages = async (status?: string) => {
    setLoading(true);
    try {
      const result = await getMessages(userId, { status, limit: 50 });
      if (result.success) {
        setMessages(result.data.messages);
        setUnreadCount(result.data.unreadCount);
      }
    } catch (error) {
      console.error('获取消息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [userId]);

  // 标记消息为已读
  const markAsRead = async (messageId: string) => {
    try {
      const result = await updateMessageStatus(messageId, 'read', userId);
      if (result.success) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: 'read', read_at: new Date().toISOString() }
            : msg
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  // 删除消息
  const handleDeleteMessage = async (messageId: string) => {
    try {
      const result = await deleteMessage(messageId, userId);
      if (result.success) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
      }
    } catch (error) {
      console.error('删除消息失败:', error);
    }
  };

  // 获取消息类型图标
  const getMessageIcon = (type: string, priority: string) => {
    if (priority === 'high') {
      return <Star className="w-4 h-4 text-yellow-500" />;
    }
    
    switch (type) {
      case 'status_update':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'interview_scheduled':
        return <Briefcase className="w-4 h-4 text-purple-500" />;
      case 'application_result':
        return <AlertCircle className="w-4 h-4 text-green-500" />;
      case 'hr_message':
        return <User className="w-4 h-4 text-indigo-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  // 获取消息类型文本
  const getMessageTypeText = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'status_update': '状态更新',
      'interview_scheduled': '面试安排',
      'application_result': '申请结果',
      'hr_message': 'HR消息',
      'system': '系统消息'
    };
    return typeMap[type] || type;
  };

  // 获取优先级颜色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 筛选消息
  const filteredMessages = messages.filter(message => {
    if (selectedTab === 'unread') return message.status === 'unread';
    if (selectedTab === 'read') return message.status === 'read';
    return message.status !== 'deleted';
  });

  return (
    <div className="space-y-6">
      {/* 消息中心标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">消息中心</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount} 条未读
            </Badge>
          )}
        </div>
        <Button 
          variant="outline" 
          onClick={() => fetchMessages()}
          disabled={loading}
        >
          刷新消息
        </Button>
      </div>

      {/* 消息标签页 */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">全部消息</TabsTrigger>
          <TabsTrigger value="unread">
            未读消息 {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
          <TabsTrigger value="read">已读消息</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">加载消息中...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {selectedTab === 'unread' ? '暂无未读消息' : 
                   selectedTab === 'read' ? '暂无已读消息' : '暂无消息'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredMessages.map((message) => (
                <Card 
                  key={message.id} 
                  className={`transition-all hover:shadow-md ${
                    message.status === 'unread' ? 'border-blue-200 bg-blue-50/30' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getMessageIcon(message.type, message.priority)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <CardTitle className="text-sm font-medium truncate">
                              {message.title}
                            </CardTitle>
                            {message.status === 'unread' && (
                              <Badge variant="secondary" className="text-xs">
                                未读
                              </Badge>
                            )}
                            <Badge className={`text-xs ${getPriorityColor(message.priority)}`}>
                              {getMessageTypeText(message.type)}
                            </Badge>
                          </div>
                          <CardDescription className="text-xs">
                            来自: {message.sender_name} • {message.created_at}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        {message.status === 'unread' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(message.id)}
                            className="h-8 w-8 p-0"
                          >
                            <MailOpen className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMessage(message.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {message.content}
                    </p>
                    {message.metadata && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600 space-y-1">
                          {message.metadata.job_title && (
                            <div>职位: {message.metadata.job_title}</div>
                          )}
                          {message.metadata.application_id && (
                            <div>申请编号: #{message.metadata.application_id}</div>
                          )}
                          {message.metadata.status_change && (
                            <div>
                              状态变更: {message.metadata.status_change.from} → {message.metadata.status_change.to}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

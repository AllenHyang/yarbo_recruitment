/*
 * @Author: Allen
 * @Date: 2025-06-10 12:00:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-10 12:00:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/lib/messages.ts
 * @Description: 消息系统服务函数
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

import { Message } from './database.types';

// 消息类型
export type MessageType = 'system' | 'status_update' | 'interview_notification' | 'general' | 'urgent';

// 消息优先级
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';

// 消息状态
export type MessageStatus = 'unread' | 'read' | 'archived' | 'deleted';

// 消息数据接口
export interface MessageData {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  receiver_id: string;
  receiver_name: string;
  receiver_role: string;
  title: string;
  content: string;
  type: MessageType;
  priority: MessagePriority;
  status: MessageStatus;
  created_at: string;
  read_at?: string;
  metadata?: Record<string, any>;
}

// 创建消息参数
export interface CreateMessageParams {
  sender_id: string;
  sender_name: string;
  sender_role: string;
  receiver_id: string;
  receiver_name: string;
  receiver_role: string;
  title: string;
  content: string;
  type: MessageType;
  priority?: MessagePriority;
  metadata?: Record<string, any>;
}

// 获取消息列表参数
export interface GetMessagesParams {
  userId: string;
  status?: MessageStatus;
  type?: MessageType;
  page?: number;
  limit?: number;
}

// 消息列表响应
export interface MessagesResponse {
  messages: MessageData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

// API响应接口
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 获取用户消息列表
 */
export async function getMessages(userId: string, params?: Omit<GetMessagesParams, 'userId'>): Promise<{
  success: boolean;
  data?: MessagesResponse;
  error?: string;
}> {
  try {
    const searchParams = new URLSearchParams({
      userId,
      page: (params?.page || 1).toString(),
      limit: (params?.limit || 10).toString(),
    });

    if (params?.status) {
      searchParams.append('status', params.status);
    }

    if (params?.type) {
      searchParams.append('type', params.type);
    }

    // 使用 Cloudflare Workers API
    const workersApiUrl = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_WORKERS_API_URL || 'https://your-worker.your-subdomain.workers.dev'
      : 'http://localhost:8787';

    // 获取认证令牌
    const token = typeof window !== 'undefined' ? localStorage.getItem('workers_access_token') : null;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${workersApiUrl}/api/messages?${searchParams.toString()}`, {
      headers
    });
    const result: ApiResponse<MessagesResponse> = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || '获取消息失败'
      };
    }

    // 转换数据格式
    const transformedData: MessagesResponse = {
      messages: result.data?.messages.map(message => ({
        id: message.id,
        sender_id: message.sender_id,
        sender_name: message.sender_name,
        sender_role: message.sender_role,
        receiver_id: message.receiver_id,
        receiver_name: message.receiver_name,
        receiver_role: message.receiver_role,
        title: message.title,
        content: message.content,
        type: message.type as MessageType,
        priority: message.priority as MessagePriority,
        status: message.status as MessageStatus,
        created_at: message.created_at,
        read_at: message.read_at,
        metadata: message.metadata
      })) || [],
      pagination: result.data?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      unreadCount: result.data?.unreadCount || 0
    };

    return {
      success: true,
      data: transformedData
    };

  } catch (error) {
    console.error('获取消息列表错误:', error);
    return {
      success: false,
      error: '获取消息失败'
    };
  }
}

/**
 * 发送新消息
 */
export async function sendMessage(params: CreateMessageParams): Promise<{
  success: boolean;
  data?: MessageData;
  error?: string;
}> {
  try {
    // 使用 Cloudflare Workers API
    const workersApiUrl = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_WORKERS_API_URL || 'https://your-worker.your-subdomain.workers.dev'
      : 'http://localhost:8787';

    const response = await fetch(`${workersApiUrl}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const result: ApiResponse<Message> = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || '发送消息失败'
      };
    }

    // 转换数据格式
    const transformedData: MessageData = {
      id: result.data!.id,
      sender_id: result.data!.sender_id,
      sender_name: result.data!.sender_name,
      sender_role: result.data!.sender_role,
      receiver_id: result.data!.receiver_id,
      receiver_name: result.data!.receiver_name,
      receiver_role: result.data!.receiver_role,
      title: result.data!.title,
      content: result.data!.content,
      type: result.data!.type as MessageType,
      priority: result.data!.priority as MessagePriority,
      status: result.data!.status as MessageStatus,
      created_at: result.data!.created_at!,
      read_at: result.data!.read_at,
      metadata: result.data!.metadata
    };

    return {
      success: true,
      data: transformedData
    };

  } catch (error) {
    console.error('发送消息错误:', error);
    return {
      success: false,
      error: '发送消息失败'
    };
  }
}

/**
 * 获取单个消息详情
 */
export async function getMessage(messageId: string): Promise<{
  success: boolean;
  data?: MessageData;
  error?: string;
}> {
  try {
    // 使用 Cloudflare Workers API
    const workersApiUrl = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_WORKERS_API_URL || 'https://your-worker.your-subdomain.workers.dev'
      : 'http://localhost:8787';

    const response = await fetch(`${workersApiUrl}/api/messages/${messageId}`);
    const result: ApiResponse<Message> = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || '获取消息详情失败'
      };
    }

    // 转换数据格式
    const transformedData: MessageData = {
      id: result.data!.id,
      sender_id: result.data!.sender_id,
      sender_name: result.data!.sender_name,
      sender_role: result.data!.sender_role,
      receiver_id: result.data!.receiver_id,
      receiver_name: result.data!.receiver_name,
      receiver_role: result.data!.receiver_role,
      title: result.data!.title,
      content: result.data!.content,
      type: result.data!.type as MessageType,
      priority: result.data!.priority as MessagePriority,
      status: result.data!.status as MessageStatus,
      created_at: result.data!.created_at!,
      read_at: result.data!.read_at,
      metadata: result.data!.metadata
    };

    return {
      success: true,
      data: transformedData
    };

  } catch (error) {
    console.error('获取消息详情错误:', error);
    return {
      success: false,
      error: '获取消息详情失败'
    };
  }
}

/**
 * 标记消息为已读
 */
export async function markMessageAsRead(messageId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // 使用 Cloudflare Workers API
    const workersApiUrl = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_WORKERS_API_URL || 'https://your-worker.your-subdomain.workers.dev'
      : 'http://localhost:8787';

    const response = await fetch(`${workersApiUrl}/api/messages/${messageId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'read'
      }),
    });

    const result: ApiResponse = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || '标记消息失败'
      };
    }

    return { success: true };

  } catch (error) {
    console.error('标记消息为已读错误:', error);
    return {
      success: false,
      error: '标记消息失败'
    };
  }
}

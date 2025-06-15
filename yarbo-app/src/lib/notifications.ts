/*
 * @Author: Allen
 * @Date: 2025-06-10 12:00:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-10 12:00:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/lib/notifications.ts
 * @Description: 通知系统服务函数
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

import { Notification } from './database.types';

// 通知类型
export type NotificationType = 'application_status' | 'new_application' | 'interview_scheduled' | 'system_update' | 'message_received';

// 通知数据接口
export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  userRole: string;
  metadata?: Record<string, any>;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
  actionType?: 'internal' | 'external';
}

// 创建通知参数
export interface CreateNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  user_id: string;
  user_role: string;
  metadata?: Record<string, any>;
  action_url?: string;
  action_type?: 'internal' | 'external';
}

// 获取通知列表参数
export interface GetNotificationsParams {
  userId: string;
  read?: boolean;
  type?: NotificationType;
  page?: number;
  limit?: number;
}

// 通知列表响应
export interface NotificationsResponse {
  notifications: NotificationData[];
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
 * 获取用户通知列表
 */
export async function getNotifications(params: GetNotificationsParams): Promise<{
  success: boolean;
  data?: NotificationsResponse;
  error?: string;
}> {
  try {
    const searchParams = new URLSearchParams({
      userId: params.userId,
      page: (params.page || 1).toString(),
      limit: (params.limit || 20).toString(),
    });

    if (params.read !== undefined) {
      searchParams.append('read', params.read.toString());
    }

    if (params.type) {
      searchParams.append('type', params.type);
    }

    const response = await fetch(`/api/notifications?${searchParams.toString()}`);
    const result: ApiResponse<NotificationsResponse> = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || '获取通知失败'
      };
    }

    // 转换数据格式
    const transformedData: NotificationsResponse = {
      notifications: result.data?.notifications.map(notification => ({
        id: notification.id,
        type: notification.type as NotificationType,
        title: notification.title,
        message: notification.message,
        userId: notification.user_id,
        userRole: notification.user_role,
        metadata: notification.metadata,
        createdAt: notification.created_at,
        read: notification.read || false,
        actionUrl: notification.action_url,
        actionType: notification.action_type as 'internal' | 'external'
      })) || [],
      pagination: result.data?.pagination || {
        page: 1,
        limit: 20,
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
    console.error('获取通知列表错误:', error);
    return {
      success: false,
      error: '获取通知失败'
    };
  }
}

/**
 * 创建新通知
 */
export async function createNotification(params: CreateNotificationParams): Promise<{
  success: boolean;
  data?: NotificationData;
  error?: string;
}> {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const result: ApiResponse<Notification> = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || '创建通知失败'
      };
    }

    // 转换数据格式
    const transformedData: NotificationData = {
      id: result.data!.id,
      type: result.data!.type as NotificationType,
      title: result.data!.title,
      message: result.data!.message,
      userId: result.data!.user_id,
      userRole: result.data!.user_role,
      metadata: result.data!.metadata,
      createdAt: result.data!.created_at!,
      read: result.data!.read || false,
      actionUrl: result.data!.action_url,
      actionType: result.data!.action_type as 'internal' | 'external'
    };

    return {
      success: true,
      data: transformedData
    };

  } catch (error) {
    console.error('创建通知错误:', error);
    return {
      success: false,
      error: '创建通知失败'
    };
  }
}

/**
 * 标记通知为已读
 */
export async function markNotificationAsRead(notificationId: string, userId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/notifications/${notificationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        read: true,
        user_id: userId
      }),
    });

    const result: ApiResponse = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || '标记通知失败'
      };
    }

    return { success: true };

  } catch (error) {
    console.error('标记通知为已读错误:', error);
    return {
      success: false,
      error: '标记通知失败'
    };
  }
}

/**
 * 标记所有通知为已读
 */
export async function markAllNotificationsAsRead(userId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch('/api/notifications', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'mark_read',
        user_id: userId
      }),
    });

    const result: ApiResponse = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || '标记所有通知失败'
      };
    }

    return { success: true };

  } catch (error) {
    console.error('标记所有通知为已读错误:', error);
    return {
      success: false,
      error: '标记所有通知失败'
    };
  }
}

/**
 * 删除通知
 */
export async function deleteNotification(notificationId: string, userId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/notifications/${notificationId}?user_id=${userId}`, {
      method: 'DELETE',
    });

    const result: ApiResponse = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || '删除通知失败'
      };
    }

    return { success: true };

  } catch (error) {
    console.error('删除通知错误:', error);
    return {
      success: false,
      error: '删除通知失败'
    };
  }
}

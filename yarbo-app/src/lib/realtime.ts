import { supabase } from './supabase';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimeEvent<T = any> {
  eventType: RealtimeEventType;
  new: T | null;
  old: T | null;
  table: string;
  timestamp: string;
}

export interface NotificationData {
  id: string;
  type: 'application_status' | 'new_application' | 'interview_scheduled' | 'system_update';
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

export type RealtimeCallback<T = any> = (event: RealtimeEvent<T>) => void;
export type NotificationCallback = (notification: NotificationData) => void;

class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private notificationCallbacks: Set<NotificationCallback> = new Set();
  private isConnected = false;

  /**
   * 订阅表的实时变化
   */
  subscribeToTable<T = any>(
    tableName: string,
    callback: RealtimeCallback<T>,
    filter?: string
  ): () => void {
    const channelName = `table_${tableName}_${filter || 'all'}`;

    if (this.channels.has(channelName)) {
      console.warn(`Already subscribed to ${channelName}`);
      return () => this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: filter
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          const event: RealtimeEvent<T> = {
            eventType: payload.eventType as RealtimeEventType,
            new: payload.new,
            old: payload.old,
            table: tableName,
            timestamp: new Date().toISOString()
          };
          callback(event);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Subscribed to ${tableName} changes`);
          this.isConnected = true;
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Failed to subscribe to ${tableName}`);
        }
      });

    this.channels.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  /**
   * 订阅申请状态变化
   */
  subscribeToApplications(
    callback: RealtimeCallback,
    userId?: string
  ): () => void {
    const filter = userId ? `applicant_id=eq.${userId}` : undefined;
    return this.subscribeToTable('applications', callback, filter);
  }

  /**
   * 订阅新申请通知（HR专用）
   */
  subscribeToNewApplications(
    callback: RealtimeCallback,
    departmentIds?: string[]
  ): () => void {
    // 如果指定了部门，可以通过jobs表的department_id进行过滤
    return this.subscribeToTable('applications', (event) => {
      if (event.eventType === 'INSERT') {
        callback(event);
      }
    });
  }

  /**
   * 订阅面试安排变化
   */
  subscribeToInterviews(
    callback: RealtimeCallback,
    userId?: string
  ): () => void {
    const filter = userId ? `candidate_id=eq.${userId}` : undefined;
    return this.subscribeToTable('interviews', callback, filter);
  }

  /**
   * 订阅消息通知
   */
  subscribeToMessages(
    callback: RealtimeCallback,
    userId: string
  ): () => void {
    return this.subscribeToTable('messages', callback, `receiver_id=eq.${userId}`);
  }

  /**
   * 订阅通知
   */
  subscribeToNotifications(callback: NotificationCallback): () => void {
    this.notificationCallbacks.add(callback);

    return () => {
      this.notificationCallbacks.delete(callback);
    };
  }

  /**
   * 发送实时通知
   */
  async sendNotification(notification: Omit<NotificationData, 'id' | 'createdAt' | 'read'>): Promise<void> {
    const fullNotification: NotificationData = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      read: false
    };

    // 通知所有订阅者
    this.notificationCallbacks.forEach(callback => {
      callback(fullNotification);
    });

    // 这里可以添加将通知保存到数据库的逻辑
    try {
      await supabase
        .from('notifications')
        .insert({
          type: notification.type,
          title: notification.title,
          message: notification.message,
          user_id: notification.userId,
          user_role: notification.userRole,
          metadata: notification.metadata
        });
    } catch (error) {
      console.error('保存通知到数据库失败:', error);
    }
  }

  /**
   * 取消订阅
   */
  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
      console.log(`🔌 Unsubscribed from ${channelName}`);
    }
  }

  /**
   * 取消所有订阅
   */
  unsubscribeAll(): void {
    this.channels.forEach((channel, channelName) => {
      supabase.removeChannel(channel);
      console.log(`🔌 Unsubscribed from ${channelName}`);
    });
    this.channels.clear();
    this.notificationCallbacks.clear();
    this.isConnected = false;
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * 重新连接
   */
  async reconnect(): Promise<void> {
    console.log('🔄 Reconnecting to realtime...');
    this.unsubscribeAll();

    // 重新建立连接的逻辑可以在这里实现
    // 通常需要重新订阅之前的频道
  }
}

// 创建全局实例
export const realtimeManager = new RealtimeManager();

// 便捷函数
export function subscribeToApplicationUpdates(
  userId: string,
  callback: (application: any) => void
): () => void {
  return realtimeManager.subscribeToApplications((event) => {
    if (event.new) {
      callback(event.new);
    }
  }, userId);
}

export function subscribeToNewApplicationsForHR(
  callback: (application: any) => void
): () => void {
  return realtimeManager.subscribeToNewApplications((event) => {
    if (event.new) {
      callback(event.new);
    }
  });
}

export function subscribeToInterviewUpdates(
  userId: string,
  callback: (interview: any) => void
): () => void {
  return realtimeManager.subscribeToInterviews((event) => {
    if (event.new) {
      callback(event.new);
    }
  }, userId);
}

export function subscribeToMessageUpdates(
  userId: string,
  callback: (message: any) => void
): () => void {
  return realtimeManager.subscribeToMessages((event) => {
    if (event.new) {
      callback(event.new);
    }
  }, userId);
}

// 通知相关的便捷函数
export async function notifyApplicationStatusChange(
  applicantId: string,
  applicationId: string,
  newStatus: string,
  jobTitle: string
): Promise<void> {
  const statusMessages = {
    'submitted': '您的申请已提交',
    'reviewing': '您的申请正在审核中',
    'interview_scheduled': '面试已安排',
    'interviewed': '面试已完成',
    'interview_passed': '恭喜！您通过了面试',
    'offer_sent': '录用通知已发送',
    'hired': '恭喜！您已被录用',
    'rejected': '很遗憾，您的申请未通过'
  };

  const message = statusMessages[newStatus as keyof typeof statusMessages] || '申请状态已更新';
  const metadata = {
    applicationId,
    newStatus,
    jobTitle
  };

  const { url, actionType } = generateNotificationActionUrl('application_status', metadata, 'candidate');

  await realtimeManager.sendNotification({
    type: 'application_status',
    title: `申请状态更新 - ${jobTitle}`,
    message,
    userId: applicantId,
    userRole: 'candidate',
    metadata,
    actionUrl: url,
    actionType
  });
}

export async function notifyNewApplication(
  hrUserId: string,
  applicantName: string,
  jobTitle: string,
  applicationId: string
): Promise<void> {
  const metadata = {
    applicationId,
    applicantName,
    jobTitle
  };

  const { url, actionType } = generateNotificationActionUrl('new_application', metadata, 'hr');

  await realtimeManager.sendNotification({
    type: 'new_application',
    title: '新的求职申请',
    message: `${applicantName} 申请了 ${jobTitle} 职位`,
    userId: hrUserId,
    userRole: 'hr',
    metadata,
    actionUrl: url,
    actionType
  });
}

export async function notifyInterviewScheduled(
  candidateId: string,
  interviewDate: string,
  jobTitle: string,
  interviewId: string
): Promise<void> {
  const metadata = {
    interviewId,
    interviewDate,
    jobTitle
  };

  const { url, actionType } = generateNotificationActionUrl('interview_scheduled', metadata, 'candidate');

  await realtimeManager.sendNotification({
    type: 'interview_scheduled',
    title: '面试安排通知',
    message: `您的 ${jobTitle} 面试已安排在 ${interviewDate}`,
    userId: candidateId,
    userRole: 'candidate',
    metadata,
    actionUrl: url,
    actionType
  });
}

// 生成通知跳转URL的工具函数
export function generateNotificationActionUrl(
  type: NotificationData['type'],
  metadata?: Record<string, any>,
  userRole?: string
): { url: string; actionType: 'internal' | 'external' } {
  switch (type) {
    case 'application_status':
      if (userRole === 'candidate') {
        // 候选人查看自己的申请状态
        return {
          url: '/status',
          actionType: 'internal'
        };
      } else if (userRole === 'hr' || userRole === 'admin') {
        // HR查看申请详情
        const applicationId = metadata?.applicationId;
        return {
          url: applicationId ? `/hr/applications/${applicationId}` : '/hr/applications',
          actionType: 'internal'
        };
      }
      break;

    case 'new_application':
      if (userRole === 'hr' || userRole === 'admin') {
        // HR查看新申请
        const applicationId = metadata?.applicationId;
        return {
          url: applicationId ? `/hr/applications/${applicationId}` : '/hr/applications',
          actionType: 'internal'
        };
      }
      break;

    case 'interview_scheduled':
      if (userRole === 'candidate') {
        // 候选人查看面试安排
        return {
          url: '/status',
          actionType: 'internal'
        };
      } else if (userRole === 'hr' || userRole === 'admin') {
        // HR查看面试管理
        const interviewId = metadata?.interviewId;
        return {
          url: interviewId ? `/hr/interviews/${interviewId}` : '/hr/interviews',
          actionType: 'internal'
        };
      }
      break;

    case 'system_update':
      // 系统更新通知，跳转到通知中心
      return {
        url: userRole === 'hr' || userRole === 'admin' ? '/hr/notifications' : '/dashboard',
        actionType: 'internal'
      };

    default:
      // 默认跳转到仪表板
      return {
        url: userRole === 'hr' || userRole === 'admin' ? '/hr/dashboard' : '/dashboard',
        actionType: 'internal'
      };
  }

  // 默认返回
  return {
    url: '/dashboard',
    actionType: 'internal'
  };
}

// 清理函数
export function cleanupRealtime(): void {
  realtimeManager.unsubscribeAll();
}

// 在应用卸载时清理
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupRealtime);
}

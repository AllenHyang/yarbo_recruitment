/*
 * @Author: Allen
 * @Date: 2025-06-09 10:30:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-09 10:30:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/hooks/useEmailNotification.ts
 * @Description: 邮件通知管理Hook
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

import { useState, useCallback } from 'react';
import { EmailType } from '@/lib/email';

interface EmailNotificationData {
  candidateName: string;
  jobTitle: string;
  applicationId: string;
  applicationDate?: string;
  interviewDate?: string;
  nextSteps?: string;
}

interface EmailNotificationState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

interface UseEmailNotificationReturn {
  state: EmailNotificationState;
  sendNotification: (
    type: EmailType,
    to: string,
    data: EmailNotificationData
  ) => Promise<boolean>;
  testConnection: () => Promise<boolean>;
  reset: () => void;
}

export function useEmailNotification(): UseEmailNotificationReturn {
  const [state, setState] = useState<EmailNotificationState>({
    isLoading: false,
    error: null,
    success: false
  });

  const sendNotification = useCallback(async (
    type: EmailType,
    to: string,
    data: EmailNotificationData
  ): Promise<boolean> => {
    setState({ isLoading: true, error: null, success: false });

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          to,
          data: {
            ...data,
            applicationDate: data.applicationDate || new Date().toLocaleString('zh-CN')
          }
        }),
      });

      const result = await response.json();

      if (result.success) {
        setState({ isLoading: false, error: null, success: true });
        return true;
      } else {
        setState({ 
          isLoading: false, 
          error: result.error || '邮件发送失败', 
          success: false 
        });
        return false;
      }
    } catch (error) {
      setState({ 
        isLoading: false, 
        error: '网络错误，请稍后重试', 
        success: false 
      });
      return false;
    }
  }, []);

  const testConnection = useCallback(async (): Promise<boolean> => {
    setState({ isLoading: true, error: null, success: false });

    try {
      const response = await fetch('/api/email/send', {
        method: 'GET'
      });
      
      const result = await response.json();
      
      if (result.success && result.connected) {
        setState({ isLoading: false, error: null, success: true });
        return true;
      } else {
        setState({ 
          isLoading: false, 
          error: result.message || '邮件服务连接失败', 
          success: false 
        });
        return false;
      }
    } catch (error) {
      setState({ 
        isLoading: false, 
        error: '无法连接邮件服务', 
        success: false 
      });
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, success: false });
  }, []);

  return {
    state,
    sendNotification,
    testConnection,
    reset
  };
}

// 便捷的邮件发送Hook
export function useApplicationEmail() {
  const { sendNotification, state } = useEmailNotification();

  const sendApplicationReceived = useCallback(async (
    candidateEmail: string,
    candidateName: string,
    jobTitle: string,
    applicationId: string
  ): Promise<boolean> => {
    return sendNotification(
      EmailType.APPLICATION_RECEIVED,
      candidateEmail,
      {
        candidateName,
        jobTitle,
        applicationId,
        applicationDate: new Date().toLocaleString('zh-CN')
      }
    );
  }, [sendNotification]);

  const sendHRNotification = useCallback(async (
    hrEmail: string,
    candidateName: string,
    jobTitle: string,
    applicationId: string
  ): Promise<boolean> => {
    return sendNotification(
      EmailType.HR_NEW_APPLICATION,
      hrEmail,
      {
        candidateName,
        jobTitle,
        applicationId,
        applicationDate: new Date().toLocaleString('zh-CN')
      }
    );
  }, [sendNotification]);

  const sendStatusUpdate = useCallback(async (
    candidateEmail: string,
    candidateName: string,
    jobTitle: string,
    applicationId: string,
    nextSteps: string
  ): Promise<boolean> => {
    return sendNotification(
      EmailType.APPLICATION_UNDER_REVIEW,
      candidateEmail,
      {
        candidateName,
        jobTitle,
        applicationId,
        nextSteps
      }
    );
  }, [sendNotification]);

  const sendInterviewInvitation = useCallback(async (
    candidateEmail: string,
    candidateName: string,
    jobTitle: string,
    applicationId: string,
    interviewDate: string
  ): Promise<boolean> => {
    return sendNotification(
      EmailType.INTERVIEW_SCHEDULED,
      candidateEmail,
      {
        candidateName,
        jobTitle,
        applicationId,
        interviewDate
      }
    );
  }, [sendNotification]);

  return {
    state,
    sendApplicationReceived,
    sendHRNotification,
    sendStatusUpdate,
    sendInterviewInvitation
  };
} 